import { getCounterTypes } from "./counterTypes.js";
import { DurationType } from "./durationType.js";
import { getEffectId } from "./effectUtils.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Form application that implements counter configuration options.
 */
export default class CounterConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        id: "counter-config-{id}",
        position: {
            width: 420,
            height: "auto",
        },
        tag: "form",
        form: {
            handler: CounterConfig._updateCounter,
            closeOnSubmit: true,
        },
        window: {
            icon: "fas fa-gear",
            title: "statuscounter.config.title",
            contentClasses: ["standard-form"],
        },
        document: null,
        actions: {
            saveDefault: CounterConfig._updateDefaults,
        },
    };

    /** @override */
    static PARTS = {
        main: {
            template: "modules/statuscounter/templates/counterConfig.hbs",
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    };

    /**
     * @returns {ActiveEffect} The effect that is being configured.
     */
    get document() {
        return this.options.document;
    }

    /**
     * @returns {string} The title of the configuration dialog.
     * @override
     */
    get title() {
        return `${this.document.name}: ${game.i18n.localize(this.options.window.title)}`;
    }

    /** @inheritDoc */
    _initializeApplicationOptions(options) {
        options = super._initializeApplicationOptions(options);
        options.uniqueId = options.document.id;
        return options;
    }

    /**
     * Prepares the display data of the dialog.
     * @returns {object} The data required for rendering the dialog.
     * @override
     */
    _prepareContext() {
        const types = Object.entries(getCounterTypes()).reduce((types, [type, cls]) => {
            if (cls.allowType(this.document)) types[type] = cls.label;
            return types;
        }, {});

        const counterData = this.document._source.flags.statuscounter ?? { config: {} };
        counterData.config.dataSource ??= "flags.statuscounter.value";

        return {
            name: this.document.name,
            data: counterData,
            value: this.document.statusCounter._sourceValue ?? 1,
            durationTypes: Object.entries(DurationType).reduce((durationTypes, [key, value]) => {
                durationTypes[value] = game.i18n.localize(`statuscounter.config.durationType.${key.toLowerCase()}`);
                return durationTypes;
            }, {}),
            types,
            showTypes: Object.keys(types).length > 1,
            buttons: [
                {
                    type: "button",
                    action: "saveDefault",
                    icon: "fas fa-floppy-disk-circle-arrow-right",
                    label: game.i18n.format("statuscounter.config.saveDefault", { status: this.document.name }),
                },
                {
                    type: "submit",
                    icon: "fas fa-save",
                    label: "statuscounter.config.save",
                },
            ],
        };
    }

    /**
     * Updates the associated effect with the form data settings.
     * @param {FormDataExtended} formData The parsed data of the form.
     * @returns {Promise} A promise representing the update operation.
     * @override
     */
    static _updateCounter(_event, _form, formData) {
        const formValues = formData.object;
        const dataSource = this.document._source.flags.statuscounter.config.dataSource ?? "flags.statuscounter.value";
        const value = formValues[dataSource] ?? 0;
        const visible = value > 1 || game.settings.get("statuscounter", "displayOne") === "always";
        formValues["flags.statuscounter.visible"] = visible;
        return this.document.update(formValues);
    }

    /**
     * Updates the default configuration for the associated effect with the form data settings.
     * @returns {Promise} A promise representing the settings update.
     */
    static async _updateDefaults() {
        const id = getEffectId(this.document);
        if (!id) return;

        const submitData = new foundry.applications.ux.FormDataExtended(this.form);
        const data = foundry.utils.expandObject(submitData.object).flags.statuscounter.config;
        const defaults = game.settings.get("statuscounter", "counterDefaults");
        defaults[id] = data;
        await game.settings.set("statuscounter", "counterDefaults", defaults);
        await this.submit();
        if (this.options.form.closeOnSubmit) await this.close({ submitted: true });
    }
}
