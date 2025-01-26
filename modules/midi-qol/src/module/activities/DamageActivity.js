import { debugEnabled, warn } from "../../midi-qol.js";
import { ReplaceDefaultActivities, configSettings } from "../settings.js";
import { MidiActivityMixin, MidiActivityMixinSheet } from "./MidiActivityMixin.js";
export var MidiDamageActivity;
export var MidiDamageSheet;
export function setupDamageActivity() {
	if (debugEnabled > 0)
		warn("MidiQOL | DamageActivity | setupDamageActivity | Called");
	//@ts-expect-error
	const GameSystemConfig = game.system.config;
	//@ts-expect-error
	MidiDamageSheet = defineMidiDamageSheetClass(game.system.applications.activity.DamageSheet);
	MidiDamageActivity = defineMidiDamageActivityClass(GameSystemConfig.activityTypes.damage.documentClass);
	if (ReplaceDefaultActivities) {
		// GameSystemConfig.activityTypes["dnd5eDamage"] = GameSystemConfig.activityTypes.damage;
		GameSystemConfig.activityTypes.damage = { documentClass: MidiDamageActivity };
	}
	else {
		GameSystemConfig.activityTypes["midiDamage"] = { documentClass: MidiDamageActivity };
	}
}
let defineMidiDamageActivityClass = (ActivityClass) => {
	var _a, _b;
	return _a = class MidiDamageActivity extends (_b = MidiActivityMixin(ActivityClass)) {
			get possibleOtherActivity() {
				return true;
			}
			async rollDamage(config, dialog, message) {
				var _a;
				config.midiOptions ?? (config.midiOptions = {});
				(_a = config.midiOptions).fastForwardDamage ?? (_a.fastForwardDamage = game.user?.isGM ? configSettings.gmAutoFastForwardDamage : ["all", "damage"].includes(configSettings.autoFastForward));
				return super.rollDamage(config, dialog, message);
			}
			async _triggerSubsequentActions(config, results) {
			}
		},
		_a.LOCALIZATION_PREFIXES = [...Reflect.get(_b, "LOCALIZATION_PREFIXES", _a), "midi-qol.DAMAGE"],
		_a.metadata = foundry.utils.mergeObject(Reflect.get(_b, "metadata", _a), {
			title: configSettings.activityNamePrefix ? "midi-qol.DAMAGE.Title.one" : ActivityClass.metadata.title,
			dnd5eTitle: ActivityClass.metadata.title,
			sheetClass: MidiDamageSheet,
			usage: {
				chatCard: "modules/midi-qol/templates/activity-card.hbs",
			},
		}, { inplace: false, insertKeys: true, insertValues: true }),
		_a;
};
export function defineMidiDamageSheetClass(baseClass) {
	var _a, _b;
	return _a = class MidiDamageSheet extends (_b = MidiActivityMixinSheet(baseClass)) {
		},
		_a.PARTS = {
			...Reflect.get(_b, "PARTS", _a),
			effect: {
				template: "modules/midi-qol/templates/activity/damage-effect.hbs",
				templates: [
					...Reflect.get(_b, "PARTS", _a).effect.templates
				]
			}
		},
		_a;
}
