import { debugEnabled, GameSystemConfig, warn } from "../../midi-qol.js";
import { Workflow } from "../Workflow.js";
import { replaceDefaultActivities, configSettings } from "../settings.js";
import { MidiActivityMixin, MidiActivityMixinSheet } from "./MidiActivityMixin.js";
export let MidiDamageActivity;
export let MidiDamageSheet;
export function setupDamageActivity() {
	if (debugEnabled > 0)
		warn("MidiQOL | DamageActivity | setupDamageActivity | Called");
	//@ts-expect-error
	MidiDamageSheet = defineMidiDamageSheetClass(game.system.applications.activity.DamageSheet);
	MidiDamageActivity = defineMidiDamageActivityClass(GameSystemConfig.activityTypes.damage.documentClass);
	if (replaceDefaultActivities) {
		// GameSystemConfig.activityTypes["dnd5eDamage"] = GameSystemConfig.activityTypes.damage;
		GameSystemConfig.activityTypes.damage = { documentClass: MidiDamageActivity };
	}
	else {
		GameSystemConfig.activityTypes["midiDamage"] = { documentClass: MidiDamageActivity };
	}
}
let defineMidiDamageActivityClass = (ActivityClass) => {
	return class MidiDamageActivity extends MidiActivityMixin(ActivityClass) {
		static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES];
		static metadata = foundry.utils.mergeObject(super.metadata, {
			title: configSettings.activityNamePrefix ? "midi-qol.DAMAGE.Title.one" : ActivityClass.metadata.title,
			dnd5eTitle: ActivityClass.metadata.title,
			sheetClass: MidiDamageSheet,
			usage: {
				chatCard: "modules/midi-qol/templates/activity-card.hbs",
				actions: {
					rollDamage: MidiDamageActivity.#rollDamage
				},
			}
		}, { inplace: false, insertKeys: true, insertValues: true });
		static #rollDamage(event, target, message) {
			const workflow = Workflow.getWorkflow(message?.uuid);
			if (workflow)
				workflow.activity = this;
			this.rollDamage({ event, workflow }, {}, {});
		}
		get possibleOtherActivity() {
			return true;
		}
		get selfTriggerableOnly() {
			return false;
		}
		get canUseOtherActivity() {
			return true;
		}
		async rollDamage(config, dialog, message) {
			config.midiOptions ??= {};
			// @ts-expect-error
			config.midiOptions.fastForwardDamage ??= game.user?.isGM ? configSettings.gmAutoFastForwardDamage : ["all", "damage"].includes(configSettings.autoFastForward);
			return super.rollDamage(config, dialog, message);
		}
		async _triggerSubsequentActions(config, results) {
		}
	};
};
export function defineMidiDamageSheetClass(baseClass) {
	return class MidiDamageSheet extends MidiActivityMixinSheet(baseClass) {
		static PARTS = {
			...super.PARTS,
			effect: {
				template: "modules/midi-qol/templates/activity/damage-effect.hbs",
				templates: [
					...super.PARTS.effect.templates
				]
			}
		};
	};
}
