import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class Dungeonworld extends BaseSystem {
  static system = 'dungeonworld';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.ActorSheet = ".item .rollable";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData) {
  }

  registerSheetListeners() {
  }

  registerOther() {
    game.dungeonworld.rollItemMacro = this.rollItemMacro;
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

    const item = actor ? actor.items.find(i => i.name === itemName) : null;
    if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

    // Trigger the item roll
    if (item.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();

    return item.roll();
  }
}