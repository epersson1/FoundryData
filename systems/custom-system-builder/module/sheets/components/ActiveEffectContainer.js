/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import ExtensibleTable from './ExtensibleTable.js';
import { getLocalizedAlignmentList } from '../../utils.js';
class ActiveEffectContainer extends ExtensibleTable {
    /** ActiveEffectContainer constructor */
    constructor(props) {
        super(props);
        this._staticRowLayout = props.staticRowLayout;
        this._title = props.title;
        this._hideEmpty = props.hideEmpty;
        this._headDisplay = props.headDisplay;
        this._showDelete = props.showDelete;
        this._showCreateButton = props.showCreateButton;
    }
    /**
     * Renders component
     * @override
     * @param {TemplateSystem} entity Rendered entity (actor or item)
     * @param {boolean} [isEditable=true] Is the component editable by the current user?
     * @param {ComponentRenderOptions} [options={}] Additional options usable by the final Component
     * @return {Promise<JQuery>} The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        const jQElement = await super._getElement(entity, isEditable, options);
        const activeEffects = Array.from(entity.entity.effects);
        const tableElement = $('<table></table>');
        if (this._hideEmpty && activeEffects.length === 0 && !entity.isTemplate) {
            tableElement.addClass('hidden');
        }
        if (this._title) {
            const captionElement = $('<caption></caption>');
            captionElement.append(this._title);
            tableElement.append(captionElement);
        }
        const tableBody = $('<tbody></tbody>');
        if (entity.isTemplate) {
            tableBody.append(this._createTemplateColumns());
        }
        else {
            if (this._headDisplay) {
                tableBody.append(this._createTemplateColumns());
            }
            for (const activeEffect of activeEffects) {
                tableBody.append(await this._createRow(entity, activeEffect, isEditable));
            }
        }
        tableElement.append(tableBody);
        if (isEditable && this._showCreateButton && !entity.isTemplate) {
            const addRow = $('<tr></tr>');
            const fillCell = $('<td></td>');
            fillCell.attr('colspan', this.contents.length);
            const addButtonCell = $('<td></td>');
            const addButton = $('<a class="custom-system-addDynamicLine custom-system-clickable"><i class="fas fa-plus-circle"></i></a>');
            addButton.on('click', async () => {
                await ActiveEffect.createDialog({}, {
                    parent: entity.entity
                });
            });
            addButtonCell.append(addButton);
            addRow.append(fillCell);
            addRow.append(addButtonCell);
            tableBody.append(addRow);
        }
        jQElement.append(tableElement);
        return jQElement;
    }
    /**
     * Returns serialized component
     * @override
     */
    toJSON() {
        const jsonObj = super.toJSON();
        return {
            ...jsonObj,
            title: this._title,
            hideEmpty: this._hideEmpty,
            headDisplay: this._headDisplay,
            showDelete: this._showDelete,
            staticRowLayout: this._staticRowLayout,
            showCreateButton: this._showCreateButton
        };
    }
    /**
     * Creates ActiveEffectContainer from JSON description
     * @override
     */
    static fromJSON(json, templateAddress, parent) {
        return new ActiveEffectContainer({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            cssClass: json.cssClass,
            title: json.title,
            hideEmpty: json.hideEmpty,
            head: json.head,
            headDisplay: json.headDisplay,
            showDelete: json.showDelete,
            deleteWarning: json.deleteWarning,
            showCreateButton: json.showCreateButton,
            contents: [],
            rowLayout: {},
            staticRowLayout: json.staticRowLayout,
            role: json.role,
            permission: json.permission,
            visibilityFormula: json.visibilityFormula,
            parent: parent
        });
    }
    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName() {
        return 'activeEffectContainer';
    }
    /**
     * Gets pretty name for this component's type
     * @return The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.ActiveEffectContainer');
    }
    /**
     * Get configuration form for component creation / edition
     * @return The jQuery element holding the configuration form
     */
    static async getConfigForm(existingComponent, _entity) {
        const predefinedValuesComponent = { ...existingComponent };
        predefinedValuesComponent.title ??= '';
        predefinedValuesComponent.hideEmpty ??= false;
        predefinedValuesComponent.headDisplay ??= true;
        predefinedValuesComponent.head ??= true;
        predefinedValuesComponent.showDelete ??= true;
        predefinedValuesComponent.showDeleteWarning ??= true;
        predefinedValuesComponent.showCreateButton ??= true;
        predefinedValuesComponent.staticRowLayout ??= {
            name: {
                colName: game.i18n.localize('CSB.ComponentProperties.ActiveEffectContainer.ActiveEffectRefColLabelDefault'),
                align: 'center'
            }
        };
        const mainElt = $('<div></div>');
        mainElt.append(await renderTemplate('systems/' + game.system.id + '/templates/_template/components/activeEffectContainer.hbs', {
            ...predefinedValuesComponent,
            ALIGNMENTS: getLocalizedAlignmentList()
        }));
        return mainElt;
    }
    /**
     * Extracts configuration from submitted HTML form
     * @override
     * @param html The submitted form
     * @returns The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(html) {
        return {
            ...super.extractConfig(html),
            title: html.find('#activeEffectTitle').val()?.toString() ?? '',
            hideEmpty: html.find('#activeEffectHideEmpty').is(':checked'),
            headDisplay: html.find('#activeEffectHeadDisplay').is(':checked'),
            head: html.find('#activeEffectHead').is(':checked'),
            showDelete: html.find('#activeEffectShowDelete').is(':checked'),
            deleteWarning: html.find('#activeEffectDeleteWarning').is(':checked'),
            showCreateButton: html.find('#activeEffectShowCreateButton').is(':checked'),
            staticRowLayout: {
                name: {
                    colName: html.find('#activeEffectNameLabel').val()?.toString() ?? '',
                    align: html.find('#activeEffectNameAlign').val()?.toString() ?? 'left'
                }
            }
        };
    }
    /** Creates the header-row of the table */
    _createTemplateColumns() {
        const firstRow = $('<tr></tr>');
        Object.values(this._staticRowLayout).forEach(row => {
            const cell = $('<td></td>');
            cell.addClass('custom-system-cell');
            switch (row.align) {
                case 'center':
                    cell.addClass('custom-system-cell-alignCenter');
                    break;
                case 'right':
                    cell.addClass('custom-system-cell-alignRight');
                    break;
                case 'left':
                default:
                    cell.addClass('custom-system-cell-alignLeft');
                    break;
            }
            if (this._head) {
                cell.addClass('custom-system-cell-boldTitle');
            }
            const colNameSpan = $('<span></span>');
            colNameSpan.append(row.colName ?? 'Unknown');
            cell.append(colNameSpan);
            firstRow.append(cell);
        });
        return firstRow;
    }
    /** Creates a table-row for every activeEffect */
    async _createRow(entity, activeEffect, isEditable) {
        const tableRow = $('<tr></tr>');
        tableRow.addClass('custom-system-dynamicRow');
        Object.entries(this._staticRowLayout).forEach(([key, row]) => {
            const cell = $('<td></td>');
            cell.addClass('custom-system-cell');
            switch (key) {
                case 'name':
                    cell.append(this._generateActiveEffectLink(activeEffect));
                    break;
                default:
                    break;
            }
            switch (row.align) {
                case 'center':
                    cell.addClass('custom-system-cell-alignCenter');
                    break;
                case 'right':
                    cell.addClass('custom-system-cell-alignRight');
                    break;
                case 'left':
                default:
                    cell.addClass('custom-system-cell-alignLeft');
                    break;
            }
            tableRow.append(cell);
        });
        if (this._showDelete) {
            const controlCell = $('<td></td>');
            const controlDiv = $('<div></div>');
            controlDiv.addClass('custom-system-dynamic-table-row-icons');
            if (isEditable && !entity.isTemplate) {
                if (this._showDelete) {
                    const deleteLink = $('<a><i class="fas fa-trash custom-system-deleteDynamicLine custom-system-clickable"></i></a>');
                    const deleteActiveEffect = async () => {
                        if (!activeEffect.id) {
                            return;
                        }
                        await entity.entity.deleteEmbeddedDocuments('ActiveEffect', [activeEffect.id]);
                        entity.render(false);
                    };
                    if (this._deleteWarning) {
                        deleteLink.on('click', async () => {
                            await Dialog.confirm({
                                title: game.i18n.localize('CSB.ComponentProperties.ItemContainer.DeleteItemDialog.Title'),
                                content: `<p>${game.i18n.localize('CSB.ComponentProperties.ItemContainer.DeleteItemDialog.Content')}</p>`,
                                yes: deleteActiveEffect,
                                no: () => {
                                }
                            });
                        });
                    }
                    else {
                        deleteLink.on('click', deleteActiveEffect);
                    }
                    controlDiv.append(deleteLink);
                }
            }
            controlCell.append(controlDiv);
            tableRow.append(controlCell);
        }
        return tableRow;
    }
    /** Generates the element to display the item link in the Container */
    _generateActiveEffectLink(activeEffect) {
        const activeEffectBox = $('<span></span>');
        const activeEffectLink = $('<a></a>');
        activeEffectLink.addClass('content-link');
        activeEffectLink.attr({
            'data-type': 'Item',
            'data-entity': 'Item',
            'data-id': activeEffect.id,
            'data-uuid': activeEffect.uuid,
            'data-tooltip': activeEffect.name ?? 'ActiveEffect',
            'data-link': '',
            'data-scope': '',
            draggable: 'true'
        });
        const activeEffectImg = $('<img>');
        activeEffectImg.attr({
            src: activeEffect.img,
            alt: `${activeEffect.name ?? 'Active Effect'} image`,
            draggable: 'false'
        });
        activeEffectImg.addClass('custom-system-active-effect-container-image');
        activeEffectLink.append(activeEffectImg);
        activeEffectLink.append(activeEffect.name ?? '');
        activeEffectLink.on('click', () => {
            activeEffect.sheet?.render(true);
        });
        activeEffectBox.append(activeEffectLink);
        return activeEffectBox;
    }
}
/**
 * @ignore
 */
export default ActiveEffectContainer;
