/**
 * Provides methods for accessing and manipulating status effect counters. The
 *  included classes are added to the window to allow using them as an optional
 *  dependency which can be resolved after the Foundry module has been loaded.
 * @module CounterAPI
 */
export { EffectCounter, ActiveEffectCounter, CounterTypes };

/**
 * Represents a counter for a single status effect.
 */
class EffectCounter {
    /**
     * Initializes this counter.
     * @param {boolean} delayAssignment Internal flag to prevent the counter from immediately initializing.
     */
    constructor(_value, _path, _tokenDoc, delayAssignment) {
        if (!delayAssignment) console.error("Status Icon Counters | Legacy counter creation is no longer supported.");
    }

    /**
     * Retrieves the counter for the effect with the given icon path for the
     *  given token.
     * @param {TokenDocument} tokenDoc The token document to search for the path.
     * @param {string} iconPath The icon path of the effect to search the counter for.
     * @returns {EffectCounter} The counter object if it exists, undefined otherwise.
     */
    static findCounter(tokenDoc, iconPath) {
        const actorEffect = tokenDoc.actor?.effects.find(effect => effect.img == iconPath);
        return actorEffect ? ActiveEffectCounter.getCounter(actorEffect) : null;
    }

    /**
     * Retrieves the value of the counter for the effect with the given icon
     *  path for the given token.
     * @param {TokenDocument} tokenDoc The token document to search for the path.
     * @param {string} iconPath The icon path of the effect to search the counter for.
     * @returns {number} The value of the counter if it exists, undefined otherwise.
     */
    static findCounterValue(tokenDoc, iconPath) {
        return EffectCounter.findCounter(tokenDoc, iconPath)?.getValue(tokenDoc);
    }

    /**
     * Retrieves the array of effect counters of the given token. If the token
     *  does not have the flag, creates a single stack counter per effect.
     *  Note that the counters are created from data copies, so modifications
     *  will not be applied until the counters are updated.
     * @returns {EffectCounter[]} An array of effect counter objects.
     */
    static getCounters() {
        return [];
    }

    /**
     * Retrieves an array of all simple and active effect counters of the given
     *  token. Missing counters are added, but not updated.
     *  Note that the counters are created from data copies, so modifications
     *  will not be applied until the counters are updated.
     * @param {TokenDocument} token The token document to fetch the counters for.
     * @returns {EffectCounter[]} An array of (active and regular) effect counter and objects.
     */
    static getAllCounters(token) {
        return EffectCounter.getCounters(token).concat(ActiveEffectCounter.getCounters(token));
    }

    /**
     * Removes all effects from the token. This will also remove permanent
     *  active effects from the actor, but retain temporary ones.
     * @param {TokenDocument} tokenDoc The token to remove effects from.
     * @returns {Promise} A promise representing the removal update.
     */
    static async clearEffects(tokenDoc) {
        if (tokenDoc.getFlag("statuscounter", "effectCounters")?.length) {
            await tokenDoc.setFlag("statuscounter", "effectCounters", []);
        }

        const actor = tokenDoc.actor;
        if (!actor) return;
        return actor.deleteEmbeddedDocuments("ActiveEffect", actor.data.effects.map(effect => effect.id));
    }

    /**
     * Refreshes the given counters for the given token. Note that this will
     *  only redraw existing counters and not create any new rendering objects.
     *  Because any counter update does this automatically, this function should
     *  only be called from custom counter type update logic.
     * @param {Token} token The token document to redraw the counters for.
     */
    static redrawCounters(token) {
        return token.drawEffects();
    }

    /**
     * Convenience function to draw all counters and refresh the combat UI.
     */
    static drawCounters() {
        for (let token of canvas.tokens.ownedTokens) token.drawEffects();
        if (ui.combat?.combat && ui.combat.combat.combatants.length > 0) ui.combat.render();
    }
}

/**
 * Represents a counter for a single active effect.
 * @extends EffectCounter
 */
class ActiveEffectCounter extends EffectCounter {
    /**
     * Initializes this counter.
     * @param {string} path The icon path of the counter.
     * @param {TokenDocument | Actor | ActiveEffect} parent The token document, actor or effect that the counter is
     *  associated with.
     */
    constructor(_, path, parent) {
        let effect;
        if (parent instanceof TokenDocument) {
            effect = parent.actor.effects.find(e => e.img === path);
        } else if (parent instanceof Actor) {
            effect = parent.effects.find(e => e.img === path);
        } else if (parent instanceof ActiveEffect) {
            effect = parent;
        }

        if (!effect) {
            super();
            return;
        }

        return new LegacyCounterWrapper(effect.statusCounter);
    }

    /**
     * Retrieves the counter for the effect with the given ID for the given actor.
     * @param {Actor} actor The actor document to search for the effect.
     * @param {string} statusId The status ID of the effect to search the counter for.
     * @returns {ActiveEffectCounter?} The counter object if it exists, null otherwise.
     */
    static findCounter(actor, statusId) {
        const effect = actor.effects.find(effect => effect.getFlag("core", "statusId") === statusId);
        if (!effect) return null;
        return this.getCounter(effect);
    }

    /**
     * Retrieves the value of the counter for the effect with the given ID for
     *  the given actor.
     * @param {Actor} actor The actor document to search for the effect.
     * @param {string} statusId The status ID of the effect to search the counter for.
     * @returns {number} The value of the counter if it exists, undefined otherwise.
     */
    static findCounterValue(actor, statusId) {
        return ActiveEffectCounter.findCounter(actor, statusId)?.getValue(actor);
    }

    /**
     * Retrieves the counter of the given active effect.
     * @param {ActiveEffect} effect The active effect to retrieve the counter for.
     * @returns {ActiveEffectCounter?} The counter of the effect or null.
     */
    static getCounter(effect) {
        if (effect.getFlag("core", "overlay") || !effect.img) return null;
        return new LegacyCounterWrapper(effect.statusCounter);
    }

    /**
     * Retrieves the array of active effect counters of the token's actor. If
     *  the token does not have an actor, an empty array is returned. For each
     *  effect that does not have a counter, a single stack counter is created.
     * @param {TokenDocument | Actor} parent The token or actor to fetch the counters for.
     * @returns {ActiveEffectCounter[]} An array of effect counter objects.
     */
    static getCounters(parent) {
        const actor = parent instanceof TokenDocument || parent instanceof Token ? parent.actor : parent;
        if (!actor) return [];
        return actor.effects.map(effect => this.getCounter(effect)).filter(Boolean);
    }
}

/**
 * Abstraction for supporting some common legacy use cases with the new counter API.
 */
class LegacyCounterWrapper {
    /**
     * The counter wrapped by this abstraction.
     * @type {StatusCounter}
     */
    counter;

    /**
     * Creates a new wrapper to allow using a new counter with the old API.
     * @param {StatusCounter} counter The counter to wrap.
     */
    constructor(counter) {
        this.counter = counter;
    }

    /**
     * Resolves the parent entity of this counter.
     * @returns {ActiveEffect} The parent effect of the counter.
     */
    findParent() {
        return this.counter.parent;
    }

    /**
     * Retrieves the status effect ID from the flags of this parent's document.
     * @returns {string} The effect ID that this counter belongs to.
     */
    findStatusId() {
        const effect = this.findParent();
        if (!effect) return null;

        return effect.statuses.first() ?? effect.getFlag("core", "statusId");
    }

    /**
     * Retrieves the value of this counter using its type's getter function.
     * @returns {Number} The result of the counter's type's value getter.
     */
    getValue() {
        return this.counter._sourceValue;
    }

    /**
     * Retrieves the value that should be displayed when rendering the counter.
     * @returns {string} The counter value if it is visible, an empty string otherwise.
     */
    getDisplayValue() {
        return this.counter.visible ? this.counter.displayValue : "";
    }

    /**
     * Modifies the value of this counter and updates its visibility using its type's setter function.
     * @param {number} value The value to set.
     * @returns {Promise} A promise representing the asynchronous operation.
     */
    async setValue(value) {
        return this.counter.setValue(value);
    }

    /**
     * Retrieves the font associated with the type of this counter. If none is 
     *  found, the default font is returned instead.
     * @returns {PIXI.TextStyle} The font to use for this counter.
     */
    get font() {
        return this.counter.constructor.createFont(game.settings.get("statuscounter", "counterFontSize"));
    }

    /**
     * Creates a copy of the font associated with the type of this counter or
     *  the default, scaled relative to the given icon size.
     * @param {number=} iconHeight The height of the effect icon in pixels. Defaults to 20.
     * @returns {PIXI.TextStyle} The scaled font to use for this counter and icon size.
     */
    getScaledFont(iconHeight = 20) {
        let font = this.font;
        if (iconHeight !== 20) {
            font = font.clone();
            font.fontSize = iconHeight / 20 * font.fontSize;
        }

        return font;
    }

    /**
     * Calls the selector associated with the given type to determine whether
     *  that type may be selected in the status context menu.
     * @param {string} type The target type to check against.
     * @returns {boolean} True if the counter can be represented in the new API.
     */
    allowType(type) {
        return type === "statuscounter.simple";
    }

    /**
     * Resolves the default type of this counter.
     * @returns {string} The name of the counter's default type.
     */
    getDefaultType() {
        return "statuscounter.simple";
    }

    /**
     * @returns {Promise} A promise representing the asynchronous operation.
     */
    async changeType() {
        return Promise.resolve();
    }

    /**
     * @returns {Promise} A promise representing the asynchronous operation.
     */
    async update() {
        return Promise.resolve();
    }

    /**
     * Removes this counter and its effect from its token.
     * @returns {Promise} A promise representing the asynchronous operation.
     */
    async remove() {
        return this.counter._deleteParent();
    }
}

/**
 * The map of counter types to their respective PIXI.TextStyle fonts.
 * @private
 */
const counterTypes = {};

/**
 * The map of icon paths to their default counter type.
 * @private
 */
const counterDefaults = {};

/**
 * Utility methods for manipulating counter types.
 */
class CounterTypes {
    /**
     * Retrieves the map of type names and their configurations.
     * @returns {Object} The font, getter, setter and selector for each type.
     */
    static get types() { return counterTypes; }

    /**
     * Retrieves the map of icon paths and their default type names.
     * @returns {Object} The default type for each icon.
     */
    static get defaults() { return counterDefaults; }

    /**
     * Adds a new type and associates a font that counters of that type will be rendered with.
     */
    static addType() {
        console.error("Status Icon Counters | Legacy types are no longer supported. Migrate to game.modules.get('statuscounter').api.addCounterType");
    }

    /**
     * Changes the font for the given counter type.
     */
    static setFont() {
        console.warn("Status Icon Counters | Legacy fonts are no longer supported. Override StatusCounter.createFont to adjust font creation.");
    }

    /**
     * Changes the default counter type for all effects with the given path.
     * The types of existing counters will not change.
     */
    static setDefaultType() {
        console.warn("Status Icon Counters | Legacy defaults are no longer supported. Use the addCounterType parameter instead.");
    }
}
