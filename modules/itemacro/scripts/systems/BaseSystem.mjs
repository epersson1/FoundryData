export class BaseSystem {
  static system;

  /**
   * @return {string}
   */
  static get system() {
    if (this.system)
      return this.system;

    throw new Error(`${this.constructor.name} must populate the #system property.`);
  }

  static set system(value) {
    throw new Error(`Attempted to override ${this.constructor.name}#system property with ${value} value. Property is read-only.`);
  }

  /**
   *
   * @returns {{rendered: {}, onChange: *[], render: {}}}
   */
  get sheetRenderHooks() {
    return {render: {}, rendered: {}, onChange: []};
  }

  /**
   * @param {{}} settingsData
   * @return void
   */
  registerSettings(settingsData) {
    throw new Error(`${this.constructor.name} must implement the registerSettings method.`);
  }

  /**
   * @return void
   */
  registerHooks() {
    throw new Error(`${this.constructor.name} must implement the registerHooks method.`);
  }


  /**
   * @return void
   */
  registerSheetListeners() {
    throw new Error(`${this.constructor.name} must implement the registerSheetListeners method.`);
  }


  /**
   * @return void
   */
  registerOther() {
    throw new Error(`${this.constructor.name} must implement the registerOther method.`);
  }

  /**
   * @param {ItemMacro} macro
   * @returns {boolean}
   */
  systemValidation(macro) {
    return true;
  }

  /**
   *
   * @param {ItemMacro} macro
   */
  systemMigration(macro) {}

  get itemTag() {
    return game.system.hasOwnProperty('itemTag') ? game.system.itemTag() : '.item';
  }

  get idDataAttr() {
    return "data-item-id";
  }
}