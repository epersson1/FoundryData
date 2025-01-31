// GET MODULE CORE
import { MODULE } from './_module.mjs';

// FOUNDRY HOOKS -> SETUP
Hooks.once('setup', async () => {
	const adjustDisplayedMessages = (value) => {
		if (value == 0) value = 999;
		let styles = [];
		if (MODULE.setting('showChatWhenNotActive')) {
			styles.push(`#sidebar .sidebar-tab[data-tab="chat"]:not(.active) #chat-log > li${MODULE.setting('onlyShowNewMessages') ? '.always-chat-new-message' : ''}:nth-last-of-type(-n+${value}) {
				animation: alwaysChatAnimation 3s ease-in-out 1;
				display: -ms-flexbox;
				display: flex;
				flex-direction: column;
				opacity: var(--always-chat-inactive-opacity);
				pointer-events: all;
				scale: 1;
				transform-origin: right center;
				transition: all 0.2s ease-in-out;
				z-index: 1;
			}`);
			styles.push(`#sidebar .sidebar-tab[data-tab="chat"]:not(.active) #chat-log > li${MODULE.setting('onlyShowNewMessages') ? '.always-chat-new-message' : ''}:nth-last-of-type(-n+${value}):hover {
				opacity: 1;
				z-index: 10;
			}`);
		}
		if (MODULE.setting('showChatWhenCollapsed')) {
			styles.push(`#sidebar.collapsed .sidebar-tab[data-tab="chat"] #chat-log > li${MODULE.setting('onlyShowNewMessages') ? '.always-chat-new-message' : ''}:nth-last-of-type(-n+${value}) {
				animation: alwaysChatAnimation 3s ease-in-out 1;
				display: -ms-flexbox;
				display: flex;
				flex-direction: column;
				opacity: var(--always-chat-inactive-opacity);
				pointer-events: all;
				scale: 1;
				transform-origin: right center;
				transition: all 0.2s ease-in-out;
				z-index: 1;
			}`);
			styles.push(`#sidebar.collapsed .sidebar-tab[data-tab="chat"] #chat-log > li${MODULE.setting('onlyShowNewMessages') ? '.always-chat-new-message' : ''}:nth-last-of-type(-n+${value}):hover {
				opacity: 1;
				z-index: 10;
			}`);
		}

		document.querySelector(`head style[name="${MODULE.ID}"]`)?.remove() ?? false;
		document.querySelector('head').insertAdjacentHTML('beforeend', `<style name="${MODULE.ID}">${styles.join('\n')}</style>`);
	}

	const adjustCSSVariables = (value) => {
		document.querySelector(`head style[name="${MODULE.ID}-css-vars"]`)?.remove() ?? false;
		document.querySelector('head').insertAdjacentHTML('beforeend', `<style name="${MODULE.ID}-css-vars">
			:root{
				--always-chat-inactive-scale: ${MODULE.setting('inactiveScale')};
				--always-chat-inactive-opacity: ${MODULE.setting('inactiveOpacity')};
				--always-chat-direction: ${MODULE.setting('chatDirection')};
			}
		</style>`);

		document.querySelector('#sidebar .sidebar-tab[data-tab="chat"]')?.setAttribute('data-pin', MODULE.setting('chatPosition')) ?? false;
	}

	const toggleStyleSheet = (value, stylesheet) => {
		const primaryStyleSheet = document.querySelector(`head link[href*="modules/${MODULE.ID}/"]`);

		if (value) {
			if (document.querySelector(`head link[name="${MODULE.ID}-${stylesheet}"]`) ?? false) return;
			primaryStyleSheet.insertAdjacentHTML('afterend', `<link name="${MODULE.ID}-${stylesheet}" href="modules/${MODULE.ID}/styles/${stylesheet}.css" rel="stylesheet" type="text/css" media="all">`)
		}else{
			document.querySelector(`head link[name="${MODULE.ID}-${stylesheet}"]`)?.remove() ?? false
		}
	}

	MODULE.setting('register', 'showChatWhenNotActive', {
		type: Boolean,
		default: true,
		scope: 'client',
		onChange: (value) => toggleStyleSheet(value, 'not-active')
	});
	MODULE.setting('register', 'showChatWhenCollapsed', {
		type: Boolean,
		default: true,
		scope: 'client',
		onChange: (value) => toggleStyleSheet(value, 'is-collapsed')
	});
	MODULE.setting('register', 'onlyShowNewMessages', {
		type: Boolean,
		default: true,
		scope: 'client',
		onChange: (value) => adjustDisplayedMessages(MODULE.setting('numberOfMessagesToDisplay'))
	});
	MODULE.setting('register', 'delayNewMessagesFadeOut', {
		type: Number,
		default: 10,
		scope: 'client',
		range: {
			min: 0, max: 180, step: 1
		},
		onChange: adjustDisplayedMessages
	});
	MODULE.setting('register', 'numberOfMessagesToDisplay', {
		type: Number,
		default: 3,
		scope: 'client',
		range: {
			min: 0, max: 10, step: 1
		},
		onChange: adjustDisplayedMessages
	})
	MODULE.setting('register', 'inactiveScale', {
		type: Number,
		default: 0.6,
		scope: 'client',
		range: {
			min: 0.1, max: 1, step: 0.01
		},
		onChange: adjustCSSVariables
	});
	MODULE.setting('register', 'inactiveOpacity', {
		type: Number,
		default: 0.1,
		scope: 'client',
		range: {
			min: 0.1, max: 1, step: 0.01
		},
		onChange: adjustCSSVariables
	});
	MODULE.setting('register', 'chatPosition', {
		type: String,
		default: 'top-right',
		scope: 'client',
		choices: {
			'bottom-right': `${MODULE.ID}.settings.chatPosition.choices.bottomRight`,
			'top-right': `${MODULE.ID}.settings.chatPosition.choices.topRight`,
		},
		onChange: adjustCSSVariables
	});
	MODULE.setting('register', 'chatDirection', {
		type: String,
		default: 'column-reverse',
		scope: 'client',
		choices: {
			'column': `${MODULE.ID}.settings.chatDirection.choices.bottom`,
			'column-reverse': `${MODULE.ID}.settings.chatDirection.choices.top`,
		},
		onChange: adjustCSSVariables
	});

	toggleStyleSheet(MODULE.setting('showChatWhenNotActive'), 'not-active');
	toggleStyleSheet(MODULE.setting('showChatWhenCollapsed'), 'is-collapsed');
	adjustDisplayedMessages(MODULE.setting('numberOfMessagesToDisplay'));
	adjustCSSVariables();

	
	// Pin Chat After Sidebar is Registered
	Hooks.on('renderSidebarTab', (app, elem, options) => {
		if (!(app.id === 'chat')) return;
		elem[0]?.setAttribute('data-pin', MODULE.setting('chatPosition'));
	})
});