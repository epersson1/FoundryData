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
export const exportTemplates = (event) => {
    Dialog.prompt({
        title: game.i18n.localize('CSB.Export.ExportDialog.Title'),
        content: `<h1>${game.i18n.localize('CSB.Export.ExportDialog.Subtitle')}</h1>` +
            '<div class="custom_system_export_divider">' +
            `<div id="custom_system_actor_export_list" class="custom_system_export_list"><h2>Actors :</h2><label><input type="checkbox" checked="checked" class="custom-system-full-selector" />${game.i18n.localize('SelectAll')}</label></div>` +
            `<div id="custom_system_item_export_list" class="custom_system_export_list"><h2>Items :</h2><label><input type="checkbox" checked="checked" class="custom-system-full-selector" />${game.i18n.localize('SelectAll')}</label></div>` +
            '</div>',
        label: game.i18n.localize('CSB.Export.ExportDialog.Action'),
        callback: (html) => {
            // Fetch every _template actor
            let actorTemplates = game.actors.filter((actor) => actor.isTemplate);
            let itemTemplates = game.items.filter((item) => item.isTemplate);
            let tplIds = html
                .find('input:checked')
                .get()
                .filter((elt) => elt.id)
                .map((elt) => {
                return elt.id;
            });
            // Cleanup data
            let exportActorTemplates = actorTemplates
                .filter((tpl) => {
                return tplIds.includes(tpl.id);
            })
                .map((tpl) => {
                tpl = JSON.parse(JSON.stringify(tpl));
                delete tpl.system.props;
                return {
                    id: tpl.id,
                    type: tpl.type,
                    name: tpl.name,
                    data: tpl.system,
                    flags: tpl.flags
                };
            });
            let exportItemTemplates = itemTemplates
                .filter((tpl) => {
                return tplIds.includes(tpl.id);
            })
                .map((tpl) => {
                tpl = JSON.parse(JSON.stringify(tpl));
                delete tpl.system.props;
                return {
                    id: tpl.id,
                    type: tpl.type,
                    name: tpl.name,
                    data: tpl.system,
                    flags: tpl.flags
                };
            });
            let exportTemplates = {
                isCustomSystemExport: true,
                actors: exportActorTemplates,
                items: exportItemTemplates
            };
            // Download data as JSON
            saveDataToFile(JSON.stringify(exportTemplates), CONST.TEXT_FILE_EXTENSIONS.json, 'export.json');
        },
        render: (html) => {
            let actorFolder = {
                name: 'Base',
                depth: 0,
                children: game.folders.filter((folder) => {
                    return folder.depth === 1 && folder.type === 'Actor';
                }),
                contents: game.actors.filter((actor) => {
                    return actor.isTemplate && actor.folder === null;
                })
            };
            let itemFolder = {
                name: 'Base',
                depth: 0,
                children: game.folders.filter((folder) => {
                    return folder.depth === 1 && folder.type === 'Item';
                }),
                contents: game.items.filter((item) => {
                    return item.isTemplate && item.folder === null;
                })
            };
            html.find('#custom_system_actor_export_list').append(getFolderStructure([actorFolder], $('<div></div>')));
            html.find('#custom_system_item_export_list').append(getFolderStructure([itemFolder], $('<div></div>')));
            html.find('.custom-system-full-selector').on('change', (ev) => {
                let target = $(ev.currentTarget);
                let newState = target.is(':checked');
                target.parents('.custom_system_export_list').find('input[type=checkbox]').prop('checked', newState);
            });
        },
        options: {
            width: 'auto',
            height: 'auto'
        }
    });
};
/**
 * @ignore
 */
const getFolderStructure = (folderArray) => {
    let folderList = $('<div></div>');
    for (let folder of folderArray) {
        if (!folder.name) {
            folder = folder.folder;
        }
        let className = '';
        if (folder.depth > 1) {
            className = 'custom_system_export_folder';
        }
        let baseFolderElt = $(`<div class="${className}"></div>`);
        let expandButton = $(`<i class="fas fa-caret-down"></i>`);
        let checkFolderButton = $(`<input type="checkbox" checked="checked" />`);
        let folderNameSpan = $('<span></span>');
        if (folder.depth > 0) {
            baseFolderElt.append(expandButton);
            baseFolderElt.append(checkFolderButton);
            folderNameSpan.append('<i class="fas fa-folder-open"></i>&nbsp;');
            folderNameSpan.append(folder.name);
            baseFolderElt.append(folderNameSpan);
        }
        let subFolderStructure = getFolderStructure(folder.children);
        let actorContainer = $(`<div></div>`);
        if (folder.depth > 0) {
            actorContainer.addClass('custom_system_export_folder');
        }
        for (let entity of folder.contents) {
            if (entity.isTemplate) {
                let baseActorElt = $(`<p><input type="checkbox" id="${entity.id}" checked="checked"  data-type="${entity.type}" /><label for="${entity.id}"><i class="fas fa-user"></i>&nbsp;${entity.name}</label></p>`);
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
export const importTemplates = (event) => {
    // Create File Picker to get export JSON
    let fp = new FilePicker({
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
                buttons: [
                    {
                        label: game.i18n.localize('Close'),
                        callback: () => {
                            window.location.reload();
                        }
                    }
                ]
            }).render(true);
        }
    });
    // Tweak to allow only json files to be uploaded / selected
    fp.extensions = ['.json'];
    fp.browse();
};
const importActorTemplate = async (importedPack) => {
    let actorTemplates = game.actors.filter((actor) => actor.isTemplate);
    for (let imported of importedPack) {
        // If a same name template exist, we replace its data with the imported data
        let matchingLocalTemplates = actorTemplates.filter((tpl) => tpl.name === imported.name && tpl.type === imported.type);
        if (matchingLocalTemplates.length > 0) {
            for (let match of matchingLocalTemplates) {
                match
                    .update({
                    system: {
                        hidden: imported.data.hidden,
                        header: imported.data.header,
                        tabs: imported.data.tabs,
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
    let itemTemplates = game.items.filter((item) => item.isTemplate);
    for (let imported of importedPack) {
        // If a same name template exist, we replace its data with the imported data
        let matchingLocalTemplates = itemTemplates.filter((tpl) => tpl.name === imported.name && tpl.type === imported.type);
        if (matchingLocalTemplates.length > 0) {
            for (let match of matchingLocalTemplates) {
                match
                    .update({
                    system: {
                        hidden: imported.data.hidden,
                        header: imported.data.header,
                        tabs: imported.data.tabs,
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
