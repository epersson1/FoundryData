import PNPItemBase from "./base-item.mjs";

export default class PNPSpell extends PNPItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    return schema;
  }
}