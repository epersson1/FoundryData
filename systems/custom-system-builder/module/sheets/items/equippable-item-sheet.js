/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { CustomItem } from '../../documents/item.js';
import Logger from '../../Logger.js';
/**
 * Extend the basic ItemSheet
 * @abstract
 * @extends {ItemSheet}
 * @ignore
 */
export class EquippableItemSheet extends ItemSheet {
    /**
     * A convenience reference to the Item document
     */
    get item() {
        return this['object'];
    }
    constructor(item, options) {
        options.resizable = !item.system.display.fix_size;
        super(item, options);
        this._hasBeenRenderedOnce = false;
    }
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['custom-system', 'sheet', 'item'],
            template: 'systems/' + game.system.id + '/templates/item/item-sheet.hbs',
            width: 600,
            height: 600,
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body'
                }
            ],
            scrollY: ['.custom-system-actor-content'],
            dragDrop: [{ dragSelector: '.item-list .item', dropSelector: null }]
        });
    }
    /**
     * @override
     * @ignore
     */
    get template() {
        return `systems/${game.system.id}/templates/item/${this.item.type}-sheet.hbs`;
    }
    /* -------------------------------------------- */
    /** @override */
    async getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        const baseContext = super.getData();
        const context = await baseContext.item.templateSystem.getSheetData(baseContext);
        context.isEmbedded = context.item.isEmbedded;
        context.isEditable = this.isEditable;
        context.canEditModifiers = context.item.canEditModifiers;
        return context;
    }
    /**
     * @override
     * @ignore
     */
    render(force, options = {}) {
        if (!this._hasBeenRenderedOnce) {
            this.position.width = this.item.system.display.width;
            this.position.height = this.item.system.display.height;
            this._hasBeenRenderedOnce = true;
        }
        this.options.resizable = !this.item.system.display.fix_size;
        if (this.item.system.container) {
            const parentCollection = this.item.getParentCollection();
            parentCollection.get(this.item.system.container).prepareData();
            parentCollection.get(this.item.system.container).render(false);
        }
        return super.render(force, options);
    }
    async forceSubmit(event, options) {
        return super._onSubmit(event, options);
    }
    async _onSubmit(...args) {
        return new Promise((resolve) => {
            this.item.templateSystem.handleSheetSubmit(...args).then((result) => {
                resolve(result ?? {});
            });
        });
    }
    /**
     * Render the inner application content
     * @param {object} data         The data used to render the inner template
     * @returns {Promise<jQuery>}   A promise resolving to the constructed jQuery object
     * @private
     * @override
     * @ignore
     */
    async _renderInner(data) {
        const html = await super._renderInner(data);
        // Append built sheet to html
        html.find('.custom-system-customHeader').append(data.headerPanel);
        html.find('.custom-system-customBody').append(data.bodyPanel);
        return html;
    }
    /** @override */
    activateListeners(html) {
        this.item.templateSystem.activateListeners(html);
        super.activateListeners(html);
    }
    /** @override */
    async _onDrop(event) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore Wrong protected tag in types
        const data = TextEditor.getDragEventData(event);
        if (data.type === 'Item') {
            if (this.actor && !this.actor.isOwner)
                return false;
            const item = await CustomItem.fromDropData(data);
            Logger.debug('Got item data ' + item.name);
            // Building list of container ids of the new item position, from nearest to farthest up
            const targetContainerTree = [
                this.item.id,
                ...this.item.getAllContainerIds(),
                ...(this.actor ? [this.actor.id] : [])
            ];
            // If the item is in the new container list, we cannot update it (it would contain itself)
            if (targetContainerTree.includes(item._id)) {
                ui.notifications.error(game.i18n.localize('CSB.UserMessages.CannotMoveItemInItself'));
                Logger.error(game.i18n.localize('CSB.UserMessages.CannotMoveItemInItself'));
                return;
            }
            // Calculating if the item is moved in the same entity, meaning it has an item containing both the old container and the new one
            const targetParentActor = this.actor;
            const originalParentActor = item.parent;
            let originalContainerTree = [];
            let originalContainer = undefined;
            // If the item had a container, we fetch it
            if (item.system.container) {
                if (originalParentActor) {
                    originalContainer = originalParentActor.items.get(item.system.container);
                }
                else {
                    originalContainer = game.items.get(item.system.container);
                }
                // And we get the old container list
                originalContainerTree = [originalContainer.id, ...originalContainer.getAllContainerIds()];
            }
            // We add the old actor id to the list, if in an actor, to move items from the actor to an item in the actor
            if (originalParentActor) {
                originalContainerTree.push(originalParentActor.id);
            }
            // If an id in the original container list matches an id in the new container list, we shoudl move the item instead of copying it
            const isMove = originalContainerTree.some((id) => {
                return targetContainerTree.includes(id);
            });
            if (isMove) {
                const itemOrigin = originalContainer ?? originalParentActor;
                Logger.info(`Moving item ${item.name} from ${itemOrigin?.name ?? 'item sidebar'} to ${this.item.name}${this.actor ? ` in ${this.actor.name}` : ''}`);
                return CustomItem.updateDocuments([
                    {
                        _id: item._id,
                        system: { container: this.item.id }
                    }
                ], { parent: targetParentActor }).then(() => {
                    itemOrigin?.render(false);
                    this.render(false);
                });
            }
            Logger.info(`Creating item ${item.name} in item ${this.item.name}`);
            return this._onDropItemCreate(item, event);
        }
    }
    /**
     * Handle the final creation of dropped Item data on the Actor.
     * @protected
     */
    async _onDropItemCreate(itemData, _event) {
        const items = itemData instanceof Array ? itemData : [itemData];
        // Create the owned items & contents as normal
        const toCreate = await CustomItem.createWithContents(items, this.item);
        Logger.info('Created items ' + toCreate.map((item) => item._id));
        const newItemPromise = CustomItem.createDocuments(toCreate, {
            pack: this.actor?.pack,
            parent: this.actor,
            keepId: true
        });
        newItemPromise.then(() => {
            this.render(false);
        });
        return newItemPromise;
    }
}
let focusedElt;
/* Insert tabs & header on sheet rendering */
Hooks.on('renderEquippableItemSheet', function (app, html, _data) {
    // Register in-sheet rich text editors
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Going around the protected modifier on this
    html.find('.editor-content[data-edit]').each((_i, div) => app._activateEditor(div));
    html.find('*').on('focus', (ev) => {
        focusedElt = ev.currentTarget.id;
    });
    if (focusedElt) {
        html.find('#' + focusedElt).trigger('focus');
    }
});
