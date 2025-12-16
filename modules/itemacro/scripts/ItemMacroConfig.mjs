import ItemMacro  from "./ItemMacro.mjs";
import {logger}   from "./logger.mjs";
import {settings} from "./settings.mjs";

/**
 * @extends {MacroConfig}
 */
export class ItemMacroConfig extends foundry.applications.sheets.MacroConfig {
  /** @override */
  static DEFAULT_OPTIONS = {
    actions: {
      execute: ItemMacroConfig._onExecute
    },
  };

  #item;

  /** @override */
  constructor({document, item}, ...args) {
    super({document}, ...args);
    this.#item = item;
  }

  static _init(app, html, data) {
    const document = app.document;
    logger.debug("ItemMacroConfig.mjs | _init  | ", {app, html, data, document});

    if ((settings.value("visibilty") && document.isOwner) || game.user.isGM) {
      const openButton = $(`<a class="open-itemacro" title="itemacro"><i class="fas fa-sd-card"></i>${settings.value(
        "icon") ? "" : "Item Macro"}</a>`);

      openButton.click(ItemMacroConfig.openConfig.bind(this, document));

      html.closest(".app").find(".open-itemacro").remove();
      const titleElement = html.closest(".app").find(".window-title");
      openButton.insertAfter(titleElement);
    }
  }

  static getHeaderControlsApplicationV2(sheet, buttons) {
    const document = sheet.document;
    logger.debug("ItemMacroConfig.mjs | getHeaderControlsApplicationV2 | ", {sheet, document, buttons});

    if (!(document instanceof Item)) return;
    if (!((settings.value("visibilty") && document.isOwner) || game.user.isGM)) return;

    buttons.push({
      icon: "fa-solid fa-sd-card",
      label: "Item Macro",
      onClick: ItemMacroConfig.openConfig.bind(this, document),
    });
  }

  static async openConfig(item) {
    let macro = null;

    for (let key in item.apps) {
      let obj = item.apps[key];
      if (obj instanceof ItemMacroConfig) {
        macro = obj;
        break;
      }
    }

    if (!macro)
      macro = new ItemMacroConfig({document: item.getMacro(), item});

    macro.render(true);

    logger.debug("ItemMacroConfig.mjs | #onButtonClick  | ", {macro, item});
  }

  /** @override */
  async _processSubmitData(event, form, submitData, options) {
    logger.debug("ItemMacroConfig.mjs | _processSubmitData  | ", {event, form, submitData, options});
    await this.updateMacro(submitData);
  }

  static async _onExecute(event) {
    await this.submit();
    this.#item.executeMacro(event);
  }

  async updateMacro({command, type}) {
    const item = this.#item;
    const oldMacro = item.getMacro();

    const newMacro = new ItemMacro({
      name: item.name,
      type,
      scope: "global",
      command,
      author: game.user.id,
    }, {item});

    await item.setMacro(newMacro);

    logger.debug("ItemMacroConfig.mjs | updateMacro  | ", {command, type, item, oldMacro, newMacro});

    this.object = newMacro;
  }
}