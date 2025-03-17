import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class WorldsWithoutNumber extends BaseSystem {
  static system = 'wwn';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.WwnActorSheetCharacter = ".item-image";
    render.WwnActorSheetMonster = ".item-image";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData) {
  }

  registerSheetListeners() {
  }

  registerOther() {
    game.wwn.rollItemMacro = this.rollItemMacro;
  }

  registerHooks() {
  }

  systemValidation(macro) {
    return true;
  }

  rollItemMacro(itemName) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);

    // Get matching items
    const items = actor ? actor.items.filter(i => i.name === itemName) : [];
    if (items.length > 1) {
      ui.notifications.warn(`Your controlled Actor ${actor.name} has more than one Item with name ${itemName}. The first matched item will be chosen.`);
    } else if (items.length === 0) {
      return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);
    }
    const item = items[0];

    // Trigger the item roll
    if (item.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();

    return item.roll();
  }
}