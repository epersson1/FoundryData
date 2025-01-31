/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { CustomActorSheet } from './actor-sheet.js';
/**
 * @ignore
 * @module
 */
/**
 * The character actor sheets
 * @extends {CustomActorSheet}
 */
export class CharacterSheet extends CustomActorSheet {
    constructor(actor, options) {
        options.resizable = !actor.system.display.fix_size;
        super(actor, options);
        this._hasBeenRenderedOnce = false;
    }
    render(force, options = {}) {
        if (!this._hasBeenRenderedOnce) {
            this.position.width = this.actor.system.display.width;
            this.position.height = this.actor.system.display.height;
            this._hasBeenRenderedOnce = true;
        }
        this.options.resizable = !this.actor.system.display.fix_size;
        let data = super.render(force, options);
        return data;
    }
}
