import { findEffectByImg } from "./effectUtils.js";
import { wrap } from "./jsUtils.js";

/**
 * Map of fonts and sizes to a cached PIXI font.
 * @type {Map.<string, PIXI.TextStyle}
 */
const fontCache = new Map();

/**
 * Extends required rendering functions. If available, the libWrapper module
 *  is used for better compatibility.
 */
export const extendEffectRenderer = function () {
    if(game.modules.get("lib-wrapper")?.active) {
        // Override using libWrapper: https://github.com/ruipin/fvtt-lib-wrapper
        libWrapper.register("statuscounter", "foundry.canvas.placeables.Token.prototype._refreshEffects", async function (wrapped, ...args) {
            wrapped(...args);
            drawEffectCounters(this);
        }, "WRAPPER");
        libWrapper.register("statuscounter", "foundry.canvas.placeables.Token.prototype._drawEffect", async function (wrapped, src, ...args) {
            const icon = await wrapped(src, ...args);
            if (icon) icon.name = src;
            return icon;
        }, "WRAPPER");
    } else {
        // Manual override
        const { Token } = foundry.canvas.placeables;
        const originalDrawEffects = Token.prototype._refreshEffects;
        Token.prototype._refreshEffects = function () {
            originalDrawEffects.apply(this, arguments);
            drawEffectCounters(this);
        }

        const originalDrawEffect = Token.prototype._drawEffect;
        Token.prototype._drawEffect = async function (src) {
            const icon = await originalDrawEffect.apply(this, arguments);
            if (icon) icon.name = src;
            return icon;
        };
    }
}

/**
 * Modifies the given HTML to draw effect counters on top of each token's
 *  status effects. The font color is determined by the type. Other font
 *  attributes are ignored.
 * @param {HTMLElement} html The element of the combat tracker.
 */
export const extendCombatTracker = function (html) {
    const counterColor = game.settings.get("statuscounter", "counterColor").replace("#", "");
    const durationColor = game.settings.get("statuscounter", "countdownColor").replace("#", "");

    html.querySelectorAll("li.combatant").forEach(combatantEl => {
        const actor = game.combat?.combatants.get(combatantEl.dataset.combatantId)?.token?.actor;
        if (!actor) return;

        combatantEl.querySelectorAll(".token-effect").forEach(effectEl => {
            if (effectEl.parentElement.classList.contains("status-icon-wrapper")) return;

            // Find counter by raw attribute since effectEl.src contains a normalized URL.
            const counter = findEffectByImg(actor, effectEl.getAttribute("src"))?.statusCounter;
            if (!counter) return;

            const wrapper = document.createElement("div");
            wrapper.classList.add("status-icon-wrapper");
            wrap(effectEl, wrapper);

            if (counter.visible) {
                wrapper.insertAdjacentHTML(
                    "beforeend",
                    `<div class='status-icon-counter' style='color: #${counterColor};'>${counter.displayValue}</div>`,
                );
            } else if (counter.displayDuration) {
                wrapper.insertAdjacentHTML(
                    "beforeend",
                    `<div class='status-icon-counter' style='color: #${durationColor};'>${counter.displayDuration}</div>`,
                );
            }
        });
    });
}

/**
 * Creates rendering objects for every effect sprite that matches any of the active status icons. The text is added as
 *  an additional effect on top of 
 *  the original sprite.
 * @param {Token} token The token to draw the effect counters for.
 */
function drawEffectCounters(token) {
    // Clean up old counters.
    if (token.effectCounters) {
        token.effectCounters.removeChildren().forEach(c => c.destroy());
    }

    // The child may have been removed due to redrawing the token entirely.
    if (!token.children.find(c => c.name === "effectCounters")) {
        const counterContainer = new PIXI.Container();
        counterContainer.name = "effectCounters";
        token.effectCounters = token.addChild(counterContainer);
    }

    // Track effects per image to resolve duplicates correctly.
    const imgCount = new Map();

    // Create new counters for each effect.
    for (let sprite of token.effects.children.filter(effect => effect.isSprite && effect.name)) {
        if (sprite === token.effects.overlay) continue;

        const duplicates = imgCount.get(sprite.name) ?? 0;
        const counter = findEffectByImg(token.actor, sprite.name, duplicates)?.statusCounter;
        imgCount.set(sprite.name, duplicates + 1);
        if (!counter) continue;

        const { visible, displayDuration } = counter;
        const hasDuration = displayDuration != null;
        if (visible) token.effectCounters.addChild(createCounterValue(counter, sprite, hasDuration));
        if (hasDuration) token.effectCounters.addChild(createCounterDuration(counter, sprite, visible));
    }
}

/**
 * Creates a rendering object for a single counter displaying its value. The text is placed on top of the bottom right
 *  corner of the given sprite.
 * @param {StatusCounter} counter The counter to create the value text for.
 * @param {PIXI.Graphics} effectIcon The sprite on top of which to place the text.
 * @param {boolean} double Indicates whether the height needs to fit two counters.
 * @returns {PIXI.Text} The PIXI object representing the value.
 */
function createCounterValue(counter, effectIcon, double) {
    const valueText = new PIXI.Text(counter.displayValue, getScaledFont(counter, effectIcon.height, double));
    valueText.anchor.set(1); // Align to bottom right

    const sizeRatio = effectIcon.height / 20;
    valueText.x = effectIcon.x + effectIcon.width + 1 * sizeRatio;
    valueText.y = effectIcon.y + effectIcon.height + 4 * sizeRatio;
    valueText.resolution = Math.max(1, 1 / sizeRatio * 1.5);
    return valueText;
}

/**
 * Creates a rendering object for a single counter displaying its duration. The text is placed on the top right corner
 *  of the given sprite.
 * @param {StatusCounter} counter The counter to create the duration text for.
 * @param {PIXI.Graphics} effectIcon The sprite on top of which to place the text.
 * @param {boolean} double Indicates whether the height needs to fit two counters.
 * @returns {PIXI.Text} The PIXI object representing the duration.
 */
function createCounterDuration(counter, effectIcon, double) {
    const durationText = new PIXI.Text(counter.displayDuration, getScaledFont(counter, effectIcon.height, double, true));
    durationText.anchor.set(0, 0);

    const sizeRatio = effectIcon.height / 20;
    durationText.x = effectIcon.x - sizeRatio;
    durationText.y = effectIcon.y - 5.5 * sizeRatio; // Aligning to top requires an extra 1.5px offset.
    durationText.resolution = Math.max(1, 1 / sizeRatio * 1.5);
    return durationText; 0
}

/**
 * Creates a copy of the font associated with the type of this counter or the default, scaled relative to the given
 *  icon size.
 * @param {StatusCounter} counter The counter to create the font for.
 * @param {number} iconHeight The height of the effect icon in pixels.
 * @param {boolean} double Indicates whether the height needs to fit two counters.
 * @param {boolean=} duration Indicates whether the font is used for the duration or the value. Defaults to false.
 * @returns {PIXI.TextStyle} The scaled font to use for this counter and icon size.
 */
function getScaledFont(counter, iconHeight, double, duration = false) {
    iconHeight = Math.round(iconHeight);
    let cacheKey = `${counter.type}${duration ? "-duration" : ""}-${iconHeight}`;
    if (double) cacheKey += "-double";

    let font = fontCache.get(cacheKey);
    if (!font) {
        const size = calculateFontSize(iconHeight, double);
        font = duration ? counter.constructor.createDurationFont(size) : counter.constructor.createFont(size);
        fontCache.set(cacheKey, font);
    }

    return font;
}

/**
 * Calculates the size for newly created fonts.
 * @param {number=} iconHeight The height of the effect icon in pixels.
 * @param {boolean=} double Indicates whether the height needs to fit two counters.
 * @returns {number} The target size for new fonts.
 */
function calculateFontSize(iconHeight, double) {
    let size = game.settings.get("statuscounter", "counterFontSize");
    if (iconHeight !== 20) size = iconHeight / 20 * size;
    if (double) size = Math.min(size, (iconHeight + 8) / 2);
    return size;
}

/**
 * Resets the cached fonts, allowing them to be recreated on the next render.
 */
export function resetFontCache() {
    fontCache.clear();
}
