/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * @ignore
 * @module
 */
export class CustomToken extends TokenDocument {
    getBarAttribute(barName, options) {
        const barData = super.getBarAttribute(barName, options);
        if (barData) {
            const barAttribute = barData.attribute;
            const actor = this.actor;
            if (barAttribute.startsWith('attributeBar')) {
                const barDefinition = foundry.utils.getProperty(actor.system, barAttribute);
                barData.editable = barDefinition.editable;
            }
            else {
                const propValue = foundry.utils.getProperty(actor.system, barAttribute);
                if (propValue !== undefined) {
                    barData.editable = true;
                }
            }
        }
        return barData;
    }
}
