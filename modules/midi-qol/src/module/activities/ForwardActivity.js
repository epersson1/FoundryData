import { debugEnabled, warn } from "../../midi-qol.js";
import { ReplaceDefaultActivities, configSettings } from "../settings.js";
import { MidiActivityMixin, MidiActivityMixinSheet } from "./MidiActivityMixin.js";
export var MidiForwardActivity;
export var MidiForwardSheet;
export function setupForwardActivity() {
	if (debugEnabled > 0)
		warn("MidiQOL | ForwardActivity | setupForwardActivity | Called");
	//@ts-expect-error
	const GameSystemConfig = game.system.config;
	//@ts-expect-error
	MidiForwardSheet = defineMidiForwardSheetClass(game.system.applications.activity.ForwardSheet);
	MidiForwardActivity = defineMidiForwardActivityClass(GameSystemConfig.activityTypes.forward.documentClass);
	if (ReplaceDefaultActivities) {
		// GameSystemConfig.activityTypes["dnd5eForward"] = GameSystemConfig.activityTypes.forward;
		GameSystemConfig.activityTypes.forward = { documentClass: MidiForwardActivity };
	}
	else {
		GameSystemConfig.activityTypes["midiForward"] = { documentClass: MidiForwardActivity };
	}
}
let defineMidiForwardSheetClass = (baseClass) => {
	return class MidiForwardSheet extends MidiActivityMixinSheet(baseClass) {
	};
};
let defineMidiForwardActivityClass = (ActivityClass) => {
	var _a, _b;
	return _a = class MidiForwardActivity extends (_b = MidiActivityMixin(ActivityClass)) {
			get possibleOtherActivity() {
				return false;
			}
		},
		_a.LOCALIZATION_PREFIXES = [...Reflect.get(_b, "LOCALIZATION_PREFIXES", _a), "midi-qol.FORWARD"],
		_a.metadata = foundry.utils.mergeObject(Reflect.get(_b, "metadata", _a), {
			title: configSettings.activityNamePrefix ? "midi-qol.FORWARD.Title.one" : ActivityClass.metadata.title,
			dnd5eTitle: ActivityClass.metadata.title,
			sheetClass: MidiForwardSheet,
			usage: {
				chatCard: "modules/midi-qol/templates/activity-card.hbs",
			},
		}, { inplace: false, insertKeys: true, insertValues: true }),
		_a;
};
