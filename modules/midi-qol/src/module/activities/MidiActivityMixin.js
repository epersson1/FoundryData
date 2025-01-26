var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
import { GameSystemConfig, MODULE_ID, SystemString, allAttackTypes, debugEnabled, error, geti18nOptions, i18n, i18nFormat, warn } from "../../midi-qol.js";
import { socketlibSocket } from "../GMAction.js";
import { Workflow } from "../Workflow.js";
import { OnUseMacros } from "../apps/Item.js";
import { TroubleShooter } from "../apps/TroubleShooter.js";
import { checkMechanic, configSettings } from "../settings.js";
import { installedModules } from "../setupModules.js";
import { busyWait } from "../tests/setupTest.js";
import { saveUndoData } from "../undo.js";
import { activityHasAreaTarget, asyncHooksCall, canSee, canSense, checkActivityRange, checkIncapacitated, createConditionData, displayDSNForRoll, evalActivationCondition, evalCondition, getAutoRollAttack, getAutoRollDamage, getRemoveAttackButtons, getRemoveDamageButtons, getSpeaker, getStatusName, getToken, activityHasAutoPlaceTemplate, hasUsedBonusAction, hasUsedReaction, initializeVision, isAutoConsumeResource, isInCombat, needsBonusActionCheck, needsReactionCheck, processDamageRollBonusFlags, setBonusActionUsed, setReactionUsed, sumRolls, tokenForActor, validTargetTokens, activityHasEmanationNoTemplate, getActivityAutoTarget, areMidiKeysPressed, getActor, setRangedTargets, isAutoFastDamage } from "../utils.js";
import { confirmWorkflow, preTemplateTargets, removeFlanking, selectTargets, setDamageRollMinTerms } from "./activityHelpers.js";
export var MidiActivityMixin = Base => {
	var _a, _b, _MidiActivityMixin_applyEffects, _MidiActivityMixin_confirmDamageRollCancel, _MidiActivityMixin_confirmDamageRollComplete, _MidiActivityMixin_confirmDamageRollCompleteHit, _MidiActivityMixin_confirmDamageRollCompleteMiss, _MidiActivityMixin_rollDamageNoCritical, _MidiActivityMixin_rollDamgeCritical;
	return _a = class MidiActivityMixin extends (_b = Base) {
			get workflow() {
				if (!this._workflow)
					this._workflow = Workflow.getWorkflow(this.uuid);
				return this._workflow;
			}
			set workflow(value) { this._workflow = value; }
			static defineSchema() {
				//@ts-expect-error
				const { StringField, ArrayField, BooleanField, SchemaField, ObjectField, SetField } = foundry.data.fields;
				const schema = {
					...super.defineSchema(),
					// flags: new ObjectField(),
					useConditionText: new StringField({ name: "useCondition", initial: "" }),
					effectConditionText: new StringField({ name: "effectCondition", initial: "" }),
					// disabled pending a way to make it work 
					// useSystemActivity: new BooleanField({ name: "useSystemActivity", initial: false }),
					macroData: new SchemaField({
						name: new StringField({ name: "name", initial: "" }),
						command: new StringField({ name: "command", initial: "" }),
					}),
					ignoreTraits: new SchemaField({
						idi: new BooleanField({ name: "idi", initial: false }),
						idr: new BooleanField({ name: "idr", initial: false }),
						idv: new BooleanField({ name: "idv", initial: false }),
						ida: new BooleanField({ name: "ida", initial: false })
					}),
					midiProperties: new SchemaField({
						ignoreTraits: new SetField(new StringField(), { initial: [] }),
						triggeredActivityId: new StringField({ name: "triggeredActivity", initial: "none" }),
						triggeredActivityConditionText: new StringField({ name: "triggeredActivityCondition", initial: "" }),
						triggeredActivityTargets: new StringField({ name: "triggeredActivitityTargets", initial: "targets" }),
						triggeredActivityRollAs: new StringField({ name: "triggeredActivityRollAs", initial: "self" }),
						forceDialog: new BooleanField({ name: "forceDialog", initial: false }),
						confirmTargets: new StringField({ name: "confirmTargets", initial: "default" }),
						automationOnly: new BooleanField({ name: "automationOnly", initial: false }),
						otherActivityCompatible: new BooleanField({ name: "otherActivityCompatible", initial: true }),
						identifier: new StringField({ name: "identifier", initial: "", required: false }),
					})
				};
				return schema;
			}
			get isOtherActivityCompatible() {
				if (!this.possibleOtherActivity)
					return false;
				return this.midiProperties.otherActivityCompatible;
			}
			get possibleOtherActivity() {
				return false;
			}
			getOnUseMacros({ onlyOnUseItemMacros = false } = {}) {
				const onUseMacros = new OnUseMacros();
				this.ammoOnUseMacros = new OnUseMacros();
				const itemOnUseMacros = foundry.utils.getProperty(this.item ?? {}, `flags.${MODULE_ID}.onUseMacroParts`) ?? new OnUseMacros();
				const ammoOnUseMacros = foundry.utils.getProperty(this.ammo ?? {}, `flags.${MODULE_ID}.onUseMacroParts`) ?? new OnUseMacros();
				const actorOnUseMacros = foundry.utils.getProperty(this.actor ?? {}, `flags.${MODULE_ID}.onUseMacroParts`) ?? new OnUseMacros();
				if (onlyOnUseItemMacros) {
					onUseMacros.items = [...itemOnUseMacros.items];
				}
				else {
					onUseMacros.items = [...itemOnUseMacros.items, ...actorOnUseMacros.items];
				}
				this.ammoOnUseMacros.items = ammoOnUseMacros.items;
				return onUseMacros;
			}
			get validProperties() {
				return new Set(["idi", "idr", "idv", "ida"]);
			}
			get macro() {
				return new Macro({ name: this.macroData.name || this.name, command: this.macroData.command, img: this.img, type: "script" });
			}
			set macro(macro) {
				//@ts-expect-error
				return this.update({ macroData: { name: macro.name, command: macro.command } });
			}
			get messageFlags() {
				const baseFlags = super.messageFlags;
				// foundry.utils.setProperty(baseFlags, "roll.type", "midi");
				const targets = new Map();
				if (this.targets) {
					for (const token of this.targets) {
						const { name } = token;
						const { img, system, uuid } = token.actor ?? {};
						if (uuid)
							targets.set(uuid, { name, img, uuid, ac: system?.attributes?.ac?.value });
					}
					baseFlags.targets = Array.from(targets.values());
					// foundry.utils.setProperty(baseFlags, "roll.type", "usage");
				}
				return baseFlags;
			}
			get triggeredActivity() {
				return this.item.system.activities.find(a => a.id === this.midiProperties?.triggeredActivityId);
			}
			async doConfirmation(actionToCall, event, target, message) {
				if (!game.user?.isGM && configSettings.confirmAttackDamage === "gmOnly") {
					return;
				}
				if (message.author.active) {
					const result = await socketlibSocket.executeAsUser(actionToCall, message.author.id, { activityUuid: this.uuid, itemCardId: message.id, itemCardUuid: message.uuid });
					if (typeof result === "string")
						ui.notifications?.warn(result);
				}
				else {
					await Workflow.removeItemCardAttackDamageButtons(message.id);
					await Workflow.removeItemCardConfirmRollButton(message.id);
				}
			}
			get identifier() {
				if (this.midiProperties.identifier)
					return this.midiProperties.identifier;
				return this.name.slugify();
			}
			prepareData() {
				//@ts-expect-error
				if (!this.midiProperties.identifier && !this.name)
					this.midiProperties.identifier = i18n(this.constructor.metadata.dnd5eTitle).slugify();
				super.prepareData();
			}
			async useAs(actor, config = {}, dialog = {}, message = {}) {
				// itemData._id = this.item._id;
				actor = getActor(config.midiOptions.rollAs);
				if (!actor)
					return undefined;
				const itemData = this.item.toObject();
				delete itemData._id;
				let item = new CONFIG.Item.documentClass(itemData, { parent: actor });
				//@ts-expect-error
				const activity = item.system.activities.get(this.id);
				delete config.midiOptions.rollAs;
				return activity.use(config, dialog, message);
			}
			async use(config = {}, dialog = {}, message = {}) {
				var _c;
				if (!this.item.isEmbedded)
					return;
				if (!this.item.isOwner) {
					ui.notifications?.error("DND5E.DocumentUseWarn", { localize: true });
				}
				if (debugEnabled > 0)
					warn("MidiQOL | MidiActivity | use | Called", config, dialog, message);
				if (config.midiOptions?.rollAs)
					return this.useAs(config.midiOptions.rollAs, config, dialog, message);
				let item = this.item.clone({}, { keepId: true });
				let activity = item.system.activities.get(this.id);
				await removeFlanking(item.parent);
				config.midiOptions ?? (config.midiOptions = {});
				(_c = config.midiOptions).workflowOptions ?? (_c.workflowOptions = {});
				if (config.systemCard)
					return super.use(config, dialog, message);
				let previousWorkflow = Workflow.getWorkflow(this.uuid);
				// const noRemoveWorkflows = [DamageOnlyWorkflow, TrapWorkflow, DDBGameLogWorkflow]
				//@ts-expect-error
				if (previousWorkflow && previousWorkflow.constructor.forceCreate) {
					if (!(await confirmWorkflow(previousWorkflow)))
						return;
					Workflow.removeWorkflow(this.uuid);
					activity.workflow = undefined;
					this.workflow = undefined;
				}
				// come back and see about re-rolling etc.
				if (!activity.workflow || activity.workflow.currentAction !== activity.workflow.WorkflowState_NoAction) {
					console.log("MidiActivity | use | Workflow is not in the correct state", config.midiOptions, activity.workflow?.currentAction);
					let workflowClass = config?.midi?.workflowClass ?? globalThis.MidiQOL.workflowClass;
					if (!(workflowClass.prototype instanceof Workflow))
						workflowClass = Workflow;
					activity.workflow = new workflowClass(activity.actor, this, ChatMessage.getSpeaker({ actor: activity.item.actor }), activity.targets, { ...config.midiOptions, event: config.event });
				}
				// Stupid vscode thinks activity.workflow can be undefined which it can't so put in a superflous check to keep it happy
				if (!activity.workflow)
					return undefined;
				// activity.workflow.options won't be other than the default yet
				activity.workflow.rollOptions.rollToggle = false;
				const autoCreatetemplate = activityHasAutoPlaceTemplate(this);
				const emanationNoTemplate = activityHasEmanationNoTemplate(this);
				if (autoCreatetemplate || emanationNoTemplate) {
					config.create ?? (config.create = {});
					config.create.measuredTemplate = false;
				}
				// await activity.confirmTargets();
				if (!await activity.setupTargets(config, dialog, message))
					return;
				activity.workflow.setTargets(activity.targets);
				const extraWorkflowData = await activity.confirmCanProceed(config, dialog, message);
				if (!extraWorkflowData)
					return;
				foundry.utils.setProperty(message, "data.flags.midi-qol.messageType", "attack");
				if (config.midiOptions?.configureDialog === false)
					dialog.configure = false;
				activity.checkAutoConsume(config, dialog, message);
				activity.workflow.rollOptions.rollToggle = areMidiKeysPressed(config.event, "RollToggle");
				// Synthetic items don't have an _id so setup for them to be recovered from the chat card
				if (!activity.item._id)
					foundry.utils.setProperty(message, "data.flags.dnd5e.item.data", activity.item.toObject());
				const results = await super.use(config, dialog, message);
				if (!results)
					return;
				if (autoCreatetemplate || emanationNoTemplate)
					if (!await activity.setupTargets(config, dialog, message))
						return;
				activity.workflow.noAutoDamage = config.midiOptions.systemCard;
				activity.workflow.noAutoAttack = config.midiOptions.systemCard;
				activity.workflow.setTargets(activity.targets); // Allow for targets set by emanation
				if (activity.templates) { // TODO find a better place to store this
					results.templates = activity.templates;
					delete activity.templates;
				}
				if (configSettings.undoWorkflow)
					await saveUndoData(activity.workflow);
				activity.workflow.itemUseComplete = true;
				activity.workflow.needItemCard = false;
				if (!results) { // activity use was aborted
					activity.removeWorkflow();
					return undefined;
				}
				activity.workflow.itemCardUuid = results.message.uuid;
				activity.workflow.itemCardId = results.message.id;
				if (activity.consumption?.spellSlot) {
					activity.workflow.castData = {
						baseLevel: activity.item.system.level,
						castLevel: activity.workflow.spellLevel,
						itemUuid: activity.workflow.itemUuid
					};
				}
				const scaling = results.message?.getFlag && (results.message?.getFlag("dnd5e", "scaling") ?? 0);
				if (scaling) {
					const item = activity.item.clone({ "flags.dnd5e.scaling": scaling }, { keepId: true });
					activity.workflow.activity = item.system.activities.get(activity.id);
					activity.workflow.activity.workflow = activity.workflow;
				}
				this.midiOptions = config.midiOptions;
				await activity.workflow.performState(activity.workflow.WorkflowState_Start, {});
				return results;
			}
			checkAutoConsume(config, dialog, message) {
				if (dialog.configure === false)
					return;
				if (this.isSpell && ["both", "spell"].includes(isAutoConsumeResource(this.workflow))) {
					dialog.configure = false;
					// Check that there is a spell slot of the right level
					const spells = this.actor.system.spells;
					// Come back and check for spell level in activities
					if (spells[`spell${this.item.system.level}`]?.value === 0 &&
						(spells.pact.value === 0 || spells.pact.level < this.item.system.level)) {
						dialog.configure = true;
					}
					if (!dialog.configure && this.hasAreaTarget && this.actor?.sheet) {
						setTimeout(() => {
							this.actor?.sheet.minimize();
						}, 100);
					}
				}
				else
					dialog.configure = !(["both", "item"].includes(isAutoConsumeResource(this.workflow)));
			}
			async rollDamage(config, dialog = {}, message = {}) {
				var _c, _d;
				if (!config.midiOptions)
					config.midiOptions = {};
				if (debugEnabled > 0) {
					warn("MidiActivity | rollDamage | Called", config, dialog, message);
				}
				let result;
				let otherResult;
				let preRollDamageHookId;
				let rollDamageHookId;
				config.midiOptions ?? (config.midiOptions = this.midiOptions.rollOptions ?? this.workflow?.midiOptions ?? {});
				try {
					if (await asyncHooksCall("midi-qol.preDamageRoll", this.workflow, this, config, dialog, message) === false
						|| await asyncHooksCall(`midi-qol.preDamageRoll.${this.item.uuid}`, this.workflow, this, config, dialog, message) === false
						|| await asyncHooksCall(`midi-qol.preDamageRoll.${this.uuid}`, this.workflow, this, config, dialog, message) === false) {
						console.warn("midi-qol | Damage roll blocked via pre-hook");
						return;
					}
					//@ts-expect-error
					const areKeysPressed = game.system.utils.areKeysPressed;
					const keys = {
						normal: areKeysPressed(config.event, "skipDialogNormal")
							|| areKeysPressed(config.event, "skipDialogDisadvantage"),
						critical: areKeysPressed(config.event, "skipDialogAdvantage")
					};
					(_c = config.midiOptions).isCritical || (_c.isCritical = this.workflow?.isCritical);
					(_d = config.midiOptions).fastForwardDamage ?? (_d.fastForwardDamage = isAutoFastDamage(this.workflow));
					if (this.hasDamage || this.hasHealing) {
						if (Object.values(keys).some(k => k))
							dialog.configure = !!this.midiProperties.forceDialog;
						else
							dialog.configure ?? (dialog.configure = !config.midiOptions?.fastForwardDamage || !!this.midiProperties.forceDialog);
						if (this.workflow && areMidiKeysPressed(config.event, "RollToggle"))
							this.workflow.rollOptions.rollToggle = true;
						if (this.workflow?.rollOptions?.rollToggle)
							dialog.configure = !dialog.configure;
						// if (dialog.configure) config.midiOptions.isCritical = false;
						preRollDamageHookId = Hooks.once(`${game.system.id}.preRollDamageV2`, (rollConfig, dialogConfig, messageConfig) => {
							for (let roll of rollConfig.rolls) {
								if (keys.critical)
									roll.options.isCritical = true;
								else if (keys.normal)
									roll.options.isCritical = false;
								else if (!dialog.configure)
									roll.options.isCritical = rollConfig.midiOptions.isCritical;
								if (this.damage?.critical?.allow === false)
									roll.options.isCritical = false;
							}
							if (dialogConfig.configure) {
								if (rollConfig.rolls[0].options.isCritical || rollConfig.midiOptions.isCritical) {
									dialogConfig.options.defaultButton = "critical";
								}
								else
									dialogConfig.options.defaultButton = "normal";
							}
							return true;
						});
						rollDamageHookId = Hooks.once(`${game.system.id}.rollDamageV2`, rolls => {
							if (rolls[0] && this.workflow)
								this.workflow.isCritical = rolls[0].options.isCritical;
						});
						message.create ?? (message.create = false);
						if (this.damage?.parts.some(part => part.types.size > 1))
							dialog.configure = true;
						if (this.healing?.types?.size > 1)
							dialog.configure = true;
						result = await super.rollDamage(config, dialog, message) ?? [];
						result = await this.postProcessDamageRoll(config, result);
						if (this.workflow && config.midiOptions.updateWorkflow !== false)
							await this.workflow.setDamageRolls(result);
					}
					if (this.otherActivity && this.workflow?.otherActivity !== this) {
						let shouldRollOther = true;
						if (this.otherCondition && this.workflow) {
							shouldRollOther = false;
							for (let token of this.workflow.hitTargets) {
								shouldRollOther || (shouldRollOther = await evalActivationCondition(this.workflow, this.otherCondition, token, { async: true }));
								if (shouldRollOther)
									break;
							}
						}
						if (shouldRollOther && (this.otherActivity.hasDamage || this.otherActivity.hasHealing || this.otherActivity.roll?.formula)) {
							this.otherActivity.workflow = this.workflow;
							// Check conditions & flags
							const otherConfig = foundry.utils.deepClone(config);
							otherConfig.midiOptions.fastForward = config.midiOptions.fastForwardDamage;
							otherConfig.midiOptions.updateWorkflow = false; // rollFormula will try and restart the workflow
							// Undo the roll toggle since rollFormula will look at it as well
							if (this.workflow?.rollOptions?.rollToggle)
								dialog.configure = !dialog.configure;
							if (this.otherActivity?.hasDamage)
								otherResult = await this.otherActivity.rollDamage(otherConfig, dialog, { create: false });
							else if (this.otherActivity?.roll?.formula) {
								otherResult = await this.otherActivity.rollFormula(otherConfig, dialog, { create: false });
								if (otherResult) {
									if (!(otherResult instanceof Array))
										otherResult = [otherResult];
									otherResult = otherResult.map(roll => 
									//@ts-expect-error
									new game.system.dice.DamageRoll(roll.formula, {}, {}));
								}
							}
							if (otherResult && config.midiOptions.updateWorkflow !== false && this.workflow)
								await this.workflow.setOtherDamageRolls(otherResult);
						}
					}
					if (config.midiOptions.updateWorkflow !== false && this.workflow?.suspended)
						this.workflow.unSuspend.bind(this.workflow)({ damageRoll: result, otherDamageRoll: otherResult });
				}
				catch (err) {
					const message = "doDamageRoll error";
					TroubleShooter.recordError(err, message);
					error(message, err);
				}
				finally {
					if (preRollDamageHookId)
						Hooks.off(`${game.system.id}.preRollDamageV2`, preRollDamageHookId);
					if (rollDamageHookId)
						Hooks.off(`${game.system.id}.rollDamageV2`, rollDamageHookId);
				}
				return result ?? [];
			}
			configureDamageRoll(config) {
				const worklflow = this.workflow;
				//@ts-expect-error
				const DamageRoll = CONFIG.Dice.DamageRoll;
				try {
					let workflow = this.workflow;
					if (!workflow)
						return config;
					if (workflow && config.midiOptions.systemCard)
						workflow.systemCard = true;
					if (workflow.workflowType === "TrapWorkflow")
						workflow.rollOptions.fastForward = true;
					const midiFlags = workflow.actor.flags[MODULE_ID];
					if (workflow.currentAction !== workflow.WorkflowStaate_WaitForDamageRoll && workflow.noAutoAttack) {
						// TODO NW check this allow damage roll to go ahead if it's an ordinary roll
						workflow.currentAction = workflow.WorkflowState_WaitForDamageRoll;
					}
					if (workflow.currentAction !== workflow.WorkflowState_WaitForDamageRoll) {
						if (workflow.currentAction === workflow.WorkflowState_AwaitTemplate)
							return ui.notifications?.warn(i18n("midi-qol.noTemplateSeen"));
						else if (workflow.currentAction === workflow.WorkflowState_WaitForAttackRoll)
							return ui.notifications?.warn(i18n("midi-qol.noAttackRoll"));
					}
					// TODO revisit this to see if it is still possoible to just re-roll the damage
					if (workflow && (workflow.damageRollCount ?? 0) > 0) { // we are re-rolling the damage. redisplay the item card but remove the damage if the roll was finished
						workflow.displayChatCardWithoutDamageDetail();
					}
					;
					// Allow overrides form the caller
					if (workflow && config.midiOptions.spellLevel)
						workflow.rollOptions.spellLevel = config.midiOptions.spellLevel;
					if (workflow && config.midiOptions.powerLevel)
						workflow.rollOptions.spellLevel = config.midiOptions.powerLevel;
					if (workflow && (workflow.isVersatile || config.midiOptions.versatile))
						workflow.rollOptions.versatile = true;
					if (debugEnabled > 0)
						warn("rolling damage  ", this.name, this);
					if (workflow && config.midiOptions?.isCritical !== undefined)
						workflow.isCritical = config.midiOptions?.isCritical;
					config.midiOptions.fastForwardDamage = config.midiOptions.fastForwardDamage ?? workflow.workflowOptions?.fastForwardDamage ?? workflow.rollOptions.fastForwardDamage;
					if (workflow)
						workflow.damageRollCount += 1;
					let result;
					let result2;
				}
				catch (err) {
					const message = "Configure Damage Roll error";
					TroubleShooter.recordError(err, message);
					error(message, err);
				}
			}
			getDamageConfig(config = {}) {
				config.attackMode = this.workflow?.attackMode;
				config.ammunition = this.actor.items.get(this.workflow?.ammunition);
				const rollConfig = super.getDamageConfig(config);
				this.configureDamageRoll(rollConfig);
				for (let roll of rollConfig.rolls) {
					if (rollConfig.ammunition) { // add ammunition properties to the damage roll
						let rollProperties = new Set(roll.options.properties);
						const ammunitionProperties = rollConfig.ammunition.system.properties;
						//@ts-expect-error
						roll.options.properties = Array.from(rollProperties.union(ammunitionProperties));
					}
					// critical/fumble will be inserted when roll.build is called.
				}
				return rollConfig;
			}
			async postProcessDamageRoll(config, result) {
				let result2;
				//@ts-expect-error
				const DamageRoll = CONFIG.Dice.DamageRoll;
				try {
					if (!this.workflow)
						return result;
					if (foundry.utils.getProperty(this.actor, `parent.flags.${MODULE_ID}.damage.advantage`)) {
						// TODO see if this is still possible
						// result2 = await wrapped(damageRollData)
					}
					let magicalDamage = this.item?.system.properties?.has("mgc") || this.item?.flags?.midiProperties?.magicdam;
					magicalDamage || (magicalDamage = config.ammunition?.system.properties.has("mgc") || config.ammunition?.flags?.midiProperties?.magicdam);
					magicalDamage = magicalDamage || (configSettings.requireMagical === "off" && this.attackBonus > 0);
					magicalDamage || (magicalDamage = configSettings.requireMagical === "off" && config.ammunition?.attackBonus > 0);
					magicalDamage = magicalDamage || (configSettings.requireMagical === "off" && (this.attack?.type.classification ?? "none") !== "weapon");
					magicalDamage = magicalDamage || (configSettings.requireMagical === "nonspell" && this.isSpell);
					if (result?.length > 0) {
						result.forEach(roll => {
							const droll = roll;
							if (!droll.options.properties)
								droll.options.properties = [];
							if (this.isSpell)
								droll.options.properties.push("spell");
							if (magicalDamage && !droll.options.properties.includes("mgc"))
								droll.options.properties.push("mgc");
							droll.options.properties.push(this.actionType);
						});
					}
					//@ts-expect-error .first
					const firstTarget = this.workflow.hitTargets.first() ?? this.workflow.targets?.first();
					const firstTargetActor = firstTarget?.actor;
					const targetMaxFlags = foundry.utils.getProperty(firstTargetActor, `flags.${MODULE_ID}.grants.max.damage`) ?? {};
					const maxFlags = foundry.utils.getProperty(this.workflow, `actor.flags.${MODULE_ID}.max`) ?? {};
					let needsMaxDamage = (maxFlags.damage?.all && await evalActivationCondition(this.workflow, maxFlags.damage.all, firstTarget, { async: true, errorReturn: false }))
						|| (maxFlags.damage && maxFlags.damage[this.actionType] && await evalActivationCondition(this.workflow, maxFlags.damage[this.actionType], firstTarget, { async: true, errorReturn: false }));
					needsMaxDamage = needsMaxDamage || ((targetMaxFlags.all && await evalActivationCondition(this.workflow, targetMaxFlags.all, firstTarget, { async: true, errorReturn: false }))
						|| (targetMaxFlags[this.actionType] && await evalActivationCondition(this.workflow, targetMaxFlags[this.actionType], firstTarget, { async: true, errorReturn: false })));
					const targetMinFlags = foundry.utils.getProperty(firstTargetActor, `flags.${MODULE_ID}.grants.min.damage`) ?? {};
					const minFlags = foundry.utils.getProperty(this.workflow, `actor.flags.${MODULE_ID}.min`) ?? {};
					let needsMinDamage = (minFlags.damage?.all && await evalActivationCondition(this.workflow, minFlags.damage.all, firstTarget, { async: true, errorReturn: false }))
						|| (minFlags?.damage && minFlags.damage[this.actionType] && await evalActivationCondition(this.workflow, minFlags.damage[this.actionType], firstTarget, { async: true, errorReturn: false }));
					needsMinDamage = needsMinDamage || ((targetMinFlags.damage && await evalActivationCondition(this.workflow, targetMinFlags.all, firstTarget, { async: true, errorReturn: false }))
						|| (targetMinFlags[this.actionType] && await evalActivationCondition(this.workflow, targetMinFlags[this.actionType], firstTarget, { async: true, errorReturn: false })));
					if (needsMaxDamage && needsMinDamage) {
						needsMaxDamage = false;
						needsMinDamage = false;
					}
					let actionFlavor;
					switch (game.system.id) {
						case "sw5e":
							actionFlavor = game.i18n.localize(this.actionType === "heal" ? "SW5E.Healing" : "SW5E.DamageRoll");
							break;
						case "n5e":
							actionFlavor = game.i18n.localize(this.actionType === "heal" ? "N5E.Healing" : "N5E.DamageRoll");
							break;
						case "dnd5e":
						default:
							actionFlavor = game.i18n.localize(this.actionType === "heal" ? "DND5E.Healing" : "DND5E.DamageRoll");
					}
					const title = `${this.name} - ${actionFlavor}`;
					const speaker = getSpeaker(this.actor);
					let flavor = title;
					if (this.item.labels.damages?.length > 0) {
						flavor = `${title} (${this.item.labels.damages.map(d => d.damageType)})`;
					}
					let messageData = foundry.utils.mergeObject({
						title,
						flavor,
						speaker,
					}, { "flags.dnd5e.roll": { type: "damage", itemId: this.item.id, itemUuid: this.item.uuid } });
					if (game.system.id === "sw5e")
						foundry.utils.setProperty(messageData, "flags.sw5e.roll", { type: "damage", itemId: this.item.id, itemUuid: this.item.uuid });
					if (needsMaxDamage) {
						for (let i = 0; i < result.length; i++) {
							result[i] = await result[i].reroll({ maximize: true });
						}
					}
					else if (needsMinDamage) {
						for (let i = 0; i < result.length; i++) {
							result[i] = await result[i].reroll({ minimize: true });
						}
					}
					else if (foundry.utils.getProperty(this, `parent.flags.${MODULE_ID}.damage.reroll-kh`) || foundry.utils.getProperty(this, `parent.flags.${MODULE_ID}.damage.reroll-kl`)) {
						let result2 = [];
						for (let i = 0; i < result.length; i++) {
							result2.push(await result[i].reroll());
						}
						if ((foundry.utils.getProperty(this, `parent.flags.${MODULE_ID}.damage.reroll-kh`) && (sumRolls(result2) > sumRolls(result)))
							|| (foundry.utils.getProperty(this, `parent.flags.${MODULE_ID}.damage.reroll-kl`) && (sumRolls(result2) < sumRolls(result)))) {
							[result, result2] = [result2, result];
						}
						// display roll not being used.
						if (this.workflow.workflowOptions?.damageRollDSN !== false) {
							let promises = result2.map(r => displayDSNForRoll(r, "damageRoll"));
							await Promise.all(promises);
						}
						await DamageRoll.toMessage(result2, messageData, { rollMode: game.settings.get("core", "rollMode") });
						// await result2.toMessage(messageData, { rollMode: game.settings.get("core", "rollMode") });
					}
					setDamageRollMinTerms(result);
					if (this.actionType === "heal" && !Object.keys(GameSystemConfig.healingTypes).includes(this.workflow.defaultDamageType ?? ""))
						this.workflow.defaultDamageType = "healing";
					if (this.workflow?.workflowOptions?.damageRollDSN !== false) {
						let promises = result.map(r => displayDSNForRoll(r, "damageRoll"));
						await Promise.all(promises);
					}
					result = await processDamageRollBonusFlags.bind(this.workflow)(result);
					return result;
				}
				catch (err) {
					const message = `doDamageRoll error for item ${this?.name} ${this.uuid}`;
					TroubleShooter.recordError(err, message);
					throw err;
				}
			}
			async setupTargets(config, dialog, message) {
				if (config.midiOptions?.targetsToUse && !activityHasAreaTarget(this)) {
					this.targets = config.midiOptions.targetsToUse;
				}
				else {
					if (((this.target?.affects.type ?? "") !== "") || configSettings.enforceSingleWeaponTarget) {
						if (!(await preTemplateTargets(this, { workflowOptions: config.midiOptions })))
							return false;
						// TODO clean this up
						// if ((dialog.targets?.size ?? 0) === 0 && game.user?.targets) dialog.targets = game.user?.targets;
					}
					// Setup targets.
					let selfTarget = this.target?.affects.type === "self";
					if (this.item.type === "tool" && !this.target?.affects.type)
						selfTarget = true;
					if (!selfTarget) {
						this.targets = validTargetTokens(game.user?.targets);
					}
					else {
						foundry.utils.setProperty(dialog, "workflowOptions.targetConfirmation", "none");
						this.targets = new Set([tokenForActor(this.actor)]);
					}
				}
				// remove selection of untargetable targets TODO
				if (canvas?.scene) {
					//@ts-expect-error
					const tokensIdsToUse = this.targets ? Array.from(this.targets).map(t => t.id) : [];
					game.user?.updateTokenTargets(tokensIdsToUse);
				}
				if (this.workflow)
					this.workflow.setTargets(this.targets);
				return true;
			}
			async confirmTargets() {
				this.targets = game.user?.targets;
			}
			removeWorkflow() {
				if (this.workflow)
					Workflow.removeWorkflow(this.workflow.uuid);
				this.workflow = undefined;
				return false;
			}
			// Part of the activity.use refactor
			async confirmWorkflowChecks(workflow, config, dialog, message) {
				const tokenToUse = getToken(this.actor);
				let cancelWorkflow = false;
				if (this.useCondition && this.activation.type !== "reaction") { // reactions condition evaluation is handled elsewhere
					if (!(await evalActivationCondition({ actor: this.actor }, this.useCondition, this.targets.first(), { async: true }))) {
						ui.notifications?.warn("You are unable to use the item");
						workflow.aborted = true;
						await workflow.performState(workflow.WorkflowState_Abort);
						return false;
					}
				}
				if (configSettings.allowUseMacro) {
					const results = await workflow.callMacros(this.item, workflow.onUseMacros?.getMacros("preTargeting"), "OnUse", "preTargeting");
					if (workflow.aborted || results.some(i => i === false)) {
						console.warn("midi-qol | item roll blocked by preItemRoll macro");
						workflow.aborted = true;
						await workflow.performState(workflow.WorkflowState_Abort);
						return false;
					}
				}
				if (cancelWorkflow)
					return this.removeWorkflow();
				if (game.user?.targets && tokenToUse)
					for (let target of game.user?.targets) {
						const tokenCanSense = tokenToUse ? canSense(tokenToUse, target, globalThis.MidiQOL.InvisibleDisadvantageVisionModes) : true;
						const targetCanSense = tokenToUse ? canSense(target, tokenToUse, globalThis.MidiQOL.InvisibleDisadvantageVisionModes) : true;
						if (targetCanSense)
							workflow.targetsCanSense.add(tokenToUse);
						else
							workflow.targetsCanSense.delete(tokenToUse);
						if (tokenCanSense)
							workflow.tokenCanSense.add(target);
						else
							workflow.tokenCanSense.delete(target);
						const tokenCanSee = tokenToUse ? canSee(tokenToUse, target) : true;
						const targetCanSee = tokenToUse ? canSee(target, tokenToUse) : true;
						if (targetCanSee)
							workflow.targetsCanSee.add(tokenToUse);
						else
							workflow.targetsCanSee.delete(tokenToUse);
						if (tokenCanSee)
							workflow.tokenCanSee.add(target);
						else
							workflow.tokenCanSee.delete(target);
					}
				workflow.processAttackEventOptions();
				await workflow.checkAttackAdvantage();
				return true;
			}
			//part of the activity.use refactor
			async confirmCanProceedNew(config, dialog, message) {
				if (debugEnabled > 0)
					warn("MidiQOL | confirmCanProceed | Called", this);
				try {
					if (!config.midiOptions?.workflowOptions?.allowIncapacitated && checkMechanic("incapacitated")) {
						const condition = checkIncapacitated(this.actor, true);
						if (condition) {
							ui.notifications?.warn(`${this.actor.name} is ${getStatusName(condition)} and is incapacitated`);
							return false;
						}
					}
					let isEmanationTargeting = activityHasAutoPlaceTemplate(this) || activityHasEmanationNoTemplate(this);
					let isAoETargeting = !isEmanationTargeting && activityHasAreaTarget(this);
					let selfTarget = this.target?.affects.type === "self";
					const inCombat = isInCombat(this.actor);
					const requiresTargets = configSettings.requiresTargets === "always" || (configSettings.requiresTargets === "combat" && inCombat);
					let speaker = getSpeaker(this.actor);
					// Call preTargeting hook/onUse macro. Create a dummy workflow if one does not already exist for the item
					const token = tokenForActor(this.actor);
					let cancelUse = await asyncHooksCall("midi-qol.preTargeting", { activity: this, token, config, dialog, message }) === false
						|| await asyncHooksCall(`midi-qol.preTargeting.${this.item.uuid}`, { activity: this, token, config, dialog, message }) === false
						|| await asyncHooksCall(`midi-qol.preTargeting.${this.uuid}`, { activity: this, token, config, dialog, message }) === false;
					if (cancelUse)
						return false;
					// Do we need some targets selected before proceeding
					/*        let shouldAllowRoll = !requiresTargets // we don't care about targets
							|| (this.targets.size > 0) // there are some target selected
							|| (this.target?.affects.type ?? "") === "" // no target required
							|| selfTarget
							|| isAoETargeting // area effect spell and we will auto target
							|| isEmanationTargeting // range target and will autotarget
							|| (!this.attack && !this.hasDamage && !this.hasSave); // does not do anything - need to chck dynamic effects
					*/
					// only allow attacks against at most the specified number of targets
					let allowedTargets;
					if (this.target?.affects.type === "creature" && this.target?.affects.count === "") //dnd5e 3.2
						allowedTargets = 9999;
					else
						allowedTargets = (this.target?.affects.type === "creature" ? this.target?.affects.count : 9999) ?? 9999;
					if (requiresTargets && configSettings.enforceSingleWeaponTarget && allAttackTypes.includes(this.actionType) && allowedTargets === 9999) {
						allowedTargets = 1;
						if (requiresTargets && this.targets.size !== 1) {
							ui.notifications?.warn(i18nFormat("midi-qol.wrongNumberTargets", { allowedTargets }));
							if (debugEnabled > 0)
								warn(`${game.user?.name} ${i18nFormat(`midi-qol.${MODULE_ID}.wrongNumberTargets`, { allowedTargets })}`);
							return false;
						}
					}
					if (requiresTargets && !isEmanationTargeting && !isAoETargeting && this.target?.affects.type === "creature" && this.targets.size === 0) {
						ui.notifications?.warn(i18n("midi-qol.noTargets"));
						if (debugEnabled > 0)
							warn(`${game.user?.name} attempted to roll with no targets selected`);
						return false;
					}
					let AoO = false;
					let activeCombatants = game.combats?.combats.map(combat => combat.combatant?.token?.id);
					const isTurn = activeCombatants?.includes(speaker.token);
					const checkReactionAOO = configSettings.recordAOO === "all" || (configSettings.recordAOO === this.actor.type);
					let thisUsesReaction = false;
					const hasReaction = hasUsedReaction(this.actor);
					if (!config.midiOptions.workflowOptions?.notReaction && ["reaction", "reactiondamage", "reactionmanual", "reactionpreattack"].includes(this.activation?.type) && (this.activation?.cost ?? 1) > 0) {
						thisUsesReaction = true;
					}
					if (!config.midiOptions.workflowOptions?.notReaction && checkReactionAOO && !thisUsesReaction && this.attack) {
						let activeCombatants = game.combats?.combats.map(combat => combat.combatant?.token?.id);
						const isTurn = activeCombatants?.includes(speaker.token);
						if (!isTurn && inCombat) {
							thisUsesReaction = true;
							AoO = true;
						}
					}
					// do pre roll checks
					if ((game.system.id === "dnd5e" || game.system.id === "n5e") && requiresTargets && this.targets.size > allowedTargets) {
						ui.notifications?.warn(i18nFormat("midi-qol.wrongNumberTargets", { allowedTargets }));
						if (debugEnabled > 0)
							warn(`${game.user?.name} ${i18nFormat(`midi-qol.${MODULE_ID}.wrongNumberTargets`, { allowedTargets })}`);
						return false;
					}
					let tokenToUse;
					if (speaker.token)
						tokenToUse = canvas?.tokens?.get(speaker.token);
					const rangeDetails = checkActivityRange(this, tokenToUse, this.targets, checkMechanic("checkRange") !== "none");
					if (checkMechanic("checkRange") !== "none" && !isAoETargeting && !isEmanationTargeting && !AoO && speaker.token) {
						if (tokenToUse && this.targets.size > 0) {
							if (rangeDetails.result === "fail")
								return false;
							else {
								tokenToUse = rangeDetails.attackingToken;
							}
						}
					}
					if (this.isSpell) {
						const midiFlags = this.actor.flags[MODULE_ID];
						const needsVerbal = this.item.system.properties.has("vocal");
						const needsSomatic = this.item.system.properties.has("somatic");
						const needsMaterial = this.item.system.properties.has("material");
						//TODO Consider how to disable this check for DamageOnly workflows and trap workflows
						const conditionData = createConditionData({ actor: this.actor, activity: this });
						const notSpell = await evalCondition(midiFlags?.fail?.spell?.all, conditionData, { errorReturn: false, async: true });
						if (notSpell) {
							ui.notifications?.warn("You are unable to cast the spell");
							return false;
						}
						let notVerbal = await evalCondition(midiFlags?.fail?.spell?.verbal, conditionData, { errorReturn: false, async: true });
						if (notVerbal && needsVerbal) {
							ui.notifications?.warn("You make no sound and the spell fails");
							return false;
						}
						notVerbal = notVerbal || await evalCondition(midiFlags?.fail?.spell?.vocal, conditionData, { errorReturn: false, async: true });
						if (notVerbal && needsVerbal) {
							ui.notifications?.warn("You make no sound and the spell fails");
							return false;
						}
						const notSomatic = await evalCondition(midiFlags?.fail?.spell?.somatic, conditionData, { errorReturn: false, async: true });
						if (notSomatic && needsSomatic) {
							ui.notifications?.warn("You can't make the gestures and the spell fails");
							return false;
						}
						const notMaterial = await evalCondition(midiFlags?.fail?.spell?.material, conditionData, { errorReturn: false, async: true });
						if (notMaterial && needsMaterial) {
							ui.notifications?.warn("You can't use the material component and the spell fails");
							return false;
						}
					}
					let workflow = {};
					workflow.inCombat = inCombat ?? false;
					workflow.isTurn = isTurn ?? false;
					workflow.AoO = AoO;
					workflow.config = config;
					workflow.attackingToken = tokenToUse;
					workflow.rangeDetails = rangeDetails;
					// if (configSettings.undoWorkflow) await saveUndoData(workflow);
					// TODO see if this is needed still workflow.rollOptions.versatile = workflow.rollOptions.versatile || versatile || workflow.isVersatile;
					// if showing a full card we don't want to auto roll attacks or damage.
					workflow.noAutoDamage = config.midiOptions.systemCard;
					workflow.noAutoAttack = config.midiOptions.systemCard;
					const consume = this.consume;
					if (consume?.type === "ammo") {
						workflow.ammo = this.actor.items.get(consume.target);
					}
					workflow.reactionQueried = false;
					const blockReaction = thisUsesReaction && hasReaction && workflow.inCombat && needsReactionCheck(this.actor) && !config.midiOptions?.ammoSelector?.hasRun;
					if (blockReaction) {
						let shouldRoll = false;
						let d = await Dialog.confirm({
							title: i18n("midi-qol.EnforceReactions.Title"),
							content: i18n("midi-qol.EnforceReactions.Content"),
							yes: () => { shouldRoll = true; },
						});
						if (!shouldRoll) {
							return false; // user aborted roll TODO should the workflow be deleted?
						}
					}
					const hasBonusAction = hasUsedBonusAction(this.actor);
					const itemUsesBonusAction = ["bonus"].includes(this.activation?.type);
					const blockBonus = workflow.inCombat && itemUsesBonusAction && hasBonusAction && needsBonusActionCheck(this.actor) && !config.midiOptions?.ammoSelector?.hasRun;
					if (blockBonus) {
						let shouldRoll = false;
						let d = await Dialog.confirm({
							title: i18n("midi-qol.EnforceBonusActions.Title"),
							content: i18n("midi-qol.EnforceBonusActions.Content"),
							yes: () => { shouldRoll = true; },
						});
						if (!shouldRoll) {
							return false;
						}
					}
					const hookAbort = await asyncHooksCall("midi-qol.preItemRoll", { activity: this, token, config, dialog, message }) === false
						|| await asyncHooksCall(`midi-qol.preItemRoll.${this.uuid}`, { activity: this, token, config, dialog, message }) === false;
					if (hookAbort || workflow.aborted) {
						console.warn("midi-qol | attack roll blocked by preItemRoll hook");
						workflow.aborted = true;
						await workflow.performState(workflow.WorkflowState_Abort);
						return false;
					}
					if (configSettings.allowUseMacro) {
						const results = await workflow.callMacros(workflow.item, workflow.onUseMacros?.getMacros("preItemRoll"), "OnUse", "preItemRoll");
						if (workflow.aborted || results.some(i => i === false)) {
							console.warn("midi-qol | item roll blocked by preItemRoll macro");
							workflow.aborted = true;
							await workflow.performState(workflow.WorkflowState_Abort);
							return false;
						}
					}
					let needPause = false;
					for (let tokenRef of this.targets) {
						const target = getToken(tokenRef);
						if (!target)
							continue;
						if (
						//@ts-expect-error - sight not enabled but we are treating it as if it is
						(!target.document.sight.enabled && configSettings.optionalRules.invisVision)
							|| (target.document.actor?.type === "npc")
							//@ts-expect-error - sight enabled but not the owner of the token
							|| (!target.isOwner && target.document.sight.enabled)
							|| (!target.vision || !target.vision?.los)) {
							initializeVision(target);
							needPause = game.modules.get("levels-3d-preview")?.active ?? false;
						}
					}
					if (needPause) {
						await busyWait(0.1);
						for (let tokenRef of this.targets) {
							const target = getToken(tokenRef);
							if (!target || !target.vision?.los)
								continue;
							const sourceId = target.sourceId;
							//@ts-expect-error
							canvas?.effects?.visionSources.set(sourceId, target.vision);
						}
					}
					if (itemUsesBonusAction && !hasBonusAction && configSettings.enforceBonusActions !== "none" && workflow.inCombat)
						await setBonusActionUsed(this.actor);
					if (thisUsesReaction && !hasReaction && configSettings.enforceReactions !== "none" && workflow.inCombat)
						await setReactionUsed(this.actor);
					// Need concentration removal to complete before allowing workflow to continue so have workflow wait for item use to complete
				}
				catch (err) {
					const message = `confirmCanProceed error for ${this.actor?.name} ${this.name} ${this.uuid}`;
					TroubleShooter.recordError(err, message);
					throw err;
				}
				return true;
			}
			async confirmCanProceed(config, dialog, message) {
				if (debugEnabled > 0)
					warn("MidiQOL | confirmCanProceed | Called", this);
				const workflow = this.workflow;
				try {
					if (this.useCondition && this.activation.type !== "reaction") { // reactions condition evaluation is handled elsewhere
						if (!(await evalActivationCondition(this.workflow, this.useCondition, this.targets.first(), { async: true }))) {
							ui.notifications?.warn("You are unable to use the item");
							return this.removeWorkflow();
						}
					}
					if (!config.midiOptions?.workflowOptions?.allowIncapacitated && checkMechanic("incapacitated")) {
						const condition = checkIncapacitated(this.actor, true);
						if (condition) {
							ui.notifications?.warn(`${this.actor.name} is ${getStatusName(condition)} and is incapacitated`);
							return this.removeWorkflow();
						}
					}
					let isEmanationTargeting = activityHasAutoPlaceTemplate(this) || activityHasEmanationNoTemplate(this);
					let isAoETargeting = !isEmanationTargeting && activityHasAreaTarget(this);
					let selfTarget = this.target?.affects.type === "self";
					const inCombat = isInCombat(this.actor);
					const requiresTargets = configSettings.requiresTargets === "always" || (configSettings.requiresTargets === "combat" && inCombat);
					let speaker = getSpeaker(this.actor);
					const token = tokenForActor(this.actor);
					// Call preTargeting hook/onUse macro. Create a dummy workflow if one does not already exist for the item
					let cancelWorkflow = await asyncHooksCall("midi-qol.preTargeting", { activity: this, token, config, dialog, message }) === false
						|| await asyncHooksCall(`midi-qol.preTargeting.${this.item.uuid}`, { activity: this, token, config, dialog, message }) === false
						|| await asyncHooksCall(`midi-qol.preTargeting.${this.uuid}`, { activity: this, token, config, dialog, message }) === false;
					if (configSettings.allowUseMacro) {
						const results = await workflow?.callMacros(this.item, workflow?.onUseMacros?.getMacros("preTargeting"), "OnUse", "preTargeting");
						cancelWorkflow || (cancelWorkflow = results?.some(i => i === false) ?? false);
					}
					if (cancelWorkflow)
						return this.removeWorkflow();
					let shouldAllowRoll = !requiresTargets // we don't care about targets
						|| (this.targets.size > 0) // there are some target selected
						|| (this.target?.affects.type ?? "") === "" // no target required
						|| selfTarget
						|| isAoETargeting // area effect spell and we will auto target
						|| isEmanationTargeting // range target and will autotarget
						|| (!this.attack && !this.hasDamage && !this.hasSave); // does not do anything - need to chck dynamic effects
					// only allow attacks against at most the specified number of targets
					let allowedTargets;
					if (this.target?.affects.type === "creature" && this.target?.affects.count === "") //dnd5e 3.2
						allowedTargets = 9999;
					else
						allowedTargets = (this.target?.affects.type === "creature" ? this.target?.affects.count : 9999) ?? 9999;
					if (requiresTargets && configSettings.enforceSingleWeaponTarget && allAttackTypes.includes(this.actionType) && allowedTargets === 9999) {
						allowedTargets = 1;
						if (requiresTargets && this.targets.size !== 1) {
							ui.notifications?.warn(i18nFormat("midi-qol.wrongNumberTargets", { allowedTargets }));
							if (debugEnabled > 0)
								warn(`${game.user?.name} ${i18nFormat(`midi-qol.${MODULE_ID}.wrongNumberTargets`, { allowedTargets })}`);
							return this.removeWorkflow();
						}
					}
					if (requiresTargets && !isEmanationTargeting && !isAoETargeting && this.target?.affects.type === "creature" && this.targets.size === 0) {
						ui.notifications?.warn(i18n("midi-qol.noTargets"));
						if (debugEnabled > 0)
							warn(`${game.user?.name} attempted to roll with no targets selected`);
						return this.removeWorkflow();
					}
					let AoO = false;
					let activeCombatants = game.combats?.combats.map(combat => combat.combatant?.token?.id);
					const isTurn = activeCombatants?.includes(speaker.token);
					const checkReactionAOO = configSettings.recordAOO === "all" || (configSettings.recordAOO === this.actor.type);
					let thisUsesReaction = false;
					const hasReaction = hasUsedReaction(this.actor);
					if (!config.midiOptions.workflowOptions?.notReaction && ["reaction", "reactiondamage", "reactionmanual", "reactionpreattack"].includes(this.activation?.type) && (this.activation?.cost ?? 1) > 0) {
						thisUsesReaction = true;
					}
					if (!config.midiOptions.workflowOptions?.notReaction && checkReactionAOO && !thisUsesReaction && this.attack) {
						let activeCombatants = game.combats?.combats.map(combat => combat.combatant?.token?.id);
						const isTurn = activeCombatants?.includes(speaker.token);
						if (!isTurn && inCombat) {
							thisUsesReaction = true;
							AoO = true;
						}
					}
					// do pre roll checks
					if ((game.system.id === "dnd5e" || game.system.id === "n5e") && requiresTargets && this.targets.size > allowedTargets) {
						ui.notifications?.warn(i18nFormat("midi-qol.wrongNumberTargets", { allowedTargets }));
						if (debugEnabled > 0)
							warn(`${game.user?.name} ${i18nFormat(`midi-qol.${MODULE_ID}.wrongNumberTargets`, { allowedTargets })}`);
						return this.removeWorkflow();
					}
					let tokenToUse;
					if (speaker.token)
						tokenToUse = canvas?.tokens?.get(speaker.token);
					const rangeDetails = checkActivityRange(this, tokenToUse, this.targets, checkMechanic("checkRange") !== "none");
					if (checkMechanic("checkRange") !== "none" && !isAoETargeting && !isEmanationTargeting && !AoO && speaker.token) {
						if (tokenToUse && this.targets.size > 0) {
							if (rangeDetails.result === "fail")
								return this.removeWorkflow();
							else {
								tokenToUse = rangeDetails.attackingToken;
							}
						}
					}
					if (this.isSpell && shouldAllowRoll) {
						const midiFlags = this.actor.flags[MODULE_ID];
						const needsVerbal = this.item.system.properties.has("vocal");
						const needsSomatic = this.item.system.properties.has("somatic");
						const needsMaterial = this.item.system.properties.has("material");
						//TODO Consider how to disable this check for DamageOnly workflows and trap workflows
						const conditionData = createConditionData({ actor: this.actor, activity: this });
						const notSpell = await evalCondition(midiFlags?.fail?.spell?.all, conditionData, { errorReturn: false, async: true });
						if (notSpell) {
							ui.notifications?.warn("You are unable to cast the spell");
							return this.removeWorkflow();
						}
						let notVerbal = await evalCondition(midiFlags?.fail?.spell?.verbal, conditionData, { errorReturn: false, async: true });
						if (notVerbal && needsVerbal) {
							ui.notifications?.warn("You make no sound and the spell fails");
							return this.removeWorkflow();
						}
						notVerbal = notVerbal || await evalCondition(midiFlags?.fail?.spell?.vocal, conditionData, { errorReturn: false, async: true });
						if (notVerbal && needsVerbal) {
							ui.notifications?.warn("You make no sound and the spell fails");
							return this.removeWorkflow();
						}
						const notSomatic = await evalCondition(midiFlags?.fail?.spell?.somatic, conditionData, { errorReturn: false, async: true });
						if (notSomatic && needsSomatic) {
							ui.notifications?.warn("You can't make the gestures and the spell fails");
							return this.removeWorkflow();
						}
						const notMaterial = await evalCondition(midiFlags?.fail?.spell?.material, conditionData, { errorReturn: false, async: true });
						if (notMaterial && needsMaterial) {
							ui.notifications?.warn("You can't use the material component and the spell fails");
							return this.removeWorkflow();
						}
					}
					if (!shouldAllowRoll) {
						return this.removeWorkflow();
					}
					/*
					let workflow: Workflow;
					let workflowClass = config?.midi?.workflowClass ?? globalthis.MidiQOL.workflowClass;
					if (!(workflowClass.prototype instanceof Workflow)) workflowClass = Workflow;
					workflow = new workflowClass(this.actor, this, speaker, targetsToUse, { event: config.event || options.event || event, workflowOptions: options.workflowOptions });
					*/
					if (!workflow)
						return false;
					workflow.inCombat = inCombat ?? false;
					workflow.isTurn = isTurn ?? false;
					workflow.AoO = AoO;
					workflow.config = config;
					workflow.attackingToken = tokenToUse;
					workflow.rangeDetails = rangeDetails;
					if (configSettings.undoWorkflow)
						await saveUndoData(workflow);
					// TODO see if this is needed still workflow.rollOptions.versatile = workflow.rollOptions.versatile || versatile || workflow.isVersatile;
					// if showing a full card we don't want to auto roll attacks or damage.
					workflow.noAutoDamage = config.midiOptions.systemCard;
					workflow.noAutoAttack = config.midiOptions.systemCard;
					const consume = this.consume;
					if (consume?.type === "ammo") {
						workflow.ammo = this.actor.items.get(consume.target);
					}
					workflow.reactionQueried = false;
					const blockReaction = thisUsesReaction && hasReaction && workflow.inCombat && needsReactionCheck(this.actor) && !config.midiOptions?.ammoSelector?.hasRun;
					if (blockReaction) {
						let shouldRoll = false;
						let d = await Dialog.confirm({
							title: i18n("midi-qol.EnforceReactions.Title"),
							content: i18n("midi-qol.EnforceReactions.Content"),
							yes: () => { shouldRoll = true; },
						});
						if (!shouldRoll) {
							await workflow.performState(workflow.WorkflowState_Abort);
							return this.removeWorkflow(); // user aborted roll TODO should the workflow be deleted?
						}
					}
					const hasBonusAction = hasUsedBonusAction(this.actor);
					const itemUsesBonusAction = ["bonus"].includes(this.activation?.type);
					const blockBonus = workflow.inCombat && itemUsesBonusAction && hasBonusAction && needsBonusActionCheck(this.actor) && !config.midiOptions?.ammoSelector?.hasRun;
					if (blockBonus) {
						let shouldRoll = false;
						let d = await Dialog.confirm({
							title: i18n("midi-qol.EnforceBonusActions.Title"),
							content: i18n("midi-qol.EnforceBonusActions.Content"),
							yes: () => { shouldRoll = true; },
						});
						if (!shouldRoll) {
							await workflow.performState(workflow.WorkflowState_Abort); // user aborted roll TODO should the workflow be deleted?
							return this.removeWorkflow();
						}
					}
					const hookAbort = await asyncHooksCall("midi-qol.preItemRoll", { activity: this, token: tokenToUse, config, dialog, message }) === false || await asyncHooksCall(`midi-qol.preItemRoll.${this.uuid}`, { activity: this, token: tokenToUse, config, dialog, message }) === false;
					if (hookAbort || workflow.aborted) {
						console.warn("midi-qol | attack roll blocked by preItemRoll hook");
						workflow.aborted = true;
						await workflow.performState(workflow.WorkflowState_Abort);
						return this.removeWorkflow();
					}
					if (configSettings.allowUseMacro) {
						const results = await workflow.callMacros(workflow.item, workflow.onUseMacros?.getMacros("preItemRoll"), "OnUse", "preItemRoll");
						if (workflow.aborted || results.some(i => i === false)) {
							console.warn("midi-qol | item roll blocked by preItemRoll macro");
							workflow.aborted = true;
							await workflow.performState(workflow.WorkflowState_Abort);
							return this.removeWorkflow();
						}
					}
					let needPause = false;
					for (let tokenRef of this.targets) {
						const target = getToken(tokenRef);
						if (!target)
							continue;
						if (
						//@ts-expect-error - sight not enabled but we are treating it as if it is
						(!target.document.sight.enabled && configSettings.optionalRules.invisVision)
							|| (target.document.actor?.type === "npc")
							//@ts-expect-error - sight enabled but not the owner of the token
							|| (!target.isOwner && target.document.sight.enabled)
							|| (!target.vision || !target.vision?.los)) {
							initializeVision(target);
							needPause = game.modules.get("levels-3d-preview")?.active ?? false;
						}
					}
					if (needPause) {
						await busyWait(0.1);
						for (let tokenRef of this.targets) {
							const target = getToken(tokenRef);
							if (!target || !target.vision?.los)
								continue;
							const sourceId = target.sourceId;
							//@ts-expect-error
							canvas?.effects?.visionSources.set(sourceId, target.vision);
						}
					}
					for (let tokenRef of this.targets) {
						const target = getToken(tokenRef);
						if (!target)
							continue;
						const tokenCanSense = tokenToUse ? canSense(tokenToUse, target, globalThis.MidiQOL.InvisibleDisadvantageVisionModes) : true;
						const targetCanSense = tokenToUse ? canSense(target, tokenToUse, globalThis.MidiQOL.InvisibleDisadvantageVisionModes) : true;
						if (targetCanSense)
							workflow.targetsCanSense.add(tokenToUse);
						else
							workflow.targetsCanSense.delete(tokenToUse);
						if (tokenCanSense)
							workflow.tokenCanSense.add(target);
						else
							workflow.tokenCanSense.delete(target);
						const tokenCanSee = tokenToUse ? canSee(tokenToUse, target) : true;
						const targetCanSee = tokenToUse ? canSee(target, tokenToUse) : true;
						if (targetCanSee)
							workflow.targetsCanSee.add(tokenToUse);
						else
							workflow.targetsCanSee.delete(tokenToUse);
						if (tokenCanSee)
							workflow.tokenCanSee.add(target);
						else
							workflow.tokenCanSee.delete(target);
					}
					workflow.processAttackEventOptions();
					await workflow.checkAttackAdvantage();
					workflow.showCard = true;
					const wrappedRollStart = Date.now();
					if (itemUsesBonusAction && !hasBonusAction && configSettings.enforceBonusActions !== "none" && workflow.inCombat)
						await setBonusActionUsed(this.actor);
					if (thisUsesReaction && !hasReaction && configSettings.enforceReactions !== "none" && workflow.inCombat)
						await setReactionUsed(this.actor);
					// Need concentration removal to complete before allowing workflow to continue so have workflow wait for item use to complete
				}
				catch (err) {
					const message = `confirmCanProceed error for ${this.actor?.name} ${this.name} ${this.uuid}`;
					TroubleShooter.recordError(err, message);
					throw err;
				}
				return true;
			}
			_usageChatButtons(message) {
				let buttons = super._usageChatButtons(message);
				const autoCreatetemplate = activityHasAutoPlaceTemplate(this);
				const emanationNoTemplate = activityHasEmanationNoTemplate(this);
				if (autoCreatetemplate || emanationNoTemplate) {
					buttons = buttons.filter(b => b.dataset?.action !== "placeTemplate");
				}
				return buttons;
			}
			async _placeEmanationTemplate() {
				// const tokenToUse: Token = workflow?.attackingToken;
				const autoCreatetemplate = activityHasAutoPlaceTemplate(this);
				const actor = this.item.parent;
				const tokenToUse = getToken(actor);
				if (!tokenToUse)
					return;
				if (autoCreatetemplate) {
					const gs = canvas?.dimensions?.distance ?? 5;
					const templateOptions = {};
					// square templates don't respect the options distance field
					let item = this;
					let target = this.target ?? { value: 0 };
					const fudge = 0.1;
					//@ts-expect-error
					const { width, height } = tokenToUse.document;
					templateOptions.distance = Math.ceil(target.template.size + Math.max(width / 2, height / 2, 0) * (canvas?.dimensions?.distance ?? 0));
					templateOptions.x = tokenToUse.center?.x ?? 0;
					templateOptions.y = tokenToUse.center?.y ?? 0;
					foundry.utils.setProperty(templateOptions, `flags.${MODULE_ID}.actorUuid`, actor.uuid);
					foundry.utils.setProperty(templateOptions, `flags.${MODULE_ID}.tokenId`, tokenToUse.id);
					foundry.utils.setProperty(templateOptions, `flags.${MODULE_ID}.workflowId`, this.uuid); // TODO look at this when workflow ids are chat card ids
					foundry.utils.setProperty(templateOptions, `flags.${MODULE_ID}.itemUuid`, this.item.uuid);
					// @ts-expect-error .canvas
					let templates = game.system.canvas.AbilityTemplate.fromActivity(this, templateOptions);
					// fromActivity returns an array of templates - work out if we need more than one
					if (!templates)
						error("No templates returned from fromActivity");
					let template = templates[0];
					const templateData = template.document.toObject();
					if (this.item)
						foundry.utils.setProperty(templateData, `flags.${MODULE_ID}.itemUuid`, this.item.uuid);
					if (this.actor)
						foundry.utils.setProperty(templateData, `flags.${MODULE_ID}.actorUuid`, this.actor.uuid);
					if (!foundry.utils.getProperty(templateData, `flags.${game.system.id}.origin`))
						foundry.utils.setProperty(templateData, `flags.${game.system.id}.origin`, this.item?.uuid);
					// @ts-expect-error
					const templateDocuments = await canvas?.scene?.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
					if (templateDocuments && templateDocuments.length > 0) {
						let td = templateDocuments[0];
						await td.object?.refresh();
						await busyWait(0.01);
						const workflow = this.workflow ?? Workflow.getWorkflow(this.uuid); // TODO review this when worklow ids are chat card ids 
						if (workflow) {
							workflow.templateUuid = td.uuid;
							workflow.template = td;
							workflow.templateId = td?.object?.id;
							if (installedModules.get("walledtemplates") && this.flags?.walledtemplates?.attachToken === "caster") {
								// @ts-expect-error .object
								await tokenToUse.attachTemplate(td.object, { "flags.dae.stackable": "noneName" }, true);
								if (workflow && !foundry.utils.getProperty(this, "item.flags.walledtemplates.noAutotarget"))
									selectTargets.bind(this)(td);
							}
							else if (getActivityAutoTarget(this) !== "none")
								selectTargets.bind(this)(td);
						}
						return templates;
					}
				}
			}
			async _usageChatContext(message) {
				let systemCard = false;
				const minimalCard = false;
				// Insert targets as required for emanation templates and emanationNoTemplate
				// This is the wrong spot, but there is no other good spot for it.
				const tokenToUse = getToken(this.item.parent);
				const autoCreatetemplate = activityHasAutoPlaceTemplate(this);
				const emanationNoTemplate = activityHasEmanationNoTemplate(this);
				// If emanationTemplate or emanationNoTemplate setup game.user.targets.
				if (tokenToUse && autoCreatetemplate) {
					this.templates = await this._placeEmanationTemplate();
				}
				if (tokenToUse && emanationNoTemplate) {
					setRangedTargets(tokenToUse, this.target);
				}
				//@ts-expect-error
				foundry.utils.setProperty(message.data, "flags.dnd5e.targets", game.system.utils.getTargetDescriptors());
				const context = await super._usageChatContext(message);
				if (systemCard === undefined)
					systemCard = false;
				if (debugEnabled > 0)
					warn("show item card ", this, this.actor, this.actor.token, systemCard, this.workflow);
				let needAttackButton = !getRemoveAttackButtons(this.item) || configSettings.mergeCardMulti || configSettings.confirmAttackDamage !== "none" ||
					(!this.workflow?.someAutoRollEventKeySet() && !getAutoRollAttack(this.workflow) && !this.workflow?.midiOptions?.autoRollAttack);
				const needDamagebutton = (this.hasDamage || this.hasHealing) && ((["none", "saveOnly"].includes(getAutoRollDamage(this.workflow)) || this.workflow?.rollOptions.rollToggle)
					|| configSettings.confirmAttackDamage !== "none"
					|| !getRemoveDamageButtons(this.item)
					|| systemCard
					|| configSettings.mergeCardMulti);
				const needVersatileButton = this.item.system.isVersatible && (systemCard || ["none", "saveOnly"].includes(getAutoRollDamage(this.workflow)) || !getRemoveDamageButtons(this.item));
				// not used const sceneId = token?.scene && token.scene.id || canvas?.scene?.id;
				const isPlayerOwned = this.item.actor?.hasPlayerOwner;
				const hideItemDetails = (["none", "cardOnly"].includes(configSettings.showItemDetails) || (configSettings.showItemDetails === "pc" && !isPlayerOwned))
					|| !configSettings.itemTypeList?.includes(this.item.type);
				const hasEffects = !["applyNoButton", "applyRemove"].includes(configSettings.autoItemEffects) && this.workflow?.workflowType === "BaseWorkflow" && this.effects.find(ae => !ae.transfer && !foundry.utils.getProperty(ae, "flags.dae.dontApply"));
				let dmgBtnText = (this.actionType === "heal") ? i18n(`${SystemString}.Healing`) : i18n(`${SystemString}.Damage`);
				if (this.workflow?.midiOptions?.fastForwardDamage && configSettings.showFastForward)
					dmgBtnText += ` ${i18n("midi-qol.fastForward")}`;
				let versaBtnText = i18n(`${SystemString}.Versatile`);
				if (this.workflow?.midiOptions?.fastForwardDamage && configSettings.showFastForward)
					versaBtnText += ` ${i18n("midi-qol.fastForward")}`;
				let midiContextData = {
					hasButtons: true,
					labels: this.labels,
					//@ ts-expect-error TODO needed for abilities translation
					// config: game.system.config,
					condensed: configSettings.mergeCardCondensed,
					hasAttack: this.attack && !minimalCard && (systemCard || needAttackButton || configSettings.confirmAttackDamage !== "none"),
					isHealing: !minimalCard && this.item.isHealing && (systemCard || configSettings.autoRollDamage !== "always"),
					hasDamage: needDamagebutton,
					hasAttackRoll: !minimalCard && this.attack,
					configSettings,
					hideItemDetails,
					dmgBtnText,
					versaBtnText,
					showProperties: this.workflow?.workflowType === "BaseWorkflow",
					hasEffects,
					effects: this.item.effects,
					isMerge: true,
					mergeCardMulti: configSettings.mergeCardMulti && (this.attack || this.hasDamage),
					confirmAttackDamage: configSettings.confirmAttackDamage !== "none" && (this.attack || this.hasDamage),
					RequiredMaterials: i18n(`${SystemString}.RequiredMaterials`),
					Attack: i18n(`${SystemString}.Attack`),
					OtherFormula: i18n(`${SystemString}.OtherFormula`),
					canCancel: configSettings.undoWorkflow // TODO enable this when more testing done.
				};
				context.buttons = context.buttons?.filter(b => !["rollAttack", "rollDamage", "rollHealing"].includes(b.dataset?.action));
				if (configSettings.autoCheckSaves !== "none")
					context.buttons = context.buttons?.filter(b => !["rollSave", "rollCheck"].includes(b.dataset?.action));
				return foundry.utils.mergeObject(context, midiContextData);
			}
			get actionType() {
				return this.metadata.type;
			}
			get otherActivity() {
				return undefined;
			}
			get useCondition() {
				if (this.useConditionText && this.useConditionText !== "")
					return this.useConditionText;
				return foundry.utils.getProperty(this.item, "flags.midi-qol.itemCondition") ?? "";
			}
			get effectCondition() {
				if (this.effectConditionText && this.effectConditionText !== "")
					return this.effectConditionText;
				return foundry.utils.getProperty(this.item, "flags.midi-qol.effectCondition") ?? "";
			}
			get reactionCondition() {
				if (this.useCondition && this.useCondition !== "")
					return this.useCondition;
				return foundry.utils.getProperty(this.item, "flags.midi-qol.reactionCondition") ?? "";
			}
			get otherCondition() {
				if (this.otherActivity && this.otherActivity?.useCondition !== "")
					return this.otherActivity.useCondition;
				return foundry.utils.getProperty(this.item, "flags.midi-qol.otherCondition") ?? "";
			}
			get hasDamage() {
				return this.damage?.parts.length > 0;
			}
			get hasHealing() {
				return this.healing !== undefined;
			}
			get hasAttack() {
				return this.attack !== undefined;
			}
		},
		_MidiActivityMixin_applyEffects = async function _MidiActivityMixin_applyEffects(event, target, message) {
			const workflow = this.workflow;
			const authorId = message.author.id;
			if (!workflow)
				return;
			if ((workflow.targets?.size ?? 0) === 0)
				return;
			if (game.user?.id !== authorId) {
				// applying effects on behalf of another user;
				if (!game.user?.isGM) {
					ui.notifications?.warn("Only the GM can apply effects for other players");
					return;
				}
				if (game.user.targets.size === 0) {
					ui.notifications?.warn(i18n("midi-qol.noTokens"));
					return;
				}
				const result = (await socketlibSocket.executeAsUser("applyEffects", authorId, {
					workflowId: this.uuid,
					targets: Array.from(game.user.targets).map(t => t.document.uuid)
				}));
			}
			else {
				if (workflow) {
					workflow.forceApplyEffects = true; // don't overwrite the application targets
					workflow.effectTargets = game.user?.targets;
					if (workflow.effectTargets.size > 0)
						workflow.performState(workflow.WorkflowState_ApplyDynamicEffects);
				}
				else {
					ui.notifications?.warn(i18nFormat("midi-qol.NoWorkflow", { itemName: this.item?.name }));
				}
			}
		},
		_MidiActivityMixin_confirmDamageRollCancel = async function _MidiActivityMixin_confirmDamageRollCancel(event, target, message) {
			const authorId = message.author.id;
			if (!authorId)
				return;
			if (!game.user?.isGM && configSettings.confirmAttackDamage === "gmOnly") {
				return;
			}
			const user = game.users?.get(authorId);
			if (user?.active) {
				await socketlibSocket.executeAsUser("cancelWorkflow", authorId, { workflowId: this?.uuid, itemCardId: message.id, itemCardUuid: message.uuid }).then(result => {
					if (typeof result === "string")
						ui.notifications?.warn(result);
				});
			}
			else {
				await Workflow.removeItemCardAttackDamageButtons(message.id);
				await Workflow.removeItemCardConfirmRollButton(message.id);
			}
		},
		_MidiActivityMixin_confirmDamageRollComplete = async function _MidiActivityMixin_confirmDamageRollComplete(event, target, message) {
			await this.doConfirmation("confirmDamageRollComplete", event, target, message);
		},
		_MidiActivityMixin_confirmDamageRollCompleteHit = async function _MidiActivityMixin_confirmDamageRollCompleteHit(event, target, message) {
			await this.doConfirmation("confirmDamageRollCompleteHit", event, target, message);
		},
		_MidiActivityMixin_confirmDamageRollCompleteMiss = async function _MidiActivityMixin_confirmDamageRollCompleteMiss(event, target, message) {
			await this.doConfirmation("confirmDamageRollCompleteMiss", event, target, message);
		},
		_MidiActivityMixin_rollDamageNoCritical = function _MidiActivityMixin_rollDamageNoCritical(event, target, message) {
			return this.rollDamage({ event, critical: { allow: false }, midiOptions: { isCritical: false } }, {}, message);
		},
		_MidiActivityMixin_rollDamgeCritical = function _MidiActivityMixin_rollDamgeCritical(event, target, message) {
			return this.rollDamage({ event, midiOptions: { isCritical: true } }, {}, message);
		},
		_a.LOCALIZATION_PREFIXES = [...Reflect.get(_b, "LOCALIZATION_PREFIXES", _a), "midi-qol.SHARED"],
		_a.metadata = foundry.utils.mergeObject(Reflect.get(_b, "metadata", _a), {
			usage: {
				dialog: MidiActivityUsageDialog,
				actions: {
					rollDamageNoCritical: __classPrivateFieldGet(_a, _a, "m", _MidiActivityMixin_rollDamageNoCritical),
					rollDamageCritical: __classPrivateFieldGet(_a, _a, "m", _MidiActivityMixin_rollDamgeCritical),
					confirmDamageRollCancel: __classPrivateFieldGet(_a, _a, "m", _MidiActivityMixin_confirmDamageRollCancel),
					confirmDamageRollComplete: __classPrivateFieldGet(_a, _a, "m", _MidiActivityMixin_confirmDamageRollComplete),
					confirmDamageRollCompleteHit: __classPrivateFieldGet(_a, _a, "m", _MidiActivityMixin_confirmDamageRollCompleteHit),
					confirmDamageRollCompleteMiss: __classPrivateFieldGet(_a, _a, "m", _MidiActivityMixin_confirmDamageRollCompleteMiss),
					midiApplyEffects: __classPrivateFieldGet(_a, _a, "m", _MidiActivityMixin_applyEffects),
				}
			},
		}, { inplace: false, insertValues: true, insertKeys: true }),
		_a;
};
export var MidiActivityMixinSheet = Base => {
	var _a, _b, _MidiActivitySheet_addMacro;
	return _a = class MidiActivitySheet extends (_b = Base) {
			_getTabs() {
				let tabs = super._getTabs();
				tabs = {
					...tabs,
					"midi-qol": {
						id: "midi-qol", group: "sheet", icon: "fa-solid fa-sun", label: "midi-qol"
					}
				};
				return super._markTabs(tabs);
			}
			async _prepareMidiQolContext(context) {
				context.ConfirmTargetOptions = Object.entries(geti18nOptions("ConfirmTargetOptions")).map(([value, label]) => ({ value, label }));
				context.placeholderIdentifier = context.activity.identifier;
				const midiProperties = context.activity.midiProperties;
				context.triggeredActivityOptions = this.item.system.activities
					.filter(a => a.id !== this.activity.id)
					.reduce((ret, a) => { ret.push({ label: `${a.name}`, value: a.id }); return ret; }, [{ label: "None", value: "none" }]);
				context.triggeredActivityOptions?.forEach(option => { option.selected = option.value === this.activity.midiProperties.triggeredActivityId; });
				let activity = context.activity;
				let triggeredActivity = context.activity.triggeredActivity;
				const triggerList = [activity.name];
				while (triggeredActivity) {
					triggerList.push(triggeredActivity.name);
					if (triggeredActivity.id === activity.id) {
						ui.notifications?.error(`midi-qol | Circular activity call detected ${triggerList.join("->")}`);
						break;
					}
					triggeredActivity = triggeredActivity.triggeredActivity;
				}
				context.triggeredActivityTargetOptions = Object.entries(geti18nOptions("TriggeredActivityTargetOptions")).map(([value, label]) => {
					return { value, label, selected: midiProperties.triggeredActivityTargets === value };
				});
				context.triggeredActivityRollAsOptions = Object.entries(geti18nOptions("TriggeredActivityRollAsOptions")).map(([value, label]) => {
					return { value, label, selected: midiProperties.triggeredActivityRollAs === value };
				});
				context.ignoreTraitsOptions = Object.entries(geti18nOptions("SHARED.FIELDS.midiProperties.ignoreTraits")).map(([value, entry]) => {
					//@ts-expect-error
					return { value, label: entry.label, selected: this.activity.midiProperties.ignoreTraits.has(value) };
				});
				context.possibleOtherActivity = this.activity.possibleOtherActivity;
				return context;
			}
			async _preparePartContext(partId, context) {
				if (partId === "midi-qol") {
					context.tab = context.tabs["midi-qol"];
					return this._prepareMidiQolContext(context);
				}
				return super._preparePartContext(partId, context);
			}
			/** @override */ // This does not seem to work for activity sheets
			_getHeaderButtons() {
				let buttons = super._getHeaderButtons();
				const DIMtitle = game.i18n.localize('dae.DIMEditor.Name');
				const Editor = globalThis.DAE?.DIMEditor;
				if (!Editor)
					return buttons;
				buttons.unshift({
					label: DIMtitle,
					class: "dae-dimeditor",
					icon: "fas fa-file-pen",
					onclick: () => { new Editor(this.document, {}).render(true); }
				});
				return buttons;
			}
		},
		_MidiActivitySheet_addMacro = function _MidiActivitySheet_addMacro() {
			const Editor = globalThis.DAE?.DIMEditor;
			if (Editor)
				new Editor(this.activity, {}).render(true);
			else
				ui.notifications?.error("DIMEditor not available - install Dynamic Active Effects");
		},
		_a.DEFAULT_OPTIONS = {
			...Reflect.get(_b, "DEFAULT_OPTIONS", _a),
			actions: {
				...Reflect.get(_b, "DEFAULT_OPTIONS", _a).actions,
				addMacro: __classPrivateFieldGet(_a, _a, "m", _MidiActivitySheet_addMacro),
			}
		},
		_a.PARTS = {
			...Reflect.get(_b, "PARTS", _a),
			"midi-qol": {
				template: "modules/midi-qol/templates/activity/midi-activity-tab.hbs",
			}
		},
		_a;
};
function renderActivitySheetHook(app, [elem]) {
	const Editor = globalThis.DAE?.DIMEditor;
	if (!Editor)
		return;
	let activity = app.activity;
	if (!activity.macro)
		return;
	let existingButton = elem.closest('.window-header').querySelector('button.dae-dimeditor');
	if (existingButton) {
		if (activity.macro?.command)
			existingButton.style.color = '#36ba36';
		return;
	}
	let closeButton = elem.closest('.window-header').querySelector('button[data-action="close"]');
	let daeButton = document.createElement('button');
	const DIMtitle = game.i18n.localize('dae.DIMEditor.Name');
	daeButton.setAttribute('class', 'header-control fa-solid fa-file-pen dae-dimeditor');
	daeButton.onclick = ev => { new Editor(activity, {}).render(true); };
	if (activity.macro?.command)
		daeButton.style.color = '#36ba36';
	daeButton.title = "Activity Macro Editor";
	closeButton.parentNode.insertBefore(daeButton, closeButton);
}
export var MidiActivityUsageDialog;
export function setupMidiActivityMixin() {
	//@ts-expect-error
	const ActivityUsageDialog = game.system.applications.activity.ActivityUsageDialog;
	MidiActivityUsageDialog = class MidiActivityUsageDialog extends ActivityUsageDialog {
		async _prepareCreationContext(context, options) {
			context = await super._prepareCreationContext(context, options);
			//@ts-expect-error
			if (activityHasAutoPlaceTemplate(this.activity) || activityHasEmanationNoTemplate(this.activity)) {
				context.hasCreation = false;
			}
			return context;
		}
	};
	Hooks.on("renderActivitySheet", renderActivitySheetHook);
}
