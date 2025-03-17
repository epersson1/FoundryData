import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class Dragonbane extends BaseSystem {
  static system = 'dragonbane';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.DoDCharacterSheet = ".rollable-skill";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData)  {
  }

  registerSheetListeners() {
  }

  registerOther() {
    game.dragonbane.useItem = this.useItemMacro;
  }

  registerHooks() {
  }

  systemValidation(macro) {
    return true;
  }

  get itemTag() {
    return 'tr[data-item-id]';
  }

  useItemMacro(itemName, itemType = "", options = {}) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    if (!actor) return;

    const item = actor.items.find(i => i.name === itemName && i.type === itemType);

    if (item?.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();

    return game.dragonbane.rollItem(itemName, itemType, options);
  }
}