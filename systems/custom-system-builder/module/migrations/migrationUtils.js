/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import Logger from '../Logger.js';
export function beginMigration(version) {
    return ui.notifications.info(`CSB: Migration to Version ${version} started`, { progress: true });
}
export function logProgress(document, version, current, total, notification) {
    Logger.log('Processing migration ' + version + ' for ' + document.name + ' - ' + document.id);
    notification.update({
        message: `CSB: Migration to Version ${version}. Updating ${document.constructor.name} ${current + 1} / ${total}`,
        pct: current / total
    });
}
export function finishMigration(version, notification) {
    notification.update({
        message: `CSB: Migration to Version ${version} finished`,
        pct: 1
    });
}
export function getActorsToMigrate(versionNumber) {
    return game.actors.filter((actor) => foundry.utils.isNewerVersion(versionNumber, actor.getFlag(game.system.id, 'version')));
}
export function getItemsToMigrate(versionNumber) {
    return game.items.filter((item) => foundry.utils.isNewerVersion(versionNumber, item.getFlag(game.system.id, 'version')));
}
export async function updateDocuments(documents, versionNumber, callback, notification) {
    for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        logProgress(document, versionNumber, i, documents.length, notification);
        const diff = callback(document);
        await document.update(diff);
        // @ts-expect-error setFlag is not compatible between actor & item
        await document.setFlag(game.system.id, 'version', versionNumber);
    }
}
export async function reloadTemplatesInEmbeddedItems(actors, versionNumber, notification) {
    const items = actors.flatMap((actor) => Array.from(actor.items));
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        logProgress(item, versionNumber, i, items.length, notification);
        try {
            await item.templateSystem.reloadTemplate();
        }
        catch (err) {
            Logger.error(err.message, err);
        }
        await item.setFlag(game.system.id, 'version', versionNumber);
    }
}
export async function reloadTemplatesInDocuments(documents, versionNumber, notification) {
    for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        logProgress(document, versionNumber, i, documents.length, notification);
        try {
            await document.templateSystem.reloadTemplate();
        }
        catch (err) {
            Logger.error(err.message, err);
        }
        // @ts-expect-error setFlag is not compatible between actor & item
        await document.setFlag(game.system.id, 'version', versionNumber);
    }
}
export function updateComponents(component, predicate, callback) {
    if (predicate(component)) {
        component = callback(component);
    }
    if (component?.contents) {
        const container = component;
        container.contents = (container.contents ?? []).map((subComp) => {
            if (Array.isArray(subComp)) {
                const tableContents = subComp.map((subSubComp) => {
                    if (subSubComp) {
                        return updateComponents(subSubComp, predicate, callback);
                    }
                });
                return tableContents;
            }
            else {
                return updateComponents(subComp, predicate, callback);
            }
        });
    }
    if (component?.rowLayout) {
        const extensibleTable = component;
        extensibleTable.rowLayout = extensibleTable.rowLayout?.map((subComp) => {
            return updateComponents(subComp, predicate, callback);
        });
    }
    return component;
}
export function getComponentKeys(component, predicate) {
    let allKeys = new Set();
    if (component.key && predicate(component)) {
        allKeys.add(component.key);
    }
    if (component?.contents) {
        const container = component;
        (container.contents ?? []).forEach((subComp) => {
            if (Array.isArray(subComp)) {
                subComp.forEach((subSubComp) => {
                    if (subSubComp) {
                        allKeys = new Set([...allKeys, ...getComponentKeys(subSubComp, predicate)]);
                    }
                });
            }
            else {
                allKeys = new Set([...allKeys, ...getComponentKeys(subComp, predicate)]);
            }
        });
    }
    if (component?.rowLayout) {
        const extensibleTable = component;
        extensibleTable.rowLayout?.forEach((subComp) => {
            allKeys = new Set([...allKeys, ...getComponentKeys(subComp, predicate)]);
        });
    }
    return allKeys;
}
