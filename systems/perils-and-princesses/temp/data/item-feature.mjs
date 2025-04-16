import PNPItemBase from "./base-item.mjs";

export default class PNPFeature extends PNPItemBase {

    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();
    
        schema.innate = new fields.BooleanField({required: true, initial: true})
        schema.level = new fields.NumberField({required: true, initial: 1})
        return schema;
      }
}