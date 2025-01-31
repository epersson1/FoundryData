/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import TemplateSystem from './templateSystem.js';
export class CustomItem extends Item {
    /**
     * Is this item a Template ?
     * @return {boolean}
     */
    get isTemplate() {
        return (this.type === '_equippableItemTemplate' || this.type === 'subTemplate' || this.type === 'userInputTemplate');
    }
    /**
     * Is this item an assignable Template ?
     * @return {boolean}
     */
    get isAssignableTemplate() {
        return this.type === '_equippableItemTemplate';
    }
    /**
     * Template system in charge of generic templating handling
     * @type {TemplateSystem}
     */
    get templateSystem() {
        if (!this._templateSystem) {
            this._templateSystem = new TemplateSystem(this);
        }
        return this._templateSystem;
    }
    /**
     * @ignore
     */
    get items() {
        return new Collection();
    }
    /**
     * Is the current user allowed to edit Item Modifiers?
     * @returns {boolean}
     */
    get canEditModifiers() {
        return game.user.hasRole(game.settings.get(game.system.id, 'minimumRoleEditItemModifiers'));
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
            if (!this.parent) {
                this.update({
                    system: {
                        uniqueId: data._id
                    }
                });
            }
        }
    }
    /**
     * @override
     * @ignore
     */
    _preCreateEmbeddedDocuments(embeddedName, result, options, userId) {
        if (embeddedName === 'Item') {
            if (this.isTemplate) {
                result.splice(0, result.length);
            }
            else {
                let idxToRemove = [];
                for (let document of result) {
                    if (document.type !== 'equippableItem') {
                        idxToRemove.push(result.indexOf(document));
                    }
                }
                for (let i = idxToRemove.length - 1; i >= 0; i--) {
                    result.splice(idxToRemove[i], 1);
                }
            }
        }
    }
    /**
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
     * @ignore
     */
    async importFromJSON(json) {
        const updated = await super.importFromJSON(json);
        const imported = JSON.parse(json);
        const res = Item.create({
            ...updated,
            _id: imported._id
        }, {
            keepId: true
        });
        updated.delete();
        return res;
    }
    /**
     * @override
     * @ignore
     */
    prepareDerivedData() {
        this.templateSystem.prepareData();
    }
}
