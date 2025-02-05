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
import { RequiredFieldError } from '../../errors/ComponentValidationError.js';
/**
 * Checkbox component
 * @ignore
 */
class Checkbox extends InputComponent {
    /**
     * Checkbox constructor
     */
    constructor(props) {
        super(props);
        /**
         * Checkbox default state
         */
        this._defaultChecked = false;
        this._defaultChecked = props.defaultChecked;
    }
    /**
     * Renders component
     * @override
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user?
     * @param options Additional options usable by the final Component
     * @returns The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        const props = { ...entity.system.props, ...options.customProps };
        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-checkbox');
        const inputElement = $('<input />');
        inputElement.attr('type', 'checkbox');
        inputElement.attr('id', `${entity.uuid}-${this.key}`);
        if (!entity.isTemplate) {
            inputElement.attr('name', 'system.props.' + this.key);
        }
        const checkedStatus = foundry.utils.getProperty(props, this.key);
        const checked = checkedStatus || (checkedStatus === undefined && this._defaultChecked);
        if (checked) {
            inputElement.attr('checked', 'checked');
        }
        if (!entity.isTemplate) {
            foundry.utils.setProperty(entity.system.props, this.key, checked);
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
            defaultChecked: this._defaultChecked
        };
    }
    /**
     * Creates checkbox from JSON description
     */
    static fromJSON(json, templateAddress, parent) {
        return new Checkbox({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            label: json.label,
            size: json.size,
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
        return 'checkbox';
    }
    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.Checkbox');
    }
    /**
     * Get configuration form for component creation / edition
     * @returns The jQuery element holding the component
     */
    static async getConfigForm(existingComponent, _entity) {
        const mainElt = $('<div></div>');
        mainElt.append(await renderTemplate(`systems/${game.system.id}/templates/_template/components/checkbox.hbs`, {
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
            label: html.find('#checkboxLabel').val()?.toString(),
            size: html.find('#checkboxSize').val()?.toString() ?? 'full-size',
            defaultChecked: html.find('#checkboxDefaultChecked').is(':checked')
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
Checkbox.valueType = 'boolean';
/**
 * @ignore
 */
export default Checkbox;
