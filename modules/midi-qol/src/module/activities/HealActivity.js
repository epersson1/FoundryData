var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
import { debugEnabled, warn } from "../../midi-qol.js";
import { ReplaceDefaultActivities, configSettings } from "../settings.js";
import { MidiActivityMixin, MidiActivityMixinSheet } from "./MidiActivityMixin.js";
export var MidiHealActivity;
export var MidiHealSheet;
export function setupHealActivity() {
	if (debugEnabled > 0)
		warn("MidiQOL | HealActivity | setupHealActivity | Called");
	//@ts-expect-error
	const GameSystemConfig = game.system.config;
	//@ts-expect-error
	MidiHealSheet = defineMidiHealSheetClass(game.system.applications.activity.HealSheet);
	MidiHealActivity = defineMidiHealActivityClass(GameSystemConfig.activityTypes.heal.documentClass);
	if (ReplaceDefaultActivities) {
		// GameSystemConfig.activityTypes["dnd5eHeal"] = GameSystemConfig.activityTypes.heal;
		GameSystemConfig.activityTypes.heal = { documentClass: MidiHealActivity };
	}
	else {
		GameSystemConfig.activityTypes["midiHeal"] = { documentClass: MidiHealActivity };
	}
}
let defineMidiHealActivityClass = (ActivityClass) => {
	var _a, _b, _MidiHealActivity_rollDamage;
	return _a = class MidiHealActivity extends (_b = MidiActivityMixin(ActivityClass)) {
			get possibleOtherActivity() {
				return true;
			}
			async rollDamage(config = {}, dialog = {}, message = {}) {
				var _c, _d;
				config.midiOptions ?? (config.midiOptions = {});
				(_c = config.midiOptions).fastForwardHeal ?? (_c.fastForwardHeal = game.user?.isGM ? configSettings.gmAutoFastForwardDamage : ["all", "damage"].includes(configSettings.autoFastForward));
				(_d = config.midiOptions).fastForwardDamage ?? (_d.fastForwardDamage = game.user?.isGM ? configSettings.gmAutoFastForwardDamage : ["all", "damage"].includes(configSettings.autoFastForward));
				return super.rollDamage(config, dialog, message);
			}
			/*
			getDamageConfig(config: any ={}) {
			if ( !this.healing.formula ) return foundry.utils.mergeObject({ rolls: [] }, config);
		
			const rollConfig:any = foundry.utils.mergeObject({ critical: { allow: false }, scaling: 0 }, config);
			const rollData = this.getRollData();
			rollConfig.rolls = [this._processDamagePart(this.healing, rollConfig, rollData)].concat(config.rolls ?? []);
		
			return rollConfig;
			}
			*/
			async _triggerSubsequentActions(config, results) {
			}
		},
		_MidiHealActivity_rollDamage = function _MidiHealActivity_rollDamage(event, target, message) {
			//@ts-expect-error
			return this.rollDamage(event);
		},
		_a.LOCALIZATION_PREFIXES = [...Reflect.get(_b, "LOCALIZATION_PREFIXES", _a), "midi-qol.HEAL"],
		_a.metadata = foundry.utils.mergeObject(Reflect.get(_b, "metadata", _a), {
			title: configSettings.activityNamePrefix ? "midi-qol.HEAL.Title.one" : ActivityClass.metadata.title,
			dnd5eTitle: ActivityClass.metadata.title,
			sheetClass: MidiHealSheet,
			usage: {
				chatCard: "modules/midi-qol/templates/activity-card.hbs",
				actions: {
					rollDamage: __classPrivateFieldGet(_a, _a, "m", _MidiHealActivity_rollDamage)
				}
			},
		}, { inplace: false, insertKeys: true, insertValues: true }),
		_a;
};
export function defineMidiHealSheetClass(baseClass) {
	var _a, _b;
	return _a = class MidiHealSheet extends (_b = MidiActivityMixinSheet(baseClass)) {
		},
		_a.PARTS = {
			...Reflect.get(_b, "PARTS", _a),
			effect: {
				template: "modules/midi-qol/templates/activity/heal-effect.hbs",
				templates: [
					...Reflect.get(_b, "PARTS", _a).effect.templates
				]
			}
		},
		_a;
}
