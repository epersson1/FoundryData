import './libraries/EventDelegation.js';

// GET MODULE FUNCTIONS
import { MODULE } from './_module.mjs';

// IMPORT SETTINGS -> Settings Register on Hooks.Setup
import './_settings.mjs';

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// 🧙 DEVELOPER MODE HOOKS -> devModeReady
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(MODULE.ID, 'level', {
		choiceLabelOverrides: {
			0: 'NONE',
			1: 'ERROR',
			2: 'WARN',
			3: 'DEBUG',
			4: 'INFO',
			5: 'ALL'
		}
	});
});

Hooks.once('ready', async () => {
	document.querySelectorAll('body').onEventListener('click, contextmenu', 'taskbar', (event) => {
		MODULE.log('ACTUAL EVENT', event);
	});
});

/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
// FOUNDRY HOOKS -> READY
/* ─────────────── ⋆⋅☆⋅⋆ ─────────────── */
Hooks.once('ready', async () => {
	Hooks.on('renderChatMessage', async (app, elem, options) => {
		elem[0].classList.add(`${MODULE.ID}-new-message`);

		// Handle removing app;
		function startTimer() {
			return setTimeout(() => {
				// Animate Element Hiding
				elem[0].classList.add(`${MODULE.ID}-hide-message`);
				// Remove Always Chat Classes
				setTimeout(() => {
					elem[0].classList.remove(`${MODULE.ID}-new-message`, `${MODULE.ID}-hide-message`)
				}, 200);
			}, MODULE.setting('delayNewMessagesFadeOut') * 1000);
		}
		let elemTimer = startTimer();

		if (MODULE.setting('delayNewMessagesFadeOut') == 0) clearTimeout(elemTimer);

		elem[0].addEventListener('mouseenter', () => {
			if (!(elem[0].classList.contains(`${MODULE.ID}-new-message`)) || MODULE.setting('delayNewMessagesFadeOut') == 0) return;
			clearTimeout(elemTimer);
		});
		elem[0].addEventListener('mouseleave', () =>{ 
			if (!(elem[0].classList.contains(`${MODULE.ID}-new-message`)) || MODULE.setting('delayNewMessagesFadeOut') == 0) return;
			elemTimer = startTimer();
		});
	});
});