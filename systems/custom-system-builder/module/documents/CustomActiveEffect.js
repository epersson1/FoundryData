/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { isFullBuilderTemplateEntity } from '../definitions.js';
import { isModuleActive } from '../utils.js';
import Logger from '../Logger.js';
import CustomItem from './CustomItem.js';
import CustomActor from './CustomActor.js';
export default class CustomActiveEffect extends ActiveEffect {
    static CONTAINER_ITEM;
    static async _preCreateOperation(documents, operation, user) {
        if (user.id === game.user.id) {
            for (const effect of documents) {
                if (!effect.getFlag(game.system.id, 'originalUuid') || isFullBuilderTemplateEntity(effect.parent)) {
                    const sourceUpdates = {
                        [`flags.${game.system.id}.originalParentId`]: effect.parent.id,
                        [`flags.${game.system.id}.originalId`]: effect.id,
                        [`flags.${game.system.id}.originalUuid`]: effect.uuid,
                        [`flags.${game.system.id}.isFromTemplate`]: isFullBuilderTemplateEntity(effect.parent)
                    };
                    effect.updateSource(sourceUpdates);
                }
            }
        }
        return super._preCreateOperation(documents, operation, user);
    }
    get count() {
        if (!isModuleActive('statuscounter')) {
            return 1;
        }
        if (!this.statusCounter) {
            return 1;
        }
        return (foundry.utils.getProperty(this, this.statusCounter.dataSource) ?? 1);
    }
    get tags() {
        return this.system.tags ?? [];
    }
    apply(actor, change, shouldThrow = false) {
        if (!CustomActor.isCharacterActor(this.parent) && !CustomItem.isEquippableItem(this.parent)) {
            return {};
        }
        const props = {
            ...this.parent.system.props,
            target: actor.system.props
        };
        let changeKeys = [];
        try {
            changeKeys = ComputablePhrase.computeMessageStatic(change.key, props, {
                source: `activeEffect.${this.name}.key`,
                triggerEntity: this.parent.templateSystem
            }).result.split(',');
            let changes = {};
            for (const key of changeKeys) {
                change.key = key;
                let refInTarget = false;
                if (change.key.startsWith('target.')) {
                    change.key = change.key.substring(7);
                    refInTarget = true;
                }
                if (change.key.startsWith('props')) {
                    change.key = `system.${change.key}`;
                }
                else if (!change.key.startsWith('system')) {
                    change.key = `system.props.${change.key}`;
                }
                let reference = undefined;
                if (foundry.utils.getProperty(actor, change.key) === undefined) {
                    change.key = key;
                }
                else {
                    const sanitizedKey = change.key.substring(13);
                    if (sanitizedKey.includes('.')) {
                        const splitKey = sanitizedKey.split('.');
                        reference = `${refInTarget ? 'target.' : ''}${splitKey[0]}.${splitKey[1]}`;
                    }
                }
                change.value = ComputablePhrase.computeMessageStatic(change.value, props, {
                    source: `activeEffect.${this.name}.value`,
                    triggerEntity: this.parent.templateSystem,
                    reference
                }).result;
                changes = { ...changes, ...super.apply(actor, change) };
            }
            return changes;
        }
        catch (err) {
            if (shouldThrow) {
                throw err;
            }
            Logger.error(`Error when computing active effet value ${this.name} - ${change.key} for entity ${actor.name}`, err, { keys: changeKeys });
            return {};
        }
    }
    /**
     * Create an ActiveEffect instance from status effect data.
     */
    static async _fromStatusEffect(statusId, effectData, options) {
        const statusEffect = CONFIG.statusEffects.find((e) => e.id === statusId);
        if (statusEffect && statusEffect.linkedEffectId) {
            const activeEffect = this.getPredefinedEffect(statusEffect.linkedEffectId);
            if (activeEffect) {
                return activeEffect;
            }
        }
        return super._fromStatusEffect(statusId, effectData, options);
    }
    /**
     * Adds or update the CustomActiveEffect to the predefined list
     */
    async addToPredefinedEffects() {
        const predefinedEffects = CustomActiveEffect.getContainerItem().effects;
        const existingEffect = predefinedEffects.getName(this.name);
        if (existingEffect) {
            await existingEffect.update(this.toJSON());
        }
        else {
            await CustomActiveEffect.getContainerItem().createEmbeddedDocuments('ActiveEffect', [
                this.toJSON()
            ]);
        }
    }
    /**
     * Removes the CustomActiveEffect from the predefined list by its name
     */
    async removeFromPredefinedEffects() {
        const predefinedEffects = CustomActiveEffect.getContainerItem().effects;
        const existingEffect = predefinedEffects.getName(this.name);
        if (existingEffect) {
            await existingEffect.delete();
        }
    }
    static getContainerItem() {
        if (!this.CONTAINER_ITEM) {
            const foundItem = game.items?.find((item) => CustomItem.isActiveEffectContainer(item));
            if (!foundItem) {
                throw new Error('Container Item not found. Please reload.');
            }
            this.CONTAINER_ITEM = foundItem;
        }
        return this.CONTAINER_ITEM;
    }
    /**
     * Get the basic information of predefined Active Effects
     * @returns An array with the Ids and Names of the predefined Active Effects
     */
    static getPredefinedEffectsData() {
        if (!isModuleActive('dfreds-convenient-effects')) {
            return this.getContainerItem()
                .effects.map((effect) => {
                return { id: effect.id, name: effect.name, tags: effect.tags };
            })
                .sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }
        else {
            const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects').api;
            return convenientEffectsApiSource
                .findEffects()
                .map((effect) => {
                return { id: effect.id, name: effect.name, tags: effect.tags };
            })
                .sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }
    }
    static getPredefinedEffect(effectId) {
        if (!isModuleActive('dfreds-convenient-effects')) {
            return this.getContainerItem().effects.get(effectId);
        }
        else {
            const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects').api;
            return convenientEffectsApiSource.findEffect({ effectId });
        }
    }
    /**
     * Add a predefined Active Effect to an entity
     * @param entity The entity to add the effect to
     * @param effectId The predefined effect ID to add
     */
    static async addActiveEffect(entity, effectId) {
        if (!isModuleActive('dfreds-convenient-effects')) {
            const predefinedEffects = CustomActiveEffect.getContainerItem().effects;
            const existingEffect = predefinedEffects.get(effectId);
            if (existingEffect) {
                if (entity instanceof CustomActor) {
                    await entity.createEmbeddedDocuments('ActiveEffect', [existingEffect.toJSON()]);
                }
                else {
                    await entity.createEmbeddedDocuments('ActiveEffect', [existingEffect.toJSON()]);
                }
                return existingEffect;
            }
        }
        else {
            const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects').api;
            await convenientEffectsApiSource.addEffect({ effectId: String(effectId), uuid: entity.uuid });
        }
    }
    /**
     * Removes a predefined Active Effect from an entity
     * @param entity The entity to add the effect to
     * @param effectId The predefined effect ID to add
     */
    static async removeActiveEffects(entity, effects) {
        const toRemoveNormally = [];
        if (!isModuleActive('dfreds-convenient-effects')) {
            toRemoveNormally.push(...effects.map((effect) => effect.id));
        }
        else {
            const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects').api;
            for (const effect of effects) {
                if (effect.getFlag('dfreds-convenient-effects', 'isConvenient')) {
                    await convenientEffectsApiSource.removeEffect({
                        effectId: effect.getFlag('dfreds-convenient-effects', 'ceEffectId'),
                        uuid: entity.uuid
                    });
                }
                else {
                    toRemoveNormally.push(effect.id);
                }
            }
        }
        if (entity instanceof CustomActor) {
            await entity.deleteEmbeddedDocuments('ActiveEffect', toRemoveNormally);
        }
        else {
            await entity.deleteEmbeddedDocuments('ActiveEffect', toRemoveNormally);
        }
    }
}
Hooks.on('applyActiveEffect', applyCustomActiveEffectChange);
function applyCustomActiveEffectChange(actor, change, current, _delta, changes) {
    if (change.mode !== CONST.ACTIVE_EFFECT_MODES.CUSTOM) {
        return;
    }
    try {
        const castCurrent = current;
        changes[change.key] = ComputablePhrase.computeMessageStatic(change.value, { ...actor.system.props, current: castCurrent }, {
            source: `activeEffect.${change.key}.value`,
            triggerEntity: actor.templateSystem
        }).result;
    }
    catch (_err) {
        changes[change.key] = 'ERROR';
    }
}
Hooks.on('preCreateActiveEffect', (effect) => {
    if (isModuleActive('dfreds-convenient-effects') &&
        effect.parent.type === 'activeEffectContainer' &&
        !effect?.flags?.['dfreds-convenient-effects']) {
        const convenientEffectsApiSource = game.modules.get('dfreds-convenient-effects')
            .api;
        effect.flags['dfreds-convenient-effects'] = {
            fromDrop: true
        };
        void convenientEffectsApiSource.createNewEffects({
            existingFolderId: effect.parent.id,
            effectsData: [effect.toJSON()]
        });
        return false;
    }
    let sourceUpdates = { 'flags.statuscounter.config.multiplyEffect': true };
    if (effect.parent.type === 'activeEffectContainer') {
        sourceUpdates = {
            ...sourceUpdates,
            [`flags.${game.system.id}.isPredefined`]: true,
            'flags.dfreds-convenient-effects.ceEffectId': effect.name?.slugify(),
            'flags.dfreds-convenient-effects.isConvenient': true,
            'flags.dfreds-convenient-effects.isViewable': true,
            'flags.dfreds-convenient-effects.isTemporary': false
        };
    }
    effect.updateSource(sourceUpdates);
    return true;
});
