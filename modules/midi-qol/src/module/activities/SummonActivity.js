import { debugEnabled, warn } from "../../midi-qol.js";
import { ReplaceDefaultActivities, configSettings } from "../settings.js";
import { MidiActivityMixin, MidiActivityMixinSheet } from "./MidiActivityMixin.js";
export var MidiSummonActivity;
export var MidiSummonSheet;
export function setupSummonActivity() {
	if (debugEnabled > 0)
		warn("MidiQOL | SummonActivity | setupSummonActivity | Called");
	//@ts-expect-error
	const GameSystemConfig = game.system.config;
	//@ts-expect-error
	MidiSummonSheet = defineMidiSummonSheetClass(game.system.applications.activity.SummonSheet);
	MidiSummonActivity = defineMidiSummonActivityClass(GameSystemConfig.activityTypes.summon.documentClass);
	if (ReplaceDefaultActivities) {
		// GameSystemConfig.activityTypes["dnd5eSummon"] = GameSystemConfig.activityTypes.summon;
		GameSystemConfig.activityTypes.summon = { documentClass: MidiSummonActivity };
	}
	else {
		GameSystemConfig.activityTypes["midiSummon"] = { documentClass: MidiSummonActivity };
	}
}
let defineMidiSummonSheetClass = (baseClass) => {
	return class MidiSummonSheet extends MidiActivityMixinSheet(baseClass) {
	};
};
let defineMidiSummonActivityClass = (ActivityClass) => {
	var _a, _b;
	return _a = class MidiSummonActivity extends (_b = MidiActivityMixin(ActivityClass)) {
			get possibleOtherActivity() {
				return false;
			}
		},
		_a.LOCALIZATION_PREFIXES = [...Reflect.get(_b, "LOCALIZATION_PREFIXES", _a), "midi-qol.SUMMON"],
		_a.metadata = foundry.utils.mergeObject(Reflect.get(_b, "metadata", _a), {
			title: configSettings.activityNamePrefix ? "midi-qol.SUMMON.Title.one" : ActivityClass.metadata.title,
			dnd5eTitle: ActivityClass.metadata.title,
			sheetClass: MidiSummonSheet,
			usage: {
				chatCard: "modules/midi-qol/templates/activity-card.hbs",
				dialog: ActivityClass.metadata.usage.dialog,
			},
		}, { inplace: false, insertKeys: true, insertValues: true }),
		_a;
};
