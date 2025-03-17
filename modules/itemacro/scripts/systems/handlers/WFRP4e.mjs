import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class WFRP4e extends BaseSystem {
  static system = 'wfrp4e';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.ActorSheetWfrp4eCharacter = ".skills .item .name, .combat .item .weapon-item-name, .magic .item .name, .religion .item .name";
    render.ActorSheetWfrp4eCreature = ".creature-lists .item .weapon-item.name, .creature-lists .traits .name, .skills .item .name, .combat .item .weapon-item-name, .magic .item .name, .religion .item .name";
    render.ActorSheetWfrp4eNPC = ".skills .item .name, .combat .item .weapon-item-name, .magic .item .name, .religion .item .name";
    render.ActorSheetWfrp4eVehicle = ".inventory-list .item .vehicle-weapon-name";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData) {
  }

  registerSheetListeners() {
  }

  registerOther() {
  }

  registerHooks() {
  }

  systemValidation(macro) {
    return true;
  }

  rollItemMacro(name, type, bypassData) {
    const speaker = ChatMessage.getSpeaker();
    let actor, item;

    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);

    if (type === "characteristic") {
      return actor.setupCharacteristic(name, bypassData).then(test => test.roll());
    } else {
      item = actor ? actor.getItemTypes(type).find(i => i.name === name) : null;
    }

    if (!item) return ui.notifications.warn(`${game.i18n.localize("ErrorMacroItemMissing")} ${itemName}`);

    if (item.hasMacro() && settings.value("defaultmacro")) {
      return item.executeMacro(bypassData);
    }

    // Trigger the item roll
    switch (item.type) {
      case "weapon":
        return actor.setupWeapon(item, bypassData).then(test => test.roll());
      case "spell":
        return actor.sheet.spellDialog(item, bypassData)
      case "prayer":
        return actor.setupPrayer(item, bypassData).then(test => test.roll());
      case "trait":
        return actor.setupTrait(item, bypassData).then(test => test.roll());
      case "skill":
        return actor.setupSkill(item, bypassData).then(test => test.roll());
    }
  }
}