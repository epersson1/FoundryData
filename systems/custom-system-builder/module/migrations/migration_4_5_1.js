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
import Logger from '../Logger.js';
import { beginMigration, finishMigration, logProgress } from './migrationUtils.js';
import { MODIFIER_OPERATOR } from '../interfaces/Modifier.js';
import CustomStatusEffectsApplication from '../applications/CustomStatusEffectsApplication.js';
import CustomActiveEffect from '../documents/CustomActiveEffect.js';
async function processMigration() {
    const versionNumber = '4.5.1';
    if (game.settings.get(game.system.id, 'show451ConversionPopUp')) {
        const shouldCheck = (await foundry.applications.api.DialogV2.confirm({
            window: { title: 'Check Modifiers existence ?' },
            content: `${game.i18n.localize('CSB.Modifier.ConversionDialog.CheckText')}<span><input type="checkbox" id="CSB-4-5-1-do-not-show-again" /><label for="CSB-4-5-1-do-not-show-again">${game.i18n.localize('CSB.Modifier.ConversionDialog.Checkbox')}</label></span>`,
            defaultYes: false,
            modal: true,
            rejectClose: true,
            yes: {
                action: 'yes',
                label: 'Yes',
                callback: async (_event, button, _dialog) => {
                    await saveDoNotShowSetting(button);
                    return true;
                }
            },
            no: {
                action: 'no',
                label: 'No',
                callback: async (_event, button, _dialog) => {
                    await saveDoNotShowSetting(button);
                    return false;
                }
            }
        }));
        if (shouldCheck) {
            const characters = [].concat(Array.from(game.scenes)
                .flatMap((scene) => Array.from(scene.tokens))
                .filter((token) => !token.actorLink && token.actor)
                .map((token) => token.actor), game.actors.filter((actor) => actor.isCharacterActor()));
            const templates = game.actors.filter((actor) => actor.isTemplateActor());
            const filteredCollection = characters
                .flatMap((entity) => Array.from(entity.items))
                .concat(Array.from(game.items))
                .filter((item) => item.isEquippableItem() || item.isEquippableItemTemplate());
            const existingItemModifiers = filteredCollection.filter((item) => item.system.modifiers && item.system.modifiers.length > 0);
            const existingStatusEffectsModifiers = templates.filter((template) => Object.values(template.system.statusEffects).flat().length > 0);
            if (existingItemModifiers.length > 0 || existingStatusEffectsModifiers.length > 0) {
                Logger.warn('Existing modifiers on these entities', existingItemModifiers, existingStatusEffectsModifiers);
                const shouldMigrate = (await foundry.applications.api.DialogV2.confirm({
                    window: { title: 'Convert Modifiers to ActiveEffects ?' },
                    content: `${game.i18n.localize('CSB.Modifier.ConversionDialog.Text')}<span><input type="checkbox" id="CSB-4-5-1-do-not-show-again" /><label for="CSB-4-5-1-do-not-show-again">${game.i18n.localize('CSB.Modifier.ConversionDialog.Checkbox')}</label></span>`,
                    defaultYes: false,
                    modal: true,
                    rejectClose: true,
                    yes: {
                        action: 'yes',
                        label: 'Yes',
                        callback: async (_event, button, _dialog) => {
                            await saveDoNotShowSetting(button);
                            return true;
                        }
                    },
                    no: {
                        action: 'no',
                        label: 'No',
                        callback: async (_event, button, _dialog) => {
                            await saveDoNotShowSetting(button);
                            return false;
                        }
                    }
                }));
                if (shouldMigrate) {
                    const notification = beginMigration(versionNumber);
                    let modifierCount = 0;
                    let activeEffectCount = 0;
                    for (let i = 0; i < filteredCollection.length; i++) {
                        const item = filteredCollection[i];
                        const result = await convertItemModifiers(item);
                        modifierCount += result.modifierCount;
                        activeEffectCount += result.activeEffectCount;
                        logProgress(item, versionNumber, i, filteredCollection.length, notification);
                    }
                    for (let i = 0; i < templates.length; i++) {
                        const template = templates[i];
                        const result = await convertStatusModifiers(template);
                        modifierCount += result.modifierCount;
                        activeEffectCount += result.activeEffectCount;
                        logProgress(template, versionNumber, i, filteredCollection.length, notification);
                    }
                    Logger.info(`Converted ${modifierCount} modifiers in ${activeEffectCount} active effects across ${filteredCollection.length} items`);
                    finishMigration(versionNumber, notification);
                    if (existingStatusEffectsModifiers.length > 0) {
                        await foundry.applications.api.DialogV2.prompt({
                            window: { title: game.i18n.localize('CSB.Settings.CustomStatusEffects.Name') },
                            content: game.i18n.localize('CSB.Modifier.ConversionDialog.OpenStatusConfiguration'),
                            modal: true
                        });
                        await new CustomStatusEffectsApplication().render({ force: true });
                    }
                }
            }
        }
    }
}
async function saveDoNotShowSetting(button) {
    const html = button.closest('dialog');
    const isChecked = html.querySelector('#CSB-4-5-1-do-not-show-again')?.checked ?? false;
    await game.settings.set(game.system.id, 'show451ConversionPopUp', !isChecked);
}
async function convertItemModifiers(item) {
    const modifiers = item.system.modifiers ?? [];
    const newAEData = convertModifiersToActiveEffects(modifiers, item.parent?.system.activeConditionalModifierGroups ?? []);
    await item.createEmbeddedDocuments('ActiveEffect', newAEData);
    await item.update({
        system: {
            modifiers: []
        }
    });
    return {
        modifierCount: modifiers.length,
        activeEffectCount: newAEData.length
    };
}
async function convertStatusModifiers(template) {
    let modifierCount = 0;
    let activeEffectCount = 0;
    let newAEData = [];
    for (const statusKey in template.system.statusEffects) {
        const modifiers = template.system.statusEffects?.[statusKey] ?? [];
        newAEData = newAEData.concat(convertModifiersToActiveEffects(modifiers, undefined, `${statusKey} - ${template.name}`));
        modifierCount += modifiers.length;
        activeEffectCount += newAEData.length;
    }
    await CustomActiveEffect.getContainerItem().createEmbeddedDocuments('ActiveEffect', newAEData);
    await template.update({
        system: {
            statusEffects: Object.fromEntries(Object.entries(template.system.statusEffects).map(([key]) => {
                return [`-=${key}`, null];
            }))
        }
    });
    return {
        modifierCount,
        activeEffectCount
    };
}
function convertModifiersToActiveEffects(modifiers, activeModifierGroups, overrideName) {
    const modifiersByGroupName = {};
    const newAEData = [];
    modifiers.forEach((mod) => {
        const groupName = overrideName ?? mod.conditionalGroup ?? '';
        if (!modifiersByGroupName[groupName]) {
            modifiersByGroupName[groupName] = [];
        }
        modifiersByGroupName[groupName].push(mod);
    });
    Object.entries(modifiersByGroupName).forEach(([name, modifiers]) => {
        const changes = [];
        modifiers.forEach((mod) => {
            let mode = CONST.ACTIVE_EFFECT_MODES.ADD;
            let signOperator = null;
            switch (mod.operator) {
                case MODIFIER_OPERATOR.ADD:
                    mode = CONST.ACTIVE_EFFECT_MODES.ADD;
                    break;
                case MODIFIER_OPERATOR.MULTIPLY:
                    mode = CONST.ACTIVE_EFFECT_MODES.MULTIPLY;
                    break;
                case MODIFIER_OPERATOR.SUBTRACT:
                    mode = CONST.ACTIVE_EFFECT_MODES.ADD;
                    signOperator = '-';
                    break;
                case MODIFIER_OPERATOR.DIVIDE:
                    mode = CONST.ACTIVE_EFFECT_MODES.MULTIPLY;
                    signOperator = '1/';
                    break;
                case MODIFIER_OPERATOR.SET:
                    mode = CONST.ACTIVE_EFFECT_MODES.OVERRIDE;
                    break;
            }
            changes.push({
                key: mod.key,
                value: signOperator ? `${signOperator}(${mod.formula})` : mod.formula,
                priority: mod.priority,
                mode: mode
            });
        });
        newAEData.push({
            name: name === '' ? game.i18n.localize('CSB.Modifier.DefaultModifierGroupName') : name,
            transfer: true,
            type: 'base',
            img: 'icons/svg/aura.svg',
            changes,
            system: {
                tags: name === ''
                    ? [game.i18n.localize('CSB.Modifier.PassiveModifier')]
                    : [game.i18n.localize('CSB.Modifier.ActiveModifier')]
            },
            disabled: name !== '' && activeModifierGroups !== undefined ? !activeModifierGroups.includes(name) : false
        });
    });
    return newAEData;
}
export default {
    processMigration
};
