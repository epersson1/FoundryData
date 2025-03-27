import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PNPActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['perils-and-princesses', 'sheet', 'actor'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/perils-and-princesses/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.PNP
    context.config = CONFIG.PNP;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Enrich curse/injury info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedCurses = await TextEditor.enrichHTML(
      this.actor.system.curses,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const weapons = [];
    let gift = null;

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      } else if (i.type == 'weapon') {
        weapons.push(i)
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      } else if (i.type === 'gift') {
        gift = i;
      } 
    }
    // Filter for sheet display
    const innateAbilities = features.filter(ability => ability.system.innate);
    const specialAbilities = features.filter(ability => !ability.system.innate);

    // Assign and return
    context.gear = gear;
    context.weapons = weapons;
    context.features = features;
    context.innateAbilities = innateAbilities;
    context.specialAbilities = specialAbilities;
    context.gift = gift
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }

    // Add a skill
    html.find(".skill-add").click(ev => {
      ev.preventDefault();
      this._addSkill();
    });

    // Remove a skill
    html.find(".skill-remove").click(ev => {
        ev.preventDefault();
        const li = $(ev.currentTarget).closest(".skill");
        const index = Number(li.data("index"));
        this._removeSkill(index);
    });

    // Picnic & Rest
    html.find(".take-picnic").click(this._takePicnic.bind(this));
    html.find('.rest-button').click(this._takeRest.bind(this));

    // Delete Gift
    html.on('click', '.gift-delete', async (ev) => {
      const button = $(ev.currentTarget); // The clicked button
      const itemId = button.data('item-id'); // Get the item ID directly from the button's data-item-id
      // Get the item by ID from the actor's items
      const item = this.actor.items.get(itemId)

      if (item) {
        await item.delete(); // Delete the item from the actor's inventory
        this.render(false); // Re-render the sheet to reflect the change
      } else {
        ui.notifications.warn("Gift not found.");
      }
    });

  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      // Extract the ability key from the dataset if it's provided
      // THIS IS A HACK AND SHOULD PROBABLY BE FIXED.
      const abilityKey = Object.entries(CONFIG.PNP.abilities).find(
        ([key, localizationKey]) => game.i18n.localize(localizationKey) === dataset.label
      )?.[0];

      const abilityValue = this.actor.system.abilities?.[abilityKey]?.value;
      let label = dataset.label ? `${dataset.label} Test (DC ${abilityValue})` : '';

      // Default to the roll from dataset (usually "1d20")
      let rollFormula = dataset.roll;
      // If there's an ability key and the actor has an ailment for it, use 2d20kh1
      if (abilityKey && this.actor.system.abilities?.[abilityKey].ailment) {
        rollFormula = '2d20kh1';
      }

      const roll = new Roll(rollFormula, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
    }
  }
  async _addSkill() {
    const actorData = this.actor.system;
    
    // Ensure there is room for another skill
    if (actorData.skills.length >= 5) {
        ui.notifications.warn("You can only select up to 5 skills.");
        return;
    }

    // Get available skills that aren't selected
    const availableSkills = Object.keys(CONFIG.PNP.skills).filter(skill => !actorData.skills.includes(skill));

    // Create a dialog to select a skill
    const content = `<form>
        <div class="form-group">
            <label>Select Skill:</label>
            <select id="skill-select">
                ${availableSkills.map(skill => `<option value="${skill}">${game.i18n.localize(CONFIG.PNP.skills[skill])}</option>`).join("")}
            </select>
        </div>
    </form>`;

    new Dialog({
        title: "Add Skill",
        content: content,
        buttons: {
            add: {
                label: "Add",
                callback: async (html) => {
                    const selectedSkill = html.find("#skill-select").val();
                    if (selectedSkill) {
                        actorData.skills.push(selectedSkill);
                        await this.actor.update({ "system.skills": actorData.skills });
                    }
                }
            },
            cancel: { label: "Cancel" }
        }
    }).render(true);
  }

  async _removeSkill(index) {
      const skills = this.actor.system.skills;
      skills.splice(index, 1);
      await this.actor.update({ "system.skills": skills });
  }

  async _takePicnic() {
    const heartDice = this.actor.system.attributes.heartDice;
    // Calculate the number of available gift dice (those with `giftDice.index == false`).
    const availableDice = heartDice.filter(die => die === true).length;

    if (availableDice === 0) {
      return ui.notifications.warn("You have no Heart Dice available.");
    }

    const content = `
      <form>
        <div class="form-group">
          <label>How many Heart Dice do you want to roll? (max: ${availableDice})</label>
          <input type="number" id="numHeartDice" name="numHeartDice" min="1" max="${availableDice}" value="${availableDice}"/>
        </div>
      </form>
    `;

    new Dialog({
      title: "Take a Picnic",
      content,
      buttons: {
        roll: {
          label: "Roll",
          callback: async (html) => {
            const num = parseInt(html.find('#numHeartDice').val());
            if (isNaN(num) || num < 1 || num > availableDice) {
              return ui.notifications.warn("Invalid number of dice.");
            }

            // Roll the dice
            const roll = new Roll(`${num}d4`);
            await roll.evaluate({ async: true });

            // Update HP
            const currentHP = this.actor.system.health.value;
            const maxHP = this.actor.system.health.max;
            const healed = roll.total;
            const newHP = Math.min(currentHP + healed, maxHP);

            await this.actor.update({ "system.health.value": newHP });

            // Mark used Heart Dice
            const newHeartDice = [...heartDice];
            let spent = 0;
            for (let i = newHeartDice.length; i > 0; i--) {
              if (newHeartDice[i] === true && spent < num) {
                newHeartDice[i] = false;
                spent++;
              }
            }
            await this.actor.update({ "system.attributes.heartDice": newHeartDice });

            // Send roll message
            roll.toMessage({
              speaker: ChatMessage.getSpeaker({ actor: this.actor }),
              flavor: `Took a Picnic and healed ${healed} HP`,
            });
          }
        },
        cancel: {
          label: "Cancel"
        }
      },
      default: "roll"
    }).render(true);
  }

  async _takeRest() {
    const updates = {};
  
    // 1. Restore all Health to max
    const maxHealth = this.actor.system.health.max;
    updates["system.health.value"] = maxHealth;
  
    // 2. Restore all Gift Dice (set all to true)
    const giftDiceCount = this.actor.system.attributes.giftDice.length;
    updates["system.attributes.giftDice"] = Array(giftDiceCount).fill(true);
  
    // 3. Restore all Heart Dice (set all to true)
    const heartDiceCount = this.actor.system.attributes.heartDice.length;
    updates["system.attributes.heartDice"] = Array(heartDiceCount).fill(true);
  
    // Apply all updates
    await this.actor.update(updates);
  
    // Send a chat message to all players
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    ChatMessage.create({
      speaker,
      content: `<strong>${this.actor.name}</strong> takes a rest.`,
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
    });
  }
}

