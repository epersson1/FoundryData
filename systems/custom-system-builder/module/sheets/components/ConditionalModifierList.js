/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * @ignore
 * @module
 */
import ExtensibleTable from './ExtensibleTable.js';
import { getLocalizedAlignmentList } from '../../utils.js';
/**
 * Class ConditionalModifierList
 * @ignore
 */
class ConditionalModifierList extends ExtensibleTable {
    constructor(props) {
        super(props);
        this._headDisplay = props.headDisplay;
        this._infoDisplay = props.infoDisplay;
        this._selectionLabel = props.selectionLabel;
        this._selectionAlign = props.selectionAlign;
        this._groupLabel = props.groupLabel;
        this._groupAlign = props.groupAlign;
        this._groupFilter = props.groupFilter;
        this._groupFilterFormula = props.groupFilterFormula;
    }
    /**
     * Renders component
     * @override
     * @param {TemplateSystem} entity Rendered entity (actor or item)
     * @param {boolean} [isEditable=true] Is the component editable by the current user ?
     * @param {ComponentRenderOptions} [options={}] Additional options usable by the final Component
     * @return {Promise<JQuery>} The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        const { reference } = options;
        const jQElement = await super._getElement(entity, isEditable, options);
        const tableElement = $('<table></table>');
        const tableBody = $('<tbody></tbody>');
        if (entity.isTemplate) {
            tableBody.append(this._createTemplateColumns());
        }
        else {
            let sortedConditionalModifiers = entity.getSortedConditionalModifiers();
            let groupFilter;
            if (this._groupFilterFormula && this._groupFilterFormula !== '') {
                groupFilter = ComputablePhrase.computeMessageStatic(`\${${this._groupFilterFormula}}$`, entity.system.props, {
                    source: `${this.key}.groupFilterFormula`,
                    reference,
                    defaultValue: '',
                    triggerEntity: entity
                }).result.split(',');
            }
            else if (this._groupFilter.length !== 0) {
                groupFilter = this._groupFilter;
            }
            if (groupFilter) {
                sortedConditionalModifiers = Object.keys(sortedConditionalModifiers)
                    .filter((key) => groupFilter.includes(key))
                    .reduce((obj, key) => {
                    obj[key] = sortedConditionalModifiers[key];
                    return obj;
                }, {});
            }
            if (this._headDisplay) {
                tableBody.append(this._createTemplateColumns());
            }
            for (const [key, group] of Object.entries(sortedConditionalModifiers)) {
                tableBody.append(await this._createRow(key, group, entity));
            }
        }
        tableElement.append(tableBody);
        jQElement.append(tableElement);
        return jQElement;
    }
    /** Returns serialized component */
    toJSON() {
        const jsonObj = super.toJSON();
        return {
            ...jsonObj,
            headDisplay: this._headDisplay,
            infoDisplay: this._infoDisplay,
            selectionLabel: this._selectionLabel,
            selectionAlign: this._selectionAlign,
            groupLabel: this._groupLabel,
            groupAlign: this._groupAlign,
            groupFilter: this._groupFilter,
            groupFilterFormula: this._groupFilterFormula
        };
    }
    /**
     * Creates ConditionalModifierList from JSON description
     * @override
     * @param {ConditionalModifierListJson} json
     * @param {string} templateAddress
     * @param {Container|null} parent
     * @return {ConditionalModifierList}
     */
    static fromJSON(json, templateAddress, parent) {
        return new ConditionalModifierList({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            cssClass: json.cssClass,
            head: json.head,
            headDisplay: json.headDisplay,
            infoDisplay: json.infoDisplay,
            selectionLabel: json.selectionLabel,
            selectionAlign: json.selectionAlign,
            groupLabel: json.groupLabel,
            groupAlign: json.groupAlign,
            groupFilter: json.groupFilter,
            groupFilterFormula: json.groupFilterFormula,
            role: json.role,
            permission: json.permission,
            visibilityFormula: json.visibilityFormula,
            parent: parent,
            contents: [],
            rowLayout: {},
            deleteWarning: false
        });
    }
    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName() {
        return 'conditionalModifierList';
    }
    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.ConditionalModifierList');
    }
    /** Get configuration form for component creation / edition */
    static async getConfigForm(existingComponent, entity) {
        const predefinedValues = { ...existingComponent };
        predefinedValues.headDisplay = predefinedValues?.headDisplay ?? true;
        predefinedValues.head = predefinedValues?.head ?? true;
        predefinedValues.selectionLabel =
            predefinedValues?.selectionLabel ??
                game.i18n.localize('CSB.ComponentProperties.ConditionalModifierList.SelectionColumnNameDefault');
        predefinedValues.groupLabel =
            predefinedValues?.groupLabel ??
                game.i18n.localize('CSB.ComponentProperties.ConditionalModifierList.GroupColumnNameDefault');
        predefinedValues.availableGroups = this._getAvailableGroups(entity).map((group) => ({
            group,
            checked: predefinedValues.groupFilter?.includes(group) ?? false
        }));
        const mainElt = $('<div></div>');
        mainElt.append(await renderTemplate('systems/' + game.system.id + '/templates/_template/components/conditionalModifierList.hbs', { ...predefinedValues, ALIGNMENTS: getLocalizedAlignmentList() }));
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
            headDisplay: html.find('#modifierHeadDisplay').is(':checked'),
            head: html.find('#modifierHead').is(':checked'),
            infoDisplay: html.find('#modifierInfoDisplay').is(':checked'),
            selectionLabel: html.find('#modifierSelectionLabel').val()?.toString() ?? '',
            selectionAlign: html.find('#modifierSelectionAlign').val()?.toString() ?? 'left',
            groupLabel: html.find('#modifierGroupLabel').val()?.toString() ?? '',
            groupAlign: html.find('#modifierGroupAlign').val()?.toString() ?? 'left',
            groupFilterFormula: html.find('#groupFilterFormula').val()?.toString() ?? '',
            groupFilter: html
                .find('input[name=groupFilter]:checked')
                .map(function () {
                return $(this).val()?.toString() ?? '';
            })
                .get()
        };
    }
    /** Creates the header-row of the table */
    _createTemplateColumns() {
        const firstRow = $('<tr></tr>');
        for (let i = 0; i < 2; i++) {
            const cell = $('<td></td>');
            cell.addClass('custom-system-cell');
            switch (i === 0 ? this._selectionAlign : this._groupAlign) {
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
            colNameSpan.append(i === 0 ? this._selectionLabel : this._groupLabel);
            cell.append(colNameSpan);
            firstRow.append(cell);
        }
        return firstRow;
    }
    /** Creates a table-row for every conditional modifier */
    async _createRow(key, modifiers, entity) {
        const totalColumns = this._infoDisplay ? 3 : 2;
        const tableRow = $('<tr></tr>');
        tableRow.addClass('custom-system-dynamicRow');
        for (let i = 0; i < totalColumns; i++) {
            const cell = $('<td></td>');
            cell.addClass('custom-system-cell');
            let alignment;
            switch (i) {
                case 0:
                    alignment = this._selectionAlign;
                    cell.append(await this._createIsSelectedCell(key, entity));
                    break;
                case 1:
                    alignment = this._groupAlign;
                    cell.append(this._createDataCell(key));
                    break;
                case 2:
                    alignment = 'right';
                    cell.append(this._createInfoCell(modifiers));
                    break;
                default:
                    alignment = 'left';
                    break;
            }
            switch (alignment) {
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
        }
        return tableRow;
    }
    async _createIsSelectedCell(key, entity) {
        if (entity.system.activeConditionalModifierGroups === undefined) {
            entity.system.activeConditionalModifierGroups = [];
        }
        const input = $('<input type="checkbox"/>');
        input.addClass('custom-system-conditional-modifier');
        input.prop('checked', entity.system.activeConditionalModifierGroups.includes(key) ?? false);
        input.on('click', async () => {
            if (input.is(':checked')) {
                entity.system.activeConditionalModifierGroups.push(key);
            }
            else {
                entity.system.activeConditionalModifierGroups = entity.system.activeConditionalModifierGroups.filter((group) => group !== key);
            }
            await entity.entity.update({
                system: {
                    activeConditionalModifierGroups: entity.system.activeConditionalModifierGroups
                }
            });
        });
        return input;
    }
    _createDataCell(key) {
        const data = $('<div></div>');
        data.append(key);
        return data;
    }
    _createInfoCell(modifiers) {
        const data = $('<div class="custom-system-dynamic-table-row-icons"></div>');
        const infoIcon = $('<div class="custom-system-tooltip"><i class="fas fa-circle-info"></i></div>');
        const list = $('<ul class="custom-system-tooltip-box"></ul>');
        modifiers.forEach((modifier) => {
            modifier.description = ComputablePhrase.computeMessageStatic(modifier.description ?? '', modifier.originalEntity.entity.system.props, {
                source: `${this.key}.modifier.${modifier.key}.description`,
                defaultValue: 0,
                triggerEntity: modifier.originalEntity
            }).result;
            const tooltipRow = $('<li class="custom-system-tooltip-list-item"></li>');
            tooltipRow.append(modifier.description);
            list.append(tooltipRow);
        });
        infoIcon.append(list);
        data.append(infoIcon);
        return data;
    }
    /** Gets all available conditional modifier groups in all the items plus those set on the active effects of this template */
    static _getAvailableGroups(entity) {
        const availableGroups = new Set();
        game.items.map((item) => item.system.modifiers)
            .deepFlatten()
            .filter((modifier) => modifier?.conditionalGroup)
            .forEach((modifier) => {
            availableGroups.add(modifier.conditionalGroup);
        });
        if (entity.system.activeEffects) {
            Object.entries(entity.system.activeEffects).forEach(([_, modifiers]) => {
                modifiers
                    .filter((modifier) => modifier?.conditionalGroup)
                    .forEach((modifier) => {
                    availableGroups.add(modifier.conditionalGroup);
                });
            });
        }
        return Array.from(availableGroups);
    }
}
/**
 * @ignore
 */
export default ConditionalModifierList;
