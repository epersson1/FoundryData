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
        const jQElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-text-area');
        jQElement.addClass('custom-system-rich-editor' + (this._style !== 'sheet' ? '-dialog' : ''));
        if (!entity.isTemplate) {
            const contents = (foundry.utils.getProperty(entity.system.props, this.key) || this.defaultValue) ?? '';
            const enrichedContents = await TextEditor.enrichHTML(contents, {
                secrets: isEditable,
                rollData: entity.getRollData()
            });
            const editButton = $('<a></a>');
            editButton.addClass('custom-system-rich-editor-button');
            editButton.html('<i class="fas fa-edit"></i>');
            editButton.on('click', () => {
                const content = `<textarea id='custom-system-rich-text-editor-${this
                    .key}' class='custom-system-rich-text-editor'>${contents}</textarea><input type="hidden" class="closingAction" value="save" />`;
                // Dialog creation
                const d = new Dialog({
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
                    render: () => {
                        //Pre-emptively remove editors to guarantee init
                        tinymce.remove('textarea.custom-system-rich-text-editor');
                        tinymce.init({
                            ...CONFIG.TinyMCE,
                            selector: 'textarea.custom-system-rich-text-editor',
                            paste_block_drop: true,
                            save_onsavecallback: () => {
                                $(`#custom-system-rich-text-editor-${this.key.replace(/\./g, '\\.')}`)
                                    .parents('.dialog')
                                    .find('.dialog-button.validate')
                                    .trigger('click');
                            },
                            init_instance_callback: function (editor) {
                                editor.on('drop', async function (e) {
                                    e.preventDefault();
                                    editor.insertContent(
                                    //@ts-expect-error Outdated types
                                    String(await TextEditor.getContentLink(TextEditor.getDragEventData(e))));
                                });
                            }
                        });
                    },
                    close: (html) => {
                        const action = $(html).find('.closingAction').val();
                        if (action === 'save') {
                            foundry.utils.setProperty(entity.system.props, this.key, tinymce.get(`custom-system-rich-text-editor-${this.key}`).getContent());
                            entity.entity.update({
                                system: {
                                    props: entity.system.props
                                }
                            });
                        }
                    }
                }, {
                    width: 500,
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
                        HandlebarsHelpers.editor(enrichedContents, {
                            hash: {
                                target: 'system.props.' + this.key,
                                button: true,
                                editable: isEditable
                            }
                        }).toHTML());
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
    static attachListenersToConfigForm() {
        const textAreaSelector = 'textarea#textAreaValue';
        tinymce.remove(textAreaSelector);
        tinymce.init({
            ...CONFIG.TinyMCE,
            selector: textAreaSelector
        });
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
            label: html.find('#textAreaLabel').val()?.toString(),
            defaultValue: html.find('#textAreaValue').val()?.toString(),
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
