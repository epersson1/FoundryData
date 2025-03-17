import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class DungeonCrawlClassics extends BaseSystem {
  static system = 'dcc';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.DCCActorSheetGeneric = ".rollable";
    render.DCCActorSheet = ".rollable";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData)  {
  }

  registerSheetListeners() {
  }

  registerOther() {
    game.dcc.rollDCCWeaponMacro = this.rollDCCWeaponMacro;
  }

  registerHooks() {
  }

  systemValidation(macro) {
    return true;
  }

  get itemTag() {
    return 'li[data-item-id]';
  }

  rollDCCWeaponMacro(itemId, actorId, options = {}) {
    const actor = game.actors.get(actorId)
    const item = actor.items.get(itemId);

    if (item?.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();

    return actor.rollWeaponAttack(itemId, options)
  }
}