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
import { AlphanumericPatternError, RequiredFieldError } from '../../errors/ComponentValidationError.js';
/**
 * Checkbox component
 * @ignore
 */
class RadioButton extends InputComponent {
    /**
     * RadioButton constructor
     */
    constructor(props) {
        super(props);
        this._group = props.group;
        this._value = props.value;
        this._defaultChecked = props.defaultChecked;
    }
    /**
     * Component property key
     */
    get propertyKey() {
        return this._group;
    }
    /**
     * Component default value
     */
    get defaultValue() {
        if (this._defaultChecked) {
            return this._value;
        }
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
        jQElement.addClass('custom-system-radio');
        const value = ComputablePhrase.computeMessageStatic(this._value, entity.system.props, {
            source: this.key,
            reference,
            defaultValue: '',
            triggerEntity: entity
        }).result;
        const inputElement = $('<input />');
        inputElement.attr('type', 'radio');
        inputElement.attr('id', `${entity.uuid}-${this.key}`);
        inputElement.attr('value', value);
        const radioGroupValue = foundry.utils.getProperty(entity.system.props, this._group);
        if (radioGroupValue === value || (radioGroupValue === undefined && this._defaultChecked)) {
            inputElement.attr('checked', 'checked');
            if (!entity.isTemplate) {
                foundry.utils.setProperty(entity.system.props, this.propertyKey, this._value);
            }
        }
        if (!entity.isTemplate) {
            inputElement.attr('name', 'system.props.' + this._group);
            foundry.utils.setProperty(entity.system.props, this.key, this._value);
        }
        if (!isEditable) {
            inputElement.attr('disabled', 'disabled');
        }
        jQElement.append(inputElement);
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
            group: this._group,
            value: this._value,
            defaultChecked: this._defaultChecked
        };
    }
    /**
     * Creates component from JSON description
     */
    static fromJSON(json, templateAddress, parent) {
        return new RadioButton({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            label: json.label,
            size: json.size,
            group: json.group,
            value: json.value,
            defaultChecked: json.defaultChecked,
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
        return 'radioButton';
    }
    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.RadioButton');
    }
    /**
     * Get configuration form for component creation / edition
     */
    static async getConfigForm(existingComponent, _entity) {
        const mainElt = $('<div></div>');
        mainElt.append(await renderTemplate(`systems/${game.system.id}/templates/_template/components/radioButton.hbs`, {
            ...existingComponent,
            COMPONENT_SIZES
        }));
        return mainElt;
    }
    /**
     * Extracts configuration from submitted HTML form
     * @param html The submitted form
     * @returns The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(html) {
        const fieldData = {
            ...super.extractConfig(html),
            label: html.find('#radioButtonLabel').val()?.toString(),
            size: html.find('#radioButtonSize').val()?.toString() ?? 'full-size',
            group: html.find('#radioButtonGroup').val()?.toString() ?? '',
            value: html.find('#radioButtonValue').val()?.toString() ?? '',
            defaultChecked: html.find('#radioButtonDefaultChecked').is(':checked')
        };
        this.validateConfig(fieldData);
        return fieldData;
    }
    static validateConfig(json) {
        super.validateConfig(json);
        if (!json.key) {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.ComponentKey'), json);
        }
        if (!json.group) {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.RadioButton.Group'), json);
        }
        if (!json.group.match(/^[a-zA-Z0-9_]+$/)) {
            throw new AlphanumericPatternError(game.i18n.localize('CSB.ComponentProperties.RadioButton.Group'), json);
        }
    }
}
RadioButton.valueType = 'string';
/**
 * @ignore
 */
export default RadioButton;
