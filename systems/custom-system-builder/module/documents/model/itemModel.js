/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { BodyModel, DisplayModel, HeaderModel, HiddenPropsModel, ModifiersModel } from './baseModels.js';
const { ObjectField, NumberField, StringField, BooleanField } = foundry.data.fields;
class AbstractItemDataModel extends foundry.abstract.TypeDataModel {
}
const defineBaseItemDataModelSchema = () => {
    return {
        body: BodyModel(),
        templateSystemUniqueVersion: new NumberField({ required: false }),
        uniqueId: new StringField({ required: false })
    };
};
export class BaseItemDataModel extends AbstractItemDataModel {
    static defineSchema() {
        return defineBaseItemDataModelSchema();
    }
}
const defineTemplateItemDataModelSchema = () => {
    return {
        ...defineBaseItemDataModelSchema(),
        display: DisplayModel(),
        header: HeaderModel(),
        hidden: HiddenPropsModel(),
        modifiers: ModifiersModel()
    };
};
export class TemplateItemDataModel extends AbstractItemDataModel {
    static defineSchema() {
        return defineTemplateItemDataModelSchema();
    }
}
const defineEquippableItemDataModelSchema = () => {
    return {
        ...defineTemplateItemDataModelSchema(),
        template: new StringField({ required: false }),
        props: new ObjectField({
            required: true
        }),
        container: new StringField({ required: false, nullable: true }),
        unique: new BooleanField({ required: false, nullable: true })
    };
};
export class EquippableItemDataModel extends AbstractItemDataModel {
    static defineSchema() {
        return defineEquippableItemDataModelSchema();
    }
}
