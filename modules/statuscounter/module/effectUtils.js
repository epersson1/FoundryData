import { DurationType } from "./durationType.js";

/**
 * Determines the effect's identifier for configured defaults.
 * @param {ActiveEffect} effect The effect to get the id for.
 * @returns {string} The configuration id of the effect.
 */
export function getEffectId(effect) {
    let [statusId] = effect.statuses;
    return statusId ?? (effect.name || effect.img);
}

/**
 * Returns the first effect with the given image path for the given actor.
 * @param {Actor} actor The actor to read the effects from.
 * @param {string} img The image path of the status to retrieve.
 * @param {number?} index The amount of previous effects with that image. Defaults to 0 to return the first match.
 * @returns {ActiveEffect?} The n-th actor effect with the given image.
 */
export function findEffectByImg(actor, img, index = 0) {
    if (!actor) return null;

    let effect = searchEffectByImg(actor.appliedEffects, img, index);
    if (!effect && game.system.id === "sfrpg") {
        effect = searchEffectByImg(actor.items.filter(item => item.type === "effect"), img, index);
    }

    return effect;
}

/**
 * Searches the given collection for an effect with the given image.
 * @param {Iterable.<ActiveEffect>} collection The iterable to search.
 * @param {string} img The image to search for.
 * @param {number} index The amount of matching entries to skip.
 * @returns {ActiveEffect?} The n-th effect matching the image.
 */
function searchEffectByImg(collection, img, index) {
    for (const effect of collection) {
        if (effect.img !== img) continue;
        if (index <= 0) return effect;
        index--;
    }
}

/**
 * Returns the first effect with the given status id for the given actor.
 * @param {Actor} actor The actor to read the effects from.
 * @param {string} statusId The id of the status to retrieve.
 * @returns {ActiveEffect?}
 */
export function findEffectById(actor, statusId) {
    if (!actor) return null;

    let effect = searchEffectById(actor.appliedEffects, statusId);
    if (!effect && game.system.id === "sfrpg") {
        effect = actor.items.find(item => item.type === "effect" && item.name.toLowerCase() === statusId);
    }

    return effect;
}

/**
 * Searches the given collection for an effect with the given status id.
 * @param {Iterable.<ActiveEffect>} collection The iterable to search.
 * @param {string} statusId The id of the status to search.
 * @returns {ActiveEffect?} The first effect matching the image.
 */
function searchEffectById(collection, statusId) {
    for (const effect of collection) {
        if (effect.statuses.has(statusId)) return effect;
    }
}

/**
 * Creates a duration for use in an ActiveEffect.
 * @param {Document} document The document to create the effect for.
 * @param {number} value The duration to initialize.
 * @param {DurationType} type The type of the duration.
 * @returns {object} An object containing the duration update.
 */
export function createDuration(document, value, type) {
    if (game.system.id === "sfrpg" && document.type === "effect") {
        const duration = { unit: "round", value };
        if (type === DurationType.Turn) {
            duration.value = 1;
            duration.expiryMode = {
                type: "turn",
                turn: 0 // TODO determine target turn
            };
        }
        return { "system.activeDuration": duration };
    }

    const duration = {};
    if (type === DurationType.Round) {
        duration.rounds = value;
        duration.turns = 0;
    } else {
        duration.rounds = 0;
        duration.turns = value;
    }

    // Set start round and turn to current combat state.
    const combat = game.combat;
    if (combat && combat.active && combat.round !== 0) {
        duration.combat = combat._id;

        duration.startRound = combat.round ?? 1;
        duration.startTurn = combat.turn ?? 0;
    } else {
        duration.startRound = 1;
        duration.startTurn = 0;
    }

    return { duration };
}

/**
 * Retrieves the remaining duration from the given document in its native numeric unit.
 * @param {Document} document The document to read the duration from.
 * @returns {number} The remaining duration of the effect.
 */
export function getRemainingDuration(document) {
    if (game.system.id === "sfrpg" && document.type === "effect") {
        let duration = document.system.activeDuration;
        if (duration.unit !== "round") return 0;

        // const timedEffect = document.actor?.system.timedEffects?.get(document.uuid);
        // if (timedEffect) duration = timedEffect.activeDuration;

        const value = duration.activationEnd - game.time.worldTime;
        return value / CONFIG.SFRPG.effectDurationFrom.round;
    }

    return document.duration?.remaining ?? 0;
}
