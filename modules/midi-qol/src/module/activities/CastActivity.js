import { debugEnabled, warn } from "../../midi-qol.js";
import { ReplaceDefaultActivities, configSettings } from "../settings.js";
import { MidiActivityMixin, MidiActivityMixinSheet } from "./MidiActivityMixin.js";
export var MidiCastActivity;
export var MidiCastSheet;
export function setupCastActivity() {
	if (debugEnabled > 0)
		warn("MidiQOL | CastActivity | setupCastActivity | Called");
	//@ts-expect-error
	const GameSystemConfig = game.system.config;
	//@ts-expect-error
	MidiCastSheet = defineMidiCastSheetClass(game.system.applications.activity.CastSheet);
	MidiCastActivity = defineMidiCastActivityClass(GameSystemConfig.activityTypes.cast.documentClass);
	if (ReplaceDefaultActivities) {
		// GameSystemConfig.activityTypes["dnd5eCast"] = GameSystemConfig.activityTypes.cast;
		GameSystemConfig.activityTypes.cast = { documentClass: MidiCastActivity };
	}
	else {
		GameSystemConfig.activityTypes["midiCast"] = { documentClass: MidiCastActivity };
	}
}
let defineMidiCastSheetClass = (baseClass) => {
	return class MidiCastSheet extends MidiActivityMixinSheet(baseClass) {
	};
};
let defineMidiCastActivityClass = (ActivityClass) => {
	var _a, _b;
	return _a = class MidiCastActivity extends (_b = MidiActivityMixin(ActivityClass)) {
			get possibleOtherActivity() {
				return false;
			}
		},
		_a.LOCALIZATION_PREFIXES = [...Reflect.get(_b, "LOCALIZATION_PREFIXES", _a), "midi-qol.CAST"],
		_a.metadata = foundry.utils.mergeObject(Reflect.get(_b, "metadata", _a), {
			title: configSettings.activityNamePrefix ? "midi-qol.CAST.Title.one" : ActivityClass.metadata.title,
			dnd5eTitle: ActivityClass.metadata.title,
			sheetClass: MidiCastSheet,
			usage: {
				chatCard: "modules/midi-qol/templates/activity-card.hbs",
				dialog: ActivityClass.metadata.usage.dialog,
			},
		}, { inplace: false, insertKeys: true, insertValues: true }),
		_a;
};
