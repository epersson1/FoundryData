/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import CustomItem from '../../../documents/CustomItem.js';
import { isBaseSheetTemplateEntity } from '../../../definitions.js';
//@ts-expect-error types too deep
export class CustomItemSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin((foundry.applications.sheets.ItemSheetV2)) {
    static DEFAULT_OPTIONS = {
        form: {
            submitOnChange: true
        },
        classes: ['custom-system', 'sheet', 'item', 'item-v2'],
        actions: {
            editImage: this.onEditImage
        }
    };
    static PARTS = {
        form: {
            get template() {
                throw new Error('Should not use this class directly');
            },
            classes: ['custom-system-item-content']
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
        void fp.render({ force: true });
    }
    static canEditModifiers() {
        return game.user.hasRole(game.settings.get(game.system.id, 'minimumRoleEditItemModifiers'));
    }
    hasBeenRenderedOnce = false;
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
        const sheetData = await this.item.templateSystem.getSheetData();
        const isDefaultImg = context.document.img === CustomItem.DEFAULT_IMG(context.document.type);
        return {
            ...context,
            ...sheetData,
            isEditable: this.isEditable,
            isDefaultImg
        };
    }
    /**
     * @override
     * @ignore
     */
    async render(options, trueOptions) {
        if (options === undefined || typeof options === 'boolean')
            options = Object.assign(trueOptions ?? {}, { force: options });
        if (isBaseSheetTemplateEntity(this.item)) {
            options.position = {
                ...options.position,
                width: this.hasBeenRenderedOnce ? this.position.width : this.item.system.display.width,
                height: this.hasBeenRenderedOnce ? this.position.height : this.item.system.display.height
            };
            this.options.window.resizable = !this.item.system.display?.fix_size;
            this.hasBeenRenderedOnce = true;
        }
        if (CustomItem.isEquippableItem(this.item) && this.item.system.container) {
            const parentCollection = this.item.getParentCollection();
            const container = parentCollection.get(this.item.system.container);
            void container.prepareData();
            void container.render(false);
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
        this.item.templateSystem.activateListeners($(this.element));
    }
}
