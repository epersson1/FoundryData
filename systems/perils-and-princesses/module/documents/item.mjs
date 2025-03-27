/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class PNPItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const rollData = { ...this.system };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Convert the item document to a plain object.
   *
   * The built in `toObject()` method will ignore derived data when using Data Models.
   * This additional method will instead use the spread operator to return a simplified
   * version of the data.
   *
   * @returns {object} Plain object either via deepClone or the spread operator.
   */
  toPlainObject() {
    const result = { ...this };

    // Simplify system data.
    result.system = this.system.toPlainObject();
    // Add effects.
    result.effects = this.effects?.size > 0 ? this.effects.contents : [];

    return result;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    } else if (this.type == 'feature') {
      return this.rollWithGiftDice();
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData.actor);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }

  /**
 * Handles rolling gift dice for an actor.
 * Prompts the user to specify how many gift dice to spend, then rolls that many d6.
 */
async rollWithGiftDice() {
  const actor = this.actor;
  let giftDiceArray = [...actor.system.attributes.giftDice]; //shallow copy

  // Calculate the number of available gift dice (those with `giftDice.index == false`).
  const availableGiftDice = giftDiceArray.filter(dice => dice === true).length;

  // If there are no available gift dice, show a warning and return early.
  if (availableGiftDice === 0) {
    ui.notifications.warn("You have no available gift dice to spend.");
    return;
  }

  // Prompt the user to enter the number of gift dice to spend
  const dialog = new Dialog({
    title: `How many gift dice to spend?`,
    content: `
      <form>
        <div class="form-group">
          <label for="giftDiceAmount">Gift Dice (1-${availableGiftDice}):</label>
          <input type="number" id="giftDiceAmount" name="giftDiceAmount" min="1" max="${availableGiftDice}" value="1" />
        </div>
      </form>
    `,
    buttons: {
      roll: {
        label: "Roll",
        callback: async (html) => {
          // Get the number of gift dice from the input field
          let numGiftDice = parseInt(html.find("#giftDiceAmount").val(), 10);

          // Check if the number of dice is valid
          if (numGiftDice < 1 || numGiftDice > availableGiftDice) {
            ui.notifications.warn(`You must choose between 1 and ${availableGiftDice} gift dice.`);
            return;
          }

          // Generate the roll formula: `numGiftDice` d6
          const rollFormula = `${numGiftDice}d6`;

          // Initialize the roll
          const roll = new Roll(rollFormula, actor.getRollData());
          const result = await roll.evaluate();
          const rollResults = result.terms[0].results.map(r => r.result);
          console.log(rollResults)

          // Send the roll to chat
          const speaker = ChatMessage.getSpeaker({ actor: this.actor });
          const rollMode = game.settings.get('core', 'rollMode');
          const flavor = `Rolling ${numGiftDice} Gift Dice`;
          let used = rollResults.filter(result => [4, 5, 6].includes(result)).length;

          // Perform the roll and send to chat with combined description and label
          roll.toMessage({
            speaker: speaker,
            rollMode: rollMode,
            flavor: `${flavor}<br><em>${this.system.description ?? ''}</em><br>${used} GD used.`,
          });

          // Mishap check: If two dice roll the same number
          const hasMishap = rollResults.some((val, index) => rollResults.indexOf(val) !== index);
          if (hasMishap) {
            ChatMessage.create({
              speaker: { actor: actor },
              content: `A Mishap has occurred! Two or more gift dice rolled the same number.`,
            });
          }
          
          // Loop through the giftDice array and update the used ones
          for (let i = giftDiceArray.length; used > 0; i--) {
            if (giftDiceArray[i] === true) {  // Find a 'true' (available) gift die
              giftDiceArray[i] = false;  // Mark this die as used
              used--;  // Decrease the remaining number of dice to use
            }
          }
          // Update the actor's giftDice array
          actor.update({
            "system.attributes.giftDice": giftDiceArray
          });
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
  });
  // Show the dialog
  dialog.render(true);
}
}
