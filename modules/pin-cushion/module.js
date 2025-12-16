var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const CONSTANTS = {
  MODULE_ID: "pin-cushion",
  PATH: `modules/pin-cushion/`,
  MODULE_TITLE: "Pin Cushion",
  PATH_TRANSPARENT: `modules/pin-cushion/assets/transparent.png`,
  PATH_PDF_THUMBNAIL: `modules/pin-cushion/assets/file-pdf-solid.svg`,
  FLAGS: {
    USE_PIN_REVEALED: "usePinIsRevealed",
    PIN_IS_REVEALED: "pinIsRevealed",
    PIN_GM_TEXT: "gmNote",
    HAS_BACKGROUND: "hasBackground",
    RATIO_WIDTH: "ratio",
    TEXT_ALWAYS_VISIBLE: "textAlwaysVisible",
    PLAYER_ICON_STATE: "PlayerIconState",
    PLAYER_ICON_PATH: "PlayerIconPath",
    CUSHION_ICON: "cushionIcon",
    SHOW_IMAGE: "showImage",
    SHOW_IMAGE_EXPLICIT_SOURCE: "showImageExplicitSource",
    HIDE_LABEL: "hideLabel",
    DO_NOT_SHOW_JOURNAL_PREVIEW: "doNotShowJournalPreview",
    TOOLTIP_PLACEMENT: "tooltipPlacement",
    TOOLTIP_COLOR: "tooltipColor",
    TOOLTIP_FORCE_REMOVE: "tooltipForceRemove",
    TOOLTIP_SMART_PLACEMENT: "tooltipSmartPlacement",
    TOOLTIP_FOLLOW_MOUSE: "tooltipFollowMouse",
    PREVIEW_AS_TEXT_SNIPPET: "previewAsTextSnippet",
    ABOVE_FOG: "aboveFog",
    SHOW_ONLY_TO_GM: "showOnlyToGM",
    PIN_IS_TRANSPARENT: "pinIsTransparent",
    JAL_ANCHOR: "anchor",
    NUMBER_WS_SUFFIX_ON_NAMEPLATE: "numberWsSuffixOnNameplate",
    NUMBER_HS_SUFFIX_ON_NAMEPLATE: "numberHsSuffixOnNameplate",
    TOOLTIP_CUSTOM_DESCRIPTION: "tooltipCustomDescription",
    TOOLTIP_SHOW_DESCRIPTION: "tooltipShowDescription",
    TOOLTIP_SHOW_TITLE: "tooltipShowTitle",
    // Added from player pin defaults
    PLAYER_PIN_DEFAULTS_ORIGINAL_TEXT: "playerPinDefaultsOriginalText",
    PLAYER_PIN_DEFAULTS_IS_DEFAULTED: "playerPinDefaultsIsDefaulted",
    PLAYER_PIN_DEFAULTS_CHARACTER_NAME: "playerPinDefaultsCharacterName"
  }
};
CONSTANTS.PATH = `modules/${CONSTANTS.MODULE_ID}/`;
CONSTANTS.PATH_TRANSPARENT = `modules/${CONSTANTS.MODULE_ID}/assets/transparent.png`;
function isRealNumber(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}
__name(isRealNumber, "isRealNumber");
function stripQueryStringAndHashFromPath(url) {
  let myUrl = url;
  if (!myUrl) {
    return myUrl;
  }
  if (myUrl.includes("?")) {
    myUrl = myUrl.split("?")[0];
  }
  if (myUrl.includes("#")) {
    myUrl = myUrl.split("#")[0];
  }
  return myUrl;
}
__name(stripQueryStringAndHashFromPath, "stripQueryStringAndHashFromPath");
function isAlt() {
  const alts = /* @__PURE__ */ new Set(["Alt", "AltLeft"]);
  return game.keyboard?.downKeys.size === 1 && game.keyboard.downKeys.intersects(alts);
}
__name(isAlt, "isAlt");
function retrieveFirstImageFromJournalId(id, pageId, noDefault) {
  const journalEntry = game.journal.get(id);
  let firstImage = void 0;
  if (!journalEntry) {
    return firstImage;
  }
  if (journalEntry?.pages.size > 0) {
    const sortedArray = journalEntry.pages.contents.sort((a, b) => a.sort - b.sort);
    if (pageId) {
      const pageSelected = sortedArray.find((page) => page.id === pageId);
      if (pageSelected) {
        if (pageSelected.type === "image" && pageSelected.src) {
          firstImage = stripQueryStringAndHashFromPath(pageSelected.src);
        } else if (pageSelected.src) {
          firstImage = stripQueryStringAndHashFromPath(pageSelected.src);
        }
      }
    }
    if (!noDefault && !firstImage) {
      for (const pageEntry of sortedArray) {
        if (pageEntry.type === "image" && pageEntry.src) {
          firstImage = stripQueryStringAndHashFromPath(pageEntry.src);
          break;
        } else if (pageEntry.src && pageEntry.type === "pdf") {
          firstImage = stripQueryStringAndHashFromPath(pageEntry.src);
          break;
        } else if (pageEntry.src) {
          firstImage = stripQueryStringAndHashFromPath(pageEntry.src);
          break;
        }
      }
    }
  }
  return firstImage;
}
__name(retrieveFirstImageFromJournalId, "retrieveFirstImageFromJournalId");
function retrieveFirstTextFromJournalId(id, pageId, noDefault) {
  const journalEntry = game.journal.get(id);
  let firstText = void 0;
  if (!journalEntry) {
    return firstText;
  }
  if (journalEntry?.pages.size > 0) {
    const sortedArray = journalEntry.pages.contents.sort((a, b) => a.sort - b.sort);
    if (pageId) {
      const pageSelected = sortedArray.find((page) => page.id === pageId);
      if (pageSelected) {
        if (pageSelected.type === "text" && pageSelected.text?.content) {
          firstText = pageSelected.text?.content;
        } else if (pageSelected.text?.content) {
          firstText = pageSelected.text?.content;
        }
      }
    }
    if (!noDefault && !firstText) {
      for (const journalEntry2 of sortedArray) {
        if (journalEntry2.type === "text" && journalEntry2.text?.content) {
          firstText = journalEntry2.text?.content;
          break;
        } else if (journalEntry2.text?.content) {
          firstText = journalEntry2.text?.content;
          break;
        }
      }
    }
  }
  return firstText;
}
__name(retrieveFirstTextFromJournalId, "retrieveFirstTextFromJournalId");
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
const _ElementWrapper = class _ElementWrapper extends PIXI.DisplayObject {
  /**
   * Creates an instance of ElementWrapper.
   *
   * @param {Element} [container=null]
   */
  constructor(container, contentHTML, note) {
    super();
    this.children = [];
    this.style = {};
    this.note = note;
    this._contentHTML = contentHTML;
    this.container = container;
    container.style.position = "absolute";
    container.style.left = "0px";
    container.style.top = "0px";
    document.body.append(container);
    this._repositionHook = Hooks.on("canvasPan", () => this.updateTarget());
    this.prevID = -1;
    this._anchorX = 0;
    this._anchorY = 0;
    this.container.addEventListener("mouseover", () => {
      this.visible = true;
      this.container.addEventListener("mouseleave", () => this.visible = false);
    });
  }
  /**
   *
   * updateTarget
   *
   */
  updateTarget() {
    if (this.visible === false)
      return;
    const matrix = this.worldTransform;
    const bounds = this.bounds;
    this.toGlobal(new PIXI.Point(0, 0));
    const rightSide = matrix.tx < canvas.screenDimensions[0] / 2;
    const paddingX = (rightSide ? 1 : -1) * (bounds.width / 2 + 30);
    this.container.style.transform = `translate(${matrix.tx - bounds.width / 2 + paddingX}px, ${matrix.ty - bounds.height / 2}px)`;
  }
  /**
   *
   * render
   *
   */
  render() {
    if (this.prevID === this.transform._worldID || this.container === null) {
      return;
    }
    this.updateTarget();
    this.prevID = this.transform._worldID;
  }
  /**
   *
   * destroy
   *
   */
  destroy() {
    this.container.remove();
    Hooks.off("canvasPan", this._repositionHook);
    this.container = null;
    this.prevID = null;
    super.destroy();
  }
  /**
   *
   * bounds
   *
   * @readonly
   */
  get bounds() {
    return this.container.getBoundingClientRect();
  }
  /**
   *
   * anchorX
   *
   */
  get anchorX() {
    return this._anchorX;
  }
  /**
   *
   * anchorX
   *
   * @param {number} value
   */
  set anchorX(value) {
    this._anchorX = value;
    this.pivot.x = value * this.bounds.width;
  }
  /**
   *
   * anchorY
   *
   */
  get anchorY() {
    return this._anchorY;
  }
  /**
   *
   * anchorY
   *
   * @param {number} value
   */
  set anchorY(value) {
    this._anchorY = value;
    this.pivot.y = value * this.bounds.height;
  }
  /**
   *
   * anchorXY
   *
   * @param {number} value
   */
  set anchorXY(value) {
    this.anchorX = value;
    this.anchorY = value;
  }
  /**
   * visible
   *
   * @param {boolean} value
   */
  set visible(value) {
    if (!this.container) {
      return;
    }
    this.container.style.opacity = value ? "1" : "0";
    if (value === false) {
      this._fadeoutTimeout = setTimeout(() => {
        this.container.style.display = "none";
      }, 50);
    } else {
      this.container.innerHTML = "";
      this.container.innerHTML = this._contentHTML;
      this.container.style.display = "";
      clearTimeout(this._fadeoutTimeout);
    }
  }
  get visible() {
    if (!this.container) {
      return false;
    }
    return this.container.style.opacity !== "0";
  }
};
__name(_ElementWrapper, "ElementWrapper");
let ElementWrapper = _ElementWrapper;
ElementWrapper.prototype.renderWebGL = ElementWrapper.prototype.render;
ElementWrapper.prototype.renderCanvas = ElementWrapper.prototype.render;
const _PinCushionPixiHelpers = class _PinCushionPixiHelpers {
  static async drawTooltipPixi(note) {
    const journal = note.entry;
    let journalType = "";
    let pageType = "";
    if (journal) {
      journalType = _PinCushionPixiHelpers._retrieveJournalTypeFromJournal(journal);
      pageType = _PinCushionPixiHelpers._retrievePageTypeFromJournal(journal);
    }
    Logger.debug(`Journal type: ${journalType}`);
    Logger.debug(`Journal Page type: ${pageType}`);
    if (note.tooltip) {
      note.removeChild(note.tooltip);
      note.tooltip = void 0;
    }
    const wrappedEl = await _PinCushionPixiHelpers.wrapElement(note);
    return note.tooltip = note.addChild(wrappedEl);
  }
  static _retrievePageTypeFromJournal(journal) {
    let pageType = "";
    if (journal?.pages?.contents?.length > 0) {
      const journalPage0 = journal?.pages.contents[0];
      if (foundry.utils.getProperty(journalPage0, `flags.monks-enhanced-journal.type`)) {
        pageType = foundry.utils.getProperty(journalPage0, `flags.monks-enhanced-journal.type`);
      } else {
        pageType = journalPage0.type;
      }
    }
    return pageType;
  }
  static _retrieveJournalTypeFromJournal(journal) {
    let journalType = "";
    if (foundry.utils.getProperty(journal, `flags.monks-enhanced-journal.pagetype`)) {
      journalType = foundry.utils.getProperty(journal, `flags.monks-enhanced-journal.pagetype`);
    } else {
      journalType = journal.type;
    }
    return journalType;
  }
  static async wrapElement(note) {
    const data = await _PinCushionPixiHelpers._manageContentHtmlFromNote(note);
    const contentHTML = await TextEditor.enrichHTML(data.contentTooltip);
    const fontSize = data.fontSize;
    const maxWidth = data.maxWidth;
    const container = $(
      `<aside class="pin-cushion-hud-container" 
                style="font-size:${fontSize}px; max-width:${maxWidth}px; opacity: 0; display: none;">
            </aside>`
    )[0];
    const wrappedElement = new ElementWrapper(container, contentHTML, note);
    wrappedElement.anchorXY = 0;
    wrappedElement.visible = false;
    return wrappedElement;
  }
  static async _manageContentHtmlFromNote(note) {
    const data = foundry.utils.deepClone(note);
    const entry = note.entry;
    let entryName = data.document.label;
    let entryIsOwner = true;
    let entryId = void 0;
    let entryIcon = data.texture?.src;
    let entryContent = data.document.label;
    if (entry) {
      entryName = entry.name;
      entryId = entry.id;
      entryIsOwner = entry.isOwner ?? true;
      entryIcon = retrieveFirstImageFromJournalId(entryId, note.page?.id, false);
      if (!entryIcon && data.icon) {
        entryIcon = data.icon;
      }
      entryContent = retrieveFirstTextFromJournalId(entryId, note.page?.id, false);
      if (!entryContent && data.document.label) {
        entryContent = data.document.label;
      }
    }
    const showImage = foundry.utils.getProperty(
      note.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.SHOW_IMAGE
    );
    const showImageExplicitSource = foundry.utils.getProperty(
      note.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.SHOW_IMAGE_EXPLICIT_SOURCE
    );
    const tooltipCustomDescription = foundry.utils.getProperty(
      note.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.TOOLTIP_CUSTOM_DESCRIPTION
    );
    let content;
    if (showImage) {
      const imgToShow = showImageExplicitSource ? showImageExplicitSource : entryIcon;
      if (imgToShow && imgToShow.length > 0) {
        content = await TextEditor.enrichHTML(`<img class='image' src='${imgToShow}' alt=''></img>`, {
          secrets: entryIsOwner,
          documents: true,
          async: true
        });
      } else {
        content = await TextEditor.enrichHTML(
          `<img class='image' src='${CONSTANTS.PATH_TRANSPARENT}' alt=''></img>`,
          {
            secrets: entryIsOwner,
            documents: true,
            async: true
          }
        );
      }
    } else {
      if (!entry && tooltipCustomDescription) {
        const previewMaxLength = game.settings.get(CONSTANTS.MODULE_ID, "previewMaxLength");
        const textContent = tooltipCustomDescription;
        content = textContent.length > previewMaxLength ? `${textContent.substr(0, previewMaxLength)} ...` : textContent;
      } else {
        const previewTypeAsText = foundry.utils.getProperty(
          note.document.flags[CONSTANTS.MODULE_ID],
          CONSTANTS.FLAGS.PREVIEW_AS_TEXT_SNIPPET
        );
        let firstContent = entryContent ?? "";
        if (note.document.entryId) {
          firstContent = firstContent.replaceAll(
            "@UUID[.",
            "@UUID[JournalEntry." + note.document.entryId + ".JournalEntryPage."
          );
          firstContent = firstContent.replaceAll(`data-uuid=".`, `data-uuid="JournalEntry."`);
        }
        if (!previewTypeAsText) {
          content = await TextEditor.enrichHTML(firstContent, {
            secrets: entryIsOwner,
            documents: true,
            async: true
          });
        } else {
          const previewMaxLength = game.settings.get(CONSTANTS.MODULE_ID, "previewMaxLength");
          const textContent = $(firstContent).text();
          content = textContent.length > previewMaxLength ? `${textContent.substr(0, previewMaxLength)} ...` : textContent;
        }
      }
    }
    if (note.document.entryId) {
      content = content.replaceAll(
        "@UUID[.",
        "@UUID[JournalEntry." + note.document.entryId + ".JournalEntryPage."
      );
    }
    let titleTooltip = entryName;
    const newtextGM = foundry.utils.getProperty(
      note.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.PIN_GM_TEXT
    );
    if (game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, "noteGM") && newtextGM) {
      titleTooltip = newtextGM;
    } else if (data.document?.label !== titleTooltip) {
      titleTooltip = data.document.label;
    }
    let bodyPlaceHolder = `<img class='image' src='${CONSTANTS.PATH_TRANSPARENT}' alt=''></img>`;
    data.tooltipId = note.id;
    data.title = titleTooltip;
    data.body = bodyPlaceHolder;
    const fontSize = game.settings.get(CONSTANTS.MODULE_ID, "fontSize") || canvas.grid.size / 5;
    const maxWidth = game.settings.get(CONSTANTS.MODULE_ID, "maxWidth") || 400;
    data.titleTooltip = titleTooltip;
    data.content = content;
    data.fontSize = fontSize;
    data.maxWidth = maxWidth;
    const isTooltipShowTitleS = foundry.utils.getProperty(
      note.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.TOOLTIP_SHOW_TITLE
    );
    const isTooltipShowDescriptionS = foundry.utils.getProperty(
      note.document.flags[CONSTANTS.MODULE_ID],
      CONSTANTS.FLAGS.TOOLTIP_SHOW_DESCRIPTION
    );
    const isTooltipShowTitle = String(isTooltipShowTitleS) === "true" ? true : false;
    const isTooltipShowDescription = String(isTooltipShowDescriptionS) === "true" ? true : false;
    data.contentTooltip = `
              ${isTooltipShowTitle ? `<div id="header"><h3>${titleTooltip}</h3></div><hr/>` : ``}
              ${isTooltipShowDescription ? `<div id="content">${content} </div>` : ``}
          `;
    return data;
  }
};
__name(_PinCushionPixiHelpers, "PinCushionPixiHelpers");
let PinCushionPixiHelpers = _PinCushionPixiHelpers;
const registerSettings = /* @__PURE__ */ __name(function() {
  game.settings.registerMenu(CONSTANTS.MODULE_ID, "resetAllSettings", {
    name: `pin-cushion.SETTINGS.reset.name`,
    hint: `pin-cushion.SETTINGS.reset.hint`,
    icon: "fas fa-coins",
    type: ResetSettingsDialog,
    restricted: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "forceToShowNotes", {
    name: `pin-cushion.SETTINGS.forceToShowNotesN`,
    hint: `pin-cushion.SETTINGS.forceToShowNotesH`,
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "previewMaxLength", {
    name: `pin-cushion.SETTINGS.PreviewMaxLengthN`,
    hint: `pin-cushion.SETTINGS.PreviewMaxLengthH`,
    scope: "world",
    type: Number,
    default: 500,
    config: true,
    onChange: (s) => {
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "previewDelay", {
    name: `pin-cushion.SETTINGS.PreviewDelayN`,
    hint: `pin-cushion.SETTINGS.PreviewDelayH`,
    scope: "world",
    type: Number,
    default: 500,
    config: true,
    onChange: (s) => {
    },
    //@ts-ignore
    range: { min: 100, max: 3e3, step: 100 }
    // bug https://github.com/p4535992/foundryvtt-pin-cushion/issues/18
  });
  game.settings.register(CONSTANTS.MODULE_ID, "defaultJournalPermission", {
    name: `pin-cushion.SETTINGS.DefaultJournalPermissionN`,
    hint: `pin-cushion.SETTINGS.DefaultJournalPermissionH`,
    scope: "world",
    type: Number,
    choices: Object.entries(CONST.DOCUMENT_OWNERSHIP_LEVELS).reduce((acc, [perm, key]) => {
      acc[key] = `pin-cushion.SETTINGS.DefaultJournalPermission.PERMISSION.${perm}`;
      return acc;
    }, {}),
    default: 0,
    config: true,
    onChange: (s) => {
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "defaultJournalFolder", {
    name: `pin-cushion.SETTINGS.DefaultJournalFolderN`,
    hint: `pin-cushion.SETTINGS.DefaultJournalFolderH`,
    scope: "world",
    type: String,
    choices: {
      none: `pin-cushion.None`,
      perUser: `pin-cushion.PerUser`,
      specificFolder: `pin-cushion.PerSpecificFolder`
    },
    default: "none",
    config: true,
    onChange: (s) => {
      if (s === "perUser" && game.user === game.users.find((u) => u.isGM && u.active)) {
        PinCushion._createFolders();
      }
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "defaultNoteImageOnCreate", {
    name: `pin-cushion.SETTINGS.defaultNoteImageOnCreateN`,
    hint: `pin-cushion.SETTINGS.defaultNoteImageOnCreateH`,
    scope: "world",
    type: String,
    default: "",
    config: true,
    filePicker: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "specificFolder", {
    name: `pin-cushion.SETTINGS.SpecificFolderN`,
    hint: `pin-cushion.SETTINGS.SpecificFolderH`,
    scope: "world",
    type: String,
    choices: () => {
      let folders;
      if (game.release.generation < 13) {
        folders = game.journal.directory.folders.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        folders = Array.from(game.journal.directory.collection.folders.values()).sort((a, b) => a.name.localeCompare(b.name));
      }
      const arrObj = {};
      arrObj[""] = "Select a journal folder";
      Object.entries(folders).reduce((folder, [k, v]) => {
        folder[v.id] = v.name;
        arrObj[v.id] = v.name;
        return folder;
      }, {});
      return arrObj;
    },
    default: 0,
    config: true,
    onChange: (s) => {
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableBackgroundlessPins", {
    name: `pin-cushion.SETTINGS.EnableBackgroundlessPinsN`,
    hint: `pin-cushion.SETTINGS.EnableBackgroundlessPinsH`,
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "showJournalImageByDefault", {
    name: `pin-cushion.SETTINGS.ShowJournalImageByDefaultN`,
    hint: `pin-cushion.SETTINGS.ShowJournalImageByDefaultH`,
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableTooltipByDefault", {
    name: `pin-cushion.SETTINGS.enableTooltipByDefaultN`,
    hint: `pin-cushion.SETTINGS.enableTooltipByDefaultH`,
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableAutoScaleNamePlatesNote", {
    name: `pin-cushion.SETTINGS.enableAutoScaleNamePlatesNoteN`,
    hint: `pin-cushion.SETTINGS.enableAutoScaleNamePlatesNoteH`,
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableDragNoteOnTokenLayerIfGM", {
    name: `pin-cushion.SETTINGS.enableDragNoteOnTokenLayerIfGMN`,
    hint: `pin-cushion.SETTINGS.enableDragNoteOnTokenLayerIfGMH`,
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerIconAutoOverride", {
    name: `pin-cushion.SETTINGS.PlayerIconAutoOverrideN`,
    hint: `pin-cushion.SETTINGS.PlayerIconAutoOverrideH`,
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerIconPathDefault", {
    name: `pin-cushion.SETTINGS.PlayerIconPathDefaultN`,
    hint: `pin-cushion.SETTINGS.PlayerIconPathDefaultH`,
    scope: "world",
    config: true,
    default: "icons/svg/book.svg",
    type: String,
    filePicker: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "noteGM", {
    name: `pin-cushion.SETTINGS.noteGMN`,
    hint: `pin-cushion.SETTINGS.noteGMH`,
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotes", {
    name: `pin-cushion.SETTINGS.revealedNotesN`,
    hint: `pin-cushion.SETTINGS.revealedNotesH`,
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotesTintColorLink", {
    name: `pin-cushion.SETTINGS.revealedNotesTintColorLinkN`,
    hint: `pin-cushion.SETTINGS.revealedNotesTintColorLinkH`,
    scope: "world",
    type: String,
    default: "#7CFC00",
    config: true,
    onChange: () => {
      if (canvas?.ready) {
        canvas.notes.placeables.forEach((note) => note.draw());
      }
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotesTintColorNotLink", {
    name: `pin-cushion.SETTINGS.revealedNotesTintColorNotLinkN`,
    hint: `pin-cushion.SETTINGS.revealedNotesTintColorNotLinkH`,
    scope: "world",
    type: String,
    default: "#c000c0",
    config: true,
    onChange: () => {
      if (canvas?.ready) {
        canvas.notes.placeables.forEach((note) => note.draw());
      }
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotesTintColorRevealed", {
    name: `pin-cushion.SETTINGS.revealedNotesTintColorRevealedN`,
    hint: `pin-cushion.SETTINGS.revealedNotesTintColorRevealedH`,
    scope: "world",
    type: String,
    default: "#ffff00",
    config: true,
    onChange: () => refresh()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "revealedNotesTintColorNotRevealed", {
    name: `pin-cushion.SETTINGS.revealedNotesTintColorNotRevealedN`,
    hint: `pin-cushion.SETTINGS.revealedNotesTintColorNotRevealedH`,
    scope: "world",
    type: String,
    default: "#ff0000",
    config: true,
    onChange: () => refresh()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableJournalThumbnailForGMs", {
    name: `pin-cushion.SETTINGS.enableJournalThumbnailForGMsN`,
    hint: `pin-cushion.SETTINGS.enableJournalThumbnailForGMsH`,
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    onchange: () => window.location.reload()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableJournalThumbnailForPlayers", {
    name: `pin-cushion.SETTINGS.enableJournalThumbnailForPlayersN`,
    hint: `pin-cushion.SETTINGS.enableJournalThumbnailForPlayersH`,
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    onchange: () => window.location.reload()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "journalThumbnailPosition", {
    name: `pin-cushion.SETTINGS.journalThumbnailPositionN`,
    hint: `pin-cushion.SETTINGS.journalThumbnailPositionH`,
    scope: "world",
    config: true,
    default: "right",
    type: String,
    choices: {
      right: "Right",
      left: "Left"
    },
    onChange: () => game.journal.render()
  });
  game.settings.register(CONSTANTS.MODULE_ID, "fontSize", {
    name: `pin-cushion.SETTINGS.fontSizeN`,
    hint: `pin-cushion.SETTINGS.fontSizeH`,
    scope: "client",
    type: String,
    default: "",
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "maxWidth", {
    name: `pin-cushion.SETTINGS.maxWidthN`,
    hint: `pin-cushion.SETTINGS.maxWidthH`,
    scope: "client",
    type: Number,
    default: 800,
    config: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "tooltipUseMousePositionForCoordinates", {
    name: `pin-cushion.SETTINGS.tooltipUseMousePositionForCoordinatesN`,
    hint: `pin-cushion.SETTINGS.tooltipUseMousePositionForCoordinatesH`,
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableJournalAnchorLink", {
    name: `pin-cushion.SETTINGS.enableJournalAnchorLinkN`,
    hint: `pin-cushion.SETTINGS.enableJournalAnchorLinkH`,
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "enableJournalDirectoryPages", {
    name: `pin-cushion.SETTINGS.enableJournalDirectoryPagesN`,
    hint: `pin-cushion.SETTINGS.enableJournalDirectoryPagesH`,
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsEnabled", {
    name: `pin-cushion.SETTINGS.playerPinDefaults.enableN`,
    hint: `pin-cushion.SETTINGS.playerPinDefaults.enableH`,
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsGlobal", {
    name: `pin-cushion.SETTINGS.globalN`,
    hint: `pin-cushion.SETTINGS.globalH`,
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsPinImage", {
    name: `pin-cushion.SETTINGS.playerPinDefaults.pinImageN`,
    hint: `pin-cushion.SETTINGS.playerPinDefaults.pinImageH`,
    scope: "world",
    config: true,
    type: String,
    default: "",
    filePicker: "imagevideo"
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsPlayerColorImage", {
    name: `pin-cushion.SETTINGS.playerPinDefaults.playerColorImageN`,
    hint: `pin-cushion.SETTINGS.playerPinDefaults.playerColorImageH`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsPlayerToken", {
    name: `pin-cushion.SETTINGS.playerPinDefaults.playerTokenN`,
    hint: `pin-cushion.SETTINGS.playerPinDefaults.playerTokenH`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsImageSize", {
    name: `pin-cushion.SETTINGS.playerPinDefaults.imageSizeN`,
    hint: `pin-cushion.SETTINGS.playerPinDefaults.imageSizeH`,
    scope: "world",
    config: true,
    type: Number,
    default: 100
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsFontSize", {
    name: `pin-cushion.SETTINGS.playerPinDefaults.fontSizeN`,
    hint: `pin-cushion.SETTINGS.playerPinDefaults.fontSizeH`,
    scope: "world",
    config: true,
    type: Number,
    default: 32
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsAnchorPoint", {
    name: `pin-cushion.SETTINGS.playerPinDefaults.anchorPointN`,
    hint: `pin-cushion.SETTINGS.playerPinDefaults.anchorPointH`,
    scope: "world",
    config: true,
    type: Number,
    default: 1,
    choices: {
      0: "Center",
      1: "Bottom",
      2: "Top",
      3: "Left",
      4: "Right"
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsAddPlayerName", {
    name: `pin-cushion.SETTINGS.playerPinDefaults.addPlayerNameN`,
    hint: `pin-cushion.SETTINGS.playerPinDefaults.addPlayerNameH`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  game.settings.register(CONSTANTS.MODULE_ID, "playerPinDefaultsPlayerColorText", {
    name: `pin-cushion.SETTINGS.playerPinDefaults.playerColorTextN`,
    hint: `pin-cushion.SETTINGS.playerPinDefaults.playerColorTextH`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  game.settings.register(CONSTANTS.MODULE_ID, "debug", {
    name: `pin-cushion.SETTINGS.debugN`,
    hint: `pin-cushion.SETTINGS.debugH`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
}, "registerSettings");
const _ResetSettingsDialog = class _ResetSettingsDialog extends FormApplication {
  constructor(...args) {
    super(...args);
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.title`),
      content: '<p style="margin-bottom:1rem;">' + game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.content`) + "</p>",
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.confirm`),
          callback: async () => {
            const worldSettings = game.settings.storage?.get("world")?.filter((setting) => setting.key.startsWith(`${CONSTANTS.MODULE_ID}.`));
            for (let setting of worldSettings) {
              console.log(`Reset setting '${setting.key}'`);
              await setting.delete();
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.cancel`)
        }
      },
      default: "cancel"
    });
  }
  async _updateObject(event, formData) {
  }
};
__name(_ResetSettingsDialog, "ResetSettingsDialog");
let ResetSettingsDialog = _ResetSettingsDialog;
const _BackgroundlessControlIcon = class _BackgroundlessControlIcon extends ControlIcon {
  /**
   * Override ControlIcon#draw to remove drawing of the background.
   */
  async draw() {
    if (!this.iconSrc) {
      this.texture = PIXI.Texture.EMPTY;
    } else {
      try {
        this.texture = this.texture ?? await loadTexture(this.iconSrc, { fallback: "icons/svg/cancel.svg" });
      } catch (e) {
        Logger.error(e);
        this.texture = PIXI.Texture.EMPTY;
      }
    }
    if (this.destroyed)
      return this;
    this.border.clear().lineStyle(2, this.borderColor, 1).drawRoundedRect(...this.rect, 5).endFill();
    this.border.visible = false;
    this.bg.visible = false;
    try {
      this.icon.texture = this.texture ?? (this.iconSrc ? await loadTexture(this.iconSrc, { fallback: "icons/svg/cancel.svg" }) : "icons/svg/cancel.svg");
      this.icon.width = this.icon.height = this.size;
      this.icon.tint = Number.isNumeric(this.tintColor) ? this.tintColor : 16777215;
    } catch (e) {
      Logger.warn(e.stack ? e.stack : e.message);
      this.icon.texture = "icons/svg/cancel.svg";
      this.icon.width = this.icon.height = this.size;
      this.icon.tint = Number.isNumeric(this.tintColor) ? this.tintColor : 16777215;
    }
    return this;
  }
};
__name(_BackgroundlessControlIcon, "BackgroundlessControlIcon");
let BackgroundlessControlIcon = _BackgroundlessControlIcon;
const _PinCushionHUD = class _PinCushionHUD extends foundry.applications.api.ApplicationV2 {
  constructor(note, options = {}) {
    const data = note && typeof note === "object" && "document" in note ? note.document : note || {};
    super(data, options);
    this.object = note;
    this.data = data;
    this.contentTooltip = "";
    this.HUDtitle = "";
    this.flags = false;
  }
  static get defaultOptions() {
    const baseOptions = super.defaultOptions ?? {};
    return foundry.utils.mergeObject(baseOptions, {
      id: "pin-cushion-hud",
      classes: [...baseOptions.classes ?? [], "pin-cushion-hud"],
      template: "modules/pin-cushion/templates/hud-content.hbs",
      minimizable: false,
      resizable: false,
      width: 300,
      height: "auto"
    });
  }
  async getData() {
    const noteData = await PinCushionPixiHelpers._manageContentHtmlFromNote(this.object);
    this.data = noteData;
    const customTooltip = this.data.document?.flags?.["pin-cushion"]?.tooltipCustomDescription;
    if (customTooltip === void 0) {
      ui.notifications.warn(game.i18n.localize("pin-cushion.UIWarningLackOfFlags"));
      this.flags = false;
      return { flags: false };
    }
    this.flags = true;
    if (customTooltip === "" && this.data.document.pageId !== null) {
      this.contentTooltip = noteData.content;
    } else {
      this.contentTooltip = customTooltip;
    }
    this.fontSize = noteData.fontSize || (canvas?.grid?.size ?? 100) / 5;
    this.maxWidth = noteData.maxWidth || 400;
    this.HUDtitle = noteData.title;
    console.log(noteData);
    return {
      flags: true,
      HUDtitle: this.HUDtitle,
      contentTooltip: this.data.document.flags["pin-cushion"].tooltipCustomDescription,
      fontSize: this.fontSize,
      maxWidth: this.maxWidth
    };
  }
  async _renderHTML() {
    const dane = await this.getData();
    if (dane.flags) {
      try {
        const html = await renderTemplate("modules/pin-cushion/templates/hud-content.hbs", {
          contentTooltip: this.contentTooltip,
          title: this.HUDtitle,
          img: this.data.document.flags["pin-cushion"].showImageExplicitSource
        });
        return html;
      } catch (e) {
        console.error("_renderHTML error:", e);
        throw e;
      }
    }
  }
  async _replaceHTML(result, html) {
    if (this.flags) {
      html.innerHTML = result;
    }
  }
  setPosition() {
    const { x, y } = this.object;
    const screenPos = canvas.stage.worldTransform.apply({ x, y });
    const pos = {
      position: "absolute",
      left: `${screenPos.x + 20}px`,
      top: `${screenPos.y + 20}px`,
      "font-size": `${this.fontSize}px`,
      "max-width": `${this.maxWidth}px`,
      "pointer-events": "none"
      // jeśli HUD ma być tylko informacyjny
    };
    if (this.element instanceof jQuery) {
      this.element.css(pos);
    } else if (this.element instanceof HTMLElement) {
      Object.assign(this.element.style, pos);
    }
  }
  async render(force = false, options = {}) {
    await super.render(force, options);
    const el = this.element;
    const header = el.querySelector("header.window-header");
    if (header)
      header.remove();
    const menu = el.querySelector("menu.controls-dropdown");
    if (menu)
      menu.remove();
    const contentSection = el.querySelector("section.window-content");
    if (contentSection) {
      contentSection.style.padding = "0px";
    }
  }
  static async renderTemplate(path, data) {
    if (game.release.generation > 12) {
      return foundry.applications.handlebars.renderTemplate(path, data);
    } else {
      return renderTemplate(path, data);
    }
  }
};
__name(_PinCushionHUD, "PinCushionHUD");
let PinCushionHUD = _PinCushionHUD;
const _PinCushion = class _PinCushion {
  constructor() {
    this._requests = {};
  }
  /* -------------------------------- Constants ------------------------------- */
  static get DIALOG() {
    const defaultPermission = game.settings.get(CONSTANTS.MODULE_ID, "defaultJournalPermission");
    const defaultFolder = game.settings.get(CONSTANTS.MODULE_ID, "defaultJournalFolder");
    const specificFolder = game.settings.get(CONSTANTS.MODULE_ID, "specificFolder");
    let jurnalFolderAdress;
    if (game.release.generation < 13) {
      jurnalFolderAdress = game.journal.directory.folders;
    } else {
      jurnalFolderAdress = game.journal.folders.contents;
    }
    const specificFolderObj = jurnalFolderAdress.find((f) => f.name === specificFolder || f.id === specificFolder) ?? jurnalFolderAdress[Number(specificFolder)] ?? void 0;
    const specificFolderName = specificFolderObj ? specificFolderObj.name : "";
    const folders = jurnalFolderAdress.sort((a, b) => a.name.localeCompare(b.name)).filter((folder) => folder.displayed).map((folder) => `<option value="${folder.id}">${folder.name}</option>`).join("\n");
    return {
      content: `
            <div class="form-group">
              <label>
                <p class="notes">${Logger.i18n("pin-cushion.Name")}</p>
              </label>
              <input name="name" type="text"/>
              <label>
                <p class="notes">${Logger.i18n("pin-cushion.DefaultPermission")}</p>
              </label>
              <select id="cushion-permission" style="width: 100%;">
                <option value="0"
                  ${String(defaultPermission) === "0" ? "selected" : ""}>
                  ${Logger.i18n("PERMISSION.NONE")}${String(defaultPermission) === "0" ? " <i>(default)</i>" : ""}
                </option>
                <option value="1"
                  ${String(defaultPermission) === "1" ? "selected" : ""}>
                  ${Logger.i18n("PERMISSION.LIMITED")}${String(defaultPermission) === "1" ? " <i>(default)</i>" : ""}
                </option>
                <option value="2"
                  ${String(defaultPermission) === "2" ? "selected" : ""}>
                  ${Logger.i18n("PERMISSION.OBSERVER")}${String(defaultPermission) === "2" ? " <i>(default)</i>" : ""}
                </option>
                <option value="3"
                  ${String(defaultPermission) === "3" ? "selected" : ""}>
                  ${Logger.i18n("PERMISSION.OWNER")}${String(defaultPermission) === "3" ? " <i>(default)</i>" : ""}
                </option>
              </select>
              <label>
                <p class="notes">${Logger.i18n("pin-cushion.Folder")}</p>
              </label>
              <select id="cushion-folder" style="width: 100%;">
                <option
                  value="none"
                  ${defaultFolder === "none" ? "selected" : ""}>
                    ${Logger.i18n("pin-cushion.None")}
                </option>
                <option value="perUser" ${defaultFolder === "perUser" ? "selected" : ""}>
                  ${Logger.i18n("pin-cushion.PerUser")} <i>(${game.user.name})</i>
                </option>
                <option
                  value="specificFolder"
                  ${defaultFolder === "specificFolder" ? "selected" : ""}>
                    ${Logger.i18n("pin-cushion.PerSpecificFolder")} <i>(${specificFolderName})</i>
                </option>
                <option disabled>──${Logger.i18n("pin-cushion.ExistingFolders")}──</option>
                ${folders}
              </select>
            </div>
            </br>
            `,
      title: "Create a Map Pin"
    };
  }
  static get NOTESLAYER() {
    return "NotesLayer";
  }
  static get FONT_SIZE() {
    return 16;
  }
  static autoScaleNotes(canvas2) {
    const enableAutoScaleNamePlatesNote = game.settings.get(CONSTANTS.MODULE_ID, "enableAutoScaleNamePlatesNote");
    if (enableAutoScaleNamePlatesNote) {
      if (canvas2.notes) {
        for (let note of canvas2.notes.placeables) {
          note.tooltip.scale.set(
            _PinCushion._calculateAutoScale(canvas2.scene.dimensions.size, canvas2.stage.scale.x)
          );
        }
      }
    }
  }
  static _calculateAutoScale(sceneDimensionSize, zoomStage) {
    const gs = sceneDimensionSize / 100;
    const zs = 1 / zoomStage;
    return Math.max(gs * zs, 0.8);
  }
  /**
   * Render a file-picker button linked to an <input> field
   * @param {object} options              Helper options
   * @param {string} [options.type]       The type of FilePicker instance to display
   * @param {string} [options.target]     The field name in the target data
   * @param {string} [options.customClass] The field name in the custom class
   * @return {Handlebars.SafeString|string}
   */
  static filePicker(type, target, customClass = "file-picker") {
    if (!target) {
      throw new Logger.error("You must define the name of the target field.");
    }
    if (game.world && !game.user.can("FILES_BROWSE")) {
      return "";
    }
    const tooltip = game.i18n.localize("FILES.BrowseTooltip");
    return new Handlebars.SafeString(`
    <button type="button" name="${customClass}" class="${customClass}" data-type="${type}" data-target="${target}" title="${tooltip}" tabindex="-1">
        <i class="fas fa-file-import fa-fw"></i>
    </button>`);
  }
  /* --------------------------------- Methods -------------------------------- */
  /**
   * Creates and renders a dialog for name entry
   * @param {*} data
   * break callbacks out into separate methods
   */
  _createDialog(data) {
    new Dialog({
      title: _PinCushion.DIALOG.title,
      content: _PinCushion.DIALOG.content,
      buttons: {
        save: {
          label: "Save",
          icon: `<i class="fas fa-check"></i>`,
          callback: (html) => {
            return this.createNoteFromCanvas(html, data);
          }
        },
        cancel: {
          label: "Cancel",
          icon: `<i class="fas fa-times"></i>`,
          callback: (e) => {
          }
        }
      },
      default: "save"
    }).render(true);
  }
  /**
   * Creates a Note from the Pin Cushion dialog
   * @param {*} html
   * @param {*} data
   */
  async createNoteFromCanvas(html, eventData) {
    const input = html.find("input[name='name']");
    if (!input[0].value) {
      Logger.warn(Logger.i18n("pin-cushion.MissingPinName"), true);
      return;
    }
    const permission = {
      [game.userId]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
      default: parseInt($("#cushion-permission").val()) ?? 0
    };
    const defaultJournalPermission = game.settings.get(CONSTANTS.MODULE_ID, "defaultJournalPermission");
    if (isRealNumber(defaultJournalPermission) && (!isRealNumber(permission.default) || permission.default === 0) && defaultJournalPermission >= 0) {
      permission.default = defaultJournalPermission;
    }
    let folder;
    const selectedFolder = $("#cushion-folder").val();
    if (selectedFolder === "none") {
      folder = void 0;
    } else if (selectedFolder === "perUser") {
      folder = _PinCushion.getFolder(game.user.name, selectedFolder);
      if (!game.user.isGM && folder === void 0)
        ;
    } else if (selectedFolder === "specificFolder") {
      const settingSpecificFolder = game.settings.get(CONSTANTS.MODULE_ID, "specificFolder");
      folder = _PinCushion.getFolder(game.user.name, selectedFolder, settingSpecificFolder);
    } else {
      folder = selectedFolder;
    }
    const entry = await JournalEntry.create({
      name: `${input[0].value}`,
      ownership: permission,
      ...folder && { folder }
    });
    if (!entry) {
      return;
    }
    const entryData = entry.toJSON();
    entryData.id = entry.id;
    entryData.uuid = "JournalEntry." + entry.id;
    entryData.type = "JournalEntry";
    if (canvas.activeLayer.name !== _PinCushion.NOTESLAYER) {
      await canvas.notes.activate();
    }
    await canvas.activeLayer._onDropData(eventData, entryData);
  }
  /**
   * Gets the JournalEntry Folder ID to be used for JournalEntry creations, if any.
   *
   * @static
   * @param {string} name - The player name to check folders against, defaults to current user's name
   * @param {string} setting - The module setting set for journal default
   * @param {string} folderName - The explicit name of the folder
   * @returns {string|undefined} The folder's ID, or undefined if there is no target folder
   */
  static getFolder(name, setting, folderName) {
    name = name ?? game.user.name;
    let jurnalFolderAdress;
    if (game.release.generation < 13) {
      jurnalFolderAdress = game.journal.directory.folders;
    } else {
      jurnalFolderAdress = game.journal.folders.contents;
    }
    switch (setting) {
      case "none":
        return void 0;
      case "perUser":
        return jurnalFolderAdress.find((f) => f.name === name)?.id ?? void 0;
      case "specificFolder":
        return jurnalFolderAdress.find((f) => f.name === folderName || f.id === folderName)?.id ?? jurnalFolderAdress[Number(folderName)]?.id ?? void 0;
      default:
        return name;
    }
  }
  /**
   * Checks for missing Journal Entry folders and creates them
   *
   * @static
   * @private
   * @returns {void}
   */
  static async _createFolders() {
    const setting = game.settings.get(CONSTANTS.MODULE_ID, "defaultJournalFolder");
    const missingFolders = game.users.filter((u) => !u.isGM && _PinCushion.getFolder(u.name, setting) === void 0).map((user) => ({
      name: user.name,
      type: "JournalEntry",
      parent: null,
      sorting: "a"
    }));
    if (missingFolders.length) {
      const createFolders = await new Promise((resolve, reject) => {
        new Dialog({
          title: Logger.i18n("pin-cushion.CreateMissingFoldersT"),
          content: Logger.i18n("pin-cushion.CreateMissingFoldersC"),
          buttons: {
            yes: {
              label: `<i class="fas fa-check"></i> ${Logger.i18n("Yes")}`,
              callback: () => resolve(true)
            },
            no: {
              label: `<i class="fas fa-times"></i> ${Logger.i18n("No")}`,
              callback: () => reject()
            }
          },
          default: "yes",
          close: () => reject()
        }).render(true);
      }).catch((_) => {
      });
      if (createFolders)
        await Folder.create(missingFolders);
    }
  }
  /**
   * Replaces icon selector in Notes Config form with filepicker
   * @param {*} app
   * @param {*} html
   * @param {*} noteData
   */
  static _replaceIconSelector(app, html, noteData, explicitImageValue) {
    const currentIconSelector = stripQueryStringAndHashFromPath(explicitImageValue);
    const hasPermissionsToUploadFile = game.user.can("FILES_BROWSE");
    if (hasPermissionsToUploadFile) {
      const $html = ensureJquery$1(html);
      const iconCustomSelector = $html.find("input[name='icon.custom']");
      if (iconCustomSelector?.length > 0) {
        iconCustomSelector.val(currentIconSelector);
        iconCustomSelector.on("change", function() {
          const p = iconCustomSelector.parent().find(".pin-cushion-journal-icon");
          const valueIconSelector = $html.find("select[name='icon.selected']")?.val();
          if (valueIconSelector) {
            p[0].src = valueIconSelector;
          } else {
            p[0].src = this.value;
          }
        });
        const iconSelector = $html.find("select[name='icon.selected']");
        if (iconSelector?.val() === "icons/svg/book.svg" && currentIconSelector) {
          iconSelector?.val("").change();
        }
        if (iconSelector?.length > 0) {
          iconSelector.on("change", function() {
            const p = iconCustomSelector.parent().find(".pin-cushion-journal-icon");
            const valueIconSelector2 = $html.find("select[name='icon.selected']")?.val();
            if (valueIconSelector2) {
              p[0].src = valueIconSelector2;
            } else {
              p[0].src = currentIconSelector;
            }
          });
          const valueIconSelector = $html.find("select[name='icon.selected']")?.val();
          if (valueIconSelector) {
            iconCustomSelector.parent().prepend(`<img class="pin-cushion-journal-icon" src="${valueIconSelector}" />`);
          } else {
            iconCustomSelector.prop("disabled", false);
            iconCustomSelector.parent().prepend(`<img class="pin-cushion-journal-icon" src="${currentIconSelector}" />`);
          }
        } else {
          iconCustomSelector.parent().prepend(`<img class="pin-cushion-journal-icon" src="${currentIconSelector}" />`);
        }
      }
      const currentpageSelector = "";
      const pageCustomSelector = $html.find("select[name='pageId']");
      const valuejournalSelector = $html.find("select[name='entryId']")?.val();
      if (pageCustomSelector && valuejournalSelector) {
        const pageSelector = $html.find("select[name='pageId']");
        if (pageSelector?.length > 0) {
          pageSelector.on("change", function() {
            const p = pageCustomSelector.parent().find(".pin-cushion-page-icon");
            const valuepageSelector2 = $html.find("select[name='pageId']")?.val();
            if (valuepageSelector2) {
              const pageiimage2 = retrieveFirstImageFromJournalId(
                valuejournalSelector,
                valuepageSelector2,
                true
              );
              if (pageiimage2) {
                p[0].src = pageiimage2;
              } else {
                p[0].src = currentpageSelector;
              }
            } else {
              p[0].src = currentpageSelector;
            }
          });
          const valuepageSelector = $html.find("select[name='pageId']")?.val();
          const pageiimage = retrieveFirstImageFromJournalId(valuejournalSelector, valuepageSelector, true);
          if (pageiimage) {
            pageCustomSelector.parent().prepend(`<img class="pin-cushion-page-icon" src="${pageiimage}" />`);
          } else {
            pageCustomSelector.parent().prepend(`<img class="pin-cushion-page-icon" src="${currentpageSelector}" />`);
          }
        } else {
          pageCustomSelector.parent().prepend(`<img class="pin-cushion-page-icon" src="${currentpageSelector}" />`);
        }
      }
    }
  }
  static _addNoteGM(app, html, noteData) {
    let gmNoteFlagRef = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PIN_GM_TEXT}`;
    let gmtext = noteData.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_GM_TEXT);
    if (!gmtext)
      gmtext = "";
    let gm_text_h = $(
      `<div class="form-group">
        <label for="${gmNoteFlagRef}">${Logger.i18n("pin-cushion.GMLabel")}</label>
        <div class="form-fields">
          <textarea
            name="${gmNoteFlagRef}">${gmtext.trim() ?? ""}</textarea>
        </div>
      </div>`
    );
    let initial_text = noteData.document.text ?? noteData.entry?.name;
    if (!initial_text)
      initial_text = "";
    let initial_text_h = $(
      `<div class="form-group">
        <label for="text">${Logger.i18n("pin-cushion.PlayerLabel")}</label>
        <div class="form-fields">
          <textarea name="text"
            placeholder="${noteData.entry?.name ?? ""}">${initial_text.trim() ?? ""}</textarea>
        </div>
      </div>`
    );
    html.find("input[name='text']").parent().parent().after(initial_text_h);
    html.find("input[name='text']").parent().parent().remove();
    html.find("textarea[name='text']").parent().parent().before(gm_text_h);
  }
  /**
   * If the Note has a GM-NOTE on it, then display that as the tooltip instead of the normal text.
   * Foundry < V12
   * @param {function} [wrapped] The wrapped function provided by libWrapper
   * @param {object}   [args]    The normal arguments to Note#drawTooltip
   */
  static _textWithNoteGM(wrapped) {
    const gmlabel = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_GM_TEXT);
    return gmlabel?.length > 0 ? gmlabel : wrapped();
  }
  /**
   * If the Note has a GM-NOTE on it, then display that as the tooltip instead of the normal text.
   * Foundry V12+
   * @param {function} wrapped The wrapped function provided by libWrapper
   * @returns the label for this NoteDocument
   */
  static _labelWithNoteGM(wrapped, ...args) {
    const gmlabel = this.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_GM_TEXT);
    return gmlabel?.length > 0 ? gmlabel : wrapped();
  }
  // /**
  //  * If the Note has a GM-NOTE on it, then display that as the tooltip instead of the normal text
  //  * @param {function} [wrapped] The wrapped function provided by libWrapper
  //  * @param {object}   [args]    The normal arguments to Note#drawTooltip
  //  * @returns {PIXI.Text}
  //  */
  // static _addDrawTooltipWithNoteGM(wrapped, ...args) {
  //     //const enableNoteGM = game.settings.get(CONSTANTS.MODULE_ID, 'noteGM');
  //     const hideLabel =
  //         (this.document
  //             ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL)
  //             : this.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL)) ?? false;
  //     const numberWsSuffixOnNameplate =
  //         (this.document
  //             ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE)
  //             : this.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE)) ?? 0;
  //     const ratio_width = isRealNumber(this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH))
  //         ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH)
  //         : 1;
  //     // Only override default if flag(CONSTANTS.MODULE_ID,CONSTANTS.FLAGS.PIN_GM_TEXT) is set
  //     if (game.user.isGM) {
  //         const newtextGM = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_GM_TEXT);
  //         if (newtextGM && newtextGM.length > 0) {
  //             let result = wrapped(...args);
  //             if (hideLabel) {
  //                 result.text = "";
  //                 // this.document.text = '';
  //             } else {
  //                 if (numberWsSuffixOnNameplate > 0) {
  //                     result.text = newtextGM + " ".repeat(numberWsSuffixOnNameplate);
  //                 } else if (numberWsSuffixOnNameplate < 0) {
  //                     result.text = " ".repeat(numberWsSuffixOnNameplate * -1) + newtextGM;
  //                 } else {
  //                     result.text = newtextGM;
  //                 }
  //                 // this.document.text = newtextGM;
  //             }
  //             if (ratio_width != 1) {
  //                 let x = result.x;
  //                 let left = x + ratio_width * (this.size / 2) - 16;
  //                 result.x = left;
  //             }
  //             return result;
  //         }
  //     }
  //     //// Set a different label to be used while we call the original Note.prototype._drawTooltip
  //     ////
  //     //// Note#text          = get text()  { return this.document.label; }
  //     //// NoteDocument#label = get label() { return this.text || this.entry?.name || "Unknown"; }
  //     //// but NoteDocument#document.text can be modified :-)
  //     ////
  //     //// let saved_text = this.document.text;
  //     // this.document.text = newtext;
  //     let result = wrapped(...args);
  //     //// this.document.text = saved_text;
  //     if (hideLabel) {
  //         result.text = "";
  //     } else {
  //         if (numberWsSuffixOnNameplate > 0) {
  //             result.text = result.text + " ".repeat(numberWsSuffixOnNameplate);
  //         } else if (numberWsSuffixOnNameplate < 0) {
  //             result.text = " ".repeat(numberWsSuffixOnNameplate * -1) + result.text;
  //         }
  //     }
  //     if (ratio_width != 1) {
  //         let x = result.x;
  //         let left = x + ratio_width * (this.size / 2) - 16;
  //         result.x = left;
  //     }
  //     return result;
  // }
  /**
   * Draw the map note Tooltip as a Text object
   * @returns {PIXI.Text}
   */
  static _addDrawTooltip2(wrapped, ...args) {
    const hideLabel = (this.document ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL) : this.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL)) ?? false;
    const numberWsSuffixOnNameplate = (this.document ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE) : this.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE)) ?? 0;
    const numberHsSuffixOnNameplate = (this.document ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_HS_SUFFIX_ON_NAMEPLATE) : this.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_HS_SUFFIX_ON_NAMEPLATE)) ?? 0;
    const ratio_width = isRealNumber(this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH)) ? this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH) : 1;
    let result = this;
    let newText = result.document.label;
    if (hideLabel) {
      newText = "";
    }
    if (newText != result.label) {
      this.tooltip.text = newText;
    }
    if (ratio_width != 1) {
      let x = result.tooltip.x;
      if (numberWsSuffixOnNameplate != 0) {
        let left = x - 5 * numberWsSuffixOnNameplate;
        result.tooltip.x = left;
      } else {
        let left = x - result.document.iconSize * 2;
        result.tooltip.x = left;
      }
      let y = result.tooltip.y;
      if (numberHsSuffixOnNameplate != 0) {
        let bottom = y - 5 * numberHsSuffixOnNameplate;
        result.tooltip.y = bottom;
      } else {
        let bottom = y + result.document.iconSize / 2;
        result.tooltip.y = bottom;
      }
      return result;
    } else {
      return wrapped(...args);
    }
  }
  /**
   * Wraps the default Note#isVisible to allow the visibility of scene Notes to be controlled by the reveal
   * state stored in the Note (overriding the default visibility which is based on link accessibility).
   * @param {function} [wrapped] The wrapper function provided by libWrapper
   * @param {Object}   [args]    The arguments for Note#refresh
   * @return [Note]    This Note
   */
  static _isVisible(wrapped, ...args) {
    wrapped(...args);
    const showOnlyToGM = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SHOW_ONLY_TO_GM) ?? false;
    if (String(showOnlyToGM) === "true") {
      if (!game.user.isGM) {
        return false;
      }
    }
    if (!this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.USE_PIN_REVEALED)) {
      return wrapped(...args);
    }
    const access = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_IS_REVEALED);
    if (access === false || !canvas.effects.visibility.tokenVision || this.document.global) {
      return access;
    }
    const point = { x: this.document.x, y: this.document.y };
    const tolerance = this.document.iconSize / 4;
    return canvas.effects.visibility.testVisibility(point, { tolerance, object: this });
  }
  /**
   * Ensure player notes are updated immediately
   * @param {*} wrapped
   * @param  {...any} args
   * @returns
   */
  static _noteUpdate(wrapped, ...args) {
    const revealedNotes = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotes");
    const [data, options, userId] = args;
    if (revealedNotes) {
      let result = wrapped(data, options, userId);
      if (this.renderFlags && data?.flags?.[CONSTANTS.MODULE_ID]) {
        this.renderFlags.set({ redraw: true });
      }
      return result;
    } else {
      if (this.renderFlags && data?.flags?.[CONSTANTS.MODULE_ID]) {
        this.renderFlags.set({ redraw: true });
      }
      return wrapped(...args);
    }
  }
  static _applyRenderFlags(wrapped, ...args) {
    let result = wrapped(...args);
    const hideLabel = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL) ?? false;
    if (hideLabel) {
      this.tooltip.visible = false;
    } else {
      let textAlwaysVisible = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TEXT_ALWAYS_VISIBLE) ?? false;
      if (textAlwaysVisible === true) {
        this.tooltip.visible = true;
      }
    }
    return result;
  }
  /**
   * Wraps the default Note#refresh to allow the visibility of scene Notes to be controlled by the reveal
   * state stored in the Note (overriding the default visibility which is based on link accessibility).
   * @param {function} [wrapped] The wrapper function provided by libWrapper
   * @param {Object}   [args]    The arguments for Note#refresh
   * @return [Note]    This Note
   */
  static _noteRefresh(wrapped, ...args) {
    let result = wrapped(...args);
    let textAlwaysVisible = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TEXT_ALWAYS_VISIBLE) ?? false;
    if (textAlwaysVisible === true) {
      this.tooltip.visible = true;
    }
    let text = this.children[1];
    let ratio = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH);
    if (ratio && text?.x) {
      text.x = this.size * (ratio - 1) / 2;
    }
    if (!isAlt() && this.hover) {
      const fromIndex = canvas.notes.placeables.findIndex((note) => note.id === this.id) || 0;
      canvas.notes.placeables.push(canvas.notes.placeables.splice(fromIndex, 1)[0]);
    }
    return result;
  }
  /* -------------------------------- Listeners ------------------------------- */
  /**
   * Handles doubleclicks
   * @param {*} event
   */
  static _onDoubleClick(event) {
    if (canvas.activeLayer._hover) {
      return;
    }
    if (!game.user.can("NOTE_CREATE"))
      return;
    if (!game.user.can("JOURNAL_CREATE")) {
      Logger.warn(
        game.i18n.format("PinCushion.AllowPlayerNotes", {
          permission: Logger.i18n("PERMISSION.JournalCreate")
        }),
        true
      );
      return;
    }
    const data = {
      clientX: event.data.global.x,
      clientY: event.data.global.y
    };
    API$1.pinCushion._createDialog(data);
  }
  //   static async _onSingleClick(event) {
  //     Logger.log(
  //       `Note_onClickLeft: ${event.data.origin.x} ${event.data.origin.y} == ${event.data.global.x} ${event.data.global.y}`
  //     );
  //     // Create a new Note at the cursor position and open the Note configuration window for it.
  //     const noteData = { x: event.data.origin.x, y: event.data.origin.y };
  //     this._createPreview(noteData, { top: event.data.global.y - 20, left: event.data.global.x + 40 });
  //   }
  static _drawControlIconInternal(noteInternal) {
    const revealedNotes = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotes");
    if (revealedNotes) {
      if (game.user.isGM) {
        const is_revealed = noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_IS_REVEALED);
        if (is_revealed != void 0) {
          const colour = game.settings.get(
            CONSTANTS.MODULE_ID,
            is_revealed ? "revealedNotesTintColorRevealed" : "revealedNotesTintColorNotRevealed"
          );
          if (colour?.length > 0) {
            const saved = noteInternal.document.texture.tint;
            noteInternal.document.texture.tint = colour;
            noteInternal.document.texture.tint = saved;
          }
        }
      } else {
        const use_reveal = noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.USE_PIN_REVEALED);
        if (use_reveal === void 0 || !use_reveal)
          ;
        else {
          const value = noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.USE_PIN_REVEALED);
          if (value !== void 0) {
            const is_linked = noteInternal.entry?.testUserPermission(
              game.user,
              CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED
            );
            const colour = game.settings.get(
              CONSTANTS.MODULE_ID,
              is_linked ? "revealedNotesTintColorLink" : "revealedNotesTintColorNotLink"
            );
            if (colour?.length > 0) {
              const saved = noteInternal.document.texture.tint;
              noteInternal.document.texture.tint = colour;
              noteInternal.document.texture.tint = saved;
            }
          }
        }
      }
    }
    let tint = noteInternal.document.texture.tint ? Color.from(noteInternal.document.texture.tint) : null;
    let currentIcon = noteInternal.document.texture.src;
    const pinIsTransparent = noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_IS_TRANSPARENT);
    if (String(pinIsTransparent) === "true") {
      currentIcon = CONSTANTS.PATH_TRANSPARENT;
    }
    let iconData = {
      texture: stripQueryStringAndHashFromPath(currentIcon),
      size: noteInternal.document.iconSize,
      tint
    };
    let icon;
    if (noteInternal.document && noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HAS_BACKGROUND)) {
      icon = new ControlIcon(iconData);
      icon.x -= noteInternal.document.iconSize / 2;
      icon.y -= noteInternal.document.iconSize / 2;
    } else {
      const enableBackgroundlessPins = game.settings.get(CONSTANTS.MODULE_ID, "enableBackgroundlessPins");
      if (enableBackgroundlessPins) {
        icon = new BackgroundlessControlIcon(iconData);
        icon.x -= noteInternal.document.iconSize / 2;
        icon.y -= noteInternal.document.iconSize / 2;
      } else {
        icon = new ControlIcon(iconData);
        icon.x -= noteInternal.document.iconSize / 2;
        icon.y -= noteInternal.document.iconSize / 2;
      }
    }
    const ratio_width = isRealNumber(
      noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH)
    ) ? noteInternal.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH) : 1;
    if (ratio_width != 1) {
      if (noteInternal.document) {
        icon.width = icon.width * ratio_width;
      }
    }
    if (noteInternal.document?.flags?.autoIconFlags) {
      const flagsAutomaticJournalIconNumbers = {
        autoIcon: noteInternal.document?.flags.autoIconFlags.autoIcon,
        iconType: noteInternal.document?.flags.autoIconFlags.iconType,
        iconText: noteInternal.document?.flags.autoIconFlags.iconText,
        foreColor: noteInternal.document?.flags.autoIconFlags.foreColor,
        backColor: noteInternal.document?.flags.autoIconFlags.backColor,
        fontFamily: noteInternal.document?.flags.autoIconFlags.fontFamily
      };
      if (flagsAutomaticJournalIconNumbers.fontFamily) {
        noteInternal.document.fontFamily = flagsAutomaticJournalIconNumbers.fontFamily;
      }
    }
    return icon;
  }
  static _noteConfigGetData(wrapped, ...args) {
    let noteData = wrapped(...args);
    if (game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsEnabled")) {
      noteData = _PinCushion.pinPlayerDefaultsGetData(noteData);
    }
    return noteData;
  }
  static _noteConfigGetSubmitData(wrapped, ...args) {
    let data = wrapped(...args);
    if (game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsEnabled")) {
      data = _PinCushion.pinPlayerDefaultsGetSubmitData(data);
    }
    return data;
  }
  /*
  getData wrapper.
  Here we override with the custom defaults what is presented to the player in  the NoteConfig.
  Won't be used if GM or if the defaults have already been applied
   */
  static pinPlayerDefaultsGetData(noteData) {
    if (game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsEnabled")) {
      return noteData;
    }
    const originalText = foundry.utils.getProperty(
      this.document,
      `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_PIN_DEFAULTS_ORIGINAL_TEXT}`
    );
    if (originalText) {
      noteData.data.text = originalText;
    }
    const isDefaulted = foundry.utils.getProperty(
      this.document,
      `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_PIN_DEFAULTS_IS_DEFAULTED}`
    );
    if (game.user.isGM || isDefaulted) {
      return noteData;
    }
    Logger.log(noteData);
    const defaults = _PinCushion._getPinDefaults();
    noteData = foundry.utils.mergeObject(noteData, defaults);
    return noteData;
  }
  /*
   * getSubmitData wrapper.
   * Here we perform operations after the note has been submitted. Operations include:
   * - Adding the character name
   * - Store the text before adding the name
   * - Setting a flag to indicate that the new defaults have been applied
   */
  static pinPlayerDefaultsGetSubmitData(data) {
    if (game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsEnabled")) {
      return data;
    }
    if (game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsAddPlayerName")) {
      const characterName = foundry.utils.getProperty(
        this.document,
        `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_PIN_DEFAULTS_CHARACTER_NAME}`
      ) || game.user.character?.name || game.user.name;
      foundry.utils.setProperty(
        data,
        `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_PIN_DEFAULTS_ORIGINAL_TEXT}`,
        data.text
      );
      foundry.utils.setProperty(
        data,
        `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_PIN_DEFAULTS_CHARACTER_NAME}`,
        characterName
      );
      data.text += `
${characterName}`;
    }
    const isDefaulted = foundry.utils.getProperty(
      this.document,
      `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_PIN_DEFAULTS_IS_DEFAULTED}`
    );
    if (game.user.isGM || isDefaulted) {
      return data;
    }
    foundry.utils.setProperty(
      data,
      `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_PIN_DEFAULTS_IS_DEFAULTED}`,
      true
    );
    return data;
  }
  /**
   * Returns the object containing the defaults used for overriding the getData in NoteConfig
   */
  static _getPinDefaults() {
    const playerColor = game.user.color;
    const tokenImg = game.user.character.prototypeToken?.texture.src;
    const usePlayerToken = game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsPlayerToken") && tokenImg?.length > 0;
    const defaultImage = game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsPinImage");
    let customIcon = null;
    if (usePlayerToken) {
      customIcon = tokenImg;
    } else if (defaultImage?.length > 0) {
      customIcon = defaultImage;
    }
    const usePlayerColorTint = game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsPlayerColorImage");
    let tintIcon = null;
    if (usePlayerColorTint && !usePlayerToken) {
      tintIcon = playerColor;
    }
    let defaults = {
      data: {
        global: game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsGlobal"),
        iconSize: game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsImageSize"),
        textAnchor: game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsAnchorPoint"),
        textColor: game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsPlayerColorText") ? playerColor : null,
        fontSize: game.settings.get(CONSTANTS.MODULE_ID, "playerPinDefaultsFontSize"),
        texture: {
          tint: tintIcon
        }
      },
      icon: {
        selected: customIcon ? "" : null,
        custom: customIcon
      }
    };
    defaults = foundry.utils.flattenObject(defaults);
    defaults = Object.fromEntries(Object.entries(defaults).filter(([_, v]) => v != null));
    defaults = foundry.utils.expandObject(defaults);
    return defaults;
  }
  /**
   * Handles draw control icon
   * @param {*} event
   */
  static _drawControlIcon(...args) {
    const res = _PinCushion._drawControlIconInternal(this);
    if (res === void 0)
      ;
    else {
      return res;
    }
  }
  /**
   * Defines the icon to be drawn for players if enabled.
   */
  static _onPrepareNoteData(wrapped) {
    wrapped();
    if (!game.user.isGM) {
      if (this?.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PLAYER_ICON_STATE)) {
        this.texture.src = stripQueryStringAndHashFromPath(
          this.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PLAYER_ICON_PATH)
        );
      }
    }
  }
  static _renderJournalThumbnail(app, html) {
    game.journal.render();
  }
  static _addJournalThumbnail(app, html, data) {
    const isGM = game.user.isGM;
    const enabledForGM = game.settings.get(CONSTANTS.MODULE_ID, "enableJournalThumbnailForGMs");
    const enabledForPlayers = game.settings.get(CONSTANTS.MODULE_ID, "enableJournalThumbnailForPlayers");
    if (isGM && enabledForGM || !isGM && enabledForPlayers) {
      const journals = app.collection?.contents ?? [];
      for (const journal of journals) {
        const $html = ensureJquery$1(html);
        const htmlEntry = $html.find(`.directory-item.document[data-document-id="${journal.id}"]`);
        if (htmlEntry.length !== 1)
          continue;
        const journalEntryImage = retrieveFirstImageFromJournalId(journal.id, void 0, false);
        if (!journalEntryImage)
          continue;
        let thumbnail = null;
        if (journalEntryImage.endsWith(".pdf")) {
          thumbnail = $(
            `<img class="pin-cushion-thumbnail sidebar-image journal-entry-image" src="${CONSTANTS.PATH_PDF_THUMBNAIL}" title="${journal.name}" alt="Journal Entry Thumbnail">`
          );
        } else {
          thumbnail = $(
            `<img class="pin-cushion-thumbnail sidebar-image journal-entry-image" src="${journalEntryImage}" title="${journal.name}" alt="Journal Entry Thumbnail">`
          );
        }
        const position = game.settings.get(CONSTANTS.MODULE_ID, "journalThumbnailPosition");
        switch (position) {
          case "right":
            htmlEntry.append(thumbnail);
            break;
          case "left":
            htmlEntry.prepend(thumbnail);
            break;
          default:
            Logger.warn(`Must set 'right' or 'left' for sidebar thumbnail image`);
        }
      }
    }
  }
  static _deleteJournalDirectoryPagesEntry() {
    if (game.settings.get(CONSTANTS.MODULE_ID, "enableJournalDirectoryPages")) {
      ui.sidebar.tabs.journal.render(true);
      for (let window2 of [...Object.values(ui.windows)].filter((w) => w.title == "Journal Directory")) {
        window2.render(true);
      }
    }
  }
  static _createJournalDirectoryPagesEntry() {
    if (game.settings.get(CONSTANTS.MODULE_ID, "enableJournalDirectoryPages")) {
      ui.sidebar.tabs.journal.render(true);
      for (let window2 of [...Object.values(ui.windows)].filter((w) => w.title == "Journal Directory")) {
        window2.render(true);
      }
    }
  }
  static _addJournalDirectoryPages(app, html, options) {
    if (game.settings.get(CONSTANTS.MODULE_ID, "enableJournalDirectoryPages")) {
      for (let j of app.documents) {
        if (!j.pages.size)
          continue;
        let $li = html.find(`li[data-document-id="${j.id}"]`);
        $li.css({ flex: "unset", display: "block" });
        let $button = $(
          `<a class="toggle" style="width:50px; float: right; text-align: right; padding-right: .5em;"><i class="fa-solid fa-caret-down"></i></a>`
        ).click(function(e) {
          e.stopPropagation();
          $(this).parent().parent().find("ol").toggle();
          $(this).parent().parent().find("ol").is(":hidden") ? $(this).html('<i class="fa-solid fa-caret-down"></i>') : $(this).html('<i class="fa-solid fa-caret-up"></i>');
        });
        $li.find("h4").append($button).css({ "flex-basis": "100%", overflow: "ellipsis" });
        let $ol = $(`<ol class="journal-pages" style="width:100%; margin-left: 1em;" start="0"></ol>`);
        $ol.hide();
        for (let p of j.pages.contents.sort((a, b) => {
          return a.sort - b.sort;
        }))
          $ol.append($(`<li class="journal-page" data-page-uuid="${p.uuid}"><a>${p.name}</a></li>`));
        $li.append($ol);
      }
      $(html).find("li.journal-page > a").click(function(e) {
        e.stopPropagation();
        let page = fromUuidSync($(this).parent().data().pageUuid);
        if (!page)
          return;
        page.parent.sheet.render(true, { pageId: page.id, focus: true });
      }).contextmenu(function(e) {
        e.stopPropagation();
        e.preventDefault();
        let page = fromUuidSync($(this).parent().data().pageUuid);
        if (!page)
          return;
        page.sheet.render(true);
      });
    }
  }
  /**
   * Sets whether this Note is revealed (visible) to players; overriding the default FoundryVTT rules.
   * The iconTint/texture.tint will also be set on the Note based on whether there is a link that the player can access.
   * If this function is never called then the default FoundryVTT visibility rules will apply
   * @param [NoteData] [notedata] The NoteData whose visibility is to be set (can be used before the Note has been created)
   * @param {Boolean}  [visible]  pass in true if the Note should be revealed to players
   */
  static setNoteRevealed(notedata, visible) {
    const revealedNotes = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotes");
    if (revealedNotes) {
      visible = getProperty(notedata, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PIN_IS_REVEALED}`);
      if (visible) {
        const FLAG_IS_REVEALED = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PIN_IS_REVEALED}`;
        const FLAG_USE_REVEALED = `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.USE_PIN_REVEALED}`;
        setProperty(notedata, FLAG_USE_REVEALED, true);
        setProperty(notedata, FLAG_IS_REVEALED, visible);
      }
    }
  }
  //NOT USED
  // static renderHeadsUpDisplayV1(hud, html, data) {
  //     canvas.hud.PinCushion = new PinCushionHUD();
  //     const hudTemp = document.createElement("template");
  //     hudTemp.id = "pin-cushion-hud";
  //     html.append(hudTemp);
  // }
  /**
   * Note.prototype._onClickLeft and Note.prototype._onClickRight seem to work only on the NoteLayer
   * @href https://github.com/foundryvtt/foundryvtt/issues/8770
   * @param {*} wrapped
   * @param  {...any} args
   * @returns
   */
  static _canControl(wrapped, ...args) {
    if (canvas.activeLayer instanceof TokenLayer) {
      Logger.info(`Applied can control override`);
      if (this.isPreview) {
        return false;
      }
      const enableDragNoteOnTokenLayerIfGM = game.settings.get(
        CONSTANTS.MODULE_ID,
        "enableDragNoteOnTokenLayerIfGM"
      );
      if (enableDragNoteOnTokenLayerIfGM && game.user.isGM) {
        return true;
      }
    }
    let result = wrapped(...args);
    return result;
  }
  // 2024-05-01... work but i don't like...
  // static drawTooltipHandler(wrapped, ...args) {
  //     const note = this;
  //     PinCushionPixiHelpers.drawTooltipPixi(note);
  //     return wrapped(...args);
  // }
};
__name(_PinCushion, "PinCushion");
let PinCushion = _PinCushion;
function ensureJquery$1(html) {
  if (html instanceof jQuery)
    return html;
  if (html instanceof HTMLElement)
    return $(html);
  return $(html);
}
__name(ensureJquery$1, "ensureJquery$1");
const API = {
  pinCushion: new PinCushion(),
  // pinCushionContainers: {},
  /**
   * Request an action to be executed with GM privileges.
   *
   * @static
   * @param {object} message - The object that will get emitted via socket
   * @param {string} message.action - The specific action to execute
   * @returns {Promise} The promise of the action which will be resolved after execution by the GM
   */
  async requestEventArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw Logger.error("requestEventArr | inAttributes must be of type array");
    }
    const [message] = inAttributes;
    if (!Object.keys(message)?.includes("action")) {
      Logger.warn(`Message doesn't contain the 'action'`);
      return;
    }
    const id = `${game.user.id}_${Date.now()}_${randomID()}`;
    message.id = id;
    let baseFolder = game.journal.directory.folders.find(
      (f) => f.name?.toLowerCase() === game.user.name?.toLowerCase()
    );
    if (!baseFolder) {
      baseFolder = await Folder.create({
        id: message.id,
        name: game.user.name,
        type: "Journal",
        parent: null
      });
    }
    return baseFolder;
  },
  async setNoteRevealedArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw Logger.error("requestEventArr | inAttributes must be of type array");
    }
    const [notedata, visible] = inAttributes;
    this.setNoteRevealed(notedata, visible);
  },
  async setNoteRevealed(notedata, visible) {
    PinCushion.setNoteRevealed(notedata, visible);
  }
};
const API$1 = API;
let pinCushionSocket;
function registerSocket() {
  Logger.debug("Registered pinCushionSocket");
  if (pinCushionSocket) {
    return pinCushionSocket;
  }
  pinCushionSocket = socketlib.registerModule(CONSTANTS.MODULE_ID);
  pinCushionSocket.register("requestEvent", (...args) => API$1.requestEventArr(...args));
  pinCushionSocket.register("setNoteRevealed", (...args) => API$1.setNoteRevealedArr(...args));
  game.modules.get(CONSTANTS.MODULE_ID).socket = pinCushionSocket;
  return pinCushionSocket;
}
__name(registerSocket, "registerSocket");
function registerHandlebarsHelpers() {
  Handlebars.registerHelper({
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
      return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    }
  });
  Handlebars.registerHelper("lowercase", function(str) {
    return str.toLowerCase();
  });
  Handlebars.registerHelper("log", function(log) {
    console.log(log);
  });
}
__name(registerHandlebarsHelpers, "registerHandlebarsHelpers");
Hooks.once("init", function() {
  Logger.log(` init ${CONSTANTS.MODULE_ID}`);
  globalThis.PinCushion = PinCushion;
  registerSettings();
  registerHandlebarsHelpers();
  Hooks.once("socketlib.ready", registerSocket);
  libWrapper.register(
    CONSTANTS.MODULE_ID,
    "NotesLayer.prototype._onClickLeft2",
    PinCushion._onDoubleClick,
    "OVERRIDE"
  );
  const enablePlayerIconAutoOverride = game.settings.get(CONSTANTS.MODULE_ID, "playerIconAutoOverride");
  const isV13 = parseInt(game.version.split(".")[0]) >= 9;
  const prepareDataMethod = isV13 ? "NoteDocument.prototype.prepareData" : "Note.prototype.prepareData";
  const noteConfigGetDataMethod = isV13 && "getData" in NoteConfig.prototype ? "NoteConfig.prototype.getData" : null;
  const noteConfigGetSubmitDataMethod = isV13 && "_getSubmitData" in NoteConfig.prototype ? "NoteConfig.prototype._getSubmitData" : null;
  if (enablePlayerIconAutoOverride) {
    libWrapper.register(CONSTANTS.MODULE_ID, prepareDataMethod, PinCushion._onPrepareNoteData, "WRAPPER");
  }
  if (noteConfigGetDataMethod) {
    libWrapper.register(CONSTANTS.MODULE_ID, noteConfigGetDataMethod, PinCushion._noteConfigGetData);
  }
  if (noteConfigGetSubmitDataMethod) {
    libWrapper.register(CONSTANTS.MODULE_ID, noteConfigGetSubmitDataMethod, PinCushion._noteConfigGetSubmitData);
  }
});
Hooks.once("setup", function() {
  game.modules.get(CONSTANTS.MODULE_ID).api = API$1;
  const forceToShowNotes = game.settings.get(CONSTANTS.MODULE_ID, "forceToShowNotes");
  if (forceToShowNotes) {
    game.settings.set("core", "notesDisplayToggle", true);
  }
  const enableAutoScaleNamePlatesNote = game.settings.get(CONSTANTS.MODULE_ID, "enableAutoScaleNamePlatesNote");
  if (enableAutoScaleNamePlatesNote) {
    Hooks.once("canvasReady", () => {
      Hooks.on("canvasPan", (c) => {
        if (game.scenes.get(c.scene.id).isView) {
          PinCushion.autoScaleNotes(c);
        }
      });
    });
  }
});
Hooks.once("ready", function() {
  if (!game.modules.get("lib-wrapper")?.active && game.user?.isGM) {
    let word = "install and activate";
    if (game.modules.get("lib-wrapper"))
      word = "activate";
    throw Logger.error(`Requires the 'libWrapper' module. Please ${word} it.`);
  }
  if (!game.modules.get("socketlib")?.active && game.user?.isGM) {
    let word = "install and activate";
    if (game.modules.get("socketlib"))
      word = "activate";
    throw Logger.error(`Requires the 'socketlib' module. Please ${word} it.`);
  }
});
Hooks.on("renderNoteConfig", async (app, html, noteData) => {
  let noteElement;
  const $html = ensureJquery(html);
  if (game.release.generation < 13) {
    noteElement = app.object;
  } else {
    noteElement = app.document;
  }
  const selector = ".form-body.standard-form.scrollable";
  if (app._savedScrollTop !== void 0) {
    const el = $html.find(selector)[0];
    if (el)
      el.scrollTop = app._savedScrollTop;
  }
  const scrollableEl = $html.find(selector)[0];
  if (scrollableEl) {
    scrollableEl.addEventListener("scroll", () => {
      app._savedScrollTop = scrollableEl.scrollTop;
    });
  }
  if (!noteElement.flags[CONSTANTS.MODULE_ID]) {
    noteElement.flags[CONSTANTS.MODULE_ID] = {};
  }
  noteElement.flags[CONSTANTS.MODULE_ID] || {};
  const showJournalImageByDefault = game.settings.get(CONSTANTS.MODULE_ID, "showJournalImageByDefault");
  if (
    // eslint-disable-next-line prettier/prettier
    showJournalImageByDefault && noteData.document.entryId && !noteElement.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.CUSHION_ICON)
  ) {
    const journal = game.journal.get(noteData.document.entryId);
    if (journal) {
      const journalEntryImage = retrieveFirstImageFromJournalId(journal.id, noteElement?.pageId, false);
      if (journalEntryImage) {
        foundry.utils.setProperty(
          noteData.document.texture,
          "src",
          stripQueryStringAndHashFromPath(journalEntryImage)
        );
      }
    } else {
      Logger.warn(`The journal with id '${noteData.document.entryId}' do not exists anymore`);
    }
  }
  const defaultNoteImageOnCreate = game.settings.get(CONSTANTS.MODULE_ID, "defaultNoteImageOnCreate");
  let tmp = void 0;
  if (noteData.icon.custom) {
    tmp = stripQueryStringAndHashFromPath(noteData.icon.custom);
  } else if (noteElement.texture.src) {
    tmp = stripQueryStringAndHashFromPath(noteElement.texture.src);
  } else if (noteData.document.texture.src) {
    tmp = stripQueryStringAndHashFromPath(noteData.document.texture.src);
  }
  if (tmp === "icons/svg/book.svg" && noteData.icon.custom) {
    tmp = stripQueryStringAndHashFromPath(noteData.icon.custom);
  }
  if (tmp === "icons/svg/book.svg" && defaultNoteImageOnCreate) {
    tmp = stripQueryStringAndHashFromPath(defaultNoteImageOnCreate);
  }
  if (tmp === "icons/svg/book.svg" && noteData.document.texture.src) {
    tmp = stripQueryStringAndHashFromPath(noteData.document.texture.src);
  }
  const pinCushionIcon = foundry.utils.getProperty(
    noteElement.flags,
    `${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.CUSHION_ICON}`
  );
  if (pinCushionIcon) {
    tmp = stripQueryStringAndHashFromPath(pinCushionIcon);
  }
  PinCushion._replaceIconSelector(app, $html, noteData, tmp);
  foundry.utils.setProperty(noteElement.flags[CONSTANTS.MODULE_ID], CONSTANTS.FLAGS.CUSHION_ICON, tmp);
  const enableNoteGM = game.settings.get(CONSTANTS.MODULE_ID, "noteGM");
  if (enableNoteGM) {
    PinCushion._addNoteGM(app, $html, noteData);
  }
  const enableJournalAnchorLink = game.settings.get(CONSTANTS.MODULE_ID, "enableJournalAnchorLink");
  if (enableJournalAnchorLink && !game.modules.get("jal")?.active) {
    let getOptions2 = function(page, current) {
      let options = "<option></option>";
      for (const key in page?.toc) {
        const section = page.toc[key];
        options += `<option value="${section.slug}"${section.slug === current ? " selected" : ""}>${section.text}</option>`;
      }
      return options;
    }, _updateSectionList2 = function() {
      const newjournalid = app.form.elements.entryId?.value;
      const newpageid = app.form.elements.pageId?.value;
      const journal = game.journal.get(newjournalid);
      const newpage = journal?.pages.get(newpageid);
      Logger.log(`selected page changed to ${newpageid}`);
      Logger.log(`new options =${getOptions2(newpage, anchorData?.slug)}`);
      app.form.elements["flags.anchor.slug"].innerHTML = getOptions2(newpage, anchorData?.slug);
      Logger.log(
        // "new innerHtml" + app.form.elements[`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.JAL_ANCHOR}.slug`].innerHTML
        `new innerHtml${app.form.elements["flags.anchor.slug"].innerHTML}`
      );
    };
    var getOptions = getOptions2, _updateSectionList = _updateSectionList2;
    __name(getOptions2, "getOptions");
    __name(_updateSectionList2, "_updateSectionList");
    let anchorData = foundry.utils.getProperty(noteData.document.flags, "anchor");
    let pageData = noteData.document.page;
    let select = $(`
		<div class='form-group'>
			<label>${Logger.i18n(`${CONSTANTS.MODULE_ID}.PageSection`)}</label>
			<div class='form-fields'>
				<select name="flags.anchor.slug">
					${getOptions2(pageData, anchorData?.slug)}
				</select>
			</div>
		</div>`);
    const pageid = $html.find("select[name='pageId']");
    pageid.parent().parent().after(select);
    $html.find("select[name='entryId']").change(_updateSectionList2);
    pageid.change(_updateSectionList2);
  }
  if (!app._minimized) {
    let pos = app.position;
    pos.height = "auto";
    app.setPosition(pos);
  }
  if (!game.user.isGM) {
    return;
  }
  const showImageExplicitSource = stripQueryStringAndHashFromPath(
    noteElement.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SHOW_IMAGE_EXPLICIT_SOURCE) ?? ""
  );
  const showImage = noteElement.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SHOW_IMAGE) ?? false;
  const pinIsTransparent = noteElement.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PIN_IS_TRANSPARENT) ?? false;
  const showOnlyToGM = noteElement.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SHOW_ONLY_TO_GM) ?? false;
  const hasBackground = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HAS_BACKGROUND) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HAS_BACKGROUND)) ?? 0;
  const ratio = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.RATIO_WIDTH)) ?? 1;
  const textAlwaysVisible = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TEXT_ALWAYS_VISIBLE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TEXT_ALWAYS_VISIBLE)) ?? false;
  const hideLabel = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HIDE_LABEL)) ?? false;
  const numberWsSuffixOnNameplate = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_WS_SUFFIX_ON_NAMEPLATE)) ?? 0;
  const numberHsSuffixOnNameplate = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_HS_SUFFIX_ON_NAMEPLATE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.NUMBER_HS_SUFFIX_ON_NAMEPLATE)) ?? 0;
  const enablePlayerIcon = game.settings.get(CONSTANTS.MODULE_ID, "playerIconAutoOverride");
  const defaultState = game.settings.get(CONSTANTS.MODULE_ID, "playerIconAutoOverride") ?? "";
  const defaultPath = game.settings.get(CONSTANTS.MODULE_ID, "playerIconPathDefault") ?? "";
  const playerIconState = foundry.utils.getProperty(
    noteData,
    `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_ICON_STATE}`
  ) ?? defaultState;
  const playerIconPath = stripQueryStringAndHashFromPath(
    foundry.utils.getProperty(
      noteData,
      `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_ICON_PATH}`
    ) ?? defaultPath
  );
  const enableNoteTintColorLink = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotes");
  let pinIsRevealed = foundry.utils.getProperty(
    noteData,
    `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PIN_IS_REVEALED}`
  ) ?? true;
  let usePinIsRevealed = foundry.utils.getProperty(
    noteData,
    `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.USE_PIN_REVEALED}`
  ) ?? false;
  let doNotShowJournalPreviewS = String(
    app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.DO_NOT_SHOW_JOURNAL_PREVIEW) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.DO_NOT_SHOW_JOURNAL_PREVIEW)
  );
  if (doNotShowJournalPreviewS !== "true" && doNotShowJournalPreviewS !== "false") {
    if (game.settings.get(CONSTANTS.MODULE_ID, "enableTooltipByDefault")) {
      doNotShowJournalPreviewS = "false";
    } else {
      doNotShowJournalPreviewS = "true";
    }
  }
  const doNotShowJournalPreview = String(doNotShowJournalPreviewS) === "true";
  const previewAsTextSnippet = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PREVIEW_AS_TEXT_SNIPPET) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.PREVIEW_AS_TEXT_SNIPPET)) ?? false;
  const tooltipPlacement = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_PLACEMENT) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_PLACEMENT)) ?? "e";
  const tooltipColor = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_COLOR) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_COLOR)) ?? "";
  const tooltipForceRemove = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_FORCE_REMOVE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_FORCE_REMOVE)) ?? false;
  const tooltipSmartPlacement = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SMART_PLACEMENT) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SMART_PLACEMENT)) ?? false;
  const tooltipFollowMouse = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_FOLLOW_MOUSE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_FOLLOW_MOUSE)) ?? false;
  const tooltipPlacementHtml = `
		<select
		id="pin-cushion-tooltip-placement"
		style="width: 100%;"
		name="flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.TOOLTIP_PLACEMENT}">
		<option
			value="nw-alt"
			${tooltipPlacement === "nw-alt" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.north-west-alt")}
		</option>
		<option
			value="nw"
			${tooltipPlacement === "nw" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.north-west")}
		</option>
		<option
			value="n"
			${tooltipPlacement === "n" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.north")}
			</option>
		<option
			value="ne"
			${tooltipPlacement === "ne" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.north-east")}
			</option>
		<option
			value="ne-alt"
			${tooltipPlacement === "ne-alt" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.north-east-alt")}
			</option>
		<option
			value="w"
			${tooltipPlacement === "w" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.west")}
			</option>
		<option
			value="e"
			${tooltipPlacement === "e" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.east")}
			</option>
		<option
			value="sw-alt"
			${tooltipPlacement === "sw-alt" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.south-west-alt")}
			</option>
		<option
			value="sw"
			${tooltipPlacement === "sw" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.south-west")}
		</option>
		<option
			value="s"
			${tooltipPlacement === "s" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.south")}
		</option>
		<option
			value="se"
			${tooltipPlacement === "se" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.south-east")}
		</option>
		<option
			value="se-alt"
			${tooltipPlacement === "se-alt" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Placement.choices.south-east-alt")}
		</option>
		</select>
	`;
  const tooltipColorHtml = `
<select
    id="pin-cushion-tooltip-color"
    style="width: 100%;"
    name="flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.TOOLTIP_COLOR}">
    <option value="" ${tooltipColor === "" ? "selected" : ""}>
        ${Logger.i18n("pin-cushion.Tooltip.Color.choices.default")}
    </option>
    <option
        <value="blue" ${tooltipColor === "blue" ? "selected" : ""}>
        ${Logger.i18n("pin-cushion.Tooltip.Color.choices.blue")}
    </option>
    <option value="dark" ${tooltipColor === "dark" ? "selected" : ""}>
    ${Logger.i18n("pin-cushion.Tooltip.Color.choices.dark")}
		</option>
		<option
		value="green"
		${tooltipColor === "green" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Color.choices.green")}
		</option>
		<option
		value="light"
		${tooltipColor === "light" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Color.choices.light")}
		</option>
		<option
		value="orange"
		${tooltipColor === "orange" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Color.choices.orange")}
		</option>
		<option value="purple"
		${tooltipColor === "purple" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Color.choices.purple")}
		</option>
		<option
		value="red"
		${tooltipColor === "red" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Color.choices.red")}
		</option>
		<option
		value="yellow"
		${tooltipColor === "yellow" ? "selected" : ""}>
			${Logger.i18n("pin-cushion.Tooltip.Color.choices.yellow")}
		</option>
	</select>
	`;
  const tooltipCustomDescription = (app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_CUSTOM_DESCRIPTION) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_CUSTOM_DESCRIPTION)) ?? "";
  let tooltipShowDescriptionS = String(
    app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SHOW_DESCRIPTION) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SHOW_DESCRIPTION)
  );
  if (tooltipShowDescriptionS !== "true" && tooltipShowDescriptionS !== "false") {
    tooltipShowDescriptionS = "true";
  }
  const tooltipShowDescription = String(tooltipShowDescriptionS) === "true";
  let tooltipShowTitleS = String(
    app.document ? app.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SHOW_TITLE) : app.object.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TOOLTIP_SHOW_TITLE)
  );
  if (tooltipShowTitleS !== "true" && tooltipShowTitleS !== "false") {
    tooltipShowTitleS = "true";
  }
  const tooltipShowTitle = String(tooltipShowTitleS) === "true";
  const enableBackgroundlessPins = game.settings.get(CONSTANTS.MODULE_ID, "enableBackgroundlessPins");
  let pinCushionData = foundry.utils.mergeObject(
    {
      yesUploadFile: game.user.can("FILES_BROWSE"),
      noUploadFile: !game.user.can("FILES_BROWSE"),
      showImageExplicitSource,
      showImage,
      pinIsTransparent,
      showOnlyToGM,
      hasBackground,
      ratio,
      textAlwaysVisible,
      hideLabel,
      numberWsSuffixOnNameplate,
      numberHsSuffixOnNameplate,
      enablePlayerIcon,
      playerIconState,
      playerIconPath,
      enableNoteTintColorLink,
      pinIsRevealed,
      usePinIsRevealed,
      previewAsTextSnippet,
      doNotShowJournalPreview,
      tooltipPlacement,
      tooltipColor,
      tooltipForceRemove,
      tooltipSmartPlacement,
      tooltipFollowMouse,
      enableBackgroundlessPins,
      enableNoteGM,
      tooltipColorHtml,
      tooltipPlacementHtml,
      tooltipCustomDescription,
      tooltipShowDescription,
      tooltipShowTitle
    },
    noteElement.flags[CONSTANTS.MODULE_ID] || {}
  );
  let noteHtml = await renderTemplate$1(`modules/${CONSTANTS.MODULE_ID}/templates/note-config.html`, pinCushionData);
  const body = $html.find(".form-body.standard-form.scrollable");
  if (body.length) {
    body.append(noteHtml);
  } else {
    console.warn("form-body container not found in NoteConfig HTML");
  }
  function activateFilePickerCompat(app2, html2, selector2) {
    const button = html2.find(selector2);
    if (foundry.utils.isNewerVersion(game.version, "12")) {
      button.on("click", (event) => {
        foundry.applications.apps.FilePicker.implementation.fromButton(event.currentTarget);
      });
    } else {
      button.on("click", app2._activateFilePicker.bind(app2));
    }
  }
  __name(activateFilePickerCompat, "activateFilePickerCompat");
  activateFilePickerCompat(app, $html, 'button[data-target="flags.pin-cushion.showImageExplicitSource"]');
  activateFilePickerCompat(app, $html, 'button[data-target="flags.pin-cushion.PlayerIconPath"]');
  const input = $html.find('input[name="flags.pin-cushion.showImageExplicitSource"]');
  const img = $html.find(".pin-cushion-explicit-icon");
  input.on("change", () => {
    img.attr("src", input.val().trim());
  });
  const iconCustomSelectorExplicit = $html.find(
    `input[name='flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.SHOW_IMAGE_EXPLICIT_SOURCE}']`
  );
  if (iconCustomSelectorExplicit?.length > 0) {
    iconCustomSelectorExplicit.on("change", function() {
      const p = iconCustomSelectorExplicit.parent().find(".pin-cushion-explicit-icon");
      p[0].src = this.value;
    });
  }
  const iconCustomPlayerIconPath = $html.find(
    `input[name='flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.PLAYER_ICON_PATH}']`
  );
  if (iconCustomPlayerIconPath?.length > 0) {
    iconCustomPlayerIconPath.on("change", function() {
      const p = iconCustomPlayerIconPath.parent().find(".pin-cushion-journal-icon");
      p[0].src = this.value;
    });
  }
  const iconCustomPageIcon = $html.find("select[name='pageId']");
  if (iconCustomPageIcon?.length > 0) {
    iconCustomPageIcon.on("change", function() {
      const p = iconCustomPageIcon.parent().find(".pin-cushion-page-icon");
      const pageId = this.value;
      if ($html.find("select[name='entryId']").length > 0) {
        const entryId = $html.find("select[name='entryId']")[0].value;
        const firstImageFromPage = retrieveFirstImageFromJournalId(entryId, pageId, true);
        if (firstImageFromPage) {
          p[0].src = firstImageFromPage;
        }
      }
    });
  }
  const inputs = $html.find('input[name^="flags.pin-cushion."], select[name^="flags.pin-cushion."]');
  const scrollableElement = $html.find(".form-body.standard-form.scrollable")[0];
  const scrollTop = scrollableElement?.scrollTop || 0;
  const newScrollableElement = $html.find(".form-body.standard-form.scrollable")[0];
  if (newScrollableElement)
    newScrollableElement.scrollTop = scrollTop;
  inputs.on("change", async (event) => {
    const input2 = event.target;
    const fullName = input2.name;
    const flagName = fullName.replace("flags.pin-cushion.", "");
    let value;
    if (input2.type === "checkbox") {
      value = input2.checked;
    } else if (input2.type === "number") {
      value = input2.value === "" ? null : Number(input2.value);
    } else {
      value = input2.value;
    }
    await noteElement.setFlag("pin-cushion", flagName, value);
    app.render(true);
  });
});
Hooks.on("renderNoteHUD", (app, html, data) => {
  const $html = ensureJquery(html);
  $html.append('<template id="pin-cushion-hud"></template>');
  canvas.hud.pinCushion = new PinCushionHUD();
});
Hooks.on("canvasReady", () => {
  if (!canvas.hud)
    canvas.hud = {};
  canvas.hud.pinCushion = new PinCushionHUD();
});
Hooks.on("hoverNote", (note, hovered) => {
  const previewDelay = game.settings.get(CONSTANTS.MODULE_ID, "previewDelay");
  const doNotShow = String(
    foundry.utils.getProperty(
      note,
      `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.DO_NOT_SHOW_JOURNAL_PREVIEW}`
    )
  ) === "true";
  if (doNotShow)
    return;
  const tooltipForceRemove = String(
    foundry.utils.getProperty(
      note,
      `document.flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.TOOLTIP_FORCE_REMOVE}`
    )
  ) === "true";
  if (!hovered) {
    clearTimeout(API$1.pinCushion.hoverTimer);
    if (tooltipForceRemove)
      $("#powerTip").remove();
    if (API$1.pinCushion.hud) {
      API$1.pinCushion.hud.close({ force: true });
      API$1.pinCushion.hud = null;
      API$1.pinCushion.hoverTimer = 0;
    }
    return;
  }
  clearTimeout(API$1.pinCushion.hoverTimer);
  API$1.pinCushion.hoverTimer = setTimeout(() => {
    if (API$1.pinCushion.hud) {
      API$1.pinCushion.hud.close({ force: true });
    }
    API$1.pinCushion.hud = new PinCushionHUD(note);
    console.log(API$1.pinCushion.hud);
    API$1.pinCushion.hud.render(true);
  }, previewDelay);
});
Hooks.on("renderJournalDirectory", (app, html, data) => {
  PinCushion._addJournalThumbnail(app, html, data);
  PinCushion._addJournalDirectoryPages(app, html, data);
});
Hooks.on("deleteJournalEntryPage", () => {
  PinCushion._deleteJournalDirectoryPagesEntry();
});
Hooks.on("createJournalEntryPage", () => {
  PinCushion._createJournalDirectoryPagesEntry();
});
Hooks.on("renderJournalSheet", (app, html, data) => {
  PinCushion._renderJournalThumbnail(app, html);
});
Hooks.once("canvasInit", () => {
  if (game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, "noteGM")) {
    if (foundry.utils.isNewerVersion("12", game.version)) {
      libWrapper.register(
        CONSTANTS.MODULE_ID,
        "Note.prototype.text",
        PinCushion._textWithNoteGM,
        libWrapper.MIXED
      );
    } else {
      libWrapper.register(
        CONSTANTS.MODULE_ID,
        "NoteDocument.prototype.label",
        PinCushion._labelWithNoteGM,
        libWrapper.MIXED
      );
    }
  } else {
    libWrapper.register(
      CONSTANTS.MODULE_ID,
      "Note.prototype._refreshTooltip",
      PinCushion._addDrawTooltip2,
      "MIXED"
    );
  }
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype._applyRenderFlags", PinCushion._applyRenderFlags, "MIXED");
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype.refresh", PinCushion._noteRefresh, "WRAPPER");
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype._onUpdate", PinCushion._noteUpdate, "WRAPPER");
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype.isVisible", PinCushion._isVisible, "MIXED");
  libWrapper.register(
    CONSTANTS.MODULE_ID,
    "Note.prototype._drawControlIcon",
    PinCushion._drawControlIcon,
    "OVERRIDE"
  );
  libWrapper.register(CONSTANTS.MODULE_ID, "Note.prototype._canControl", PinCushion._canControl, "MIXED");
});
Hooks.on("renderSettingsConfig", (app, html, data) => {
  const $html = ensureJquery(html);
  let name;
  let colour;
  name = `${CONSTANTS.MODULE_ID}.revealedNotesTintColorLink`;
  colour = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotesTintColorLink");
  $("<input>").attr("type", "color").attr("data-edit", name).val(colour).insertAfter($(`input[name="${name}"]`, $html).addClass("color"));
  name = `${CONSTANTS.MODULE_ID}.revealedNotesTintColorNotLink`;
  colour = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotesTintColorNotLink");
  $("<input>").attr("type", "color").attr("data-edit", name).val(colour).insertAfter($(`input[name="${name}"]`, $html).addClass("color"));
  name = `${CONSTANTS.MODULE_ID}.revealedNotesTintColorRevealed`;
  colour = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotesTintColorRevealed");
  $("<input>").attr("type", "color").attr("data-edit", name).val(colour).insertAfter($(`input[name="${name}"]`, $html).addClass("color"));
  name = `${CONSTANTS.MODULE_ID}.revealedNotesTintColorNotRevealed`;
  colour = game.settings.get(CONSTANTS.MODULE_ID, "revealedNotesTintColorNotRevealed");
  $("<input>").attr("type", "color").attr("data-edit", name).val(colour).insertAfter($(`input[name="${name}"]`, $html).addClass("color"));
});
Hooks.on("dropCanvasData", (canvas2, data) => {
  const enableJournalAnchorLink = game.settings.get(CONSTANTS.MODULE_ID, "enableJournalAnchorLink");
  if (enableJournalAnchorLink && !game.modules.get("jal")?.active) {
    if (!(data.type === "JournalEntryPage" && data.anchor)) {
      return;
    }
    const { anchor } = data;
    Hooks.once("renderNoteConfig", (_, html, { label }) => {
      html.find("input[name='text']").val(`${label}: ${anchor.name}`);
      html.find(`option[value=${anchor.slug}]`).attr("selected", true);
    });
  }
});
Hooks.on("activateNote", (note, options) => {
  const enableJournalAnchorLink = game.settings.get(CONSTANTS.MODULE_ID, "enableJournalAnchorLink");
  if (enableJournalAnchorLink && !game.modules.get("jal")?.active) {
    let anchorData = foundry.utils.getProperty(note, "document.flags.anchor.slug");
    options.anchor = anchorData?.slug;
  }
});
function ensureJquery(html) {
  if (html instanceof jQuery)
    return html;
  if (html instanceof HTMLElement)
    return $(html);
  return $(html);
}
__name(ensureJquery, "ensureJquery");
async function renderTemplate$1(path, data) {
  if (game.release.generation > 12) {
    return foundry.applications.handlebars.renderTemplate(path, data);
  } else {
    return renderTemplate$1(path, data);
  }
}
__name(renderTemplate$1, "renderTemplate$1");
//# sourceMappingURL=module.js.map
