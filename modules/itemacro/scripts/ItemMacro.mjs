import {logger} from "./logger.mjs";
import {settings} from "./settings.mjs";
import {SystemManager} from "./systems/SystemManager.mjs";

export default class ItemMacro extends Macro {

  constructor(data, context) {
    super(data, context);

    this.item = context.item;

    SystemManager.instance?.systemMigration(this);
  }

  testUserPermission(user, permission, {exact = false} = {}) {
    return this.item?.testUserPermission(user, permission, {exact});
  }

  #executeChat(speaker) {
    return ui.chat.processMessage(this.command, {speaker}).catch(err => {
      Hooks.onError("Macro#_executeChat", err, {
        msg: "There was an error in your chat message syntax.",
        log: "error",
        notify: "error",
        command: this.command
      });
    });
  }

  #getEvent(scope) {
    let a = scope.event;
    if (a instanceof Event) return a;
    if (a?.originalEvent instanceof Event) return a.originalEvent;

    return undefined;
  }

  async #executeScript(scope = {}, ...otherArgs) {
    debugger;
    const item = this.item;
    const speaker = ChatMessage.getSpeaker({actor: item.actor});
    const actor = item.actor ?? game.actors.get(speaker.actor);

    /* MMH@TODO Check the types returned by linked and unlinked */
    const token = canvas.tokens?.get(speaker.token);
    const character = game.user.character;
    const event = this.#getEvent(scope);
    const args = {
      ...scope,
      ...otherArgs,
    };

    logger.debug("ItemMacro | #executeScript | ", {this: this, speaker, actor, token, character, item, event, args});

    if (SystemManager.instance?.systemValidation(this) === false)
      return;

    //build script execution
    const scriptFunction = Object.getPrototypeOf(async function () {
    }).constructor;
    const body = this.command;
    const fn = new scriptFunction("item", "speaker", "actor", "token", "character", "event", "args", body)

    logger.debug("ItemMacro | #executeScript | ", {body, fn});

    //attempt script execution
    try {
      return await fn.bind(this)(item, speaker, actor, token, character, event, args);
    } catch (err) {
      ui.notifications.error(settings.i18n("error.macroExecution"));
      logger.error(err);
    }
  }

  execute(scope = {}, ...args) {;
    if (!this.canExecute) {
      ui.notifications.warn(`You do not have permission to execute Macro "${this.name}".`);
      return;
    }

    switch (this.type) {
      case "chat":
        return this.#executeChat(scope.speaker);
      case "script":
        return this.#executeScript(scope, ...args);
    }
  }
}