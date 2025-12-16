import StatusCounter from "./counter.js";
import { DurationType } from "./durationType.js";
import { getEffectId } from "./effectUtils.js";

/**
 * Map of registered counter types and their implementation class.
 * @type {object}
 */
const counterTypes = {
    default: StatusCounter,
};

/**
 * Map of status ids and their default counter type.
 * @type {object}
 */
const statusTypes = {};

/**
 * Map of status ids and their next creation value.
 * @type {Map.<string, object>}
 */
const creationQueue = new Map();

/**
 * Initializes hooks and overrides to enable counter functionality.
 */
export function initializeCounters() {
    // Add effect getter to create and cache counter instances.
    Object.defineProperty(CONFIG.ActiveEffect.documentClass.prototype, "statusCounter", {
        get: function () {
            if (!this._statusCounter) {
                const data = this.getFlag("statuscounter", "config") ?? {};
                const [statusId] = this.statuses;
                const cls = counterTypes[data.type ?? statusTypes[statusId] ?? "default"] ?? StatusCounter;
                this._statusCounter = new cls(this, data);
            }

            return this._statusCounter;
        },
    });

    // Register hook to create default data on effect creation.
    Hooks.on("preCreateActiveEffect", effect => {
        _createDocumentCounter(effect, getEffectId(effect));
    });

    if (game.system.id === "sfrpg") {
        Object.defineProperty(CONFIG.Item.documentClass.prototype, "statusCounter", {
            get: function () {
                if (this.type !== "effect") return null;
                if (!this._statusCounter) {
                    const data = this.getFlag("statuscounter", "config") ?? {};
                    const cls = counterTypes[data.type ?? "default"]?.cls ?? StatusCounter;
                    this._statusCounter = new cls(this, data);
                }

                return this._statusCounter;
            },
        });

        Hooks.on("preCreateItem", item => {
            if (item.actor?._isCondition(item)) _createDocumentCounter(item, item.name.toLowerCase());
        });
    }

    // Register hook to adjust the cached instance when its data changes.
    Hooks.on("updateActiveEffect", (effect, changes) => {
        const counterData = foundry.utils.getProperty(changes, "flags.statuscounter.config");
        if (counterData) Object.assign(effect._statusCounter, counterData);
    });

    // Register hook to redraw counters when duration changes.
    Hooks.on("updateCombat", (combat, changes, _options, userId) => {
        if (!(changes.hasOwnProperty("round") || changes.hasOwnProperty("turn"))) return;

        for (const combatant of combat.combatants) {
            const { actor, token } = combatant;
            if (!actor || !token?.object) continue;

            let hasDuration = false;
            for (const effect of actor.appliedEffects) {
                const duration = effect.statusCounter.displayDuration;
                if (duration === null) continue;
                if (effect.statusCounter._isOver(duration)) {
                    if (game.user.id === userId && game.user.isGM) effect.statusCounter._deleteParent();
                } else {
                    hasDuration = true;
                    break;
                }
            }

            if (game.system.id === "sfrpg") hasDuration ||= (actor.system.timedEffects?.size ?? 0) > 0;
            if (hasDuration) token.object.renderFlags.set({ refreshEffects: true });
        }
    });

    // Extend add and multiply operations on active effects.
    if (game.modules.get("lib-wrapper")?.active) {
        // Override using libWrapper: https://github.com/ruipin/fvtt-lib-wrapper
        libWrapper.register("statuscounter", "CONFIG.ActiveEffect.documentClass.prototype._applyAdd",
            function (wrapped, actor, change, current, delta, changes) {
                wrapped(actor, change, current, this.statusCounter._multiplyDelta(delta), changes);
            }, "WRAPPER");
        libWrapper.register("statuscounter", "CONFIG.ActiveEffect.documentClass.prototype._applyMultiply",
            function (wrapped, actor, change, current, delta, changes) {
                wrapped(actor, change, current, this.statusCounter._multiplyDelta(delta), changes);
            }, "WRAPPER");
    } else {
        // Manual override.
        const originalAdd = CONFIG.ActiveEffect.documentClass.prototype._applyAdd;
        CONFIG.ActiveEffect.documentClass._applyAdd = function (actor, change, current, delta, changes) {
            return originalAdd.apply(this, [actor, change, current, this.statusCounter._multiplyDelta(delta), changes]);
        }

        const originalMultiply = CONFIG.ActiveEffect.documentClass.prototype._applyMultiply;
        CONFIG.ActiveEffect.documentClass._applyMultiply = function (actor, change, current, delta, changes) {
            return originalMultiply.apply(this, [actor, change, current, this.statusCounter._multiplyDelta(delta), changes]);
        }
    }
}

/**
 * Adds a new counter type, backed by the given class.
 * @param {string} type The type for which the class is used.
 * @param {*} cls The class implementing the counter type.
 * @param {string[]?} An statusIds An optional array of status ids that this type will be used for by default.
 */
export function addCounterType(type, cls, statusIds = []) {
    counterTypes[type] = cls;
    for (const statusId of statusIds) statusTypes[statusId] = type;
}

/**
 * @see counterTypes
 */
export function getCounterTypes() {
    return counterTypes;
}

/**
 * Stores the given value for the next creation of an effect with the given id.
 * @param {Token} token The token that the effect will be created for.
 * @param {string} statusId The id of the created effect's status.
 * @param {number} value The value of the counter.
 * @param {boolean} alt Invert the creation of a value or duration.
 */
export function queueCreation(token, statusId, value, alt) {
    creationQueue.set(`${token.actor?.uuid}-${statusId}`, { value, alt });
}

/**
 * Fetches any stored creation data for the given document and removes it from the queue.
 * @param {Document} document The effect to create.
 * @param {string} statusId The id of the created effect's status.
 * @returns {object} The creation data for the effect.
 */
export function unqueueCreation(document, statusId) {
    const statusKey = `${document.parent?.uuid}-${statusId}`;
    const entry = creationQueue.get(statusKey);
    creationQueue.delete(statusKey);
    return entry ?? document.flags?.statuscounter ?? { value: 1, alt: false };
}

/**
 * Adds default counter data to the given document's source.
 * @param {Document} document The document that is being created.
 * @param {string} statusId The id of the status that the document represents.
 */
function _createDocumentCounter(document, statusId) {
    const entry = unqueueCreation(document, statusId);

    // Load and merge defaults from settings.
    const type = statusTypes[statusId] ?? "default";
    const defaultData = {
        value: entry.value,
        config: game.settings.get("statuscounter", "counterDefaults")?.[statusId] ?? {},
    };
    defaultData.config.type ??= type;
    if (entry.alt) {
        defaultData.config.modifyDuration = !defaultData.config.modifyDuration;
        if (defaultData.config.modifyDuration) defaultData.config.durationType ||= DurationType.Round;
    }

    // Finalize data with implementing class.
    const cls = counterTypes[type] ?? StatusCounter;
    cls.create(document, defaultData);
}
