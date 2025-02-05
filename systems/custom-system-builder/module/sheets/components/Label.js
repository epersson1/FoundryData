/*
 * Copyright 2024 Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import InputComponent, { COMPONENT_SIZES } from './InputComponent.js';
import Logger from '../../Logger.js';
import { createProseMirrorEditor, trimProseMirrorEmptyValue } from '../../utils.js';
export const LABEL_STYLES = {
    label: 'CSB.ComponentProperties.Label.LabelStyle.Default',
    title: 'CSB.ComponentProperties.Label.LabelStyle.Title',
    subtitle: 'CSB.ComponentProperties.Label.LabelStyle.Subtitle',
    bold: 'CSB.ComponentProperties.Label.LabelStyle.Boldtext',
    button: 'CSB.ComponentProperties.Label.LabelStyle.Button'
};
/**
 * Label component
 * @ignore
 */
class Label extends InputComponent {
    /**
     * Label constructor
     */
    constructor(props) {
        super(props);
        this._icon = props.icon;
        this._value = props.value;
        this._prefix = props.prefix;
        this._suffix = props.suffix;
        this._rollMessage = props.rollMessage;
        this._altRollMessage = props.altRollMessage;
        this._rollMessageToChat = props.rollMessageToChat;
        this._altRollMessageToChat = props.altRollMessageToChat;
        this._style = props.style;
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
        const { customProps = {}, linkedEntity, reference } = options;
        const formulaProps = foundry.utils.mergeObject(entity.system?.props ?? {}, customProps, { inplace: false });
        let jQElement;
        switch (this._style) {
            case 'title':
                jQElement = $('<h3></h3>');
                break;
            case 'subtitle':
                jQElement = $('<h4></h4>');
                break;
            case 'bold':
                jQElement = $('<b></b>');
                break;
            case 'button':
                jQElement = $('<button></button>');
                jQElement.attr('type', 'button');
                break;
            case 'label':
            default:
                jQElement = $('<span></span>');
                break;
        }
        let content = '';
        let labelValue = '';
        if (entity.isTemplate) {
            if (this._prefix) {
                content += this._prefix;
            }
            content += this._value === '' ? '&#9744;' : this._value;
            if (this._suffix) {
                content += this._suffix;
            }
        }
        else {
            if (this._prefix) {
                try {
                    content +=
                        (await ComputablePhrase.computeMessage(this._prefix, formulaProps, {
                            source: `${this.key}.prefix`,
                            reference,
                            defaultValue: '',
                            triggerEntity: entity,
                            linkedEntity
                        })).result ?? game.i18n.localize('CSB.Formula.PREFIXERROR');
                }
                catch (err) {
                    Logger.error(err.message, err);
                    content += game.i18n.localize('CSB.Formula.PREFIXERROR');
                }
            }
            // If Label has a key, it was computed with the derivedData of the entity, no need to recompute it
            if (this.key &&
                foundry.utils.getProperty(formulaProps, this.key) !== null &&
                foundry.utils.getProperty(formulaProps, this.key) !== undefined) {
                labelValue =
                    foundry.utils.getProperty(formulaProps, this.key) ?? game.i18n.localize('CSB.Formula.ERROR');
                Logger.debug('Using precomputed value for ' + this.key + ' : ' + labelValue);
            }
            else {
                try {
                    labelValue =
                        (await ComputablePhrase.computeMessage(this._value ?? '', formulaProps, {
                            source: `${this.key}`,
                            reference,
                            defaultValue: '',
                            triggerEntity: entity,
                            linkedEntity
                        })).result ?? game.i18n.localize('CSB.Formula.ERROR');
                }
                catch (err) {
                    Logger.error(err.message, err);
                    labelValue = game.i18n.localize('CSB.Formula.ERROR');
                }
            }
            content += labelValue;
            if (this._suffix) {
                try {
                    content +=
                        (await ComputablePhrase.computeMessage(this._suffix, formulaProps, {
                            source: `${this.key}.suffix`,
                            reference,
                            defaultValue: '',
                            triggerEntity: entity,
                            linkedEntity
                        })).result ?? game.i18n.localize('CSB.Formula.SUFFIXERROR');
                }
                catch (err) {
                    Logger.error(err.message, err);
                    content += game.i18n.localize('CSB.Formula.SUFFIXERROR');
                }
            }
        }
        const baseElement = await super._getElement(entity, isEditable, options);
        jQElement.addClass('custom-system-label-root');
        const iconDiv = $('<div></div>');
        iconDiv.addClass('custom-system-label-icons');
        if (this._icon) {
            const iconElement = $('<i></i>');
            iconElement.addClass('custom-system-roll-icon fas fa-' + this._icon);
            iconDiv.append(iconElement);
        }
        jQElement.append(iconDiv);
        const contentDiv = $('<div></div>');
        contentDiv.addClass('custom-system-label');
        if (this._style) {
            contentDiv.addClass('custom-system-label-' + this._style);
        }
        contentDiv.append(content);
        contentDiv.attr('data-value', labelValue);
        contentDiv.attr('data-name', this.key ?? '');
        jQElement.append(contentDiv);
        if (isEditable && this._rollMessage) {
            const rollElement = $('<a></a>');
            rollElement.addClass('custom-system-rollable');
            rollElement.append(jQElement);
            const rollIcon = game.settings.get(game.system.id, 'rollIcon');
            if (rollIcon) {
                const rollIconElement = $('<i></i>');
                rollIconElement.addClass('custom-system-roll-icon fas fa-' + rollIcon);
                iconDiv.prepend(rollIconElement);
            }
            if (!entity.isTemplate) {
                rollElement.on('click', async (ev) => {
                    let rollMessage, postMessage, source;
                    if (ev.shiftKey) {
                        rollMessage = this._altRollMessage;
                        postMessage = this._altRollMessageToChat;
                        source = 'alternativeLabelRollMessage';
                    }
                    else {
                        rollMessage = this._rollMessage;
                        postMessage = this._rollMessageToChat;
                        source = 'labelRollMessage';
                    }
                    if (rollMessage) {
                        this._generateChatFunction(rollMessage, entity, {
                            source: `${this.key}.${source}`,
                            reference,
                            customProps: options.customProps,
                            linkedEntity
                        })(postMessage);
                    }
                });
                if (this.key) {
                    rollElement.on('contextmenu', (ev) => {
                        const contextMenuElement = $('<nav></nav>');
                        contextMenuElement.attr('id', `context-menu`);
                        contextMenuElement.addClass('custom-system-roll-context');
                        const contextActionList = $('<ol></ol>');
                        contextActionList.addClass('context-items');
                        const contextActions = this.getContextMenu(entity, linkedEntity, contextMenuElement);
                        if (this._altRollMessage) {
                            contextActions.push(...this.getContextMenu(entity, linkedEntity, contextMenuElement, true));
                        }
                        for (const action of contextActions) {
                            const actionBullet = $('<li></li>');
                            actionBullet.addClass('context-item');
                            actionBullet.html(action.icon + action.name);
                            actionBullet.on('click', action.callback);
                            contextActionList.append(actionBullet);
                        }
                        contextMenuElement.append(contextActionList);
                        $('body').append(contextMenuElement);
                        // Set the position
                        const locationX = ev.pageX;
                        const locationY = ev.pageY;
                        contextMenuElement.css('left', `${Math.min(locationX, window.innerWidth - ((contextMenuElement.width() ?? 0) + 3))}px`);
                        contextMenuElement.css('top', `${Math.min(locationY + 3, window.innerHeight - ((contextMenuElement.height() ?? 0) + 3))}px`);
                        $('body').one('mousedown', (ev) => {
                            if (contextMenuElement.has($(ev.target)[0]).length === 0) {
                                contextMenuElement.slideUp(200, () => {
                                    contextMenuElement.remove();
                                });
                            }
                        });
                    });
                    rollElement.attr('draggable', 'true');
                    rollElement.on('dragstart', (ev) => {
                        const rollCode = this.getRollCode(entity, linkedEntity?.id ?? undefined);
                        if (!rollCode) {
                            return;
                        }
                        let chatCommand = '/sheetRoll ' + rollCode;
                        let macroPrefix = '';
                        if (ev.shiftKey && this._altRollMessage) {
                            chatCommand = '/sheetAltRoll ' + rollCode;
                            macroPrefix = '[ALT] ';
                        }
                        if (ev.originalEvent) {
                            if (ev.originalEvent.dataTransfer) {
                                const macroData = {
                                    name: `${macroPrefix}${this.key}`,
                                    type: CONST.MACRO_TYPES.CHAT,
                                    author: game.user.id,
                                    command: chatCommand,
                                    folder: null
                                };
                                if (linkedEntity) {
                                    macroData.name = `${macroPrefix}${linkedEntity.name ?? this.key}`;
                                    macroData.img = linkedEntity.img;
                                }
                                ev.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({
                                    type: 'Macro',
                                    data: macroData
                                }));
                            }
                        }
                    });
                }
            }
            jQElement = rollElement;
        }
        if (entity.isTemplate) {
            jQElement.addClass('custom-system-editable-component');
            jQElement.on('click', () => {
                this.editComponent(entity);
            });
        }
        baseElement.append(jQElement);
        return baseElement;
    }
    getContextMenu(entity, linkedEntity, contextMenuElement, isAlternative = false) {
        return [
            {
                name: game.i18n.localize(`CSB.ComponentProperties.Label.Actions.Add${isAlternative ? 'Alt' : ''}AsMacro`),
                icon: '<i class="fas fa-scroll"></i>',
                callback: async () => {
                    const rollCode = this.getRollCode(entity, linkedEntity?.id ?? undefined);
                    if (!rollCode) {
                        return;
                    }
                    const chatCommand = `/sheet${isAlternative ? 'Alt' : ''}Roll ` + rollCode;
                    new Dialog({
                        title: game.i18n.localize('CSB.ComponentProperties.Label.AddMacroDialog.Title'),
                        content: await renderTemplate(`systems/${game.system.id}/templates/_template/dialogs/addLabelMacro.hbs`, {}),
                        buttons: {
                            save: {
                                label: game.i18n.localize('Save'),
                                callback: (html) => {
                                    const macroName = $(html).find('#macroName').val()?.toString() ?? '';
                                    if (macroName === '') {
                                        throw new Error(game.i18n.localize('CSB.ComponentProperties.Label.AddMacroDialog.MacroNameError'));
                                    }
                                    const pageNumber = parseInt($(html).find('#macroPage').val()?.toString() ?? '0') - 1;
                                    let slotNumber = parseInt($(html).find('#macroSlot').val()?.toString() ?? '-1');
                                    if (pageNumber < 0 || pageNumber > 4) {
                                        throw new Error(game.i18n.localize('CSB.ComponentProperties.Label.AddMacroDialog.MacroPageError'));
                                    }
                                    if (slotNumber < 0 || slotNumber > 9) {
                                        throw new Error(game.i18n.localize('CSB.ComponentProperties.Label.AddMacroDialog.MacroSlotError'));
                                    }
                                    if (slotNumber === 0) {
                                        slotNumber = 10;
                                    }
                                    const finalSlotNumber = String(pageNumber * 10 + slotNumber);
                                    Macro.create({
                                        name: macroName,
                                        type: CONST.MACRO_TYPES.CHAT,
                                        author: game.user.id,
                                        command: chatCommand,
                                        folder: null
                                    }).then((newMacro) => {
                                        game.user.assignHotbarMacro(newMacro, parseInt(finalSlotNumber));
                                        newMacro.sheet.render(true);
                                    });
                                }
                            },
                            cancel: {
                                label: game.i18n.localize('Cancel'),
                                callback: () => { }
                            }
                        }
                    }, {
                        width: undefined
                    }).render(true);
                    contextMenuElement.slideUp(200, () => {
                        contextMenuElement.remove();
                    });
                }
            },
            {
                name: game.i18n.localize(`CSB.ComponentProperties.Label.Actions.Copy${isAlternative ? 'Alt' : ''}ChatCommand`),
                icon: '<i class="fas fa-comment"></i>',
                callback: () => {
                    const rollCode = this.getRollCode(entity, linkedEntity?.id ?? undefined);
                    if (!rollCode) {
                        return;
                    }
                    const chatCommand = `/sheet${isAlternative ? 'Alt' : ''}Roll ` + rollCode;
                    navigator.clipboard
                        .writeText(chatCommand)
                        .then(() => {
                        ui.notifications.info(game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyChatCommandSuccess'));
                    })
                        .catch(() => {
                        Dialog.prompt({
                            title: game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyChatCommand'),
                            content: `<p>${game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyChatCommandFailure')}</p><input type="text" value="${chatCommand}" />`,
                            label: game.i18n.localize('Close'),
                            render: (html) => {
                                const input = $(html).find('input');
                                input.on('click', () => {
                                    input.trigger('select');
                                });
                                input.trigger('click');
                            },
                            callback: () => { },
                            options: {
                                width: undefined
                            }
                        });
                    });
                    contextMenuElement.slideUp(200, () => {
                        contextMenuElement.remove();
                    });
                }
            },
            {
                name: game.i18n.localize(`CSB.ComponentProperties.Label.Actions.Copy${isAlternative ? 'Alt' : ''}MacroScript`),
                icon: '<i class="fas fa-cogs"></i>',
                callback: () => {
                    Logger.log('Copying script for ' + this.key);
                    const rollCode = this.getRollCode(entity, linkedEntity?.id ?? undefined);
                    if (!rollCode) {
                        return;
                    }
                    const chatCommand = 'let rollMessage = await actor.roll(\n' +
                        "    '" +
                        rollCode +
                        "',\n" +
                        `    { postMessage: false${isAlternative ? ', alternative: true' : ''}}\n` +
                        ');\n\n' +
                        'let speakerData = ChatMessage.getSpeaker({\n' +
                        '    actor: actor,\n' +
                        '    token: actor.getActiveTokens()?.[0]?.document,\n' +
                        '    scene: game.scenes.current\n' +
                        '});\n\n' +
                        'rollMessage.postMessage({speaker: speakerData});';
                    navigator.clipboard
                        .writeText(chatCommand)
                        .then(() => {
                        ui.notifications.info(game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyMacroScriptSuccess'));
                    })
                        .catch(() => {
                        Dialog.prompt({
                            title: game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyMacroScript'),
                            content: `<p>${game.i18n.localize('CSB.ComponentProperties.Label.Actions.CopyMacroScriptFailure')}</p><input type="text" value="${chatCommand}" />`,
                            label: game.i18n.localize('Close'),
                            render: (html) => {
                                const input = $(html).find('input');
                                input.on('click', () => {
                                    input.trigger('select');
                                });
                                input.trigger('click');
                            },
                            callback: () => { },
                            options: {
                                width: undefined
                            }
                        });
                    });
                    contextMenuElement.slideUp(200, () => {
                        contextMenuElement.remove();
                    });
                }
            }
        ];
    }
    getRollCode(entity, itemId) {
        let rollCode = this.key;
        if (this.key?.includes('.') && itemId) {
            const [dynamicTable, _rowNum, targetRoll] = this.key.split('.');
            rollCode = dynamicTable + `(@rowId=${itemId})` + '.' + targetRoll;
        }
        else if (this.key?.includes('.')) {
            const [dynamicTable, rowNum, targetRoll] = this.key.split('.');
            const propRowData = foundry.utils.getProperty(entity.system.props, dynamicTable + '.' + rowNum);
            let rowFilter = null;
            for (const prop in propRowData) {
                if (typeof propRowData[prop] === 'string' && propRowData[prop].length > 0) {
                    rowFilter = `(${prop}=${propRowData[prop]})`;
                    break;
                }
            }
            if (rowFilter) {
                rollCode = dynamicTable + rowFilter + '.' + targetRoll;
            }
            else {
                ui.notifications.error(game.i18n.localize('CSB.UserMessages.Label.ChatCommandeCreationError'));
                rollCode = undefined;
            }
        }
        return rollCode;
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
    getSendToChatFunctions(entity, options = {}) {
        if (!this.key) {
            return undefined;
        }
        const res = {};
        if (this._rollMessage) {
            res.main = this._generateChatFunction(this._rollMessage, entity, options);
        }
        if (this._altRollMessage) {
            res.alternative = this._generateChatFunction(this._altRollMessage, entity, options);
        }
        if (Object.keys(res).length === 0) {
            return undefined;
        }
        return {
            [this.key]: res
        };
    }
    _generateChatFunction(rollMessage, entity, options = {}) {
        return async (postMessage = true, overrideOptions = {}) => {
            const phrase = new ComputablePhrase(rollMessage);
            await phrase.compute({
                ...entity.system.props,
                ...options.customProps
            }, {
                ...options,
                ...overrideOptions,
                computeExplanation: true,
                triggerEntity: entity
            });
            if (postMessage) {
                let speakerEntity;
                switch (entity.entityType) {
                    case 'actor':
                        speakerEntity = entity.entity;
                        break;
                    case 'item':
                        speakerEntity = entity.entity.parent;
                        break;
                    default:
                        speakerEntity = null;
                }
                const speakerData = ChatMessage.getSpeaker({
                    actor: speakerEntity,
                    token: speakerEntity?.getActiveTokens()?.[0]?.document ?? null,
                    scene: game.scenes.current
                });
                phrase.postMessage({
                    //@ts-expect-error FoundryV12
                    style: CONST.CHAT_MESSAGE_STYLES.IC,
                    speaker: speakerData
                });
            }
            return phrase;
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
            icon: this._icon,
            value: this._value ?? '',
            prefix: this._prefix ?? '',
            suffix: this._suffix ?? '',
            rollMessage: this._rollMessage,
            altRollMessage: this._altRollMessage,
            rollMessageToChat: this._rollMessageToChat,
            altRollMessageToChat: this._altRollMessageToChat,
            style: this._style
        };
    }
    /**
     * Creates label from JSON description
     * @override
     */
    static fromJSON(json, templateAddress, parent) {
        return new Label({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            icon: json.icon,
            value: json.value,
            prefix: json.prefix,
            suffix: json.suffix,
            rollMessage: json.rollMessage,
            altRollMessage: json.altRollMessage,
            rollMessageToChat: json.rollMessageToChat,
            altRollMessageToChat: json.altRollMessageToChat,
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
        return 'label';
    }
    /**
     * Gets pretty name for this component's type
     * @return The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.Label');
    }
    /**
     * Get configuration form for component creation / edition
     * @return The jQuery element holding the component
     */
    static async getConfigForm(existingComponent, _entity) {
        const mainElt = $('<div></div>');
        const predefinedValuesComponent = { ...existingComponent };
        if (predefinedValuesComponent.rollMessageToChat === undefined) {
            predefinedValuesComponent.rollMessageToChat = true;
        }
        if (predefinedValuesComponent.altRollMessageToChat === undefined) {
            predefinedValuesComponent.altRollMessageToChat = true;
        }
        mainElt.append(await renderTemplate(`systems/${game.system.id}/templates/_template/components/label.hbs`, {
            ...predefinedValuesComponent,
            COMPONENT_SIZES,
            LABEL_STYLES
        }));
        return mainElt;
    }
    /**
     * Attaches event-listeners to the html of the config-form
     * @param html
     */
    static attachListenersToConfigForm(html) {
        const openEditors = new Map();
        $(html)
            .find("input[name='editorToggle']")
            .on('click', async (event) => {
            const checkbox = $(event.currentTarget);
            const checkboxId = checkbox[0].id;
            const rtaSelectors = Label.configRichTextAreaSelectors.get(checkboxId);
            if (!rtaSelectors) {
                throw new Error(`Failed to map Checkbox-ID to an RTA. Unexpected Element-ID "${checkboxId}"`);
            }
            const rawTextArea = html.find(rtaSelectors.textarea);
            const editorDiv = html.find(rtaSelectors.editor);
            const existingEditor = openEditors.get(checkboxId);
            if (checkbox.is(':checked')) {
                const textAreaValue = rawTextArea.val()?.toString();
                if (!existingEditor) {
                    const newEditor = await createProseMirrorEditor(editorDiv.find('.editor-content')[0], textAreaValue ?? '');
                    openEditors.set(checkboxId, newEditor);
                }
                editorDiv.find('.editor-content').html(textAreaValue ?? '');
                editorDiv.show();
                rawTextArea.hide();
            }
            else {
                const editorValue = editorDiv.find('textarea').length > 0
                    ? editorDiv.find('textarea').val()?.toString()
                    : editorDiv.find('.editor-content').html();
                rawTextArea.val(editorValue ?? '');
                rawTextArea.show();
                editorDiv.hide();
            }
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
        // Resync editors to textareas
        $(html)
            .find("input[name='editorToggle']")
            .each((_idx, checkbox) => {
            const checkboxId = checkbox.id;
            const rtaSelectors = Label.configRichTextAreaSelectors.get(checkboxId);
            if (!rtaSelectors) {
                throw new Error(`Failed to map Checkbox-ID to an RTA. Unexpected Element-ID "${checkboxId}"`);
            }
            if ($(checkbox).is(':checked')) {
                const rawTextArea = html.find(rtaSelectors.textarea);
                const editorDiv = html.find(rtaSelectors.editor);
                const editorValue = editorDiv.find('textarea').length > 0
                    ? editorDiv.find('textarea').val()?.toString()
                    : editorDiv.find('.editor-content').html();
                rawTextArea.val(trimProseMirrorEmptyValue(editorValue));
            }
        });
        return {
            ...super.extractConfig(html),
            type: 'label',
            style: html.find('#labelStyle').val()?.toString() ?? 'label',
            size: html.find('#labelSize').val()?.toString() ?? 'full-size',
            value: html.find('#labelText').val()?.toString() ?? '',
            prefix: html.find('#labelPrefix').val()?.toString() ?? '',
            suffix: html.find('#labelSuffix').val()?.toString() ?? '',
            icon: html.find('#labelIcon').val()?.toString() ?? '',
            rollMessage: html.find('#labelRollMessage').val()?.toString() ?? '',
            altRollMessage: html.find('#labelAltRollMessage').val()?.toString() ?? '',
            rollMessageToChat: html.find('#labelRollMessageToChat').is(':checked'),
            altRollMessageToChat: html.find('#labelAltRollMessageToChat').is(':checked')
        };
    }
}
Label.valueType = 'none';
Label.configRichTextAreaSelectors = new Map([
    ['labelRichText', { textarea: 'textarea#labelText', editor: 'div#labelTextEditor' }],
    ['rollRichText', { textarea: 'textarea#labelRollMessage', editor: 'div#labelRollMessageEditor' }],
    ['altRollRichText', { textarea: 'textarea#labelAltRollMessage', editor: 'div#labelAltRollMessageEditor' }]
]);
/**
 * @ignore
 */
export default Label;
