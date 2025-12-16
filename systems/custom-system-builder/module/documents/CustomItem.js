/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import Logger from '../Logger.js';
import { getGameCollection } from '../utils.js';
import { BaseItemDataModel } from './model/itemModel.js';
import TemplateSystem from './TemplateSystem.js';
export const CustomItemTypes = [
    'equippableItem',
    '_equippableItemTemplate',
    'subTemplate',
    'userInputTemplate',
    'activeEffectContainer'
];
export default class CustomItem extends Item {
    static isEquippableItem(item) {
        return !!item && item instanceof CustomItem && item.type === 'equippableItem';
    }
    static isEquippableItemTemplate(item) {
        return !!item && item instanceof CustomItem && item.type === '_equippableItemTemplate';
    }
    static isSubTemplate(item) {
        return !!item && item instanceof CustomItem && item.type === 'subTemplate';
    }
    static isUserInputTemplate(item) {
        return !!item && item instanceof CustomItem && item.type === 'userInputTemplate';
    }
    static isActiveEffectContainer(item) {
        return !!item && item instanceof CustomItem && item.type === 'activeEffectContainer';
    }
    static isTemplateItem(item) {
        return this.isEquippableItemTemplate(item) || this.isSubTemplate(item) || this.isUserInputTemplate(item);
    }
    static DEFAULT_IMG(itemType = 'base') {
        switch (itemType) {
            case 'equippableItem':
                return `icons/svg/item-bag.svg`;
            case 'activeEffectContainer':
                return `icons/svg/aura.svg`;
            case '_equippableItemTemplate':
                return `systems/${game.system.id}/img/template-logo.svg`;
            case 'subTemplate':
                return `systems/${game.system.id}/img/subtemplate-logo.svg`;
            case 'userInputTemplate':
                return `systems/${game.system.id}/img/user-input-logo.svg`;
            default:
                return `icons/svg/item-bag.svg`;
        }
    }
    static async createDialog(data, createOptions, options = {}) {
        options.types = this.TYPES.filter((type) => type !== CONST.BASE_DOCUMENT_TYPE && type !== 'activeEffectContainer');
        return super.createDialog(data, createOptions, options);
    }
    /**
     * Maximum depth items can be nested in containers.
     * @type {number}
     */
    static MAX_DEPTH = 5;
    static EMBEDDED_ITEMS_FOLDER_NAME = 'CSB - Embedded Items Folder - DO NOT RENAME OR REMOVE';
    static getEmbeddedItemsFolder(warnIfNotFound = true) {
        const folder = game.items.folders.getName(this.EMBEDDED_ITEMS_FOLDER_NAME);
        if (!folder && warnIfNotFound) {
            ui.notifications.warn(game.i18n.format('CSB.UserMessages.EmbeddedItemsFolderNotFound', {
                EMBEDDED_ITEMS_FOLDER_NAME: this.EMBEDDED_ITEMS_FOLDER_NAME
            }));
        }
        return folder;
    }
    isEquippableItem() {
        return CustomItem.isEquippableItem(this);
    }
    isEquippableItemTemplate() {
        return CustomItem.isEquippableItemTemplate(this);
    }
    isSubTemplate() {
        return CustomItem.isSubTemplate(this);
    }
    isUserInputTemplate() {
        return CustomItem.isUserInputTemplate(this);
    }
    isActiveEffectContainer() {
        return CustomItem.isActiveEffectContainer(this);
    }
    isTemplateItem() {
        return CustomItem.isTemplateItem(this);
    }
    _templateSystem;
    constructor(data, context) {
        if (data?.flags?.['dfreds-convenient-effects'] && data.type !== 'activeEffectContainer') {
            data.type = 'activeEffectContainer';
        }
        if (data.type === 'activeEffectContainer') {
            if (!data.flags?.['dfreds-convenient-effects']) {
                if (!data.flags) {
                    data.flags = {};
                }
                data.flags['dfreds-convenient-effects'] = {
                    folderColor: '',
                    isBackup: false,
                    isConvenient: true,
                    isViewable: true
                };
            }
            if (!data.system) {
                data.system = new BaseItemDataModel();
            }
            data.system.body.contents = [
                {
                    type: 'activeEffectContainer',
                    key: 'activeEffects',
                    staticRowLayout: {
                        active: {
                            enabled: false,
                            colName: 'Active',
                            align: 'left',
                            sort: 1
                        },
                        name: {
                            enabled: true,
                            colName: 'Name',
                            align: 'center',
                            sort: 2
                        },
                        origin: {
                            enabled: false,
                            colName: 'Origin',
                            align: 'center',
                            sort: 3
                        },
                        description: {
                            enabled: true,
                            colName: 'Description',
                            align: 'left',
                            sort: 4,
                            format: 'full'
                        },
                        count: {
                            enabled: false,
                            colName: 'Count',
                            align: 'center',
                            sort: 5
                        }
                    },
                    templateAddress: 'body.contents.0'
                }
            ];
        }
        super(data, context);
    }
    /**
     * Is this item a Template ?
     * @deprecated
     */
    get isTemplate() {
        Logger.warn('isTemplate getter is deprecated, and will be removed in CSB 6.0.0 - FoundryVTT 14. Please use the following functions instead : CustomItem.isEquippableItem ; CustomItem.isEquippableItemTemplate ; CustomItem.isSubTemplate ; CustomItem.isUserInputTemplate ; CustomItem.isActiveEffectContainer ; CustomItem.isTemplateItem.');
        return this.isSubTemplate() || this.isUserInputTemplate() || this.isEquippableItemTemplate();
    }
    /**
     * Is this item an assignable Template ?
     */
    get isAssignableTemplate() {
        return CustomItem.isEquippableItemTemplate(this);
    }
    /**
     * Fetch this entity
     * @deprecated
     */
    get entity() {
        Logger.warn('entity.entity is now deprecated, since entity already is the Item. please change all the "entity.entity" in your script for just "entity". This will be removed in CSB 7.0.0 - FoundryVTT 15');
        return this;
    }
    /**
     * Template system in charge of generic templating handling
     */
    get templateSystem() {
        if (!this._templateSystem) {
            this._templateSystem = new TemplateSystem(this);
        }
        return this._templateSystem;
    }
    /**
     * Is the current user allowed to edit Item Modifiers?
     * @returns {boolean}
     */
    get canEditModifiers() {
        return game.user.hasRole(game.settings.get(game.system.id, 'minimumRoleEditItemModifiers'));
    }
    /**
     * @ignore
     */
    get items() {
        let baseCollection = getGameCollection('item');
        if (this.isEmbedded) {
            baseCollection = this.parent.items;
        }
        return new Collection(baseCollection
            .filter((item) => CustomItem.isEquippableItem(item))
            .filter((item) => item.system.container && this.id && item.system.container === this.id)
            .map((item) => [item.id, item]));
    }
    getItems() {
        return this.items;
    }
    getParent() {
        if (!CustomItem.isEquippableItem(this)) {
            return;
        }
        if (!this.system.container) {
            return this.parent ?? undefined;
        }
        let parentItem;
        if (this.isEmbedded) {
            parentItem = this.parent.items.get(this.system.container);
        }
        else {
            parentItem = game.items.find((item) => item.id === this.system.container);
        }
        return CustomItem.isEquippableItem(parentItem) ? parentItem : undefined;
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
                return getGameCollection('item');
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
     * Get all ActiveEffects that are created on this Item.
     * @yields {ActiveEffect}
     * @returns {Generator<ActiveEffect, void, void>}
     */
    *allApplicableEffects({ excludeExternal = false, excludeTransfer = true } = {}) {
        for (const effect of this.effects) {
            if (!(excludeTransfer && effect.transfer))
                yield effect;
        }
        if (!excludeExternal) {
            for (const item of this.getItems()) {
                for (const effect of item.effects) {
                    if (effect.transfer)
                        yield effect;
                }
            }
        }
    }
    /**
     * Prepare creation data for the provided items and any items contained within them. The data created by this method
     * can be passed to `createDocuments` with `keepId` always set to true to maintain links to container contents.
     * @param  items                     Items to create.
     * @param Container                     Container for the items.
     * @returns                Data for items to be created.
     */
    static async createWithContents(items, container) {
        const depth = 0;
        const created = [];
        const createItemData = async (item, containerId, depth) => {
            let newItemData;
            if (!item) {
                return;
            }
            if (item instanceof CustomItem) {
                newItemData = item.toObject();
            }
            else {
                newItemData = item;
            }
            newItemData.system.container = containerId ?? undefined;
            newItemData.folder = this.getEmbeddedItemsFolder() ?? null;
            newItemData._id = foundry.utils.randomID();
            created.push(newItemData);
            if (item.items) {
                if (depth > CustomItem.MAX_DEPTH) {
                    ui.notifications.warn(game.i18n.format('CSB.UserMessages.ItemMaxDepth', { depth: String(CustomItem.MAX_DEPTH) }));
                }
                for (const doc of item.items)
                    await createItemData(doc, newItemData._id, depth + 1);
            }
        };
        for (const item of items)
            await createItemData(item, container?.id, depth);
        return created;
    }
    /**
     * @override
     * @inheritDoc
     * @ignore
     */
    prepareBaseData() {
        this.templateSystem.prepareData();
    }
    /**
     * @override
     * @ignore
     */
    prepareDerivedData() {
        this.templateSystem.prepareData();
    }
    static async create(data, options) {
        const newItem = await super.create(data, options);
        if (newItem) {
            for (const subItem of data.items ?? []) {
                subItem.system.container = newItem.id;
                subItem.folder = this.getEmbeddedItemsFolder();
                await CustomItem.create(subItem, options);
            }
        }
        return newItem;
    }
    async _preCreate(data, _options, _user) {
        const baseDefaultImg = CustomItem.DEFAULT_IMG();
        const typeDefaultImg = CustomItem.DEFAULT_IMG(this.type);
        if (this.img === baseDefaultImg && typeDefaultImg !== baseDefaultImg) {
            this.updateSource({ img: typeDefaultImg });
            data.img = typeDefaultImg;
        }
        return true;
    }
    /**
     * @override
     * @ignore
     */
    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        if (this.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            if (!data.flags?.[game.system.id]?.version) {
                void this.setFlag(game.system.id, 'version', game.system.version);
            }
            if (!this.parent) {
                void this.update({
                    system: {
                        uniqueId: data._id
                    }
                });
            }
        }
    }
    async _preDelete(options, user) {
        // Handling of nested items
        let parentCollection = getGameCollection('item');
        if (this.isEmbedded) {
            parentCollection = this.parent.items;
        }
        const deletionPromises = [];
        parentCollection
            .filter((item) => CustomItem.isEquippableItem(item) && item.system.container === this.id)
            .forEach((item) => {
            deletionPromises.push(item.delete());
        });
        await Promise.allSettled(deletionPromises);
        return super._preDelete(options, user);
    }
    /**
     * @override
     * @ignore
     */
    _preCreateDescendantDocuments(parent, collection, data, options, userId) {
        if (collection === 'Item') {
            if (this.isTemplateItem()) {
                data.splice(0, data.length);
            }
            else {
                const idxToRemove = [];
                for (const document of data) {
                    if (document.type !== 'equippableItem') {
                        idxToRemove.push(data.indexOf(document));
                    }
                }
                for (let i = idxToRemove.length - 1; i >= 0; i--) {
                    data.splice(idxToRemove[i], 1);
                }
            }
        }
        else {
            super._preCreateDescendantDocuments(parent, collection, data, options, userId);
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
    //@ts-expect-error Types too complicated
    toObject() {
        const result = { ...super.toObject() };
        result.items = [];
        for (const subItem of this.items) {
            result.items.push(subItem.toObject());
        }
        return result;
    }
    /**
     * @ignore
     */
    //@ts-expect-error Type too complicated
    toCompendium(pack, options) {
        const data = super.toCompendium(pack, options);
        for (const item of this.items) {
            item.toCompendium(pack, options);
        }
        return data;
    }
    /**
     * @override
     * @ignore
     */
    //@ts-expect-error Lib expects return this, but the keepId system won't allow it
    async importFromJSON(json, subFolder = false) {
        const updated = await super.importFromJSON(json);
        const imported = JSON.parse(json);
        const res = await CustomItem.create({
            ...updated.toObject(),
            _id: imported._id,
            folder: subFolder ? CustomItem.getEmbeddedItemsFolder() : updated.folder
        }, {
            keepId: true
        });
        if (res) {
            for (const subItemJSON of imported.items ?? []) {
                subItemJSON.system.container = res.id;
                await CustomItem.create({
                    ...subItemJSON,
                    folder: CustomItem.getEmbeddedItemsFolder()
                });
            }
        }
        await updated.delete();
        return res;
    }
    clone(data = {}, options = { save: false }) {
        const newItem = super.clone(data, options);
        for (const subItem of this.items ?? []) {
            subItem.clone({ system: { container: newItem.id } }, { ...options, folder: CustomItem.getEmbeddedItemsFolder() });
        }
        return newItem;
    }
}
Hooks.on('renderItemDirectory', (directory) => {
    const activeEffectContainersIds = game.items
        .filter((item) => {
        return CustomItem.isActiveEffectContainer(item);
    })
        .map((item) => item.id);
    if (!activeEffectContainersIds)
        return;
    const $html = $(directory.element);
    activeEffectContainersIds.forEach((activeEffectContainersId) => {
        const $li = $html.find(`li[data-entry-id="${activeEffectContainersId}"]`);
        $li.remove();
    });
    const entries = $html.find('li[data-entry-id]');
    entries.each((_idx, elt) => {
        if (elt.dataset.entryId) {
            const item = game.items.get(elt.dataset.entryId);
            if (item && item.img === CustomItem.DEFAULT_IMG(item.type)) {
                $(elt).find('img').addClass('csb-filter-default-svg');
            }
        }
    });
});
