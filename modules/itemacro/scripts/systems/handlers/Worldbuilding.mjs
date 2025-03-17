import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class Worldbuilding extends BaseSystem {
  static system = 'worldbuilding';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.SimpleActorSheet = ".item .item-name";

    onChange.push(this.addHover);

    return {render, rendered, onChange};
  }

  registerSettings(settingsData) {
  }

  registerSheetListeners() {
  }

  registerOther() {
    /*
     * Worldbuilding doesn't have this common helper function, so
     * if we are overriding default execution, it means we are creating
     * this function originally
     */
    game.worldbuilding.rollItemMacro = this.rollItemMacro;
  }

  registerHooks() {
    /* we can't patch the system's macro creation function,
     * so rely on it being async and not actually being able to
     * cancel the operation before our hook runs -- if anything is gonna
     * break, its this. */
    Hooks.on("hotbarDrop", this._onHotbarDrop.bind(this));
  }

  systemValidation(macro) {
    return true;
  }

  rollItemMacro(itemName) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);

    // Find item
    const item = actor ? actor.items.find(i => i.name === itemName) : null;
    if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

    // Trigger the item roll
    if (item.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();
    return !!item.roll ? item.roll() : ui.notifications.warn(`Item ${itemName} either does not have a macro assigned or the current system has no default roll macro helper. Enable default macro execution override in Item Macro's settings.`);
  }

  async #createMacro(dropData, slot) {
    const item = await fromUuid(dropData.uuid);
    const command = `game.worldbuilding.rollItemMacro('${item.name}')`;

    let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));

    if (!macro) {
      macro = await Macro.create({
        name: item.name,
        type: "script",
        command: command,
        flags: {
          "worldbuilding.attrMacro": false,
          "worldbuilding.itemMacro": true
        }
      });
    }

    await game.user.assignHotbarMacro(macro, slot);
  }

  _onHotbarDrop(_hotbar, dropData, slot) {
    /* If an item was dropped, handle it ourselves */
    if (dropData.type === 'Item') {
      this.#createMacro(dropData, slot);

      return false;
    }

    /* otherwise, let the system default go on */
    return true;
  }

  addHover(targetElement) {
    targetElement.hover(function () {
      $(this).css({"text-shadow": "0 0 8px var(--color-shadow-primary"});
    }, function () {
      $(this).css({"text-shadow": "none"});
    });
  }
}