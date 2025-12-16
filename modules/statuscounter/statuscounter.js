/**
 * This is the entry file for the FoundryVTT module to manipulate and display counters for status effects.
 * @author Adrian Haberecht
 */

import { registerSettings } from './module/settings.js';
import { extendEffectRenderer, extendCombatTracker } from './module/rendering.js';
import { registerKeybinds, onEffectKeyDown } from './module/keybinds.js';
import { ActiveEffectCounter, CounterTypes, EffectCounter } from './module/api.js';
import { addCounterType, initializeCounters, queueCreation, unqueueCreation } from './module/counterTypes.js';
import StatusCounter from './module/counter.js';
import { registerVisualActiveEffects } from './module/integration.js';

/** Hook to register settings. */
Hooks.once('init', function () {
    console.log('Status Icon Counters | Initializing module.');

    // Provide global access to legacy API.
	window.EffectCounter = EffectCounter;
	window.ActiveEffectCounter = ActiveEffectCounter;
	window.CounterTypes = CounterTypes;

    // Create API.
    game.modules.get("statuscounter").api = {
        StatusCounter,
        addCounterType,
        queueCreation,
        unqueueCreation,
    }

    // Register custom module settings
    registerSettings();
    initializeCounters();

    if (game.modules.get("visual-active-effects")?.active) registerVisualActiveEffects();
});

/** Hook to extend the status effect rendering. */
Hooks.once("setup", function () {
    extendEffectRenderer();
});

/** Hook to register the global key events. */
Hooks.once("ready", function () {
	$(document).on("keydown.statuscounter", onEffectKeyDown);
});

/** Hook to apply custom keybinds to the token HUD. */
Hooks.on("renderTokenHUD", function(tokenHud, html) {
	registerKeybinds(tokenHud, html);
});

/** Hook to render status counters on the combat tracker. */
Hooks.on("renderCombatTracker", function(_combatTracker, html) {
	extendCombatTracker(html);
});
