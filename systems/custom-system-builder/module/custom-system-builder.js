/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * @ignore
 * @module
 */
import './formulas/ComputablePhrase.js';
import './sheets/components/ComponentFactory.js';
import processMigrations from './migrations/migrationHandler.js';
import { exportTemplates, importTemplates } from './exports.js';
// Import document classes.
import { CustomActor } from './documents/actor.js';
import { CustomItem } from './documents/item.js';
import { CustomToken } from './documents/token.js';
// Import sheet classes.
import { CharacterSheet } from './sheets/character-sheet.js';
import { TemplateSheet } from './sheets/template-sheet.js';
import { EquippableItemSheet } from './sheets/items/equippable-item-sheet.js';
import { EquippableItemTemplateSheet } from './sheets/items/_equippable-item-template-sheet.js';
import { SubTemplateItemSheet } from './sheets/items/sub-template-item-sheet.js';
import { UserInputTemplateItemSheet } from './sheets/items/user-input-template-item-sheet.js';
import Formula from './formulas/Formula.js';
import { getLocalizedRoleList, postAugmentedChatMessage, postCustomSheetRoll } from './utils.js';
// Import components for factory init
import Label from './sheets/components/Label.js';
import TextField from './sheets/components/TextField.js';
import RichTextArea from './sheets/components/RichTextArea.js';
import Checkbox from './sheets/components/Checkbox.js';
import RadioButton from './sheets/components/RadioButton.js';
import Dropdown from './sheets/components/Dropdown.js';
import Panel from './sheets/components/Panel.js';
import Table from './sheets/components/Table.js';
import DynamicTable from './sheets/components/DynamicTable.js';
import NumberField from './sheets/components/NumberField.js';
import TabbedPanel from './sheets/components/TabbedPanel.js';
import ItemContainer from './sheets/components/ItemContainer.js';
import ConditionalModifierList from './sheets/components/ConditionalModifierList.js';
import Logger from './Logger.js';
import Meter from './sheets/components/Meter.js';
import ComputablePhrase from './formulas/ComputablePhrase.js';
import ActiveEffectContainer from './sheets/components/ActiveEffectContainer.js';
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
Hooks.once('init', async function () {
    try {
        // Define custom Document classes
        CONFIG.Actor.documentClass = CustomActor;
        CONFIG.Item.documentClass = CustomItem;
        CONFIG.Token.documentClass = CustomToken;
        // Register system settings - init formula
        game.settings.register(game.system.id, 'initFormula', {
            name: 'CSB.Settings.InitiativeFormula.Name',
            hint: 'CSB.Settings.InitiativeFormula.Hint',
            scope: 'world',
            config: true,
            default: '[1d20]',
            type: String
        });
        // Register system settings - Custom CSS
        game.settings.register(game.system.id, 'customStyle', {
            name: 'CSB.Settings.CustomStyle.Name',
            hint: 'CSB.Settings.CustomStyle.Hint',
            scope: 'world',
            config: true,
            default: '',
            type: String,
            filePicker: 'any'
        });
        // Register system settings - expand roll visibility
        game.settings.register(game.system.id, 'expandRollVisibility', {
            name: 'CSB.Settings.ExpandRollVisibility.Name',
            hint: 'CSB.Settings.ExpandRollVisibility.Hint',
            scope: 'world',
            config: true,
            default: '',
            type: Boolean
        });
        // Register system settings - roll icon
        game.settings.register(game.system.id, 'rollIcon', {
            name: 'CSB.Settings.RollIcons.Name',
            hint: 'CSB.Settings.RollIcons.Hint',
            scope: 'world',
            config: true,
            default: '',
            type: String
        });
        // Register system settings - show hidden roll to GM
        game.settings.register(game.system.id, 'showHiddenRoll', {
            name: 'CSB.Settings.ShowHiddenRolls.Name',
            hint: 'CSB.Settings.ShowHiddenRolls.Hint',
            scope: 'world',
            config: true,
            default: '',
            type: Boolean
        });
        game.settings.register(game.system.id, 'delayEntitySaving', {
            name: 'CSB.Settings.DelayEntitySaving.Name',
            hint: 'CSB.Settings.DelayEntitySaving.Hint',
            scope: 'world',
            config: true,
            default: false,
            type: Boolean
        });
        game.settings.register(game.system.id, 'loggingLevel', {
            name: 'CSB.Settings.LoggingLevel.Name',
            hint: 'CSB.Settings.LoggingLevel.Hint',
            scope: 'world',
            config: true,
            default: 'LOG',
            type: String,
            choices: {
                NONE: 'CSB.Settings.LoggingLevel.Levels.None',
                ERROR: 'CSB.Settings.LoggingLevel.Levels.Error',
                WARN: 'CSB.Settings.LoggingLevel.Levels.Warn',
                INFO: 'CSB.Settings.LoggingLevel.Levels.Info',
                LOG: 'CSB.Settings.LoggingLevel.Levels.Log',
                DEBUG: 'CSB.Settings.LoggingLevel.Levels.Debug'
            },
            onChange: (value) => {
                // A callback function which triggers when the setting is changed
                Logger.setLogLevel(value);
            }
        });
        game.settings.register(game.system.id, 'minimumRoleEditItemModifiers', {
            name: 'CSB.Settings.MinimumRoleEditModifiers.Name',
            hint: 'CSB.Settings.MinimumRoleEditModifiers.Hint',
            scope: 'world',
            config: true,
            default: CONST.USER_ROLE_NAMES[CONST.USER_ROLES.NONE],
            type: String,
            choices: getLocalizedRoleList('string')
        });
        game.settings.register(game.system.id, 'minimumRoleTemplateReloading', {
            name: 'CSB.Settings.MinimumRoleTemplateReload.Name',
            hint: 'CSB.Settings.MinimumRoleTemplateReload.Hint',
            scope: 'world',
            config: true,
            default: CONST.USER_ROLE_NAMES[CONST.USER_ROLES.ASSISTANT],
            type: String,
            choices: getLocalizedRoleList('string')
        });
        // Register sheet application classes
        Actors.unregisterSheet('core', ActorSheet);
        Actors.registerSheet(game.system.id, CharacterSheet, {
            makeDefault: true,
            types: ['character'],
            label: 'Default'
        });
        Actors.registerSheet(game.system.id, TemplateSheet, {
            makeDefault: true,
            types: ['_template'],
            label: 'Default'
        });
        Items.unregisterSheet('core', ItemSheet);
        Items.registerSheet(game.system.id, EquippableItemTemplateSheet, {
            makeDefault: true,
            types: ['_equippableItemTemplate'],
            label: 'Default'
        });
        Items.registerSheet(game.system.id, EquippableItemSheet, {
            makeDefault: true,
            types: ['equippableItem'],
            label: 'Default'
        });
        Items.registerSheet(game.system.id, SubTemplateItemSheet, {
            makeDefault: true,
            types: ['subTemplate'],
            label: 'Default'
        });
        Items.registerSheet(game.system.id, UserInputTemplateItemSheet, {
            makeDefault: true,
            types: ['userInputTemplate'],
            label: 'Default'
        });
        setInitiativeFormula();
        // Helper-functions for handlebars
        Handlebars.registerHelper('eq', (a, b) => a == b);
        // Partials
        Handlebars.registerPartial('icon-formula', await getTemplate(`systems/${game.system.id}/templates/_template/partials/icon-formula.hbs`));
        Handlebars.registerPartial('icon-info', await getTemplate(`systems/${game.system.id}/templates/_template/partials/icon-info.hbs`));
        Handlebars.registerPartial('icon-no-delimiters', await getTemplate(`systems/${game.system.id}/templates/_template/partials/icon-no-delimiters.hbs`));
        componentFactory.addComponentType(Label);
        componentFactory.addComponentType(TextField);
        componentFactory.addComponentType(NumberField);
        componentFactory.addComponentType(RichTextArea);
        componentFactory.addComponentType(Checkbox);
        componentFactory.addComponentType(RadioButton);
        componentFactory.addComponentType(Meter);
        componentFactory.addComponentType(Dropdown);
        componentFactory.addComponentType(Panel);
        componentFactory.addComponentType(Table);
        componentFactory.addComponentType(DynamicTable);
        componentFactory.addComponentType(TabbedPanel);
        componentFactory.addComponentType(ItemContainer);
        componentFactory.addComponentType(ConditionalModifierList);
        componentFactory.addComponentType(ActiveEffectContainer);
        Hooks.callAll('customSystemBuilderInit');
        return true;
    }
    catch (err) {
        Logger.error(err.message, err);
    }
});
/**
 * Sets initiative formula for all tokens
 * @ignore
 */
function setInitiativeFormula() {
    Combatant.prototype._getInitiativeFormula = function () {
        let initF = game.settings.get(game.system.id, 'initFormula');
        let formula = initF || '1d20';
        CONFIG.Combat.initiative.formula = formula;
        Logger.debug('Initiative formula : ' + formula);
        return CONFIG.Combat.initiative.formula || game.system.initiative;
    };
    Combatant.prototype.getInitiativeRoll = async function (rawFormula) {
        return new Formula(rawFormula || this._getInitiativeFormula());
    };
    Combatant.prototype.rollInitiative = async function (rawFormula) {
        let formula = await this.getInitiativeRoll(rawFormula);
        await formula.compute(this.actor.system.props, {
            defaultValue: '0',
            computeExplanation: true
        });
        return this.update({ initiative: formula.result });
    };
    Combat.prototype.rollInitiative = async function (ids, { rawFormula = null, updateTurn = true, messageOptions = {} } = {}) {
        // Structure input data
        ids = typeof ids === 'string' ? [ids] : ids;
        const currentId = this.combatant?.id;
        const rollMode = messageOptions.rollMode || game.settings.get('core', 'rollMode');
        // Iterate over Combatants, performing an initiative roll for each
        const updates = [];
        const messages = [];
        for (let [i, id] of ids.entries()) {
            // Get Combatant data (non-strictly)
            const combatant = this.combatants.get(id);
            if (!combatant?.isOwner)
                continue;
            // Produce an initiative roll for the Combatant
            const formula = await combatant.getInitiativeRoll(rawFormula);
            let phrase = new ComputablePhrase('${' + formula.raw + '}$');
            await phrase.compute(combatant.actor.system.props, {
                defaultValue: '0',
                computeExplanation: true,
                triggerEntity: combatant.actor.templateSystem
            });
            updates.push({ _id: id, initiative: phrase.result });
            // Construct chat message data
            let messageData = foundry.utils.mergeObject({
                speaker: ChatMessage.getSpeaker({
                    actor: combatant.actor,
                    token: combatant.token,
                    alias: combatant.name
                }),
                flavor: game.i18n.format('COMBAT.RollsInitiative', {
                    name: combatant.name
                }),
                flags: { 'core.initiativeRoll': true }
            }, messageOptions);
            const chatData = await postAugmentedChatMessage(phrase, messageData, {
                create: false,
                rollMode: combatant.hidden && ['roll', CONST.DICE_ROLL_MODES.PUBLIC].includes(rollMode)
                    ? CONST.DICE_ROLL_MODES.PRIVATE
                    : rollMode
            });
            // Play 1 sound for the whole rolled set
            if (i > 0)
                chatData.sound = null;
            messages.push(chatData);
        }
        if (!updates.length)
            return this;
        // Update multiple combatants
        await this.updateEmbeddedDocuments('Combatant', updates);
        // Ensure the turn order remains with the same combatant
        if (updateTurn && currentId) {
            await this.update({
                turn: this.turns.findIndex((t) => t.id === currentId)
            });
        }
        // Create multiple chat messages
        await ChatMessage.create(messages);
        return this;
    };
}
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
Hooks.once('ready', async function () {
    Logger.setLogLevel(game.settings.get(game.system.id, 'loggingLevel'));
    // Inject custom stylesheet if provided in settings
    if (game.settings.get(game.system.id, 'customStyle') !== '') {
        const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = game.settings.get(game.system.id, 'customStyle');
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    await processMigrations();
    let allReferencableProps = {};
    for (let template of game.actors.filter((actor) => actor.type === '_template')) {
        let allKeys = Object.keys(template.templateSystem.componentMap);
        allKeys.forEach((key) => {
            if (!key.includes('.'))
                allReferencableProps[key] = 0;
        });
    }
    // game.model.Actor.character = { props: allReferencableProps };
    if (game.user.isGM) {
        if (!CustomItem.getEmbeddedItemsFolder(false)) {
            Folder.createDocuments([
                {
                    name: CustomItem.EMBEDDED_ITEMS_FOLDER_NAME,
                    type: 'Item',
                    description: game.i18n.localize('CSB.Items.EmbeddedItemsFolderDescription'),
                    color: '#211A1B'
                }
            ]);
        }
    }
    Hooks.callAll('customSystemBuilderReady');
});
// Prepare export buttons
Hooks.on('renderSidebarTab', createExportButtons);
/**
 * Create export button
 * @param sidebar
 * @param jq
 * @ignore
 */
function createExportButtons(sidebar, jq) {
    if (sidebar._element[0].id !== 'settings')
        return;
    if (!game.user.isGM)
        return;
    /* -------------------------------------------- */
    /*  Export button                               */
    /* -------------------------------------------- */
    let exportButton = document.createElement('button');
    exportButton.innerHTML = '<i class="fas fa-download"></i>' + game.i18n.localize('CSB.Export.ExportButton');
    exportButton.addEventListener('click', exportTemplates);
    /* -------------------------------------------- */
    /*  Import button                               */
    /* -------------------------------------------- */
    let importButton = document.createElement('BUTTON');
    importButton.innerHTML = '<i class="fas fa-upload"></i>' + game.i18n.localize('CSB.Export.ImportButton');
    importButton.addEventListener('click', importTemplates);
    // Add everything cleanly into menu
    let exportTitle = document.createElement('h2');
    exportTitle.innerText = 'Custom System Builder';
    let exportDiv = document.createElement('div');
    exportDiv.id = 'settings-custom-system-export';
    exportDiv.appendChild(exportButton);
    exportDiv.appendChild(importButton);
    let jSidebar = $(sidebar._element[0]);
    let helpBox = jSidebar.find('#settings-documentation');
    helpBox.prev('h2').before(exportTitle);
    helpBox.prev('h2').before(exportDiv);
}
Hooks.on('getActorDirectoryEntryContext', addReloadToActorContext);
/**
 * @ignore
 * @param html
 * @param menuItems
 */
function addReloadToActorContext(html, menuItems) {
    menuItems.push({
        callback: (li) => {
            let id = $(li).data('document-id');
            let actor = game.actors.get(id);
            actor.reloadTemplate();
        },
        condition: (li) => {
            let id = $(li).data('document-id');
            let actor = game.actors.get(id);
            return actor.type === 'character' && game.user.isGM;
        },
        icon: '<i class="fas fa-sync"></i>',
        name: game.i18n.localize('CSB.Sheets.ReloadTemplate')
    });
}
/**
 * Add Chat command to perform sheet rolls from chat / macros
 */
Hooks.on('chatCommandsReady', function (chatCommands) {
    chatCommands.register({
        name: '/sheetAltRoll',
        module: game.system.id,
        description: game.i18n.localize('CSB.ChatCommands.SheetAltRollCommand'),
        icon: "<i class='fas fa-dice-d20'></i>",
        callback: (chatlog, messageText, chatdata) => {
            postCustomSheetRoll(messageText, true);
            return {};
        }
    });
    chatCommands.register({
        name: '/sheetRoll',
        module: game.system.id,
        description: game.i18n.localize('CSB.ChatCommands.SheetRollCommand'),
        icon: "<i class='fas fa-dice-d20'></i>",
        callback: (chatlog, messageText, chatdata) => {
            postCustomSheetRoll(messageText, false);
            return {};
        }
    });
});
Hooks.on('applyActiveEffect', applyCustomActiveEffectChange);
/**
 *
 * @param {CustomActor} actor
 * @param {EffectChangeData} change
 * @param {Primitive} current
 * @param {Primitive} delta
 * @param {Record<string, Primitive>} changes
 */
function applyCustomActiveEffectChange(actor, change, current, delta, changes) {
    if (change.mode !== CONST.ACTIVE_EFFECT_MODES.CUSTOM) {
        return;
    }
    try {
        changes[change.key] = ComputablePhrase.computeMessageStatic(change.value, actor.system.props, {
            source: `activeEffect.${change.key}.value`,
            triggerEntity: actor.templateSystem
        }).result;
    }
    catch (err) {
        changes[change.key] = 'ERROR';
    }
}
