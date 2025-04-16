/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class PNPActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
    this.system.maxHD = this.system.attributes.level.value;
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.perilsandprincesses || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    let maxHD = systemData.maxHD;
    let level = systemData.attributes.level.value;
    let heartDice = systemData.attributes.heartDice;
    let giftDice = systemData.attributes.giftDice;
    
    if (!heartDice) {
      heartDice = []; // Initialize heartDice if it doesn't exist
    }
    if (!giftDice) {
      giftDice = []; // Initialize giftDice if it doesn't exist
    }

    // Ensure heartDice has keys up to `level`
    for (let i = 0; i < maxHD; i++) {
      if (heartDice[i] === undefined) {
        heartDice[i] = false; // Default unused heart die
      }
    }

    // Remove excess keys
    Object.keys(heartDice)
      .map(Number) // Convert keys to numbers
      .filter(key => key >= maxHD) // Find excess keys
      .forEach(key => {
        delete heartDice[key];
      });

    // Ensure giftDice has keys up to `level`
    for (let i = 0; i < level; i++) {
      if (giftDice[i] === undefined) {
        giftDice[i] = false; // Default unused heart die
      }
    }

    // Remove excess keys
    Object.keys(giftDice)
      .map(Number) // Convert keys to numbers
      .filter(key => key >= level) // Find excess keys
      .forEach(key => {
        delete giftDice[key];
      });

      // Reassign back
      systemData.attributes.heartDice = heartDice;
      systemData.attributes.giftDice = giftDice;
  }
  

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = systemData.cr * systemData.cr * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const data = { ...this.system };

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

   /**
   * Prepare character roll data.
   */
   _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}
