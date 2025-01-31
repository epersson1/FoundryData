/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import Component from './Component.js';
export const COMPONENT_SIZES = {
    'full-size': 'CSB.ComponentProperties.Size.Auto',
    'x-small': 'CSB.ComponentProperties.Size.Tiny',
    small: 'CSB.ComponentProperties.Size.Smaller',
    'm-small': 'CSB.ComponentProperties.Size.Small',
    medium: 'CSB.ComponentProperties.Size.Medium',
    'm-large': 'CSB.ComponentProperties.Size.Large',
    large: 'CSB.ComponentProperties.Size.Larger',
    'x-large': 'CSB.ComponentProperties.Size.Gigantic'
};
/**
 * Abstract class for Components which serve as inputs
 * @abstract
 */
class InputComponent extends Component {
    /**
     * Constructor
     * @param props Component data
     */
    constructor(props) {
        super(props);
        if (this.constructor === InputComponent) {
            throw new TypeError('Abstract class "DataComponent" cannot be instantiated directly');
        }
        this._label = props.label;
        this._defaultValue = props.defaultValue;
        this._size = props.size ?? 'full-size';
    }
    /**
     * Component property key
     * @override
     */
    get propertyKey() {
        return this.key;
    }
    /**
     * Field label
     */
    get label() {
        return this._label;
    }
    /**
     * Field default value
     */
    get defaultValue() {
        return this._defaultValue;
    }
    /**
     * Field size
     */
    get size() {
        return this._size;
    }
    /**
     * Renders the outer part of an input component, including the label if exists
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user?
     * @param options Additional options usable by the final Component
     * @return The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-field custom-system-field-root custom-system-field-' + (this.size ?? 'full-size'));
        if (this.label) {
            const label = $('<label></label>');
            label.attr('for', `${entity.uuid}-${this.key}`);
            label.text(this.label);
            jQElement.append(label);
        }
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
            key: this.key,
            label: this.label,
            defaultValue: this._defaultValue,
            size: this.size
        };
    }
}
/**
 * @inheritdoc
 */
InputComponent.valueType = 'string';
/**
 * @ignore
 */
export default InputComponent;
