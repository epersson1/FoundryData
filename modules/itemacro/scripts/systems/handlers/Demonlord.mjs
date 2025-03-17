import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class Demonlord extends BaseSystem {
  static system = 'demonlord';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.DLCharacterSheet = ".rollable, .attack-roll, .talent-roll, .magic-roll";
    render.DLCreatureSheet = ".rollable, .attack-roll, .talent-roll, .magic-roll";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData) {
  }

  registerSheetListeners() {
  }

  registerOther() {
    game.demonlord.rollWeaponMacro = this.rollWeaponMacro;
    game.demonlord.rollTalentMacro = this.rollTalentMacro;
    game.demonlord.rollSpellMacro = this.rollSpellMacro;
  }

  registerHooks() {
  }

  systemValidation(macro) {
    return true;
  }

  get itemTag() {
    return '.dl-item-row';
  }

  /** #### #### ####    System Overrides    #### #### #### **/

  getActor() {
    const speaker = ChatMessage.getSpeaker();
    let actor = null;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);

    return actor;
  }

  rollWeaponMacro(itemName) {
    const actor = this.getActor();

    const item = actor ? actor.items.find(i => i.name === itemName) : null;

    if (!item) {
      return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`)
    }

    if (item.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();

    return actor.rollWeaponAttack(item.id);
  }

  rollTalentMacro(itemName, state) {
    const actor = this.getActor();

    const item = actor ? actor.items.find(i => i.name === itemName) : null

    if (!item) {
      return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`)
    }

    if (item.hasMacro() && settings.value("defaultmacro")) {
      return item.executeMacro();
    } else {
      switch (state) {
        case 'true':
          actor.rollTalent(item.id);
          break

        case 'false':
          item.data.data.uses.value = 0;
          item.data.data.addtonextroll = false;
          actor.updateEmbeddedDocuments('Item', item.data);
          break

        case '':
          item.data.data.addtonextroll = !item.data.data.addtonextroll;
          actor.updateEmbeddedDocuments('Item', item.data);

          if (item.data.data.addtonextroll) actor.rollTalent(item.id);
          break;

        default:
          actor.rollTalent(item.id)
          break;
      }
    }
  }

  rollSpellMacro(itemName) {
    const actor = this.getActor();

    const item = actor ? actor.items.find(i => i.name === itemName) : null;

    if (!item) {
      return ui.notifications.warn(`Your controlled Actor does not have an ;item named ${itemName}`)
    }

    if (item.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();

    return actor.rollSpell(item.id);
  }
}