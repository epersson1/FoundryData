import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class Starfinder extends BaseSystem {
  static system = 'sfrpg';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.ActorSheetSFRPGCharacter = ".item .item-image";
    render.ActorSheetSFRPGNPC = ".item .item-image";
    render.ActorSheetSFRPGStarship = ".item .item-image";
    render.ActorSheetSFRPGVehicle = ".item .item-image";
    render.ActorSheetSFRPGDrone = ".item .item-image";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData) {
  }

  registerSheetListeners() {
  }

  registerOther() {
    game.sfrpg.rollItemMacro = this.rollItemMacro;
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

    if (item.hasMacro() && settings.value("defaultmacro")) {
      return item.executeMacro();
    } else {
      if (item.data.type === 'spell') return actor.useSpell(item);
      return item.roll();
    }
  }
}