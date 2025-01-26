import { debugEnabled, warn } from "../../midi-qol.js";
import { ReplaceDefaultActivities, configSettings } from "../settings.js";
import { asyncHooksCall } from "../utils.js";
import { MidiActivityMixin, MidiActivityMixinSheet } from "./MidiActivityMixin.js";
export var MidiUtilityActivity;
export var MidiUtilitySheet;
export function setupUtilityActivity() {
	if (debugEnabled > 0)
		warn("MidiQOL | UtilityActivity | setupUtilityActivity | Called");
	//@ts-expect-error
	const GameSystemConfig = game.system.config;
	//@ts-expect-error
	MidiUtilitySheet = defineMidiUtilitySheetClass(game.system.applications.activity.UtilitySheet);
	MidiUtilityActivity = defineMidiUtilityActivityClass(GameSystemConfig.activityTypes.utility.documentClass);
	if (ReplaceDefaultActivities) {
		// GameSystemConfig.activityTypes["dnd5eUtility"] = GameSystemConfig.activityTypes.utility;
		GameSystemConfig.activityTypes.utility = { documentClass: MidiUtilityActivity };
	}
	else {
		GameSystemConfig.activityTypes["midiUtility"] = { documentClass: MidiUtilityActivity };
	}
}
let defineMidiUtilityActivityClass = (ActivityClass) => {
	var _a, _b;
	return _a = class MidiUtilityActivity extends (_b = MidiActivityMixin(ActivityClass)) {
			get possibleOtherActivity() {
				return true;
			}
			async rollFormula(config, dialog, message = {}) {
				if (debugEnabled > 0)
					warn("UtilityActivity | rollFormula | Called", config, dialog, message);
				config ?? (config = {});
				dialog ?? (dialog = {});
				message ?? (message = {});
				config.midiOptions ?? (config.midiOptions = {});
				if (debugEnabled > 0) {
					warn("MidiUtilityActivity | rollFormula | Called", config, dialog, message);
				}
				if (await asyncHooksCall("midi-qol.preFormulaRoll", this.workflow) === false
					|| await asyncHooksCall(`midi-qol.preFormulaRoll.${this.item.uuid}`, this.workflow) === false
					|| await asyncHooksCall(`midi-qol.preFormulaRoll.${this.uuid}`, this.workflow) === false) {
					console.warn("midi-qol | UtiliatyActivity | Formula roll blocked via pre-hook");
					return;
				}
				if (config.midiOptions.fastForward !== undefined)
					dialog.configure = !config.midiOptions.fastForwardDamage;
				//@ts-expect-error
				const areKeysPressed = game.system.utils.areKeysPressed;
				const keys = {
					normal: areKeysPressed(config.event, "skipDialogNormal"),
					advantage: areKeysPressed(config.event, "skipDialogAdvantage"),
					disadvantage: areKeysPressed(config.event, "skipDialogDisadvantage")
				};
				if (Object.values(keys).some(k => k))
					dialog.configure = this.midiProperties.forceDialog;
				else
					dialog.configure ?? (dialog.configure = !config.midiOptions.fastForwardDamage || this.midiProperties.forceDialog);
				/*
				else
				dialog.configure = true;
				*/
				if (this.workflow?.rollOptions?.rollToggle)
					dialog.configure = !!!dialog.configure;
				Hooks.once("dnd5e.preRollFormulaV2", (rollConfig, dialogConfig, messageConfig) => {
					return true;
				});
				message.create ?? (message.create = true);
				let result = await super.rollFormula(config, dialog, message);
				// result = await postProcessUtilityRoll(this, config, result);
				if (config.midiOptions.updateWorkflow !== false && this.workflow) {
					this.workflow.utilityRolls = result;
					if (this.workflow.suspended)
						this.workflow.unSuspend.bind(this.workflow)({ utilityRoll: result });
				}
				return result;
			}
			async _usageChatContext(message) {
				const context = await super._usageChatContext(message);
				context.hasRollFormula = true; // TODO fix this when able to do a proper card !!this.roll?.formula;
				return context;
			}
		},
		_a.metadata = foundry.utils.mergeObject(Reflect.get(_b, "metadata", _a), {
			title: configSettings.activityNamePrefix ? "midi-qol.UTILITY.Title.one" : ActivityClass.metadata.title,
			dnd5eTitle: ActivityClass.metadata.title,
			sheetClass: MidiUtilitySheet,
			usage: {
				chatCard: "modules/midi-qol/templates/activity-card.hbs",
			},
		}, { inplace: false, insertKeys: true, insertValues: true }),
		_a;
};
export function defineMidiUtilitySheetClass(baseClass) {
	var _a, _b;
	return _a = class MidiUtilitySheet extends (_b = MidiActivityMixinSheet(baseClass)) {
		},
		_a.PARTS = {
			...Reflect.get(_b, "PARTS", _a),
			effect: {
				template: "modules/midi-qol/templates/activity/utility-effect.hbs",
				templates: [
					...Reflect.get(_b, "PARTS", _a).effect.templates
				]
			}
		},
		_a;
}
