import {BaseSystem} from "../BaseSystem.mjs";

export class Pathfinder2e extends BaseSystem {
  static system = 'pf2e';

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