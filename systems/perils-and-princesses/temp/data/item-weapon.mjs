import PNPItemBase from "./base-item.mjs";

export default class PNPWeapon extends PNPItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.range = new fields.StringField({ initial: "Stone's Throw" })
    return schema
    }
}