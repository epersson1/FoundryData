import {logger} from "../logger.js";
import {settings} from "../settings.js";

export function register_helper() {
  logger.info(`Registering WFRP4e Helper`);

  game.wfrp4e.utility.rollItemMacro = function (name, type, bypassData) {
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

export function sheetHooks() {
  const renderSheets = {
    //Core
    ActorSheetWfrp4eCharacter: ".skills .item .name, .combat .item .weapon-item-name, .magic .item .name, .religion .item .name",
    ActorSheetWfrp4eCreature: ".creature-lists .item .weapon-item.name, .creature-lists .traits .name, .skills .item .name, .combat .item .weapon-item-name, .magic .item .name, .religion .item .name",
    ActorSheetWfrp4eNPC: ".skills .item .name, .combat .item .weapon-item-name, .magic .item .name, .religion .item .name",
    ActorSheetWfrp4eVehicle: ".inventory-list .item .vehicle-weapon-name",
  };
  const renderedSheets = {

  };

  return {render: renderSheets, rendered: renderedSheets};
}


