import {BaseSystem} from "../BaseSystem.mjs";
import {settings} from "../../settings.mjs";

export class WorldOfDarkness extends BaseSystem {
  static system = 'worldofdarkness';

  get sheetRenderHooks() {
    const {render, rendered, onChange} = super.sheetRenderHooks;

    render.MageActorSheet = ".vrollable";
    render.MortalActorSheet = ".vrollable";
    render.ChangelingActorSheet = ".vrollable";
    render.ChangingBreedActorSheet = ".vrollable";
    render.DemonActorSheet = ".vrollable";
    render.HunterActorSheet = ".vrollable";
    render.VampireActorSheet = ".vrollable";
    render.WerewolfActorSheet = ".vrollable";
    render.WraithActorSheet = ".vrollable";
    render.CreatureActorSheet = ".vrollable";

    return {render, rendered, onChange};
  }

  registerSettings(settingsData)  {
    settingsData.defaultmacro.config = false;
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

  get idDataAttr() {
    return 'data-itemid';
  }
}