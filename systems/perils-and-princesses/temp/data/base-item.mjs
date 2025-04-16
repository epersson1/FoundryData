import PNPDataModel from "./base-model.mjs";

export default class PNPItemBase extends PNPDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });

    // Break down roll formula into three independent fields
    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      diceSize: new fields.StringField({ initial: "d20" }),
    })

    schema.formula = new fields.StringField({ blank: true });
    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    const roll = this.roll;

    this.formula = `${roll.diceNum}${roll.diceSize}`
  }

  async toEmbed(config, options = {}) {
    console.log('toEmbed')
    const embed = document.createElement("div");
    const context = {}
    const abilityBody = await renderTemplate(systemPath("templates/item/embeds/ability.hbs"), context);
    embed.insertAdjacentHTML("beforeend", abilityBody);
    return embed;
  }

}