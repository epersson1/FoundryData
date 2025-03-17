import {logger} from "./logger.mjs";
import {settings} from "./settings.mjs";
import {SystemManager} from "./systems/SystemManager.mjs";
import ItemMacro from "./ItemMacro.mjs";

export class helper {
  static register() {
    logger.info(`Registering Helper Functions.`);
    helper.registerItem();
    helper.systemHandler();
    helper.postMessage();
  }

  static registerItem() {
    Item.prototype.hasMacro = function () {
      const flag = this.getFlag(settings.id, `macro`);
      logger.debug("Item | hasMacro | ", {flag});

      return !!(flag?.command ?? flag?.data?.command);
    }

    Item.prototype.getMacro = function () {
      const hasMacro = this.hasMacro();
      const flag = this.getFlag(settings.id, `macro`);

      logger.debug("Item | getMacro | ", {hasMacro, flag});

      if (hasMacro)
        return new ItemMacro(flag, {item: this});

      return new ItemMacro({img: this.img, name: this.name, scope: "global", type: "script"}, {item: this});
    }

    Item.prototype.setMacro = async function (macro) {
      const flag = this.getFlag(settings.id, `macro`);

      logger.debug("Item | setMacro | ", {macro, flag});

      if (macro instanceof Macro) {
        const data = macro.toObject();
        return await this.setFlag(settings.id, `macro`, data);
      }
    }

    Item.prototype.executeMacro = async function (scope= {}, ...args) {
      if (!this.hasMacro()) return;

      return this.getMacro().execute(scope, ...args);
    }
  }

  static systemHandler() {
    const handler = SystemManager.instance;
    if (!handler) return;

    const sheetHooks = handler.sheetRenderHooks;

    handler.registerHooks();
    handler.registerOther();
    handler.registerSheetListeners();

    if (sheetHooks && settings.value("charsheet")) {
      for (const [preKey, obj] of Object.entries(sheetHooks)) {
        if (!(obj instanceof Object)) continue;
        for (const [key, str] of Object.entries(obj)) {
          Hooks.on(`${preKey}${key}`, (app, html, _data) => changeButtonExecution(app, html, str, sheetHooks.onChange));
        }
      }
    }

    async function changeButtonExecution(app, html, str, onChange = []) {
      logger.debug("changeButtonExecution : ", {app, html, str});

      if (sheetHooks.rendered[app.constructor.name] !== undefined)
        await helper.waitFor(() => app.rendered);


      if (app && !app.isEditable) return;
      let itemImages = html.find(str);

      logger.debug("changeButtonExecution | ", {app, html, str, itemImages});

      for (let img of itemImages) {
        img = $(img);

        const itemTag = handler.itemTag;
        const li = img.parents(itemTag);
        const id = li.attr(handler.idDataAttr) ?? img.attr(handler.idDataAttr);

        if (!id) {
          logger.debug("Id Error | ", img, li, id);
          continue;
        }

        const item = app.actor.items.get(id);

        logger.debug("changeButtonExecution | for | ", {img, li, id, item});

        if (!item.hasMacro()) {
          continue;
        }

        if (settings.value("click")) {
          img.contextmenu((event) => {
            item.executeMacro({event});
          })
        } else {
          img.off();
          img.click((event) => {
            logger.debug("Img Click | ", img, event);
            item.executeMacro({event});
          });
        }
        onChange.forEach(fn => fn(img, item, html));
      }
    }
  }

  static addContext(contextOptions, origin) {
    if (!game.user.isGM) return;

    logger.info("Adding Context Menu Items.");

    contextOptions.push({
      name: settings.i18n("context.label"),
      icon: '<i class="fas fa-redo"></i>',
      condition: () => game.user.isGM,
      callback: li => updateMacros(origin, li?.data("entry-id")),
    });

    async function updateMacros(origin, _id) {
      logger.info("Update Macros Called | ", origin, _id);
      let item = undefined;
      const updateInfo = [];

      if (origin === "Directory") item = game.items.get(_id);
      //if(origin === "Compendium") /* No clue */

      if (!item) return;

      const result = await Dialog.confirm({
        title: settings.i18n("context.confirm.title"),
        content: `${settings.i18n("context.confirm.content")} <br><table><tr><td> Name : <td> <td> ${item.name} </td></tr><tr><td> ID : <td><td> ${item.id} </td></tr><tr><td> Origin : <td> <td> Item ${origin} </td></tr></table>`,
      });

      const macro = item.getMacro();
      logger.debug("updateMacros Info | ", item, macro, result);

      if (result) {
        //update game items
        for (let i of game.items.filter(e => e.name === item.name && e.id !== item.id)) {
          await updateItem({item: i, macro, location: "Item Directory"});
        }

        //update actor items
        for (let a of game.actors) {
          await updateActor({actor: a, name: item.name, macro, location: `Actor Directory [${a.name}]`});
        }

        //update scene entities
        for (let s of game.scenes) {
          for (let t of s.data.tokens.filter(e => !e.actorLink)) {
            let token = new Token(t, s);
            await updateActor({
              actor: token.actor,
              name: item.name,
              macro,
              location: `Scene [${s.name}] Token [${t.name}]`
            });
          }
        }

        await Dialog.prompt({
          title: settings.i18n("context.prompt.title"),
          content: `${settings.i18n("context.prompt.content")}<hr>${updateInfo.reduce((a, v) => a += `<table><tr><td> Actor : <td> <td> ${v.actor} </td></tr><tr><td> Token : <td> <td> ${v.token} </td></tr><tr><td> Item : <td> <td> ${v.item} </td></tr><tr><td> Location : <td> <td> ${v.location} </td></tr></table>`, ``)}`,
          callback: () => {
          },
          options: {width: "auto", height: "auto"},
        });
      }

      async function updateActor({actor, name, macro, location}) {
        logger.debug("Attempting Actor Update | ", actor, name, macro);

        for (let item of actor?.items?.filter(i => i.data.name === name) || [])
          await updateItem({item, macro, location});
      }

      async function updateItem({item, macro, location}) {
        logger.debug("Attempting Item Update | ", item, macro);
        await item.setMacro(macro);

        updateInfo.push({
          actor: item?.actor.id,
          token: item?.actor?.token?.id,
          item: item.id,
          location
        });
      }
    }
  }

  static async waitFor(fn, m = 200, w = 100, i = 0) {
    while (!fn(i, ((i * w) / 100)) && i < m) {
      i++;
      await helper.wait(w);
    }

    return i !== m;
  }

  static async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  static systemValidation(macro) {
    return SystemManager.instance?.systemValidation(macro);
  }

  static async postMessage() {
    if (settings.value('welcome') === false) {
      await ChatMessage.create({
        speaker: {
          alias: "Item Macro",
          actor: null,
          scene: null,
          token: null
        },
        whisper: [game.user],
        flavor: "Automated welcome message",
        content: `
      <h3 class="nue">Thanks for updating the Item Macro</h3>
      <p class="nue">Hello, I am Forien and with Kekilla's permission I took this module over from him. My job here is mostly to keep this module maintained and working on Foundry v11 and future updates. That said I am not opposed to expanding this module with additional systems or new features if there is big demand enough.</p>
      <p class="nue">Since I took this module with next to no knowledge, keep in mind that I might not know if something is broken or not working as intended. Please feel free to contact me on Foundry Discord by pinging <code>Forien</code>. You can also join <a href="https://discord.gg/XkTFv8DRDc" target="_blank">my Discord</a> or report an <a href="https://github.com/Foundry-Workshop/Item-Macro/issues" target="_blank"> Issue on GitHub</a>.</p>
      <p class="nue">I'm creating Foundry modules (full list of which you can find on my <a href="https://foundryvtt.com/community/forien/" target="_blank">Foundry Profile</a>) and maintaining them by spending my free time. If you would like to support me and the development of those modules, please consider <a href="https://www.patreon.com/foundryworkshop" target="_blank"><b>becoming a Patron</b></a> or donating through <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6P2RRX7HVEMV2&source=url" target="_blank">PayPal</a> or <a href="https://ko-fi.com/forien" target="_blank">Ko-Fi</a></p>
      `,
      });
    }
    game.settings.set(settings.id, 'welcome', true);
  }

}
