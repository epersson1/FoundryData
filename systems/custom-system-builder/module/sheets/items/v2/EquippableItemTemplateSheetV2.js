/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { EquippableItemSheetV2 } from './EquippableItemSheetV2.js';
import { CustomItemSheetV2 } from './CustomItemSheetV2.js';
/**
 * Extend the basic EquippableItemSheetV2 with some very simple modifications
 * @ignore
 */
export class EquippableItemTemplateSheetV2 extends CustomItemSheetV2 {
    static DEFAULT_OPTIONS = {
        window: {
            controls: [
                {
                    label: 'CSB.TemplateActions.ConfigureSheetDisplay',
                    icon: 'fas fa-window',
                    action: 'configureSheetDisplay',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                {
                    label: 'CSB.TemplateActions.ConfigureHiddenAttributes',
                    icon: 'fas fa-eye-slash',
                    action: 'configureHiddenAttributes',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                {
                    label: 'CSB.Sheets.ConfigureItemModifier',
                    icon: 'fas fa-sliders',
                    action: 'configureItemModifier',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                    get visible() {
                        return EquippableItemSheetV2.canEditModifiers();
                    }
                },
                {
                    label: 'CSB.TemplateActions.ReloadItemSheet',
                    icon: 'fas fa-arrows-rotate',
                    action: 'reloadItemSheet',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                }
            ]
        },
        actions: {
            configureSheetDisplay: EquippableItemTemplateSheetV2.configureSheetDisplay,
            configureHiddenAttributes: EquippableItemTemplateSheetV2.configureHiddenAttributes,
            configureItemModifier: EquippableItemTemplateSheetV2.configureItemModifier,
            reloadItemSheet: EquippableItemTemplateSheetV2.reloadItemSheet
        }
    };
    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/item/v2/_equippableItemTemplate-sheet.hbs`;
            },
            classes: super.PARTS.form.classes
        }
    };
    static configureSheetDisplay(_event, _target) {
        void this.item.templateSystem.editDisplaySettings();
    }
    static configureHiddenAttributes(_event, _target) {
        void this.item.templateSystem.configureAttributes();
    }
    static configureItemModifier(_event, _target) {
        void this.item.templateSystem.configureModifiers();
    }
    static reloadItemSheet(_event, _target) {
        void this.item.templateSystem.reloadAllSheets();
    }
    /**
     * Render the inner application content
     * @private
     * @override
     * @ignore
     */
    async _renderHTML(context, options) {
        if (this.item.templateSystem.isModified) {
            await this.submit();
        }
        const form = (await super._renderHTML(context, options)).form;
        // Append built sheet to html
        if (context.headerPanel)
            form.querySelector('.custom-system-customHeader').append(context.headerPanel[0]);
        return { form };
    }
}
