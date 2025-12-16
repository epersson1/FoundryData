import DefaultCounterConfig from './defaultCounterConfig.js';
import { resetFontCache } from './rendering.js';

/**
 * List of system ids that are incompatible with the default mouse keybinds.
 * @type {Array.<string>}
 */
const noMouseSupportSystems = ["pf2e"]

/**
 * Registers the settings used by this module. These include key binds and 
 * 	counter display customization.
 */
export const registerSettings = function() {
	game.settings.register("statuscounter", "rebindMouseButtons", {
		name: game.i18n.localize("statuscounter.rebindMouseButtons.name"),
		hint: game.i18n.localize("statuscounter.rebindMouseButtons.hint"),
		scope: "world",
		config: true,
		type: Boolean,
		default: !noMouseSupportSystems.some(systemId => game.system.id === systemId),
        onChange: updateTokenHud,
	});

	game.settings.register("statuscounter", "rebindNumberKeys", {
		name: game.i18n.localize("statuscounter.rebindNumberKeys.name"),
		hint: game.i18n.localize("statuscounter.rebindNumberKeys.hint"),
		scope: "world",
		config: true,
		type: Boolean,
		default: true,
        onChange: updateTokenHud,
	});

    game.settings.register("statuscounter", "multiSelect", {
        name: game.i18n.localize("statuscounter.multiSelect.name"),
        hint: game.i18n.localize("statuscounter.multiSelect.hint"),
        scope: "user",
        config: true,
        type: Boolean,
        default: true,
    });

	game.settings.register("statuscounter", "displayOne", {
		name: game.i18n.localize("statuscounter.displayOne.name"),
		hint: game.i18n.localize("statuscounter.displayOne.hint"),
		scope: "world",
		config: true,
		type: String,
		choices: {
			"always": "statuscounter.displayOne.always",
			"countdown": "statuscounter.displayOne.countdown",
			"never": "statuscounter.displayOne.never"
		},
		default: "countdown",
        onChange: updateVisibility,
	});
	
	game.settings.register("statuscounter", "counterFontSize", {
		name: game.i18n.localize("statuscounter.counterFontSize.name"),
		hint: game.i18n.localize("statuscounter.counterFontSize.hint"),
		scope: "world",
		config: true,
		type: Number,
		default: 16,
        onChange: updateCounters,
	});
	
	game.settings.register("statuscounter", "counterColor", {
		name: game.i18n.localize("statuscounter.counterColor.name"),
		hint: game.i18n.localize("statuscounter.counterColor.hint"),
		scope: "world",
		config: true,
		type: String,
		default: "00ffff",
        onChange: updateCounters,
    });

    game.settings.register("statuscounter", "countdownColor", {
        name: game.i18n.localize("statuscounter.countdownColor.name"),
        hint: game.i18n.localize("statuscounter.countdownColor.hint"),
        scope: "world",
        config: true,
        type: String,
        default: "ffff00",
        onChange: updateCounters,
    });

    game.settings.register("statuscounter", "counterDefaults", {
        scope: "world",
        config: false,
        type: Object,
        default: {},
    });

    game.settings.registerMenu("statuscounter", "counterDefaults", {
        name: game.i18n.localize("statuscounter.counterDefaults.name"),
        hint: game.i18n.localize("statuscounter.counterDefaults.hint"),
        label: game.i18n.localize("statuscounter.counterDefaults.reset"),
        icon: "fas fa-bars",
        type: DefaultCounterConfig,
        restricted: true,
    });
}

/**
 * Refreshes the HUD of the token layer to reload the settings.
 */
function updateTokenHud() {
	canvas.tokens.hud.render();
}

/**
 * Updates the visibility of all counters with one stack.
 */
async function updateVisibility() {
    const displayOne = game.settings.get("statuscounter", "displayOne");
    for (const actor of game.actors) {
        for (const effect of actor.effects) {
            const counter = effect.statusCounter;
            if (counter.displayValue === 1
                && ((displayOne === "always" && !counter.visible) || (displayOne === "never" && counter.visible))) {
                await effect.update({ "flags.statuscounter.visible": !counter.visible });
            }
        }
    }
}

/**
 * Redraws the status effects (and counters) to display new settings.
 */
function updateCounters() {
    resetFontCache();
    for (const token of canvas.tokens.ownedTokens) token.drawEffects();
}