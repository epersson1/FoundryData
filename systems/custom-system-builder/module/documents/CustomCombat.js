import { postAugmentedChatMessage } from '../utils.js';
export default class CustomCombat extends Combat {
    async rollInitiative(ids, { formula: rawFormula = null, updateTurn = true, messageOptions = {} } = {}) {
        // Structure input data
        ids = typeof ids === 'string' ? [ids] : ids;
        const chatRollMode = game.settings.get('core', 'rollMode');
        // Iterate over Combatants, performing an initiative roll for each
        const updates = [];
        const messages = [];
        for (const [i, id] of ids.entries()) {
            // Get Combatant data (non-strictly)
            const combatant = this.combatants.get(id);
            if (!combatant?.isOwner)
                continue;
            // Produce an initiative roll for the Combatant
            const formula = await combatant.getInitiativeRoll(rawFormula ?? undefined);
            const phrase = new ComputablePhrase('${' + formula.raw + '}$');
            await phrase.compute(combatant.actor?.system.props, {
                defaultValue: '0',
                computeExplanation: true,
                triggerEntity: combatant.actor?.templateSystem
            });
            updates.push({ _id: id, initiative: parseInt(phrase.result) });
            // If the combatant is hidden, use a private roll unless an alternative rollMode was explicitly requested
            const rollMode = ('rollMode' in messageOptions
                ? messageOptions.rollMode
                : combatant.hidden
                    ? CONST.DICE_ROLL_MODES.PRIVATE
                    : chatRollMode);
            // Construct chat message data
            const messageData = foundry.utils.mergeObject({
                speaker: foundry.documents.ChatMessage.implementation.getSpeaker({
                    actor: combatant.actor,
                    token: combatant.token,
                    alias: combatant.name
                }),
                flavor: game.i18n.format('COMBAT.RollsInitiative', {
                    name: foundry.utils.escapeHTML(combatant.name ?? '')
                }),
                flags: { core: { initiativeRoll: true } }
            }, messageOptions);
            const chatData = (await postAugmentedChatMessage(phrase, messageData, {
                create: false,
                rollMode
            }));
            // Play 1 sound for the whole rolled set
            if (i > 0 && chatData)
                chatData.sound = null;
            messages.push(chatData);
        }
        if (!updates.length)
            return this;
        // Update combatants and combat turn
        const updateOptions = {
            turnEvents: false
        };
        if (!updateTurn)
            updateOptions.combatTurn = this.turn ?? undefined;
        await this.updateEmbeddedDocuments('Combatant', updates, updateOptions);
        // Create multiple chat messages
        await foundry.documents.ChatMessage.implementation.create(messages);
        return this;
    }
}
