import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class SWADE extends BaseSystem {
  static system = 'swade';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.CharacterSheet = ".item-img";
    render.NPCSheet = ".item-img";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData) {
  }

  registerSheetListeners() {
  }

  registerOther() {
    game.swade.rollWeaponMacro = this.rollWeaponMacro;
  }

  registerHooks() {
  }

  systemValidation(macro) {
    return true;
  }

  rollWeaponMacro(weaponName) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token)
      actor = game.actors.tokens[speaker.token];

    if (!actor)
      actor = game.actors.get(speaker.actor);

    const item = actor
      ? actor.items.find((i) => i.name === weaponName)
      : null;

    if (!item)
      return ui.notifications.warn(`Your controlled Actor does not have an item named ${weaponName}`);

    if (item.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();

    return item.rollDamage();
  }
}