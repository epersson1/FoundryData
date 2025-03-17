import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class DND5e extends BaseSystem {
  static system = 'dnd5e';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    return {render, rendered, onChange};
  }

  registerSettings(settingsData) {
    settingsData.charsheet.config = false;
    settingsData.click.config = false;

    settingsData.defaultmacro.name = "itemacro.dnd5e.defaultmacro.title";
    settingsData.defaultmacro.hint = "itemacro.dnd5e.defaultmacro.hint";
  }

  registerSheetListeners() {
  }

  registerOther() {
  }

  registerHooks() {
      Hooks.on("dnd5e.preUseActivity", this.preUseActivity);
  }

  systemValidation(macro) {
    const olderThan4 = foundry.utils.isNewerVersion("4.0.0", game.system.version);

    if (olderThan4) {
      ui.notifications.warn("itemacro.dnd5e.systemDeprecationv4", {localize: true, permanent: true});

      return false;
    }

    let regex = /\.use\(\{[^}]*}, \{[^}]*skipItemMacro: true[^}]*}\)/g;
    if (regex.test(macro.command)) {
      ui.notifications.error("itemacro.dnd5e.skipItemMacroDeprecation", {localize: true, permanent: true});

      return false;
    }

    regex = /item\.use\(\s*\{((?!.*legacy: false.*)|(?!.*skipItemMacro: true.*))([^}]*)}[^)]*\);/g;
    if (regex.test(macro.command)) {
      ui.notifications.error("itemacro.dnd5e.useFunctionWarning", {localize: true, permanent: true});

      return false;
    }

    return true;
  }

  systemMigration(macro) {
    const regex = /item\.use\(\s*{\s*}\s*,\s*{\s*skipItemMacro\s*:\s*true\s*}\)/g
    macro.command = macro.command.replace(regex, "item.use({skipItemMacro: true, legacy: false})");
  }

  preUseActivity(activity, usageConfig, dialogConfig, messageConfig) {
    const item = activity.item;

    if (usageConfig.skipItemMacro === true)
      return true;

    if (!item.hasMacro())
      return true;

    if (!settings.value("defaultmacro"))
      return true;

    item.executeMacro({activity, usageConfig, dialogConfig, messageConfig}).then((result) => {
      if (result === true) {
        usageConfig.skipItemMacro = true;
        usageConfig.legacy = false;
        activity.use(usageConfig, dialogConfig, messageConfig);
      }
    });

    return false;
  }
}