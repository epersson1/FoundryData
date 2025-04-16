import PNPActorBase from "./base-actor.mjs";

export default class PNPCharacter extends PNPActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Attributes Section
    schema.attributes = new fields.SchemaField({
        level: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 , max: 4})
        }),
        heartDice: new fields.ArrayField(
          new fields.BooleanField({ required: true }), // Store whether each die is used
          { initial: [] } // Start as an empty array
        ),
        giftDice: new fields.ArrayField(
          new fields.BooleanField({required: true}), // Store whether each die is used
          { initial: [] }
        ),
        trauma: new fields.ArrayField(
          new fields.BooleanField({ required: true}), //Store number of trauma points
          { initial: [false, false, false]}
        )
    });

    // Abilities Section: Each ability has a value and an ailment boolean
    schema.abilities = new fields.SchemaField(Object.keys(CONFIG.PNP.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
            ailment: new fields.BooleanField({ initial: false }),  // Ailment status
            ailmentName: new fields.StringField({ initial: CONFIG.PNP.ailments[ability] || "" }) // Name of ailment
        });
        return obj;
    }, {}));

    // Basic Character Information
    schema.kingdom = new fields.StringField({ required: true, blank: true });
    schema.pronouns = new fields.StringField({ required: true, blank: true });
    schema.money = new fields.NumberField({ required: true, blank: true, initial: 0});
    schema.curses = new fields.StringField({ required: true, blank: true });

    // Skills: Selecting 5 skills from a predefined list
    schema.skills = new fields.ArrayField(
        new fields.StringField({ required: true }),
        { initial: [], maxSize: 5 } // Store up to 5 selected skills
    );

    return schema;
}


  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      // this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.PNP.abilities[key]) ?? key;
    }
    // Dynamically generate heart dice array based on level
    const level = this.attributes.level.value || 1;
    // Ensure heartDice array matches the level size
    if (!Array.isArray(this.attributes.heartDice)) {
        this.attributes.heartDice = [];
    }
    // If too short, fill with `false` (unused heart dice)
    while (this.attributes.heartDice.length < level) {
      this.attributes.heartDice.push(false);
    }
    // If too long, trim excess
    if (this.attributes.heartDice.length > level) {
      this.attributes.heartDice.length = level;
    }

    // Repeat above for Gift Dice
    // Ensure heartDice array matches the level size
    if (!Array.isArray(this.attributes.giftDice)) {
      this.attributes.giftDice = [];
    }
    // If too short, fill with `false` (unused heart dice)
    while (this.attributes.giftDice.length < level) {
      this.attributes.giftDice.push(false);
    }
    // If too long, trim excess
    if (this.attributes.giftDice.length > level) {
      this.attributes.giftDice.length = level;
  }

  }
  

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data
  }
}