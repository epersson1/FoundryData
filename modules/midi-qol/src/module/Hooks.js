import { warn, error, debug, i18n, debugEnabled, overTimeEffectsToDelete, allAttackTypes, savedOverTimeEffectsToDelete, geti18nOptions, GameSystemConfig, MODULE_ID } from "../midi-qol.js";
import { colorChatMessageHandler, nsaMessageHandler, hideStuffHandler, processItemCardCreation, hideRollUpdate, hideRollRender, processCreateDDBGLMessages, ddbglPendingHook, checkOverTimeSaves } from "./chatMessageHandling.js";
import { processUndoDamageCard } from "./GMAction.js";
import { untargetDeadTokens, untargetAllTokens, midiCustomEffect, MQfromUuidSync, removeReactionUsed, removeBonusActionUsed, checkflanking, expireRollEffect, removeActionUsed, expirePerTurnBonusActions, getCachedDocument, getUpdatesCache, clearUpdatesCache, expireEffects, createConditionData, processConcentrationRequestMessage, evalAllConditions, doSyncRoll, doConcentrationCheck, _processOverTime, isConcentrating, getCEEffectByName } from "./utils.js";
import { activateMacroListeners, getCurrentSourceMacros } from "./apps/Item.js";
import { checkMechanic, checkRule, configSettings, dragDropTargeting } from "./settings.js";
import { checkWounded, checkDeleteTemplate, preUpdateItemActorOnUseMacro, zeroHPExpiry, deathSaveHook } from "./patching.js";
import { TroubleShooter } from "./apps/TroubleShooter.js";
import { Workflow } from "./Workflow.js";
import { ActorOnUseMacrosConfig } from "./apps/ActorOnUseMacroConfig.js";
import { installedModules } from "./setupModules.js";
import { preActivityConsumptionHook, activityConsumptionHook } from "./activities/activityHelpers.js";
export const concentrationCheckItemName = "Concentration Check - Midi QOL";
export var concentrationCheckItemDisplayName = "Concentration Check";
export var midiFlagTypes = {};
export let readyHooks = async () => {
	// Handle removing effects when the token is moved.
	Hooks.on("updateToken", (tokenDocument, update, diff, userId) => {
		if (game.user?.id !== userId)
			return;
		if ((update.x || update.y) === undefined)
			return;
		const actor = tokenDocument.actor;
		const expiredEffects = actor?.effects.filter(ef => {
			const specialDuration = foundry.utils.getProperty(ef, "flags.dae.specialDuration");
			return specialDuration?.includes("isMoved");
		}) ?? [];
		if (expiredEffects.length > 0)
			expireEffects(actor, expiredEffects, { "expiry-reason": "midi-qol:isMoved" });
	});
	Hooks.on("template3dUpdatePreview", (at, t) => {
		//@ts-expect-error Volumetrictemplates
		VolumetricTemplates.compute3Dtemplate(t);
	});
	Hooks.on("targetToken", foundry.utils.debounce(checkflanking, 150));
	Hooks.on("ddb-game-log.pendingRoll", (data) => {
		ddbglPendingHook(data);
	});
	Hooks.on("ddb-game-log.fulfilledRoll", (data) => {
		ddbglPendingHook(data);
	});
	Hooks.on("preUpdateChatMessage", (message, update, options, user) => {
		try {
			if (!getCachedDocument(message.uuid))
				return true;
			const cachedUpdates = getUpdatesCache(message.uuid);
			clearUpdatesCache(message.uuid);
			// hideStuffHandler(message, $(message.content), user);
			//@ts-expect-error
			if (!foundry.utils.isEmpty(cachedUpdates)) {
				if (debugEnabled > 0)
					warn("preUpdateChatMessage inserting updates", message.uuid, update, cachedUpdates);
				Object.keys(cachedUpdates).forEach(key => {
					if (!foundry.utils.getProperty(update, key))
						foundry.utils.setProperty(update, key, cachedUpdates[key]);
				});
			}
			return true;
		}
		finally {
			return true;
		}
	});
	Hooks.on("deleteMeasuredTemplate", checkDeleteTemplate);
	// Handle updates to the characters HP
	// Handle concentration checks
	Hooks.on("updateActor", async (actor, update, options, user) => {
		if (user !== game.user?.id)
			return;
		const hpUpdate = foundry.utils.getProperty(update, "system.attributes.hp.value");
		const temphpUpdate = foundry.utils.getProperty(update, "system.attributes.hp.temp");
		const vitalityResource = checkRule("vitalityResource");
		const vitalityUpdate = typeof vitalityResource === "string" ? foundry.utils.getProperty(update, vitalityResource) : undefined;
		if (hpUpdate !== undefined || temphpUpdate !== undefined || vitalityUpdate !== undefined) {
			const hpUpdateFunc = async () => {
				await checkWounded(actor, update, options, user);
				await zeroHPExpiry(actor, update, options, user);
			};
			await hpUpdateFunc();
			if (actor.system.attributes.hp.value <= 0 && configSettings.removeConcentration) {
				await actor.endConcentration();
			}
			return;
		}
	});
	Hooks.on("preUpdateActor", (actor, changes, options, userId) => {
		try {
			if (userId !== game.user?.id)
				return true;
			if (changes.system?.attributes?.hp?.value === undefined)
				return true;
			const hp = actor.system.attributes?.hp?.value;
			const newHP = changes.system.attributes.hp.value;
			if (newHP >= hp)
				return true;
			if (configSettings.doConcentrationCheck === "item" && !options.noConcentrationCheck && isConcentrating(actor)) {
				doConcentrationCheck(actor, actor.getConcentrationDC(hp - newHP));
			}
		}
		catch (err) {
			console.error("Error in preUpdateActor", err);
		}
		finally {
			return true;
		}
	});
	Hooks.on("renderActorArmorConfig", (app, html, data) => {
		if (!["none", undefined, false].includes(checkRule("challengeModeArmor"))) {
			const ac = data.ac;
			const element = html.find(".stacked"); // TODO do this better
			let ARHtml = $(`<div>EC: ${ac.EC}</div><div>AR: ${ac.AR}</div>`);
			element.append(ARHtml);
		}
	});
	// Handle removal of concentration
	Hooks.on("deleteActiveEffect", (...args) => {
		let [deletedEffect, options, user] = args;
		if (options.undo)
			return; // TODO check that this is right
		if (debugEnabled > 0)
			console.warn("deleteActiveEffect", deletedEffect, options, user);
		const checkConcentration = configSettings.concentrationAutomation;
		//@ts-expect-error activeGM
		if (!game.users?.activeGM?.isSelf)
			return;
		if (!(deletedEffect.parent instanceof CONFIG.Actor.documentClass))
			return;
		if (debugEnabled > 0)
			warn("deleteActiveEffectHook", deletedEffect, deletedEffect.parent.name, options);
		async function changefunc() {
			try {
				let origin = MQfromUuidSync(deletedEffect.origin);
				if (origin instanceof ActiveEffect && !options.noConcentrationCheck && configSettings.removeConcentrationEffects !== "none") {
					//@ts-expect-error
					if (origin.statuses?.has(CONFIG.specialStatusEffects.CONCENTRATING) && origin.getDependents()?.length === 0) {
						if (!installedModules.get("times-up") || (origin?.duration?.remaining ?? 1) > 0) {
							await origin.delete();
						}
					}
				}
				/*
				if (deletedEffect._id === getStaticID("reaction") && deletedEffect.parent instanceof CONFIG.Actor.documentClass) {
				await deletedEffect.parent.update({ "flags.midi-qol.actions.reaction": false, "flags.midi-qol.actions.-=reactionCombatRound": false});
				}
				if (deletedEffect._id === getStaticID("bonusaction") && deletedEffect.parent instanceof CONFIG.Actor.documentClass) {
				await deletedEffect.parent.update({ "flags.midi-qol.actions.bonus": false, "flags.midi-qol.actions.-=bonusActionCombatRound": false});
				}
				*/
				return true;
			}
			catch (err) {
				console.warn("Error in deleteActiveEffect", err, deletedEffect, options);
				return true;
			}
		}
		// if (globalThis.DAE?.actionQueue) globalThis.DAE.actionQueue.add(changefunc);
		return changefunc();
	});
	// Hooks.on("restCompleted", restManager); I think this means 1.6 is required.
	Hooks.on("dnd5e.restCompleted", restManager);
	Hooks.on("dnd5e.preActivityConsumption", preActivityConsumptionHook);
	Hooks.on("dnd5e.activityConsumption", activityConsumptionHook);
	//@ts-expect-error
	if (foundry.utils.isNewerVersion("12.1.0", game.modules.get("babonus")?.version ?? "0"))
		registerBaBonusHooks();
	Hooks.on("dnd5e.rollDeathSave", deathSaveHook);
	Hooks.on("updateCombat", (combat, update, options, userId) => {
		//@ts-expect-error
		if (userId != game.users?.activeGM?.id)
			return;
		if (!update.hasOwnProperty("round"))
			return;
		if (!checkMechanic("autoRerollInitiative"))
			return;
		let combatantIds = combat.combatants.map(c => c.id);
		if (combat.combatants?.size > 0) {
			combat.rollInitiative(combatantIds, { updateTurn: true }).then(() => combat.update({ turn: 0 }));
		}
	});
	// Concentration Check is rolled as an item roll so we need an item.
	itemJSONData.name = concentrationCheckItemName;
};
function registerBaBonusHooks() {
	//TODO migrate all of these to v2 once babonus is dnd5e 4.0 ready
	if (!game.modules.get("babonus")?.active)
		return;
	// Midi sets fastForward to true for most of these rolls - based on roll settings
	// need to handle the cases where there is an optional babonus defined and disable fastforward.
	Hooks.on("babonus.filterBonuses", (bonuses, subjects, details, hookType) => {
		if (!(subjects.actor || !subjects.item))
			return;
		const subject = subjects.item ?? subjects.actor;
		const hasOptionalBonus = bonuses?.some(bonus => bonus.optional);
		foundry.utils.setProperty(subject, "flags.midi-qol.hasBabonusOptionalBonus", hasOptionalBonus);
	});
	Hooks.on("dnd5e.preRollAttackV2", (rollConfig, dialogConfig, messageConfig) => {
		const forceConfigure = foundry.utils.getProperty(rollConfig.subject.item, "flags.midi-qol.hasBabonusOptionalBonus");
		if (forceConfigure)
			dialogConfig.configure = true;
		return true;
	});
	Hooks.on("dnd5e.preRollAbilitySave", (actor, rollData, abilityId) => {
		rollData.fastForward && (rollData.fastForward = !foundry.utils.getProperty(actor, "flags.midi-qol.hasBabonusOptionalBonus"));
		return true;
	});
	Hooks.on("dnd5e.preRollAbilityTest", (actor, rollData, abilityId) => {
		rollData.fastForward && (rollData.fastForward = !foundry.utils.getProperty(actor, "flags.midi-qol.hasBabonusOptionalBonus"));
		return true;
	});
	Hooks.on("dnd5e.preRollToolCheck", (actor, rollData, toolId) => {
		rollData.fastForward && (rollData.fastForward = !foundry.utils.getProperty(actor, "flags.midi-qol.hasBabonusOptionalBonus"));
		return true;
	});
	Hooks.on("dnd5e.preRollSkill", (actor, rollData, skillId) => {
		rollData.fastForward && (rollData.fastForward = !foundry.utils.getProperty(actor, "flags.midi-qol.hasBabonusOptionalBonus"));
		return true;
	});
	Hooks.on("dnd5e.preRollDamageV2", (rollConfig, dialogConfig, nessageConfig) => {
		const forceConfigure = foundry.utils.getProperty(rollConfig.subject.item, "flags.midi-qol.hasBabonusOptionalBonus");
		if (forceConfigure)
			dialogConfig.configure = true;
		return true;
	});
	Hooks.on("dnd5e.preRollDeathSave", (actor, rollData, abilityId) => {
		rollData.fastForward && (rollData.fastForward = !foundry.utils.getProperty(actor, "flags.midi-qol.hasBabonusOptionalBonus"));
		return true;
	});
}
export async function restManager(actor, result) {
	if (!actor || !result)
		return;
	const specialDuration = (effect) => { return foundry.utils.getProperty(effect, "flags.dae.specialDuration"); };
	const effectsToExpire = (actorRef) => {
		const effects = actorRef.appliedEffects;
		const validEffects = effects.filter(effect => (specialDuration(effect) ?? []).length > 0);
		return {
			newDay: validEffects.filter(ef => result.newDay && specialDuration(ef)?.includes(`newDay`)),
			longRest: validEffects.filter(ef => result.longRest && specialDuration(ef)?.includes(`longRest`) && !specialDuration(ef)?.includes(`newDay`)),
			shortRest: validEffects.filter(ef => specialDuration(ef)?.includes(`shortRest`) && !specialDuration(ef)?.includes(`newDay`)),
		};
	};
	const myExpiredEffects = effectsToExpire(actor);
	if (result.longRest && myExpiredEffects.longRest.length)
		await expireEffects(actor, myExpiredEffects.longRest, { "expiry-reason": "midi-qol:longRest" });
	if (result.longRest && myExpiredEffects.shortRest.length)
		await expireEffects(actor, myExpiredEffects.shortRest, { "expiry-reason": "midi-qol:shortRest" });
	if (!result.longRest && myExpiredEffects.shortRest.length)
		await expireEffects(actor, myExpiredEffects.shortRest, { "expiry-reason": "midi-qol:shortRest" });
	if (result.newDay && myExpiredEffects.newDay.length)
		await expireEffects(actor, myExpiredEffects.newDay, { "expiry-reason": "midi-qol:newDay" });
	await removeReactionUsed(actor, true); // remove reaction used for a rest
	await removeBonusActionUsed(actor, true);
	await removeActionUsed(actor);
}
export function initHooks() {
	if (debugEnabled > 0)
		warn("Init Hooks processing");
	Hooks.on("preCreateChatMessage", (message, data, options, user) => {
		if (debugEnabled > 1)
			debug("preCreateChatMessage entering", message, data, options, user);
		nsaMessageHandler(message, data, options, user);
		checkOverTimeSaves(message, data, options, user);
		return true;
	});
	Hooks.on("createChatMessage", (message, options, user) => {
		if (debugEnabled > 1)
			debug("Create Chat Message ", message.id, message, options, user);
		processItemCardCreation(message, user);
		processCreateDDBGLMessages(message, options, user);
		return true;
	});
	Hooks.on("updateChatMessage", (message, update, options, user) => {
		hideRollUpdate(message, update, options, user);
		//@ts-ignore scrollBottom
		ui.chat?.scrollBottom();
	});
	Hooks.on("updateCombat", (combat, data, options, user) => {
		if (data.round === undefined && data.turn === undefined)
			return;
		untargetAllTokens(combat, data.options, user);
		untargetDeadTokens();
		//@ts-expect-error
		if (game.users?.activeGM.isSelf)
			_processOverTime(combat, data, options, user);
		// updateReactionRounds(combat, data, options, user); This is handled in processOverTime
	});
	Hooks.on("renderChatMessage", (message, html, data) => {
		if (debugEnabled > 1)
			debug("render message hook ", message.id, message, html, data);
		// chatDamageButtons(message, html, data); This no longer works since the html is rewritten
		processUndoDamageCard(message, html, data);
		colorChatMessageHandler(message, html, data);
		hideRollRender(message, html, data);
		hideStuffHandler(message, html, data);
		processConcentrationRequestMessage(message, html, data);
	});
	Hooks.on("deleteChatMessage", (message, options, user) => {
		if (message.author.id !== game.user?.id)
			return;
		const workflowId = foundry.utils.getProperty(message, "flags.midi-qol.workflowId");
		if (workflowId && Workflow.getWorkflow(workflowId))
			Workflow.removeWorkflow(workflowId);
	});
	Hooks.on("midi-qol.RollComplete", async (workflow) => {
		const wfuuid = workflow.uuid;
		if (savedOverTimeEffectsToDelete[wfuuid]) {
			if (workflow.saves.size === 1 || !workflow.hasSave) {
				let effect = MQfromUuidSync(savedOverTimeEffectsToDelete[wfuuid].uuid);
				expireEffects(effect.parent, [effect], { "expiry-reason": "midi-qol:overTime" });
			}
			delete savedOverTimeEffectsToDelete[wfuuid];
		}
		if (overTimeEffectsToDelete[wfuuid]) {
			let effect = MQfromUuidSync(overTimeEffectsToDelete[wfuuid].uuid);
			expireEffects(effect.parent, [effect], { "expiry-reason": "midi-qol:overTime" });
			delete overTimeEffectsToDelete[wfuuid];
		}
		if (debugEnabled > 1)
			debug("Finished the roll", wfuuid);
	});
	setupMidiFlagTypes();
	Hooks.on("applyActiveEffect", midiCustomEffect);
	// Hooks.on("preCreateActiveEffect", checkImmunity); Disabled in lieu of having effect marked suppressed
	Hooks.on("preUpdateItem", preUpdateItemActorOnUseMacro);
	Hooks.on("preUpdateActor", preUpdateItemActorOnUseMacro);
	Hooks.on("combatRound", expirePerTurnBonusActions); // TODO Move this to the update combat hook?
	Hooks.on("combatTurn", expirePerTurnBonusActions);
	Hooks.on("updateCombatant", (combatant, updates, options, user) => {
		if (game?.user?.id !== user)
			return true;
		if (combatant.actor && updates.initiative)
			expireRollEffect.bind(combatant.actor)("Initiative", "none");
		return true;
	});
	function getItemSheetData(data, item) {
		const config = GameSystemConfig;
		const midiProps = config.midiProperties;
		if (!item) {
			const message = "item not defined in getItemSheetData";
			console.error(message, data);
			TroubleShooter.recordError(new Error(message));
			return;
		}
		// let autoTargetOptions = foundry.utils.mergeObject({ "default": i18n("midi-qol.MidiSettings") }, geti18nOptions("autoTargetOptions"));
		let RemoveAttackDamageButtonsOptions = foundry.utils.mergeObject({ "default": i18n("midi-qol.MidiSettings") }, geti18nOptions("removeButtonsOptions"));
		const ceForItem = getCEEffectByName(item.name);
		data = foundry.utils.mergeObject(data, {
			allowUseMacro: configSettings.allowUseMacro,
			MacroPassOptions: Workflow.allMacroPasses,
			showCEOff: false,
			showCEOn: false,
			hasOtherDamage: true,
			showHeader: !configSettings.midiFieldsTab,
			midiPropertyLabels: midiProps,
			ConfirmTargetOptions: geti18nOptions("ConfirmTargetOptions"),
			// AutoTargetOptions: autoTargetOptions,
			RemoveAttackDamageButtonsOptions,
			hasReaction: true,
			onUseMacroParts: getCurrentSourceMacros(item)
		});
		if (!foundry.utils.getProperty(item, "flags.midi-qol.removeAttackDamageButtons")) {
			foundry.utils.setProperty(data, "flags.midi-qol.removeAttackDamageButtons", "default");
		}
		if (ceForItem) {
			data.showCEOff = ["both", "cepri", "itempri"].includes(configSettings.autoCEEffects);
			data.showCEOn = ["none", "itempri"].includes(configSettings.autoCEEffects);
		}
		foundry.utils.setProperty(data, "flags.midiProperties", item.flags?.midiProperties ?? {});
		if (["spell", "feat", "weapon", "consumable", "equipment", "power", "maneuver"].includes(item?.type)) {
			for (let prop of Object.keys(midiProps)) {
				if (item.system.properties?.has(prop)
					&& foundry.utils.getProperty(item, `flags.midiProperties.${prop}`) === undefined) {
					foundry.utils.setProperty(item, `flags.midiProperties.${prop}`, true);
				}
				else if (foundry.utils.getProperty(item, `flags.midiProperties.${prop}`) === undefined) {
					/* This has been moved to the activity
							if (["confirmTargets"].includes(prop)) {
								foundry.utils.setProperty(data, `flags.midiProperties.${prop}`, "default");
							} else foundry.utils.setProperty(data, `flags.midiProperties.${prop}`, false);
					*/
					foundry.utils.setProperty(data, `flags.midiProperties.${prop}`, false);
				}
			}
			if (!foundry.utils.getProperty(data, "flags.midi-qol.rollAttackPerTarget"))
				foundry.utils.setProperty(data, "flags.midi-qol.rollAttackPerTarget", "default");
			delete data.flags.midiProperties.rollOther;
			delete data.flags.midiProperties.fulldam;
			delete data.flags.midiProperties.halfdam;
			delete data.flags.midiProperties.nodam;
			delete data.flags.midiProperties.concentration;
			delete data.flags.midiProperties.critOther;
			delete data.flags.midiProperties.rollOther;
			delete data.flags.midiProperties.saveDamage;
			delete data.flags.midiProperties.bonusSaveDamage;
			delete data.flags.midiProperties.offHandWeapon;
			delete data.flags.midiProperties.otherSaveDamage;
			delete data.flags.midiProperties.confirmTargets;
			delete data.flags.midiProperties.idi;
			delete data.flags.midiProperties.idr;
			delete data.flags.midiProperties.ida;
			delete data.flags.midiProperties.idv;
			delete data.flags.AoETargetTypeIncludeSelf;
			if (data.flags["midi-qol"]?.AoETargetType)
				delete data.flags["midi-qol"].AoETargetType;
		}
		if (data.flags["midi-qol"]?.autoTarget)
			delete data.flags["midi-qol"].autoTarget;
		return data;
	}
	Hooks.once('tidy5e-sheet.ready', (api) => {
		if ((game.user?.role ?? CONST.USER_ROLES.PLAYER) < (configSettings.midiPropertiesTabRole ?? CONST.USER_ROLES.PLAYER))
			return;
		const myTab = new api.models.HandlebarsTab({
			title: 'Midi Qol',
			tabId: "midi-qol-properties-tab",
			path: '/modules/midi-qol/templates/midiPropertiesForm.hbs',
			enabled: (data) => { return ["spell", "feat", "weapon", "consumable", "equipment", "power", "maneuver", "tool"].includes(data.item.type); },
			getData: (data) => {
				data = getItemSheetData(data, data.item);
				data.showHeader = false;
				return data;
			},
			onRender: (params) => {
				activateMacroListeners(params.app, params.tabContentsElement);
			}
		});
		Hooks.on('tidy5e-sheet.getActivitiesForPlay', (parent, data) => {
			if (data.activities && data.activities instanceof Array) {
				data.activities = data.activities.filter(activity => !activity?.midiProperties?.automationOnly);
			}
		});
		api.registerItemTab(myTab);
		/*
			api.config.itemSummary.registerCommands([
			{
				label: i18n("midi-qol.buttons.roll"),
				enabled: (params) => ["weapon", "spell", "power", "feat", "tool", "consumable"].includes(params.item.type),
				iconClass: 'fas fa-dice-d20',
				execute: (params) => {
				if (debugEnabled > 1) log('roll', params.item);
				Workflow.removeWorkflow(params.item.uuid);
				params.item.use({}, { event: params.event, configureDialog: true, systemCard: true });
				},
			},
			{
				label: i18n("midi-qol.buttons.attack"),
				enabled: (params) => params.item.hasAttack,
				execute: (params) => {
				if (debugEnabled > 1) log('attack', params);
				params.item.rollAttack({ event: params.event, versatile: false, resetAdvantage: true, systemCard: true })
				},
			},
			{
				label: i18n("midi-qol.buttons.damage"),
				enabled: (params) => params.item.system.activities?.find(a => a.damage?.parts?.length),
				execute: (params) => {
				if (debugEnabled > 1) log('Clicked damage', params);
				params.item.rollDamage({ event: params.event, versatile: false, systemCard: true })
				},
			},
			{
				label: i18n("midi-qol.buttons.versatileDamage"),
				enabled: (params) => itemIsVersatile(params.item),
				execute: (params) => {
				if (debugEnabled > 1) log('Clicked versatile', params);
				params.item.rollDamage({ event: params.event, versatile: true, systemCard: true })
				}
			},
			{
				label: i18n("midi-qol.buttons.itemUse"),
				enabled: (params) => params.item.type === "consumable",
				execute: (params) => {
				if (debugEnabled > 1) log('Clicked consume', params);
				params.item.use({ event: params.event, systemCard: true }, {})
				},
			},
			{
				label: i18n("midi-qol.buttons.itemUse"),
				enabled: (params) => params.item.type === "tool",
				execute: (params) => {
				if (debugEnabled > 1) log('Clicked tool check', params);
				params.item.rollToolCheck({ event: params.event, systemCard: true })
				},
			},
			{
				label: i18n("midi-qol.buttons.info"),
				enabled: (params) => true,
				execute: (params) => {
				if (debugEnabled > 1) log('Clicked info', params);
				showItemInfo.bind(params.item)()
				},
			},
			]);
			*/
		/*
		api.registerItemContent(
		new api.models.HtmlContent({
			html: (data) => {
			const tooltip = `${SystemString}.TargetUnits`
			return `
			<select name="system.target.units" data-tooltip="${i18n(tooltip)}">
			<option value="" ${data.item.system.target.units === '' ? "selected" : ''}></option>
			<option value="ft" ${data.item.system.target.units === 'ft' ? "selected" : ''}>Feet</option>
			<option value="mi " ${data.item.system.target.units === 'mi' ? "selected" : ''}>Miles</option>
			<option value="m" ${data.item.system.target.units === 'm' ? "selected" : ''}>Meters</option>
			<option value="km" ${data.item.system.target.units === 'km' ? "selected" : ''}>Kilometers</option>
			</select>
			`;
			},
			injectParams: {
			selector: `[data-tidy-field="system.target.type"]`,
			position: "beforebegin",
			},
			enabled: (data) =>
			["creature", "ally", "enemy"].includes(data.item.system.target?.type) &&
			!data.item.hasAreaTarget,
		})
		);
		*/
		api.config.actorTraits.registerActorTrait({
			title: i18n("midi-qol.ActorOnUseMacros"),
			iconClass: "fas fa-cog",
			enabled: () => configSettings.allowActorUseMacro,
			openConfiguration: (params) => {
				new ActorOnUseMacrosConfig(params.app.object, {}).render(true);
			},
			openConfigurationTooltip: i18n("midi-qol.ActorOnUseMacros"),
		});
	});
	Hooks.on("renderItemSheet", (app, html, data) => {
		const item = app.object;
		if (!item)
			return;
		if ((configSettings.midiPropertiesTabRole ?? CONST.USER_ROLES.PLAYER) > (game.user?.role ?? CONST.USER_ROLES.NONE))
			return;
		if (app.constructor.name !== "Tidy5eKgarItemSheet") {
			if (!item || !["spell", "feat", "weapon", "consumable", "equipment", "power", "maneuver", "tool"].includes(data.item.type))
				return;
			if (configSettings.midiFieldsTab) {
				let tabs = html.find(`nav.sheet-navigation.tabs`);
				if (tabs.find("a[data-tab=midiqol]").length > 0) {
					const message = "render item sheet: Midi Tab already present";
					TroubleShooter.recordError(new Error(message), message);
					error(message);
					return;
				}
				tabs.append($('<a class="item" data-tab="midiqol">Midi-qol</a>'));
				data = foundry.utils.mergeObject(data, getItemSheetData(data, item), { recursive: false });
				renderTemplate("modules/midi-qol/templates/midiPropertiesForm.hbs", data).then(templateHtml => {
					// tabs = html.find(`form nav.sheet-navigation.tabs`);
					$(html.find(`.sheet-body`)).append($(`<div class="tab midi-qol" data-group="primary" data-tab="midiqol">${templateHtml}</div>`));
					if (app.isEditable) {
						$(html.find(".midi-qol-tab")).find(":input").change(evt => {
							app.selectMidiTab = true;
						});
						$(html.find(".midi-qol-tab")).find("textarea").change(evt => {
							app.selectMidiTab = true;
						});
						activateMacroListeners(app, html);
					}
					else {
						$(html.find(".midi-qol-tab")).find(":input").prop("disabled", true);
						$(html.find(".midi-qol-tab")).find("textarea").prop("readonly", true);
					}
					if (app.selectMidiTab) {
						app._tabs[0].activate("midiqol");
						app.selectMidiTab = false;
					}
				});
			}
			else {
				data = foundry.utils.mergeObject(data, getItemSheetData(data, item));
				renderTemplate("modules/midi-qol/templates/midiPropertiesForm.hbs", data).then(templateHtml => {
					const element = html.find('input[name="system.chatFlavor"]').parent().parent();
					element.append(templateHtml);
					if (app.isEditable)
						activateMacroListeners(app, html);
					else {
						element.find(".midi-qol-tab").find(":input").prop("disabled", true);
						element.find(".midi-qol-tab").find("textarea").prop("readonly", true);
					}
				});
			}
			//@ts-expect-error
			if (false && foundry.utils.isNewerVersion(game.system.version, "2.2") && game.system.id === "dnd5e") {
				if (["creature", "ally", "enemy"].includes(item.system.target?.type) && !item.hasAreaTarget) { // stop gap for dnd5e2.2 hiding this field sometimes
					const targetElement = html.find('select[name="system.target.type"]');
					const targetUnitHTML = `
			<select name="system.target.units" data-tooltip="${i18n(GameSystemConfig.TargetUnits)}">
			<option value="" ${item.system.target.units === '' ? "selected" : ''}></option>
			<option value="ft" ${item.system.target.units === 'ft' ? "selected" : ''}>Feet</option>
			<option value="mi " ${item.system.target.units === 'mi' ? "selected" : ''}>Miles</option>
			<option value="m" ${item.system.target.units === 'm' ? "selected" : ''}>Meters</option>
			<option value="km" ${item.system.target.units === 'km' ? "selected" : ''}>Kilometers</option>
			</select>
			`;
					targetElement.before(targetUnitHTML);
				}
			}
		}
		// activateMacroListeners(app, html);
	});
	Hooks.on('dropCanvasData', function (canvas, dropData) {
		if (!dragDropTargeting)
			return true;
		if (dropData.type !== "Item")
			return true;
		if (!canvas?.grid?.grid)
			return;
		//@ts-ignore .grid v10
		let grid_size = canvas.scene?.grid.size;
		// This will work for all grids except gridless
		let coords;
		//@ts-expect-error
		if (game.release.generation < 12) {
			coords = canvas.grid.grid.getPixelsFromGridPosition(...canvas.grid.grid.getGridPositionFromPixels(dropData.x, dropData.y));
		}
		else {
			//@ts-expect-error
			coords = canvas.grid.getPixelsFromGridPosition(...canvas.grid.getGridPositionFromPixels(dropData.x, dropData.y));
		}
		// Assume a square grid for gridless
		//@ts-expect-error .grid v10
		if (canvas.scene?.grid.type === CONST.GRID_TYPES.GRIDLESS) {
			// targetObjects expects the cords to be top left corner of the token, so we need to adjust for that
			coords = [dropData.x - grid_size / 2, dropData.y - grid_size / 2];
		}
		const targetCount = canvas.tokens?.targetObjects({
			x: coords[0],
			y: coords[1],
			height: grid_size,
			width: grid_size
		}, { releaseOthers: true });
		if (targetCount === 0) {
			ui.notifications?.warn("No target selected");
			return true;
		}
		const item = MQfromUuidSync(dropData.uuid);
		if (!item) {
			const message = `actor / item broke for ${dropData?.uuid}`;
			error(message);
			TroubleShooter.recordError(new Error(message), message);
		}
		item?.use({ legacy: false }, {}, {});
		return true;
	});
	//@ts-expect-error
	if (foundry.utils.isNewerVersion(game.modules.get("babonus")?.version ?? "0", "12.0.5"))
		Hooks.once("babonus.initializeRollHooks", registerBaBonusHooks);
}
function setupMidiFlagTypes() {
	//@ts-expect-error
	const systemVersion = game.system.version;
	let config = GameSystemConfig;
	let attackTypes = allAttackTypes.concat(["heal", "other", "save", "util"]);
	attackTypes.forEach(at => {
		midiFlagTypes[`flags.midi-qol.DR.${at}`] = "number";
		//  midiFlagTypes[`flags.midi-qol.optional.NAME.attack.${at}`] = "string"
		//  midiFlagTypes[`flags.midi-qol.optional.NAME.damage.${at}`] = "string"
	});
	midiFlagTypes["flags.midi-qol.onUseMacroName"] = "string";
	Object.keys(config.abilities).forEach(abl => {
		// midiFlagTypes[`flags.midi-qol.optional.NAME.save.${abl}`] = "string";
		// midiFlagTypes[`flags.midi-qol.optional.NAME.check.${abl}`] = "string";
	});
	Object.keys(config.skills).forEach(skill => {
		// midiFlagTypes[`flags.midi-qol.optional.NAME.skill.${skill}`] = "string";
	});
	if (game.system.id === "dnd5e") {
		midiFlagTypes[`flags.midi-qol.DR.all`] = "string";
		midiFlagTypes[`flags.midi-qol.DR.non-magical`] = "string";
		midiFlagTypes[`flags.midi-qol.DR.non-silver`] = "string";
		midiFlagTypes[`flags.midi-qol.DR.non-adamant`] = "string";
		midiFlagTypes[`flags.midi-qol.DR.non-physical`] = "string";
		midiFlagTypes[`flags.midi-qol.DR.final`] = "number";
		Object.keys(config.damageTypes).forEach(dt => {
			midiFlagTypes[`flags.midi-qol.DR.${dt}`] = "string";
		});
	}
	// midiFlagTypes[`flags.midi-qol.optional.NAME.attack.all`] = "string";
	// midiFlagTypes[`flags.midi-qol.optional.NAME.damage.all`] = "string";
	// midiFlagTypes[`flags.midi-qol.optional.NAME.check.all`] = "string";
	// midiFlagTypes[`flags.midi-qol.optional.NAME.save.all`] = "string";
	// midiFlagTypes[`flags.midi-qol.optional.NAME.label`] = "string";
	// midiFlagTypes[`flags.midi-qol.optional.NAME.skill.all`] = "string";
	// midiFlagTypes[`flags.midi-qol.optional.NAME.count`] = "string";
	// midiFlagTypes[`flags.midi-qol.optional.NAME.ac`] = "string";
	// midiFlagTypes[`flags.midi-qol.optional.NAME.criticalDamage`] = "string";
	// midiFlagTypes[`flags.midi-qol.OverTime`] = "string";
}
export function setupHooks() {
}
export const itemJSONData = {
	"name": "Concentration Check - Midi QOL",
	"type": "weapon",
	"img": "./modules/midi-qol/icons/concentrate.png",
	"system": {
		"description": {
			"value": "",
			"chat": "",
			"unidentified": ""
		},
		"activation": {
			"type": "special",
			"cost": 0,
			"condition": ""
		},
		"target": {
			"type": ""
		},
		"ability": "",
		"actionType": "save",
		"attackBonus": 0,
		"chatFlavor": "",
		"weaponType": "simpleM",
		"proficient": false,
		"attributes": {
			"spelldc": 10
		}
	},
	"effects": [],
	"sort": 0,
	"flags": {
		"midi-qol": {
			"onUseMacroName": "ItemMacro",
			"isConcentrationCheck": true
		},
		"itemacro": {
			"macro": {
				"_id": null,
				"name": "Concentration Check - Midi QOL",
				"type": "script",
				"author": "devnIbfBHb74U9Zv",
				"img": "icons/svg/dice-target.svg",
				"scope": "global",
				"command": `
			if (MidiQOL.configSettings().autoCheckSaves === 'none') return;
			for (let targetUuid of args[0].targetUuids) {
				let target = await fromUuid(targetUuid);
				if (MidiQOL.configSettings().removeConcentration 
				&& (target.actor.system.attributes.hp.value === 0 || args[0].failedSaveUuids.find(uuid => uuid === targetUuid))) {
				await target.actor.endConcentration();
				}
			}`,
				"folder": null,
				"sort": 0,
				"permission": {
					"default": 0
				},
				"flags": {}
			}
		},
	}
};
Hooks.on("dnd5e.preRollDamageV2", (rollConfig, dialogConfig, messageConfig) => {
	if (rollConfig.subject.actor && rollConfig.subject.isSpell) {
		const actorSpellBonus = foundry.utils.getProperty(rollConfig.subject.actor, "system.bonuses.spell.all.damage");
		if (actorSpellBonus)
			rollConfig.rolls[0].parts.push(actorSpellBonus);
	}
	// return preRollDamageHook(item, rollConfig)
	return true;
});
Hooks.on("dnd5e.preCalculateDamage", (actor, damages, options) => {
	if (!configSettings.v3DamageApplication)
		return true;
	try {
		const ignore = (category, type, skipDowngrade) => {
			return options.ignore === true
				|| options.ignore?.[category] === true
				|| options.ignore?.[category]?.has?.(type);
		};
		const mo = options.midi;
		if (mo?.noCalc)
			return true;
		if (mo) {
			if (configSettings.saveDROrder === "DRSavedr" && options?.ignore !== true) {
				// Currently now way to disable just super saver and leave saver
			}
			else if (configSettings.saveDROrder === "SaveDRdr" && options.ignore !== true) {
				for (let damage of damages) {
					if (mo.superSaver && (options?.ignore?.superSaver === true || options?.ignore?.superSaver?.has(damage.type)))
						continue;
					if (mo.semiSuperSaver && (options?.ignore?.semiSuperSaver === true || options?.ignore?.semiSuperSaver?.has(damage.type)))
						continue;
					if (mo.saved && (options?.ignore?.saved === true || options?.ignore?.saved?.has(damage.type)))
						continue;
					if (mo.superSaver) {
						foundry.utils.setProperty(damage, "active.superSaver", true);
					}
					else if (mo.semiSuperSaver && (mo.saveMultiplier ?? 1) !== 1) {
						foundry.utils.setProperty(damage, "active.semiSuperSaver", true);
					}
					else if (mo.saved && (mo.saveMultiplier ?? 1) !== 1) {
						foundry.utils.setProperty(damage, "active.saved", true);
					}
					damage.value = damage.value * (mo.saveMultiplier ?? 1);
					foundry.utils.setProperty(damage, "active.multiplier", (damage.active?.multiplier ?? 1) * (mo.saveMultiplier ?? 1));
				}
			}
			const categories = { "idi": "immunity", "idr": "resistance", "idv": "vulnerability", "ida": "absorption" };
			if (mo?.sourceActorUuid) {
				//@ts-expect-error
				const sourceActor = fromUuidSync(mo.sourceActorUuid);
				for (let key of ["idi", "idr", "idv", "ida"]) {
					if (foundry.utils.getProperty(sourceActor, `system.traits.${key}`) && sourceActor.system.traits[key].value.size > 0) {
						const trait = foundry.utils.getProperty(sourceActor, `system.traits.${key}`);
						if (!options.ignore?.[categories[key]])
							foundry.utils.setProperty(options, `ignore.${categories[key]}`, new Set());
						for (let dt of Object.keys(GameSystemConfig.damageTypes)) {
							if (trait.value.has(dt) || trait.all)
								options.ignore[categories[key]].add(dt);
						}
					}
				}
			}
			// For damage absorption ignore other immunity/resistance/vulnerability
			if (actor.system.traits?.da && false) { // not doing this makes absorbing tatoos much easier to implement
				for (let damage of damages) {
					if (ignore("absorption", damage.type, false))
						continue;
					if (actor.system.traits?.da?.value?.has(damage.type) || actor.system.traits?.da?.all) {
						if (!options?.ignore?.immunity)
							foundry.utils.setProperty(options, "ignore.immunity", new Set());
						if (!options?.ignore?.resistance)
							foundry.utils.setProperty(options, "ignore.resistance", new Set());
						if (!options?.ignore?.vulnerability)
							foundry.utils.setProperty(options, "ignore.vulnerability", new Set());
						if (actor.system.traits?.di.value.has(damage.type))
							options.ignore.immunity.add(damage.type);
						if (actor.system.traits?.dr.value.has(damage.type))
							options.ignore.resistance.add(damage.type);
						if (actor.system.traits?.dv.value.has(damage.type))
							options.ignore.vulnerability.add(damage.type);
					}
				}
			}
			if ((mo?.uncannyDodge)) {
				for (let damage of damages) {
					if (ignore("uncannyDodge", damage.type, true))
						continue;
					foundry.utils.setProperty(damage, "active.uncannyDodge", true);
					foundry.utils.setProperty(damage, "multiplier", (damage.multiplier ?? 1) * 0.5);
					damage.value = damage.value * 0.5;
					;
				}
			}
		}
		const totalDamage = damages.reduce((a, b) => {
			let value = b.value;
			if (options.invertHealing !== false && b.type === "healing")
				value = b.value * -1;
			if (["temphp", "midi-none"].includes(b.type))
				value = 0;
			return a + value;
		}, 0);
		foundry.utils.setProperty(options, "midi.totalDamage", totalDamage);
		if (Hooks.call("midi-qol.dnd5ePreCalculateDamage", actor, damages, options) === false)
			return false;
	}
	catch (err) {
		const message = `Error in preCalculateDamage`;
		error(message, err);
		TroubleShooter.recordError(err, message);
	}
	finally {
		return true;
	}
});
Hooks.on("dnd5e.calculateDamage", (actor, damages, options) => {
	try {
		if (!configSettings.v3DamageApplication)
			return true;
		const downgrade = type => options.downgrade === true || options.downgrade?.has?.(type);
		const ignore = (category, type, skipDowngrade) => {
			return options.ignore === true
				|| options.ignore?.[category] === true
				|| options.ignore?.[category]?.has?.(type)
				|| ((category === "immunity") && downgrade(type) && !skipDowngrade)
				|| ((category === "resistance") && downgrade(type));
		};
		const mo = options.midi;
		if (mo?.noCalc)
			return true;
		for (let damage of damages) {
			// not sure how to do this. if (damage.active.immunity) damage.multiplier = configSettings.damageImmunityMultiplier;
			if (damage.active.resistance) {
				damage.value = damage.value * 2 * configSettings.damageResistanceMultiplier;
				damage.active.multiplier = damage.active.multiplier * 2 * configSettings.damageResistanceMultiplier;
			}
			if (damage.active.vulnerability) {
				damage.active.multiplier = damage.active.multiplier / 2 * configSettings.damageVulnerabilityMultiplier;
				damage.value = damage.value / 2 * configSettings.damageVulnerabilityMultiplier;
			}
			if (actor.system.traits.da?.[damage.type] !== undefined && !ignore("absorption", damage.type, false)) {
				const multiplier = Number(actor.system.traits.da?.[damage.type]) ?? -1;
				damage.active.multiplier *= multiplier;
				damage.value *= multiplier;
				damage.active.absorption = true;
			}
		}
		let customs = [];
		const categories = { "di": "immunity", "dr": "resistance", "dv": "vulnerability", "da": "absorption" };
		const traitMultipliers = { "dr": configSettings.damageResistanceMultiplier, "di": configSettings.damageImmunityMultiplier, "da": -1, "dv": configSettings.damageVulnerabilityMultiplier };
		// Handle custom immunities
		for (let trait of ["da", "dv", "di", "dr"]) {
			const bypasses = actor.system.traits[trait].bypasses;
			customs = (actor.system.traits[trait].custom ?? "").split(";").map(s => s.trim());
			customs = [...customs, ...Object.keys((actor.system.traits[trait].midi ?? {}))];
			for (let custom of customs) {
				if (custom === "")
					continue;
				let bypassesPresent;
				for (let damage of damages) {
					if (damage.active[categories[trait]])
						continue; // only one dr/di/dv allowed
					if (damage.type === "midi-none")
						continue;
					if (GameSystemConfig.healingTypes[damage.type])
						continue;
					if (ignore(categories[trait], damage.type, false))
						continue;
					if (ignore(custom, damage.type, false) || damage.active[custom])
						continue;
					if (!GameSystemConfig.customDamageResistanceTypes[custom])
						custom = Object.keys(GameSystemConfig.customDamageResistanceTypes).find(key => GameSystemConfig.customDamageResistanceTypes[key].toLocaleLowerCase() === custom.toLocaleLowerCase()) ?? custom;
					switch (custom) {
						case "spell":
							if (!damage.properties.has("spell"))
								continue;
							break;
						case "nonSpell":
						case "non-spell":
							if (damage.properties.has("spell"))
								continue;
							break;
						case "magical":
							if (!damage.properties.has("mgc"))
								continue;
							break;
						case "nonMagical":
						case "non-magical":
							if (damage.properties.has("mgc"))
								continue;
							break;
						case "physical":
							bypassesPresent = damage.properties.intersection(bypasses);
							if (!GameSystemConfig.damageTypes[damage.type]?.isPhysical || bypassesPresent.size > 0)
								continue;
							break;
						case "nonPhysical":
						case "non-physical":
							if (GameSystemConfig.damageTypes[damage.type]?.isPhysical)
								continue;
							break;
						case "nonMagicalPhysical":
						case "non-magical-physical":
							if (!GameSystemConfig.damageTypes[damage.type]?.isPhysical || damage.properties.has("mgc"))
								continue;
							break;
						case "nonSilverPhysical":
						case "non-silver-physical":
							if (!GameSystemConfig.damageTypes[damage.type]?.isPhysical || damage.properties.has("sil"))
								continue;
							break;
						case "nonAdamantPhysical":
						case "non-adamant-physical":
							if (!GameSystemConfig.damageTypes[damage.type]?.isPhysical || damage.properties.has("ada"))
								continue;
							break;
						case "mwak":
						case "rwak":
							bypassesPresent = damage.properties.intersection(bypasses);
							if (!damage.properties.has(custom) || bypassesPresent.size > 0)
								continue;
							break;
						case "all":
							if (damage.type === "midi-none")
								continue;
							break;
						default:
							if (!damage.properties.has(custom))
								continue;
							break;
					}
					damage.active[GameSystemConfig.customDamageResistanceTypes[custom] ?? custom] = true;
					damage.active[categories[trait]] = true;
					let multiplier = traitMultipliers[trait];
					const da = actor.system.traits?.da?.midi?.[custom] || actor.system.traits?.da?.midi?.all;
					if (da && Number.isNumeric(da)) {
						multiplier = Number(da);
					}
					damage.active.multiplier = (damage.active.multiplier ?? 1) * multiplier;
					damage.value = damage.value * multiplier;
				}
			}
		}
		if (configSettings.saveDROrder === "DRSavedr" && options?.ignore !== true) {
			// Currently now way to disable just super saver and leave saver
			for (let damage of damages) {
				if (mo.superSaver && (options?.ignore?.superSaver === true || options?.ignore?.superSaver?.has(damage.type)))
					continue;
				if (mo.semiSuperSaver && (options?.ignore?.semiSuperSaver === true || options?.ignore?.semiSuperSaver?.has(damage.type)))
					continue;
				if (mo.saved && (options?.ignore?.saved === true || options?.ignore?.saved?.has(damage.type)))
					continue;
				damage.value = damage.value * (mo.saveMultiplier ?? 1);
				foundry.utils.setProperty(damage, "active.multiplier", (damage.active?.multiplier ?? 1) * (mo.saveMultiplier ?? 1));
				if (mo.superSaver) {
					foundry.utils.setProperty(damage, "active.superSaver", true);
				}
				else if (mo.semiSuperSaver && (mo.saveMultiplier ?? 1) !== 1) {
					foundry.utils.setProperty(damage, "active.semiSuperSaver", true);
				}
				else if (mo.saved && (mo.saveMultiplier ?? 1) !== 1) {
					foundry.utils.setProperty(damage, "active.saved", true);
				}
			}
			;
		}
		function selectDamages(damages, selectDamage) {
			return damages.reduce((total, damage) => {
				// if (!GameSystemConfig.damageTypes[damage.type]) return total;
				if (["none", "midi-none"].includes(damage.type))
					return total;
				return total + (selectDamage(damage) ? damage.value : 0);
			}, 0);
		}
		let drAllActives = [];
		// Insert DR.ALL as a -ve damage value maxed at the total damage.
		let dmAll;
		if (options.ignore !== true && !options.ignore?.DR?.has("none") && !options.ignore?.DR?.has("all")) {
			// think about how to do custom dm.const specials = [...(actor.system.traits.dm.custom ?? []).split(";"), ...Object.keys(actor.system.traits.dm?.midi ?? {})];
			const specials = Object.keys(actor.system.traits?.dm?.midi ?? {});
			for (let special of specials) {
				let dm;
				let dmRoll;
				let selectedDamage;
				let oldDamage;
				let dmActive;
				dmRoll = new Roll(`${actor.system.traits?.dm.midi?.[special]}`, actor.getRollData());
				dm = doSyncRoll(dmRoll, `traits.dm.midi.${special}`)?.total ?? 0;
				const bypasses = actor.system.traits["dm"].bypasses ?? new Set();
				switch (special) {
					case "all":
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type]);
						if (selectedDamage > 0)
							dmActive = i18n("All");
						break;
					case "mwak":
					case "rwak":
						if (options.ignore?.modification?.has(special))
							continue;
						selectedDamage = selectDamages(damages, (damage) => {
							const bypassesPresent = damage.properties.intersection(bypasses);
							return !GameSystemConfig.healingTypes[damage.type]
								&& damage.properties.has(special)
								&& bypassesPresent.size === 0;
						});
						if (selectedDamage > 0)
							dmActive = i18n(special);
						break;
					case "msak":
					case "rsak":
						if (options.ignore?.modification?.has(special))
							continue;
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type] && damage.properties.has(special));
						if (selectedDamage > 0)
							dmActive = i18n(special);
						break;
					case "magical":
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type] && damage.properties.has("mgc"));
						if (selectedDamage > 0)
							dmActive = i18n("midi-qol.Magical");
						break;
					case "non-magical":
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type] && !damage.properties.has("mgc"));
						if (selectedDamage > 0)
							dmActive = i18n("midi-qol.NonMagical");
						break;
					case "non-magical-physical":
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type] && GameSystemConfig.damageTypes[damage.type]?.isPhysical && !damage.properties.has("mgc"));
						if (selectedDamage > 0)
							dmActive = i18n("midi-qol.NonMagicalPhysical");
						break;
					case "non-silver-physical":
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type] && GameSystemConfig.damageTypes[damage.type]?.isPhysical && !damage.properties.has("sil"));
						if (selectedDamage > 0)
							dmActive = i18n("midi-qol.NonSilverPhysical");
						break;
					case "non-adamant-physical":
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type] && GameSystemConfig.damageTypes[damage.type]?.isPhysical && !damage.properties.has("ada"));
						if (selectedDamage > 0)
							dmActive = i18n("midi-qol.NonAdamantinePhysical");
						break;
					case "non-physical":
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type] && !GameSystemConfig.damageTypes[damage.type]?.isPhysical);
						if (selectedDamage > 0)
							dmActive = i18n("midi-qol.NonPhysical");
						break;
					case "physical":
						selectedDamage = selectDamages(damages, (damage) => {
							const bypassesPresent = damage.properties.intersection(bypasses);
							return !GameSystemConfig.healingTypes[damage.type]
								&& GameSystemConfig.damageTypes[damage.type]?.isPhysical
								&& bypassesPresent.size === 0;
						});
						if (selectedDamage > 0)
							dmActive = i18n("midi-qol.Physical");
						break;
					case "spell":
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type] && damage.properties.has("spell"));
						if (selectedDamage > 0)
							dmActive = i18n("midi-qol.SpellDamage");
						break;
					case "non-spell":
						selectedDamage = selectDamages(damages, (damage) => !GameSystemConfig.healingTypes[damage.type] && !damage.properties.has("spell"));
						if (selectedDamage > 0)
							dmActive = i18n("midi-qol.NonSpellDamage");
						break;
					default:
						dm = 0;
						selectedDamage = 0;
						break;
				}
				if (dm) {
					if (Math.sign(selectedDamage + dm) !== Math.sign(selectedDamage)) {
						dm = -selectedDamage;
					}
					if (checkRule("maxDRValue") && (dm < dmAll || dmAll === undefined)) {
						dmAll = dm;
						drAllActives = [dmActive];
					}
					else if (!checkRule("maxDRValue")) {
						drAllActives.push(dmActive);
						dmAll = (dmAll ?? 0) + dm;
					}
				}
			}
			let { totalDamage, temp } = damages.reduce((acc, d) => {
				if (d.type === "temphp")
					acc.temp += d.value;
				else if (d.type !== "midi-none")
					acc.totalDamage += d.value;
				return acc;
			}, { totalDamage: 0, temp: 0 });
			// const totalDamage = damages.reduce((a, b) => a + b.value, 0);
			if (!dmAll)
				dmAll = 0;
			if (totalDamage > 0 && totalDamage < actor.system.attributes.hp.dt) {
				// total damage is less than the damage threshold so no damage
				dmAll = -totalDamage;
			}
			else if (Math.sign(totalDamage) !== Math.sign(dmAll + totalDamage)) {
				dmAll = -totalDamage;
			}
			if (dmAll) {
				damages.push({ type: "none", value: dmAll, active: { DR: true, multiplier: 1 }, allActives: drAllActives, properties: new Set() });
			}
			Hooks.callAll("midi-qol.dnd5eCalculateDamage", actor, damages, options);
			while (damages.find((di, idx) => {
				if (di.type === "midi-none") {
					damages.splice(idx, 1);
					return true;
				}
				return false;
			}))
				;
		}
	}
	catch (err) {
		console.error(err);
	}
	return true;
});
function recalculateDamage(actor, amount, updates, options) {
	const hpMax = Math.floor(actor?.system?.attributes?.hp?.max ?? 0);
	const hpTemp = updates["system.attributes.hp.temp"] ?? 0;
	const startHP = actor?.system?.attributes?.hp?.value ?? 0;
	const updatedHP = updates["system.attributes.hp.value"] ?? startHP;
	// How much damage was applied to the actor's hp - after temp hp was applied
	const hpDamage = Math.max(0, startHP - (updates["system.attributes.hp.value"] ?? startHP));
	// how much temp damage appled to the new hpTemp value
	const newAppliedTemp = Math.min(hpTemp, hpDamage, hpMax - updatedHP);
	const newHpTemp = hpTemp - newAppliedTemp;
	const newHpValue = Math.max(0, updatedHP + newAppliedTemp);
	updates['system.attributes.hp.temp'] = newHpTemp;
	updates['system.attributes.hp.value'] = newHpValue;
}
Hooks.on("dnd5e.preApplyDamage", (actor, amount, updates, options) => {
	if (!configSettings.v3DamageApplication)
		return true;
	if (updates["system.attributes.hp.temp"])
		updates["system.attributes.hp.temp"] = Math.floor(updates["system.attributes.hp.temp"]);
	// recalculateDamage(actor, amount, updates, options);
	const vitalityResource = checkRule("vitalityResource");
	if (foundry.utils.getProperty(updates, "system.attributes.hp.value") === 0 && typeof vitalityResource === "string" && foundry.utils.getProperty(actor, vitalityResource) !== undefined) {
		// actor is reduced to zero so update vitaility resource
		const hp = actor.system.attributes.hp;
		const vitalityDamage = amount - (hp.temp + hp.value);
		updates[vitalityResource] = Math.max(0, foundry.utils.getProperty(actor, vitalityResource) - vitalityDamage);
	}
	if (options.midi) {
		foundry.utils.setProperty(options, "midi.amount", amount);
		foundry.utils.setProperty(options, "midi.updates", updates);
	}
	return true;
});
Hooks.on("dnd5e.preRollConcentrationV2", (rollConfig, dialogConfig, messageConfig) => {
	var _a, _b;
	const actor = rollConfig.subject;
	// insert advantage and disadvantage
	// insert midi bonuses.
	if (rollConfig.workflowOptions?.noConcentrationCheck)
		return false;
	const concAdvFlag = foundry.utils.getProperty(actor, `flags.${MODULE_ID}.advantage.concentration`);
	const concDisadvFlag = foundry.utils.getProperty(actor, `flags.${MODULE_ID}.disadvantage.concentration`);
	let concAdv;
	let concDisadv;
	if (concAdvFlag || concDisadvFlag) {
		const conditionData = createConditionData({ workflow: undefined, target: undefined, actor });
		if (concAdvFlag && evalAllConditions(actor, `flags.${MODULE_ID}.advantage.concentration`, conditionData)) {
			concAdv = true;
		}
		if (concDisadvFlag && evalAllConditions(actor, `flags.${MODULE_ID}.disadvantage.concentration`, conditionData)) {
			concDisadv = true;
		}
	}
	if (rollConfig.rolls) {
		for (let roll of rollConfig.rolls) {
			(_a = roll.options).advantage || (_a.advantage = concAdv);
			(_b = roll.options).disadvantage || (_b.disadvantage = concDisadv);
		}
	}
	return true;
});
Hooks.on("dnd5e.rollConcentrationV2", (rolls, { subject }) => {
	if (!subject || !(subject instanceof CONFIG.Actor.documentClass)) {
		const message = "dnd5e.rollConcentrationV2 hook called with non-actor";
		TroubleShooter.recordError(new Error(message), message);
		error(message, subject);
		return;
	}
	if (rolls instanceof Roll)
		rolls = [rolls];
	// Not sure what multiple concentration rolls mean
	// Assume concentration fails if any of the concentration rolls fail.
	for (let roll of rolls) {
		if (checkRule("criticalSaves") && roll.isCritical)
			roll.options.success = true;
		// triggerTargetMacros(triggerList: string[], targets: Set<any> = this.targets, options: any = {}) {
		if (configSettings.removeConcentration && roll.options.success === false) {
			//@ts-expect-error
			subject.endConcentration();
			return;
		}
	}
});
