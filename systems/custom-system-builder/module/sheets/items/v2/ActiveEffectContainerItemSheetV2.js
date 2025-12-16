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
export default class ActiveEffectContainerItemSheetV2 extends CustomItemSheetV2 {
    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/item/v2/activeEffectContainer-sheet.hbs`;
            },
            classes: super.PARTS.form.classes
        }
    };
}
