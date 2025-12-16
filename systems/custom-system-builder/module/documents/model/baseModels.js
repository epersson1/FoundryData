/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { MODIFIER_OPERATOR } from '../../interfaces/Modifier.js';
/**
 * @ignore
 * @module
 */
const { SchemaField, ObjectField, NumberField, BooleanField, StringField, ArrayField } = foundry.data.fields;
export const DisplayModel = () => new SchemaField({
    width: new NumberField({ required: true, nullable: false }),
    height: new NumberField({ required: true, nullable: false }),
    fix_size: new BooleanField({ required: true, nullable: false }),
    pp_width: new NumberField({ required: true, nullable: false }),
    pp_height: new NumberField({ required: true, nullable: false })
}, {
    required: true,
    initial: () => {
        return {
            width: 600,
            height: 600,
            fix_size: false,
            pp_width: 64,
            pp_height: 64
        };
    }
});
export const BodyModel = () => new SchemaField({
    contents: new ArrayField(new ObjectField()),
    key: new StringField({ required: true }),
    type: new StringField({ required: true })
}, {
    required: true,
    initial: () => {
        return {
            contents: [],
            key: 'custom_body',
            type: 'panel'
        };
    }
});
export const HeaderModel = () => new SchemaField({
    contents: new ArrayField(new ObjectField()),
    key: new StringField({ required: true }),
    type: new StringField({ required: true })
}, {
    required: true,
    initial: () => {
        return {
            contents: [],
            key: 'custom_header',
            type: 'panel'
        };
    }
});
export const HiddenPropsModel = () => new ArrayField(new SchemaField({
    name: new StringField({ required: true }),
    value: new StringField({ required: true })
}));
export const ModifiersModel = () => new ArrayField(new SchemaField({
    id: new StringField({ required: true }),
    conditionalGroup: new StringField({ required: false }),
    priority: new NumberField({ required: true, nullable: false }),
    key: new StringField({ required: true }),
    operator: new StringField({ required: true, choices: Object.values(MODIFIER_OPERATOR) }),
    formula: new StringField({ required: true }),
    description: new StringField({ required: false })
}));
