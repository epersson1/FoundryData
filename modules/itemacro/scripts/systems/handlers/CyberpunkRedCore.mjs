import {BaseSystem} from "../BaseSystem.mjs";

export class CyberpunkRedCore extends BaseSystem {
  static system = 'cyberpunk-red-core';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

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
}