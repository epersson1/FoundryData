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
import { isModuleActive } from '../utils.js';
import CustomActiveEffect from '../documents/CustomActiveEffect.js';
export default class CustomActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {
    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        window: {
            ...super.DEFAULT_OPTIONS.window,
            controls: [
                {
                    label: 'CSB.ActiveEffects.AddToPredefinedButton.Text',
                    icon: 'fas fa-file-export',
                    action: 'addToPredefinedActiveEffects',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                    visible: CustomActiveEffectConfig.effectNotExists
                },
                {
                    label: 'CSB.ActiveEffects.UpdatePredefinedButton.Text',
                    icon: 'fas fa-file-export',
                    action: 'addToPredefinedActiveEffects',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                    visible: CustomActiveEffectConfig.effectExists
                },
                {
                    label: 'CSB.ActiveEffects.RemoveFromPredefinedButton.Text',
                    icon: 'fas fa-trash',
                    action: 'removeFromPredefinedActiveEffects',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                    visible: CustomActiveEffectConfig.effectExists
                }
            ]
        },
        actions: {
            ...super.DEFAULT_OPTIONS.actions,
            addToPredefinedActiveEffects: CustomActiveEffectConfig.addToPredefinedActiveEffects,
            removeFromPredefinedActiveEffects: CustomActiveEffectConfig.removeFromPredefinedActiveEffects
        }
    };
    static effectExists() {
        if (!isModuleActive('dfreds-convenient-effects')) {
            const predefinedEffects = Array.from(CustomActiveEffect.getContainerItem().effects).map((effect) => effect.name);
            return predefinedEffects.includes(this.document.name);
        }
        return false;
    }
    static effectNotExists() {
        if (!isModuleActive('dfreds-convenient-effects')) {
            const predefinedEffects = Array.from(CustomActiveEffect.getContainerItem().effects).map((effect) => effect.name);
            return !predefinedEffects.includes(this.document.name);
        }
        return false;
    }
    static addToPredefinedActiveEffects(_event, _target) {
        const activeEffect = this.document;
        void activeEffect.addToPredefinedEffects().then(() => {
            void this.close().then(() => {
                void activeEffect.sheet.render({ force: true });
            });
        });
    }
    static removeFromPredefinedActiveEffects(_event, _target) {
        const activeEffect = this.document;
        void activeEffect.removeFromPredefinedEffects().then(() => {
            void this.close().then(() => {
                void activeEffect.sheet.render({ force: true });
            });
        });
    }
}
Hooks.on('renderCustomActiveEffectConfig', (activeEffectConfig, html, _data) => {
    activeEffectConfig.setPosition({
        height: 'auto',
        width: 630
    });
    if (isModuleActive('statuscounter')) {
        const footerSection = html.querySelector('footer');
        const counterConfigure = document.createElement('button');
        counterConfigure.type = 'button';
        counterConfigure.addEventListener('click', () => {
            void activeEffectConfig.document.statusCounter?.configure();
        });
        counterConfigure.textContent = game.i18n.localize('CSB.ActiveEffects.ConfigureCounter');
        footerSection.prepend(counterConfigure);
    }
    const detailsSection = html.querySelector("section[data-tab='details']");
    const tagsFormGroup = document.createElement('div');
    tagsFormGroup.className = 'form-group';
    const tagsLabel = document.createElement('label');
    tagsLabel.innerHTML = game.i18n.localize('CSB.ComponentProperties.ActiveEffectContainer.FilterByTags.FieldLabel');
    const tagsFormFields = document.createElement('div');
    tagsFormFields.className = 'form-fields';
    tagsFormFields.innerHTML = `<${foundry.applications.elements.HTMLStringTagsElement.tagName} name='system.tags' value='${activeEffectConfig.document.tags.join(',')}'></${foundry.applications.elements.HTMLStringTagsElement.tagName}>`;
    // tagsFormFields.append(tagsElement);
    tagsFormGroup.append(tagsLabel, tagsFormFields);
    detailsSection?.append(tagsFormGroup);
    const effectsSection = html.querySelector("section[data-tab='changes']");
    const effectRows = effectsSection?.querySelectorAll('li');
    effectRows?.forEach((row) => {
        const keyInput = row.querySelector('.key > input');
        const keyTextarea = document.createElement('textarea');
        keyTextarea.name = keyInput.name;
        keyTextarea.innerHTML = keyInput.value;
        keyInput.replaceWith(keyTextarea);
        const valueInput = row.querySelector('.value > input');
        const valueTextarea = document.createElement('textarea');
        valueTextarea.name = valueInput.name;
        valueTextarea.innerHTML = valueInput.value;
        valueInput.replaceWith(valueTextarea);
    });
});
