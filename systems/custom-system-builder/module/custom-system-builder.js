/*
 * Author: Jean-Baptiste Louvet-Daniel
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
import CustomActor from './documents/CustomActor.js';
import CustomItem from './documents/CustomItem.js';
import CustomToken from './documents/CustomToken.js';
// Import sheet classes.
import { CharacterSheet } from './sheets/actors/character-sheet.js';
import { TemplateSheet } from './sheets/actors/template-sheet.js';
import { EquippableItemSheet } from './sheets/items/equippable-item-sheet.js';
import { EquippableItemTemplateSheet } from './sheets/items/_equippable-item-template-sheet.js';
import { SubTemplateItemSheet } from './sheets/items/sub-template-item-sheet.js';
import { UserInputTemplateItemSheet } from './sheets/items/user-input-template-item-sheet.js';
import Formula from './formulas/Formula.js';
import { getLocalizedRoleList, isModuleActive, postCustomSheetRoll } from './utils.js';
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
import initChat from './chat.js';
import CustomActiveEffect from './documents/CustomActiveEffect.js';
import CustomActiveEffectConfig from './sheets/CustomActiveEffectConfig.js';
import CustomStatusEffectsApplication from './applications/CustomStatusEffectsApplication.js';
import ActiveEffectContainerItemSheet from './sheets/items/active-effect-container-item-sheet.js';
import { CharacterActorDataModel, TemplateActorDataModel } from './documents/model/actorModel.js';
import { BaseItemDataModel, EquippableItemDataModel, TemplateItemDataModel } from './documents/model/itemModel.js';
import { CharacterSheetV2 } from './sheets/actors/v2/CharacterSheetV2.js';
import { TemplateSheetV2 } from './sheets/actors/v2/TemplateSheetV2.js';
import { EquippableItemTemplateSheetV2 } from './sheets/items/v2/EquippableItemTemplateSheetV2.js';
import { EquippableItemSheetV2 } from './sheets/items/v2/EquippableItemSheetV2.js';
import { SubTemplateItemSheetV2 } from './sheets/items/v2/SubTemplateItemSheetV2.js';
import { UserInputTemplateItemSheetV2 } from './sheets/items/v2/UserInputTemplateItemSheetV2.js';
import ActiveEffectContainerItemSheetV2 from './sheets/items/v2/ActiveEffectContainerItemSheetV2.js';
import Component from './sheets/components/Component.js';
import InputComponent from './sheets/components/InputComponent.js';
import Container from './sheets/components/Container.js';
import ExtensibleTable from './sheets/components/ExtensibleTable.js';
import { AlphanumericPatternError, ComponentValidationError, NotGreaterThanZeroError, NotUniqueError, RequiredFieldError } from './errors/ComponentValidationError.js';
import { UncomputableError } from './errors/UncomputableError.js';
import { FormulaFunctionImporter } from './formulas/FormulaFunctionImporter.js';
import { isChatSenderElement } from './interfaces/ChatSenderElement.js';
import { isAttributeBarElement } from './interfaces/AttributeBarElement.js';
import { isComputableElement } from './interfaces/ComputableElement.js';
import Picture from './sheets/components/Picture.js';
import TemplateSystem from './documents/TemplateSystem.js';
import CustomCombatant from './documents/CustomCombatant.js';
import CustomCombat from './documents/CustomCombat.js';
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
async function initHook() {
    try {
        // Define custom Document classes
        CONFIG.Actor.documentClass = CustomActor;
        CONFIG.Actor.dataModels.character = CharacterActorDataModel;
        CONFIG.Actor.dataModels._template = TemplateActorDataModel;
        // @ts-expect-error Don't know, don't care
        CONFIG.Item.documentClass = CustomItem;
        CONFIG.Item.dataModels.equippableItem = EquippableItemDataModel;
        CONFIG.Item.dataModels._equippableItemTemplate = TemplateItemDataModel;
        CONFIG.Item.dataModels.subTemplate = BaseItemDataModel;
        CONFIG.Item.dataModels.userInputTemplate = BaseItemDataModel;
        CONFIG.Item.dataModels.activeEffectContainer = BaseItemDataModel;
        CONFIG.Token.documentClass = CustomToken;
        CONFIG.ActiveEffect.documentClass = CustomActiveEffect;
        CONFIG.ActiveEffect.legacyTransferral = false;
        //@ts-expect-error Return type changed for CSB
        CONFIG.Combatant.documentClass = CustomCombatant;
        CONFIG.Combat.documentClass = CustomCombat;
        game.settings.register(game.system.id, 'customStatusEffects', {
            scope: 'world',
            config: false,
            default: undefined,
            type: Array
        });
        game.settings.register(game.system.id, 'customSpecialStatusEffects', {
            scope: 'world',
            config: false,
            default: undefined,
            type: Object
        });
        const customStatusEffects = game.settings.get(game.system.id, 'customStatusEffects');
        if (customStatusEffects) {
            CONFIG.statusEffects = customStatusEffects;
        }
        const customSpecialStatusEffects = game.settings.get(game.system.id, 'customSpecialStatusEffects');
        if (customSpecialStatusEffects) {
            CONFIG.specialStatusEffects = customSpecialStatusEffects;
        }
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
            //@ts-expect-error Outdated way of making a file picker
            filePicker: 'any',
            requiresReload: true
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
            type: Boolean,
            requiresReload: true
        });
        game.settings.register(game.system.id, 'manualEntitySaving', {
            name: 'CSB.Settings.ManualEntitySaving.Name',
            hint: 'CSB.Settings.ManualEntitySaving.Hint',
            scope: 'client',
            config: true,
            default: false,
            type: Boolean,
            requiresReload: true
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
            default: CONST.USER_ROLE_NAMES[String(CONST.USER_ROLES.NONE)],
            type: String,
            choices: getLocalizedRoleList('string'),
            requiresReload: true
        });
        game.settings.register(game.system.id, 'minimumRoleTemplateReloading', {
            name: 'CSB.Settings.MinimumRoleTemplateReload.Name',
            hint: 'CSB.Settings.MinimumRoleTemplateReload.Hint',
            scope: 'world',
            config: true,
            default: CONST.USER_ROLE_NAMES[String(CONST.USER_ROLES.ASSISTANT)],
            type: String,
            choices: getLocalizedRoleList('string'),
            requiresReload: true
        });
        game.settings.register(game.system.id, 'useApplicationV1', {
            name: 'CSB.Settings.UseApplicationV1.Name',
            hint: 'CSB.Settings.UseApplicationV1.Hint',
            scope: 'world',
            config: true,
            default: false,
            type: Boolean,
            requiresReload: true
        });
        game.settings.register(game.system.id, 'show451ConversionPopUp', {
            name: 'CSB.Settings.Show451ConversionPopUp.Name',
            scope: 'world',
            config: true,
            default: true,
            type: Boolean,
            requiresReload: true
        });
        Logger.setLogLevel(game.settings.get(game.system.id, 'loggingLevel'));
        // Register sheet application classes
        foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
        foundry.documents.collections.Actors.registerSheet(game.system.id, CharacterSheetV2, {
            makeDefault: !game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['character'],
            label: game.i18n.localize('CSB.Settings.SheetName')
        });
        foundry.documents.collections.Actors.registerSheet(game.system.id, TemplateSheetV2, {
            makeDefault: !game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['_template'],
            label: game.i18n.localize('CSB.Settings.SheetName')
        });
        //@ts-expect-error wrong types
        foundry.documents.collections.Actors.registerSheet(game.system.id, CharacterSheet, {
            makeDefault: game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['character'],
            label: game.i18n.localize('CSB.Settings.UseApplicationV1.LegacySheetName')
        });
        //@ts-expect-error wrong types
        foundry.documents.collections.Actors.registerSheet(game.system.id, TemplateSheet, {
            makeDefault: game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['_template'],
            label: game.i18n.localize('CSB.Settings.UseApplicationV1.LegacySheetName')
        });
        foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
        foundry.documents.collections.Items.registerSheet(game.system.id, EquippableItemTemplateSheet, {
            makeDefault: game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['_equippableItemTemplate'],
            label: game.i18n.localize('CSB.Settings.UseApplicationV1.LegacySheetName')
        });
        foundry.documents.collections.Items.registerSheet(game.system.id, EquippableItemSheet, {
            makeDefault: game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['equippableItem'],
            label: game.i18n.localize('CSB.Settings.UseApplicationV1.LegacySheetName')
        });
        //@ts-expect-error wrong types
        foundry.documents.collections.Items.registerSheet(game.system.id, SubTemplateItemSheet, {
            makeDefault: game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['subTemplate'],
            label: game.i18n.localize('CSB.Settings.UseApplicationV1.LegacySheetName')
        });
        //@ts-expect-error wrong types
        foundry.documents.collections.Items.registerSheet(game.system.id, UserInputTemplateItemSheet, {
            makeDefault: game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['userInputTemplate'],
            label: game.i18n.localize('CSB.Settings.UseApplicationV1.LegacySheetName')
        });
        foundry.documents.collections.Items.registerSheet(game.system.id, ActiveEffectContainerItemSheet, {
            makeDefault: game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['activeEffectContainer'],
            label: game.i18n.localize('CSB.Settings.UseApplicationV1.LegacySheetName')
        });
        // VScode flags these as useless but tsc needs them, so...
        //@ts-expect-error wrong types
        foundry.documents.collections.Items.registerSheet(game.system.id, EquippableItemTemplateSheetV2, {
            makeDefault: !game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['_equippableItemTemplate'],
            label: game.i18n.localize('CSB.Settings.SheetName')
        });
        // VScode flags these as useless but tsc needs them, so...
        //@ts-expect-error wrong types
        foundry.documents.collections.Items.registerSheet(game.system.id, EquippableItemSheetV2, {
            makeDefault: !game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['equippableItem'],
            label: game.i18n.localize('CSB.Settings.SheetName')
        });
        // VScode flags these as useless but tsc needs them, so...
        //@ts-expect-error wrong types
        foundry.documents.collections.Items.registerSheet(game.system.id, SubTemplateItemSheetV2, {
            makeDefault: !game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['subTemplate'],
            label: game.i18n.localize('CSB.Settings.SheetName')
        });
        // VScode flags these as useless but tsc needs them, so...
        //@ts-expect-error wrong types
        foundry.documents.collections.Items.registerSheet(game.system.id, UserInputTemplateItemSheetV2, {
            makeDefault: !game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['userInputTemplate'],
            label: game.i18n.localize('CSB.Settings.SheetName')
        });
        // VScode flags these as useless but tsc needs them, so...
        //@ts-expect-error wrong types
        foundry.documents.collections.Items.registerSheet(game.system.id, ActiveEffectContainerItemSheetV2, {
            makeDefault: !game.settings.get(game.system.id, 'useApplicationV1'),
            types: ['activeEffectContainer'],
            label: game.i18n.localize('CSB.Settings.SheetName')
        });
        foundry.applications.apps.DocumentSheetConfig.unregisterSheet(ActiveEffect, 'core', foundry.applications.sheets.ActiveEffectConfig);
        foundry.applications.apps.DocumentSheetConfig.registerSheet(ActiveEffect, game.system.id, CustomActiveEffectConfig, {
            makeDefault: true,
            label: game.i18n.localize('CSB.Settings.SheetName')
        });
        // Helper-functions for handlebars
        Handlebars.registerHelper('eq', (a, b) => a == b);
        // Partials
        void foundry.applications.handlebars
            .getTemplate(`systems/${game.system.id}/templates/_template/partials/icon-formula.hbs`)
            .then((template) => {
            Handlebars.registerPartial('icon-formula', template);
        });
        void foundry.applications.handlebars
            .getTemplate(`systems/${game.system.id}/templates/_template/partials/icon-info.hbs`)
            .then((template) => {
            Handlebars.registerPartial('icon-info', template);
        });
        void foundry.applications.handlebars
            .getTemplate(`systems/${game.system.id}/templates/_template/partials/icon-no-delimiters.hbs`)
            .then((template) => {
            Handlebars.registerPartial('icon-no-delimiters', template);
        });
        componentFactory.addComponentType(Label);
        componentFactory.addComponentType(TextField);
        componentFactory.addComponentType(NumberField);
        componentFactory.addComponentType(RichTextArea);
        componentFactory.addComponentType(Checkbox);
        componentFactory.addComponentType(RadioButton);
        componentFactory.addComponentType(Meter);
        componentFactory.addComponentType(Dropdown);
        componentFactory.addComponentType(Picture);
        componentFactory.addComponentType(Panel);
        componentFactory.addComponentType(Table);
        componentFactory.addComponentType(DynamicTable);
        componentFactory.addComponentType(TabbedPanel);
        componentFactory.addComponentType(ItemContainer);
        componentFactory.addComponentType(ConditionalModifierList);
        componentFactory.addComponentType(ActiveEffectContainer);
        initChat();
        game.CustomSystemBuilder = {
            API: {
                Components: {
                    Component,
                    InputComponent,
                    Container,
                    ExtensibleTable,
                    componentFactory,
                    isChatSenderElement,
                    isAttributeBarElement,
                    isComputableElement
                },
                TemplateSystem,
                Errors: {
                    AlphanumericPatternError,
                    ComponentValidationError,
                    NotGreaterThanZeroError,
                    NotUniqueError,
                    RequiredFieldError,
                    UncomputableError
                },
                Formulas: {
                    ComputablePhrase,
                    Formula,
                    FormulaFunctionImporter
                }
            }
        };
        Hooks.callAll('customSystemBuilderInit');
        return true;
    }
    catch (err) {
        Logger.error(err.message, err);
    }
}
Hooks.once('init', function () {
    void initHook();
});
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
async function readyHook() {
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
    /*     let allReferencableProps = {};
    for (let template of game.actors.filter((actor) => actor.type === '_template')) {
        let allKeys = Object.keys(template.templateSystem.componentMap);

        allKeys.forEach((key) => {
            if (!key.includes('.')) allReferencableProps[key] = 0;
        });
    }
 */
    // game.model.Actor.character = { props: allReferencableProps };
    if (game.user.isGM) {
        if (!CustomItem.getEmbeddedItemsFolder(false)) {
            await Folder.createDocuments([
                {
                    name: CustomItem.EMBEDDED_ITEMS_FOLDER_NAME,
                    type: 'Item',
                    description: game.i18n.localize('CSB.Items.EmbeddedItemsFolderDescription'),
                    color: '#211A1B'
                }
            ]);
        }
        try {
            CustomActiveEffect.getContainerItem();
        }
        catch (_err) {
            await CustomItem.create({
                name: 'Active Effects',
                type: 'activeEffectContainer',
                img: 'icons/svg/aura.svg'
            });
        }
    }
    Hooks.callAll('customSystemBuilderReady');
}
Hooks.once('ready', function () {
    void readyHook();
});
// Prepare export buttons
Hooks.on('renderSettings', (sidebar, elt) => {
    if (!game.user.isGM)
        return;
    if (sidebar.element.id === 'settings') {
        const csbSection = createCSBSection(sidebar, elt);
        createManageActiveEffectButtons(csbSection);
        createExportButtons(csbSection);
    }
});
/**
 * Create Custom System Builder section
 * @ignore
 */
function createCSBSection(sidebar, _elt) {
    // Add everything cleanly into menu
    const titleDiv = document.createElement('h4');
    titleDiv.innerText = 'Custom System Builder';
    const documentationButton = document.createElement('button');
    documentationButton.innerHTML =
        '<i class="fas fa-book"></i>' + game.i18n.localize('CSB.Settings.DocumentationButton');
    const csbDiv = document.createElement('section');
    csbDiv.classList = 'csb-settings flexcol';
    documentationButton.addEventListener('click', () => {
        window.open('https://gitlab.com/custom-system-builder/custom-system-builder/-/wikis/home', '_blank')?.focus();
    });
    csbDiv.appendChild(titleDiv);
    csbDiv.appendChild(documentationButton);
    const helpBox = sidebar.element.querySelector('section.documentation');
    helpBox.insertAdjacentElement('beforebegin', csbDiv);
    return csbDiv;
}
/**
 * Create Manage Active Effects button
 * @ignore
 */
function createManageActiveEffectButtons(csbSection) {
    if (!game.user.isGM)
        return;
    /* -------------------------------------------- */
    /*  Active Effects button                       */
    /* -------------------------------------------- */
    const activeEffectsButton = document.createElement('button');
    activeEffectsButton.innerHTML =
        '<i class="fas fa-person-burst"></i>' + game.i18n.localize('CSB.Settings.CustomActiveEffects.Name');
    activeEffectsButton.title = game.i18n.localize('CSB.Settings.CustomActiveEffects.Hint');
    if (isModuleActive('dfreds-convenient-effects')) {
        activeEffectsButton.addEventListener('click', () => {
            document
                .querySelector('button.ui-control[data-tab="convenientEffects"]')
                ?.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true, composed: true }));
        });
    }
    else {
        activeEffectsButton.addEventListener('click', () => {
            void CustomActiveEffect.getContainerItem().sheet?.render(true);
        });
    }
    csbSection.appendChild(activeEffectsButton);
    /* -------------------------------------------- */
    /*  Status Effects button                       */
    /* -------------------------------------------- */
    const statusEffectsButton = document.createElement('button');
    statusEffectsButton.innerHTML =
        '<i class="fas fa-fire"></i>' + game.i18n.localize('CSB.Settings.CustomStatusEffects.Name');
    statusEffectsButton.title = game.i18n.localize('CSB.Settings.CustomStatusEffects.Hint');
    statusEffectsButton.addEventListener('click', () => {
        void new CustomStatusEffectsApplication().render({ force: true });
    });
    csbSection.appendChild(statusEffectsButton);
}
/**
 * Create export button
 * @ignore
 */
function createExportButtons(csbSection) {
    if (!game.user.isGM)
        return;
    /* -------------------------------------------- */
    /*  Export button                               */
    /* -------------------------------------------- */
    const exportButton = document.createElement('button');
    exportButton.innerHTML = '<i class="fas fa-download"></i>' + game.i18n.localize('CSB.Export.ExportButton');
    exportButton.addEventListener('click', exportTemplates);
    /* -------------------------------------------- */
    /*  Import button                               */
    /* -------------------------------------------- */
    const importButton = document.createElement('BUTTON');
    importButton.innerHTML = '<i class="fas fa-upload"></i>' + game.i18n.localize('CSB.Export.ImportButton');
    importButton.addEventListener('click', importTemplates);
    // Add everything cleanly into menu
    csbSection.appendChild(exportButton);
    csbSection.appendChild(importButton);
}
Hooks.on('getActorContextOptions', addReloadToActorContext);
/**
 * @ignore
 */
function addReloadToActorContext(_application, controls) {
    controls.push({
        callback: (li) => {
            if (li instanceof jQuery) {
                li = li[0];
            }
            const actor = game.actors.get(li.dataset.entryId);
            void actor?.templateSystem.reloadTemplate();
        },
        condition: (li) => {
            if (li instanceof jQuery) {
                li = li[0];
            }
            const actor = game.actors.get(li.dataset.entryId);
            return (actor?.type === 'character' &&
                game.user.hasRole(game.settings.get(game.system.id, 'minimumRoleTemplateReloading')));
        },
        icon: '<i class="fas fa-sync"></i>',
        name: game.i18n.localize('CSB.Sheets.ReloadTemplate')
    });
    controls.push({
        callback: (li) => {
            if (li instanceof jQuery) {
                li = li[0];
            }
            const actor = game.actors.get(li.dataset.entryId);
            void actor?.templateSystem.reloadAllSheets();
        },
        condition: (li) => {
            if (li instanceof jQuery) {
                li = li[0];
            }
            const actor = game.actors.get(li.dataset.entryId);
            return (actor?.type === '_template' &&
                game.user.hasRole(game.settings.get(game.system.id, 'minimumRoleTemplateReloading')));
        },
        icon: '<i class="fas fa-sync"></i>',
        name: game.i18n.localize('CSB.TemplateActions.ReloadCharacterSheets')
    });
}
Hooks.on('getItemContextOptions', addReloadToItemContext);
/**
 * @ignore
 */
function addReloadToItemContext(_application, controls) {
    controls.push({
        callback: (li) => {
            if (li instanceof jQuery) {
                li = li[0];
            }
            const item = game.items.get(li.dataset.entryId);
            void item?.templateSystem.reloadTemplate();
        },
        condition: (li) => {
            if (li instanceof jQuery) {
                li = li[0];
            }
            const item = game.items.get(li.dataset.entryId);
            return (item?.type === 'equippableItem' &&
                game.user.hasRole(game.settings.get(game.system.id, 'minimumRoleTemplateReloading')));
        },
        icon: '<i class="fas fa-sync"></i>',
        name: game.i18n.localize('CSB.Sheets.ReloadTemplate')
    });
    controls.push({
        callback: (li) => {
            if (li instanceof jQuery) {
                li = li[0];
            }
            const item = game.items.get(li.dataset.entryId);
            void item?.templateSystem.reloadAllSheets();
        },
        condition: (li) => {
            if (li instanceof jQuery) {
                li = li[0];
            }
            const item = game.items.get(li.dataset.entryId);
            return (item?.type === '_equippableItemTemplate' &&
                game.user.hasRole(game.settings.get(game.system.id, 'minimumRoleTemplateReloading')));
        },
        icon: '<i class="fas fa-sync"></i>',
        name: game.i18n.localize('CSB.TemplateActions.ReloadItemSheet')
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
        callback: (_chatlog, messageText, _chatdata) => {
            void postCustomSheetRoll(messageText, true);
            return {};
        }
    });
    chatCommands.register({
        name: '/sheetRoll',
        module: game.system.id,
        description: game.i18n.localize('CSB.ChatCommands.SheetRollCommand'),
        icon: "<i class='fas fa-dice-d20'></i>",
        callback: (_chatlog, messageText, _chatdata) => {
            void postCustomSheetRoll(messageText, false);
            return {};
        }
    });
});
