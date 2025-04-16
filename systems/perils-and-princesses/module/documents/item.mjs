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
    if (this.type == 'weapon'){
      this.system.roll = this.system.roll || [];

      this.system.roll.diceNum = this.system.roll.diceNum;
      if (!this.system.roll.diceNum) this.system.roll.diceNum = 1;

      this.system.roll.diceSize = this.system.roll.diceSize;
      if (!this.system.roll.diceSize) this.system.roll.diceSize = "d6";
      
      this.system.formula = String(this.system.roll.diceNum) + String(this.system.roll.diceSize);
    }
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
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor , token: this.actor.token});
    const tokenImg = this.actor?.token?.texture?.src || this.actor?.img || "icons/svg/mystery-man.svg"; // Fallback image if no token
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `<div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${tokenImg}" alt="Token Image" width="36" height="36" style="border-radius: 50%;">
                    <div>
                        ${item.name}
                    </div>
                </div>`
    if (this.type == 'feature') {
      if (this.system.innate) {
        ChatMessage.create({
          speaker: speaker,
          rollMode: rollMode,
          flavor: label,
          content: item.system.description ?? '',
        });
      } else {
      return this.rollWithGiftDice();
      }
    }
    // If there's no roll data, send a chat message.
    else if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Step 1: Prompt for Resolve Test
      // Step 1: Prompt for Resolve Test
      new Dialog({
        title: "Resolve Test",
        content: `<p>Roll Resolve to attack:</p>`,
        buttons: {
          adv: {
            label: "Advantage",
            callback: () => this.performResolveRoll("2d20kh1")
          },
          norm: {
            label: "Normal",
            callback: () => this.performResolveRoll("1d20")
          },
          dis: {
            label: "Disadvantage",
            callback: () => this.performResolveRoll("2d20kl1")
          }
        },
        default: "norm"
      }).render(true);
      }
    }

  // Resolve roll and post chat message with damage button
  async performResolveRoll(rollFormula) {
    console.log(this)
    const roll = new Roll(rollFormula, this.actor.getRollData());
    await roll.evaluate({ async: true });

    const rollHTML = await roll.render();

    // Customize message content with damage roll button
    const abilityValue = this.actor.system.abilities?.resolve.value;
    const messageContent = `
      <div>${rollHTML}</div>
      <button class="damage-roll-button">Roll Damage</button>
    `;

    const chatMessage = await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: messageContent,
      flavor: `Resolve Test (DC ${abilityValue})`,
      roll: roll,
      rollMode: game.settings.get('core', 'rollMode'),
    });

    // Attach listener to damage button after render
    Hooks.once("renderChatMessage", (msg, html) => {
      if (msg.id === chatMessage.id) {
        html.find(".damage-roll-button").on("click", async () => {
          const rollData = this.getRollData();
          const damageRoll = new Roll(rollData.formula, rollData.actor);
          await damageRoll.evaluate({ async: true });
          await damageRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `Weapon Damage`,
            rollMode: game.settings.get('core', 'rollMode'),
          });
        });
      }
    });
  }

  /**
 * Handles rolling gift dice.
 * Prompts the user to specify how many gift dice to spend, then rolls that many d6.
 */
  async rollWithGiftDice() {
    const actor = this.actor;
    const giftDiceArray = Object.values(actor.system.attributes.giftDice)

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

            // Send the roll to chat
            const rollMode = game.settings.get('core', 'rollMode');
            const flavor = `Rolling ${numGiftDice} Gift Dice`;
            let used = rollResults.filter(result => [4, 5, 6].includes(result)).length;

            // Perform the roll and send to chat with combined description and image
            const speaker = ChatMessage.getSpeaker({ actor: this.actor, token: this.actor.token });
            const tokenImg = this.actor?.token?.texture?.src || this.actor?.img || "icons/svg/mystery-man.svg"; // Fallback image if no token

            roll.toMessage({
              speaker: speaker,
              rollMode: rollMode,
              flavor: `
                  <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${tokenImg}" alt="Token Image" width="36" height="36" style="border-radius: 50%;">
                      <div>
                          ${flavor}<br>
                          <em>${this.system.description ?? ''}</em><br>
                          ${used} GD used.
                      </div>
                  </div>
              `,
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
