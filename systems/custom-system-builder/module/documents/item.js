/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import TemplateSystem from './templateSystem.js';
export class CustomItem extends Item {
    static getEmbeddedItemsFolder(warnIfNotFound = true) {
        const folderId = game.items.folders.getName(this.EMBEDDED_ITEMS_FOLDER_NAME);
        if (!folderId && warnIfNotFound) {
            ui.notifications.warn(game.i18n.format('CSB.UserMessages.EmbeddedItemsFolderNotFound', {
                EMBEDDED_ITEMS_FOLDER_NAME: this.EMBEDDED_ITEMS_FOLDER_NAME
            }));
        }
        return folderId;
    }
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
     *  @returns {EmbeddedCollection<CustomItem, ItemData>}
     */
    get items() {
        let baseCollection = game.items;
        if (this.isEmbedded) {
            baseCollection = this.parent.items;
        }
        return new Collection(baseCollection.filter((item) => item.system.container === this.id).map((item) => [item.id, item]));
    }
    getItems() {
        return this.items;
    }
    /**
     * @return {CustomActor | CustomItem | null}
     */
    getParent() {
        return this.system.container
            ? this.isEmbedded
                ? this.parent.items.get(this.system.container)
                : game.items.find((item) => item.id === this.system.container)
            : this.parent;
    }
    getParentCollection() {
        if (this.isEmbedded) {
            return this.parent.items;
        }
        else {
            if (this.pack) {
                return game.packs.get(this.pack).index;
            }
            else {
                return game.items;
            }
        }
    }
    /**
     * Returns the list of the ids of items containing this item
     * @returns {Array<string>}
     */
    getAllContainerIds() {
        const parent = this.getParent();
        if (!(parent instanceof CustomItem)) {
            return [];
        }
        return [parent.id, ...parent.getAllContainerIds()];
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
    async _preDelete(options, userId) {
        // Handling of nested items
        let parentCollection = game.items;
        if (this.isEmbedded) {
            parentCollection = this.parent.items;
        }
        parentCollection
            .filter((item) => item.system.container === this.id)
            .forEach((item) => {
            item.delete();
        });
        super._preDelete(options, userId);
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
    static async create(data, options) {
        const newItem = await super.create(data, options);
        for (const subItem of data.items ?? []) {
            subItem.system.container = newItem.id;
            await CustomItem.create(subItem, { ...options, folder: this.getEmbeddedItemsFolder() });
        }
        return newItem;
    }
    /**
     * Prepare creation data for the provided items and any items contained within them. The data created by this method
     * can be passed to `createDocuments` with `keepId` always set to true to maintain links to container contents.
     * @param {CustomItem[]} items                     Items to create.
     * @param {CustomItem} Container                     Container for the items.
     * @returns {Promise<ItemDataConstructorData & Record<string, unknown>[]>}                Data for items to be created.
     */
    static async createWithContents(items, container) {
        let depth = 0;
        const createItemData = async (item, containerId, depth) => {
            let newItemData = item;
            if (!newItemData)
                return;
            if (newItemData instanceof Item)
                newItemData = newItemData.toObject();
            foundry.utils.mergeObject(newItemData, {
                'system.container': containerId,
                folder: this.getEmbeddedItemsFolder()
            });
            newItemData._id = foundry.utils.randomID();
            created.push(newItemData);
            if (item.items) {
                if (depth > CustomItem.MAX_DEPTH) {
                    ui.notifications.warn(game.i18n.format('CSB.UserMessages.ItemMaxDepth', { depth: PhysicalItemTemplate.MAX_DEPTH }));
                }
                for (const doc of item.items)
                    await createItemData(doc, newItemData._id, depth + 1);
            }
        };
        const created = [];
        for (const item of items)
            await createItemData(item, container?.id, depth);
        return created;
    }
    /**
     * @ignore
     */
    toCompendium(pack, options) {
        const data = super.toCompendium(pack, options);
        data.items = [];
        for (let item of this.items) {
            data.items.push(item.toCompendium(pack, options));
        }
        return data;
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
    async importFromJSON(json, subFolder = false) {
        const updated = await super.importFromJSON(json);
        const imported = JSON.parse(json);
        const res = await CustomItem.create({
            ...updated,
            _id: imported._id,
            folder: subFolder ? CustomItem.getEmbeddedItemsFolder() : updated.folder
        }, {
            keepId: true
        });
        for (const subItemJSON of imported.items) {
            subItemJSON.system.container = res.id;
            CustomItem.create({
                ...subItemJSON,
                folder: CustomItem.getEmbeddedItemsFolder()
            });
        }
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
/**
 * Maximum depth items can be nested in containers.
 * @type {number}
 */
CustomItem.MAX_DEPTH = 5;
CustomItem.EMBEDDED_ITEMS_FOLDER_NAME = 'CSB - Embedded Items Folder - DO NOT RENAME OR REMOVE';
