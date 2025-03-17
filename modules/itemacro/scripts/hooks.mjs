import {settings} from './settings.mjs';
import {helper} from './helper.mjs';
import {ItemMacroConfig} from './ItemMacroConfig.mjs';
import {SystemManager} from "./systems/SystemManager.mjs";

Hooks.on('init', () => {
  SystemManager.registerHandlers();
  settings.register();
});

Hooks.on('ready', () => {
  if (SystemManager.instance === null && game.user.isGM) {
    ui.notifications.warn(game.i18n.format("warning.systemNotSupported", {system: game.system.title}));
  }
  helper.register();
});

Hooks.on('renderItemSheet', ItemMacroConfig._init);

Hooks.on('getItemDirectoryEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "Directory"));
