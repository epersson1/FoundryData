import { MODULE_ID, debugEnabled, warn } from "../../midi-qol.js";
import { Workflow } from "../Workflow.js";
import { TargetConfirmationDialog } from "../apps/TargetConfirmation.js";
import { configSettings, targetConfirmation } from "../settings.js";
import { installedModules } from "../setupModules.js";
import { getFlankingEffect, CERemoveEffect, sumRolls, computeTemplateShapeDistance, getToken, MQfromUuidSync, checkActivityRange, checkDefeated, checkIncapacitated, computeCoverBonus, getSpeaker, hasWallBlockingCondition, isTargetable, tokenForActor, getActivityAutoTargetAction, getAoETargetType, doReactions, getUnitDist } from "../utils.js";
export async function confirmWorkflow(existingWorkflow) {
	const validStates = [existingWorkflow.WorkflowState_Completed, existingWorkflow.WorkflowState_Start, existingWorkflow.WorkflowState_RollFinished];
	if (existingWorkflow.currentAction === existingWorkflow.WorkflowState_NoAction)
		return true;
	if (!(validStates.includes(existingWorkflow.currentAction))) { // && configSettings.confirmAttackDamage !== "none") {
		if (configSettings.autoCompleteWorkflow) {
			existingWorkflow.aborted = true;
			await existingWorkflow.performState(existingWorkflow.WorkflowState_Cleanup);
			await Workflow.removeWorkflow(existingWorkflow.uuid);
		}
		else if (existingWorkflow.currentAction === existingWorkflow.WorkflowState_WaitForDamageRoll && existingWorkflow.hitTargets.size === 0) {
			existingWorkflow.aborted = true;
			await existingWorkflow.performState(existingWorkflow.WorkflowState_Cleanup);
		}
		else {
			//@ts-expect-error
			switch (await Dialog.wait({
				title: game.i18n.format("midi-qol.WaitingForexistingWorkflow", { name: existingWorkflow.activity.name }),
				default: "cancel",
				content: "Choose what to do with the previous roll",
				rejectClose: false,
				close: () => { return false; },
				buttons: {
					complete: { icon: `<i class="fas fa-check"></i>`, label: "Complete previous", callback: () => { return "complete"; } },
					discard: { icon: `<i class="fas fa-trash"></i>`, label: "Discard previous", callback: () => { return "discard"; } },
					undo: { icon: `<i class="fas fa-undo"></i>`, label: "Undo until previous", callback: () => { return "undo"; } },
					cancel: { icon: `<i class="fas fa-times"></i>`, label: "Cancel New", callback: () => { return "cancel"; } },
				}
			}, { width: 700 })) {
				case "complete":
					await existingWorkflow.performState(existingWorkflow.WorkflowState_Cleanup);
					await Workflow.removeWorkflow(existingWorkflow.uuid);
					break;
				case "discard":
					await existingWorkflow.performState(existingWorkflow.WorkflowState_Abort);
					Workflow.removeWorkflow(existingWorkflow.uuid);
					break;
				case "undo":
					await existingWorkflow.performState(existingWorkflow.WorkflowState_Cancel);
					Workflow.removeWorkflow(existingWorkflow.id);
					break;
				case "cancel":
				default:
					return false;
			}
		}
	}
	return true;
}
export async function removeFlanking(actor) {
	let CEFlanking = getFlankingEffect();
	if (CEFlanking && CEFlanking.name)
		await CERemoveEffect({ effectName: CEFlanking.name, uuid: actor.uuid });
}
export function setDamageRollMinTerms(rolls) {
	//@ts-expect-error
	const Die = foundry.dice.terms.Die;
	if (rolls && sumRolls(rolls)) {
		for (let roll of rolls) {
			for (let term of roll.terms) {
				// I don't like the default display and it does not look good for dice so nice - fiddle the results for maximised rolls
				//@ts-expect-error
				if (term instanceof Die && term.modifiers.includes(`min${term.faces}`)) {
					//@ts-expect-error
					for (let result of term.results) {
						//@ts-expect-error
						result.result = term.faces;
					}
				}
			}
		}
	}
}
export async function doActivityReactions(activity, workflow) {
	const promises = [];
	if (!foundry.utils.getProperty(activity, `flags.${MODULE_ID}.noProvokeReaction`)) {
		for (let targetToken of workflow.targets) {
			promises.push(new Promise(async (resolve) => {
				//@ts-expect-error targetToken Type
				const result = await doReactions(targetToken, workflow.tokenUuid, null, "reactionpreattack", { item: this, workflow, workflowOptions: foundry.utils.mergeObject(workflow.workflowOptions, { sourceActorUuid: activity.actor?.uuid, sourceItemUuid: this?.uuid }, { inplace: false, overwrite: true }) });
				if (result?.name) {
					//@ts-expect-error
					targetToken.actor?._initialize();
					workflow.actor._initialize();
					// targetToken.actor?.prepareData(); // allow for any items applied to the actor - like shield spell
					workflow.needsAttackAdvantageCheck = true; // Toggle this on in case
				}
				resolve(result);
			}));
		}
	}
	return await Promise.all(promises);
}
export function preActivityConsumptionHook(activity, usageConfig, messageConfig) {
	// console.error("preActivityConsumptionHook", activity, usageConfig, messageConfig);
	return true;
}
export function activityConsumptionHook(activity, usageConfig, messageConfig, updates) {
	// console.error("activityConsumptionHook", activity, usageConfig, messageConfig, updates);
	return true;
}
function activityRequiresPostTemplateConfiramtion(activity) {
	// const isRangeTargeting = ["ft", "m"].includes(activity.range?.units) && ["creature", "ally", "enemy"].includes(activity.target?.affects.type);
	if (activity.target?.template?.type) {
		return true;
		//  } else if (isRangeTargeting) {
		//    return true;
	}
	return false;
}
function itemRequiresPostTemplateConfiramtion(activity) {
	const isRangeTargeting = ["ft", "m"].includes(activity.item.system.range?.units) && ["creature", "ally", "enemy"].includes(activity.target?.affects.type);
	if (activity.target?.template?.type) {
		return true;
	}
	else if (isRangeTargeting) {
		return true;
	}
	return false;
}
export function requiresTargetConfirmation(activity, options) {
	if (!activity.item)
		debugger;
	if (options.workflowOptions?.targetConfirmation === "none")
		return false;
	if (options.workflowOptions?.targetConfirmation === "always")
		return true;
	// check lateTargeting as well - legacy.
	// For old version of dnd5e-scriptlets
	if (options.workflowdialogOptions?.lateTargeting === "none")
		return false;
	if (options.workflowdialogOptions?.lateTargeting === "always")
		return true;
	if (activity.target?.affects.type === "self")
		return false;
	if (activity.target?.affects?.choice)
		return true;
	if (options.workflowOptions?.attackPerTarget === true)
		return false;
	if (activity.midiProperties?.confirmTargets === "always")
		return true;
	if (activity.midiProperties?.confirmTargets === "never")
		return false;
	let numTargets = game.user?.targets?.size ?? 0;
	if (numTargets === 0 && configSettings.enforceSingleWeaponTarget && activity.item.type === "weapon")
		numTargets = 1;
	const token = tokenForActor(activity.actor);
	if (targetConfirmation.enabled) {
		if (targetConfirmation.all && (activity.target?.affects.type ?? "") !== "self") {
			if (debugEnabled > 0)
				warn("target confirmation triggered from targetConfirmation.all");
			return true;
		}
		if (activity.attack && targetConfirmation.hasAttack) {
			if (debugEnabled > 0)
				warn("target confirmation triggered by targetCofirnmation.hasAttack");
			return true;
		}
		if (activity.target?.affects.type === "creature" && targetConfirmation.hasCreatureTarget) {
			if (debugEnabled > 0)
				warn("target confirmation triggered from targetConfirmation.hasCreatureTarget");
			return true;
		}
		if (targetConfirmation.noneTargeted && ((activity.target?.affects.type ?? "") !== "" || activity.attack) && numTargets === 0) {
			if (debugEnabled > 0)
				warn("target confirmation triggered from targetConfirmation.noneTargeted");
			return true;
		}
		if (targetConfirmation.allies && token && numTargets > 0 && activity.target?.affects.type !== "self") {
			//@ts-expect-error find disposition
			if (game.user?.targets.some(t => t.document.disposition == token.document.disposition)) {
				if (debugEnabled > 0)
					warn("target confirmation triggered from targetConfirmation.allies");
				return true;
			}
		}
		if (targetConfirmation.targetSelf && activity.target?.affects.type !== "self") {
			let tokenToUse = token;
			/*
			if (tokenToUse && game.user?.targets) {
			const { result, attackingToken } = checkActivityRange(activity, tokenToUse, new Set(game.user.targets))
			if (speaker.token && result === "fail")
				tokenToUse = undefined;
			else tokenToUse = attackingToken;
			}
			*/
			if (tokenToUse && game.user?.targets?.has(tokenToUse)) {
				if (debugEnabled > 0)
					warn("target confirmation triggered by has targetConfirmation.targetSelf");
				return true;
			}
		}
		if (targetConfirmation.mixedDispositiion && numTargets > 0 && game.user?.targets) {
			const dispositions = new Set();
			for (let target of game.user?.targets) {
				//@ts-expect-error
				if (target)
					dispositions.add(target.document.disposition);
			}
			if (dispositions.size > 1) {
				if (debugEnabled > 0)
					warn("target confirmation triggered from targetConfirmation.mixedDisposition");
				return true;
			}
		}
		if (targetConfirmation.longRange && game?.user?.targets && numTargets > 0 &&
			(["ft", "m"].includes(activity.item.system.range?.units) || activity.item.system.range.type === "touch")) {
			if (token) {
				for (let target of game.user.targets) {
					const { result, attackingToken } = checkActivityRange(activity, token, new Set([target]));
					if (result !== "normal") {
						if (debugEnabled > 0)
							warn("target confirmation triggered from targetConfirmation.longRange");
						return true;
					}
				}
			}
		}
		if (targetConfirmation.inCover && numTargets > 0 && token && game.user?.targets) {
			const isRangeTargeting = ["ft", "m"].includes(activity.target?.affects.count) && ["creature", "ally", "enemy"].includes(activity.target?.affects.type);
			if (!activity.target?.template?.type && !isRangeTargeting) {
				for (let target of game.user?.targets) {
					if (computeCoverBonus(token, target, activity.item) > 0) {
						if (debugEnabled > 0)
							warn("target confirmation triggered from targetConfirmation.inCover");
						return true;
					}
				}
			}
		}
		const isRangeTargeting = ["ft", "m"].includes(activity.target?.affects.count) && ["creature", "ally", "enemy"].includes(activity.target?.affects.type);
		if (activity.target?.template?.type && (targetConfirmation.hasAoE)) {
			if (debugEnabled > 0)
				warn("target confirmation triggered by targetConfirmation.hasAoE");
			return true;
		}
		else if (isRangeTargeting && (targetConfirmation.hasRangedAoE)) {
			if (debugEnabled > 0)
				warn("target confirmation triggered by has targetConfirmation.hasRangedAoE");
			return true;
		}
	}
	return false;
}
export async function preTemplateTargets(activity, options) {
	if (activityRequiresPostTemplateConfiramtion(activity))
		return true;
	if (requiresTargetConfirmation(activity, options))
		return await resolveTargetConfirmation(activity, options) === true;
	return true;
}
export async function postTemplateConfirmTargets(activity, options, workflow) {
	if (!activityRequiresPostTemplateConfiramtion(activity)) {
		if (game.user?.targets) {
			activity.workflow.setTargets(game.user?.targets);
			activity.targets = new Set(game.user?.targets);
		}
		return true;
	}
	if (requiresTargetConfirmation(activity, options) || activity.target?.affects?.choice) {
		let result = true;
		result = await resolveTargetConfirmation(activity, options);
		if (result && game.user?.targets) {
			workflow.setTargets(game.user.targets);
			activity.targets = new Set(game.user.targets);
		}
		return result === true;
	}
	if (game.user?.targets) {
		activity.workflow.setTargets(game.user?.targets);
		activity.targets = new Set(game.user?.targets);
	}
	return true;
}
export async function resolveTargetConfirmation(activity, options = {}) {
	const savedSettings = { control: ui.controls?.control?.name, tool: ui.controls?.tool };
	const savedActiveLayer = canvas?.activeLayer;
	await canvas?.tokens?.activate();
	ui.controls?.initialize({ tool: "target", control: "token" });
	const wasMaximized = !(activity.actor.sheet?._minimized);
	// Hide the sheet that originated the preview
	if (wasMaximized)
		await activity.actor.sheet.minimize();
	let targets = new Promise((resolve, reject) => {
		// no timeout since there is a dialog to close
		// create target dialog which updates the target display
		options = foundry.utils.mergeObject(options, { callback: resolve });
		let targetConfirmation = new TargetConfirmationDialog(activity.actor, activity, game.user, options).render(true);
	});
	let shouldContinue = await targets;
	if (savedActiveLayer)
		await savedActiveLayer.activate();
	if (savedSettings.control && savedSettings.tool)
		//@ts-ignore savedSettings.tool is really a string
		ui.controls?.initialize(savedSettings);
	if (wasMaximized)
		await activity.actor.sheet.maximize();
	return shouldContinue ? true : false;
}
export async function showItemInfo() {
	const token = this.actor.token;
	const sceneId = token?.scene && token.scene.id || canvas?.scene?.id;
	const templateData = {
		actor: this.actor,
		// tokenId: token?.id,
		tokenId: token?.document?.uuid ?? token?.uuid,
		tokenUuid: token?.document?.uuid ?? token?.uuid,
		item: this,
		itemUuid: this.uuid,
		data: await await this.system.getCardData(),
		labels: this.labels,
		condensed: false,
		hasAttack: false,
		isHealing: false,
		hasDamage: false,
		isVersatile: false,
		isSpell: this.type === "spell",
		isPower: this.type === "power",
		hasSave: false,
		hasAreaTarget: false,
		hasAttackRoll: false,
		configSettings,
		hideItemDetails: false,
		hasEffects: false,
		isMerge: false,
	};
	const templateType = ["tool"].includes(this.type) ? this.type : "item";
	const template = `modules/midi-qol/templates/${templateType}-card.hbs`;
	const html = await renderTemplate(template, templateData);
	const chatData = {
		user: game.user?.id,
		content: html,
		flavor: this.system.chatFlavor || this.name,
		speaker: getSpeaker(this.actor),
		flags: {
			"core": { "canPopout": true }
		}
	};
	//@ts-expect-error
	if (game.release.generation < 12) {
		chatData.type = CONST.CHAT_MESSAGE_TYPES.OTHER;
	}
	else {
		//@ts-expect-error
		chatData.style = CONST.CHAT_MESSAGE_STYLES.OTHER;
	}
	// Toggle default roll mode
	let rollMode = game.settings.get("core", "rollMode");
	if (["gmroll", "blindroll"].includes(rollMode))
		chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").filter(u => u.active);
	if (rollMode === "blindroll")
		chatData["blind"] = true;
	if (rollMode === "selfroll")
		chatData["whisper"] = [game.user?.id];
	// Create the chat message
	return ChatMessage.create(chatData);
}
function isTokenInside(template, token, wallsBlockTargeting) {
	//@ts-ignore grid v10
	const grid = canvas?.scene?.grid;
	if (!grid)
		return false;
	//@ts-expect-error
	const templatePos = template.document ? { x: template.document.x, y: template.document.y } : { x: template.x, y: template.y };
	if (configSettings.optionalRules.wallsBlockRange !== "none" && hasWallBlockingCondition(token))
		return false;
	if (!isTargetable(token))
		return false;
	// Check for center of  each square the token uses.
	// e.g. for large tokens all 4 squares
	//@ts-ignore document.width
	const startX = token.document.width >= 1 ? 0.5 : (token.document.width / 2);
	//@ts-ignore document.height
	const startY = token.document.height >= 1 ? 0.5 : (token.document.height / 2);
	//@ts-ignore document.width
	for (let x = startX; x < token.document.width; x++) {
		//@ts-ignore document.height
		for (let y = startY; y < token.document.height; y++) {
			const currGrid = {
				x: token.x + x * grid.size - templatePos.x,
				y: token.y + y * grid.size - templatePos.y,
			};
			let contains = template.shape?.contains(currGrid.x, currGrid.y);
			if (contains && wallsBlockTargeting) {
				let tx = templatePos.x;
				let ty = templatePos.y;
				if (template.shape instanceof PIXI.Rectangle) {
					tx = tx + template.shape.width / 2;
					ty = ty + template.shape.height / 2;
				}
				const r = new Ray({ x: tx, y: ty }, { x: currGrid.x + templatePos.x, y: currGrid.y + templatePos.y });
				// If volumetric templates installed always leave targeting to it.
				if (configSettings.optionalRules.wallsBlockRange === "centerLevels"
					&& installedModules.get("levels")
					&& !installedModules.get("levelsvolumetrictemplates")) {
					let p1 = {
						x: currGrid.x + templatePos.x, y: currGrid.y + templatePos.y,
						//@ts-expect-error
						z: token.elevation
					};
					// installedModules.get("levels").lastTokenForTemplate.elevation no longer defined
					//@ts-expect-error .elevation CONFIG.Levels.UI v10
					// const p2z = _token?.document?.elevation ?? CONFIG.Levels.UI.nextTemplateHeight ?? 0;
					const { elevation } = CONFIG.Levels.handlers.TemplateHandler.getTemplateData(false);
					let p2 = {
						x: tx, y: ty,
						//@ts-ignore
						z: elevation
					};
					//@ts-expect-error
					contains = getUnitDist(p2.x, p2.y, p2.z, token) <= template.document.distance;
					//@ts-expect-error .Levels
					contains = contains && !CONFIG.Levels?.API?.testCollision(p1, p2, "collision");
				}
				else if (!installedModules.get("levelsvolumetrictemplates")) {
					//@ts-expect-error polygonBackends
					contains = !CONFIG.Canvas.polygonBackends.sight.testCollision({ x: tx, y: ty }, { x: currGrid.x + templatePos.x, y: currGrid.y + templatePos.y }, { mode: "any", type: "move" });
				}
			}
			// Check the distance from origin.
			if (contains)
				return true;
		}
	}
	return false;
}
export function isAoETargetable(targetToken, options = { ignoreSelf: false, AoETargetType: "any" }) {
	if (!isTargetable(targetToken))
		return false;
	const autoTarget = options.autoTarget ?? configSettings.autoTarget;
	const selfToken = getToken(options.selfToken);
	if (["wallsBlockIgnoreIncapacitated", "alwaysIgnoreIncapacitated"].includes(autoTarget) && checkIncapacitated(targetToken.actor, false, false))
		return false;
	if (["wallsBlockIgnoreDefeated", "alwaysIgnoreDefeated"].includes(autoTarget) && checkDefeated(targetToken))
		return false;
	if (targetToken === selfToken && options.ignoreSelf)
		return false;
	//@ts-expect-error .disposition
	const selfDisposition = selfToken?.document.disposition ?? 1;
	switch (options.AoETargetType) {
		case "any":
			return true;
		case "ally":
			return targetToken.document.disposition === selfDisposition;
		case "notAlly":
			return targetToken.document.disposition !== selfDisposition;
		case "enemy":
			//@ts-expect-error
			return targetToken.document.disposition === -selfDisposition || targetToken.document.disposition == CONST.TOKEN_DISPOSITIONS.SECRET;
		case "notEnemy":
			//@ts-expect-error
			return targetToken.document.disposition !== -selfDisposition && targetToken.document.disposition !== CONST.TOKEN_DISPOSITIONS.SECRET;
		case "neutral":
			return targetToken.document.disposition === CONST.TOKEN_DISPOSITIONS.NEUTRAL;
		case "notNeutral":
			return targetToken.document.disposition !== CONST.TOKEN_DISPOSITIONS.NEUTRAL;
		case "friendly":
			return targetToken.document.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY;
		case "notFriendly":
			return targetToken.document.disposition !== CONST.TOKEN_DISPOSITIONS.FRIENDLY;
		case "hostile":
			//@ts-expect-error
			return targetToken.document.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE || targetToken.document.disposition == CONST.TOKEN_DISPOSITIONS.SECRET;
		case "notHostile":
			//@ts-expect-error
			return targetToken.document.disposition !== CONST.TOKEN_DISPOSITIONS.HOSTILE && targetToken.document.disposition !== CONST.TOKEN_DISPOSITIONS.SECRET;
		default: return true;
	}
}
export function templateTokens(templateDetails, selfTokenRef = "", ignoreSelf = false, AoETargetType = "any", autoTarget) {
	if (!autoTarget)
		autoTarget = configSettings.autoTarget;
	// deprecated if (!autoTarget) autoTarget = getAutoTarget(templateDetails.item);
	console.error(templateDetails);
	if ((autoTarget) === "none")
		return [];
	const wallsBlockTargeting = ["wallsBlock", "wallsBlockIgnoreDefeated", "wallsBlockIgnoreIncapacitated"].includes(autoTarget);
	const tokens = canvas?.tokens?.placeables ?? []; //.map(t=>t)
	const selfToken = getToken(selfTokenRef);
	let targetIds = [];
	let targetTokens = [];
	game.user?.updateTokenTargets([]);
	if (autoTarget === "walledtemplates" && game.modules.get("walledtemplates")?.active) {
		//@ts-expect-error
		if (foundry.utils.getProperty(templateDetails?.item, "flags.walledtemplates.noAutotarget"))
			return targetTokens;
		//@ts-expect-error
		targetTokens = (templateDetails.targetsWithinShape) ? templateDetails.targetsWithinShape() : [];
		targetTokens = targetTokens.filter(token => isAoETargetable(token, { selfToken, ignoreSelf, AoETargetType, autoTarget }));
		targetIds = targetTokens.map(t => t.id);
	}
	else {
		for (const token of tokens) {
			if (!isAoETargetable(token, { selfToken, ignoreSelf, AoETargetType, autoTarget }))
				continue;
			if (token.actor && isTokenInside(templateDetails, token, wallsBlockTargeting)) {
				if (token.id) {
					targetTokens.push(token);
					targetIds.push(token.id);
				}
			}
		}
	}
	game.user?.updateTokenTargets(targetIds);
	game.user?.broadcastActivity({ targets: targetIds });
	return targetTokens;
}
// this is bound to a workflow when called - most of the time
export function selectTargets(templateDocument, data, user) {
	// const workflow = this?.currentAction ? this : Workflow.getWorkflow(templateDocument.flags?.dnd5e?.origin);
	const activity = this;
	if (debugEnabled > 0)
		warn("selectTargets ", activity, templateDocument, data, user);
	const selfToken = getToken(activity.actor);
	const ignoreSelf = (activity?.target.affects.special ?? "").split(";").some(spec => spec === "self");
	let AoETargetType = getAoETargetType(activity);
	let targeting = getActivityAutoTargetAction(activity);
	if ((game.user?.targets.size === 0 || activity.workflow?.workflowOptions.forceTemplateTargeting || user !== game.user?.id || installedModules.get("levelsvolumetrictemplates")) && targeting !== "none") {
		let mTemplate = MQfromUuidSync(templateDocument.uuid)?.object;
		if (templateDocument?.object && !installedModules.get("levelsvolumetrictemplates")) {
			if (!mTemplate.shape) {
				// @ ts-expect-error
				// mTemplate.shape = mTemplate._computeShape();
				let { shape, distance } = computeTemplateShapeDistance(templateDocument);
				//@ts-expect-error
				mTemplate.shape = shape;
				//@ ts-expect-error
				// mTemplate.distance = distance;
				if (debugEnabled > 0)
					warn(`selectTargets computed shape ${shape} distance ${distance}`);
			}
			templateTokens(mTemplate, selfToken, ignoreSelf, AoETargetType, getActivityAutoTargetAction(activity));
		}
		else if (templateDocument.object) {
			//@ts-expect-error
			VolumetricTemplates.compute3Dtemplate(templateDocument.object, canvas?.tokens?.placeables);
		}
	}
	// TODO fix this so the workflow is not required (store the template reference somewhere else)
	if (activity.workflow) {
		activity.workflow.templateId = templateDocument?.id;
		activity.workflow.templateUuid = templateDocument?.uuid;
	}
	if (targeting === "none") { // this is no good
		Hooks.callAll("midi-qol-targeted", activity.workflow?.targets);
		return true;
	}
	game.user?.targets?.forEach(token => {
		if (!isAoETargetable(token, { ignoreSelf, selfToken, AoETargetType, autoTarget: getActivityAutoTargetAction(activity) }))
			token.setTarget(false, { user: game.user, releaseOthers: false });
		if (activity.target?.affects.count && (game.user?.targets?.size ?? 0) > activity.target?.affects?.count)
			token.setTarget(false, { user: game.user, releaseOthers: false });
	});
	if (activity.workflow.workflowType === "TrapWorkflow")
		return;
	if (debugEnabled > 0)
		warn("selectTargets ", activity.workflow?.suspended, activity.workflow?.needTemplate, templateDocument);
	if (activity.workflow?.needTemplate) {
		activity.workflow.needTemplate = false;
		if (activity.workflow?.suspended)
			activity.workflow.unSuspend.bind(activity.workflow)({ templateDocument });
	}
	return;
}
;
export function preRollDamageHook(item, rollConfig) {
	return true;
}
// If we are blocking the roll let anyone waiting on the roll know it is complete
function blockRoll(item, workflow) {
	if (item) {
		if (workflow)
			workflow.aborted = true;
		let hookName = `midi-qol.RollComplete.${item?.uuid}`;
		Hooks.callAll(hookName, workflow);
	}
	return false;
}
