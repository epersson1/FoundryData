import {logger} from "./logger.mjs";
import {settings} from "./settings.mjs";
import ItemMacro from "./ItemMacro.mjs";

export class ItemMacroConfig extends MacroConfig {
  /*
    Override
  */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "modules/itemacro/templates/macro-config.html",
      classes: ["macro-sheet", "sheet"]
    });
  }

  static _init(app, html, data) {
    logger.debug("ItemMacroConfig.mjs | _init  | ", {app, html, data});

    if ((settings.value("visibilty") && app.object.isOwner) || game.user.isGM) {
      let openButton = $(`<a class="open-itemacro" title="itemacro"><i class="fas fa-sd-card"></i>${settings.value("icon") ? "" : "Item Macro"}</a>`);

      openButton.click(async (event) => {
        let Macro = null;
        let Item = await fromUuid(app.document.uuid);

        for (let key in app.document.apps) {
          let obj = app.document.apps[key];
          if (obj instanceof ItemMacroConfig) {
            Macro = obj;
            break;
          }
        }
        if (!Macro)
          Macro = new ItemMacroConfig(Item.getMacro(), {item: Item});
        Macro.render(true);

        logger.debug("ItemMacroConfig.mjs | _init click  | ", {event, Macro, Item});
      });

      html.closest('.app').find('.open-itemacro').remove();
      let titleElement = html.closest('.app').find('.window-title');
      openButton.insertAfter(titleElement);
    }
  }

  /*
    Override
  */
  _onEditImage(event) {
    logger.debug("ItemMacroConfig.mjs | _onEditImage  | ", {event});
    return ui.notifications.error(settings.i18n("error.editImage"));
  }

  /*
    Override
  */
  async _updateObject(event, formData) {
    logger.debug("ItemMacroConfig.mjs | _updateObject  | ", {event, formData});
    await this.updateMacro(formData);
  }

  /*
    Override
  */
  async _onExecute(event) {
    event.preventDefault();
    let item = this.options.item;
    let command = this._element[0].querySelectorAll('textarea')[0].value;
    let type = this._element[0].querySelectorAll('select')[1].value;

    logger.debug("ItemMacroConfig.mjs | _onExecute  | ", {event, item, command, type});

    await this.updateMacro({command, type});
    item.executeMacro(event);
  }

  async updateMacro({command, type}) {
    const item = this.options.item;
    const oldMacro = item.getMacro();

    const newMacro = new ItemMacro({
      name: item.name,
      type,
      scope: "global",
      command,
      author: game.user.id,
    }, {item})

    await item.setMacro(newMacro);

    logger.debug("ItemMacroConfig.mjs | updateMacro  | ", {command, type, item, oldMacro, newMacro});

    this.object = newMacro;
  }
}