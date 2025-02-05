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
import CustomDialog from '../../applications/custom-dialog.js';
import { createProseMirrorEditor, trimProseMirrorEmptyValue } from '../../utils.js';
export const RICH_TEXT_AREA_STYLES = {
    sheet: 'CSB.ComponentProperties.TextArea.Style.InSheetEditor',
    dialog: 'CSB.ComponentProperties.TextArea.Style.DialogEditor',
    icon: 'CSB.ComponentProperties.TextArea.Style.IconOnly'
};
/**
 * Rich text area component
 * @ignore
 */
class RichTextArea extends InputComponent {
    /**
     * Rich text area constructor
     */
    constructor(props) {
        super(props);
        this._style = props.style;
    }
    /**
     * Renders component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        const props = { ...entity.system.props, ...options.customProps };
        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-text-area');
        jQElement.addClass('custom-system-rich-editor' + (this._style !== 'sheet' ? '-dialog' : ''));
        if (!entity.isTemplate) {
            const contents = (foundry.utils.getProperty(props, this.key) || this.defaultValue) ?? '';
            const enrichedContents = await TextEditor.enrichHTML(contents, {
                secrets: isEditable,
                rollData: entity.getRollData()
            });
            const editButton = $('<a></a>');
            editButton.addClass('custom-system-rich-editor-button');
            editButton.html('<i class="fas fa-edit"></i>');
            editButton.on('click', () => {
                const content = `<div class="custom-system-dialog-editor editor prosemirror"><div class="editor-content"></div></div><input type="hidden" class="closingAction" value="save" />`;
                //@ts-expect-error Outdated types
                let editor;
                // Dialog creation
                const d = new CustomDialog({
                    title: game.i18n.localize('CSB.ComponentProperties.TextArea.Dialog.Title'),
                    content: content,
                    buttons: {
                        validate: {
                            icon: '<i class="fas fa-check"></i>',
                            label: game.i18n.localize('Save')
                        },
                        cancel: {
                            icon: '<i class="fas fa-times"></i>',
                            label: game.i18n.localize('Cancel'),
                            callback: (html) => {
                                $(html).find('.closingAction').val('cancel');
                            }
                        }
                    },
                    render: async (html) => {
                        editor = await createProseMirrorEditor($(html).find('.editor-content')[0], contents);
                    },
                    close: (html) => {
                        const action = $(html).find('.closingAction').val();
                        if (action === 'save') {
                            const newValue = $(html).find('textarea').length > 0
                                ? $(html).find('textarea').val()
                                : editor.view.dom.innerHTML;
                            foundry.utils.setProperty(entity.system.props, this.key, trimProseMirrorEmptyValue(newValue));
                            entity.entity.update({
                                system: {
                                    props: entity.system.props
                                }
                            });
                        }
                        editor.destroy();
                    }
                }, {
                    width: 530,
                    height: 480,
                    resizable: true
                });
                d.render(true);
            });
            const editor = $('<div></div>');
            editor.addClass('custom-system-rich-content');
            switch (this._style) {
                case 'sheet':
                    if (isEditable) {
                        editor.html(
                        //@ts-expect-error Outdated types
                        foundry.applications.fields.createEditorInput({
                            name: 'system.props.' + this.key,
                            value: enrichedContents,
                            button: true,
                            editable: isEditable,
                            engine: 'prosemirror'
                        }));
                    }
                    else {
                        editor.html(enrichedContents);
                    }
                    break;
                case 'dialog':
                    editor.html(enrichedContents);
                    if (contents !== '') {
                        editButton.addClass('custom-system-rich-editor-button-float');
                    }
                    jQElement
                        .on('mouseover', () => {
                        editButton.show();
                    })
                        .on('mouseleave', () => {
                        if (contents !== '') {
                            editButton.hide();
                        }
                    });
                    break;
                case 'icon':
                default:
                    break;
            }
            jQElement.append(editor);
            if (isEditable && this._style !== 'sheet') {
                jQElement.append(editButton);
            }
        }
        else {
            jQElement.addClass('custom-system-editable-component');
            jQElement.append(this.defaultValue === '' || this.defaultValue === undefined ? '&#9744;' : this.defaultValue);
            jQElement.append($('<i class="fas fa-paragraph"></i>'));
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
            style: this._style
        };
    }
    /**
     * Creates RichTextArea from JSON description
     */
    static fromJSON(json, templateAddress, parent) {
        return new RichTextArea({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            label: json.label,
            defaultValue: json.defaultValue,
            style: json.style,
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
        return 'textArea';
    }
    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.RichTextArea');
    }
    /**
     * Get configuration form for component creation / edition
     * @returns The jQuery element holding the component
     */
    static async getConfigForm(existingComponent, _entity) {
        const mainElt = $('<div></div>');
        mainElt.append(await renderTemplate(`systems/${game.system.id}/templates/_template/components/textArea.hbs`, {
            ...existingComponent,
            COMPONENT_SIZES,
            RICH_TEXT_AREA_STYLES
        }));
        return mainElt;
    }
    /**
     * Attaches event-listeners to the html of the config-form
     */
    static attachListenersToConfigForm(html) {
        const previousValue = html.find('#textAreaPreviousValue').val();
        console.log(previousValue);
        createProseMirrorEditor($(html).find('#textAreaValue')[0], String(previousValue ?? ''));
    }
    /**
     * Extracts configuration from submitted HTML form
     * @param html The submitted form
     * @returns The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(html) {
        const newValue = $(html).find('.editor textarea').length > 0
            ? $(html).find('.editor textarea').val()?.toString()
            : html.find('#textAreaValue').html();
        const fieldData = {
            ...super.extractConfig(html),
            label: html.find('#textAreaLabel').val()?.toString(),
            defaultValue: trimProseMirrorEmptyValue(newValue),
            style: html.find('#textAreaStyle').val()?.toString()
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
export default RichTextArea;
