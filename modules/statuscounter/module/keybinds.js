import { queueCreation } from "./counterTypes.js";
import { findEffectById } from "./effectUtils.js";
import { on, stopEvent } from "./jsUtils.js";

/**
 * The currently hovered token HUD entity and status icon element.
 */
let activeEffectHud, activeEffectHudIcon;

/**
 * Flag used to block multiple asynchronous create operations.
 */
const creationState = new Set();

/**
 * Applies keybinds to the given entity to change status counters. Which methods are used depends on the configuration.
 *  Previously registered handlers are unregistered wherever necessary.
 * @param {TokenHUD} entity The Foundry entity associated with the element.
 * @param {HTMLElement} html The element of the HUD.
 */
export const registerKeybinds = function (entity, html) {
    let effectHud = html.querySelector(".status-effects");
    if (!effectHud) return;

    if (game.settings.get("statuscounter", "rebindMouseButtons")) {
        on(effectHud, "click", ".effect-control", onEffectClick.bind(entity), true);
        on(effectHud, "contextmenu", ".effect-control", onEffectRightClick.bind(entity), true);
    }

    if (game.settings.get("statuscounter", "rebindNumberKeys")) {
        on(effectHud, "mouseover", ".effect-control", onEffectMouseOver.bind(entity));
        on(effectHud, "mouseout", ".effect-control", onEffectMouseOut.bind(entity));
    }
}

/**
 * Handles the click event on a status icon. If the shift key is pressed, the status is applied as overlay. Otherwise,
 *  the status counter is incremented by 1 and the token is updated accordingly.
 * @param {PointerEvent} event The mouse click event.
 */
function onEffectClick(event) {
    if (creationState.has(this.object)) return;

    const { statusId } = event.delegateTarget.dataset;
    if (event.shiftKey) {
        toggleOverlay(this.object, getUniqueSelectedTokens(this.object), statusId);
    } else if (event.ctrlKey || event.metaKey) {
        if (!this.object.actor) return;
        findEffectById(this.object.actor, statusId)?.statusCounter.configure();
    } else {
        for (const token of getUniqueSelectedTokens(this.object)) {
            const effect = findEffectById(token.actor, statusId);
            if (effect) {
                effect.statusCounter.increment(event.altKey);
            } else {
                if (event.altKey) queueCreation(token, statusId, 1, true);
                toggleEffect(token, statusId, false);
            }
        }
    }

    stopEvent(event);
}

/**
 * Handles the contextmenu event on a status icon by decrementing the status counter by 1 and updating the token
 *  accordingly.
 * @param {PointerEvent} event The mouse right click event.
 */
function onEffectRightClick(event) {
    if (creationState.has(this.object)) return;
    if (ui.context) ui.context.close();

    const { statusId } = event.delegateTarget.dataset;
    const tokens = getUniqueSelectedTokens(this.object);
    const effects = tokens.map(token => findEffectById(token.actor, statusId)).filter(Boolean);

    if (effects.length === 0) {
        toggleOverlay(this.object, tokens, statusId);
    } else {
        for (const effect of effects) effect.statusCounter.decrement(event.altKey);
    }
    stopEvent(event);
}

/**
 * Handles the mouseover event onto a status icon to store the active entity so that it can be accessed by the global
 *  key event handler.
 * @param {PointerEvent} event The mouse over event.
 */
function onEffectMouseOver(event) {
    activeEffectHud = this;
    activeEffectHudIcon = event.delegateTarget;
}

/**
 * Handles the mouseout event off a status icon to reset the active entity so that it can no longer be accessed by the
 *  global key event handler.
 */
function onEffectMouseOut() {
    if (activeEffectHud === this) {
        activeEffectHud = activeEffectHudIcon = null;
    }
}

/**
 * Handles the keydown event for the currently active status icon HUD element. If none is active or the key is not a
 *  digit, this handler returns immediately. Otherwise, the pressed digit is set as the counter for the active status
 *  icon and the associated token is updated accordingly. Note that this handler modifies the event target and stops
 *  propagation if any counters are changed.
 * @param {jQuery.Event} event The key down event triggered by jQuery.
 */
export const onEffectKeyDown = function (event) {
    if (!activeEffectHud || !activeEffectHud.object?.visible // Nothing hovered
        || creationState.has(this.object) // Effect already updating
        || document.activeElement?.tagName === "INPUT") // Input element in focus
        return;

    let keyValue = parseInt(event.key);
    if (Number.isNaN(keyValue)) return;

    event.currentTarget = activeEffectHudIcon;
    const { statusId } = event.currentTarget.dataset;

    for (const token of getUniqueSelectedTokens(activeEffectHud.object)) {
        const effect = findEffectById(token.actor, statusId);
        if (effect) {
            effect.statusCounter.set(keyValue, event.altKey);
        } else if (keyValue != 0) {
            queueCreation(token, statusId, keyValue, event.altKey);
            toggleEffect(token, statusId, false);
        }
    }

    stopEvent(event);
}

/**
 * Toggles an effect using FoundryVTT workflows regardless of whether a HUD is currently active.
 * @param {Token} token The token to toggle the effect on.
 * @param {string} statusId The id of the status to toggle.
 * @param {boolean} overlay Indicates whether the effect should be an overlay.
 * @returns {Promise} A promise representing the operation.
 */
async function toggleEffect(token, statusId, overlay) {
    try {
        creationState.add(token);
        const options = { overlay };

        // SFRPG checks for existance of the property instead of its value.
        if (!overlay && game.system.id === "sfrpg") delete options.overlay;

        await token.actor?.toggleStatusEffect(statusId, options);
    } finally {
        creationState.delete(token);
    }
}

/**
 * Toggles an effect as overlay for all selected tokens, unifying the state between them if necessary.
 * @param {Token} token The token to copy the overlay state from.
 * @param {Token[]} selectedTokens An array of currently selected tokens.
 * @param {string} statusId The id of the status to toggle.
 */
function toggleOverlay(token, selectedTokens, statusId) {
    const isActive = hasOverlay(token.document, statusId);
    for (const selectedToken of selectedTokens) {
        if (selectedToken === token || isActive === hasOverlay(selectedToken.document, statusId)) {
            toggleEffect(selectedToken, statusId, true);
        }
    }
}

/**
 * Returns tokens to consider for input operations. If the multi select setting is enabled, this returns all selected
 * tokens that have a unique actor. Otherwise, it returns the reference token.
 * @param {Token} token The reference token.
 * @returns {Token[]} Associated tokens that have a unique actor.
 */
function getUniqueSelectedTokens(token) {
    return game.settings.get("statuscounter", "multiSelect")
        ? [...new Map(canvas.tokens.controlled.map(t => [t.actor?.uuid, t])).values()]
        : [token];
}

/**
 * Checks if the given token document has an overlay effect matching the given icon path.
 * @param {TokenDocument} tokenDoc The token document to check.
 * @param {string} statusId The id of the status to check.
 * @returns {boolean} True if the effect exists as an overlay, false otherwise.
 */
function hasOverlay(tokenDoc, statusId) {
    return tokenDoc.actor?.effects.some(e => e.flags.core?.overlay && e.statuses.has(statusId));
}
