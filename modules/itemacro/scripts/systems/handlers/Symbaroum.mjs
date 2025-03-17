import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class Symbaroum extends BaseSystem {
  static system = 'symbaroum';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.MonsterSheet = ".vrollable";
    render.PlayerSheet = ".roll-weapon, .activate-ability, .roll-armor";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData)  {
    settingsData.defaultmacro.config = false;
  }

  registerSheetListeners() {
  }

  registerOther() {
    game.symbaroum.macros.rollItem = this.rollItem;
  }

  registerHooks() {
  }

  systemValidation(macro) {
    return true;
  }

  rollItem(itemName) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);

    const item = actor
      ? actor.items.find(
        (i) => i.name === itemName && (i.system.isGear && i.system.isActive || i.system.isPower)
      )
      : null;

    if (!item)
      return ui.notifications.warn(
        game.i18n.localize("ERROR.MACRO_NO_OBJECT") + itemName
      );

    if (item?.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();

    if (item.system.isWeapon) {
      const weapon = actor.system.weapons.filter(
        (it) => it.id === item.id
      )[0];
      return actor.rollWeapon(weapon);
    }

    if (item.system.isArmor) {
      return actor.rollArmor();
    }
    if (item.system.isPower) {
      if (
        actor.system.combat.combatMods.abilities[item.id]
          ?.isScripted
      ) {
        return actor.usePower(item);
      } else
        return ui.notifications.warn(
          itemName + game.i18n.localize("ERROR.MACRO_NO_SCRIPT")
        );
    };
  }
}