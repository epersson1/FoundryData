export class OnUseMacros {
	items;
	constructor(onUseMacros = null) {
		if (typeof onUseMacros === "string") {
			this.items = onUseMacros?.split(',')?.filter((value) => value.trim().length > 0)?.map((macro) => new OnUseMacro(macro));
		}
		else {
			this.items = [];
		}
	}
	static parseParts(parts) {
		const macros = new OnUseMacros();
		parts.items?.forEach(x => macros.items.push(OnUseMacro.parsePart(x)));
		return macros;
	}
	getMacros(currentOption) {
		return this.items.filter(x => x.macroName?.length > 0 && (x.option.toLocaleLowerCase() === (currentOption ?? "").toLocaleLowerCase() || x.option === "all")).map(x => x.macroName).toString();
	}
	toString() {
		return this.items.map(m => m.toString()).join(',');
	}
}
export class OnUseMacro {
	macroName;
	option;
	macro = undefined;
	macroPassOptions = {};
	constructor(macro = undefined) {
		if (macro === undefined) {
			this.macroName = "ItemMacro";
		}
		else {
			const pattern = new RegExp('(?:\\[(?<option>.*?)\\])?(?<macroName>.*)', '');
			let data = macro.match(pattern)?.groups;
			this.macroName = data["macroName"].trim();
			this.option = data["option"];
		}
		this.option ??= "postActiveEffects";
	}
	static parsePart(parts) {
		const m = new OnUseMacro();
		m.macroName = parts.macroName;
		m.option = parts.option ?? m.option;
		return m;
	}
	toString() {
		return `[${this.option}]${this.macroName}`;
	}
}
export class OnUseMacroOptions {
	static options;
	static setOptions(options) {
		this.options = [];
		for (let option of Object.keys(options)) {
			this.options.push({ option, label: options[option] });
		}
	}
	static get getOptions() {
		return this.options;
	}
}
export function getCurrentSourceMacros(document) {
	const macroField = new OnUseMacros(foundry.utils.getProperty(document, "_source.flags.midi-qol.onUseMacroName") ?? null);
	// const macroField = foundry.utils.getProperty(object, "_source.flags.midi-qol.onUseMacroParts");
	return macroField;
}
