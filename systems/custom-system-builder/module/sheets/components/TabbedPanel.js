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
import Container from './Container.js';
import Tab from './Tab.js';
import templateFunctions from '../template-functions.js';
/**
 * Tabbed Panel component
 * @ignore
 */
class TabbedPanel extends Container {
    constructor(props) {
        super(props);
        this._contents = props.contents;
    }
    get contents() {
        return this._contents;
    }
    /**
     * Renders component
     * @override
     * @param {TemplateSystem} entity Rendered entity (actor or item)
     * @param {boolean} [isEditable=true] Is the component editable by the current user?
     * @param {ComponentRenderOptions} [options={}]
     * @return {Promise<JQuery>} The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        let activeKey = null;
        const renderableTabs = this.contents.filter((tab) => tab.canBeRendered(entity));
        try {
            activeKey = String(game.user.getFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.activeTab'));
        }
        catch (_e) {
            // Do nothing on error
            null;
        }
        if (renderableTabs.filter((tab) => tab.key === activeKey).length === 0) {
            activeKey = renderableTabs?.[0]?.key;
        }
        // Generating content
        const tabSection = $('<section></section>');
        const tabsContent = {};
        // Generating nav
        const tabNav = $('<nav></nav>');
        const tabsLink = {};
        tabNav.addClass('sheet-tabs tabs');
        for (const tab of renderableTabs) {
            tabsContent[tab.key] = await tab.render(entity, isEditable, options);
            tabSection.append(tabsContent[tab.key]);
            const tabSpan = $('<span></span>');
            if (tab.tooltip) {
                tabSpan.attr('title', tab.tooltip);
            }
            const tabLink = $('<a></a>');
            tabLink.addClass('item');
            tabLink.addClass(tab.key);
            tabLink.text(tab.name);
            tabLink.on('click', () => {
                tabsContent[activeKey].removeClass('active');
                tabsContent[tab.key].addClass('active');
                tabsLink[activeKey].removeClass('active');
                tabLink.addClass('active');
                game.user.setFlag(game.system.id, entity.uuid + '.' + this.templateAddress + '.activeTab', tab.key);
                activeKey = tab.key;
            });
            tabsLink[tab.key] = tabLink;
            if (entity.isTemplate) {
                const sortLeftTabButton = $('<a><i class="fas fa-caret-left custom-system-clickable"></i></a>');
                sortLeftTabButton.addClass('item custom-system-sort-left');
                sortLeftTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.TabbedPanel.SortTabToLeft'));
                sortLeftTabButton.on('click', () => {
                    tab.sortBeforeInParent(entity);
                });
                tabSpan.append(sortLeftTabButton);
            }
            tabSpan.append(tabLink);
            if (entity.isTemplate) {
                const sortRightTabButton = $('<a><i class="fas fa-caret-right custom-system-clickable"></i></a>');
                sortRightTabButton.addClass('item custom-system-sort-right');
                sortRightTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.TabbedPanel.SortTabToRight'));
                sortRightTabButton.on('click', () => {
                    tab.sortAfterInParent(entity);
                });
                tabSpan.append(sortRightTabButton);
            }
            tabNav.append(tabSpan);
        }
        if (entity.isTemplate) {
            const controlSpan = $('<span></span>');
            const addTabButton = $('<a><i class="fas fa-plus-circle custom-system-clickable"></i></a>');
            addTabButton.addClass('item');
            addTabButton.addClass('custom-system-builder-add-tab');
            addTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.TabbedPanel.AddTab'));
            addTabButton.on('click', () => {
                // Create dialog for tab edition
                templateFunctions.editTab(({ name, key, role = CONST.USER_ROLES.NONE, permission = CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE, visibilityFormula = '', tooltip = '' }) => {
                    // This is called on dialog validation
                    // Checking for duplicate keys
                    const existingTab = this.contents.filter((tab) => tab.key === key);
                    if (existingTab.length > 0) {
                        ui.notifications.error(game.i18n.format('CSB.UserMessages.TabbedPanel.DuplicateTabKey', { KEY: key }));
                    }
                    else {
                        // Adding the new tab to the template
                        this.contents.push(Tab.fromJSON({
                            name: name,
                            key: key,
                            cssClass: '',
                            role: role,
                            permission: permission,
                            visibilityFormula: visibilityFormula,
                            tooltip: tooltip,
                            type: 'tabbedPanel',
                            contents: []
                        }, this.templateAddress + '-contents-' + this.contents.length, this));
                        this.save(entity);
                    }
                });
            });
            const editTabButton = $('<a><i class="fas fa-edit custom-system-clickable"></i></a>');
            editTabButton.addClass('item');
            editTabButton.addClass('custom-system-builder-edit-tab');
            editTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.TabbedPanel.EditTab'));
            editTabButton.on('click', () => {
                const tab = this.contents.filter((tab) => tab.key === activeKey)[0];
                // Create dialog for tab edition
                templateFunctions.editTab(({ name, key, role = CONST.USER_ROLES.NONE, permission = CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE, visibilityFormula = '', tooltip = '' }) => {
                    // This is called on dialog validation
                    // Checking for duplicate keys
                    const existingTab = this.contents.filter((tab) => tab.key === key);
                    if (existingTab.length > 0 && key !== activeKey) {
                        game.i18n.format('CSB.UserMessages.TabbedPanel.DuplicateTabKeEdit', { KEY: key });
                    }
                    else {
                        // Updating tab data
                        tab.update(entity, {
                            name: name,
                            tooltip: tooltip,
                            key: key,
                            role: role,
                            permission: permission,
                            visibilityFormula: visibilityFormula
                        });
                    }
                }, tab.toJSON());
            });
            const deleteTabButton = $('<a><i class="fas fa-trash custom-system-clickable"></i></a>');
            deleteTabButton.addClass('item');
            deleteTabButton.addClass('custom-system-builder-delete-tab');
            deleteTabButton.attr('title', game.i18n.localize('CSB.ComponentProperties.TabbedPanel.DeleteTab'));
            deleteTabButton.on('click', () => {
                this.contents.filter((tab) => tab.key === activeKey)[0].delete(entity);
            });
            controlSpan.append(addTabButton);
            controlSpan.append(editTabButton);
            controlSpan.append(deleteTabButton);
            tabNav.append(controlSpan);
        }
        const jQElement = await super._getElement(entity, isEditable, options);
        const internalContents = jQElement.hasClass('custom-system-component-contents')
            ? jQElement
            : jQElement.find('.custom-system-component-contents');
        internalContents.append(tabNav);
        internalContents.append(tabSection);
        if (activeKey) {
            tabsContent[activeKey].addClass('active');
            tabsLink[activeKey].addClass('active');
        }
        return jQElement;
    }
    /**
     * Creates Tabbed Panel from JSON description
     * @override
     * @param {ContainerJson} json
     * @param {string} templateAddress
     * @param {Container|null} parent
     * @return {TabbedPanel}
     */
    static fromJSON(json, templateAddress, parent) {
        const tabbedPanel = new TabbedPanel({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            contents: [],
            cssClass: json.cssClass,
            role: json.role,
            permission: json.permission,
            visibilityFormula: json.visibilityFormula,
            parent: parent
        });
        tabbedPanel._contents =
            json?.contents?.map((tab, index) => Tab.fromJSON(tab, templateAddress + '-contents-' + index, tabbedPanel)) ?? [];
        return tabbedPanel;
    }
    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName() {
        return 'tabbedPanel';
    }
    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.TabbedPanel');
    }
    /** Get configuration form for component creation / edition */
    static async getConfigForm(existingComponent) {
        const mainElt = $('<div></div>');
        mainElt.append(await renderTemplate(`systems/${game.system.id}/templates/_template/components/tabbed-panel.hbs`, existingComponent));
        return mainElt;
    }
    /**
     * Extracts configuration from submitted HTML form
     * @override
     * @param html The submitted form
     * @returns The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(html) {
        return super.extractConfig(html);
    }
}
/**
 * Can container accept dropped components ?
 */
TabbedPanel.droppable = false;
/**
 * @ignore
 */
export default TabbedPanel;
