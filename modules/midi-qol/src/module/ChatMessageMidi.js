import { GameSystemConfig, MQDamageRollTypes, debugEnabled, i18n, log, warn } from "../midi-qol.js";
//import { chatDamageButtons } from "./chatMessageHandling.js";
import { addChatDamageButtons, configSettings } from "./settings.js";
import { getToken } from "./utils.js";
import { setDamageRollMinTerms } from "./activities/activityHelpers.js";
export function defineChatMessageMidiClass(baseClass) {
	return class ChatMessageMidi extends baseClass /*globalThis.dnd5e.documents.ChatMessage5e*/ {
		constructor(...args) {
			super(...args);
			if (debugEnabled > 1)
				log("Chat message midi constructor", ...args);
		}
		get isRoll() {
			if (this.flags?.["midi-qol"]?.messageType)
				return false; // do this so that dsn won't trigger
			return super.isRoll;
		}
		get hasRolls() {
			if (this.flags?.["midi-qol"].roll?.length > 0)
				return true;
			return super.isRoll;
		}
		// midi has it's own target handling so don't display the attack targets here
		_enrichAttackTargets(html) {
			return;
		}
		get canSelectTargets() {
			if (this.flags?.["midi-qol"]?.messageType === "attack")
				return true;
			return super.canSelectTargets;
		}
		get canApplyDamage() {
			if (this.flags?.["midi-qol"]?.damageDetail?.length > 0 && this.isContentVisible && !!canvas?.tokens?.controlled.length)
				return true;
			return super.canApplyDamage;
		}
		// Patch for getAssociatedItem not peparing data on items recovered from item.data
		getAssociatedItem() {
			const item = super.getAssociatedItem();
			if (this.flags.dnd5e?.item?.data) {
				item.prepareData();
				item.prepareFinalAttributes();
			}
			return item;
		}
		/**
	* Select the hit or missed targets.
	* @param {HTMLElement} li    The chat entry which contains the roll data.
	* @param {string} type       The type of selection ('hit' or 'miss').
	*/
		selectTargets(li, type) {
			if (!canvas?.ready)
				return;
			if (!foundry.utils.getProperty(this, "flags.midi-qol"))
				return super.selectTargets(li, type);
			const lis = li.closest("[data-message-id]").querySelectorAll(`.evaluation li.target.${type}`);
			let targetUuids = this.getFlag("midi-qol", "targetUuids") || [];
			let hitTargetUuids = this.getFlag("midi-qol", "hitTargetUuids") || [];
			let uuids;
			if (type === "hit")
				uuids = hitTargetUuids;
			else
				uuids = targetUuids.filter(uuid => !hitTargetUuids.includes(uuid));
			canvas.tokens?.releaseAll();
			uuids.forEach(uuid => {
				const token = getToken(uuid);
				if (!token?.actor || !game.user)
					return;
				if (token?.isVisible && token.actor.testUserPermission(game.user, "OWNER")) {
					token.control({ releaseOthers: false });
				}
			});
		}
		/**
	* Apply rolled dice damage to the token or tokens which are currently controlled.
	* This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
	*
	* @param {HTMLElement} li      The chat entry which contains the roll data
	* @param {number} multiplier   A damage multiplier to apply to the rolled damage.
	* @returns {Promise}
	*/
		applyChatCardDamage(li, multiplier) {
			const type = this.flags.dnd5e?.roll?.type;
			if (type !== undefined || !this.flags?.["midi-qol"])
				return super.applyChatCardDamage(li, multiplier);
			const rollsToCheck = this.rolls.filter(r => MQDamageRollTypes.includes(foundry.utils.getProperty(r, "options.midi-qol.rollType")));
			//@ts-expect-error
			const damages = game.system.dice.aggregateDamageRolls(rollsToCheck, { respectProperties: true }).map(roll => ({
				value: roll.total,
				type: roll.options.type,
				properties: new Set(roll.options.properties ?? [])
			}));
			if (canvas?.tokens) {
				return Promise.all(canvas.tokens.controlled.map(t => {
					//@ts-expect-error
					return t.actor?.applyDamage(damages, { multiplier, invertHealing: false, ignore: true });
				}));
			}
		}
		applyChatCardTemp(li) {
			if (!canvas?.tokens)
				return;
			const rollsToCheck = this.rolls.filter(r => MQDamageRollTypes.includes(foundry.utils.getProperty(r, "options.midi-qol.rollType")));
			const total = rollsToCheck.reduce((acc, roll) => acc + roll.total, 0);
			return Promise.all(canvas.tokens.controlled.map(t => {
				//@ts-expect-error
				return t.actor?.applyTempHP(total);
			}));
		}
		collectRolls(rollsToAccumulate, multiRolls = false) {
			let returns = [];
			let rolls = [];
			setDamageRollMinTerms(rollsToAccumulate);
			for (let i = 0; i < rollsToAccumulate.length; i++) {
				if (!multiRolls && i < rollsToAccumulate.length - 1) {
					continue;
				}
				else if (multiRolls)
					rolls = [rollsToAccumulate[i]];
				else
					rolls = rollsToAccumulate;
				//@ts-expect-error
				let { formula, total, breakdown } = game.system.dice.aggregateDamageRolls(rolls).reduce((obj, r) => {
					obj.formula.push(r.formula);
					obj.total += r.total;
					obj.breakdown.push(this._simplifyDamageRoll(r));
					return obj;
				}, { formula: [], total: 0, breakdown: [] });
				formula = formula.join(" ");
				formula = formula.replace(/^\s+\+\s+/, "");
				formula = formula.replaceAll(/  /g, " ");
				if (multiRolls) {
					foundry.utils.setProperty(rolls[0], "flags.midi-qol.breakdown", breakdown);
					foundry.utils.setProperty(rolls[0], "flags.midi-qol.total", total);
				}
				let formulaInToolTip = ["formula", "formulaadv"].includes(configSettings.rollAlternate);
				let hideDetails = this.author.isGM && !game.user?.isGM && (configSettings.hideRollDetails ?? "none") !== "none";
				let hideFormula = this.author.isGM && !game.user?.isGM && (configSettings.hideRollDetails ?? "none") !== "none";
				if (this.author.isGM && !game.user?.isGM && (configSettings.hideRollDetails ?? "none") !== "none") {
					switch (configSettings.hideRollDetails) {
						case "none":
							break;
						case "detailsDSN":
							break;
						case "details":
							break;
						case "d20Only":
							break;
						case "hitDamage":
							break;
						case "hitCriticalDamage":
							break;
						case "attackTotalOnly":
						case "d20AttackOnly":
							total = "Damage Roll";
							break;
						case "all":
							total = "Damage Roll";
							break;
					}
				}
				const roll = document.createElement("div");
				roll.classList.add("dice-roll");
				let tooltipContents = "";
				if (!hideDetails)
					tooltipContents = breakdown.reduce((str, { type, total, constant, dice }) => {
						const config = GameSystemConfig.damageTypes[type] ?? GameSystemConfig.healingTypes[type];
						return `${str}
			<section class="tooltip-part">
				<div class="dice">
				<ol class="dice-rolls">
					${dice.reduce((str, { result, classes }) => `
					${str}<li class="roll ${classes}">${result}</li>
					`, "")}
					${constant ? `
					<li class="constant"><span class="sign">${constant < 0 ? "-" : "+"}</span>${Math.abs(constant)}</li>
					` : ""}
				</ol>
				<div class="total">
					${config ? `<img src="${config.icon}" alt="${config.label}">` : ""}
					<span class="label">${config?.label ?? ""}</span>
					<span class="value">${total}</span>
				</div>
				</div>
			</section>
			`;
					}, "");
				let diceFormula = "";
				if (!hideFormula)
					diceFormula = `<div class="dice-formula">${formula}</div>`;
				roll.innerHTML = `
	<div class="dice-result">
	${formulaInToolTip ? "" : diceFormula}
		<div class="dice-tooltip-collapser">
		<div class="dice-tooltip">
			${formulaInToolTip ? diceFormula : ""}
			${tooltipContents}
		</div>
		</div>
		<h4 class="dice-total">${total}</h4>
	</div>
	`;
				returns.push(roll);
			}
			return returns;
		}
		_enrichDamageTooltip(rolls, html) {
			if (foundry.utils.getProperty(this, "flags.dnd5e.roll.type") !== undefined || !this.flags?.["midi-qol"])
				return super._enrichDamageTooltip(rolls, html);
			for (let rollType of MQDamageRollTypes) {
				const rollsToCheck = this.rolls.filter(r => foundry.utils.getProperty(r, "options.midi-qol.rollType") === rollType);
				let rType = "damage";
				if (rollType === "otherDamage")
					rType = "other-damage";
				else if (rollType === "bonusDamage")
					rType = "bonus-damage";
				if (rollsToCheck?.length) {
					html.querySelectorAll(`.midi-${rType}-roll`)?.forEach(el => el.remove());
					for (let roll of this.collectRolls(rollsToCheck, configSettings.mergeCardMultiDamage)) {
						roll.classList.add(`midi-${rType}-roll`);
						if (rType === "bonus-damage") {
							const flavor = document.createElement("div");
							const flavors = rollsToCheck.map(r => r.options.flavor ?? r.options.type);
							const bonusDamageFlavor = flavors.join(", ");
							flavor.classList.add("midi-bonus-damage-flavor");
							flavor.innerHTML = bonusDamageFlavor;
							html.querySelector(`.midi-qol-${rType}-roll`)?.appendChild(flavor);
						}
						html.querySelector(`.midi-qol-${rType}-roll`)?.appendChild(roll);
						if ((configSettings.hideRollDetails ?? "none") !== "none" && !game.user?.isGM && this.author.isGM) {
							html.querySelectorAll(".dice-roll").forEach(el => el.addEventListener("click", this.noDiceClicks.bind(this)));
						}
					}
				}
			}
			if (game.user?.isGM && configSettings.v3DamageApplication) {
				const shouldAddButtons = addChatDamageButtons === "both"
					|| (addChatDamageButtons === "gm" && game.user?.isGM)
					|| (addChatDamageButtons === "pc" && !game.user?.isGM);
				if (shouldAddButtons) {
					for (let dType of MQDamageRollTypes) {
						rolls = this.rolls.filter(r => foundry.utils.getProperty(r, "options.midi-qol.rollType") === dType);
						if (!rolls.length)
							continue;
						let damageApplication = document.createElement("damage-application");
						damageApplication.classList.add("dnd5e2");
						//@ts-expect-error
						damageApplication.damages = game.system.dice.aggregateDamageRolls(rolls, { respectProperties: true }).map(roll => ({
							value: roll.total,
							type: roll.options.type,
							properties: new Set(roll.options.properties ?? [])
						}));
						//@ts-expect-error
						foundry.utils.setProperty(damageApplication.damages, "flags.midi-qol.damageType", dType);
						html.querySelector(".message-content").appendChild(damageApplication);
					}
				}
			}
		}
		_highlightCriticalSuccessFailure(html) {
			if (!this.flags?.["midi-qol"])
				return super._highlightCriticalSuccessFailure(html);
			super._highlightCriticalSuccessFailure(html);
			for (let [index, d20Roll] of this.rolls.entries()) {
				const total = html.find(".dice-total")[index];
				if (!game.user?.isGM && configSettings.autoCheckHit === "whisper") {
					if (total.classList.contains("success"))
						total.classList.remove("success");
					if (total.classList.contains("failure"))
						total.classList.remove("failure");
					if (total.classList.contains("critical"))
						total.classList.remove("critical");
					if (total.classList.contains("fumble"))
						total.classList.remove("fumble");
				}
				else if (total && configSettings.highLightCriticalAttackOnly) {
					if (total.classList.contains("success"))
						total.classList.remove("success");
					if (total.classList.contains("failure"))
						total.classList.remove("failure");
				}
				else if (total && !configSettings.highlightSuccess) {
					if (total.classList.contains("success"))
						total.classList.remove("success");
					if (total.classList.contains("failure"))
						total.classList.remove("failure");
					if (total.classList.contains("critical"))
						total.classList.remove("critical");
					if (total.classList.contains("fumble"))
						total.classList.remove("fumble");
				}
			}
			return;
		}
		enrichAttackRolls(html) {
			if (!this.author.isGM || game.user?.isGM)
				return;
			const hitFlag = foundry.utils.getProperty(this, "flags.midi-qol.isHit");
			const hitString = hitFlag === undefined ? "" : hitFlag ? i18n("midi-qol.hits") : i18n("midi-qol.misses");
			let attackRollText;
			let removeFormula = (configSettings.hideRollDetails ?? "none") !== "none";
			switch (configSettings.hideRollDetails) {
				case "none":
					break;
				case "detailsDSN":
					break;
				case "details":
					break;
				case "d20Only":
					attackRollText = `(d20) ${this.rolls[0]?.terms[0].total ?? "--"}`;
					break;
				case "hitDamage":
					html.querySelectorAll(".midi-qol-attack-roll .dice-total")?.forEach(el => el.classList.remove("critical"));
					html.querySelectorAll(".midi-qol-attack-roll .dice-total")?.forEach(el => el.classList.remove("fumble"));
					attackRollText = hitString;
					break;
				case "hitCriticalDamage":
					attackRollText = hitString;
					break;
				case "attackTotalOnly":
					attackRollText = this.rolls[0]?.total ?? "--";
					break;
				case "d20AttackOnly":
					attackRollText = `(d20) ${this.rolls[0]?.terms[0].total ?? "--"}`;
					break;
				case "all":
					html.querySelectorAll(".midi-qol-attack-roll .dice-total")?.forEach(el => el.classList.remove("critical"));
					html.querySelectorAll(".midi-qol-attack-roll .dice-total")?.forEach(el => el.classList.remove("fumble"));
					attackRollText = "Attack Roll";
					break;
			}
			if (attackRollText)
				html.querySelectorAll(".midi-attack-roll .dice-total")?.forEach(el => el.innerHTML = attackRollText);
			if (this.author.isGM && !game.user?.isGM && removeFormula) {
				html.querySelectorAll(".midi-attack-roll .dice-formula")?.forEach(el => el.remove());
				html.querySelectorAll(".midi-attack-roll .dice-tooltip")?.forEach(el => el.remove());
				html.querySelectorAll(".dice-roll").forEach(el => el.addEventListener("click", this.noDiceClicks.bind(this)));
			}
		}
		_enrichChatCard(html) {
			if (!foundry.utils.getProperty(this, "flags.midi-qol.messageType"))
				return super._enrichChatCard(html);
			if (debugEnabled > 1)
				warn("Enriching chat card", this.id);
			this.enrichAttackRolls(html); // This has to run first to stop errors when ChatMessage5e._enrichDamageTooltip runs
			super._enrichChatCard(html);
			if (this.author.isGM && (configSettings.hideRollDetails ?? "none") !== "none" && !game.user?.isGM) {
				html.querySelectorAll(".dice-roll").forEach(el => el.addEventListener("click", this.noDiceClicks.bind(this)));
				html.querySelectorAll(".dice-tooltip").forEach(el => el.style.height = "0");
			}
			// Remove the hit miss check mark for non-gm players if required.
			// Because midi rolls are not marked as attack rolls
			if (!game.user?.isGM) {
				const hideAttackResult = (game.settings.get("dnd5e", "attackRollVisibility") === "none");
				if (hideAttackResult || configSettings.autoCheckHit !== "all") {
					html.querySelectorAll(".midi-attack-roll .dice-total .icons")?.forEach(el => el.remove());
				}
			}
		}
		noDiceClicks(event) {
			event.stopImmediatePropagation();
			return;
		}
	};
}
