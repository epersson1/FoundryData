import { debugEnabled, warn } from "../../midi-qol.js";
import { ReplaceDefaultActivities, configSettings } from "../settings.js";
import { MidiActivityMixin, MidiActivityMixinSheet } from "./MidiActivityMixin.js";
export var MidiSaveActivity;
export var MidiSaveSheet;
export function setupSaveActivity() {
	if (debugEnabled > 0)
		warn("MidiQOL | SaveActivity | setupSaveActivity | Called");
	//@ts-expect-error
	const GameSystemConfig = game.system.config;
	//@ts-expect-error
	MidiSaveSheet = defineMidiSaveSheetClass(game.system.applications.activity.SaveSheet);
	MidiSaveActivity = defineMidiSaveActivityClass(GameSystemConfig.activityTypes.save.documentClass);
	if (ReplaceDefaultActivities) {
		// GameSystemConfig.activityTypes["dnd5eSave"] = GameSystemConfig.activityTypes.save;
		GameSystemConfig.activityTypes.save = { documentClass: MidiSaveActivity };
	}
	else {
		GameSystemConfig.activityTypes["midiSave"] = { documentClass: MidiSaveActivity };
	}
}
let defineMidiSaveActivityClass = (ActivityClass) => {
	var _a, _b;
	return _a = class MidiSaveActivity extends (_b = MidiActivityMixin(ActivityClass)) {
			static defineSchema() {
				//@ts-expect-error
				const { StringField, ArrayField, BooleanField, SchemaField, ObjectField } = foundry.data.fields;
				//@ts-expect-error
				const dataModels = game.system.dataModels;
				const { ActivationField: ActivationField, CreatureTypeField, CurrencyTemplate, DamageData, DamageField, DurationField, MovementField, RangeField, RollConfigField, SensesField, SourceField, TargetField, UsesField } = dataModels.shared;
				const FormulaField = dataModels.fields.FormulaField;
				return {
					...super.defineSchema(),
					damage: new SchemaField({
						onSave: new StringField(),
						parts: new ArrayField(new DamageField()),
						critical: new SchemaField({
							allow: new BooleanField(),
							bonus: new FormulaField(),
						}),
					})
				};
			}
			get possibleOtherActivity() {
				return true;
			}
			getDamageConfig(config = {}) {
				const rollConfig = super.getDamageConfig(config);
				rollConfig.critical ?? (rollConfig.critical = {});
				rollConfig.critical.allow = this.damage.critical.allow;
				rollConfig.critical.bonusDamage = this.damage.critical.bonus;
				return rollConfig;
			}
			async rollDamage(config = {}, dialog = {}, message = {}) {
				var _a;
				message = foundry.utils.mergeObject({
					"data.flags.dnd5e.roll": {
						damageOnSave: this.damage.onSave
					}
				}, message);
				config.midiOptions ?? (config.midiOptions = {});
				(_a = config.midiOptions).fastForwardDamage ?? (_a.fastForwardDamage = game.user?.isGM ? configSettings.gmAutoFastForwardDamage : ["all", "damage"].includes(configSettings.autoFastForward));
				return super.rollDamage(config, dialog, message);
			}
		},
		_a.LOCALIZATION_PREFIXES = [...Reflect.get(_b, "LOCALIZATION_PREFIXES", _a), "DND5E.DAMAGE", "midi-qol.SAVE", "midi-qol.DAMAGE"],
		_a.metadata = foundry.utils.mergeObject(Reflect.get(_b, "metadata", _a), {
			title: configSettings.activityNamePrefix ? "midi-qol.SAVE.Title.one" : ActivityClass.metadata.title,
			dnd5eTitle: ActivityClass.metadata.title,
			sheetClass: MidiSaveSheet,
			usage: {
				chatCard: "modules/midi-qol/templates/activity-card.hbs",
			},
		}, { inplace: false, insertKeys: true, insertValues: true }),
		_a;
};
let defineMidiSaveSheetClass = (baseClass) => {
	var _a, _b;
	return _a = class MidiSaveSheet extends (_b = MidiActivityMixinSheet(baseClass)) {
			async _prepareContext(options) {
				await this.activity.prepareData({});
				const returnvalue = await super._prepareContext(options);
				return returnvalue;
			}
		},
		_a.PARTS = {
			...Reflect.get(_b, "PARTS", _a),
			effect: {
				template: "modules/midi-qol/templates/activity/save-effect.hbs",
				templates: [
					...Reflect.get(_b, "PARTS", _a).effect.templates,
					"modules/midi-qol/templates/activity/parts/save-damage.hbs",
				]
			}
		},
		_a.DEFAULT_OPTIONS = {
			...Reflect.get(_b, "DEFAULT_OPTIONS", _a),
			classes: ["save-activity", "damage-activity"]
		},
		_a;
};
