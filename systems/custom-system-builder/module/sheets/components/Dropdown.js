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
import InputComponent, { COMPONENT_SIZES } from './InputComponent.js';
import { ComponentValidationError, RequiredFieldError } from '../../errors/ComponentValidationError.js';
/**
 * Dropdown component
 * @ignore
 */
class Dropdown extends InputComponent {
    /** Dropdown constructor */
    constructor(props) {
        super(props);
        this._selectedOptionType = props.selectedOptionType;
        this._options = props.options;
        this._tableKey = props.tableKey;
        this._tableKeyColumn = props.tableKeyColumn;
        this._tableLabelColumn = props.tableLabelColumn;
        this._formulaKeyOptions = props.formulaKeyOptions;
        this._formulaLabelOptions = props.formulaLabelOptions;
    }
    get key() {
        return this._key;
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
        const props = { ...entity.system.props, ...options.customProps };
        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-select');
        const selectElement = $('<select />');
        selectElement.attr('id', `${entity.uuid}-${this.key}`);
        if (!entity.isTemplate) {
            selectElement.attr('name', 'system.props.' + this.key);
        }
        if (!isEditable) {
            selectElement.attr('disabled', 'disabled');
        }
        if (!this.defaultValue) {
            const emptyOption = $('<option></option>');
            emptyOption.attr('value', '');
            selectElement.append(emptyOption);
        }
        const optionKeys = new Set();
        if (!entity.isTemplate) {
            if (this._selectedOptionType === 'table') {
                let baseProps = entity.system.props;
                let tableKey = this._tableKey;
                if (tableKey.startsWith('parent.')) {
                    baseProps = entity.entity.parent?.system.props;
                    tableKey = tableKey.split('.', 2)[1];
                }
                const dynamicProps = foundry.utils.getProperty(baseProps, tableKey);
                if (dynamicProps) {
                    for (const rowIndex in dynamicProps) {
                        if (dynamicProps[rowIndex] && !dynamicProps[rowIndex]?.$deleted) {
                            selectElement.append(this._addOption(optionKeys, dynamicProps[rowIndex][this._tableKeyColumn], this._tableLabelColumn
                                ? dynamicProps[rowIndex][this._tableLabelColumn]
                                : dynamicProps[rowIndex][this._tableKeyColumn]));
                        }
                    }
                }
            }
            else if (this._selectedOptionType === 'formula' && !entity.isTemplate) {
                const keyOptions = (await ComputablePhrase.computeMessage(this._formulaKeyOptions, props, {
                    ...options,
                    source: `${this.key}.keyOptions`,
                    reference,
                    defaultValue: '',
                    triggerEntity: entity
                })).result.split(',');
                const labelOptions = (await ComputablePhrase.computeMessage(this._formulaLabelOptions ?? '', props, {
                    ...options,
                    source: `${this.key}.labelOptions`,
                    reference,
                    defaultValue: '',
                    triggerEntity: entity
                })).result.split(',');
                if (labelOptions[0] !== '' && keyOptions.length !== labelOptions.length) {
                    ui.notifications.error(game.i18n.format('CSB.UserMessages.Dropdown.OptionsLengthError', { COMPONENT_KEY: this.key }));
                }
                else {
                    for (let i = 0; i < keyOptions.length; i++) {
                        selectElement.append(this._addOption(optionKeys, keyOptions[i], labelOptions[0] === '' ? keyOptions[i] : labelOptions[i]));
                    }
                }
            }
            else {
                for (const option of this._options) {
                    selectElement.append(this._addOption(optionKeys, option.key, option.value));
                }
            }
            const selectedValue = foundry.utils.getProperty(props, this.key) ??
                ComputablePhrase.computeMessageStatic(this.defaultValue ?? '', props, {
                    source: this.key,
                    reference,
                    defaultValue: '',
                    triggerEntity: entity
                }).result;
            selectElement.val(optionKeys.has(selectedValue) ? selectedValue : selectElement.find('option:first').val());
        }
        jQElement.append(selectElement);
        if (entity.isTemplate) {
            jQElement.addClass('custom-system-editable-component');
            selectElement.addClass('custom-system-editable-field');
            jQElement.on('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                this.editComponent(entity);
            });
        }
        return jQElement;
    }
    /** Returns serialized component */
    toJSON() {
        const jsonObj = super.toJSON();
        return {
            ...jsonObj,
            selectedOptionType: this._selectedOptionType,
            options: this._options,
            tableKey: this._tableKey,
            tableKeyColumn: this._tableKeyColumn,
            tableLabelColumn: this._tableLabelColumn,
            formulaKeyOptions: this._formulaKeyOptions,
            formulaLabelOptions: this._formulaLabelOptions
        };
    }
    /** Creates Dropdown from JSON description */
    static fromJSON(json, templateAddress, parent) {
        return new Dropdown({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            label: json.label,
            defaultValue: json.defaultValue,
            selectedOptionType: json.selectedOptionType ?? 'custom',
            options: json.options,
            tableKey: json.tableKey,
            tableKeyColumn: json.tableKeyColumn,
            tableLabelColumn: json.tableLabelColumn,
            formulaKeyOptions: json.formulaKeyOptions,
            formulaLabelOptions: json.formulaLabelOptions,
            size: json.size,
            cssClass: json.cssClass,
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
        return 'select';
    }
    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.Dropdown');
    }
    /** Get configuration form for component creation / edition */
    static async getConfigForm(existingComponent, _entity) {
        const predefinedValues = { ...existingComponent };
        predefinedValues.selectedOptionType = predefinedValues.selectedOptionType ?? 'custom';
        const mainElt = $('<div></div>');
        mainElt.append(await renderTemplate(`systems/${game.system.id}/templates/_template/components/dropdown.hbs`, {
            ...predefinedValues,
            COMPONENT_SIZES
        }));
        return mainElt;
    }
    /** Attaches event-listeners to the html of the config-form */
    static attachListenersToConfigForm(html) {
        const deleteOptionRow = (event) => {
            const target = $(event.currentTarget);
            const row = target.parents('tr');
            // Remove it from the DOM
            $(row).remove();
        };
        $(html)
            .find('.custom-system-delete-option')
            .on('click', (event) => deleteOptionRow(event));
        $(html)
            .find('#addOption')
            .on('click', (event) => {
            const target = $(event.currentTarget);
            // Last row contains only the add button
            const lastRow = target.parents('tr');
            // Create new row
            const newRow = $(`
<tr class="custom-system-dropdown-option">
    <td>
        <input type="text" class="custom-system-dropdown-option-key" />
    </td>
    <td>
        <input type="text" class="custom-system-dropdown-option-value" />
    </td>
    <td>
        <a class="custom-system-delete-option">
            <i class="fas fa-trash"></i>
        </a>
    </td>
</tr>`);
            $(newRow)
                .find('.custom-system-delete-option')
                .on('click', (event) => deleteOptionRow(event));
            // Insert new row before control row
            lastRow.before(newRow);
        });
        $(html)
            .find("input[name='dropdownOptionMode']")
            .on('click', (event) => {
            const target = $(event.currentTarget);
            const customOptions = $('.custom-system-custom-options');
            const dynamicTableOptions = $('.custom-system-dynamic-options');
            const formulaOptions = $('.custom-system-formula-options');
            const slideValue = 200;
            switch (target[0].id) {
                case 'customOptions':
                    customOptions.slideDown(slideValue);
                    dynamicTableOptions.slideUp(slideValue);
                    formulaOptions.slideUp(slideValue);
                    break;
                case 'dynamicTableOptions':
                    customOptions.slideUp(slideValue);
                    dynamicTableOptions.slideDown(slideValue);
                    formulaOptions.slideUp(slideValue);
                    break;
                case 'formulaOptions':
                    customOptions.slideUp(slideValue);
                    dynamicTableOptions.slideUp(slideValue);
                    formulaOptions.slideDown(slideValue);
                    break;
            }
        });
    }
    /**
     * Extracts configuration from submitted HTML form
     * @override
     * @param {JQuery} html The submitted form
     * @return {DropdownJson} The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(html) {
        const options = [];
        const selectedOptionType = html.find('#dynamicTableOptions').is(':checked')
            ? 'table'
            : html.find('#formulaOptions').is(':checked')
                ? 'formula'
                : 'custom';
        let tableKey;
        let tableKeyColumn;
        let tableLabelColumn;
        let formulaKeyOptions;
        let formulaLabelOptions;
        switch (selectedOptionType) {
            case 'custom':
                for (const optionRow of html.find('tr.custom-system-dropdown-option')) {
                    const key = $(optionRow).find('.custom-system-dropdown-option-key').val()?.toString() ?? '';
                    let value = $(optionRow).find('.custom-system-dropdown-option-value').val()?.toString() ?? '';
                    if (value === '') {
                        value = key;
                    }
                    options.push({
                        key: key,
                        value: value
                    });
                }
                break;
            case 'table':
                tableKey = html.find('#selectDynamicTableKey').val()?.toString();
                tableKeyColumn = html.find('#selectDynamicTableKeyColumn').val()?.toString();
                tableLabelColumn = html.find('#selectDynamicTableLabelColumn').val()?.toString();
                break;
            case 'formula':
                formulaKeyOptions = html.find('#formulaKeyOptions').val()?.toString();
                formulaLabelOptions = html.find('#formulaLabelOptions').val()?.toString();
                break;
        }
        const fieldData = {
            ...super.extractConfig(html),
            label: html.find('#selectLabel').val()?.toString(),
            defaultValue: html.find('#selectDefaultValue').val()?.toString(),
            size: html.find('#selectSize').val()?.toString() ?? 'full-size',
            selectedOptionType: selectedOptionType,
            options: options,
            tableKey: tableKey,
            tableKeyColumn: tableKeyColumn,
            tableLabelColumn: tableLabelColumn,
            formulaKeyOptions: formulaKeyOptions,
            formulaLabelOptions: formulaLabelOptions
        };
        this.validateConfig(fieldData);
        return fieldData;
    }
    static validateConfig(json) {
        super.validateConfig(json);
        if (!json.key) {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.ComponentKey'), json);
        }
        switch (json.selectedOptionType) {
            case 'custom':
                json.options.forEach((option) => {
                    if (option.key === '') {
                        throw new ComponentValidationError(game.i18n.localize('CSB.ComponentProperties.Errors.DropdownOptionValidationError'), 'options', json);
                    }
                });
                break;
            case 'formula':
                if (!json.formulaKeyOptions) {
                    throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.Dropdown.OptionsOrigin.FormulaForKeyOption'), json);
                }
                break;
            case 'table':
                if (!json.tableKey) {
                    throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.Dropdown.OptionsOrigin.DynamicTableKey'), json);
                }
                if (!json.tableKeyColumn) {
                    throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.Dropdown.OptionsOrigin.DynamicTableOptionKey'), json);
                }
                break;
        }
    }
    /**
     * Adds an option to the provided collection
     * @param collection {Set}
     * @param key {String}
     * @param value {String}
     * @returns {JQuery}
     * @private
     */
    _addOption(collection, key, value) {
        const optionElement = $('<option></option>');
        collection.add(key);
        optionElement.attr('value', key);
        optionElement.text(value);
        return optionElement;
    }
}
/**
 * @ignore
 */
export default Dropdown;
