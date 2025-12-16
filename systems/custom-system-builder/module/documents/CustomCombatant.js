import Formula from '../formulas/Formula.js';
import Logger from '../Logger.js';
export default class CustomCombatant extends Combatant {
    _getInitiativeFormula() {
        const initF = game.settings.get(game.system.id, 'initFormula');
        const formula = initF || '1d20';
        CONFIG.Combat.initiative.formula = formula;
        Logger.debug('Initiative formula : ' + formula);
        return CONFIG.Combat.initiative.formula || game.system.initiative || '1d20';
    }
    //@ts-expect-error Return type changed for CSB
    async getInitiativeRoll(rawFormula) {
        return new Formula(rawFormula || this._getInitiativeFormula());
    }
    async rollInitiative(rawFormula) {
        const formula = await this.getInitiativeRoll(rawFormula);
        await formula.compute(this.actor?.system.props, {
            defaultValue: '0',
            computeExplanation: true
        });
        return this.update({ initiative: parseInt(formula.result) });
    }
}
