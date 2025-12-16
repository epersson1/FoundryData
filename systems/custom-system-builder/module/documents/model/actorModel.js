/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { BodyModel, DisplayModel, HeaderModel, HiddenPropsModel, ModifiersModel } from './baseModels.js';
const { NumberField, StringField, BooleanField, ArrayField, ObjectField, SchemaField, TypedObjectField } = foundry.data.fields;
class AbstractActorDataModel extends foundry.abstract.TypeDataModel {
}
const defineTemplateActorDataModelSchema = () => ({
    body: BodyModel(),
    display: DisplayModel(),
    header: HeaderModel(),
    hidden: HiddenPropsModel(),
    templateSystemUniqueVersion: new NumberField({ required: false }),
    attributeBar: new TypedObjectField(new SchemaField({
        max: new StringField({ required: true }),
        value: new StringField({ required: true }),
        editable: new BooleanField({ required: true })
    }), {
        required: true
    }),
    statusEffects: new TypedObjectField(ModifiersModel(), {
        required: true
    })
});
export class TemplateActorDataModel extends AbstractActorDataModel {
    static defineSchema() {
        return defineTemplateActorDataModelSchema();
    }
}
const defineCharacterActorDataModelSchema = () => ({
    ...defineTemplateActorDataModelSchema(),
    template: new StringField({ required: false }),
    props: new ObjectField({
        required: true
    }),
    activeConditionalModifierGroups: new ArrayField(new StringField({ required: true }))
});
export class CharacterActorDataModel extends AbstractActorDataModel {
    static defineSchema() {
        return defineCharacterActorDataModelSchema();
    }
}
