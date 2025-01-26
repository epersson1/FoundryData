var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
	if (kind === "m") throw new TypeError("Private method is not writable");
	if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
	if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
	return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _FormBuilder_instances, _FormBuilder_tabs, _FormBuilder_fields, _FormBuilder_buttons, _FormBuilder_options, _FormBuilder_currentTab, _FormBuilder_currentFieldset, _FormBuilder_object, _FormBuilder_app, _FormBuilder_addField, _FormHelper_instances, _a, _FormHelper_fields, _FormHelper_buttons, _FormHelper_info, _FormHelper_getTabs, _FormHelper_onSubmit;
const MODULE_ID = "midi-qol";
const PARTIAL_KEY = "6uy8g1tXqHlhlp65dhiL-genericFormHelper-" + MODULE_ID;
export class FormBuilder {
	constructor() {
		_FormBuilder_instances.add(this);
		_FormBuilder_tabs.set(this, []);
		_FormBuilder_fields.set(this, []);
		_FormBuilder_buttons.set(this, []);
		_FormBuilder_options.set(this, {
			position: {
				width: 560,
				height: "auto",
			},
			window: {},
		});
		_FormBuilder_currentTab.set(this, null);
		_FormBuilder_currentFieldset.set(this, null);
		_FormBuilder_object.set(this, null);
		_FormBuilder_app.set(this, null);
		this.submitButton();
	}
	get app() {
		return __classPrivateFieldGet(this, _FormBuilder_app, "f");
	}
	async render() {
		const app = this.form();
		app.render(true);
		return app.promise;
	}
	form() {
		if (__classPrivateFieldGet(this, _FormBuilder_app, "f"))
			return __classPrivateFieldGet(this, _FormBuilder_app, "f");
		const app = new FormHelper({ tabs: __classPrivateFieldGet(this, _FormBuilder_tabs, "f"), fields: __classPrivateFieldGet(this, _FormBuilder_fields, "f"), buttons: __classPrivateFieldGet(this, _FormBuilder_buttons, "f"), options: __classPrivateFieldGet(this, _FormBuilder_options, "f") });
		__classPrivateFieldSet(this, _FormBuilder_app, app, "f");
		return app;
	}
	getHTML() {
		const app = this.form();
		const data = app._prepareContext();
		FormHelper.registerPartial();
		return renderTemplate(PARTIAL_KEY, data);
	}
	getAsClass(options) {
		const classData = { ...options, tabs: __classPrivateFieldGet(this, _FormBuilder_tabs, "f"), fields: __classPrivateFieldGet(this, _FormBuilder_fields, "f"), buttons: __classPrivateFieldGet(this, _FormBuilder_buttons, "f"), options: __classPrivateFieldGet(this, _FormBuilder_options, "f") };
		return class extends FormHelper {
			constructor(data = {}) {
				super({ ...classData, ...data });
			}
		};
	}
	registerAsMenu({ moduleId, key, name, label, icon, hint, scope, restricted, defaultValue, onChange, requiresReload } = {}) {
		moduleId ?? (moduleId = MODULE_ID);
		scope ?? (scope = "world");
		restricted ?? (restricted = true);
		defaultValue ?? (defaultValue = {});
		key ?? (key = "settings");
		icon ?? (icon = "fas fa-cogs");
		label ?? (label = "Configure");
		name ?? (name = "Configuration Menu");
		hint ?? (hint = "Configure the module settings");
		const menuOptions = {
			settingsMenu: {
				requiresReload,
				onChange,
				moduleId,
				key
			}
		};
		const cls = this.getAsClass(menuOptions);
		game.settings.registerMenu(moduleId, key + "-menu", {
			name,
			label,
			hint,
			icon,
			scope,
			restricted,
			type: cls,
		});
		game.settings.register(moduleId, key, {
			scope,
			config: false,
			default: defaultValue,
			type: Object,
			onChange,
			requiresReload,
		});
		return {
			getSetting: () => game.settings.get(moduleId, key),
			setSetting: (value) => game.settings.set(moduleId, key, value),
		};
	}
	async insertHTML(element, selector, insertion = "afterend") {
		const html = await this.getHTML();
		const tempEl = document.createElement("div");
		tempEl.innerHTML = html;
		const insertionEl = tempEl.children[0];
		const el = selector ? element.querySelector(selector) : element;
		if (!el)
			throw new Error(`Element ${selector} not found`);
		el.insertAdjacentElement(insertion, insertionEl);
		return insertionEl;
	}
	title(title) {
		__classPrivateFieldGet(this, _FormBuilder_options, "f").window.title = title;
		return this;
	}
	resizable(resizable = true) {
		__classPrivateFieldGet(this, _FormBuilder_options, "f").window.resizable = resizable;
		return this;
	}
	info(info) {
		__classPrivateFieldGet(this, _FormBuilder_options, "f").info = info;
		return this;
	}
	object(object) {
		__classPrivateFieldSet(this, _FormBuilder_object, object, "f");
		return this;
	}
	size({ width, height }) {
		__classPrivateFieldGet(this, _FormBuilder_options, "f").position = {
			width: width ?? 560,
			height: height ?? "auto",
		};
		return this;
	}
	submitButton({ enabled = true, label = "Confirm", icon = "fa-solid fa-check" } = {}) {
		const submitButton = {
			type: "submit",
			action: "submit",
			icon,
			label,
		};
		if (!enabled)
			__classPrivateFieldSet(this, _FormBuilder_buttons, __classPrivateFieldGet(this, _FormBuilder_buttons, "f").filter((b) => b.action !== "submit"), "f");
		else
			__classPrivateFieldGet(this, _FormBuilder_buttons, "f").push(submitButton);
		return this;
	}
	tab({ id, group = "sheet", icon, label, active = false } = {}) {
		group ?? (group = "sheet");
		if (!id && __classPrivateFieldGet(this, _FormBuilder_currentTab, "f")) {
			__classPrivateFieldSet(this, _FormBuilder_currentTab, null, "f");
			return this;
		}
		if (!id)
			throw new Error("You must provide an id for the tab");
		const tab = {
			id,
			group,
			icon,
			label,
			active,
			fields: [],
		};
		__classPrivateFieldGet(this, _FormBuilder_tabs, "f").push(tab);
		__classPrivateFieldSet(this, _FormBuilder_currentTab, tab, "f");
		return this;
	}
	fieldset({ legend } = {}) {
		if (!legend && __classPrivateFieldGet(this, _FormBuilder_currentFieldset, "f")) {
			__classPrivateFieldSet(this, _FormBuilder_currentFieldset, null, "f");
			return this;
		}
		if (!legend)
			throw new Error("You must provide a legend for the fieldset");
		const fieldset = {
			legend,
			fieldset: true,
			fields: [],
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, fieldset);
		__classPrivateFieldSet(this, _FormBuilder_currentFieldset, fieldset, "f");
		return this;
	}
	html(html) {
		const field = {
			html,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	text({ name, label, hint, value }) {
		const field = {
			field: new foundry.data.fields.StringField(),
			name,
			label,
			hint,
			value,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	number({ name, label, hint, value, min, max, step }) {
		const field = {
			field: new foundry.data.fields.NumberField(),
			name,
			label,
			hint,
			value,
			min,
			max,
			step,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	checkbox({ name, label, hint, value }) {
		const field = {
			field: new foundry.data.fields.BooleanField(),
			name,
			label,
			hint,
			value,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	color({ name, label, hint, value }) {
		const field = {
			field: new foundry.data.fields.ColorField(),
			name,
			label,
			hint,
			value,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	file({ name, type = "imagevideo", label, hint, value }) {
		type ?? (type = "imagevideo");
		const types = FILE_PICKER_TYPES[type];
		const dataField = new foundry.data.fields.FilePathField({ categories: types });
		dataField.categories = [type];
		const field = {
			field: dataField,
			name,
			label,
			hint,
			type,
			value,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	select({ name, label, hint, value, options }) {
		const dType = inferSelectDataType(options);
		const field = {
			field: dType === Number ? new foundry.data.fields.NumberField({ choices: options }) : new foundry.data.fields.StringField({ choices: options }),
			name,
			label,
			hint,
			value,
			options,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	multiSelect({ name, label, hint, value, options }) {
		const dType = inferSelectDataType(options);
		const dataField = dType === Number ? new foundry.data.fields.NumberField({ choices: options }) : new foundry.data.fields.StringField({ choices: options });
		const field = {
			field: new foundry.data.fields.SetField(dataField),
			name,
			label,
			hint,
			value,
			options,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	editor({ name, label, hint, value }) {
		const field = {
			field: new foundry.data.fields.HTMLField(),
			name,
			label,
			hint,
			value,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	textArea({ name, label, hint, value }) {
		const field = {
			field: new foundry.data.fields.JSONField(),
			name,
			label,
			hint,
			value,
			stacked: true,
		};
		__classPrivateFieldGet(this, _FormBuilder_instances, "m", _FormBuilder_addField).call(this, field);
		return this;
	}
	button({ label, action = "submit", icon, callback }) {
		action ?? (action = foundry.utils.randomID());
		const button = {
			action,
			type: "button",
			icon,
			label,
			callback,
		};
		__classPrivateFieldGet(this, _FormBuilder_buttons, "f").push(button);
		return this;
	}
}
_FormBuilder_tabs = new WeakMap(), _FormBuilder_fields = new WeakMap(), _FormBuilder_buttons = new WeakMap(), _FormBuilder_options = new WeakMap(), _FormBuilder_currentTab = new WeakMap(), _FormBuilder_currentFieldset = new WeakMap(), _FormBuilder_object = new WeakMap(), _FormBuilder_app = new WeakMap(), _FormBuilder_instances = new WeakSet(), _FormBuilder_addField = function _FormBuilder_addField(field) {
	if (__classPrivateFieldGet(this, _FormBuilder_object, "f") && field.name) {
		const objectValue = foundry.utils.getProperty(__classPrivateFieldGet(this, _FormBuilder_object, "f"), field.name);
		if (objectValue !== undefined)
			field.value = objectValue;
	}
	if (__classPrivateFieldGet(this, _FormBuilder_currentFieldset, "f"))
		return __classPrivateFieldGet(this, _FormBuilder_currentFieldset, "f").fields.push(field);
	if (__classPrivateFieldGet(this, _FormBuilder_currentTab, "f"))
		return __classPrivateFieldGet(this, _FormBuilder_currentTab, "f").fields.push(field);
	return __classPrivateFieldGet(this, _FormBuilder_fields, "f").push(field);
};
const FILE_PICKER_TYPES = {
	imagevideo: ["IMAGE", "VIDEO"],
	image: ["IMAGE"],
	video: ["VIDEO"],
	audio: ["AUDIO"],
	font: ["FONT"],
	graphics: ["GRAPHICS"],
};
function inferSelectDataType(options) {
	const values = Object.keys(options);
	try {
		const isNumber = values.every((v) => {
			const n = JSON.parse(v);
			return typeof n === "number";
		});
		if (isNumber)
			return Number;
	}
	catch (e) {
		return String;
	}
	return String;
}
export class FormHelper extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
	constructor(data) {
		const actions = {};
		data.buttons.forEach((b) => (actions[b.action] = b.callback));
		super({ actions, ...data.options });
		_FormHelper_instances.add(this);
		_FormHelper_fields.set(this, void 0);
		_FormHelper_buttons.set(this, void 0);
		_FormHelper_info.set(this, void 0);
		FormHelper.registerPartial();
		this.menu = data.settingsMenu;
		this.resolve;
		this.reject;
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
		__classPrivateFieldSet(this, _FormHelper_info, data.options.info, "f");
		this.processFormStructure(data);
	}
	static registerPartial() {
		if (Handlebars.partials[PARTIAL_KEY])
			return;
		const compiledTemplate = Handlebars.compile(GENERIC_FORM_HBS);
		Handlebars.registerPartial(PARTIAL_KEY, compiledTemplate);
	}
	processFormStructure(data) {
		const currentSetting = this.menu ? game.settings.get(this.menu.moduleId, this.menu.key) : {};
		const isMenu = !!this.menu;
		if (data.tabs?.length) {
			this.__tabs = {};
			const active = data.tabs.find((t) => t.active);
			if (!active)
				data.tabs[0].active = true;
			for (const tab of data.tabs) {
				this.__tabs[tab.id] = {
					id: tab.id,
					group: tab.group,
					icon: tab.icon,
					label: tab.label,
					active: tab.active ?? false,
					fields: tab.fields ?? [],
				};
				if (isMenu) {
					const fields = tab.fields ?? [];
					for (const field of fields) {
						const settingValue = foundry.utils.getProperty(currentSetting, field.name);
						if (settingValue !== undefined)
							field.value = settingValue;
					}
				}
			}
		}
		if (isMenu) {
			const fields = data.fields ?? [];
			for (const field of fields) {
				const settingValue = foundry.utils.getProperty(currentSetting, field.name);
				if (settingValue !== undefined)
					field.value = settingValue;
			}
		}
		__classPrivateFieldSet(this, _FormHelper_fields, data.fields ?? [], "f");
		__classPrivateFieldSet(this, _FormHelper_buttons, data.buttons ?? [], "f");
	}
	_onClose(options) {
		super._onClose(options);
		if (!this.promise.resolved)
			this.resolve(false);
	}
	_prepareContext(options) {
		return {
			tabs: __classPrivateFieldGet(this, _FormHelper_instances, "m", _FormHelper_getTabs).call(this),
			fields: __classPrivateFieldGet(this, _FormHelper_fields, "f"),
			info: __classPrivateFieldGet(this, _FormHelper_info, "f"),
			buttons: [...__classPrivateFieldGet(this, _FormHelper_buttons, "f").filter((b) => b.type !== "submit"), ...__classPrivateFieldGet(this, _FormHelper_buttons, "f").filter((b) => b.type === "submit")],
		};
	}
	_onRender(context, options) {
		super._onRender(context, options);
		if (!this.__tabs) {
			this.element.querySelector("nav").classList.add("hidden");
		}
	}
	changeTab(...args) {
		super.changeTab(...args);
	}
	_onChangeForm(formConfig, event) {
		super._onChangeForm(formConfig, event);
		const formData = new FormDataExtended(this.element);
	}
	getFormData() {
		const formData = new FormDataExtended(this.element);
		return foundry.utils.expandObject(formData.object);
	}
}
_a = FormHelper, _FormHelper_fields = new WeakMap(), _FormHelper_buttons = new WeakMap(), _FormHelper_info = new WeakMap(), _FormHelper_instances = new WeakSet(), _FormHelper_getTabs = function _FormHelper_getTabs() {
	const tabs = this.__tabs ?? {};
	for (const v of Object.values(tabs)) {
		v.cssClass = v.active ? "active" : "";
		if (v.active)
			break;
	}
	return tabs;
}, _FormHelper_onSubmit = async function _FormHelper_onSubmit(event, form, formData) {
	const data = foundry.utils.expandObject(formData.object);
	this.resolve(data);
	if (this.menu) {
		if (this.menu.requiresReload)
			SettingsConfig.reloadConfirm();
		if (this.menu.onChange)
			this.menu.onChange(data);
		return game.settings.set(this.menu.moduleId, this.menu.key, data);
	}
};
FormHelper.DEFAULT_OPTIONS = {
	classes: ["form-helper"],
	tag: "form",
	window: {
		contentClasses: ["standard-form"],
	},
	position: {
		width: 560,
		height: "auto",
	},
	form: {
		handler: __classPrivateFieldGet(_a, _a, "m", _FormHelper_onSubmit),
		closeOnSubmit: true,
	},
	actions: {},
};
FormHelper.PARTS = {
	tabs: {
		template: "templates/generic/tab-navigation.hbs",
	},
	genericForm: {
		template: PARTIAL_KEY,
		classes: ["standard-form"],
	},
	footer: {
		template: "templates/generic/form-footer.hbs",
	},
};
const FIELD_INNER_HBS = `
	{{#if field.fieldset}}
	<fieldset>
		<legend>{{localize field.legend}}</legend>
		{{#each field.fields as |f|}}
		{{#if f.html}}{{{f.html}}}{{else}}
		{{formField f.field stacked=f.stacked type=f.type label=f.label hint=f.hint name=f.name value=f.value min=f.min max=f.max step=f.step localize=true}}
		{{/if}}
		{{/each}}
	</fieldset>
	{{else}}
	{{#if field.html}}{{{field.html}}}{{else}}
	{{formField field.field stacked=field.stacked type=field.type label=field.label hint=field.hint name=field.name value=field.value min=field.min max=field.max step=field.step localize=true}}
	{{/if}}
	{{/if}}
		`;
const GENERIC_FORM_HBS = `<div class="scrollable" style="max-height: 70vh;">
	{{#if info}}{{{info}}}{{/if}}
	{{#each tabs as |tab|}}

	<section class="tab standard-form scrollable {{tab.cssClass}}" data-tab="{{tab.id}}" data-group="{{tab.group}}">
		{{#each tab.fields as |field|}}
		${FIELD_INNER_HBS}
		{{/each}}
	</section>

	{{/each}}

	{{#each fields as |field|}}
	${FIELD_INNER_HBS}
	{{/each}}
</div>`;
export default FormBuilder;
