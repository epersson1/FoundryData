/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * @ignore
 * @module
 */
import { CustomItemSheetV2 } from './CustomItemSheetV2.js';
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @ignore
 */
export class SubTemplateItemSheetV2 extends CustomItemSheetV2 {
    static DEFAULT_OPTIONS = {
        classes: ['subtemplate']
    };
    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/item/v2/subTemplate-sheet.hbs`;
            },
            classes: super.PARTS.form.classes
        }
    };
}
