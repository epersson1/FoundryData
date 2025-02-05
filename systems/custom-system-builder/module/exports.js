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
export const exportTemplates = () => {
    Dialog.prompt({
        title: game.i18n.localize('CSB.Export.ExportDialog.Title'),
        content: `<h1>${game.i18n.localize('CSB.Export.ExportDialog.Subtitle')}</h1>` +
            '<div class="custom_system_export_divider">' +
            `<div id="custom_system_actor_export_list" class="custom_system_export_list"><h2>Actors :</h2><label><input type="checkbox" checked="checked" class="custom-system-full-selector" />${game.i18n.localize('SelectAll')}</label></div>` +
            `<div id="custom_system_item_export_list" class="custom_system_export_list"><h2>Items :</h2><label><input type="checkbox" checked="checked" class="custom-system-full-selector" />${game.i18n.localize('SelectAll')}</label></div>` +
            '</div>',
        label: game.i18n.localize('CSB.Export.ExportDialog.Action'),
        callback: (html) => {
            if (html instanceof HTMLElement) {
                return;
            }
            // Fetch every _template actor
            const actorTemplates = game.actors.filter((actor) => actor.isTemplate);
            const itemTemplates = game.items.filter((item) => item.isTemplate);
            const tplIds = html
                .find('input:checked')
                .get()
                .filter((elt) => elt.id)
                .map((elt) => elt.id);
            // Cleanup data
            const exportActorTemplates = actorTemplates
                .filter((tpl) => tplIds.includes(tpl.id))
                .map((tpl) => {
                const json = JSON.parse(JSON.stringify(tpl));
                delete json.system.props;
                return {
                    id: json._id,
                    type: json.type,
                    name: json.name,
                    data: json.system,
                    flags: json.flags
                };
            });
            const exportItemTemplates = itemTemplates
                .filter((tpl) => tplIds.includes(tpl.id))
                .map((tpl) => {
                const json = JSON.parse(JSON.stringify(tpl));
                delete json.system.props;
                return {
                    id: json._id,
                    type: json.type,
                    name: json.name,
                    data: json.system,
                    flags: json.flags
                };
            });
            const exportTemplates = {
                isCustomSystemExport: true,
                actors: exportActorTemplates,
                items: exportItemTemplates
            };
            // Download data as JSON
            saveDataToFile(JSON.stringify(exportTemplates), CONST.TEXT_FILE_EXTENSIONS.json, 'export.json');
        },
        render: (html) => {
            if (html instanceof HTMLElement) {
                return;
            }
            const actorFolder = {
                name: 'Base',
                depth: 0,
                children: game.folders.filter((folder) => folder.depth === 1 && folder.type === 'Actor'),
                contents: game.actors.filter((actor) => actor.isTemplate && actor.folder === null),
                get folder() {
                    return null;
                }
            };
            const itemFolder = {
                name: 'Base',
                depth: 0,
                children: game.folders.filter((folder) => folder.depth === 1 && folder.type === 'Item'),
                contents: game.items.filter((item) => item.isTemplate && item.folder === null),
                get folder() {
                    return null;
                }
            };
            html.find('#custom_system_actor_export_list').append(getFolderStructure([actorFolder]));
            html.find('#custom_system_item_export_list').append(getFolderStructure([itemFolder]));
            html.find('.custom-system-full-selector').on('change', (ev) => {
                const target = $(ev.currentTarget);
                const newState = target.is(':checked');
                target.parents('.custom_system_export_list').find('input[type=checkbox]').prop('checked', newState);
            });
        },
        options: {
            height: 'auto'
        }
    });
};
/**
 * @ignore
 */
const getFolderStructure = (folderArray) => {
    const folderList = $('<div></div>');
    for (let folder of folderArray) {
        if (!folder.name) {
            folder = folder.folder;
        }
        let className = '';
        if (folder.depth ?? 0 > 1) {
            className = 'custom_system_export_folder';
        }
        const baseFolderElt = $(`<div class="${className}"></div>`);
        const expandButton = $(`<i class="fas fa-caret-down"></i>`);
        const checkFolderButton = $(`<input type="checkbox" checked="checked" />`);
        const folderNameSpan = $('<span></span>');
        if (folder.depth ?? 0 > 0) {
            baseFolderElt.append(expandButton);
            baseFolderElt.append(checkFolderButton);
            folderNameSpan.append('<i class="fas fa-folder-open"></i>&nbsp;');
            folderNameSpan.append(folder.name ?? '');
            baseFolderElt.append(folderNameSpan);
        }
        const subFolderStructure = getFolderStructure(folder.children);
        const actorContainer = $(`<div></div>`);
        if (folder.depth ?? 0 > 0) {
            actorContainer.addClass('custom_system_export_folder');
        }
        for (const entity of folder.contents) {
            if (entity.isTemplate) {
                const baseActorElt = $(`<p><input type="checkbox" id="${entity.id}" checked="checked"  data-type="${entity.type}" /><label for="${entity.id}"><i class="fas fa-user"></i>&nbsp;${entity.name}</label></p>`);
                actorContainer.append(baseActorElt);
            }
        }
        subFolderStructure.append(actorContainer);
        expandButton.on('click', () => {
            if (expandButton.hasClass('fa-caret-down')) {
                expandButton.removeClass('fa-caret-down');
                expandButton.addClass('fa-caret-right');
                subFolderStructure.slideUp();
            }
            else {
                expandButton.removeClass('fa-caret-right');
                expandButton.addClass('fa-caret-down');
                subFolderStructure.slideDown();
            }
        });
        folderNameSpan.on('click', () => {
            if (expandButton.hasClass('fa-caret-down')) {
                expandButton.removeClass('fa-caret-down');
                expandButton.addClass('fa-caret-right');
                subFolderStructure.slideUp();
            }
            else {
                expandButton.removeClass('fa-caret-right');
                expandButton.addClass('fa-caret-down');
                subFolderStructure.slideDown();
            }
        });
        checkFolderButton.on('change', () => {
            subFolderStructure.find('input').prop('checked', checkFolderButton.is(':checked')).trigger('change');
        });
        baseFolderElt.append(subFolderStructure);
        folderList.append(baseFolderElt);
    }
    return folderList;
};
/**
 * @ignore
 */
export const importTemplates = () => {
    // Create File Picker to get export JSON
    const fp = new FilePicker({
        callback: async (filePath) => {
            // Get file from server
            const response = await fetch(filePath);
            const importedPack = await response.json();
            // If imported pack is array, trigger only actor import (old format)
            if (Array.isArray(importedPack)) {
                await importActorTemplate(importedPack);
            }
            else if (importedPack.isCustomSystemExport) {
                await importItemTemplate(importedPack.items);
                await importActorTemplate(importedPack.actors);
            }
            new Dialog({
                title: game.i18n.localize('CSB.Export.ImportDialog.Title'),
                content: `<p>${game.i18n.localize('CSB.Export.ImportDialog.Content')}</p>`,
                buttons: {
                    one: {
                        label: game.i18n.localize('Close'),
                        callback: () => {
                            window.location.reload();
                        }
                    }
                }
            }).render(true);
        }
    });
    // Tweak to allow only json files to be uploaded / selected
    fp.extensions = ['.json'];
    fp.browse('');
};
const importActorTemplate = async (importedPack) => {
    const actorTemplates = game.actors.filter((actor) => actor.isTemplate);
    for (const imported of importedPack) {
        // If a same name template exist, we replace its data with the imported data
        const matchingLocalTemplates = actorTemplates.filter((tpl) => tpl.name === imported.name && tpl.type === imported.type);
        if (matchingLocalTemplates.length > 0) {
            for (const match of matchingLocalTemplates) {
                match
                    .update({
                    system: {
                        hidden: imported.data.hidden,
                        header: imported.data.header,
                        body: imported.data.body,
                        templateSystemUniqueVersion: imported.data.templateSystemUniqueVersion ?? (Math.random() * 0x100000000) >>> 0
                    },
                    flags: imported.flags
                })
                    .then(() => {
                    match.render(false);
                });
            }
        }
        else {
            // If no same name template exists, we create the template from imported data
            await Actor.create({
                _id: imported.id,
                name: imported.name,
                type: imported.type,
                system: {
                    ...imported.data,
                    templateSystemUniqueVersion: imported.data.templateSystemUniqueVersion ?? (Math.random() * 0x100000000) >>> 0
                },
                flags: imported.flags
            }, {
                keepId: true
            });
        }
    }
};
const importItemTemplate = async (importedPack) => {
    const itemTemplates = game.items.filter((item) => item.isTemplate);
    for (const imported of importedPack) {
        // If a same name template exist, we replace its data with the imported data
        const matchingLocalTemplates = itemTemplates.filter((tpl) => tpl.name === imported.name && tpl.type === imported.type);
        if (matchingLocalTemplates.length > 0) {
            for (const match of matchingLocalTemplates) {
                match
                    .update({
                    system: {
                        hidden: imported.data.hidden,
                        header: imported.data.header,
                        body: imported.data.body,
                        modifiers: imported.data.modifiers,
                        templateSystemUniqueVersion: imported.data.templateSystemUniqueVersion ?? (Math.random() * 0x100000000) >>> 0
                    },
                    flags: imported.flags
                })
                    .then(() => {
                    match.render(false);
                });
            }
        }
        else {
            // If no same name template exists, we create the template from imported data
            await Item.create({
                _id: imported.id,
                name: imported.name,
                type: imported.type,
                system: {
                    hidden: imported.data.hidden,
                    header: imported.data.header,
                    body: imported.data.body,
                    modifiers: imported.data.modifiers,
                    templateSystemUniqueVersion: imported.data.templateSystemUniqueVersion ?? (Math.random() * 0x100000000) >>> 0
                },
                flags: imported.flags
            }, {
                keepId: true
            });
        }
    }
};
