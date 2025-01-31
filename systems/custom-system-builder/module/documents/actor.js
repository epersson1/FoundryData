/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import TemplateSystem from './templateSystem.js';
/**
 * Extend the base Actor document
 * @extends {Actor}
 */
export class CustomActor extends Actor {
    /**
     * Is this actor a Template?
     * @return {boolean}
     */
    get isTemplate() {
        return this.type === '_template';
    }
    /**
     * Is this actor a Template?
     * @return {boolean}
     */
    get isAssignableTemplate() {
        return this.type === '_template';
    }
    /**
     * Template system in charge of generic templating handling
     * @return {TemplateSystem}
     */
    get templateSystem() {
        if (!this._templateSystem) {
            this._templateSystem = new TemplateSystem(this);
        }
        return this._templateSystem;
    }
    /**
     * @override
     * @ignore
     */
    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        if (this.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            if (!data.flags?.[game.system.id]?.version) {
                this.setFlag(game.system.id, 'version', game.system.version);
            }
        }
    }
    /**
     * @override
     * @ignore
     */
    exportToJSON(options = {}) {
        super.exportToJSON({
            ...options,
            keepId: true
        });
    }
    /**
     * @override
     * @param {string} json
     * @inheritDoc
     * @ignore
     */
    async importFromJSON(json) {
        let res = super.importFromJSON(json);
        await this.update({
            system: {
                templateSystemUniqueVersion: (Math.random() * 0x100000000) >>> 0
            }
        });
        return res;
    }
    /**
     * @override
     * @inheritDoc
     * @ignore
     */
    prepareDerivedData() {
        this.templateSystem.prepareData();
    }
    /**
     * @override
     * @inheritDoc
     * @ignore
     */
    getRollData() {
        // Prepare character roll data.
        const data = super.getRollData();
        return this.templateSystem.getRollData(data);
    }
    /**
     * @override
     * @inheritDoc
     * @ignore
     */
    async getTokenDocument(data = {}, options = {}) {
        const tokenDocument = await super.getTokenDocument(data, options);
        const rollData = this.getRollData();
        // Prepare character roll data.
        for (const prop in rollData) {
            tokenDocument[prop] = rollData[prop];
        }
        return tokenDocument;
    }
    /**
     * Handle how changes to a Token attribute bar are applied to the Actor.
     * @param {string} attribute    The attribute path
     * @param {number} value        The target attribute value
     * @param {boolean} isDelta     Whether the number represents a relative change (true) or an absolute change (false)
     * @param {boolean} isBar       Whether the new value is part of an attribute bar, or just a direct value
     * @returns {Promise<documents.Actor>}  The updated Actor document
     * @ignore
     * @override
     */
    async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
        const current = foundry.utils.getProperty(this.system, attribute);
        if (isBar && attribute.startsWith('attributeBar')) {
            let barDefinition = foundry.utils.getProperty(this.system, attribute);
            if (barDefinition) {
                if (isDelta)
                    value = Number(current.value) + value;
                value = Math.clamped(0, value, barDefinition.max);
                attribute = 'props.' + barDefinition.key;
                isBar = false;
                isDelta = false;
            }
        }
        return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
    }
    /**
     * Forward the roll function to the TemplateSystem
     * @param args Roll arguments
     * @returns {Promise<ComputablePhrase>} The rolled Computable Phrase
     * @see {@link TemplateSystem.roll}
     */
    async roll(...args) {
        return this.templateSystem.roll(...args);
    }
    /**
     * Forwards the reload template function to the TemplateSystem
     * @param  {...unknown} args The reload Template args
     * @see {@link TemplateSystem.reloadTemplate}
     */
    async reloadTemplate(...args) {
        return this.templateSystem.reloadTemplate(...args);
    }
}
Hooks.on('preCreateItem', (item, createData, options, userId) => {
    if (item.isOwned) {
        const actor = item.parent;
        if (!actor.templateSystem.canOwnItem(item))
            return false; // prevent creation
    }
});
