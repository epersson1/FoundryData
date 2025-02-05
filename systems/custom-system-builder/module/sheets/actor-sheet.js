/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { CustomItem } from '../documents/item.js';
import Logger from '../Logger.js';
/**
 * @ignore
 * @module
 */
/**
 * Extend the basic ActorSheet
 * @abstract
 * @extends {ActorSheet}
 */
export class CustomActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['custom-system', 'sheet', 'actor'],
            template: `systems/${game.system.id}/templates/actor/actor-sheet.hbs`,
            width: 600,
            height: 600,
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body'
                }
            ],
            scrollY: ['.custom-system-actor-content']
        });
    }
    /**
     * @override
     * @ignore
     */
    get template() {
        return `systems/${game.system.id}/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }
    /* -------------------------------------------- */
    /** @override */
    async getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        let context = super.getData();
        context = await context.actor.templateSystem.getSheetData(context);
        return context;
    }
    /** @override */
    activateListeners(html) {
        this.actor.templateSystem.activateListeners(html);
        super.activateListeners(html);
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
        let html = await super._renderInner(data);
        // Append built sheet to html
        html.find('.custom-system-customHeader').append(data.headerPanel);
        html.find('.custom-system-customBody').append(data.bodyPanel);
        return html;
    }
    async forceSubmit(...args) {
        return super._onSubmit(...args);
    }
    async _onSubmit(...args) {
        return this.actor.templateSystem.handleSheetSubmit(...args);
    }
    /** @override */
    async _onDropItem(event, data) {
        if (!this.actor.isOwner)
            return false;
        const item = await Item.implementation.fromDropData(data);
        // Handle moving out of container & item sorting
        if (this.actor.uuid === item.parent?.uuid) {
            if (item.system.container !== null) {
                const originalParent = this.actor.items.get(item.system.container);
                return await item.update({ 'system.container': null }).then(() => {
                    originalParent.render(false);
                    this.render(false);
                });
            }
        }
        return this._onDropItemCreate(item, event);
    }
    /**
     * Handle the final creation of dropped Item data on the Actor.
     * @param {CustomItem|CustomItem[]} itemData     The item or items requested for creation.
     * @param {DragEvent} event              The concluding DragEvent which provided the drop data.
     * @returns {Promise<CustomItem[]>}
     * @protected
     */
    async _onDropItemCreate(itemData, event) {
        let items = itemData instanceof Array ? itemData : [itemData];
        // Create the owned items & contents as normal
        const toCreate = await CustomItem.createWithContents(items, this.item);
        Logger.info('Created item contents ' + toCreate._id);
        return CustomItem.createDocuments(toCreate, { pack: this.actor.pack, parent: this.actor, keepId: true });
    }
}
let focusedElt;
/* Insert tabs & header on sheet rendering */
Hooks.on('renderCustomActorSheet', function (app, html, data) {
    // Register in-sheet rich text editors
    html.find('.editor-content[data-edit]').each((i, div) => app._activateEditor(div));
    html.find('*').on('focus', (ev) => {
        focusedElt = ev.currentTarget.id;
    });
    if (focusedElt) {
        html.find('#' + focusedElt.replaceAll('.', '\\.')).trigger('focus');
    }
});
