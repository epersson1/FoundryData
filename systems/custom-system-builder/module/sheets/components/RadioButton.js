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
import InputComponent from './InputComponent.js';
import { AlphanumericPatternError, RequiredFieldError } from '../../errors/ComponentValidationError.js';
import { COMPONENT_SIZES } from './SizedComponent.js';
import TemplateSystem from '../../documents/TemplateSystem.js';
/**
 * Checkbox component
 * @ignore
 */
class RadioButton extends InputComponent {
    static valueType = 'string';
    /**
     * Radio button group
     */
    _group;
    /**
     * Radio button value
     */
    _value;
    /**
     * Radio button default state
     */
    _defaultChecked;
    /**
     * RadioButton constructor
     */
    constructor(props) {
        super(props);
        this._group = props.group;
        this._value = props.value;
        this._defaultChecked = props.defaultChecked ?? false;
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
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user ?
     * @param options Additional options usable by the final Component
     * @return The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-radio');
        const inputElement = $('<input />');
        inputElement.attr('type', 'radio');
        inputElement.attr('id', this.getSluggedId(entity));
        if (TemplateSystem.isAppliedTemplateSystem(entity)) {
            const props = { ...entity.system.props, ...options.customProps };
            const value = this.computeButtonValue(entity, options);
            inputElement.attr('name', 'system.props.' + this._group);
            inputElement.attr('value', value);
            const radioGroupValue = foundry.utils.getProperty(props, this._group);
            if (radioGroupValue === value || (radioGroupValue === undefined && this._defaultChecked)) {
                inputElement.attr('checked', 'checked');
            }
        }
        else {
            if (this._defaultChecked) {
                inputElement.attr('checked', 'checked');
            }
        }
        if (!isEditable) {
            inputElement.attr('disabled', 'disabled');
        }
        jQElement.append(inputElement);
        if (TemplateSystem.isBuilderTemplateSystem(entity)) {
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
    computeButtonValue(entity, options = {}) {
        const props = { ...entity.system.props, ...options.customProps };
        return ComputablePhrase.computeMessageStatic(this._value, props, {
            source: this.key,
            reference: options.reference,
            defaultValue: '',
            triggerEntity: entity
        }).result;
    }
    setDefaultValue(entity, options = {}) {
        if (foundry.utils.getProperty(entity.system.props, this.propertyKey) === undefined && this._defaultChecked) {
            const value = this.computeButtonValue(entity, options);
            foundry.utils.setProperty(entity.system.props, this.propertyKey, value);
        }
    }
    getComputeFunctions(_entity, _modifiers, options, keyOverride) {
        const computationKey = keyOverride ?? this.key;
        if (!computationKey) {
            return {};
        }
        return {
            [computationKey]: {
                formula: this._value ?? '',
                options
            }
        };
    }
    resetComputeValue(valueKeys) {
        const resetValues = {};
        for (const key of valueKeys) {
            foundry.utils.setProperty(resetValues, key, undefined);
        }
        return resetValues;
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
            ...json,
            parent: parent,
            templateAddress: templateAddress
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
    static async getConfigForm(_entity, appId, existingComponent) {
        const mainElt = document.createElement('div');
        mainElt.innerHTML = await foundry.applications.handlebars.renderTemplate(`systems/${game.system.id}/templates/_template/components/radioButton.hbs`, {
            ...existingComponent,
            COMPONENT_SIZES,
            appId
        });
        mainElt.querySelector('[name="size"]')?.addEventListener('change', (event) => {
            const target = event.currentTarget;
            const customSizeBlock = $(mainElt.querySelector('.custom-system-size-custom'));
            const slideValue = 200;
            switch (target.value) {
                case 'custom':
                    customSizeBlock.slideDown(slideValue);
                    break;
                default:
                    customSizeBlock.slideUp(slideValue);
                    break;
            }
        });
        return mainElt;
    }
    /**
     * Extracts configuration from submitted HTML form
     * @param html The submitted form
     * @returns The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(rawConfigData, html) {
        const configData = rawConfigData;
        const fieldData = {
            ...super.extractConfig(configData, html),
            group: configData.group ?? '',
            value: configData.value ?? '',
            defaultChecked: configData.defaultChecked
        };
        return fieldData;
    }
    static validateConfig(json) {
        super.validateConfig(json);
        if (!json.group) {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.RadioButton.Group'), json);
        }
        if (!json.group.match(/^[a-zA-Z0-9_]+$/)) {
            throw new AlphanumericPatternError(game.i18n.localize('CSB.ComponentProperties.RadioButton.Group'), json);
        }
    }
}
/**
 * @ignore
 */
export default RadioButton;
