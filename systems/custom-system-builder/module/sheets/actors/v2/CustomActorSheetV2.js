/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import CustomActor from '../../../documents/CustomActor.js';
/**
 * Extend the basic ActorSheet
 * @abstract
 */
//@ts-expect-error Types too deep
export class CustomActorSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin((foundry.applications.sheets.ActorSheetV2)) {
    static DEFAULT_OPTIONS = {
        form: {
            submitOnChange: true
        },
        classes: ['custom-system', 'sheet', 'actor', 'actor-v2'],
        actions: {
            editImage: this.onEditImage
        }
    };
    static PARTS = {
        form: {
            get template() {
                return '';
            },
            classes: ['custom-system-actor-content']
        }
    };
    static async onEditImage(_event, target) {
        const field = target.dataset.field || 'img';
        const current = foundry.utils.getProperty(this.document, field);
        const fp = new foundry.applications.apps.FilePicker.implementation({
            type: 'image',
            current: current,
            callback: (path) => {
                void this.document.update({ [field]: path });
            }
        });
        await fp.render({ force: true });
    }
    /* -------------------------------------------- */
    hasBeenRenderedOnce = false;
    constructor(options) {
        super(options);
        this.options.window.resizable = !this.document.system.display?.fix_size;
    }
    /** @inheritDoc */
    _initializeApplicationOptions(options) {
        options = super._initializeApplicationOptions(options);
        if (options.document.system.template) {
            options.classes.push(options.document.system.template);
        }
        if (options.document.id) {
            options.classes.push(options.document.id);
        }
        if (options.document.type) {
            options.classes.push(options.document.type);
        }
        return options;
    }
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const sheetData = await this.actor.templateSystem.getSheetData();
        const isDefaultImg = context.document.img === CustomActor.DEFAULT_IMG(context.document.type);
        return { ...context, ...sheetData, isDefaultImg };
    }
    async render(options, trueOptions) {
        if (options === undefined || typeof options === 'boolean')
            options = Object.assign(trueOptions ?? {}, { force: options });
        if (CustomActor.isCharacterActor(this.actor) || CustomActor.isTemplateActor(this.actor)) {
            options.position = {
                ...options.position,
                width: this.hasBeenRenderedOnce ? this.position.width : this.actor.system.display.width,
                height: this.hasBeenRenderedOnce ? this.position.height : this.actor.system.display.height
            };
            this.options.window.resizable = !this.actor.system.display?.fix_size;
            this.hasBeenRenderedOnce = true;
        }
        return super.render(options);
    }
    /**
     * Render the inner application content
     * @private
     * @override
     * @ignore
     */
    async _renderHTML(context, options) {
        const form = (await super._renderHTML(context, options)).form;
        // Append built sheet to html
        if (context.headerPanel)
            form.querySelector('.custom-system-customHeader').append(context.headerPanel[0]);
        if (context.bodyPanel)
            form.querySelector('.custom-system-customBody').append(context.bodyPanel[0]);
        return { form };
    }
    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.actor.templateSystem.activateListeners($(this.element));
    }
}
