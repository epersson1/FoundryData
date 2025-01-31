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
import Logger from '../../Logger.js';
import InputComponent, { COMPONENT_SIZES } from './InputComponent.js';
import { RequiredFieldError } from '../../errors/ComponentValidationError.js';
/**
 * TextField component
 * @ignore
 */
class TextField extends InputComponent {
    /**
     * Text field constructor
     */
    constructor(props) {
        super(props);
        this._charList = props.charList;
        this._maxLength = props.maxLength;
        this._autocomplete = props.autocomplete ?? '';
    }
    /**
     * Renders component
     * @override
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user ?
     * @param options Additional options usable by the final Component
     * @return The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        const { reference } = options;
        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-text-field');
        const inputElement = $('<input />');
        inputElement.attr('type', 'text');
        inputElement.attr('id', `${entity.uuid}-${this.key}`);
        if (!entity.isTemplate) {
            inputElement.attr('name', 'system.props.' + this.key);
        }
        if (!isEditable) {
            inputElement.attr('disabled', 'disabled');
        }
        const fieldValue = foundry.utils.getProperty(entity.system.props, this.key) ??
            (this.defaultValue
                ? ComputablePhrase.computeMessageStatic(this.defaultValue, entity.system.props, {
                    source: `${this.key}.defaultValue`,
                    reference,
                    defaultValue: '',
                    triggerEntity: entity
                }).result
                : '');
        inputElement.val(fieldValue);
        let changeEventAdded = false;
        inputElement.on('keydown', () => {
            const oldValue = String(inputElement.val());
            // Triggers the change only once
            if (!changeEventAdded) {
                changeEventAdded = true;
                inputElement.one('change', () => {
                    changeEventAdded = false;
                    let newValue = String(inputElement.val());
                    if (this._maxLength && this._maxLength > 0 && newValue.length > this._maxLength) {
                        newValue = newValue.substring(0, this._maxLength);
                    }
                    if (this._charList) {
                        const validationRegex = new RegExp('^[' + this._charList.replace('\\', '\\\\') + ']*$');
                        if (!newValue.match(validationRegex)) {
                            newValue = oldValue;
                            ui.notifications.warn(game.i18n.localize('CSB.UserMessages.TextField.WrongValue'));
                        }
                    }
                    inputElement.val(newValue);
                });
            }
        });
        jQElement.append(inputElement);
        if (!entity.isTemplate && this._autocomplete) {
            let autocompleteOptions;
            try {
                autocompleteOptions = ComputablePhrase.computeMessageStatic(this._autocomplete, entity.system.props, {
                    source: `${this.key}.autocompleteOptions`,
                    reference,
                    defaultValue: '',
                    triggerEntity: entity
                }).result;
            }
            catch (err) {
                Logger.error(err.message, err);
                autocompleteOptions = '';
            }
            const autocompleteDataList = $('<datalist></datalist>');
            autocompleteDataList.attr('id', `${entity.uuid}-${this.key}.autocompleteOptions`);
            inputElement.attr('list', `${entity.uuid}-${this.key}.autocompleteOptions`);
            autocompleteDataList.append(autocompleteOptions.split(',').map((optionValue) => {
                const optionElt = $('<option />');
                optionElt.attr('value', optionValue);
                return optionElt;
            }));
            jQElement.append(autocompleteDataList);
        }
        if (entity.isTemplate) {
            jQElement.addClass('custom-system-editable-component');
            inputElement.addClass('custom-system-editable-field');
            jQElement.on('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                this.editComponent(entity);
            });
        }
        return jQElement;
    }
    /**
     * Returns serialized component
     */
    toJSON() {
        const jsonObj = super.toJSON();
        return {
            ...jsonObj,
            charList: this._charList,
            maxLength: this._maxLength,
            autocomplete: this._autocomplete
        };
    }
    /**
     * Creates TextField from JSON description
     */
    static fromJSON(json, templateAddress, parent) {
        return new TextField({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            charList: json.charList,
            maxLength: json.maxLength,
            autocomplete: json.autocomplete,
            label: json.label,
            defaultValue: json.defaultValue,
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
        return 'textField';
    }
    /**
     * Gets pretty name for this component's type
     * @return The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.TextField');
    }
    /**
     * Get configuration form for component creation / edition
     * @return The jQuery element holding the component
     */
    static async getConfigForm(existingComponent, _entity) {
        const mainElt = $('<div></div>');
        mainElt.append(await renderTemplate(`systems/${game.system.id}/templates/_template/components/textField.hbs`, {
            ...existingComponent,
            COMPONENT_SIZES
        }));
        return mainElt;
    }
    /**
     * Extracts configuration from submitted HTML form
     * @param html The submitted form
     * @return The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(html) {
        const maxLengthString = html.find('#textFieldMaxLength').val()?.toString();
        const fieldData = {
            ...super.extractConfig(html),
            label: html.find('#textFieldLabel').val()?.toString(),
            defaultValue: html.find('#textFieldValue').val()?.toString(),
            size: html.find('#textFieldSize').val()?.toString() ?? 'full-size',
            charList: html.find('#textFieldCharList').val()?.toString(),
            maxLength: maxLengthString ? parseInt(maxLengthString) : undefined,
            autocomplete: html.find('#textFieldAutocomplete').val()?.toString()
        };
        this.validateConfig(fieldData);
        return fieldData;
    }
    static validateConfig(json) {
        super.validateConfig(json);
        if (!json.key) {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.ComponentKey'), json);
        }
    }
}
/**
 * @ignore
 */
export default TextField;
