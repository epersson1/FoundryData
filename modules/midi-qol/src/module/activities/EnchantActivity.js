import { debugEnabled, warn } from "../../midi-qol.js";
import { ReplaceDefaultActivities, configSettings } from "../settings.js";
import { MidiActivityMixin, MidiActivityMixinSheet } from "./MidiActivityMixin.js";
export var MidiEnchantActivity;
export var MidiEnchantSheet;
export function setupEnchantActivity() {
	if (debugEnabled > 0)
		warn("MidiQOL | EnchantActivity | setupEnchantActivity | Called");
	//@ts-expect-error
	const GameSystemConfig = game.system.config;
	//@ts-expect-error
	MidiEnchantSheet = defineMidiEnchantSheetClass(game.system.applications.activity.EnchantSheet);
	MidiEnchantActivity = defineMidiEnchantActivityClass(GameSystemConfig.activityTypes.enchant.documentClass);
	if (ReplaceDefaultActivities) {
		// GameSystemConfig.activityTypes["dnd5eEnchant"] = GameSystemConfig.activityTypes.enchant;
		GameSystemConfig.activityTypes.enchant = { documentClass: MidiEnchantActivity };
	}
	else {
		GameSystemConfig.activityTypes["midiEnchant"] = { documentClass: MidiEnchantActivity };
	}
}
let defineMidiEnchantActivityClass = (ActivityClass) => {
	var _a, _b;
	return _a = class MidiEnchantActivity extends (_b = MidiActivityMixin(ActivityClass)) {
			get possibleOtherActivity() {
				return false;
			}
			async _triggerSubsequentActions(config, results) {
			}
		},
		_a.LOCALIZATION_PREFIXES = [...Reflect.get(_b, "LOCALIZATION_PREFIXES", _a), "midi-qol.ENCHANT"],
		_a.metadata = foundry.utils.mergeObject(Reflect.get(_b, "metadata", _a), {
			title: configSettings.activityNamePrefix ? "midi-qol.ENCHANT.Title.one" : ActivityClass.metadata.title,
			dnd5eTitle: ActivityClass.metadata.title,
			sheetClass: MidiEnchantSheet,
			usage: {
				// chatCard: "modules/midi-qol/templates/activity-card.hbs",
				dialog: ActivityClass.metadata.usage.dialog,
			},
		}, { inplace: false, insertKeys: true, insertValues: true }),
		_a;
};
export function defineMidiEnchantSheetClass(baseClass) {
	var _a, _b;
	return _a = class MidiEnchantSheet extends (_b = MidiActivityMixinSheet(baseClass)) {
		},
		_a.PARTS = {
			...Reflect.get(_b, "PARTS", _a),
			effect: {
				template: "modules/midi-qol/templates/activity/enchant-effect.hbs",
				templates: [
					...Reflect.get(_b, "PARTS", _a).effect.templates
				]
			}
		},
		_a;
}
