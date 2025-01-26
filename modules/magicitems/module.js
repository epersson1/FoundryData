var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const CONSTANTS = {
  MODULE_ID: "magicitems",
  PATH: `modules/magicitems/`,
  PREFIX_LABEL: "MAGICITEMS",
  // PREFIX_FLAG: "magicitems",
  FLAGS: {
    DEFAULT: "default",
    SPELLS: "spells"
  },
  HTML: {
    MAGIC_ITEM_ICON: '<i class="fas fa-magic" style="margin-left: 5px;" title="Magic Item"></i>'
  },
  QUANTITY_PROPERTY_PATH: "system.quantity",
  WEIGHT_PROPERTY_PATH: "system.weight",
  PRICE_PROPERTY_PATH: "system.price",
  SPELL_LEVEL_PROPERTY_PATH: "system.level",
  CURRENT_CHARGES_PATH: "system.uses.value",
  DISPLAY_OPTIONS: {
    BOTTOM: 0,
    TOP: 1
  }
};
CONSTANTS.PATH = `modules/${CONSTANTS.MODULE_NAME}/`;
const _Logger = class _Logger {
  static get DEBUG() {
    return game.settings.get(CONSTANTS.MODULE_ID, "debug") || game.modules.get("_dev-mode")?.api?.getPackageDebugValue(CONSTANTS.MODULE_ID, "boolean");
  }
  // export let debugEnabled = 0;
  // 0 = none, warnings = 1, debug = 2, all = 3
  static debug(msg, ...args) {
    try {
      if (game.settings.get(CONSTANTS.MODULE_ID, "debug") || game.modules.get("_dev-mode")?.api?.getPackageDebugValue(CONSTANTS.MODULE_ID, "boolean")) {
        console.log(`DEBUG | ${CONSTANTS.MODULE_ID} | ${msg}`, ...args);
      }
    } catch (e) {
      console.error(e.message);
    }
    return msg;
  }
  static logObject(...args) {
    return this.log("", args);
  }
  static log(message, ...args) {
    try {
      message = `${CONSTANTS.MODULE_ID} | ${message}`;
      console.log(message.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return message;
  }
  static notify(message, ...args) {
    try {
      message = `${CONSTANTS.MODULE_ID} | ${message}`;
      ui.notifications?.notify(message);
      console.log(message.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return message;
  }
  static info(info, notify = false, ...args) {
    try {
      info = `${CONSTANTS.MODULE_ID} | ${info}`;
      if (notify) {
        ui.notifications?.info(info);
      }
      console.log(info.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return info;
  }
  static warn(warning, notify = false, ...args) {
    try {
      warning = `${CONSTANTS.MODULE_ID} | ${warning}`;
      if (notify) {
        ui.notifications?.warn(warning);
      }
      console.warn(warning.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return warning;
  }
  static errorObject(...args) {
    return this.error("", false, args);
  }
  static error(error, notify = true, ...args) {
    try {
      error = `${CONSTANTS.MODULE_ID} | ${error}`;
      if (notify) {
        ui.notifications?.error(error);
      }
      console.error(error.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return new Error(error.replace("<br>", "\n"));
  }
  static timelog(message) {
    this.warn(Date.now(), message);
  }
  // setDebugLevel = (debugText): void => {
  //   debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
  //   // 0 = none, warnings = 1, debug = 2, all = 3
  //   if (debugEnabled >= 3) CONFIG.debug.hooks = true;
  // };
  static dialogWarning(message, icon = "fas fa-exclamation-triangle") {
    return `<p class="${CONSTANTS.MODULE_ID}-dialog">
        <i style="font-size:3rem;" class="${icon}"></i><br><br>
        <strong style="font-size:1.2rem;">${CONSTANTS.MODULE_ID}</strong>
        <br><br>${message}
    </p>`;
  }
};
__name(_Logger, "Logger");
__publicField(_Logger, "i18n", (key) => {
  return game.i18n.localize(key)?.trim();
});
__publicField(_Logger, "i18nFormat", (key, data = {}) => {
  return game.i18n.format(key, data)?.trim();
});
let Logger = _Logger;
const _RetrieveHelpers = class _RetrieveHelpers {
  /**
   *
   * @param {options}
   * @param {string} [options.documentName]
   * @param {string} [options.documentId]
   * @param {("User"|"Folder"|"Actor"|"Item"|"Scene"|"Combat"|"JournalEntry"|"Macro"|"Playlist"|"RollTable"|"Cards"|"ChatMessage"|"Setting"|"FogExploration")} [options.collection]
   * @param {string} [options.documentPack]
   * @param {boolean} [options.ignoreError=false]
   */
  static retrieveUuid({ documentName, documentId, documentCollectionType, documentPack, ignoreError = false }) {
    let uuid = null;
    if (documentCollectionType || pack === "world") {
      const collection = game.collections.get(documentCollectionType);
      if (!collection) {
        Logger.warn(`Cannot retrieve collection for ${collection}`);
      } else {
        const original = documentId ? collection.get(documentId) : null;
        if (original) {
          if (documentName) {
            if (original.name !== documentName)
              ;
            else {
              return original.uuid;
            }
          } else {
            return original.uuid;
          }
        }
        const doc = collection.find((e) => e.id === documentId || e.name === documentName) || null;
        if (doc) {
          return doc.uuid;
        }
      }
    }
    if (documentPack) {
      const pack2 = _RetrieveHelpers.getCompendiumCollectionSync(documentPack, ignoreError);
      if (!pack2) {
        Logger.warn(`Cannot retrieve pack for ${documentPack}`);
      } else {
        const original = documentId ? pack2.index.get(documentId) : null;
        if (original) {
          if (documentName) {
            if (original.name !== documentName)
              ;
            else {
              return original.uuid;
            }
          } else {
            return original.uuid;
          }
        }
        const doc = pack2.index.find((i) => i._id === documentId || i.name === documentName) || null;
        if (doc) {
          return doc.uuid;
        }
      }
    }
    return uuid;
  }
  static getDocument(target) {
    if (_RetrieveHelpers.stringIsUuid(target)) {
      target = fromUuidSync(target);
    }
    return target?.document ?? target;
  }
  static stringIsUuid(inId) {
    const valid = typeof inId === "string" && (inId.match(/\./g) || []).length && !inId.endsWith(".");
    if (valid) {
      return !!fromUuidSync(inId);
    } else {
      return false;
    }
  }
  static getUuid(target) {
    if (_RetrieveHelpers.stringIsUuid(target)) {
      return target;
    }
    const document = getDocument(target);
    return document?.uuid ?? false;
  }
  static getCompendiumCollectionSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`CompendiumCollection is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof CompendiumCollection) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof CompendiumCollection) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      if (game.packs.get(targetTmp)) {
        targetTmp = game.packs.get(targetTmp);
      } else if (!ignoreName && game.packs.getName(targetTmp)) {
        targetTmp = game.packs.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`CompendiumCollection is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`CompendiumCollection is not found`, true, targetTmp);
      }
    }
    if (!(targetTmp instanceof CompendiumCollection)) {
      if (ignoreError) {
        Logger.warn(`Invalid CompendiumCollection`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Invalid CompendiumCollection`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static async getCompendiumCollectionAsync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`CompendiumCollection is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof CompendiumCollection) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof CompendiumCollection) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = await fromUuid(targetTmp);
    } else {
      if (game.packs.get(targetTmp)) {
        targetTmp = game.packs.get(targetTmp);
      } else if (!ignoreName && game.packs.getName(targetTmp)) {
        targetTmp = game.packs.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`CompendiumCollection is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`CompendiumCollection is not found`, true, targetTmp);
      }
    }
    if (!(targetTmp instanceof CompendiumCollection)) {
      if (ignoreError) {
        Logger.warn(`Invalid CompendiumCollection`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Invalid CompendiumCollection`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static getUserSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`User is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof User) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof User) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      if (game.users.get(targetTmp)) {
        targetTmp = game.users.get(targetTmp);
      } else if (!ignoreName && game.users.getName(targetTmp)) {
        targetTmp = game.users.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`User is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`User is not found`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static getActorSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Actor is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Actor) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Actor) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      if (game.actors.get(targetTmp)) {
        targetTmp = game.actors.get(targetTmp);
      } else if (!ignoreName && game.actors.getName(targetTmp)) {
        targetTmp = game.actors.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Actor is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Actor is not found`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static async getActorAsync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Actor is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Actor) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Actor) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = await fromUuid(targetTmp);
    } else {
      if (game.actors.get(targetTmp)) {
        targetTmp = game.actors.get(targetTmp);
      } else if (!ignoreName && game.actors.getName(targetTmp)) {
        targetTmp = game.actors.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Actor is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Actor is not found`, true, targetTmp);
      }
    }
    if (!(targetTmp instanceof Actor)) {
      if (ignoreError) {
        Logger.warn(`Invalid Actor`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Invalid Actor`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static getJournalSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Journal is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Journal) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Journal) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      if (game.journal.get(targetTmp)) {
        targetTmp = game.journal.get(targetTmp);
      } else if (!ignoreName && game.journal.getName(targetTmp)) {
        targetTmp = game.journal.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Journal is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Journal is not found`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static async getJournalAsync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Journal is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Journal) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Journal) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = await fromUuid(targetTmp);
    } else {
      if (game.journal.get(targetTmp)) {
        targetTmp = game.journal.get(targetTmp);
      } else if (!ignoreName && game.journal.getName(targetTmp)) {
        targetTmp = game.journal.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Journal is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Journal is not found`, true, targetTmp);
      }
    }
    if (!(targetTmp instanceof Journal)) {
      if (ignoreError) {
        Logger.warn(`Invalid Journal`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Invalid Journal`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static getMacroSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Macro is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Macro) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Macro) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      if (game.macros.get(targetTmp)) {
        targetTmp = game.macros.get(targetTmp);
      } else if (!ignoreName && game.macros.getName(targetTmp)) {
        targetTmp = game.macros.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Macro is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Macro is not found`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static async getMacroAsync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Macro is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Macro) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Macro) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = await fromUuid(targetTmp);
    } else {
      if (game.macros.get(targetTmp)) {
        targetTmp = game.macros.get(targetTmp);
      } else if (!ignoreName && game.macros.getName(targetTmp)) {
        targetTmp = game.macros.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Macro is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Macro is not found`, true, targetTmp);
      }
    }
    if (!(targetTmp instanceof Macro)) {
      if (ignoreError) {
        Logger.warn(`Invalid Macro`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Invalid Macro`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static getSceneSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Scene is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Scene) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Scene) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      if (game.scenes.get(targetTmp)) {
        targetTmp = game.scenes.get(targetTmp);
      } else if (!ignoreName && game.scenes.getName(targetTmp)) {
        targetTmp = game.scenes.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Scene is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Scene is not found`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static async getSceneAsync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Scene is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Scene) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Scene) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = await fromUuid(targetTmp);
    } else {
      if (game.scenes.get(targetTmp)) {
        targetTmp = game.scenes.get(targetTmp);
      } else if (!ignoreName && game.scenes.getName(targetTmp)) {
        targetTmp = game.scenes.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Scene is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Scene is not found`, true, targetTmp);
      }
    }
    if (!(targetTmp instanceof Scene)) {
      if (ignoreError) {
        Logger.warn(`Invalid Scene`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Invalid Scene`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static getItemSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Item is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Item) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Item) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      if (game.items.get(targetTmp)) {
        targetTmp = game.items.get(targetTmp);
      } else if (!ignoreName && game.items.getName(targetTmp)) {
        targetTmp = game.items.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Item is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Item is not found`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static async getItemAsync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Item is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Item) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Item) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = await fromUuid(targetTmp);
    } else {
      if (game.items.get(targetTmp)) {
        targetTmp = game.items.get(targetTmp);
      } else if (!ignoreName && game.items.getName(targetTmp)) {
        targetTmp = game.items.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Item is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Item is not found`, true, targetTmp);
      }
    }
    if (!(targetTmp instanceof Item)) {
      if (ignoreError) {
        Logger.warn(`Invalid Item`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Invalid Item`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static getPlaylistSoundPathSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`PlaylistSound is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof PlaylistSound) {
      return targetTmp.path;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof PlaylistSound) {
      return targetTmp;
    }
    if (typeof targetTmp === "string" || targetTmp instanceof String) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      targetTmp = game.playlists.contents.flatMap((playlist) => playlist.sounds.contents).find((playlistSound) => {
        return playlistSound.id === targetTmp || playlistSound.name === targetTmp;
      });
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`PlaylistSound is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`PlaylistSound is not found`, true, targetTmp);
      }
    }
    return targetTmp.path;
  }
  static async getPlaylistSoundPathAsync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`PlaylistSound is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof PlaylistSound) {
      return targetTmp.path;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof PlaylistSound) {
      return targetTmp;
    }
    if (typeof targetTmp === "string" || targetTmp instanceof String) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = await fromUuid(targetTmp);
    } else {
      targetTmp = game.playlists.contents.flatMap((playlist) => playlist.sounds.contents).find((playlistSound) => {
        return playlistSound.id === targetTmp || playlistSound.name === targetTmp;
      });
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`PlaylistSound is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`PlaylistSound is not found`, true, targetTmp);
      }
    }
    if (!(targetTmp instanceof PlaylistSound)) {
      if (ignoreError) {
        Logger.warn(`Invalid PlaylistSound`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Invalid PlaylistSound`, true, targetTmp);
      }
    }
    return targetTmp.path;
  }
  static getTokenSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`Token is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof Token) {
      return targetTmp;
    }
    if (targetTmp instanceof TokenDocument) {
      targetTmp = targetTmp?.object ?? targetTmp;
      return targetTmp;
    }
    if (targetTmp instanceof Actor) {
      if (targetTmp.token) {
        targetTmp = canvas.tokens.get(targetTmp.token);
      } else {
        targetTmp = targetTmp.prototypeToken;
      }
      if (!targetTmp) {
        if (ignoreError) {
          Logger.warn(`Token is not found`, false, targetTmp);
          return;
        } else {
          throw Logger.error(`Token is not found`, true, targetTmp);
        }
      }
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof Token) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      targetTmp = canvas.tokens?.placeables.find((t) => {
        return t.id === target;
      });
      if (!ignoreName) {
        targetTmp = canvas.tokens?.placeables.find((t) => {
          return t.name === target;
        });
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`Token is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Token is not found`, true, targetTmp);
      }
    }
    targetTmp = targetTmp?.token ?? targetTmp;
    if (targetTmp instanceof TokenDocument) {
      targetTmp = targetTmp?.object ?? targetTmp;
    }
    return targetTmp;
  }
  static getRollTableSync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`RollTable is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof RollTable) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof RollTable) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = fromUuidSync(targetTmp);
    } else {
      if (game.tables.get(targetTmp)) {
        targetTmp = game.tables.get(targetTmp);
      } else if (!ignoreName && game.tables.getName(targetTmp)) {
        targetTmp = game.tables.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`RollTable is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`RollTable is not found`, true, targetTmp);
      }
    }
    return targetTmp;
  }
  static async getRollTableAsync(target, ignoreError = false, ignoreName = true) {
    let targetTmp = target;
    if (!targetTmp) {
      throw Logger.error(`RollTable is undefined`, true, targetTmp);
    }
    if (targetTmp instanceof RollTable) {
      return targetTmp;
    }
    if (targetTmp.document) {
      targetTmp = targetTmp.document;
    }
    if (targetTmp.uuid) {
      targetTmp = targetTmp.uuid;
    }
    if (targetTmp instanceof RollTable) {
      return targetTmp;
    }
    if (_RetrieveHelpers.stringIsUuid(targetTmp)) {
      targetTmp = await fromUuid(targetTmp);
    } else {
      if (game.tables.get(targetTmp)) {
        targetTmp = game.tables.get(targetTmp);
      } else if (!ignoreName && game.tables.getName(targetTmp)) {
        targetTmp = game.tables.getName(targetTmp);
      }
    }
    if (!targetTmp) {
      if (ignoreError) {
        Logger.warn(`RollTable is not found`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`RollTable is not found`, true, targetTmp);
      }
    }
    if (!(targetTmp instanceof RollTable)) {
      if (ignoreError) {
        Logger.warn(`Invalid RollTable`, false, targetTmp);
        return;
      } else {
        throw Logger.error(`Invalid RollTable`, true, targetTmp);
      }
    }
    return targetTmp;
  }
};
__name(_RetrieveHelpers, "RetrieveHelpers");
let RetrieveHelpers = _RetrieveHelpers;
function isEmptyObject(obj) {
  if (obj === null || obj === void 0) {
    return true;
  }
  if (isRealNumber(obj)) {
    return false;
  }
  const result = obj && // null and undefined check
  Object.keys(obj).length === 0;
  return result;
}
__name(isEmptyObject, "isEmptyObject");
function isRealNumber(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}
__name(isRealNumber, "isRealNumber");
const _MagicItemHelpers = class _MagicItemHelpers {
  static isUsingNew5eSheet(sheet) {
    return sheet?.constructor?.name === "ActorSheet5eCharacter2" || sheet?.constructor?.name === "ActorSheet5eNPC2";
  }
  static isMidiItemEffectWorkflowOn() {
    return game.modules.get("midi-qol")?.active && game.settings.get("midi-qol", "ConfigSettings")?.autoItemEffects !== "off";
  }
  static isLevelScalingSettingOn() {
    return game.settings.get(CONSTANTS.MODULE_ID, "scaleSpellDamage");
  }
  static canSummon() {
    return game.user.can("TOKEN_CREATE") && (game.user.isGM || game.settings.get("dnd5e", "allowSummoning"));
  }
  static getEntityNameWithBabele(entity) {
    if (game.modules.get("babele")?.active) {
      return game.babele && entity.getFlag("babele", "hasTranslation") ? entity.getFlag("babele", "originalName") : entity.name;
    } else {
      return entity.name;
    }
  }
  static getEntityNameCompendiumWithBabele(packToCheck, nameToCheck) {
    if (game.modules.get("babele")?.active && game.babele?.packs !== void 0) {
      if (packToCheck !== "world" && game.babele?.isTranslated(packToCheck)) {
        return game.babele.translateField("name", packToCheck, { name: nameToCheck });
      } else {
        return nameToCheck;
      }
    } else {
      return nameToCheck;
    }
  }
  static sortByName(a, b) {
    if (a.displayName < b.displayName) {
      return -1;
    }
    if (a.displayName > b.displayName) {
      return 1;
    }
    return 0;
  }
  static sortByLevel(a, b) {
    return a.level === b.level ? _MagicItemHelpers.sortByName(a, b) : a.level - b.level;
  }
  static async fetchEntity(entity) {
    if (entity.pack === "world") {
      const result = await CONFIG["Item"].collection?.instance?.get(entity.id);
      return result;
    } else {
      const pack2 = game.packs.find((p) => p.collection === entity.pack);
      if (!pack2) {
        Logger.warn(`Cannot retrieve pack ${entity.pack}`, true);
      } else {
        const result = await pack2.getDocument(entity.id);
        return result;
      }
    }
  }
  static async updateMagicItemFlagOnItem(item) {
    Logger.info(`Updating item ${item.name}`);
    const itemFlag = foundry.utils.getProperty(item, `flags.${CONSTANTS.MODULE_ID}`);
    Logger.debug("", itemFlag);
    let updateItem = false;
    if (!isEmptyObject(itemFlag)) {
      if (!isEmptyObject(itemFlag.spells)) {
        for (const [key, spell] of Object.entries(itemFlag.spells)) {
          Logger.info(`Updating spell ${spell.name}`);
          Logger.debug("", spell);
          const entity = await _MagicItemHelpers.fetchEntity(spell);
          if (entity) {
            if (!spell.componentsVSM) {
              Logger.debug(`Entered componentsVSM part ${JSON.stringify(entity?.labels?.components?.vsm)}`);
              spell.componentsVSM = await entity?.labels?.components?.vsm;
              Logger.info(`Added componentVSM value to spell ${spell.name}`);
              updateItem = true;
            }
            if (!spell.componentsALL) {
              Logger.debug(`Entered componentsALL part ${JSON.stringify(entity?.labels?.components?.all)}`);
              spell.componentsALL = await entity?.labels?.components?.all;
              Logger.info(`Added componentsALL value to spell ${spell.name}`);
              updateItem = true;
            }
          }
        }
      }
      if (!isEmptyObject(itemFlag.feats)) {
        for (const [key, feat] of Object.entries(itemFlag.feats)) {
          Logger.info(`Updating feat ${feat.name}`);
          Logger.debug("", feat);
          const entity = await _MagicItemHelpers.fetchEntity(feat);
          if (entity) {
            if (!feat.featAction) {
              Logger.debug(`Entered featAction part ${JSON.stringify(entity?.labels?.activation)}`);
              feat.featAction = await entity?.labels?.activation;
              Logger.info(`Added activation method '${feat.featAction}' for feat: ${feat.name}`);
              updateItem = true;
            }
          }
        }
      }
      if (updateItem) {
        await item.update({
          flags: {
            [CONSTANTS.MODULE_ID]: itemFlag
          }
        });
        Logger.info(`Updated item ${item.name}`);
      } else {
        Logger.info(`Update of item ${item.name} skipped - no flags updated`);
      }
    }
  }
  /**
   * Create details on the summoning profiles and other related options.
   * Method fetched from D&D5e ability-use-dialog.mjs
   * @param {Item5e} item  The item.
   * @returns {{ profiles: object, creatureTypes: object }|null}
   */
  static createSummoningOptions(item) {
    const summons = item.system.summons;
    if (!summons?.profiles.length)
      return null;
    const options = { mode: summons.mode, createSummons: true };
    const rollData = item.getRollData();
    const level = summons.relevantLevel;
    options.profiles = Object.fromEntries(
      summons.profiles.map((profile) => {
        if (!summons.mode && !fromUuidSync(profile.uuid))
          return null;
        const withinRange = (profile.level.min ?? -Infinity) <= level && level <= (profile.level.max ?? Infinity);
        if (!withinRange)
          return null;
        return [profile._id, summons.getProfileLabel(profile, rollData)];
      }).filter((f) => f)
    );
    if (Object.values(options.profiles).every((p) => p.startsWith("1 × "))) {
      Object.entries(options.profiles).forEach(([k, v]) => options.profiles[k] = v.replace("1 × ", ""));
    }
    if (Object.values(options.profiles).length <= 1) {
      options.profile = Object.keys(options.profiles)[0];
      options.profiles = null;
    }
    if (summons.creatureSizes.size > 1)
      options.creatureSizes = summons.creatureSizes.reduce((obj, k) => {
        obj[k] = CONFIG.DND5E.actorSizes[k]?.label;
        return obj;
      }, {});
    if (summons.creatureTypes.size > 1)
      options.creatureTypes = summons.creatureTypes.reduce((obj, k) => {
        obj[k] = CONFIG.DND5E.creatureTypes[k]?.label;
        return obj;
      }, {});
    return options;
  }
};
__name(_MagicItemHelpers, "MagicItemHelpers");
__publicField(_MagicItemHelpers, "numeric", function(value, fallback) {
  if (isRealNumber(value)) {
    return value;
  } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
    return parseInt(value);
  } else {
    return fallback;
  }
});
__publicField(_MagicItemHelpers, "localized", function(cfg) {
  return Object.keys(cfg).reduce((i18nCfg, key) => {
    i18nCfg[key] = game.i18n.localize(cfg[key]);
    return i18nCfg;
  }, {});
});
let MagicItemHelpers = _MagicItemHelpers;
const MAGICITEMS = {};
MAGICITEMS.actors = [];
MAGICITEMS.rechargeUnits = {
  r1: "MAGICITEMS.RechargeUnitDaily",
  r2: "MAGICITEMS.RechargeUnitDawn",
  r3: "MAGICITEMS.RechargeUnitSunset",
  r4: "MAGICITEMS.RechargeUnitShortRest",
  r5: "MAGICITEMS.RechargeUnitLongRest"
};
MAGICITEMS.DAILY = "r1";
MAGICITEMS.DAWN = "r2";
MAGICITEMS.SUNSET = "r3";
MAGICITEMS.SHORT_REST = "r4";
MAGICITEMS.LONG_REST = "r5";
MAGICITEMS.rechargeTypes = {
  t1: "MAGICITEMS.RechargeTypeNumeric",
  t2: "MAGICITEMS.RechargeTypeFormula",
  t3: "MAGICITEMS.RechargeTypeFull"
};
MAGICITEMS.destroyChecks = {
  d1: "MAGICITEMS.DestroyCheckAlways",
  d2: "MAGICITEMS.DestroyCheck1D20",
  d3: "MAGICITEMS.DestroyCheckCustomDC"
};
MAGICITEMS.destroyTypes = {
  dt1: "MAGICITEMS.JusDestroyType",
  dt2: "MAGICITEMS.LoosePowersType"
};
MAGICITEMS.chargeTypes = {
  c1: "MAGICITEMS.ChargeTypeWholeItem",
  c2: "MAGICITEMS.ChargeTypePerSpells"
};
MAGICITEMS.effects = {
  e1: "MAGICITEMS.EffectTypeConsume",
  e2: "MAGICITEMS.EffectTypeDestroy"
};
MAGICITEMS.CHARGE_TYPE_WHOLE_ITEM = "c1";
MAGICITEMS.CHARGE_TYPE_PER_SPELL = "c2";
MAGICITEMS.NUMERIC_RECHARGE = "t1";
MAGICITEMS.FORMULA_RECHARGE = "t2";
MAGICITEMS.FORMULA_FULL = "t3";
MAGICITEMS.tableUsages = {
  u1: "MAGICITEMS.TableUsageAsSpell",
  u2: "MAGICITEMS.TableUsageAsFeat",
  u3: "MAGICITEMS.TableUsageTriggerOnUsage"
};
MAGICITEMS.TABLE_USAGE_AS_SPELL = "u1";
MAGICITEMS.TABLE_USAGE_AS_FEAT = "u2";
MAGICITEMS.TABLE_USAGE_TRIGGER = "u3";
MAGICITEMS.DESTROY_JUST_DESTROY = "dt1";
MAGICITEMS.DESTROY_LOSE_CHARGES = "dt2";
MAGICITEMS.RECHARGE_TRANSLATION = {
  sr: MAGICITEMS.SHORT_REST,
  lr: MAGICITEMS.LONG_REST,
  day: MAGICITEMS.DAILY,
  dawn: MAGICITEMS.DAWN,
  charges: MAGICITEMS.DAILY,
  dusk: MAGICITEMS.SUNSET
};
const _AbstractMagicItemEntry = class _AbstractMagicItemEntry {
  constructor(data) {
    foundry.utils.mergeObject(this, data);
    if (this.pack?.startsWith("magic-items")) {
      this.pack = this.pack.replace("magic-items-2.", `${CONSTANTS.MODULE_ID}.`);
    }
    if (!this.uuid) {
      try {
        this.uuid = RetrieveHelpers.retrieveUuid({
          documentName: this.name,
          documentId: this.id,
          documentCollectionType: this.collectionType,
          documentPack: this.pack,
          ignoreError: true
        });
      } catch (e) {
        Logger.error("Cannot retrieve uuid", false, e);
        this.uuid = "";
      }
    }
    this.removed = !RetrieveHelpers.stringIsUuid(this.uuid);
  }
  get displayName() {
    return MagicItemHelpers.getEntityNameCompendiumWithBabele(this.pack, this.name);
  }
  async renderSheet() {
    this.entity().then((entity) => {
      entity.ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
      const sheet = entity.sheet;
      sheet.render(true);
    });
  }
  entity() {
    return new Promise((resolve, reject) => {
      if (this.pack === "world") {
        let entity = this.entityCls().collection?.instance?.get(this.id);
        if (entity) {
          resolve(entity);
        } else {
          Logger.warn(game.i18n.localize("MAGICITEMS.WarnNoMagicItemSpell") + this.name, true);
          reject();
        }
      } else {
        const pack2 = game.packs.find((p) => p.collection === this.pack);
        if (!pack2) {
          Logger.warn(`Cannot retrieve pack for if ${this.pack}`, true);
        } else {
          pack2.getDocument(this.id)?.then((entity) => {
            if (entity) {
              resolve(entity);
            } else {
              Logger.warn(game.i18n.localize("MAGICITEMS.WarnNoMagicItemSpell") + this.name, true);
              reject();
            }
          });
        }
      }
    });
  }
  entityCls() {
    return CONFIG["Item"];
  }
  data() {
    return new Promise((resolve) => {
      this.entity().then((entity) => {
        resolve(entity.toJSON());
      });
    });
  }
};
__name(_AbstractMagicItemEntry, "AbstractMagicItemEntry");
let AbstractMagicItemEntry = _AbstractMagicItemEntry;
const _MagicItemFeat = class _MagicItemFeat extends AbstractMagicItemEntry {
  constructor(data) {
    super(data);
    this.effect = this.effect ? this.effect : "e1";
    this.featAction = this.featAction;
  }
  consumptionLabel() {
    return this.effect === "e1" ? `${game.i18n.localize("MAGICITEMS.SheetConsumptionConsume")}: ${this.consumption}` : game.i18n.localize(`MAGICITEMS.SheetConsumptionDestroy`);
  }
  serializeData() {
    return {
      consumption: this.consumption,
      uuid: this.uuid,
      id: this.id,
      img: this.img,
      name: this.name,
      pack: this.pack,
      uses: this.uses,
      effect: this.effect,
      featAction: this.featAction
    };
  }
  get effects() {
    return MagicItemHelpers.localized(MAGICITEMS.effects);
  }
};
__name(_MagicItemFeat, "MagicItemFeat");
let MagicItemFeat = _MagicItemFeat;
const _NumberUtils = class _NumberUtils {
  static parseIntOrGetDefault(value, defaultValue) {
    const parsedValue = parseInt(value);
    return !isNaN(parsedValue) ? parsedValue : defaultValue;
  }
};
__name(_NumberUtils, "NumberUtils");
let NumberUtils = _NumberUtils;
const _MagicItemSpell = class _MagicItemSpell extends AbstractMagicItemEntry {
  constructor(data) {
    super(data);
    this.baseLevel = NumberUtils.parseIntOrGetDefault(this.baseLevel, 0);
    this.level = NumberUtils.parseIntOrGetDefault(this.level, 0);
    this.consumption = NumberUtils.parseIntOrGetDefault(this.consumption, 0);
    this.upcast = this.upcast ? NumberUtils.parseIntOrGetDefault(this.upcast, 0) : this.level;
    this.upcastCost = this.upcastCost ? NumberUtils.parseIntOrGetDefault(this.upcastCost, 0) : 1;
    this.dc = this.flatDc && this.dc ? this.dc : "";
    this.componentsVSM = this.componentsVSM;
    this.componentsALL = this.componentsALL;
    this.atkBonus = this.checkAtkBonus && this.atkBonus ? this.atkBonus : "";
  }
  get levels() {
    let levels = {};
    for (let i = this.baseLevel; i <= 9; i++) {
      levels[i] = game.i18n.localize(`MAGICITEMS.SheetSpellLevel${i}`);
      if (i === 0) {
        break;
      }
    }
    return levels;
  }
  get upcasts() {
    let upcasts = {};
    for (let i = this.level; i <= 9; i++) {
      upcasts[i] = game.i18n.localize(`MAGICITEMS.SheetSpellUpcast${i}`);
      if (i === 0) {
        break;
      }
    }
    return upcasts;
  }
  get allowedLevels() {
    let levels = {};
    for (let i = this.level; i <= Math.min(this.upcast, 9); i++) {
      levels[i] = game.i18n.localize(`MAGICITEMS.SheetSpellLevel${i}`);
      if (i === 0) {
        break;
      }
    }
    return levels;
  }
  canUpcast() {
    return this.level < this.upcast;
  }
  canUpcastLabel() {
    return this.canUpcast() ? game.i18n.localize(`MAGICITEMS.SheetCanUpcastYes`) : game.i18n.localize(`MAGICITEMS.SheetCanUpcastNo`);
  }
  consumptionAt(level) {
    return this.consumption + this.upcastCost * (level - this.level);
  }
  serializeData() {
    return {
      baseLevel: this.baseLevel,
      consumption: this.consumption,
      uuid: this.uuid,
      id: this.id,
      img: this.img,
      level: this.level,
      name: this.name,
      pack: this.pack,
      upcast: this.upcast,
      upcastCost: this.upcastCost,
      flatDc: this.flatDc,
      dc: this.dc,
      uses: this.uses,
      componentsVSM: this.componentsVSM,
      componentsALL: this.componentsALL
    };
  }
};
__name(_MagicItemSpell, "MagicItemSpell");
let MagicItemSpell = _MagicItemSpell;
const _MagicItemTable = class _MagicItemTable extends AbstractMagicItemEntry {
  entityCls() {
    return CONFIG["RollTable"];
  }
  get usages() {
    return MagicItemHelpers.localized(MAGICITEMS.tableUsages);
  }
  async roll(actor) {
    let entity = await this.entity();
    let result = await entity.draw();
    if (result && result.results && result.results.length === 1 && result.results[0].collection) {
      const collectionId = result.results[0].documentCollection;
      const id = result.results[0].documentId;
      const pack2 = game.collections.get(collectionId) || game.packs.get(collectionId);
      if (!pack2) {
        Logger.warn(`Cannot retrieve pack for if ${collectionId}`, true);
      } else {
        const entity2 = pack2.getDocument ? await pack2.getDocument(id) : pack2.get(id);
        if (entity2) {
          let item = (await actor.createEmbeddedDocuments("Item", [entity2]))[0];
          const chatData = await item.use({}, { createMessage: false });
          if (!game.modules.get("ready-set-roll-5e")?.active) {
            ChatMessage.create(
              foundry.utils.mergeObject(chatData, {
                "flags.dnd5e.itemData": item
              })
            );
          }
        }
      }
    }
  }
  serializeData() {
    return {
      consumption: this.consumption,
      id: this.id,
      uuid: this.uuid,
      img: this.img,
      name: this.name,
      pack: this.pack
    };
  }
};
__name(_MagicItemTable, "MagicItemTable");
let MagicItemTable = _MagicItemTable;
const _MagicItem = class _MagicItem {
  constructor(flagsData) {
    const data = foundry.utils.mergeObject(this.defaultData(), flagsData || {}, { inplace: false });
    this.enabled = data.enabled;
    this.equipped = data.equipped;
    this.attuned = data.attuned;
    this.internal = data.internal;
    this.charges = NumberUtils.parseIntOrGetDefault(data.charges, 0);
    this.chargeType = data.chargeType;
    this.rechargeable = data.rechargeable;
    this.recharge = data.recharge;
    this.rechargeType = data.rechargeType;
    this.rechargeUnit = data.rechargeUnit;
    this.destroy = data.destroy;
    this.destroyCheck = data.destroyCheck;
    this.destroyType = data.destroyType;
    this.destroyFlavorText = data.destroyFlavorText;
    this.destroyDC = data.destroyDC;
    this.sorting = data.sorting;
    this.sortingModes = { l: "MAGICITEMS.SheetSortByLevel", a: "MAGICITEMS.SheetSortAlphabetically" };
    this.spells = Object.values(data.spells ? data.spells : {}).filter((spell) => spell !== "null").map((spell) => {
      spell.collectionType = "Item";
      return new MagicItemSpell(spell);
    });
    this.feats = Object.values(data.feats ? data.feats : {}).filter((feat) => feat !== "null").map((feat) => {
      feat.collectionType = "Item";
      return new MagicItemFeat(feat);
    });
    this.tables = Object.values(data.tables ? data.tables : {}).filter((table) => table !== "null").map((table) => {
      table.collectionType = "RollTable";
      return new MagicItemTable(table);
    });
    this.spellsGarbage = [];
    this.featsGarbage = [];
    this.tablesGarbage = [];
    this.savedSpells = this.spells.length;
    this.savedFeats = this.feats.length;
    this.savedTables = this.tables.length;
    this.sort();
    if (!this.enabled) {
      this.clear();
    }
  }
  sort() {
    if (this.sorting === "a") {
      this.spells = this.spells.sort(MagicItemHelpers.sortByName);
    }
    if (this.sorting === "l") {
      this.spells = this.spells.sort(MagicItemHelpers.sortByLevel);
    }
  }
  get destroyTarget() {
    return this.chargeType === "c1" ? game.i18n.localize("MAGICITEMS.SheetObjectTarget") : game.i18n.localize("MAGICITEMS.SheetSpellTarget");
  }
  defaultData() {
    return {
      enabled: false,
      equipped: false,
      internal: false,
      attuned: false,
      charges: 0,
      chargeType: "c1",
      rechargeable: false,
      recharge: 0,
      rechargeType: "t1",
      rechargeUnit: "",
      destroy: false,
      destroyCheck: "d1",
      destroyType: "dt1",
      destroyDC: 0,
      destroyFlavorText: game.i18n.localize("MAGICITEMS.MagicItemDestroy"),
      sorting: "l",
      spells: {},
      feats: {},
      tables: {}
    };
  }
  serializeData() {
    return {
      enabled: this.enabled,
      charges: this.charges,
      chargeType: this.chargeType,
      internal: this.internal,
      rechargeable: this.rechargeable,
      recharge: this.recharge,
      rechargeType: this.rechargeType,
      rechargeUnit: this.rechargeUnit,
      destroy: this.destroy,
      destroyCheck: this.destroyCheck,
      destroyType: this.destroyType,
      destroyFlavorText: this.destroyFlavorText,
      destroyDC: this.destroyDC,
      sorting: this.sorting,
      spells: this.serializeEntries(this.spells, this.spellsGarbage),
      feats: this.serializeEntries(this.feats, this.featsGarbage),
      tables: this.serializeEntries(this.tables, this.tablesGarbage),
      uses: this.uses
    };
  }
  serializeEntries(entries, trash) {
    let data = {};
    entries.forEach((entry, idx) => data["" + idx] = entry.serializeData());
    trash.forEach((index) => data["-=" + index] = null);
    return data;
  }
  get chargeTypes() {
    return MagicItemHelpers.localized(MAGICITEMS.chargeTypes);
  }
  get destroyChecks() {
    return MagicItemHelpers.localized(MAGICITEMS.destroyChecks);
  }
  get destroyTypes() {
    return MagicItemHelpers.localized(MAGICITEMS.destroyTypes);
  }
  get rechargeUnits() {
    return MagicItemHelpers.localized(MAGICITEMS.rechargeUnits);
  }
  get rechargeTypes() {
    return MagicItemHelpers.localized(MAGICITEMS.rechargeTypes);
  }
  get rechargeText() {
    return this.rechargeType === "t3" ? game.i18n.localize("MAGICITEMS.RechargeTypeFull") : this.recharge;
  }
  get empty() {
    return this.spells.length === 0 && this.feats.length === 0 && this.tables.length === 0;
  }
  get chargesOnWholeItem() {
    return this.chargeType === MAGICITEMS.CHARGE_TYPE_WHOLE_ITEM;
  }
  get chargesPerSpell() {
    return this.chargeType === MAGICITEMS.CHARGE_TYPE_PER_SPELL;
  }
  toggleEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }
  toggleRechargeable(rechargeable) {
    this.rechargeable = rechargeable;
    if (!rechargeable) {
      this.recharge = 0;
      this.rechargeType = "t1";
      this.rechargeUnit = "";
    }
  }
  clear() {
    foundry.utils.mergeObject(this, this.defaultData());
    this.spells = [];
    this.feats = [];
    this.tables = [];
    this.cleanup();
  }
  support(type) {
    return ["Item", "RollTable"].includes(type);
  }
  get items() {
    return this.spells.concat(this.feats).concat(this.tables);
  }
  addSpell(data) {
    data.collectionType = "Item";
    this.spells.push(new MagicItemSpell(data));
    this.cleanup();
  }
  removeSpell(idx) {
    this.spells.splice(idx, 1);
    this.cleanup();
  }
  get hasSpells() {
    return this.spells.length > 0 || this.hasTableAsSpells;
  }
  hasSpell(spellId) {
    return this.spells.filter((spell) => spell.id === spellId).length === 1;
  }
  addFeat(data) {
    data.collectionType = "Item";
    this.feats.push(new MagicItemFeat(data));
    this.cleanup();
  }
  removeFeat(idx) {
    this.feats.splice(idx, 1);
    this.cleanup();
  }
  get hasFeats() {
    return this.feats.length > 0 || this.hasTableAsFeats;
  }
  hasFeat(featId) {
    return this.feats.filter((feat) => feat.id === featId).length === 1;
  }
  addTable(data) {
    data.collectionType = "RollTable";
    this.tables.push(new MagicItemTable(data));
    this.cleanup();
  }
  removeTable(idx) {
    this.tables.splice(idx, 1);
    this.cleanup();
  }
  get hasTableAsSpells() {
    return this.tableAsSpells.length === 1;
  }
  get hasTableAsFeats() {
    return this.tableAsFeats.length === 1;
  }
  hasTable(tableId) {
    return this.tables.filter((table) => table.id === tableId).length === 1;
  }
  tablesByUsage(usage) {
    return this.tables.filter((table) => table.usage === usage);
  }
  get tableAsSpells() {
    return this.tablesByUsage(MAGICITEMS.TABLE_USAGE_AS_SPELL);
  }
  get tableAsFeats() {
    return this.tablesByUsage(MAGICITEMS.TABLE_USAGE_AS_FEAT);
  }
  get triggeredTables() {
    return this.tablesByUsage(MAGICITEMS.TABLE_USAGE_TRIGGER);
  }
  compatible(entity) {
    return (["spell", "feat"].includes(entity.type) || entity.documentName === "RollTable") && !this.hasItem(entity.id);
  }
  addEntity(entity, pack2) {
    let name = MagicItemHelpers.getEntityNameWithBabele(entity);
    if (entity.type === "spell") {
      this.addSpell({
        uuid: entity.uuid,
        id: entity.id,
        name,
        img: entity.img,
        pack: pack2,
        baseLevel: entity.system.level,
        level: entity.system.level,
        consumption: entity.system.level,
        upcast: entity.system.level,
        upcastCost: 1,
        componentsVSM: entity?.labels?.components?.vsm,
        componentsALL: entity?.labels?.components?.all
      });
      return true;
    }
    if (entity.type === "feat") {
      this.addFeat({
        uuid: entity.uuid,
        id: entity.id,
        name,
        img: entity.img,
        pack: pack2,
        effect: "e1",
        consumption: 1,
        featAction: entity?.labels?.activation
      });
      return true;
    }
    if (entity.documentName === "RollTable") {
      this.addTable({
        uuid: entity.uuid,
        id: entity.id,
        name,
        img: entity.img,
        pack: pack2,
        consumption: 1
      });
      return true;
    }
    return false;
  }
  hasItem(itemId) {
    return this.hasSpell(itemId) || this.hasFeat(itemId) || this.hasTable(itemId);
  }
  findByUuid(itemUuid) {
    return this.items.filter((item) => item.uuid === itemUuid)[0];
  }
  findById(itemId) {
    return this.items.filter((item) => item.id === itemId)[0];
  }
  get sheetEditable() {
    return $(this.actor.sheet.form).hasClass("editable");
  }
  async renderSheet(itemId) {
    let item = this.findByUuid(itemId);
    if (!item) {
      item = this.findById(itemId);
    }
    await item.renderSheet();
  }
  cleanup() {
    this.spellsGarbage = [];
    this.featsGarbage = [];
    this.tablesGarbage = [];
    if (this.savedSpells > this.spells.length) {
      for (let i = this.spells.length; i < this.savedSpells; i++) {
        this.spellsGarbage.push(i);
      }
    }
    if (this.savedFeats > this.feats.length) {
      for (let i = this.feats.length; i < this.savedFeats; i++) {
        this.featsGarbage.push(i);
      }
    }
    if (this.savedTables > this.tables.length) {
      for (let i = this.tables.length; i < this.savedTables; i++) {
        this.tablesGarbage.push(i);
      }
    }
  }
  async updateInternalCharges(isChecked, item) {
    let itemData = await RetrieveHelpers.getItemAsync(item);
    const itemChargeData = itemData.system.uses;
    if (isChecked && itemChargeData?.per) {
      this.charges = itemChargeData.max;
      this.uses = itemChargeData.value;
      this.chargeType = MAGICITEMS.CHARGE_TYPE_WHOLE_ITEM;
      this.rechargeable = false;
      this.recharge = itemChargeData.recovery;
      this.rechargeType = this.chargesTypeCompatible(itemChargeData);
      this.rechargeUnit = MAGICITEMS.RECHARGE_TRANSLATION[itemChargeData.per];
    } else if (isChecked && !itemChargeData?.per) {
      this.charges = 0;
      this.uses = 0;
      this.chargeType = MAGICITEMS.CHARGE_TYPE_WHOLE_ITEM;
      this.rechargeable = false;
      this.rechargeUnit = "";
      this.rechargeType = MAGICITEMS.NUMERIC_RECHARGE;
    }
  }
  chargesTypeCompatible(chargeData) {
    if (["lr", "sr", "day"].includes(chargeData.per)) {
      return MAGICITEMS.FORMULA_FULL;
    } else if (NumberUtils.parseIntOrGetDefault(chargeData.recovery, 0) !== 0) {
      return MAGICITEMS.NUMERIC_RECHARGE;
    } else {
      return MAGICITEMS.FORMULA_RECHARGE;
    }
  }
};
__name(_MagicItem, "MagicItem");
let MagicItem = _MagicItem;
const magicItemTabs = [];
const _MagicItemTab = class _MagicItemTab {
  static bind(app, html, item) {
    if (_MagicItemTab.isAcceptedItemType(item.document)) {
      let tab = magicItemTabs[app.id];
      if (!tab) {
        tab = new _MagicItemTab(app);
        magicItemTabs[app.id] = tab;
      }
      tab.init(html, item, app);
    }
  }
  constructor(app) {
    this.hack(app);
    this.activate = false;
  }
  init(html, data, app) {
    this.item = app.item;
    this.html = html;
    this.editable = data.editable;
    if (html[0].localName !== "div") {
      html = $(html[0].parentElement.parentElement);
    }
    let tabs = html.find(`form nav.sheet-navigation.tabs`);
    if (tabs.find(`a[data-tab=${CONSTANTS.MODULE_ID}]`).length > 0) {
      return;
    }
    tabs.append($(`<a class="item" data-tab="${CONSTANTS.MODULE_ID}">Magic Item</a>`));
    $(html.find(`.sheet-body`)).append(
      $(`<div class="tab magicitems" data-group="primary" data-tab="${CONSTANTS.MODULE_ID}"></div>`)
    );
    if (this.editable) {
      const dragDrop = new DragDrop({
        dropSelector: ".tab.magicitems",
        permissions: {
          dragstart: this._canDragStart.bind(app),
          drop: this._canDragDrop.bind(app)
        },
        callbacks: {
          dragstart: app._onDragStart.bind(app),
          dragover: app._onDragOver.bind(app),
          drop: (event) => {
            this.activate = true;
            _MagicItemTab.onDrop({
              event,
              item: this.item,
              magicItem: this.magicItem
            });
          }
        }
      });
      app._dragDrop.push(dragDrop);
      dragDrop.bind(app.form);
    }
    const flagsData = foundry.utils.getProperty(app.item, `flags.${CONSTANTS.MODULE_ID}`);
    this.magicItem = new MagicItem(flagsData);
    this.render(app);
  }
  hack(app) {
    let tab = this;
    app.setPosition = function(position = {}) {
      position.height = tab.isActive() && !position.height ? "auto" : position.height;
      let that = this;
      for (let i = 0; i < 100; i++) {
        if (that.constructor.name === ItemSheet.name) {
          break;
        }
        that = Object.getPrototypeOf(that);
      }
      return that.setPosition.apply(this, [position]);
    };
  }
  async render(app) {
    let template = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/magic-item-tab.hbs`, this.magicItem);
    let el = this.html.find(`.magicitems-content`);
    if (el.length) {
      el.replaceWith(template);
    } else {
      this.html.find(".tab.magicitems").append(template);
    }
    if (this.editable) {
      this.activateTabManagementListeners();
      _MagicItemTab.activateTabContentsListeners({
        html: this.html,
        item: this.item,
        magicItem: this.magicItem,
        onItemUpdatingCallback: () => {
          this.activate = true;
        }
      });
    } else {
      _MagicItemTab.disableMagicItemTabInputs(this.html);
    }
    if (this.activate && !this.isActive()) {
      app._tabs[0].activate(`${CONSTANTS.MODULE_ID}`);
      app.setPosition();
    }
    this.activate = false;
  }
  isActive() {
    return $(this.html).find(`a.item[data-tab="${CONSTANTS.MODULE_ID}"]`).hasClass("active");
  }
  _canDragDrop() {
    return true;
  }
  _canDragStart() {
    return true;
  }
  activateTabManagementListeners() {
    this.html.find(".magicitems-content").on("change", ":input", (evt) => {
      this.activate = true;
    });
  }
  /**
   * Disable all relevant inputs in the magic items tab.
   */
  static disableMagicItemTabInputs(html) {
    html.find(".magicitems-content input").prop("disabled", true);
    html.find(".magicitems-content select").prop("disabled", true);
  }
  /**
   * Handles drop event for compatible magic item source (for example, a spell).
   *
   * @param {object} params Parameters needed to handle item drops to the magic item tab.
   * @param {DragEvent} params.event The drop event.
   * @param {Item5e} params.item The target item.
   * @param {MagicItem} params.magicItem The relevant magic item associated with the target item.
   * @returns
   */
  static async onDrop({ event, item, magicItem }) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (!magicItem.support(data.type)) {
        return;
      }
    } catch (err) {
      return false;
    }
    const entity = await fromUuid(data.uuid);
    const pack2 = entity.pack ? entity.pack : "world";
    if (entity && magicItem.compatible(entity)) {
      magicItem.addEntity(entity, pack2);
      await item.update({
        flags: {
          [CONSTANTS.MODULE_ID]: magicItem.serializeData()
        }
      });
    }
  }
  /**
   * Activates listeners related to tab contents.
   *
   * @param {object}    params The parameters for wiring up tab content event handling.
   * @param {jQuery}    params.html The sheet HTML jQuery element
   * @param {Item5e}    params.item The item which is to be changed.
   * @param {MagicItem} params.magicItem A Magic Item instance
   * @param {Function}  params.onItemUpdatingCallback A callback for handling when item updates are about to be applied. This is useful for current tab management.
   */
  static async activateTabContentsListeners({
    html,
    item,
    magicItem,
    onItemUpdatingCallback: onMagicItemUpdatingCallback = null
  }) {
    html.find(".item-delete.item-spell").click((evt) => {
      magicItem.removeSpell(evt.target.getAttribute("data-spell-idx"));
      onMagicItemUpdatingCallback?.();
      item.update({
        flags: {
          [CONSTANTS.MODULE_ID]: magicItem.serializeData()
        }
      });
    });
    html.find(".item-delete.item-feat").click((evt) => {
      magicItem.removeFeat(evt.target.getAttribute("data-feat-idx"));
      onMagicItemUpdatingCallback?.();
      item.update({
        flags: {
          [CONSTANTS.MODULE_ID]: magicItem.serializeData()
        }
      });
    });
    html.find(".item-delete.item-table").click((evt) => {
      magicItem.removeTable(evt.target.getAttribute("data-table-idx"));
      onMagicItemUpdatingCallback?.();
      item.update({
        flags: {
          [CONSTANTS.MODULE_ID]: magicItem.serializeData()
        }
      });
    });
    html.find("input[name='flags.magicitems.internal']").click(async (evt) => {
      await magicItem.updateInternalCharges(evt.target.checked, item);
      onMagicItemUpdatingCallback?.();
      item.update({
        flags: {
          [CONSTANTS.MODULE_ID]: magicItem.serializeData()
        }
      });
    });
    magicItem.spells.forEach((spell, idx) => {
      html.find(`a[data-spell-idx="${idx}"]`).click((evt) => {
        spell.renderSheet();
      });
    });
    magicItem.feats.forEach((feat, idx) => {
      html.find(`a[data-feat-idx="${idx}"]`).click((evt) => {
        feat.renderSheet();
      });
    });
    magicItem.tables.forEach((table, idx) => {
      html.find(`a[data-table-idx="${idx}"]`).click((evt) => {
        table.renderSheet();
      });
    });
  }
  static get acceptedItemTypes() {
    return ["weapon", "equipment", "consumable", "tool", "backpack", "feat"];
  }
  static isAcceptedItemType(document) {
    return _MagicItemTab.acceptedItemTypes.includes(document?.type);
  }
  static isAllowedToShow() {
    return game.user.isGM || !game.settings.get(CONSTANTS.MODULE_ID, "hideFromPlayers");
  }
};
__name(_MagicItemTab, "MagicItemTab");
let MagicItemTab = _MagicItemTab;
const _AbstractOwnedMagicItemEntry = class _AbstractOwnedMagicItemEntry {
  constructor(magicItem, item) {
    this.magicItem = magicItem;
    this.item = item;
    this.uses = parseInt("uses" in this.item ? this.item.uses : this.magicItem.charges);
    if (this.item.pack?.startsWith("magic-items")) {
      this.item.pack = this.item.pack.replace("magic-items-2.", `${CONSTANTS.MODULE_ID}.`);
    }
    if (!this.item.uuid) {
      try {
        this.item.uuid = RetrieveHelpers.retrieveUuid({
          documentName: this.item.name,
          documentId: this.item.id,
          documentCollectionType: this.item.collectionType,
          documentPack: this.item.pack,
          ignoreError: true
        });
      } catch (e) {
        Logger.error("Cannot retrieve uuid", false, e);
        this.item.uuid = "";
      }
    }
    this.item.removed = !RetrieveHelpers.stringIsUuid(this.item.uuid);
  }
  get uuid() {
    return this.item.uuid;
  }
  get id() {
    return this.item.id;
  }
  get name() {
    return this.item.name;
  }
  get img() {
    return this.item.img;
  }
  get uses() {
    return this.item.uses;
  }
  get destroyDC() {
    return this.item.destroyDC;
  }
  set uses(uses) {
    this.item.uses = uses;
  }
  isFull() {
    return this.uses === this.magicItem.charges;
  }
  hasCharges(consumption) {
    let uses = this.magicItem.chargesOnWholeItem ? this.magicItem.uses : this.uses;
    return uses - consumption >= 0;
  }
  async consume(consumption) {
    if (this.magicItem.chargesOnWholeItem) {
      await this.magicItem.consume(consumption);
    } else {
      this.uses = Math.max(this.uses - consumption, 0);
      if (await this.destroyed()) {
        this.magicItem.destroyItemEntry(this.item);
      } else {
        this.showLeftChargesMessage();
      }
    }
  }
  async destroyed() {
    let destroyed = this.uses === 0 && this.magicItem.destroy;
    if (destroyed && this.magicItem.destroyCheck === "d2") {
      let r = new Roll("1d20");
      await r.evaluate();
      destroyed = r.total === 1;
      await r.toMessage({
        flavor: `<b>${this.name}</b> ${game.i18n.localize("MAGICITEMS.MagicItemDestroyCheck")}
            - ${destroyed ? game.i18n.localize("MAGICITEMS.MagicItemDestroyCheckFailure") : game.i18n.localize("MAGICITEMS.MagicItemDestroyCheckSuccess")}`,
        speaker: ChatMessage.getSpeaker({ actor: this.magicItem.actor, token: this.magicItem.actor.token })
      });
    } else if (destroyed && this.magicItem.destroyCheck === "d3") {
      let r = new Roll("1d20");
      await r.evaluate();
      destroyed = r.total <= this.destroyDC;
      await r.toMessage({
        flavor: `<b>${this.name}</b> ${game.i18n.localize("MAGICITEMS.MagicItemDestroyCheck")}
                        - ${destroyed ? game.i18n.localize("MAGICITEMS.MagicItemDestroyCheckFailure") : game.i18n.localize("MAGICITEMS.MagicItemDestroyCheckSuccess")}`,
        speaker: ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token })
      });
    }
    if (destroyed) {
      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this.magicItem.actor }),
        content: this.magicItem.formatMessage(`<b>${this.name}</b> ${this.magicItem.destroyFlavorText}`)
      });
    }
    return destroyed;
  }
  showNoChargesMessage(callback) {
    const message = game.i18n.localize("MAGICITEMS.SheetNoChargesMessage");
    const title = game.i18n.localize("MAGICITEMS.SheetDialogTitle");
    let d = new Dialog({
      title,
      content: `<b>'${this.magicItem.name}'</b> - ${message} <b>'${this.item.name}'</b><br><br>`,
      buttons: {
        use: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("MAGICITEMS.SheetDialogUseAnyway"),
          callback: () => callback()
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("MAGICITEMS.SheetDialogClose"),
          callback: () => d.close()
        }
      },
      default: "close"
    });
    d.render(true);
  }
  activeEffectMessage(callback) {
    const message = game.i18n.localize("MAGICITEMS.ToggleActiveEffectDialogMessage");
    const title = game.i18n.localize("MAGICITEMS.ToggleActiveEffectDialogTitle");
    let x = new Dialog({
      title,
      content: `${message}<br><br>`,
      buttons: {
        use: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("MAGICITEMS.ToggleActiveEffectDialogYes"),
          callback: () => callback()
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("MAGICITEMS.ToggleActiveEffectDialogNo"),
          callback: () => x.close()
        }
      },
      default: "use"
    });
    x.render(true);
  }
  async askSummonningMessage(summonOptions) {
    let html = await renderTemplate(
      `modules/${CONSTANTS.MODULE_ID}/templates/magic-item-summon-dialog.hbs`,
      summonOptions
    );
    let dialog = await foundry.applications.api.DialogV2.prompt({
      window: {
        title: game.i18n.localize("MAGICITEMS.SummoningDialogTitle")
      },
      content: html,
      modal: true,
      rejectClose: false,
      ok: {
        label: game.i18n.localize("MAGICITEMS.SummoningDialogButton"),
        icon: "fas fa-wand-magic-sparkles",
        callback: (event, button, dialog2) => button.form.elements
      }
    });
    return dialog;
  }
  computeSaveDC(item) {
    const data = this.magicItem.actor.system;
    data.attributes.spelldc = data.attributes.spellcasting ? data.abilities[data.attributes.spellcasting].dc : 10;
    const save = item.system.save;
    if (save?.ability) {
      if (save.scaling === "spell")
        save.dc = data.attributes.spelldc;
      else if (save.scaling !== "flat")
        save.dc = data.abilities[save.scaling]?.dc ?? 10;
      const ability = CONFIG.DND5E.abilities[save.ability];
      item.labels.save = game.i18n.format("DND5E.SaveDC", { dc: save.dc || "", ability });
    }
  }
  async applyActiveEffects(item) {
    canvas.tokens.controlled?.forEach((token) => {
      if (!token) {
        Logger.warn("No token selected", true);
        return;
      }
      let actor = token.actor;
      item?.effects.toObject()?.forEach(async (effect) => {
        if (!game.user.isGM && !actor?.isOwner) {
          return;
        }
        const existingEffect = actor?.effects?.find((e) => e.origin === item.uuid);
        if (existingEffect) {
          existingEffect.update({ disabled: !existingEffect.disabled });
          return;
        }
        effect = foundry.utils.mergeObject(effect, {
          disabled: false,
          transfer: false,
          origin: item.uuid
        });
        const ae = await ActiveEffect.implementation.create(effect, { parent: actor });
        if (!ae) {
          Logger.warn(game.i18n.localize("MAGICITEMS.ToggleActiveEffectError"), true);
        }
      });
    });
  }
  showLeftChargesMessage() {
    if (game.settings.get(CONSTANTS.MODULE_ID, "showLeftChargesChatMessage")) {
      const charges = this.magicItem.chargesOnWholeItem ? this.magicItem.uses : this.uses;
      const maxCharges = parseInt("uses" in this.item ? this.item.uses : this.magicItem.charges);
      Logger.debug(`Charges: ${charges}, MaxCharges: ${maxCharges}`);
      if (charges !== 0) {
        ChatMessage.create({
          user: game.user_id,
          speaker: ChatMessage.getSpeaker({ actor: this.magicItem.actor, token: this.magicItem.actor.token }),
          content: game.i18n.format(game.i18n.localize("MAGICITEMS.ShowChargesMessage"), {
            name: this.magicItem.name,
            chargesLeft: charges,
            chargesMax: maxCharges
          })
        });
      }
    }
  }
};
__name(_AbstractOwnedMagicItemEntry, "AbstractOwnedMagicItemEntry");
let AbstractOwnedMagicItemEntry = _AbstractOwnedMagicItemEntry;
const _OwnedMagicItemFeat = class _OwnedMagicItemFeat extends AbstractOwnedMagicItemEntry {
  async roll() {
    let consumption = this.item.consumption;
    if (!this.ownedItem) {
      let data = await this.item.data();
      data = foundry.utils.mergeObject(data, {
        "system.uses": null
      });
      data = foundry.utils.mergeObject(data, {
        "flags.core": {
          sourceId: this.item.uuid
        }
      });
      const cls = CONFIG.Item.documentClass;
      this.ownedItem = new cls(data, { parent: this.magicItem.actor });
      this.ownedItem.prepareFinalAttributes();
    }
    let onUsage = this.item.effect === "e1" ? async () => {
      await this.consume(consumption);
    } : async () => {
      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this.magicItem.actor }),
        content: this.magicItem.formatMessage(
          `<b>${this.name}</b>: ${game.i18n.localize("MAGICITEMS.SheetConsumptionDestroyMessage")}`
        )
      });
      await this.magicItem.destroyItem();
    };
    let proceed = /* @__PURE__ */ __name(async () => {
      let feat = this.ownedItem;
      if (feat.effects?.size > 0 && !MagicItemHelpers.isMidiItemEffectWorkflowOn()) {
        feat = feat.clone({ effects: {} }, { keepId: true });
        feat.prepareFinalAttributes();
      }
      let chatData = await feat.use(
        {},
        {
          createMessage: true,
          configureDialog: false,
          flags: {
            "dnd5e.itemData": this.ownedItem.toJSON()
          }
        }
      );
      if (chatData) {
        await onUsage();
        if (!this.magicItem.isDestroyed) {
          this.magicItem.update();
        }
      }
      if (this.ownedItem.effects?.size > 0 && !MagicItemHelpers.isMidiItemEffectWorkflowOn()) {
        this.activeEffectMessage(async () => {
          await this.applyActiveEffects(this.ownedItem);
        });
      }
    }, "proceed");
    if (this.item.effect === "e2" || this.hasCharges(consumption)) {
      await proceed();
    } else {
      this.showNoChargesMessage(() => {
        proceed();
      });
    }
  }
};
__name(_OwnedMagicItemFeat, "OwnedMagicItemFeat");
let OwnedMagicItemFeat = _OwnedMagicItemFeat;
const _MagicItemUpcastDialog = class _MagicItemUpcastDialog extends Dialog {
  constructor(item, dialogData = {}, options = {}) {
    super(dialogData, options);
    this.options.classes = ["dnd5e", "dialog"];
    this.item = item;
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find(`select[name="level"]`).change((evt) => {
      let level = parseInt(evt.target.value);
      let consumption = this.item.consumptionAt(level);
      html.find(`input[name="consumption"]`).val(consumption);
    });
  }
  static async create(magicItem, item) {
    const html = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/magic-item-upcast-dialog.html`, item);
    return new Promise((resolve, reject) => {
      const dlg = new this(item, {
        title: `${magicItem.name} > ${item.name}: Spell Configuration`,
        content: html,
        buttons: {
          cast: {
            icon: '<i class="fas fa-magic"></i>',
            label: "Cast",
            callback: (html2) => resolve(new FormData(html2[0].querySelector("#spell-config-form")))
          }
        },
        default: "cast",
        close: reject
      });
      dlg.render(true);
    });
  }
};
__name(_MagicItemUpcastDialog, "MagicItemUpcastDialog");
let MagicItemUpcastDialog = _MagicItemUpcastDialog;
const _OwnedMagicItemSpell = class _OwnedMagicItemSpell extends AbstractOwnedMagicItemEntry {
  async roll() {
    let upcastLevel = this.item.level;
    let consumption = this.item.consumption;
    if (!this.ownedItem) {
      let data = await this.item.data();
      if (typeof data.system.save.scaling === "undefined") {
        data = foundry.utils.mergeObject(data, {
          "system.save.scaling": "spell"
        });
      }
      if (this.item.flatDc) {
        data = foundry.utils.mergeObject(data, {
          "system.save.scaling": "flat",
          "system.save.dc": this.item.dc
        });
      }
      if (data.system.actionType === "rsak" || data.system.actionType === "msak") {
        let attackBonusValue = this.item.atkBonus.toString();
        if (!this.item.checkAtkBonus) {
          attackBonusValue = this.magicItem.actor?.system?.attributes?.prof?.toString();
        }
        if (data.system.attack.bonus) {
          data.system.attack.bonus += `+ ${attackBonusValue}`;
        } else {
          data.system.attack.bonus = attackBonusValue;
        }
      }
      data = foundry.utils.mergeObject(data, {
        "system.preparation": { mode: "magicitems" }
      });
      data = foundry.utils.mergeObject(data, {
        "flags.core": {
          sourceId: this.item.uuid
        }
      });
      const cls = CONFIG.Item.documentClass;
      this.ownedItem = new cls(data, { parent: this.magicItem.actor });
      this.ownedItem.prepareFinalAttributes();
    }
    if (this.item.canUpcast()) {
      const spellFormData = await MagicItemUpcastDialog.create(this.magicItem, this.item);
      upcastLevel = parseInt(spellFormData.get("level"));
      consumption = parseInt(spellFormData.get("consumption"));
    }
    let proceed = /* @__PURE__ */ __name(async () => {
      let spell = this.ownedItem;
      let clonedOwnedItem = this.ownedItem;
      let itemUseConfiguration = {};
      if (MagicItemHelpers.canSummon() && (spell.system.summons?.creatureTypes?.length > 1 || spell.system.summons?.profiles?.length > 1)) {
        const sOptions = MagicItemHelpers.createSummoningOptions(spell);
        const summoningDialogResult = await this.askSummonningMessage(sOptions);
        if (summoningDialogResult) {
          foundry.utils.mergeObject(itemUseConfiguration, {
            createSummons: summoningDialogResult.createSummons?.value === "on",
            summonsProfile: summoningDialogResult.summonsProfile?.value,
            summonsOptions: {
              creatureType: summoningDialogResult.creatureType?.value,
              creatureSize: summoningDialogResult.creatureSize?.value
            }
          });
        } else {
          Logger.info(`The summoning dialog has been dismissed, not using the item.`);
          return;
        }
      }
      if (spell.system.level === 0 && !MagicItemHelpers.isLevelScalingSettingOn()) {
        spell = spell.clone({ "system.scaling": "none" }, { keepId: true });
        clonedOwnedItem = clonedOwnedItem.clone({ "system.scaling": "none" }, { keepId: true });
        spell.prepareFinalAttributes();
      }
      if (upcastLevel !== spell.system.level) {
        foundry.utils.mergeObject(itemUseConfiguration, {
          slotLevel: upcastLevel
        });
      }
      if (spell.effects?.size > 0 && !MagicItemHelpers.isMidiItemEffectWorkflowOn()) {
        spell = spell.clone({ effects: {} }, { keepId: true });
        spell.prepareFinalAttributes();
      }
      let chatData = await spell.use(itemUseConfiguration, {
        configureDialog: false,
        createMessage: true,
        flags: {
          "dnd5e.itemData": clonedOwnedItem
        }
      });
      if (chatData) {
        await this.consume(consumption);
        if (!this.magicItem.isDestroyed) {
          this.magicItem.update();
        }
      }
      if (this.ownedItem.effects?.size > 0 && !MagicItemHelpers.isMidiItemEffectWorkflowOn()) {
        this.activeEffectMessage(async () => {
          await this.applyActiveEffects(this.ownedItem);
        });
      }
    }, "proceed");
    if (this.hasCharges(consumption)) {
      await proceed();
    } else {
      this.showNoChargesMessage(async () => {
        await proceed();
      });
    }
  }
};
__name(_OwnedMagicItemSpell, "OwnedMagicItemSpell");
let OwnedMagicItemSpell = _OwnedMagicItemSpell;
const _OwnedMagicItemTable = class _OwnedMagicItemTable extends AbstractOwnedMagicItemEntry {
  async roll() {
    let item = this.item;
    let consumption = item.consumption;
    if (this.hasCharges(consumption)) {
      await item.roll(this.magicItem.actor);
      await this.consume(consumption);
    } else {
      this.showNoChargesMessage(() => {
        item.roll(this.magicItem.actor);
      });
    }
  }
};
__name(_OwnedMagicItemTable, "OwnedMagicItemTable");
let OwnedMagicItemTable = _OwnedMagicItemTable;
const _OwnedMagicItem = class _OwnedMagicItem extends MagicItem {
  constructor(item, actor, magicItemActor, flagsData) {
    super(flagsData);
    this.uuid = item.uuid;
    this.id = item.id;
    this.item = item;
    this.actor = actor;
    this.name = item.name;
    this.img = item.img;
    this.pack = item.pack;
    this.isDestroyed = false;
    this.uses = parseInt("uses" in flagsData ? flagsData.uses : this.charges);
    this.rechargeableLabel = this.rechargeable ? `(${game.i18n.localize("MAGICITEMS.SheetRecharge")}: ${this.rechargeText} ${MagicItemHelpers.localized(MAGICITEMS.rechargeUnits)[this.rechargeUnit]} )` : game.i18n.localize("MAGICITEMS.SheetNoRecharge");
    this.magicItemActor = magicItemActor;
    this.ownedEntries = this.spells.map((item2) => new OwnedMagicItemSpell(this, item2));
    this.ownedEntries = this.ownedEntries.concat(this.feats.map((item2) => new OwnedMagicItemFeat(this, item2)));
    this.ownedEntries = this.ownedEntries.concat(this.tables.map((table) => new OwnedMagicItemTable(this, table)));
    this.instrument();
  }
  /**
   *
   */
  instrument() {
    this.item.roll = this.itemRoll(this.item.roll, this);
  }
  /**
   * Tests if the owned magic items can visualize his powers.
   */
  get visible() {
    let identifiedOnly = game.settings.get(CONSTANTS.MODULE_ID, "identifiedOnly");
    return this.item?.type === "feat" || !identifiedOnly || this.item.system.identified;
  }
  /**
   * Tests if the owned magic items is active.
   */
  get active() {
    let active = true;
    if (this.equipped) {
      active = active && this.item.system.equipped;
    }
    if (this.attuned) {
      let isAttuned = this.item.system.attunement === 2 || this.item.system.attuned === true;
      active = active && isAttuned;
    }
    return active;
  }
  itemRoll(original, me) {
    return async function() {
      me.triggerTables();
      return await original.apply(me.item, arguments);
    };
  }
  isFull() {
    return this.uses === this.charges;
  }
  setUses(uses) {
    this.uses = uses;
  }
  async roll(itemId) {
    let ownedItem = this.ownedEntries.filter((entry) => entry.id === itemId)[0];
    await ownedItem.roll();
  }
  rollByName(itemName2) {
    let found = this.ownedEntries.filter((entry) => entry.name === itemName2);
    if (!found.length) {
      Logger.warn(game.i18n.localize("MAGICITEMS.WarnNoMagicItemSpell") + itemName2, true);
      return;
    }
    found[0].roll();
  }
  async destroyItem() {
    await this.magicItemActor.destroyItem(this);
  }
  async consume(consumption) {
    if (this.item.system.uses.value) {
      const usage = Math.max(this.item.system.uses.value - consumption, 0);
      var embeddedDocument = await RetrieveHelpers.getItemAsync(this.item);
      embeddedDocument.update({
        [CONSTANTS.CURRENT_CHARGES_PATH]: usage
      });
      this.uses = usage;
    } else if (this.uses) {
      if (!this.item.system.uses.autoDestroy) {
        if (await this.destroyed()) {
          if (this.destroyType === MAGICITEMS.DESTROY_JUST_DESTROY) {
            this.isDestroyed = true;
            await this.destroyItem();
          } else {
            this.toggleEnabled(false);
          }
        }
      }
    }
  }
  async destroyed() {
    let destroyed = this.uses === 0 && this.destroy;
    if (destroyed && this.destroyCheck === "d2") {
      let r = new Roll("1d20");
      await r.evaluate();
      destroyed = r.total === 1;
      await r.toMessage({
        flavor: `<b>${this.name}</b> ${game.i18n.localize("MAGICITEMS.MagicItemDestroyCheck")}
                        - ${destroyed ? game.i18n.localize("MAGICITEMS.MagicItemDestroyCheckFailure") : game.i18n.localize("MAGICITEMS.MagicItemDestroyCheckSuccess")}`,
        speaker: ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token })
      });
    } else if (destroyed && this.destroyCheck === "d3") {
      let r = new Roll("1d20");
      await r.evaluate();
      destroyed = r.total <= this.destroyDC;
      await r.toMessage({
        flavor: `<b>${this.name}</b> ${game.i18n.localize("MAGICITEMS.MagicItemDestroyCheck")}
                        - ${destroyed ? game.i18n.localize("MAGICITEMS.MagicItemDestroyCheckFailure") : game.i18n.localize("MAGICITEMS.MagicItemDestroyCheckSuccess")}`,
        speaker: ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token })
      });
    }
    if (destroyed) {
      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: this.formatMessage(`<b>${this.name}</b> ${this.destroyFlavorText}`)
      });
    }
    return destroyed;
  }
  async onShortRest() {
    if (this.rechargeable && this.rechargeUnit === MAGICITEMS.SHORT_REST || this.internal) {
      return await this.doRecharge();
    }
  }
  async onLongRest() {
    if (this.rechargeable && [MAGICITEMS.LONG_REST, MAGICITEMS.SHORT_REST].includes(this.rechargeUnit) || this.internal) {
      return await this.doRecharge();
    }
  }
  async onNewDay() {
    if (this.rechargeable && [MAGICITEMS.DAILY, MAGICITEMS.DAWN, MAGICITEMS.SUNSET].includes(this.rechargeUnit) || this.internal) {
      return await this.doRecharge();
    }
  }
  async doRecharge() {
    let amount = 0, updated = 0, msg = `<b>Magic Item:</b> ${this.rechargeableLabel}<br>`;
    let prefix = game.i18n.localize("MAGICITEMS.SheetRechargedBy");
    let postfix = game.i18n.localize("MAGICITEMS.SheetChargesLabel");
    if (!this.internal) {
      if (this.rechargeType === MAGICITEMS.NUMERIC_RECHARGE) {
        amount = parseInt(this.recharge);
        msg += `<b>${prefix}</b>: ${this.recharge} ${postfix}`;
      }
      if (this.rechargeType === MAGICITEMS.FORMULA_RECHARGE) {
        let r = new Roll(this.recharge);
        await r.evaluate();
        amount = r.total;
        msg += `<b>${prefix}</b>: ${r.result} = ${r.total} ${postfix}`;
      }
      if (this.rechargeType === MAGICITEMS.FORMULA_FULL) {
        msg += `<b>${game.i18n.localize("MAGICITEMS.RechargeTypeFullText")}</b>`;
      }
      if (this.chargesOnWholeItem) {
        if (this.isFull()) {
          return;
        }
        if (this.rechargeType === MAGICITEMS.FORMULA_FULL) {
          updated = this.charges;
        } else {
          updated = Math.min(this.uses + amount, parseInt(this.charges));
        }
        this.setUses(updated);
      } else {
        if (this.ownedEntries.filter((entry) => !entry.isFull()).length === 0) {
          return;
        }
        this.ownedEntries.forEach((entry) => {
          if (this.rechargeType === MAGICITEMS.FORMULA_FULL) {
            entry.uses = this.charges;
          } else {
            entry.uses = Math.min(entry.uses + amount, parseInt(this.charges));
          }
        });
      }
      ChatMessage.create({
        speaker: { actor: this.actor },
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        content: this.formatMessage(msg)
      });
    } else {
      this.setUses(this.item.system.uses.value);
    }
    this.update();
  }
  entryBy(itemId) {
    return this.ownedEntries.filter((entry) => entry.id === itemId)[0];
  }
  ownedItemBy(itemId) {
    return this.entryBy(itemId).ownedItem;
  }
  triggerTables() {
    this.triggeredTables.forEach((table) => table.roll());
  }
  destroyItemEntry(entry) {
    if (this.hasSpell(entry.id)) {
      this.removeSpell(this.spells.findIndex((spell) => spell.id === entry.id));
    }
  }
  update() {
    this.magicItemActor.suspendListening();
    this.item.update({
      flags: {
        [CONSTANTS.MODULE_ID]: this.serializeData()
      }
    }).then(() => {
      this.magicItemActor.resumeListening();
    });
  }
  getRechargeableLabel() {
    return `(${game.i18n.localize("MAGICITEMS.SheetRecharge")}: ${this.rechargeText} ${MagicItemHelpers.localized(MAGICITEMS.rechargeUnits)[this.rechargeUnit]} )`;
  }
  formatMessage(msg) {
    return `
            <div class="dnd5e chat-card item-card">
                <header class="card-header flexrow">
                    <img src="${this.img}" title="Palla di Fuoco" width="36" height="36" />
                    <h3 class="item-name">${this.name}</h3>
                </header>

                <div class="card-content">${msg}</div>
            </div>`;
  }
};
__name(_OwnedMagicItem, "OwnedMagicItem");
let OwnedMagicItem = _OwnedMagicItem;
const _MagicItemActor = class _MagicItemActor {
  /**
   * Create and register a new MagicItemActor.
   *
   * @param actor
   */
  static bind(actor) {
    MAGICITEMS.actors[actor.id] = new _MagicItemActor(actor);
  }
  /**
   * Get a registered MagicItemActor.
   *
   * @param actorId   id of the original actor.
   * @returns {*}     the MagicItemActor associated with the actor by actorId.
   */
  static get(actorId) {
    return MAGICITEMS.actors[actorId];
  }
  /**
   * ctor. Builds a new instance of a MagicItemActor
   *
   * @param actor
   */
  constructor(actor) {
    this.actor = actor;
    this.id = actor.id;
    this.listeners = [];
    this.destroyed = [];
    this.listening = true;
    this.instrument();
    this.buildItems();
  }
  /**
   * Add change listeners.
   *
   * @param listener
   */
  onChange(listener) {
    this.listeners.push(listener);
  }
  /**
   * Notify listeners of changes.
   */
  async fireChange() {
    this.listeners.forEach(async (listener) => listener());
  }
  /**
   * Apply the aspects on the necessary actor pointcuts.
   */
  instrument() {
    this.actor.getOwnedItem = this.getOwnedItem(this.actor.getOwnedItem, this);
    this.actor.shortRest = this.shortRest(this.actor.shortRest, this);
    this.actor.longRest = this.longRest(this.actor.longRest, this);
  }
  /**
   *
   * @param original
   * @param me
   * @returns {function(*=): *}
   */
  getOwnedItem(original, me) {
    return function(id) {
      let found = null;
      me.items.concat(me.destroyed).forEach((item) => {
        if (item.hasSpell(id) || item.hasFeat(id)) {
          found = item.ownedItemBy(id);
        }
      });
      return found ? found : original.apply(me.actor, arguments);
    };
  }
  /**
   *
   * @param original
   * @param me
   * @returns {function(): *}
   */
  shortRest(original, me) {
    return async function() {
      let result = await original.apply(me.actor, arguments);
      await me.onShortRest(result);
      return result;
    };
  }
  /**
   *
   * @param original
   * @param me
   * @returns {function(): *}
   */
  longRest(original, me) {
    return async function() {
      let result = await original.apply(me.actor, arguments);
      await me.onLongRest(result);
      return result;
    };
  }
  /**
   * Temporarily suspends the interception of events, used for example to avoid intercepting a change
   * made by the client itself.
   */
  suspendListening() {
    this.listening = false;
  }
  /**
   * Resume a temporarily suspended interception of events.
   */
  resumeListening() {
    this.listening = true;
  }
  /**
   * Build the list of magic items based on custom flag data of the item entity.
   */
  async buildItems() {
    this.items = this.actor.items.filter((item) => {
      const flagsData = foundry.utils.getProperty(item, `flags.${CONSTANTS.MODULE_ID}`);
      return typeof flagsData !== "undefined" && flagsData.enabled;
    }).map((item) => {
      const flagsData = foundry.utils.getProperty(item, `flags.${CONSTANTS.MODULE_ID}`);
      return new OwnedMagicItem(item, this.actor, this, flagsData);
    });
    await this.fireChange();
  }
  /**
   * Aspect: called after short rest.
   * Notify the item and update item uses on the actor flags if recharged.
   *
   * @param result
   */
  async onShortRest(result) {
    if (result) {
      this.items.forEach(async (item) => {
        await item.onShortRest();
        if (result.newDay)
          item.onNewDay();
      });
      this.fireChange();
    }
  }
  /**
   * Aspect: called after long rest.
   * Notify the item and update item uses on the actor flags if recharged.
   *
   * @param result
   */
  async onLongRest(result) {
    if (result) {
      this.items.forEach(async (item) => {
        await item.onLongRest();
        if (result.newDay)
          item.onNewDay();
      });
      this.fireChange();
    }
  }
  /**
   *
   * @returns {*}
   */
  get visibleItems() {
    return this.items.filter((item) => item.visible);
  }
  /**
   *
   */
  get isUsingNew5eSheet() {
    return this.actor?.sheet && MagicItemHelpers.isUsingNew5eSheet(this.actor?.sheet);
  }
  /**
   *
   * @returns {boolean}
   */
  hasMagicItems() {
    return this.hasVisibleItems;
  }
  /**
   *
   */
  get hasVisibleItems() {
    return this.items.reduce((visible, item) => visible || item.visible, false);
  }
  /**
   * Returns the number of visible magic items owned by the actor.
   */
  get magicItemsCount() {
    return this.visibleItems.length;
  }
  /**
   * returns the number of visible actives magic items owned by the actor.
   */
  get magicItemsActiveCount() {
    return this.visibleItems.reduce((actives, item) => actives + item.active, 0);
  }
  /**
   *
   * @returns {boolean}
   */
  hasItemsSpells() {
    return this.visibleItems.reduce((hasSpells, item) => hasSpells || item.hasSpells, false);
  }
  /**
   *
   * @returns {boolean}
   */
  hasItemsFeats() {
    return this.visibleItems.reduce((hasFeats, item) => hasFeats || item.hasFeats, false);
  }
  /**
   *
   * @param itemId
   * @returns {number}
   */
  magicItem(itemId) {
    let found = this.items.filter((item) => item.id === itemId);
    if (found.length) {
      return found[0];
    }
  }
  /**
   *
   * @param magicItemName
   * @param itemName
   */
  rollByName(magicItemName, itemName2) {
    let found = this.items.filter((item2) => item2.name === magicItemName);
    if (!found.length) {
      Logger.warn(game.i18n.localize("MAGICITEMS.WarnNoMagicItem") + itemName2, true);
      return;
    }
    let item = found[0];
    item.rollByName(itemName2);
  }
  /**
   *
   * @param magicItemId
   * @param itemId
   */
  async roll(magicItemId, itemId) {
    let found = this.items.filter((item) => item.id === magicItemId);
    if (found.length) {
      let item = found[0];
      await item.roll(itemId);
    }
  }
  /**
   *
   * @param itemId
   * @param ownedItemId
   */
  async renderSheet(itemId, ownedItemId) {
    let item = this.items.find((item2) => {
      return item2.id === itemId || item2.uuid === itemId;
    });
    if (item) {
      item.renderSheet(ownedItemId);
    }
  }
  /**
   * Delete the magic item from the owned items of the actor,
   * keeping a temporary reference in case of open chat sheets.
   *
   * @param item
   */
  async destroyItem(item) {
    const magicItemParent = item.item;
    const currentQuantity = foundry.utils.getProperty(magicItemParent, CONSTANTS.QUANTITY_PROPERTY_PATH) || 1;
    if (currentQuantity > 1) {
      const defaultReference = foundry.utils.getProperty(
        magicItemParent,
        `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.DEFAULT}`
      );
      let updateItem = {};
      if (defaultReference) {
        const defaultItem = await RetrieveHelpers.getItemAsync(defaultReference);
        const defaultDataFlags = foundry.utils.getProperty(defaultItem, `flags.${CONSTANTS.MODULE_ID}`);
        defaultDataFlags.default = defaultItem.uuid;
        updateItem = {
          _id: magicItemParent.id,
          [CONSTANTS.QUANTITY_PROPERTY_PATH]: currentQuantity - 1,
          flags: {
            [CONSTANTS.MODULE_ID]: defaultDataFlags || {}
          }
        };
      } else {
        const tmpItem = await RetrieveHelpers.getItemAsync(magicItemParent);
        const tmpItemFlags = foundry.utils.getProperty(tmpItem, `flags.${CONSTANTS.MODULE_ID}`);
        updateItem = {
          _id: tmpItem.id,
          [CONSTANTS.QUANTITY_PROPERTY_PATH]: currentQuantity - 1,
          flags: {
            [CONSTANTS.MODULE_ID]: tmpItemFlags || {}
          }
        };
      }
      await this.actor.updateEmbeddedDocuments("Item", [updateItem]);
    } else {
      let idx = 0;
      this.items.forEach((owned, i) => {
        if (owned.id === item.id) {
          idx = i;
        }
      });
      this.items.splice(idx, 1);
      this.destroyed.push(item);
      await this.actor.deleteEmbeddedDocuments("Item", [magicItemParent.id]);
    }
  }
};
__name(_MagicItemActor, "MagicItemActor");
let MagicItemActor = _MagicItemActor;
const magicItemSheets = [];
const _MagicItemSheet = class _MagicItemSheet {
  /**
   * Crete and register an instance of a MagicItemSheet, if not already present,
   * bindings with the corresponding MagiItemActor and reinitialize with the new rendered html.
   *
   * @param app
   * @param html
   * @param data
   */
  static bind(app, html, data) {
    if (MagicItemActor.get(app.actor.id)) {
      let sheet = magicItemSheets[app.id];
      if (!sheet) {
        sheet = new _MagicItemSheet(app.actor.id);
        magicItemSheets[app.id] = sheet;
      }
      sheet.init(html, data);
    }
  }
  /**
   * Ctor. builds a new MagicItemSheet with the required actorId.
   *
   * @param actorId
   */
  constructor(actorId) {
    this.actor = MagicItemActor.get(actorId);
    this.actor.onChange(() => this.render());
  }
  /**
   * Set the rendered html from the original sheet and render if the actor has magic items.
   *
   * @param html
   * @param data
   */
  init(html, data) {
    this.html = html;
    this.data = data;
    if (this.actor.hasMagicItems()) {
      this.render();
    }
  }
  /**
   * Render the sheet
   * @returns {Promise<void>}
   */
  async render() {
    if (!this.actor?.isUsingNew5eSheet) {
      if (this.actor.hasItemsFeats()) {
        await this.renderTemplate(
          "magic-item-feat-sheet.html",
          "magicitems-feats-content",
          "features",
          "inventory-list"
        );
      }
      if (this.actor.hasItemsSpells()) {
        await this.renderTemplate(
          "magic-item-spell-sheet.html",
          "magicitems-spells-content",
          "spellbook",
          "inventory-list"
        );
      }
    } else {
      if (this.actor.hasItemsFeats()) {
        await this.renderTemplate(
          "magic-item-feat-sheet-v2.hbs",
          "magicitems-feats-content",
          "features",
          "features-list"
        );
        this.html.find(".item-tooltip").each((idx, el) => this.addToolTips(el));
      }
      if (this.actor.hasItemsSpells()) {
        await this.renderTemplate(
          "magic-item-spell-sheet-v2.hbs",
          "magicitems-spells-content",
          "spells",
          "spells-list"
        );
        this.html.find(".item-tooltip").each((idx, el) => this.addToolTips(el));
      }
    }
    this.actor.items.filter((item) => item.visible).forEach((item) => {
      let itemEl = this.html.find(`.inventory-list .item-list .item[data-item-id="${item.id}"]`);
      let itemName2 = this.actor.isUsingNew5eSheet ? itemEl.find(".name .subtitle") : itemEl.find("h4");
      if (!itemName2.find("i.fa-magic").length) {
        itemName2.append(CONSTANTS.HTML.MAGIC_ITEM_ICON);
      }
    });
    _MagicItemSheet.handleEvents(this.html, this.actor);
  }
  /**
   * Utility functions, render or replace the template by name in the passed tab.
   *
   * @param filename
   * @param cls
   * @param tab
   * @returns {Promise<void>}
   */
  async renderTemplate(filename, cls, tab, listName) {
    let template = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/${filename}`, this.actor);
    let el = this.html.find(`.${cls}`);
    if (el.length) {
      el.replaceWith(template);
    } else {
      if (game.settings.get(CONSTANTS.MODULE_ID, "optionDisplayMainSheetItems") === CONSTANTS.DISPLAY_OPTIONS.BOTTOM) {
        this.html.find(`.${tab} .${listName}`).append(template);
      } else if (game.settings.get(CONSTANTS.MODULE_ID, "optionDisplayMainSheetItems") === CONSTANTS.DISPLAY_OPTIONS.TOP) {
        this.html.find(`.${tab} .${listName}`).prepend(template);
      }
    }
  }
  /**
   * Adds spell tooltips to magic items on spells tab
   *
   * @param {*} element
   */
  addToolTips(element) {
    if ("tooltip" in element.dataset)
      return;
    const target = element.closest("[data-item-id], [data-uuid]");
    const uuid = target.dataset?.itemUuid;
    if (!uuid)
      return;
    element.dataset.tooltip = `
      <section class="loading" data-uuid="${uuid}"><i class="fas fa-spinner fa-spin-pulse"></i></section>
    `;
    element.dataset.tooltipClass = "dnd5e2 dnd5e-tooltip item-tooltip";
    element.dataset.tooltipDirection ??= "LEFT";
  }
  /**
   *
   */
  static handleEvents(html, actor) {
    if (!actor.isUsingNew5eSheet) {
      html.find(".item div.magic-item-image").click((evt) => _MagicItemSheet.onItemRoll(evt, actor));
      html.find(".item h4.spell-name").click((evt) => _MagicItemSheet.onItemShow(evt));
    } else {
      html.find(".item.magic-item .item-name").click((evt) => _MagicItemSheet.onItemRoll(evt, actor));
    }
    _MagicItemSheet.handleActorItemUsesChangeEvents(html, actor);
    _MagicItemSheet.handleMagicItemDragStart(html, actor);
  }
  static handleMagicItemDragStart(html, actor) {
    html.find(`li.item.magic-item`).each((i, li) => {
      li.addEventListener("dragstart", (evt) => _MagicItemSheet.onDragItemStart(evt, actor));
    });
  }
  static handleActorItemUsesChangeEvents(html, actor) {
    actor.items.forEach((item) => {
      html.find(`input[data-item-uses="magicitems.${item.id}.uses"]`).change((evt) => {
        item.setUses(MagicItemHelpers.numeric(evt.currentTarget.value, item.uses));
        item.update();
      });
      item.ownedEntries.forEach((entry) => {
        html.find(`input[data-item-uses="magicitems.${item.id}.${entry.id}.uses"]`).change((evt) => {
          entry.uses = MagicItemHelpers.numeric(evt.currentTarget.value, entry.uses);
          item.update();
        });
      });
    });
  }
  /**
   *
   * @param evt
   */
  static async onItemRoll(evt, actor) {
    evt.preventDefault();
    let dataset = evt.currentTarget.closest(".item").dataset;
    let magicItemId = dataset.magicItemId;
    let itemId = dataset.itemId;
    await actor.roll(magicItemId, itemId);
  }
  /**
   *
   * @param evt
   */
  static async onItemShow(evt) {
    evt.preventDefault();
    let dataset = evt.currentTarget.closest(".item").dataset;
    let itemId = dataset.itemId;
    let itemUuid = dataset.itemUuid;
    let itemPack = dataset.itemPack;
    let uuid = null;
    if (itemUuid) {
      uuid = itemUuid;
    } else {
      uuid = RetrieveHelpers.retrieveUuid({
        documentName: null,
        documentId: itemId,
        documentCollectionType: "Item",
        documentPack: itemPack
      });
    }
    const itemTmp = await fromUuid(uuid);
    if (itemTmp) {
      itemTmp.ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
      itemTmp.sheet.render(true);
    } else {
      Logger.error(`An item with UUID ${uuid} could not be found. Please verify.`);
    }
  }
  /**
   *
   * @param evt
   */
  static onDragItemStart(evt, actor) {
    const li = evt.currentTarget;
    let magicItemId = li.dataset.magicItemId;
    let itemId = li.dataset.itemId;
    let magicItem = actor.magicItem(magicItemId);
    let item = magicItem.entryBy(itemId);
    const dragData = {
      type: "MagicItem",
      name: `${magicItem.name} > ${item.name}`,
      img: item.img,
      magicItemName: magicItem.name,
      itemName: item.name
    };
    evt.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }
};
__name(_MagicItemSheet, "MagicItemSheet");
let MagicItemSheet = _MagicItemSheet;
const API = {
  /**
   * Method for create and register a new MagicItemActor.
   * @param {string/Actor/UUID} actor The actor to use for retrieve the Actor
   * @returns {Actor}
   */
  actor: async function(actor) {
    const actorTmp = await RetrieveHelpers.getActorAsync(actor);
    return MagicItemActor.get(actorTmp.id);
  },
  /**
   * Method for roll and show a chat message on the chat console
   * @param {string} magicItemName The name of the magic item to use
   * @param {string} innerChildMagicItemName The name of the inner child "magic item" to use
   * @returns {void} Return no response
   */
  roll: function(magicItemName, innerChildMagicItemName) {
    const ChatMessage5e = CONFIG.ChatMessage.documentClass;
    const speaker = ChatMessage5e.getSpeaker();
    let actor;
    if (speaker.token) {
      actor = game.actors.tokens[speaker.token];
    }
    if (!actor) {
      actor = game.actors.get(speaker.actor);
    }
    const magicItemActor = actor ? MagicItemActor.get(actor.id) : null;
    if (!magicItemActor) {
      Logger.warn(game.i18n.localize("MAGICITEMS.WarnNoActor"), true);
      return;
    }
    magicItemActor.rollByName(magicItemName, innerChildMagicItemName);
  },
  /**
   * Setup Magic item like you normally would by creating a spell called with all the damage details in the spell as detailed on the weapon.
   * Also checkes for Item Attunement and gives you a choice if you want to spend a charge or not.
   * @param {Item/string/UUID} item
   * @returns {void}
   */
  async magicItemAttack(item) {
    let itemD = await RetrieveHelpers.getItemAsync(item);
    if (!itemD) {
      Logger.warn(`magicItemAttack | No item found with this reference '${item}'`, true, item);
      return false;
    }
    if (game.user.targets.size !== 1) {
      Logger.warn("magicItemAttack | Please target only one token.", true);
      return false;
    }
    let spells = foundry.utils.getProperty(itemD, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.SPELLS}`) || [];
    if (spells.length === 0) {
      Logger.warn("magicItemAttack | Please put at least one spells on the item.", true);
      return false;
    }
    let attunement = itemD.system.attunement;
    let target = game.user.targets.first();
    if (target && attunement === 2) {
      new Dialog({
        title: `${itemD.name}`,
        content: `<p>Spend a charge?</p>`,
        buttons: {
          confirmed: {
            icon: "<i class='fas fa-bolt'></i>",
            label: "Yes",
            callback: async () => {
              await this.roll(itemD.name, spells[0].name);
            }
          }
        }
      }).render(true);
    }
  },
  /**
   * Setup Magic item like you normally would by creating a spell called with all the damage details in the spell as detailed on the weapon.
   * @param {Item/string/UUID} item
   * @returns {Promise<void>} No Response
   */
  async magicItemAttackFast(item) {
    let itemD = await RetrieveHelpers.getItemAsync(item);
    if (!itemD) {
      Logger.warn(`magicItemAttackFast | No item found with this reference '${item}'`, true, item);
      return false;
    }
    let spells = foundry.utils.getProperty(itemD, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.SPELLS}`) || [];
    if (spells.length === 0) {
      Logger.warn("magicItemAttackFast | Please put at least one spells on the item.", true);
      return false;
    }
    await this.roll(itemD.name, spells[0].name);
  },
  /**
   * Setup Magic item like you normally would by creating a spell called with all the damage details in the spell as detailed on the weapon.
   * @param {Item|string|UUID} item
   * @returns {Promise<void>} No Response
   */
  async magicItemMultipleSpellsTrinket(item) {
    let itemD = await RetrieveHelpers.getItemAsync(item);
    if (!itemD) {
      Logger.warn(`multipleSpellsTrinket | No item found with this reference '${item}'`, true, item);
      return false;
    }
    if (game.user.targets.size !== 1) {
      Logger.warn("multipleSpellsTrinket | Please target only one token.", true);
      return false;
    }
    let spellList = "";
    let spells = foundry.utils.getProperty(itemD, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.SPELLS}`) || [];
    if (spells.length === 0) {
      Logger.warn("multipleSpellsTrinket | Please put at least one spells on the item.", true);
      return false;
    }
    let spell_items = Object.values(spells).sort((a, b) => a.name < b.name ? -1 : 1);
    for (let i = 0; i < spell_items.length; i++) {
      let item2 = spell_items[i];
      spellList += `<option value="${item2.name}">${item2.name}</option>`;
    }
    const htmlContent = `<form>
            <p>Pick a spell to cast</p>
            <div class="form-group">
                <label for="weapons">Listed Spells</label>
                <select id="spells">${spellList}</select>
            </div>
        </form>`;
    new Dialog({
      title: `${itemD.name}`,
      content: htmlContent,
      buttons: {
        cast: {
          label: "Cast",
          callback: async (html) => {
            let get_spell = await html.find("#spells")[0].value;
            await this.roll(itemD.name, get_spell);
          }
        }
      }
    }).render(true);
  },
  /**
   * If there are multiple spells on said item, you can use this macro. Just enter the name of the item.
   * @param {Item|string|UUID} item
   * @param {boolean} runAsItemMacro Run as a item macro with the command `game.dnd5e.rollItemMacro(itemName)`
   * @returns {Promise<void>} No Response
   */
  async magicItemMultipleSpellsWeapon(item, runAsItemMacro) {
    let itemD = await RetrieveHelpers.getItemAsync(item);
    if (!itemD) {
      Logger.warn(`multipleSpellsWeapon | No item found with this reference '${item}'`, true, item);
      return false;
    }
    if (game.user.targets.size !== 1) {
      Logger.warn("multipleSpellsWeapon | Please target only one token.", true);
      return false;
    }
    let spellList = "";
    let spells = foundry.utils.getProperty(itemD, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.SPELLS}`) || [];
    let spell_items = Object.values(spells).sort((a, b) => a.name < b.name ? -1 : 1);
    for (let i = 0; i < spell_items.length; i++) {
      let item2 = spell_items[i];
      spellList += `<option value="${item2.name}">${item2.name}</option>`;
    }
    if (!runAsItemMacro) {
      const htmlContent = `<form>
            <p>Pick a spell to cast</p>
            <div class="form-group">
                <label for="weapons">Listed Spells</label>
                <select id="spells">${spellList}</select>
            </div>
        </form>`;
      new Dialog({
        title: `${itemD.name}`,
        content: htmlContent,
        buttons: {
          cast: {
            label: "Cast",
            callback: async (html) => {
              let get_spell = await html.find("#spells")[0].value;
              await this.roll(itemD.name, get_spell);
            }
          }
        }
      }).render(true);
    } else {
      game.dnd5e.rollItemMacro(itemName);
    }
  },
  /**
   * Method handling a short-rest action for magic items for an actor.
   * @param {string/Actor/UUID} actor The actor to use for retrieve the Actor
   * @param {Boolean} isNewDay Check whether it's a new day
   * @returns {Promise<void>} No response
   */
  async execActorShortRest(actor, isNewDay) {
    let actorTmp = await API.actor(actor);
    actorTmp.items.forEach(async (item) => {
      await item.onShortRest();
      if (isNewDay)
        await item.onNewDay();
    });
  },
  /**
   * Method handling a long-rest action for magic items for an actor.
   * @param {string/Actor/UUID} actor The actor to use for retrieve the Actor
   * @param {Boolean} isNewDay Check whether it's a new day
   * @returns {Promise<void>} No response
   */
  async execActorLongRest(actor, isNewDay) {
    let actorTmp = await API.actor(actor);
    actorTmp.items.forEach(async (item) => {
      await item.onLongRest();
      if (isNewDay)
        await item.onNewDay();
    });
  }
};
const MIGRATION = {
  /**
   * Utility method to migrate the scope flag from 'magic-items-2' to 'magicitems'
   * @returns {Promise<void>} No Response
   */
  async migrateScopeMagicItem() {
    if (game.user.isGM) {
      for (const a of game.actors) {
        Logger.info(`Update flagsScope on actor ${a.name}...`);
        const magicitems = a.items.filter((i) => !!i.flags["magic-items-2"]);
        if (magicitems?.length > 0) {
          for (const mi of magicitems) {
            Logger.info(`Update flagsScope on actor ${a.name} for item ${mi.name}...`);
            await this.updateFlagScopeMagicItem(mi);
            Logger.info(`Updated flagsScope on actor ${a.name} for item ${mi.name}`);
          }
          Logger.info(`Updated flagsScope on actor ${a.name}`);
        }
      }
    }
  },
  /**
   * Utility method to migrate the scope flag from 'magic-items-2' to 'magicitems'
   * @param {object} mi The flags property to check
   * @returns {Promise<void>} No Response
   */
  async updateFlagScopeMagicItem(mi) {
    const miFlag = foundry.utils.getProperty(mi, `flags.magic-items-2`);
    const miFlagNewScope = foundry.utils.getProperty(mi, `flags.${CONSTANTS.MODULE_ID}`);
    if (!isEmptyObject(miFlag) && isEmptyObject(miFlagNewScope)) {
      Logger.info(`Update flagsScope item ${mi.name}...`);
      if (miFlag.spells?.length > 0) {
        Object.entries(miFlag.spells).forEach(([key, value]) => {
          if (!value.uuid && value.id) {
            value.uuid = `Item.${value.id}`;
          }
        });
      }
      if (miFlag.feats?.length > 0) {
        Object.entries(miFlag.feats).forEach(([key, value]) => {
          if (!value.uuid && value.id) {
            value.uuid = `Item.${value.id}`;
          }
        });
      }
      await mi.update({
        flags: {
          [CONSTANTS.MODULE_ID]: miFlag
        }
      });
      Logger.info(`Updated flagsScope item ${mi.name}`);
    }
  },
  /**
   * Method to migrate compendiumpack to use another flag
   * @param {string} compendiumName the name of the pack, gotten from the `game.packs` property
   * @returns {Promise<void>} No Response
   */
  async updateScopePerCompendiumPack(compendiumName) {
    if (game.user.isGM) {
      const previousPackageName = "magic-items-2";
      if (game.packs.get(`${compendiumName}`) !== void 0) {
        await game.packs.get(`${compendiumName}`).updateAll((pack2) => ({
          flags: {
            [CONSTANTS.MODULE_ID]: pack2.flags[`${previousPackageName}`]
          }
        }));
        Logger.info(`Updated flagsScope for compendium ${compendiumName}`);
      } else {
        Logger.warn(`Pack ${compendiumName} has not been found - no migration applied`);
      }
    }
  },
  /**
   * Update all actor magicitems item flags
   */
  async updatMagicItemsOnAllActors() {
    if (game.user.isGM) {
      Logger.info(`Updating Magic Items information on all actors`);
      for (const actor of game.actors) {
        Logger.info(`Updating Magic Items on actor ${actor.name}`);
        const miFlag = actor.items.filter((i) => !!i.flags[CONSTANTS.MODULE_ID]);
        if (miFlag?.length > 0) {
          for (const item of miFlag) {
            await MagicItemHelpers.updateMagicItemFlagOnItem(item);
          }
        }
      }
    }
  },
  /**
   * Method that updates all compendium items with new Magic Item flags.
   * @param {*} compendiumName compendium name fetched from game.packs
   */
  async updateMagicItemsOnAllCompendiumItems(compendiumName) {
    if (game.user.isGM) {
      Logger.info(`Updating all items from compendium '${compendiumName}' with new flags`);
      const compendiumItems = await game.packs.get(compendiumName)?.getDocuments();
      if (!isEmptyObject(compendiumItems)) {
        const miFlag = compendiumItems.filter((i) => !!i.flags[CONSTANTS.MODULE_ID]);
        if (miFlag?.length > 0) {
          for (const item of miFlag) {
            Logger.debug(`${JSON.stringify(item)}`);
            Logger.info(`Updating components on item ${item.name}`);
            await MagicItemHelpers.updateMagicItemFlagOnItem(item);
          }
        }
      }
    }
  }
};
Handlebars.registerHelper("enabled", function(value, options) {
  return Boolean(value) ? "" : "disabled";
});
Handlebars.registerHelper("formatString", function(toFormat, variables = {}) {
  return game.i18n.format(toFormat, variables);
});
Handlebars.registerHelper("object", function({ hash }) {
  return hash;
});
Hooks.once("init", () => {
  game.settings.register(CONSTANTS.MODULE_ID, "identifiedOnly", {
    name: "MAGICITEMS.SettingIdentifiedOnly",
    hint: "MAGICITEMS.SettingIdentifiedOnlyHint",
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "hideFromPlayers", {
    name: "MAGICITEMS.SettingHideFromPlayers",
    hint: "MAGICITEMS.SettingHideFromPlayersHint",
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "debug", {
    name: "MAGICITEMS.SettingDebug",
    hint: "MAGICITEMS.SettingDebugHint",
    scope: "client",
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "welcomeMessage", {
    name: "welcomeMessage",
    scope: "world",
    type: Boolean,
    default: true,
    config: false
  });
  game.settings.register(CONSTANTS.MODULE_ID, "scaleSpellDamage", {
    name: "MAGICITEMS.SettingScaleSpellDamage",
    hint: "MAGICITEMS.SettingScaleSpellDamageHint",
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "showLeftChargesChatMessage", {
    name: "MAGICITEMS.SettingShowLeftChargesInChat",
    hint: "MAGICITEMS.SettingShowLeftChargesInChatHint",
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "optionDisplayMainSheetItems", {
    name: "MAGICITEMS.SettingDisplayMainSheetItem",
    hint: "MAGICITEMS.SettingDisplayMainSheetItemHint",
    scope: "client",
    type: Number,
    default: CONSTANTS.DISPLAY_OPTIONS.BOTTOM,
    requiresReload: true,
    choices: {
      0: "MAGICITEMS.SettingDisplayMainSheetItemBottom",
      1: "MAGICITEMS.SettingDisplayMainSheetItemTop"
    },
    config: true
  });
  if (typeof Babele !== "undefined") {
    game.babele.register({
      module: CONSTANTS.MODULE_ID,
      lang: "en",
      dir: "languages/packs/en"
    });
    game.babele.register({
      module: CONSTANTS.MODULE_ID,
      lang: "it",
      dir: "languages/packs/it"
    });
    game.babele.register({
      module: CONSTANTS.MODULE_ID,
      lang: "pl",
      dir: "languages/packs/pl"
    });
  }
});
Hooks.once("setup", async () => {
  game.modules.get(CONSTANTS.MODULE_ID).api = API;
  window.MagicItems = game.modules.get(CONSTANTS.MODULE_ID).api;
  game.modules.get(CONSTANTS.MODULE_ID).migration = MIGRATION;
});
Hooks.once("ready", async () => {
  Array.from(game.actors).filter((actor) => actor.permission >= 1).forEach((actor) => {
    MagicItemActor.bind(actor);
  });
  if (game.user.isGM && !game.settings.get(CONSTANTS.MODULE_ID, "welcomeMessage")) {
    const message = "Hello everyone!<br><br>This is the first version of Magic Items module that has been transferred from Magic Items 2, therefore it requires a migration of items.<br><br>For manual information about migrations, please consult the latest release changelog.<br><br>Thank you for your continuing support, and I hope you will enjoy this module!<br><br>If you want, please go ahead and check out the discord community created for this module on Foundry Module listing or Github project.";
    const title = "Magic Items";
    let d = new Dialog({
      title,
      content: `${message}<br><br>`,
      buttons: {
        use: {
          icon: '<i class="fas fa-check"></i>',
          label: "Do the automatic migration.",
          callback: () => {
            MIGRATION.migrateScopeMagicItem();
            game.settings.set(CONSTANTS.MODULE_ID, "welcomeMessage", true);
          }
        },
        closeAndChangeSetting: {
          icon: '<i class="fas fa-times"></i>',
          label: "I will do the migration on my own - do not show this window again.",
          callback: () => {
            game.settings.set(CONSTANTS.MODULE_ID, "welcomeMessage", true);
            d.close();
          }
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("MAGICITEMS.SheetDialogClose"),
          callback: () => d.close()
        }
      },
      default: "use"
    });
    d.render(true);
  }
});
Hooks.once("createActor", (actor) => {
  if (actor.permission >= 2) {
    MagicItemActor.bind(actor);
  }
});
Hooks.once("createToken", (token) => {
  const actor = token.actor;
  if (actor.permission >= 2) {
    MagicItemActor.bind(actor);
  }
});
let tidyApi;
Hooks.once("tidy5e-sheet.ready", (api) => {
  tidyApi = api;
  const magicItemsTab = new api.models.HandlebarsTab({
    title: "Magic Item",
    tabId: "magicitems",
    path: "/modules/magicitems/templates/magic-item-tab.hbs",
    enabled: (data) => {
      return MagicItemTab.isAcceptedItemType(data.item) && MagicItemTab.isAllowedToShow();
    },
    getData(data) {
      const flagsData = foundry.utils.getProperty(data.item, `flags.${CONSTANTS.MODULE_ID}`);
      return new MagicItem(flagsData);
    },
    onRender(params) {
      const html = $(params.element);
      if (params.data.editable) {
        const flagsData = foundry.utils.getProperty(params.data.item, `flags.${CONSTANTS.MODULE_ID}`);
        const magicItem = new MagicItem(flagsData);
        MagicItemTab.activateTabContentsListeners({
          html,
          item: params.data.item,
          magicItem
        });
        params.element.querySelector(`.magicitems-content`).addEventListener("drop", (event) => {
          MagicItemTab.onDrop({ event, item: params.data.item, magicItem });
        });
      } else {
        MagicItemTab.disableMagicItemTabInputs(html);
      }
    }
  });
  api.registerItemTab(magicItemsTab);
  api.registerActorContent(
    new api.models.HandlebarsContent({
      path: `modules/${CONSTANTS.MODULE_ID}/templates/magic-item-spell-sheet.html`,
      injectParams: {
        position: "afterbegin",
        selector: `[data-tab-contents-for="${api.constants.TAB_ID_CHARACTER_SPELLBOOK}"] .scroll-container`
      },
      enabled(data) {
        const magicItemActor = MagicItemActor.get(data.actor.id);
        if (!magicItemActor) {
          return false;
        }
        magicItemActor.buildItems();
        return ["character", "npc"].includes(data.actor.type) && magicItemActor.hasItemsSpells();
      },
      getData(data) {
        return MagicItemActor.get(data.actor.id);
      }
    })
  );
  const npcAbilitiesTabContainerSelector = `[data-tidy-sheet-part="${api.constants.SHEET_PARTS.NPC_ABILITIES_CONTAINER}"]`;
  const characterFeaturesContainerSelector = `[data-tab-contents-for="${api.constants.TAB_ID_CHARACTER_FEATURES}"] [data-tidy-sheet-part="${api.constants.SHEET_PARTS.ITEMS_CONTAINER}"]`;
  const magicItemFeatureTargetSelector = [npcAbilitiesTabContainerSelector, characterFeaturesContainerSelector].join(
    ", "
  );
  api.registerActorContent(
    new api.models.HandlebarsContent({
      path: `modules/${CONSTANTS.MODULE_ID}/templates/magic-item-feat-sheet.html`,
      injectParams: {
        position: "afterbegin",
        selector: magicItemFeatureTargetSelector
      },
      enabled(data) {
        const magicItemActor = MagicItemActor.get(data.actor.id);
        if (!magicItemActor) {
          return false;
        }
        magicItemActor.buildItems();
        return ["character", "npc"].includes(data.actor.type) && magicItemActor.hasItemsFeats();
      },
      getData(data) {
        return MagicItemActor.get(data.actor.id);
      }
    })
  );
});
Hooks.on("tidy5e-sheet.renderActorSheet", (app, element, data) => {
  const magicItemActor = MagicItemActor.get(data.actor.id);
  const html = $(element);
  if (!magicItemActor) {
    return;
  }
  magicItemActor.items.filter((item) => item.visible).forEach((item) => {
    let itemEl = html.find(
      `[data-tidy-sheet-part="${tidyApi.constants.SHEET_PARTS.ITEM_TABLE_ROW}"][data-item-id="${item.id}"]`
    );
    let itemNameContainer = itemEl.find(`[data-tidy-sheet-part=${tidyApi.constants.SHEET_PARTS.ITEM_NAME}]`);
    let iconHtml = tidyApi.useHandlebarsRendering(CONSTANTS.HTML.MAGIC_ITEM_ICON);
    itemNameContainer.append(iconHtml);
  });
  MagicItemSheet.handleEvents(html, magicItemActor);
});
Hooks.on(`renderItemSheet5e`, (app, html, data) => {
  if (tidyApi?.isTidy5eItemSheet(app)) {
    return;
  }
  if (!MagicItemTab.isAllowedToShow()) {
    return;
  }
  MagicItemTab.bind(app, html, data);
});
Hooks.on(`renderActorSheet5eCharacter`, (app, html, data) => {
  if (tidyApi?.isTidy5eCharacterSheet(app)) {
    return;
  }
  MagicItemSheet.bind(app, html, data);
});
Hooks.on(`renderActorSheet5eNPC`, (app, html, data) => {
  if (tidyApi?.isTidy5eNpcSheet(app)) {
    return;
  }
  MagicItemSheet.bind(app, html, data);
});
Hooks.on("hotbarDrop", async (bar, data, slot) => {
  if (data.type !== "MagicItem") {
    return;
  }
  const command = `MagicItems.roll("${data.magicItemName}","${data.itemName}");`;
  let macro = game.macros.find((m) => m.name === data.name && m.command === command);
  if (!macro) {
    macro = await Macro.create(
      {
        name: data.name,
        type: "script",
        img: data.img,
        command,
        flags: { "dnd5e.itemMacro": true }
      },
      { displaySheet: false }
    );
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
});
Hooks.on("createItem", async (item, options, userId) => {
  if (item.actor) {
    const actor = item.actor;
    const miActor = MagicItemActor.get(actor.id);
    if (miActor && miActor.listening && miActor.actor.id === actor.id) {
      await MIGRATION.updateFlagScopeMagicItem(item);
      await miActor.buildItems();
    }
  }
});
Hooks.on("updateItem", async (item, change, options, userId) => {
  if (item.actor) {
    const actor = item.actor;
    const miActor = MagicItemActor.get(actor.id);
    if (miActor && item.flags.magicitems?.internal) {
      const miItem = miActor.magicItem(item.id);
      if (miItem) {
        await miItem.updateInternalCharges(item.flags.magicitems?.internal, item);
        miItem.rechargeableLabel = miItem.getRechargeableLabel();
        miItem.update();
      }
    }
    if (miActor && miActor.listening && miActor.actor.id === actor.id) {
      setTimeout(miActor.buildItems.bind(miActor), 500);
    }
  }
});
Hooks.on("deleteItem", async (item, options, userId) => {
  if (item.actor) {
    const actor = item.actor;
    const miActor = MagicItemActor.get(actor.id);
    if (miActor && miActor.listening && miActor.actor.id === actor.id) {
      await miActor.buildItems();
    }
  }
});
Hooks.on("preCreateItem", async (item, data, options, userId) => {
  const actorEntity = item.actor;
  if (!actorEntity) {
    return;
  }
});
Hooks.on("preUpdateItem", async (item, changes, options, userId) => {
  const actorEntity = item.actor;
  if (!actorEntity) {
    return;
  }
});
Hooks.on("preDeleteItem", async (item, options, userId) => {
  const actorEntity = item.actor;
  if (!actorEntity) {
    return;
  }
});
//# sourceMappingURL=module.js.map
