/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import CustomActor from '../documents/CustomActor.js';
import CustomItem from '../documents/CustomItem.js';
import { beginMigration, finishMigration, getActorsToMigrate, getItemsToMigrate, logProgress } from './migrationUtils.js';
async function processMigration() {
    const versionNumber = '5.0.0';
    const templateActors = getActorsToMigrate(versionNumber).filter((actor) => actor.isTemplateActor());
    const templateItems = getItemsToMigrate(versionNumber).filter((item) => item.isTemplateItem());
    const migrationTotal = templateActors.length + templateItems.length;
    if (migrationTotal > 0) {
        const notification = beginMigration(versionNumber);
        const actorsToUpdate = [];
        for (let i = 0; i < templateActors.length; i++) {
            const actor = templateActors[i];
            logProgress(actor, versionNumber, i, migrationTotal, notification);
            const updateData = {
                _id: actor.id,
                flags: {
                    [game.system.id]: {
                        version: versionNumber
                    }
                }
            };
            if (actor.img === 'icons/svg/mystery-man.svg') {
                updateData.img = 'systems/custom-system-builder/img/template-logo.svg';
            }
            actorsToUpdate.push(updateData);
        }
        await CustomActor.updateDocuments(actorsToUpdate);
        const itemsToUpdate = [];
        for (let i = 0; i < templateItems.length; i++) {
            const item = templateItems[i];
            logProgress(item, versionNumber, i + templateActors.length, migrationTotal, notification);
            const updateData = {
                _id: item.id,
                flags: {
                    [game.system.id]: {
                        version: versionNumber
                    }
                }
            };
            if (item.img === 'icons/svg/item-bag.svg') {
                switch (item.type) {
                    case '_equippableItemTemplate':
                        updateData.img = 'systems/custom-system-builder/img/template-logo.svg';
                        break;
                    case 'subTemplate':
                        updateData.img = 'systems/custom-system-builder/img/subtemplate-logo.svg';
                        break;
                    case 'userInputTemplate':
                        updateData.img = 'systems/custom-system-builder/img/user-input-logo.svg';
                        break;
                }
            }
            itemsToUpdate.push(updateData);
        }
        await CustomItem.updateDocuments(itemsToUpdate);
        finishMigration(versionNumber, notification);
    }
}
export default {
    processMigration
};
