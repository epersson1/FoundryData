import { MODULE_ID, i18n } from "../../midi-qol.js";
import { Workflow } from "../Workflow.js";
import { getCurrentSourceMacros, OnUseMacro, OnUseMacros } from "./Item.js";
var ApplicationV2 = foundry.applications.api.ApplicationV2;
import { onUseMacroOptions } from "../settings.js";
const { HandlebarsApplicationMixin } = foundry.applications.api;
export class ActorOnUseMacrosConfig extends HandlebarsApplicationMixin(ApplicationV2) {
	document;
	constructor(options) {
		super(options);
		this.document = options.document;
	}
	// old "form" "active-effect-sheet" "sheet"
	static PARTS = {
		dialog: {
			id: "dialog-onuse-config",
			classes: ["dialog", "active-effect-sheet", "midi-qol"],
			template: "modules/midi-qol/templates/actorOnUseMacrosConfig.hbs"
		}
	};
	// TODO: dragDrop? dropSelector .key
	static DEFAULT_OPTIONS = {
		window: {
			resizable: false,
			title: "midi-qol.ActorOnUseMacros"
		},
		position: {
			height: "auto",
			width: 550
		},
		form: {
			closeOnSubmit: false,
			submitOnClose: true
		},
		actions: {
			add: this.#onAddMacro,
			delete: this.#onDeleteMacro
		}
	};
	get isEditable() {
		if (this.document.pack) {
			const pack = game.packs?.get(this.document.pack);
			if (pack?.locked)
				return false;
		}
		return this.document.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
	}
	async _prepareContext(options) {
		let context = await super._prepareContext(options);
		context.onUseMacroName = foundry.utils.getProperty(this.document._source, "flags.midi-qol.onUseMacroName");
		if (context.onUseMacroName !== undefined)
			context.onUseMacroParts = new OnUseMacros(context.onUseMacroName);
		else
			context.onUseMacroParts = new OnUseMacros(null);
		context.MacroPassOptions = foundry.utils.mergeObject(onUseMacroOptions, Workflow.stateHooks);
		Object.keys(context.MacroPassOptions).forEach((k) => {
			context.MacroPassOptions[k] = i18n(context.MacroPassOptions[k]);
		});
		return context;
	}
	_onDragStart(ev) { }
	_onDrop(ev) {
		ev.preventDefault();
		const data = foundry.applications.ux.TextEditor.getDragEventData(ev);
		if (data.uuid)
			ev.target.value += data.uuid;
	}
	static async #onAddMacro() {
		if (!this.isEditable)
			return;
		const macros = getCurrentSourceMacros(this.document);
		const formMacros = Object.entries(new foundry.applications.ux.FormDataExtended(this.element.querySelector("form"))?.object) ?? [];
		for (const [k, v] of formMacros) {
			foundry.utils.setProperty(macros, k.split('.').slice(1).join('.'), v);
		}
		macros.items.push(new OnUseMacro(""));
		await this.document.setFlag(MODULE_ID, "onUseMacroName", macros.toString());
		this.render({ force: true });
	}
	static async #onDeleteMacro(event) {
		if (!this.isEditable)
			return;
		const macros = getCurrentSourceMacros(this.document);
		const formMacros = Object.entries(new foundry.applications.ux.FormDataExtended(this.element.querySelector("form"))?.object) ?? [];
		for (const [k, v] of formMacros) {
			foundry.utils.setProperty(macros, k.split('.').slice(1).join('.'), v);
		}
		const li = event.target.closest("[data-macroPart]");
		macros.items.splice(Number(li.dataset.macropart), 1);
		await this.document.setFlag(MODULE_ID, "onUseMacroName", macros.toString());
		this.render({ force: true });
	}
	async _preClose(options) {
		await super._preClose(options);
		const macros = getCurrentSourceMacros(this.document);
		const formMacros = Object.entries(new foundry.applications.ux.FormDataExtended(this.element.querySelector("form"))?.object) ?? [];
		for (const [k, v] of formMacros) {
			foundry.utils.setProperty(macros, k.split('.').slice(1).join('.'), v);
		}
		await this.document.setFlag(MODULE_ID, "onUseMacroName", macros.toString());
	}
}
