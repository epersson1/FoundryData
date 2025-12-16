import {settings} from './settings.mjs';
import {helper} from './helper.mjs';
import {ItemMacroConfig} from './ItemMacroConfig.mjs';
import {SystemManager} from "./systems/SystemManager.mjs";

Hooks.on('init', () => {
  SystemManager.registerHandlers();
  settings.register();

  if (game.modules.get('itemacro')?.active)
    game.modules.get('itemacro').ItemMacroConfig = ItemMacroConfig;
});

Hooks.on('ready', () => {
  if (SystemManager.instance === null && game.user.isGM) {
    ui.notifications.warn(game.i18n.format("warning.systemNotSupported", {system: game.system.title}));
  }
  helper.register();
});

// AppV1
Hooks.on('renderItemSheet', ItemMacroConfig._init);
// AppV2
Hooks.on("getHeaderControlsApplicationV2", ItemMacroConfig.getHeaderControlsApplicationV2)

Hooks.on('getItemDirectoryEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "Directory"));
