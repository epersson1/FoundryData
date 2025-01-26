import { MODULE_ID } from "../../midi-qol.js";
import { applySettings } from "../apps/ConfigPanel.js";
import { configSettings } from "../settings.js";
import { CEHasEffectApplied, CERemoveEffect, applyTokenDamage, completeItemUse } from "../utils.js";
import { TrapWorkflow } from "../Workflow.js";
const actor1Name = "actor1";
const actor2Name = "actor2";
const target1Name = "Orc1";
const target2Name = "Orc2";
const target3Name = "Skeleton1";
const workflowOptions = { targetConfirmation: "none" };
export async function busyWait(seconds) {
	return (new Promise(resolve => setTimeout(resolve, seconds * 1000)));
}
export async function resetActors() {
	for (let name of [actor1Name, actor2Name, target1Name, target2Name, target3Name]) {
		const a = getActor(name);
		//@ts-ignore .system
		await a.update({ "data.attributes.hp.value": foundry.utils.getProperty(a, "system.attributes.hp.max") });
		if (a.effects?.contents.length > 0)
			await a.deleteEmbeddedDocuments("ActiveEffect", a?.effects?.contents?.map(e => e.id ?? ""));
		await a.unsetFlag("dnd5e", "initiativeAdv");
		await a.unsetFlag("dnd5e", "initiativeDisadv");
	}
	if (canvas?.scene?.tokens) {
		for (let token of canvas?.scene?.tokens) {
			if (token.actor) {
				//@ts-expect-error
				await token.actor.update({ "system.attributes.hp.value": token.actor.system.attributes.hp.max });
				if (token.actor.effects?.contents.length > 0)
					await token.actor.deleteEmbeddedDocuments("ActiveEffect", token.actor.effects.contents.map(e => e.id ?? ""));
				await token.actor.unsetFlag("dnd5e", "initiativeAdv");
				await token.actor.unsetFlag("dnd5e", "initiativeDisadv");
			}
		}
	}
}
export function getToken(tokenName) {
	const token = canvas?.tokens?.placeables.find(t => t.name === tokenName);
	return token;
}
export function getActor(tokenName) {
	const token = getToken(tokenName);
	if (token?.actor) {
		//@ts-expect-error
		token.actor._initialize();
		return token.actor;
	}
	;
	const actor = game.actors?.getName(tokenName);
	if (!actor)
		throw new Error(`No such actor ${tokenName}`);
	//@ts-expect-error
	actor?._initialize();
	return actor;
}
export function getActorItem(actor, itemName) {
	const item = actor?.items.getName(itemName);
	if (!item)
		throw new Error(`Could not find item ${itemName} on actor ${actor.name}`);
	return item;
}
export function setupMidiTests() {
	if (!game?.user?.isGM)
		return;
	//@ts-ignore .title v10
	if (!game.world.title.toLocaleLowerCase().includes("quench"))
		return;
	const actor1 = getActor(actor1Name);
	const actor2 = getActor(actor2Name);
	const token1 = getToken(target1Name);
	const token2 = getToken(target2Name);
	if (!(actor1 && actor2 && token1 && token2)) {
		console.warn("midi-qol | test setup failed ", actor1, actor2, token1, token2);
		return;
	}
	registerTests();
}
// Hooks.on("quenchReady", registerTests);
function addEffect(actor, changes) {
}
async function registerTests() {
	if (globalThis.quench) {
		//@ts-ignore
		await globalThis.game.messages.documentClass.deleteDocuments([], { deleteAll: true });
		applySettings("FullAuto");
		globalThis.quench.registerBatch("quench.midi-qol.tests", (context) => {
			const { describe, it, assert } = context;
			describe("Damage Only Workflow/TrapWorkflow", function () {
				it("apply a DamageOnlyWorkflow", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const target = getToken(target1Name);
					//@ts-ignore
					assert(target && target?.actor);
					game.user?.updateTokenTargets([target?.id ?? ""]);
					const item = getActorItem(actor, "Toll the Dead");
					if (target?.actor)
						await target.actor.setFlag(MODULE_ID, "fail.ability.save.all", true);
					try {
						const workflow = await completeItemUse(item, {}, { workflowOptions });
						target?.actor?.unsetFlag(MODULE_ID, "fail.ability.save.all");
						assert.ok(!!workflow);
					}
					catch (err) {
						console.error("Damage Only Workflow Error", err);
						assert.ok(false);
					}
					finally {
					}
				});
				it("rolls a TrapWorkflow", async function () {
					await resetActors();
					try {
						const trapWorkflowMacro = game.macros?.getName("TrapWorkflowTest");
						const targetToken = getToken(target1Name);
						const targetActor = targetToken?.actor;
						const spell = game.items?.getName("FireballTest");
						if (spell && targetToken && targetActor) {
							// foundry.utils.setProperty(spell, "system.save", { ability: 'dex', dc: 15, scaling: 'flat' });
							// foundry.utils.setProperty(spell, "system.preparation", { mode: 'innate', prepared: 'true' });
							//@ ts-expect-error
							const trapItem = new CONFIG.Item.documentClass(spell.toObject(), { parent: targetActor });
							// trapItem.setFlag = async (scope: string, key: string, value: any) => { return trapItem };
							trapItem.prepareData();
							trapItem.prepareFinalAttributes();
							const templateLocation = targetToken.center;
							const workflow = new TrapWorkflow(targetActor, trapItem.system.activities.contents[0], undefined, templateLocation);
							assert.ok(trapWorkflowMacro, "TrapWorkflowTest macro not found");
							assert.ok(!!workflow && workflow instanceof TrapWorkflow);
							await busyWait(1);
							const fireballEffect = targetToken?.actor?.effects.find(e => e.name === "FireballTest Template");
							assert.ok(fireballEffect, "No template effect found");
							await fireballEffect?.delete();
							assert.ok(workflow?.targets.size === 2, "Wrong number of targets");
							assert.ok(workflow.damageRoll, "No damage roll");
						}
					}
					catch (err) {
						console.error("TrapWorkflow Error", err);
						assert.ok(false);
					}
					finally {
					}
				});
			});
		}, { displayName: "Midi Tests DOW/TrapWorkflow" });
		globalThis.quench.registerBatch("quench.midi-qol.abilityrolls", (context) => {
			const { describe, it, assert, expect } = context;
			const actor = getActor(actor1Name);
			describe("skill roll tests", function () {
				it("roll perception - 1 dice", function () {
					return actor.rollSkill({ skill: "prc" }, { configure: false }, { create: false })
						// .then(skillRoll => { actor._initialize(); assert.equal(skillRoll.terms[0].number, 1) });
						.then(skillRoll => { actor._initialize(); expect(skillRoll[0].terms[0].number).to.equal(1); });
				});
				it("roll perception - adv.all", async function () {
					foundry.utils.setProperty(actor, "flags.midi-qol.advantage.all", true);
					const result = await actor.rollSkill({ skill: "prc" }, { configure: false }, { create: false })
						.then(skillRoll => { delete actor.flags[MODULE_ID].advantage.all; actor._initialize(); assert.equal(skillRoll[0].terms[0].number, 2); });
					return result;
				});
				it("roll perception - adv.skill.all", async function () {
					foundry.utils.setProperty(actor, "flags.midi-qol.advantage.skill.all", true);
					const result = await actor.rollSkill({ skill: "prc" }, { configure: false }, { create: false })
						.then(skillRoll => { delete actor.flags[MODULE_ID].advantage.skill.all; actor._initialize(); assert.equal(skillRoll[0].terms[0].number, 2); });
					return result;
				});
				it("roll perception - adv.skill.prc", async function () {
					foundry.utils.setProperty(actor, "flags.midi-qol.advantage.skill.prc", true);
					const result = await actor.rollSkill({ skill: "prc" }, { configure: false }, { create: false })
						.then(skillRoll => { delete actor.flags[MODULE_ID].advantage.skill.prc; actor._initialize(); assert.equal(skillRoll[0].terms[0].number, 2); });
					return result;
				});
				it("roll perception - adv.skill.ath", async function () {
					foundry.utils.setProperty(actor, "flags.midi-qol.advantage.skill.ath", true);
					return actor.rollSkill({ skill: "prc" }, { configure: false }, { create: false })
						.then(skillRoll => { delete actor.flags[MODULE_ID].advantage.skill.ath; actor._initialize(); assert.equal(skillRoll[0].terms[0].number, 1); });
				});
				it("roll acr skill min = 10", async function () {
					for (let i = 0; i < 20; i++) {
						foundry.utils.setProperty(actor, "flags.midi-qol.min.skill.all", 10);
						const result = await actor.rollSkill({ skill: "acr" }, { configure: false }, { create: false });
						assert.ok(result.reduce((acc, roll) => acc + roll.total, 0) >= 10);
						delete actor.flags[MODULE_ID].min.skill.all;
						return result;
					}
				});
				it("roll per skill max = 10", async function () {
					for (let i = 0; i < 20; i++) {
						foundry.utils.setProperty(actor, "flags.midi-qol.max.skill.all", 10);
						const result = await actor.rollSkill({ skill: "per" }, { configure: false }, { create: false });
						assert.ok(result.reduce((acc, roll) => acc + roll.total, 0) <= 10);
						delete actor.flags[MODULE_ID].max.skill.all;
						return result;
					}
				});
			});
			describe("initiative rolls", function () {
				it("rolls a normal initiative roll", async function () {
					await busyWait(0.1); // let previous chat message creation complete
					const rollResult = new Promise((resolve) => {
						Hooks.once("createChatMessage", function (chatMessage) {
							resolve(chatMessage.rolls[0]);
						});
					});
					const cls = getDocumentClass("Combat");
					const combat = await cls.create({ scene: canvas?.scene?.id, active: true }, { render: false });
					// await combat?.startCombat();
					await actor.rollInitiative({ createCombatants: true, rerollInitiative: true });
					await combat?.delete();
					const roll = await rollResult;
					//@ts-ignore
					assert.equal(roll.terms[0].results.length, 1);
				});
				it("rolls an advantage initiative roll", async function () {
					await actor.setFlag(game.system.id, "initiativeAdv", true);
					await actor.setFlag(game.system.id, "initiativeDisadv", false);
					const rollResult = new Promise((resolve) => {
						Hooks.once("createChatMessage", function (chatMessage) {
							resolve(chatMessage.rolls[0]);
						});
					});
					const cls = getDocumentClass("Combat");
					let scene = canvas?.scene;
					const combat = await cls.create({ scene: scene?.id, active: true }, { render: true });
					await combat?.startCombat();
					await actor.rollInitiativeDialog({ createCombatants: true, rerollInitiative: true });
					await combat?.delete();
					const roll = await rollResult;
					await actor.unsetFlag(game.system.id, "initiativeAdv");
					await actor.unsetFlag(game.system.id, "initiativeDisadv");
					//@ts-ignore
					assert.equal(roll.terms[0].results.length, 2);
					assert.ok(roll.formula.startsWith("2d20kh"));
				});
				it("rolls a disadvantage initiative roll", async function () {
					await actor.setFlag(game.system.id, "initiativeAdv", false);
					await actor.setFlag(game.system.id, "initiativeDisadv", true);
					const rollResult = new Promise(async (resolve) => {
						Hooks.once("createChatMessage", function (chatMessage) {
							resolve(chatMessage.rolls[0]);
						});
					});
					const cls = getDocumentClass("Combat");
					let scene = canvas?.scene;
					const combat = await cls.create({ scene: scene?.id, active: true });
					await combat?.startCombat();
					await actor.rollInitiativeDialog({ createCombatants: true, rerollInitiative: true });
					await combat?.delete();
					const roll = await rollResult;
					await actor.unsetFlag(game.system.id, "initiativeDisadv");
					await actor.unsetFlag(game.system.id, "initiativeAdv");
					//@ts-ignore
					assert.equal(roll.terms[0].results.length, 2);
					assert.ok(roll.formula.startsWith("2d20kl"));
				});
			});
			describe("save roll tests", function () {
				it("roll dex save - 1 dice", async function () {
					return actor.rollSavingThrow({ ability: "dex" }, { configure: false }, { create: false })
						.then(abilitySave => { actor._initialize(); assert.equal(abilitySave[0].terms[0].number, 1); });
				});
				it("roll dex save - adv.all", async function () {
					foundry.utils.setProperty(actor, "flags.midi-qol.advantage.all", true);
					return actor.rollSavingThrow({ ability: "dex" }, { configure: false }, { create: false })
						.then(abilitySave => { delete actor.flags[MODULE_ID].advantage.all; actor._initialize(); assert.equal(abilitySave[0].terms[0].number, 2); });
				});
				it("roll dex save - adv.ability.save.all", async function () {
					foundry.utils.setProperty(actor, "flags.midi-qol.advantage.ability.save.all", true);
					return actor.rollSavingThrow({ ability: "dex" }, { configure: false }, { create: false })
						.then(abilitySave => { delete actor.flags[MODULE_ID].advantage.ability.save.all; actor._initialize(); assert.equal(abilitySave[0].terms[0].number, 2); });
				});
				it("roll dex save - adv.ability.save.dex", async function () {
					foundry.utils.setProperty(actor, "flags.midi-qol.advantage.ability.save.dex", true);
					return actor.rollSavingThrow({ ability: "dex" }, { configure: false }, { create: false })
						.then(abilitySave => { delete actor.flags[MODULE_ID].advantage.ability.save.dex; actor._initialize(); assert.equal(abilitySave[0].terms[0].number, 2); });
				});
				it("roll dex save - adv.ability.save.str", async function () {
					foundry.utils.setProperty(actor, "flags.midi-qol.advantage.ability.save.str", true);
					return actor.rollSavingThrow({ ability: "dex" }, { configure: false }, { create: false })
						.then(abilitySave => { delete actor.flags[MODULE_ID].advantage.ability.save.dex; actor._initialize(); assert.equal(abilitySave[0].terms[0].number, 1); });
				});
				it("roll str save min = 10", async function () {
					for (let i = 0; i < 20; i++) {
						foundry.utils.setProperty(actor, "flags.midi-qol.min.ability.save.all", 10);
						const result = await actor.rollSavingThrow({ ability: "str" }, { configure: false }, { create: false });
						delete actor.flags[MODULE_ID].min.ability.save.all;
						assert.ok(result[0].total >= 10);
					}
				});
				it("roll str save max = 10", async function () {
					for (let i = 0; i < 20; i++) {
						foundry.utils.setProperty(actor, "flags.midi-qol.max.ability.save.all", 10);
						const result = await actor.rollSavingThrow({ ability: "str" }, { configure: false }, { create: false });
						delete actor.flags[MODULE_ID].max.ability.save.all;
						assert.ok(result[0].total <= 10);
					}
				});
				it("rolls a normal spell saving throw", async function () {
					const actor = getActor(actor1Name);
					const target = getToken(target1Name);
					assert.ok(target && !!target?.actor && actor);
					game.user?.updateTokenTargets([target?.id ?? ""]);
					const item = actor.items.getName("Saving Throw Test");
					assert.ok(item);
					const workflow = await completeItemUse(item, {}, { workflowOptions });
					assert.ok(workflow.saveResults.length === 1);
					assert.equal(workflow.saveResults[0][0].terms[0].results.length, 1);
					assert.ok(workflow.saveResults[0][0].formula.startsWith("1d20"));
				});
				it("rolls a magic resistance spell saving throw", async function () {
					const actor = getActor(actor1Name);
					const target = getToken(target1Name);
					assert.ok(target && !!target?.actor && actor);
					try {
						game.user?.updateTokenTargets([target?.id ?? ""]);
						const item = actor.items.getName("Saving Throw Test");
						assert.ok(item);
						await actor.setFlag("midi-qol", "magicResistance.all", true);
						console.warn("update flags returned", actor.flags["midi-qol"].magicResistance);
						const workflow = await completeItemUse(item, {}, { workflowOptions });
						console.warn("complete ite use returned");
						assert.equal(workflow.saveResults.length, 1);
						assert.equal(workflow.saveResults[0][0].terms[0].results.length, 2);
						assert.ok(workflow.saveResults[0][0].formula.startsWith("2d20kh"));
					}
					finally {
						await actor.unsetFlag("midi-qol", "magicResistance");
					}
				});
				it("rolls a magic vulnerability spell saving throw", async function () {
					const actor = getActor(actor1Name);
					const target = getToken(target1Name);
					assert.ok(target && !!target?.actor && actor);
					try {
						game.user?.updateTokenTargets([target?.id ?? ""]);
						const item = actor.items.getName("Saving Throw Test");
						assert.ok(item);
						await actor.setFlag("midi-qol", "magicVulnerability.all", true);
						const workflow = await completeItemUse(item, {}, { workflowOptions });
						assert.equal(workflow.saveResults.length, 1);
						assert.equal(workflow.saveResults[0][0].terms[0].results.length, 2);
						assert.ok(workflow.saveResults[0][0].formula.startsWith("2d20kl"));
					}
					finally {
						await actor.unsetFlag("midi-qol", "magicVulnerability");
					}
				});
			});
		}, { displayName: "Midi Tests Ability Rolls" });
		globalThis.quench.registerBatch("quench.midi-qol.itemRolls", (context) => {
			const { describe, it, assert, expect, should } = context;
			describe("Item Roll Tests", async function () {
				it("roll an item with no params", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const target = getToken(target2Name);
					const item = getActorItem(actor, "Longsword");
					game.user?.updateTokenTargets([target?.id ?? ""]);
					return completeItemUse(item, {}, { workflowOptions }).then(workflow => assert.ok(!!workflow));
				});
				it("applies clt conditions", async function () {
					let results;
					//@ts-ignore
					const cltInterface = game?.clt;
					assert.ok(!!cltInterface);
					const target = getToken(target2Name);
					const actor = getActor(actor1Name);
					game.user?.updateTokenTargets([target?.id ?? ""]);
					if (cltInterface.hasCondition("Blinded", [target]))
						await cltInterface.removeCondition("Blinded", [target]);
					assert.ok(!cltInterface.hasCondition("Blinded", [target]));
					assert.ok(!!(await completeItemUse(actor.items.getName("Clt Test"), {}, { workflowOptions })));
					await busyWait(0.5);
					assert.ok(cltInterface.hasCondition("Blinded", [target]));
					const effect = target?.actor?.effects.find(e => e.name === "Clt Test");
					results = await target?.actor?.deleteEmbeddedDocuments("ActiveEffect", [effect?.id ?? "bad"]);
					// results = await globalThis.DAE.actionQueue.add(target.actor?.deleteEmbeddedDocuments.bind(target.actor),"ActiveEffect", [effect?.id ?? "bad"]);
					await busyWait(0.5);
					if (cltInterface.hasCondition("Blinded", [target])) {
						console.warn("testcltCondition", "Blinded not removed");
						await cltInterface.removeCondition("Blinded", [target]);
						return false;
					}
					return true;
				});
				it("applies CE conditions", async function () {
					let results;
					//@ts-ignore
					const ceInterface = game.dfreds.effectInterface;
					assert.ok(!!ceInterface);
					const target = getToken(target2Name);
					const actor = getActor(actor2Name);
					assert.ok(target && actor);
					game.user?.updateTokenTargets([target?.id ?? ""]);
					if (await CEHasEffectApplied({ effectName: "Deafened", uuid: target?.actor?.uuid ?? "" })) {
						await CERemoveEffect({ effectName: "Deafened", uuid: target?.actor?.uuid ?? "" });
					}
					assert.ok(!await CEHasEffectApplied({ effectName: "Deafened", uuid: target?.actor?.uuid ?? "" }));
					await completeItemUse(actor.items.getName("CE Test"), {}, { workflowOptions });
					await busyWait(0.5);
					assert.ok(await CEHasEffectApplied({ effectName: "Deafened", uuid: target?.actor?.uuid ?? "" }));
					const effect = target?.actor?.effects.find(e => e.name === "CE Test");
					results = await target?.actor?.deleteEmbeddedDocuments("ActiveEffect", [effect?.id ?? "bad"]);
					await busyWait(0.1);
					if (await CEHasEffectApplied({ effectName: "Deafened", uuid: target?.actor?.uuid ?? "" })) {
						console.warn("testCECondition", "Deafened not removed");
						await CERemoveEffect({ effectName: "Deafened", uuid: target?.actor?.uuid ?? "" });
						return false;
					}
					return true;
				});
				it("applies damage to target", async function () {
					let results;
					const target = getToken(target2Name);
					const actor = getActor(actor2Name);
					assert.ok(target && actor);
					const oldHp = target?.actor?.system.attributes.hp.value;
					game.user?.updateTokenTargets([target?.id ?? ""]);
					//@ts-ignore .flags v10
					foundry.utils.setProperty(actor.flags, "midi-qol.advantage.all", true);
					//@ts-ignore .abilities
					assert.ok(actor.system.abilities.str.mod > 0, "non zero str mod");
					await completeItemUse(actor.items.getName("AppliesDamage"), {}, { workflowOptions });
					//@ts-ignore .flags v10
					delete actor.flags[MODULE_ID].advantage.all;
					const newHp = target?.actor?.system.attributes.hp.value;
					//@ts-ignore
					assert.equal(newHp, oldHp - 10 - actor.system.abilities.str.mod);
					return true;
				});
				it("applies activation condition", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const target2 = getToken(target2Name);
					const target3 = getToken(target3Name);
					game.user?.updateTokenTargets([target3?.id ?? "", target2?.id ?? ""]);
					const target2hp = target2?.actor?.system.attributes.hp.value;
					const target3hp = target3?.actor?.system.attributes.hp.value;
					await completeItemUse(actor.items.getName("MODTest"), {}, { advantage: true, workflowOptions }); // does 10 + 10 to undead
					const effects2 = target2.actor.effects.contents.filter(ef => (ef.name) === "MODTest");
					const effects3 = target3.actor.effects.contents.filter(ef => (ef.name) === "MODTest");
					if (effects2.length)
						await target2.actor.deleteEmbeddedDocuments("ActiveEffect", effects2.map(ae => ae.id));
					if (effects3.length)
						await target3.actor.deleteEmbeddedDocuments("ActiveEffect", effects3.map(ae => ae.id));
					await busyWait(0.1);
					const condition2 = target2.actor.effects.contents.filter(ef => (ef.name) === "Frightened");
					const condition3 = target3.actor.effects.contents.filter(ef => (ef.name) === "Frightened");
					if (condition2.length)
						await target2.actor.deleteEmbeddedDocuments("ActiveEffect", condition2.map(ae => ae.id));
					if (condition3.length)
						await target3.actor.deleteEmbeddedDocuments("ActiveEffect", condition3.map(ae => ae.id));
					assert.equal(target2hp - 10, target2?.actor?.system.attributes.hp.value, "non undead takes 10 hp");
					assert.equal(target3hp - 40, target3?.actor?.system.attributes.hp.value, "undead takes 20 hp"); // 20hp + vulnerability
					assert.equal(effects2.length, 0, "Frightened not applied to non undead");
					assert.equal(effects3.length, 1, "Frightened applied to undead");
					assert.equal(condition2.length, 0, "Frightened not removed from non undead");
					assert.equal(condition3.length, 0, "Frightened not removed from undead");
				});
				it("applies condition/other damage - no activation", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const target2 = getToken(target2Name);
					const target3 = getToken(target3Name);
					game.user?.updateTokenTargets([target2?.id ?? "", target3?.id ?? ""]);
					const target2hp = target2?.actor?.system.attributes.hp.value;
					const target3hp = target3?.actor?.system.attributes.hp.value;
					await completeItemUse(actor.items.getName("MODTestNoActivation"), {}, { workflowOptions }); // does 10 + 10 to undead
					const effects2 = target2.actor.effects.contents.filter(ef => (ef.name) === "MODTestNoActivation");
					const effects3 = target3.actor.effects.contents.filter(ef => (ef.name) === "MODTestNoActivation");
					if (effects2.length)
						await target2.actor.deleteEmbeddedDocuments("ActiveEffect", effects2.map(ae => ae.id));
					if (effects3.length)
						await target3.actor.deleteEmbeddedDocuments("ActiveEffect", effects3.map(ae => ae.id));
					await busyWait(0.1);
					const condition2 = target2.actor.effects.contents.filter(ef => (ef.name) === "Frightened");
					const condition3 = target3.actor.effects.contents.filter(ef => (ef.name) === "Frightened");
					if (condition2.length)
						await target2.actor.deleteEmbeddedDocuments("ActiveEffect", condition2.map(ae => ae.id));
					if (condition3.length)
						await target3.actor.deleteEmbeddedDocuments("ActiveEffect", condition3.map(ae => ae.id));
					assert.equal(target2hp - 20, target2?.actor?.system.attributes.hp.value, "non undead takes 10 hp");
					assert.equal(target3hp - 40, target3?.actor?.system.attributes.hp.value, "undead takes 20 hp"); // 20hp + vulnerability
					assert.equal(effects2.length, 1, "Frightened not applied to non undead");
					assert.equal(effects3.length, 1, "Frightened applied to undead");
					assert.equal(condition2.length, 0, "Frghtened applied to non undead");
					assert.equal(condition3.length, 0, "Frightened applied to undead");
				});
			});
			describe("Macro Roll Tests", async function () {
				it("runs macro execute", async function () {
					const target = getToken(target1Name);
					let actor = getActor(actor2Name);
					assert.ok(actor);
					assert.ok(target);
					try {
						let hasEffect = actor.effects.filter(e => e.name === "Macro Execute Test") ?? [];
						if (hasEffect?.length > 0)
							await actor.deleteEmbeddedDocuments("ActiveEffect", hasEffect.map(e => e.id));
						hasEffect = target?.actor?.effects.filter(e => e.name === "Macro Execute Test") ?? [];
						if (hasEffect?.length > 0)
							await target?.actor?.deleteEmbeddedDocuments("ActiveEffect", hasEffect.map(e => e.id));
						game.user?.updateTokenTargets([target?.id ?? ""]);
						await completeItemUse(actor.items.getName("Macro Execute Test"), {}, { workflowOptions });
						await busyWait(0.1);
						console.log("Macro Execute Test checking flag", foundry.utils.getProperty(actor, "flags.midi-qol.test"));
						//@ts-expect-error .flags
						let flags = actor.flags[MODULE_ID];
						assert.equal(flags?.test, "metest");
						hasEffect = target?.actor?.effects.filter(e => e.name === "Macro Execute Test") ?? [];
						assert.ok(hasEffect);
						await target?.actor?.deleteEmbeddedDocuments("ActiveEffect", hasEffect.map(e => e.id));
						flags = foundry.utils.getProperty(actor, "flags.midi-qol.test");
						assert.ok(!flags?.test);
						hasEffect = target?.actor?.effects.filter(e => e.name === "Macro Execute Test") ?? [];
						assert.equal(hasEffect.length, 0);
					}
					finally {
						let hasEffect = target?.actor?.effects.filter(e => e.name === "Macro Execute Test") ?? [];
						await target?.actor?.deleteEmbeddedDocuments("ActiveEffect", hasEffect.map(e => e.id));
						await actor.unsetFlag(MODULE_ID, "test");
					}
					return true;
				});
				it("tests macro.tokenMagic", async function () {
					this.timeout(10000);
					const actor = getActor(actor1Name);
					const effectData = {
						name: "test effect",
						changes: [{ key: "macro.tokenMagic", mode: 0, value: "blur" }]
					};
					assert.ok(globalThis.TokenMagic);
					const theEffects = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
					assert.ok(actor.effects.find(ef => (ef.name === effectData.name)));
					await busyWait(3);
					const actorToken = canvas?.tokens?.placeables.find(t => t.name === (actor.token?.name ?? actor.name));
					assert.ok(actorToken, "found actor token");
					assert.ok(globalThis.TokenMagic.hasFilterId(actorToken, "blur"), "applied blur effect");
					await actor.deleteEmbeddedDocuments("ActiveEffect", theEffects.map(ef => ef.id));
					await busyWait(3);
					assert.equal(globalThis.TokenMagic.hasFilterId(actorToken, "blur"), false, "test blur");
					return true;
				});
				/*          it("tests blur removal", async function() {
							const actor = getActor(actor1Name);
							const actorToken = canvas?.tokens?.placeables.find(t=> t.name === actor.token?.name)
							this.retries(10);
							await busyWait(1);
							assert.equal(globalThis.TokenMagic.hasFilterId(actorToken,"blur"), false, "test blur");
						});
				*/
			});
			describe("onUse Macro Tests", async function () {
				it("Calls actor onUseMacros", async function () {
					this.timeout(3000); // why is 2 seconds not enough?
					const actor = getActor(actor2Name);
					const macroPasses = [];
					const hookid = Hooks.on("OnUseMacroTest", (pass) => macroPasses.push(pass));
					await completeItemUse(actor.items.getName("OnUseMacroTest"), {}, { workflowOptions }); // Apply the effect
					//@ts-ignore
					const target = getToken(target2Name);
					game.user?.updateTokenTargets([target?.id ?? ""]);
					await completeItemUse(actor.items.getName("Longsword"), {}, { workflowOptions }); // Apply the effect
					Hooks.off("OnUseMacroTest", hookid);
					let hasEffects = actor.effects.filter(e => e.name === "OnUseMacroTest") ?? [];
					assert.ok(hasEffects);
					await actor.deleteEmbeddedDocuments("ActiveEffect", hasEffects.map(e => e.id));
					console.warn("Actual Passes", macroPasses);
					console.warn("en.json passes", Object.keys(game.i18n.translations[MODULE_ID]["onUseMacroOptions"]));
					const expectedPasses = ['preTargeting', 'preItemRoll', 'preStart',
						'postStart', 'preAoETargetConfirmation', 'postAoETargetConfirmation',
						'preValidateRoll', 'postValidateRoll', 'prePreambleComplete',
						'postPreambleComplete', 'preWaitForAttackRoll',
						'postWaitForAttackRoll', 'preWaitForDamageRoll', 'postWaitForDamageRoll',
						'preWaitForSaves', 'preSave', 'postWaitForSaves', 'preSavesComplete',
						'postSave', 'postSavesComplete', 'preAllRollsComplete', 'postAllRollsComplete',
						'preApplyDynamicEffects', 'preActiveEffects', 'postApplyDynamicEffects',
						'preRollFinished', 'postActiveEffects', 'postRollFinished', 'preCleanup'];
					console.warn("Expected Passes", expectedPasses);
					console.warn("Actual passes", macroPasses);
					// Test for all passes except "all"
					for (let expectedPass of expectedPasses) {
						assert.ok(macroPasses.includes(expectedPass), `onUseMacro pass ${expectedPass}`);
					}
					// assert.equal(macroPasses.length, Object.keys(game.i18n.translations[MODULE_ID]["onUseMacroOptions"]).length - 1, "on use macro pass length");
				});
				it("Calls item onUseMacros", async function () {
					const actor = getActor(actor2Name);
					const macroPasses = [];
					const expectedPasses = ['preTargeting', 'preItemRoll', 'prePreambleComplete', 'preSave', 'postSave', 'preActiveEffects', 'postActiveEffects'];
					const hookid = Hooks.on("Item OnUseMacroTest", (pass) => macroPasses.push(pass));
					await completeItemUse(actor.items.getName("Item OnUseMacroTest"), {}, { workflowOptions });
					Hooks.off("OnUseMacroTest", hookid);
					for (let expectedPass of expectedPasses) {
						assert.ok(macroPasses.includes(expectedPass), `onUseMacro pass ${expectedPass}`);
					}
					console.warn("actual passes", macroPasses);
					console.warn("expected passes", expectedPasses);
					// assert.equal(JSON.stringify(macroPasses), JSON.stringify(expectedPasses));
				});
			});
		}, { displayName: "Midi Item Roll Tests" });
		globalThis.quench.registerBatch("quench.midi-qol.conditionImmunity", (context) => {
			const { describe, it, assert } = context;
			const actor = getActor(actor1Name);
			//@ts-ignore
			const ceInterface = game.dfreds?.effectInterface;
			describe("Condition Immunity Tests", async function () {
				it("Tests condition immunity disables effect", async function () {
					//@ts-expect-error
					if (game.release.generation > 11) {
						//@ts-expect-error
						await actor.toggleStatusEffect("paralyzed", { active: true });
						//@ts-expect-error
						assert.ok(actor.statuses.has("paralyzed"), "Paralyzed not applied");
					}
					else {
						if (!ceInterface)
							assert.ok(false, "Convenient Effects Interface not found");
						await ceInterface.addEffect({ effectName: "Paralyzed", uuid: actor.uuid });
					}
					try {
						// assert.ok(await ceInterface.hasEffectApplied("Paralyzed", actor?.uuid));
						const theEffect = actor.effects.find(ef => ef.name === "Paralyzed");
						assert.ok(theEffect, "not paralyzed");
						//@ts-ignore .disabled v10
						assert.ok(!(theEffect?.isSuppressed || theEffect.disabled), "paralyzed suppressed");
						await actor.update({ "system.traits.ci.value": ["paralyzed"] });
						//@ts-ignore .disabled v10
						assert.ok(theEffect?.disabled || theEffect?.isSuppressed, "paralyzed not suppressed");
						await actor.update({ "system.traits.ci.value": [] });
						//@ts-ignore .disabled v10
						assert.ok(!(theEffect?.disabled || theEffect.isSuppressed), "traits not disabled");
					}
					finally {
						await actor.update({ "system.traits.ci.value": [] });
						//@ts-expect-error
						if (game.release.generation > 11) {
							//@ts-expect-error
							await actor.toggleStatusEffect("paralyzed", { active: false });
							const theEffect = actor.effects.find(ef => ef.name === "Paralyzed");
							assert.ok(!theEffect, "Paralyzed not removed");
						}
						else {
							await ceInterface.removeEffect({ effectName: "Paralyzed", uuid: actor.uuid });
							assert.ok(!(await ceInterface.hasEffectApplied("Paralyzed", actor?.uuid)), "Paralyzed not removed");
						}
					}
				});
			});
		}, { displayName: "Midi Condition Immunity Tests" });
		globalThis.quench.registerBatch("quench.midi-qol.overTimeTests", (context) => {
			const { describe, it, assert } = context;
			describe("overTime effects", async function () {
				it("test overtime effect run and removed on combat update", async function () {
					this.timeout(20000);
					let scene = canvas?.scene;
					const cls = getDocumentClass("Combat");
					const combat = await cls.create({ scene: scene?.id, active: true }, { render: true });
					await combat?.startCombat();
					assert.ok(combat);
					const token = getToken(target2Name);
					assert.ok(token);
					const actor = token?.actor;
					assert.ok(actor);
					const createData = {
						tokenId: token?.id,
						sceneId: token?.scene.id,
						//@ts-ignore .actorId v10
						actorId: token?.document.actorId,
						//@ts-ignore
						hidden: token?.document.hidden
					};
					//@ts-ignore
					const hp = actor?.system.attributes.hp.value;
					await combat?.createEmbeddedDocuments("Combatant", [createData]);
					const effectData = {
						label: "test over time",
						changes: [{
								key: "flags.midi-qol.OverTime.Test", mode: 0, value: `turn=end,
			removeCondition=true,
			damageRoll=15,
			damageType=acid,
			label=OverTime test`
							}],
						duration: { rounds: 10 }
					};
					const theEffects = await actor?.createEmbeddedDocuments("ActiveEffect", [effectData]);
					assert.ok(theEffects?.length, "Effects created");
					// actor && console.error(foundry.utils.getProperty(actor, "data.flags.midi-qol.OverTime.Test"))
					assert.ok(actor && foundry.utils.getProperty(actor, "flags.midi-qol.OverTime.Test"), "overtime flag set");
					await combat?.nextRound();
					await busyWait(1);
					//@ts-ignore
					let newHp = actor?.system.attributes.hp.value;
					assert.equal(hp - 15, newHp, "verify hp deduction 1st");
					assert.equal(actor?.effects.contents.length, 0, "check effect is removed");
					await combat?.nextRound();
					await busyWait(1);
					//@ts-ignore
					newHp = actor?.system.attributes.hp.value;
					assert.equal(hp - 15, newHp, "verify hp deduction 2nd");
					await combat?.delete();
				});
			});
		}, { displayName: "Midi Over Time Tests" });
		globalThis.quench.registerBatch("quench.midi-qol.midi-qol.flagTests", (context) => {
			const { describe, it, assert } = context;
			describe("midi flag tests", async function () {
				it("sets advantage.all false", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const effectData = {
						label: "test effect",
						changes: [{ key: "flags.midi-qol.advantage.all", mode: 0, value: "false" }]
					};
					const theEffects = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
					assert.ok(foundry.utils.getProperty(actor, "flags.midi-qol.advantage.all") === false, "advantage all false");
					await actor.deleteEmbeddedDocuments("ActiveEffect", theEffects.map(ef => ef.id));
					assert.ok(foundry.utils.getProperty(actor, "flags.midi-qol.advantage.all") === undefined, "advantage all removed");
				});
				it("sets advantage.all 0", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const effectData = {
						label: "test effect",
						changes: [{ key: "flags.midi-qol.advantage.all", mode: 0, value: "0" }]
					};
					const theEffects = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
					assert.ok(foundry.utils.getProperty(actor, "flags.midi-qol.advantage.all") === false, "advantage all false");
					await actor.deleteEmbeddedDocuments("ActiveEffect", theEffects.map(ef => ef.id));
					assert.ok(foundry.utils.getProperty(actor, "flags.midi-qol.advantage.all") === undefined, "advantage all removed");
				});
				it("sets advantage.all true", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const effectData = {
						label: "test effect",
						changes: [{ key: "flags.midi-qol.advantage.all", mode: 0, value: "true" }]
					};
					const theEffects = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
					assert.ok(foundry.utils.getProperty(actor, "flags.midi-qol.advantage.all") === true, "advantage all set to true");
					await actor.deleteEmbeddedDocuments("ActiveEffect", theEffects.map(ef => ef.id));
					assert.ok(foundry.utils.getProperty(actor, "flags.midi-qol.advantage.all") === undefined, "advantage all removed");
				});
				it("sets advantage.all 1", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const effectData = {
						label: "test effect",
						changes: [{ key: "flags.midi-qol.advantage.all", mode: 0, value: "1" }]
					};
					const theEffects = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
					assert.ok(foundry.utils.getProperty(actor, "flags.midi-qol.advantage.all") === true, "advantage all set to true");
					await actor.deleteEmbeddedDocuments("ActiveEffect", theEffects.map(ef => ef.id));
					assert.ok(foundry.utils.getProperty(actor, "flags.midi-qol.advantage.all") === undefined, "advantage all removed");
				});
				it("sets DR.all", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const target = getToken(target2Name);
					if (!target || !actor) {
						assert.ok(false, "no target or actor");
						return;
					}
					let theEffects;
					let changeKey = "flags.midi-qol.DR.all";
					let changeValue = "10";
					let changeMode = CONST.ACTIVE_EFFECT_MODES.CUSTOM;
					if (configSettings.v3DamageApplication) {
						changeKey = "system.traits.dm.midi.all";
						changeValue = "-10";
						changeMode = CONST.ACTIVE_EFFECT_MODES.OVERRIDE;
					}
					const effectData = {
						label: "test effect",
						changes: [{ key: changeKey, mode: changeMode, value: changeValue }]
					};
					theEffects = await target?.actor?.createEmbeddedDocuments("ActiveEffect", [effectData]);
					assert.ok(["number", "string"].includes(typeof foundry.utils.getProperty(target.actor, changeKey)));
					assert.ok(Number.isNumeric(foundry.utils.getProperty(target.actor, changeKey)));
					const oldHp = foundry.utils.getProperty(target, "actor.system.attributes.hp.value");
					game.user?.updateTokenTargets([target?.id ?? ""]);
					await completeItemUse(actor.items.getName("AppliesDamage"), {}, { workflowOptions });
					console.warn("completeItemUse completed");
					game.user?.updateTokenTargets([]);
					const newHp = foundry.utils.getProperty(target, "actor.system.attributes.hp.value");
					assert.equal(newHp, oldHp - foundry.utils.getProperty(actor, "system.abilities.str.mod"));
					await target.actor?.deleteEmbeddedDocuments("ActiveEffect", theEffects?.map(ef => ef.id) ?? []);
					assert.ok([undefined, ""].includes(foundry.utils.getProperty(target.actor, changeKey)));
				});
				it("sets DR.rwak", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const target = getToken(target2Name);
					const oldHp = foundry.utils.getProperty(target, "actor.system.attributes.hp.value");
					game.user?.updateTokenTargets([target?.id ?? ""]);
					let changeKey = "flags.midi-qol.DR.rwak";
					let changeValue = "10";
					let changeMode = CONST.ACTIVE_EFFECT_MODES.CUSTOM;
					if (configSettings.v3DamageApplication) {
						changeKey = "system.traits.dm.midi.rwak";
						changeValue = "-10";
						changeMode = CONST.ACTIVE_EFFECT_MODES.OVERRIDE;
					}
					const effectData = {
						label: "test effect",
						changes: [{ key: changeKey, mode: changeMode, value: changeValue }]
					};
					let theEffects = await target.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
					assert.equal("number", typeof foundry.utils.getProperty(target.actor, changeKey));
					assert.ok(Number.isNumeric(foundry.utils.getProperty(target.actor, changeKey)));
					await completeItemUse(actor.items.getName("AppliesDamage"), {}, { workflowOptions });
					game.user?.updateTokenTargets([]);
					const newHp = target?.actor?.system.attributes.hp.value;
					//@ts-ignore
					assert.equal(newHp, oldHp - actor.system.abilities.str.mod);
					await target.actor.deleteEmbeddedDocuments("ActiveEffect", theEffects.map(ef => ef.id));
					assert.ok(foundry.utils.getProperty(target.actor, changeKey) === undefined);
				});
				it("sets DR.piercing", async function () {
					await resetActors();
					const actor = getActor(actor2Name);
					const target = getToken(target2Name);
					const oldHp = foundry.utils.getProperty(target, "actor.system.attributes.hp.value");
					game.user?.updateTokenTargets([target?.id ?? ""]);
					let changeKey = "flags.midi-qol.DR.piercing";
					let changeValue = "10";
					let changeMode = CONST.ACTIVE_EFFECT_MODES.CUSTOM;
					if (configSettings.v3DamageApplication) {
						changeKey = "system.traits.dm.amount.piercing";
						changeValue = "-10";
						changeMode = CONST.ACTIVE_EFFECT_MODES.OVERRIDE;
					}
					const effectData = {
						label: "test effect",
						changes: [{ key: changeKey, mode: changeMode, value: changeValue }]
					};
					let theEffects = await target.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
					assert.ok(Number.isNumeric(foundry.utils.getProperty(target.actor, changeKey)));
					await completeItemUse(actor.items.getName("AppliesDamage"), {}, { workflowOptions });
					game.user?.updateTokenTargets([]);
					const newHp = target?.actor?.system.attributes.hp.value;
					//@ts-ignore
					assert.equal(newHp, oldHp - actor.system.abilities.str.mod);
					await target.actor.deleteEmbeddedDocuments("ActiveEffect", theEffects.map(ef => ef.id));
					assert.ok(foundry.utils.getProperty(target.actor, changeKey) === undefined);
				});
			});
		}, { displayName: "Midi Flag Tests" });
		globalThis.quench.registerBatch("quench.midi-qol.midi-qol.otherTests", (context) => {
			const { describe, it, assert } = context;
			describe("midi other tests", async function () {
				it("tests applyTokenDamageMany", async function () {
					await resetActors();
					const token = getToken(target2Name);
					const oldHp = token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value");
					await applyTokenDamage([{ damage: 5, type: 'piercing' }], 5, new Set([token]), null, new Set(), {});
					assert.equal(token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value"), oldHp - 5);
					await applyTokenDamage([{ damage: 5, type: 'healing' }], 5, new Set([token]), null, new Set(), {});
					assert.equal(token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value"), oldHp);
				});
				it("tests applyTokenDamage reduction", async function () {
					await resetActors();
					const token = getToken(target2Name);
					const oldHp = token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value");
					let effectData = {
						label: "test effect",
						changes: [{ key: "flags.midi-qol.DR.all", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "5" }]
					};
					if (configSettings.v3DamageApplication) {
						effectData.changes = [{ key: "system.traits.dm.midi.all", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "-5" }];
					}
					;
					let theEffects = await token?.actor?.createEmbeddedDocuments("ActiveEffect", [effectData]);
					await applyTokenDamage([{ damage: 5, type: 'piercing' }], 5, new Set([token]), null, new Set(), {});
					assert.equal(token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value"), oldHp);
					//@ts-expect-error
					await token?.actor?.deleteEmbeddedDocuments("ActiveEffect", theEffects.map(ef => ef.id));
				});
				it("tests applyTokenDamage resistance", async function () {
					await resetActors();
					const token = getToken(target2Name);
					const oldHp = token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value");
					let effectData = {
						label: "test effect",
						changes: [{ key: "system.traits.dr.value", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "fire" }]
					};
					let theEffects = await token?.actor?.createEmbeddedDocuments("ActiveEffect", [effectData]);
					await applyTokenDamage([{ damage: 10, type: 'fire' }], 10, new Set([token]), null, new Set(), {});
					assert.equal(token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value"), oldHp - 5);
					//@ts-expect-error
					await token?.actor?.deleteEmbeddedDocuments("ActiveEffect", theEffects.map(ef => ef.id));
					await token?.actor?.update({ "system.attributes.hp.value": oldHp });
				});
				it("tests applyTokenDamage saves", async function () {
					await resetActors();
					const token = getToken(target2Name);
					const actor = getActor(actor1Name);
					const oldHp = token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value");
					const theItem = actor?.items.getName("Saving Throw Test");
					await applyTokenDamage([{ damage: 10, type: 'piercing' }], 10, new Set([token]), theItem, new Set([token]), {});
					assert.equal(token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value"), oldHp - 5);
					await actor?.update({ "system.attributes.hp.value": oldHp });
				});
				it("tests applyTokenDamage super saver (saved)", async function () {
					await resetActors();
					const token = getToken(target2Name);
					const actor = getActor(actor1Name);
					const oldHp = token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value");
					const theItem = actor?.items.getName("Saving Throw Test");
					await applyTokenDamage([{ damage: 10, type: 'piercing' }], 10, new Set([token]), theItem, new Set([token]), { superSavers: new Set([token]) });
					assert.equal(token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value"), oldHp);
					await actor?.update({ "system.attributes.hp.value": oldHp });
				});
				it("tests applyTokenDamage super saver (failed)", async function () {
					await resetActors();
					const token = getToken(target2Name);
					const actor = getActor(actor1Name);
					const oldHp = token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value");
					const theItem = actor?.items.getName("Saving Throw Test");
					await applyTokenDamage([{ damage: 10, type: 'piercing' }], 10, new Set([token]), theItem, new Set(), { superSavers: new Set([token]) });
					assert.equal(token && foundry.utils.getProperty(token, "actor.system.attributes.hp.value"), oldHp - 5);
					await actor?.update({ "system.attributes.hp.value": oldHp });
				});
			});
		}, { displayName: "Midi Other Tests" });
	}
}
/*
export async function testFormBuilder() {

const formBuilder = new FormBuilder();

// Play code tp test Portal.formBuilder
formBuilder.title("RPG Character Creation Form")
	// Character Info Tab
	.tab({ id: "character-info", icon: "fa-solid fa-user", label: "Character Info" })
	.text({ name: "character-name", label: "Character Name", hint: "Enter the character's name", value: "" })
	.select({
	name: "character-race", label: "Race", hint: "Select the character's race", value: "", options: {
		"human": "Human",
		"elf": "Elf",
		"dwarf": "Dwarf",
		"orc": "Orc"
	}
	})
	.select({
	name: "character-class", label: "Class", hint: "Select the character's class", value: "", options: {
		"warrior": "Warrior",
		"mage": "Mage",
		"rogue": "Rogue",
		"cleric": "Cleric"
	}
	})
	.number({ name: "character-age", label: "Age", hint: "Enter the character's age", value: 18, min: 0, max: 100, step: 1 })
	.color({ name: "character-color", label: "Favorite Color", hint: "Select the character's favorite color", value: "#000000" })
	.file({ name: "character-portrait", label: "Portrait", hint: "Upload the character's portrait", value: "" })

	// Abilities Tab
	.tab({ id: "abilities", icon: "fa-solid fa-dumbbell", label: "Abilities" })
	.fieldset({ legend: "Physical Abilities" })
	.number({ name: "strength", label: "Strength", hint: "Enter the strength value", value: 10, min: 0, max: 20, step: 1 })
	.number({ name: "dexterity", label: "Dexterity", hint: "Enter the dexterity value", value: 10, min: 0, max: 20, step: 1 })
	.fieldset()
	.fieldset({ legend: "Mental Abilities" })
	.number({ name: "intelligence", label: "Intelligence", hint: "Enter the intelligence value", value: 10, min: 0, max: 20, step: 1 })
	.number({ name: "wisdom", label: "Wisdom", hint: "Enter the wisdom value", value: 10, min: 0, max: 20, step: 1 })
	.fieldset()
	.fieldset({ legend: "Other Abilities" })
	.number({ name: "charisma", label: "Charisma", hint: "Enter the charisma value", value: 10, min: 0, max: 20, step: 1 })
	.number({ name: "luck", label: "Luck", hint: "Enter the luck value", value: 10, min: 0, max: 20, step: 1 })
	.fieldset()

	// Equipment Tab
	.tab({ id: "equipment", icon: "fa-solid fa-sword", label: "Equipment" })
	.multiSelect({
	name: "weapons", label: "Weapons", hint: "Select the character's weapons", value: [], options: {
		"sword": "Sword",
		"bow": "Bow",
		"dagger": "Dagger",
		"staff": "Staff"
	}
	})
	.multiSelect({
	name: "armor", label: "Armor", hint: "Select the character's armor", value: [], options: {
		"leather": "Leather Armor",
		"chainmail": "Chainmail Armor",
		"plate": "Plate Armor",
		"robe": "Robe"
	}
	})
	.multiSelect({
	name: "potions", label: "Potions", hint: "Select the character's potions", value: [], options: {
		"healing": "Healing Potion",
		"mana": "Mana Potion",
		"strength": "Strength Potion",
		"speed": "Speed Potion"
	}
	})

	// Randomize Button
	.button({ label: "Randomize", icon: "fas fa-d6", callback: function (e) { console.log(this, e); } });

const data = await formBuilder.render();

console.log(data);
}
*/ 
