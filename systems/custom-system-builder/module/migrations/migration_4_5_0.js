/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/**
 * @ignore
 * @module
 */
import { beginMigration, finishMigration, getActorsToMigrate, reloadTemplatesInDocuments, updateDocuments } from './migrationUtils.js';
async function processMigration() {
    const versionNumber = '4.5.0';
    const actorsToMigrate = getActorsToMigrate(versionNumber);
    if (actorsToMigrate.length === 0) {
        return;
    }
    const notification = beginMigration(versionNumber);
    const templates = actorsToMigrate.filter((document) => document.isAssignableTemplate);
    const actors = actorsToMigrate.filter((document) => !document.isAssignableTemplate);
    await updateDocuments(templates, versionNumber, (template) => {
        return {
            system: {
                //@ts-expect-error Migration
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                statusEffects: template.system.activeEffects,
                ['-=activeEffects']: null,
                templateSystemUniqueVersion: (Math.random() * 0x100000000) >>> 0
            }
        };
    }, notification);
    await reloadTemplatesInDocuments(actors, versionNumber, notification);
    finishMigration(versionNumber, notification);
}
export default {
    processMigration
};
