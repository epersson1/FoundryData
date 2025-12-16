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
import CustomItem from '../../../documents/CustomItem.js';
import Logger from '../../../Logger.js';
import { CustomItemSheetV2 } from './CustomItemSheetV2.js';
var DragDrop = foundry.applications.ux.DragDrop;
/**
 * Extend the basic ItemSheet
 * @abstract
 * @extends {CustomItemSheetV2}
 * @ignore
 */
export class EquippableItemSheetV2 extends CustomItemSheetV2 {
    static DEFAULT_OPTIONS = {
        window: {
            controls: [
                {
                    label: 'CSB.Sheets.SeeHiddenAttributes',
                    icon: 'fas fa-eye-slash',
                    action: 'openHiddenAttributes',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
                },
                {
                    label: 'CSB.Sheets.ConfigureItemModifier',
                    icon: 'fas fa-sliders',
                    action: 'configureItemModifier',
                    ownership: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                    get visible() {
                        return EquippableItemSheetV2.canEditModifiers();
                    }
                }
            ]
        },
        actions: {
            openHiddenAttributes: EquippableItemSheetV2.openHiddenAttributes,
            configureItemModifier: EquippableItemSheetV2.configureItemModifier
        }
    };
    static PARTS = {
        form: {
            get template() {
                return `systems/${game.system.id}/templates/item/v2/equippableItem-sheet.hbs`;
            },
            classes: super.PARTS.form.classes
        }
    };
    static openHiddenAttributes(_event, _target) {
        void this.item.templateSystem.openAttributesVision();
    }
    static configureItemModifier(_event, _target) {
        void this.item.templateSystem.configureModifiers();
    }
    /* ------------------------------------- */
    dragDrop;
    dragDropOptions = [{ dragSelector: '.item-list .item', dropSelector: null }];
    constructor(options) {
        super(options);
        this.dragDrop = this.createDragDropHandlers();
    }
    createDragDropHandlers() {
        return this.dragDropOptions.map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            };
            d.callbacks = {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this)
            };
            return new DragDrop.implementation(d);
        });
    }
    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector
     * @param selector       The candidate HTML selector for dragging
     * @returns              Can the current user drag this selector?
     * @protected
     * @override
     * @ignore
     */
    _canDragStart(_selector) {
        return this.isEditable;
    }
    /* -------------------------------------------- */
    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param selector       The candidate HTML selector for the drop target
     * @returns              Can the current user drop on this selector?
     * @protected
     * @override
     * @ignore
     */
    _canDragDrop(_selector) {
        return this.isEditable;
    }
    /* -------------------------------------------- */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        return {
            ...context,
            isEmbedded: this.item.isEmbedded
        };
    }
    /**
     * Render the inner application content
     * @private
     * @override
     * @ignore
     */
    async _renderHTML(context, options) {
        if (this.item.templateSystem.isModified) {
            await this.submit();
        }
        const form = (await super._renderHTML(context, options)).form;
        // Append built sheet to html
        if (context.headerPanel)
            form.querySelector('.custom-system-customHeader').append(context.headerPanel[0]);
        return { form };
    }
    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.dragDrop.forEach((d) => d.bind(this.element));
    }
    async _processSubmitData(event, form, submitData) {
        if (game.settings.get(game.system.id, 'manualEntitySaving') && event.type === 'change') {
            return this.item.templateSystem.handleSheetSubmit();
        }
        else {
            this.item.templateSystem.isModified = false;
            return super._processSubmitData(event, form, submitData);
        }
    }
    /**
     * Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragStart(event) {
        // Extract the data you need
        const dragData = null;
        if (!dragData)
            return;
        // Set data transfer
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }
    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @protected
     */
    _onDragOver(_event) { }
    /** @override */
    _onDrop(event) {
        if (!this.item.isOwner)
            return;
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        if (data) {
            const dragData = data;
            // Handle different data types
            switch (dragData.type) {
                case 'Item':
                    void this._onDropItem(event, dragData);
            }
        }
    }
    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @returns   The created or updated Item instances, or false if the drop was not permitted.
     * @protected
     */
    async _onDropItem(event, data) {
        if (this.actor && !this.actor.isOwner)
            return false;
        const item = await CustomItem.fromDropData(data);
        if (CustomItem.isEquippableItem(item)) {
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
                    void itemOrigin?.render(false);
                    void this.render({ force: false });
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
        const items = (itemData instanceof Array ? itemData : [itemData]).filter((item) => CustomItem.isEquippableItem(item));
        if (!CustomItem.isEquippableItem(this.item)) {
            return [];
        }
        // Create the owned items & contents as normal
        const toCreate = await CustomItem.createWithContents(items, this.item);
        Logger.info('Created items ' + toCreate.map((item) => item._id).join(', '));
        const newItemPromise = CustomItem.createDocuments(toCreate, {
            pack: this.actor?.pack,
            parent: this.actor,
            keepId: true
        });
        void newItemPromise.then(() => {
            void this.render(false);
        });
        return newItemPromise;
    }
    async close(options) {
        if (options?.renderContext !== 'deleteItem')
            await this.submit();
        return super.close(options);
    }
}
