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
import ExtensibleTable, { TABLE_SORT_OPTION, COMPARISON_OPERATOR, SORT_OPERATORS } from './ExtensibleTable.js';
import { castToPrimitive, fastSetFlag } from '../../utils.js';
import { isComputableElement } from '../../interfaces/ComputableElement.js';
import { isChatSenderElement } from '../../interfaces/ChatSenderElement.js';
import Checkbox from './Checkbox.js';
import Dropdown from './Dropdown.js';
import Label from './Label.js';
import NumberField from './NumberField.js';
import RadioButton from './RadioButton.js';
import RichTextArea from './RichTextArea.js';
import TextField from './TextField.js';
import Meter from './Meter.js';
import InputComponent from './InputComponent.js';
const isPredefinedLine = (entry) => entry[1].$predefinedIdx !== undefined;
/**
 * DynamicTable component
 * @ignore
 */
class DynamicTable extends ExtensibleTable {
    /**
     * Constructor
     * @param props Component data
     */
    constructor(props) {
        super(props);
        this._predefinedLines = [...(props.predefinedLines ?? [])];
        this._canPlayerAdd = props.canPlayerAdd;
        this._sortOption = props.sortOption ?? TABLE_SORT_OPTION.MANUAL;
        this._sortPredicates = props.sortPredicates;
    }
    /**
     * @returns {PredefinedLine[]}
     */
    get predefinedLines() {
        return this._predefinedLines;
    }
    /**
     * @returns {boolean}
     */
    get canPlayerAdd() {
        return game.user.isGM || this._canPlayerAdd;
    }
    /**
     * Renders component
     * @override
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user ?
     * @param options Additional options
     * @return The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options) {
        if (!entity.isTemplate) {
            await this._synchronizePredefinedLines(entity);
        }
        const sampleNewRow = {
            $deleted: false
        };
        const baseElement = await super._getElement(entity, isEditable, options);
        const jQElement = $('<table></table>');
        const tableBody = $('<tbody></tbody>');
        const firstRow = $('<tr></tr>');
        for (const component of this._contents) {
            const cell = $('<td></td>');
            cell.addClass('custom-system-cell');
            switch (this._rowLayout[component.key].align) {
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
            if (entity.isTemplate) {
                const sortLeftTabButton = $('<a><i class="fas fa-caret-left custom-system-clickable"></i></a>');
                sortLeftTabButton.addClass('item');
                sortLeftTabButton.addClass('custom-system-sort-left');
                sortLeftTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.ExtensibleTable.ColumnSort.SortLeft'));
                sortLeftTabButton.on('click', () => {
                    component.sortBeforeInParent(entity);
                });
                cell.append(sortLeftTabButton);
            }
            const colNameSpan = $('<span></span>');
            colNameSpan.append(this._rowLayout[component.key].colName ?? '');
            if (entity.isTemplate) {
                colNameSpan.addClass('custom-system-editable-component');
                colNameSpan.addClass(component.key);
                colNameSpan.append(' {' + component.key + '}');
                colNameSpan.on('click', () => {
                    component.editComponent(entity, this._rowLayout[component.key], DynamicTable.ALLOWED_COMPONENTS);
                });
            }
            if (!entity.isTemplate && this._sortOption === TABLE_SORT_OPTION.MANUAL) {
                const columnSortOption = game.user.getFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.sortOption');
                colNameSpan.append('&nbsp;');
                let nextSortIsToAsc = true;
                if (columnSortOption && columnSortOption.prop === component.key) {
                    nextSortIsToAsc = columnSortOption.operator !== COMPARISON_OPERATOR.LESSER_THAN;
                    colNameSpan.append(`<i class="fas fa-caret-${columnSortOption.operator === COMPARISON_OPERATOR.GREATER_THAN ? 'up' : 'down'}"></i>`);
                }
                cell.addClass('custom-system-clickable');
                cell.on('click', async () => {
                    fastSetFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.sortOption', {
                        prop: component.key,
                        operator: nextSortIsToAsc ? COMPARISON_OPERATOR.LESSER_THAN : COMPARISON_OPERATOR.GREATER_THAN
                    });
                    entity.render(false);
                });
            }
            cell.append(colNameSpan);
            if (entity.isTemplate) {
                const sortRightTabButton = $('<a><i class="fas fa-caret-right custom-system-clickable"></i></a>');
                sortRightTabButton.addClass('item');
                sortRightTabButton.addClass('custom-system-sort-right');
                sortRightTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.ExtensibleTable.ColumnSort.SortRight'));
                sortRightTabButton.on('click', () => {
                    component.sortAfterInParent(entity);
                });
                cell.append(sortRightTabButton);
            }
            firstRow.append(cell);
            if (component instanceof InputComponent) {
                sampleNewRow[component.key] = component.defaultValue;
            }
        }
        const headControlsRow = $('<td></td>');
        if (entity.isTemplate) {
            headControlsRow.addClass('custom-system-cell custom-system-cell-alignCenter');
            headControlsRow.append(await this.renderTemplateControls(entity, {
                isDynamicTable: true,
                allowedComponents: DynamicTable.ALLOWED_COMPONENTS
            }));
        }
        firstRow.append(headControlsRow);
        tableBody.append(firstRow);
        // Get all properties and collect all relevant rows (not-deleted)
        const dynamicProps = entity.isTemplate
            ? this.predefinedLines
            : foundry.utils.getProperty(entity.system.props, this.key);
        const rowOrder = this._sortRows(dynamicProps, entity);
        fastSetFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.sortOption.savedOrder', rowOrder);
        for (const [index, line] of Object.entries(rowOrder)) {
            const parsedIndex = parseInt(index);
            const tableRow = $('<tr></tr>');
            tableRow.addClass('custom-system-dynamicRow');
            for (const component of this.contents) {
                const cell = $('<td></td>');
                cell.addClass('custom-system-cell');
                switch (this._rowLayout[component.key].align) {
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
                if (entity.isTemplate) {
                    const fieldSpan = $('<span></span>');
                    fieldSpan.addClass(`${this.key}.${line}.${component.key}`);
                    let predefinedField = $('<input />');
                    predefinedField.on('change', () => {
                        let rawVal = predefinedField.val();
                        if (Array.isArray(rawVal)) {
                            rawVal = rawVal.join();
                        }
                        this._predefinedLines[line][component.key] = rawVal;
                        this.save(entity);
                    });
                    switch (component.constructor.valueType) {
                        case 'string':
                            predefinedField.prop('type', 'text');
                            predefinedField.prop('value', this.predefinedLines[line][component.key]);
                            break;
                        case 'number':
                            predefinedField.prop('type', 'number');
                            predefinedField.prop('value', this.predefinedLines[line][component.key]);
                            break;
                        case 'boolean':
                            predefinedField.prop('type', 'checkbox');
                            if (this.predefinedLines[line][component.key] === true) {
                                predefinedField.prop('checked', 'checked');
                            }
                            predefinedField.on('change', () => {
                                this._predefinedLines[line][component.key] = predefinedField.is(':checked');
                                this.save(entity);
                            });
                            break;
                        default:
                            predefinedField = $(`<span>${component.constructor.getPrettyName()}</span>`);
                            break;
                    }
                    fieldSpan.append(predefinedField);
                    cell.append(fieldSpan);
                }
                else {
                    const newCompJson = component.toJSON();
                    newCompJson.key = `${this.key}.${line}.${component.key}`;
                    cell.append(await componentFactory
                        .createOneComponent(newCompJson)
                        .render(entity, isEditable, { ...options, reference: `${this.key}.${line}` }));
                }
                tableRow.append(cell);
            }
            const controlCell = $('<td></td>');
            const controlDiv = $('<div></div>');
            controlDiv.addClass('custom-system-dynamic-table-row-icons');
            if (this._sortOption === TABLE_SORT_OPTION.MANUAL) {
                const sortSpan = $('<span></span>');
                sortSpan.addClass('custom-system-dynamic-table-sort-icon-wrapper');
                // If we are in a template, we do not move the row order, we directly update the predefined lines array
                // Line is the real index in the props array, parsedIndex is the displayed row number
                const currentIndex = entity.isTemplate ? line : parsedIndex;
                if (isEditable && line !== rowOrder[0]) {
                    const sortUpLink = $('<a class="custom-system-sortUpDynamicLine custom-system-clickable"><i class="fas fa-sort-up custom-system-dynamic-table-sort-icon"></i></a>');
                    sortSpan.append(sortUpLink);
                    sortUpLink.on('click', () => {
                        this._swapElements(entity, currentIndex - 1, currentIndex);
                    });
                }
                if (isEditable && line !== rowOrder[rowOrder.length - 1]) {
                    const sortDownLink = $('<a class="custom-system-sortDownDynamicLine custom-system-clickable"><i class="fas fa-sort-down custom-system-dynamic-table-sort-icon"></i></a>');
                    sortSpan.append(sortDownLink);
                    sortDownLink.on('click', () => {
                        this._swapElements(entity, currentIndex + 1, currentIndex);
                    });
                }
                controlDiv.append(sortSpan);
            }
            if (isEditable) {
                let deletionDisabled = false;
                if (!entity.isTemplate) {
                    const predefinedLineIdx = foundry.utils.getProperty(entity.system.props, `${this.key}.${line}.$predefinedIdx`);
                    deletionDisabled =
                        predefinedLineIdx !== null
                            ? !!this._predefinedLines[predefinedLineIdx]?.$deletionDisabled
                            : false;
                }
                if (!deletionDisabled || game.user.isGM) {
                    const deleteLink = $('<a class="custom-system-deleteDynamicLine custom-system-clickable"><i class="fas fa-trash"></i></a>');
                    if (this._deleteWarning) {
                        deleteLink.on('click', () => {
                            Dialog.confirm({
                                title: game.i18n.localize('CSB.ComponentProperties.DynamicTable.DeleteRowDialog.Title'),
                                content: `<p>${game.i18n.localize('CSB.ComponentProperties.DynamicTable.DeleteRowDialog.Content')}</p>`,
                                yes: () => {
                                    this._deleteRow(entity, line);
                                },
                                no: () => { }
                            });
                        });
                    }
                    else {
                        deleteLink.on('click', () => {
                            this._deleteRow(entity, line);
                        });
                    }
                    controlDiv.append(deleteLink);
                }
            }
            if (entity.isTemplate) {
                const preventDeleteLink = $('<a class="custom-system-clickable"><i class="fas fa-trash-slash"></i></a>');
                if (!this._predefinedLines[line].$deletionDisabled) {
                    preventDeleteLink.addClass('custom-system-link-disabled');
                }
                preventDeleteLink.on('click', () => {
                    this._predefinedLines[line].$deletionDisabled = !this._predefinedLines[line].$deletionDisabled;
                    this.save(entity);
                });
                controlDiv.append(preventDeleteLink);
            }
            controlCell.append(controlDiv);
            tableRow.append(controlCell);
            tableBody.append(tableRow);
        }
        if (isEditable && this.canPlayerAdd) {
            const addRow = $('<tr></tr>');
            const fillCell = $('<td></td>');
            fillCell.attr('colspan', this.contents.length);
            const addButtonCell = $('<td></td>');
            const addButton = $('<a class="custom-system-addDynamicLine custom-system-clickable"><i class="fas fa-plus-circle"></i></a>');
            addButton.on('click', async () => {
                if (entity.isTemplate) {
                    this.predefinedLines.push({
                        ...sampleNewRow,
                        $predefinedIdx: this.predefinedLines.length,
                        $deletionDisabled: false,
                        $deleted: false
                    });
                    await this.save(entity);
                }
                else {
                    let tableProps = foundry.utils.getProperty(entity.system.props, this.key) ?? {};
                    const newIdx = Math.max(...Object.keys(tableProps).map((key) => Number(key))) + 1;
                    // Compute new row
                    const newRow = {
                        $deleted: false
                    };
                    let keysToCompute = Object.keys(sampleNewRow).filter((key) => {
                        return key !== '$deleted' && sampleNewRow[key] !== undefined;
                    });
                    let computedKeys = [];
                    do {
                        computedKeys = [];
                        for (const key of keysToCompute) {
                            try {
                                const tmpProps = foundry.utils.mergeObject(entity.system.props, {
                                    [this.key]: {
                                        [newIdx]: newRow
                                    }
                                }, { inplace: false });
                                newRow[key] = sampleNewRow[key]
                                    ? ComputablePhrase.computeMessageStatic(String(sampleNewRow[key]), tmpProps, {
                                        source: `${this.key}.${newIdx}.${key}.defaultValue`,
                                        triggerEntity: entity,
                                        reference: `${this.key}.${newIdx}`
                                    }).result
                                    : undefined;
                                computedKeys.push(key);
                            }
                            catch (_err) {
                                null;
                            }
                        }
                        keysToCompute = keysToCompute.filter((key) => !computedKeys.includes(key));
                    } while (keysToCompute.length > 0 && computedKeys.length > 0);
                    // Add new row to table data
                    if (newIdx > 0) {
                        tableProps[newIdx] = { ...newRow };
                    }
                    else {
                        tableProps = {
                            0: { ...newRow }
                        };
                    }
                    foundry.utils.setProperty(entity.system.props, this.key, tableProps);
                    await entity.entity.update({
                        system: {
                            props: entity.system.props
                        }
                    });
                }
            });
            addButtonCell.append(addButton);
            addRow.append(fillCell);
            addRow.append(addButtonCell);
            tableBody.append(addRow);
        }
        const internalContents = baseElement.hasClass('custom-system-component-contents')
            ? baseElement
            : baseElement.find('.custom-system-component-contents');
        jQElement.append(tableBody);
        internalContents.append(jQElement);
        return baseElement;
    }
    _sortRows(dynamicProps, entity) {
        let rowOrder = [];
        if (entity.isTemplate) {
            rowOrder = Object.keys(dynamicProps)
                .filter((rowIndex) => !dynamicProps[rowIndex].$deleted)
                .map((rowIndex) => parseInt(rowIndex))
                .sort((a, b) => a - b);
        }
        else {
            const columnSortOption = game.user.getFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.sortOption');
            for (const rowIndex in dynamicProps) {
                if (dynamicProps[rowIndex] && !dynamicProps[rowIndex].$deleted) {
                    rowOrder.push(parseInt(rowIndex));
                }
            }
            switch (this._sortOption) {
                case TABLE_SORT_OPTION.AUTO:
                    this._sortPredicates
                        .map((predicate) => ({ ...predicate }))
                        .reverse()
                        .forEach((predicate) => {
                        rowOrder.sort((a, b) => {
                            const aValue = castToPrimitive(dynamicProps[a][predicate.prop]) ?? '';
                            const bValue = castToPrimitive(dynamicProps[b][predicate.prop]) ?? '';
                            const value = castToPrimitive(predicate.value);
                            return DynamicTable.getSortOrder(aValue, bValue, value, predicate.operator);
                        });
                    });
                    break;
                case TABLE_SORT_OPTION.MANUAL:
                    if (columnSortOption?.prop) {
                        rowOrder.sort((a, b) => {
                            const aValue = castToPrimitive(dynamicProps[a][columnSortOption.prop]) ?? '';
                            const bValue = castToPrimitive(dynamicProps[b][columnSortOption.prop]) ?? '';
                            return DynamicTable.getSortOrder(aValue, bValue, undefined, columnSortOption.operator);
                        });
                    }
                    else {
                        let savedOrder = columnSortOption?.savedOrder ?? [];
                        savedOrder = savedOrder.filter((id) => rowOrder.includes(id));
                        rowOrder.forEach((id) => {
                            if (!savedOrder.includes(id)) {
                                savedOrder.push(id);
                            }
                        });
                        rowOrder = savedOrder;
                    }
                    break;
                case TABLE_SORT_OPTION.DISABLED:
                default:
                    rowOrder = rowOrder.sort((a, b) => a - b);
                    break;
            }
        }
        return rowOrder;
    }
    /**
     * Swaps two dynamic table elements
     * @param entity Rendered entity (actor or item)
     * @param rowIdx1
     * @param rowIdx2
     * @override
     */
    _swapElements(entity, rowIdx1, rowIdx2) {
        if (entity.isTemplate) {
            const tmpRow = { ...this.predefinedLines[rowIdx1] };
            this._predefinedLines[rowIdx1] = this._predefinedLines[rowIdx2];
            this._predefinedLines[rowIdx2] = tmpRow;
            this.save(entity);
        }
        else {
            const rowOrder = game.user.getFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.sortOption.savedOrder');
            const temp = rowOrder[rowIdx1];
            rowOrder[rowIdx1] = rowOrder[rowIdx2];
            rowOrder[rowIdx2] = temp;
            fastSetFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.sortOption', {
                ['-=prop']: true,
                ['-=operator']: true,
                savedOrder: rowOrder
            });
            entity.render(false);
        }
    }
    /**
     * Deletes a row from the Table
     */
    async _deleteRow(entity, rowIdx) {
        if (entity.isTemplate) {
            this._predefinedLines[rowIdx].$deleted = true;
            this.save(entity);
            return;
        }
        const tablePropsPath = `${this.key}.${rowIdx}`;
        const tableProps = foundry.utils.getProperty(entity.system.props, tablePropsPath);
        if (tableProps.$predefinedIdx != null) {
            tableProps.$deleted = true;
            await entity.entity.update({ [`system.props.${tablePropsPath}`]: tableProps });
            return;
        }
        super._deleteRow(entity, rowIdx);
    }
    /**
     * Synchronizes predefined lines, adding predefined lines to the current line of Dynamic Table
     */
    async _synchronizePredefinedLines(entity) {
        const existingPredefinedIdx = {};
        const dynamicProps = foundry.utils.getProperty(entity.system.props, this.key) ?? {};
        // Fetching all existing predefined lines in the actor
        Object.entries(dynamicProps)
            .filter(isPredefinedLine)
            .forEach(([index, line]) => (existingPredefinedIdx[line.$predefinedIdx] = index));
        this.predefinedLines.forEach((predefinedLine) => {
            if (predefinedLine.$deleted) {
                return;
            }
            // If line is not already added to the actor, we add it
            if (!Object.keys(existingPredefinedIdx).includes(String(predefinedLine.$predefinedIdx))) {
                const newIdx = Object.keys(dynamicProps).length === 0
                    ? 0
                    : Math.max(...Object.keys(dynamicProps).map((key) => Number(key))) + 1;
                dynamicProps[newIdx] = { ...predefinedLine };
            }
            else {
                const row = dynamicProps[existingPredefinedIdx[predefinedLine.$predefinedIdx]];
                dynamicProps[existingPredefinedIdx[predefinedLine.$predefinedIdx]] = {
                    ...predefinedLine,
                    ...row,
                    $deletionDisabled: predefinedLine.$deletionDisabled
                };
            }
        });
        foundry.utils.setProperty(entity.system.props, this.key, dynamicProps);
        if (entity.entity.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            await entity.entity.update({
                system: {
                    props: entity.system.props
                }
            });
        }
    }
    getComputeFunctions(entity, modifiers, options, keyOverride) {
        const computationKey = keyOverride ?? this.key;
        const computableFields = this.contents.filter((component) => isComputableElement(component));
        let computationFunctions = {};
        for (const row in foundry.utils.getProperty(entity.system.props, computationKey)) {
            for (const computableElement of computableFields) {
                const newFormulas = computableElement.getComputeFunctions(entity, modifiers, {
                    ...options,
                    reference: `${computationKey}.${row}`
                }, `${computationKey}.${row}.${computableElement.key}`);
                computationFunctions = {
                    ...computationFunctions,
                    ...newFormulas
                };
            }
        }
        return computationFunctions;
    }
    resetComputeValue(valueKeys) {
        const resetValues = {};
        for (const key of valueKeys) {
            foundry.utils.setProperty(resetValues, key, null);
        }
        return resetValues;
    }
    getSendToChatFunctions(entity, options = {}) {
        if (!this.key) {
            return {};
        }
        const relevantFields = this.contents.filter((component) => isChatSenderElement(component));
        const res = {};
        for (const row in foundry.utils.getProperty(entity.system.props, this.key)) {
            res[row] = {};
            for (const chatSenderElement of relevantFields) {
                foundry.utils.mergeObject(res[row], chatSenderElement.getSendToChatFunctions(entity, {
                    ...options,
                    reference: `${this.key}.${row}`
                }));
            }
        }
        return {
            [this.key]: res
        };
    }
    /**
     * Returns serialized component
     * @override
     */
    toJSON() {
        const jsonObj = super.toJSON();
        return {
            ...jsonObj,
            predefinedLines: this.predefinedLines,
            canPlayerAdd: this._canPlayerAdd,
            sortOption: this._sortOption,
            sortPredicates: this._sortPredicates
        };
    }
    /**
     * Creates DynamicTable from JSON description
     * @override
     */
    static fromJSON(json, templateAddress, parent) {
        const rowContents = [];
        const rowLayout = {};
        const dynamicTable = new DynamicTable({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            head: json.head,
            deleteWarning: json.deleteWarning,
            predefinedLines: json.predefinedLines,
            canPlayerAdd: json.canPlayerAdd,
            sortOption: json.sortOption,
            sortPredicates: json.sortPredicates,
            contents: rowContents,
            rowLayout: rowLayout,
            cssClass: json.cssClass,
            role: json.role,
            permission: json.permission,
            visibilityFormula: json.visibilityFormula,
            parent: parent
        });
        for (const [index, componentDesc] of (json.rowLayout ?? []).entries()) {
            const component = componentFactory.createOneComponent(componentDesc, templateAddress + '-rowLayout-' + index, dynamicTable);
            rowContents.push(component);
            rowLayout[component.key] = {
                align: componentDesc.align,
                colName: componentDesc.colName
            };
        }
        return dynamicTable;
    }
    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName() {
        return 'dynamicTable';
    }
    /**
     * Gets pretty name for this component's type
     * @return The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.DynamicTable');
    }
    /**
     * Get configuration form for component creation / edition
     * @return The jQuery element holding the component
     */
    static async getConfigForm(existingComponent, _entity) {
        const predefinedValuesComponent = { ...existingComponent };
        if (predefinedValuesComponent.canPlayerAdd === undefined) {
            predefinedValuesComponent.canPlayerAdd = true;
        }
        if (predefinedValuesComponent.sortOption === undefined) {
            predefinedValuesComponent.sortOption = TABLE_SORT_OPTION.MANUAL;
        }
        const mainElt = $('<div></div>');
        mainElt.append(await renderTemplate(`systems/${game.system.id}/templates/_template/components/dynamicTable.hbs`, {
            ...predefinedValuesComponent,
            SORT_OPERATORS
        }));
        return mainElt;
    }
    /**
     * Attaches event-listeners to the html of the config-form
     */
    static attachListenersToConfigForm(html) {
        $(html)
            .find("input[name='tableSortOption']")
            .on('click', (event) => {
            const targetValue = $(event.currentTarget).val();
            const autoSort = $(html).find('.custom-system-sort-auto');
            const columnSort = $(html).find('.custom-system-sort-column');
            const manualSort = $(html).find('.custom-system-sort-manual');
            const disabledSort = $(html).find('.custom-system-sort-disabled');
            const slideValue = 200;
            autoSort.slideUp(slideValue);
            columnSort.slideUp(slideValue);
            manualSort.slideUp(slideValue);
            disabledSort.slideUp(slideValue);
            switch (targetValue) {
                case 'auto':
                    autoSort.slideDown(slideValue);
                    break;
                case 'column':
                    columnSort.slideDown(slideValue);
                    break;
                case 'manual':
                    manualSort.slideDown(slideValue);
                    break;
                case 'disabled':
                    disabledSort.slideDown(slideValue);
                    break;
            }
        });
        $(html)
            .find('#custom-system-add-sort-predicate')
            .on('click', () => {
            const newId = $(html).find('#custom-system-table-sort-predicates select').length;
            const newRow = $(html).find('#custom-system-table-sort-predicate-template')[0].content.cloneNode(true);
            $(newRow)
                .find('select')
                .each((_i, elt) => {
                $(elt).attr('id', `${elt.name}_${newId}`);
            });
            $(html)
                .find('#custom-system-table-sort-predicates > tbody')
                .append(newRow);
        });
        $(html)
            .find('#custom-system-table-sort-predicates')
            .on('click', '.custom-system-delete-sort-predicate', (ev) => {
            const target = $(ev.currentTarget);
            target.parents('tr').remove();
        });
    }
    /**
     * Extracts configuration from submitted HTML form
     * @override
     * @param html The submitted form
     * @return The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(html) {
        const fieldData = super.extractConfig(html);
        fieldData.canPlayerAdd = html.find('#tableCanPlayerAdd').is(':checked');
        fieldData.sortOption = html.find('input[name=tableSortOption]:checked').val();
        if (fieldData.sortOption === TABLE_SORT_OPTION.AUTO) {
            fieldData.sortPredicates = this._fetchDataFromHTMLTable(html, 'custom-system-table-sort-predicate', new Map([
                [
                    'prop',
                    {
                        element: 'input[name=tableSortProp]',
                        name: game.i18n.localize('CSB.ComponentProperties.ExtensibleTable.Sort.ColumnKey')
                    }
                ],
                [
                    'operator',
                    {
                        element: 'select[name=tableSortOp]',
                        name: game.i18n.localize('CSB.ComponentProperties.ExtensibleTable.Sort.Operator')
                    }
                ],
                [
                    'value',
                    {
                        element: 'input[name=tableSortValue]',
                        optional: true,
                        name: game.i18n.localize('CSB.ComponentProperties.ExtensibleTable.Sort.Value')
                    }
                ]
            ]));
        }
        else {
            fieldData.sortPredicates = [];
        }
        return fieldData;
    }
    /**
     * Fetches data from an HTML-Table
     * @throws {Error} If configuration is not correct
     */
    static _fetchDataFromHTMLTable(html, tableRowClass, tableProperties) {
        const collection = [];
        html.find(`tr.${tableRowClass}`).each((_index, elt) => {
            const rowData = {};
            tableProperties.forEach((value, key) => {
                let input = $(elt).find(value.element).val();
                if (!value.optional && !input) {
                    throw new Error(game.i18n.format('CSB.ComponentProperties.Errors.DynamicTableAutoFilterValidationError', {
                        KEY: value.name
                    }));
                }
                if (Array.isArray(input)) {
                    input = input.join();
                }
                rowData[key] = String(input);
            });
            collection.push(rowData);
        });
        return collection;
    }
    /**
     * Add a new Component as eligible for this Container
     *
     * @param name The technical name which identifies the component in the ComponentFactory
     */
    static addAllowedComponent(name) {
        this.ALLOWED_COMPONENTS.push(name);
    }
}
DynamicTable.ALLOWED_COMPONENTS = [
    Checkbox.getTechnicalName(),
    Dropdown.getTechnicalName(),
    Label.getTechnicalName(),
    Meter.getTechnicalName(),
    NumberField.getTechnicalName(),
    RadioButton.getTechnicalName(),
    RichTextArea.getTechnicalName(),
    TextField.getTechnicalName()
];
/**
 * @ignore
 */
export default DynamicTable;
