const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Form application that allows removing defaults for specific statuses.
 */
export default class DefaultCounterConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        id: "default-counter-config",
        position: {
            width: 420,
            height: "auto",
        },
        tag: "form",
        form: {
            handler: DefaultCounterConfig._removeDefaults,
            closeOnSubmit: true,
        },
        window: {
            icon: "fas fa-gear",
            title: "statuscounter.counterDefaults.name",
            contentClasses: ["standard-form"],
        },
    };

    /** @override */
    static PARTS = {
        main: {
            template: "modules/statuscounter/templates/defaultCounterConfig.hbs",
        },
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
    };

    /**
     * Prepares the display data of the dialog.
     * @returns {object} The data required for rendering the dialog.
     * @override
     */
    _prepareContext() {
        const defaults = game.settings.get("statuscounter", "counterDefaults");
        return {
            statuses: Object.keys(defaults).map(statusId => {
                const status = CONFIG.statusEffects.find(effect => effect.id === statusId);
                const label = status ? game.i18n.localize(status.name) : statusId;
                return {
                    statusId,
                    label,
                }
            }),
            buttons: [{
                type: "submit",
                icon: "fas fa-rotate-left",
                label: "statuscounter.counterDefaults.reset",
            }],
        };
    }

    /**
     * Removes default settings for the effects checked in the given form.
     * @param {FormDataExtended} formData The parsed data of the form.
     * @override
     */
    static _removeDefaults(_event, _form, formData) {
        const defaults = game.settings.get("statuscounter", "counterDefaults");
        for (const [statusId, remove] of Object.entries(formData.object)) {
            if (remove) delete defaults[statusId];
        }

        return game.settings.set("statuscounter", "counterDefaults", defaults);
    }
}
