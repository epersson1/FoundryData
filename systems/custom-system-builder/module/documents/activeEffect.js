import { UncomputableError } from '../errors/UncomputableError.js';
export function getAppliedActiveEffectsByEffectChangeKey(actor) {
    const changesByKey = {};
    actor.appliedEffects.forEach(effect => effect.changes.forEach(change => {
        if (!change.key.startsWith('system.props.')) {
            return;
        }
        const key = change.key.replace('system.props.', '');
        Object.keys(changesByKey).includes(key)
            ? changesByKey[key].push({ activeEffect: effect, change: change })
            : changesByKey[key] = [{ activeEffect: effect, change: change }];
    }));
    return changesByKey;
}
export function applyActiveEffect(changes, actor, prop, computedProps) {
    changes.sort((a, b) => (a.change.priority ?? 0) - (b.change.priority ?? 0))
        .forEach(effect => {
        const newValue = effect.activeEffect.apply(actor, effect.change);
        if (newValue[`system.props.${prop}`] === 'ERROR') {
            actor.system.props[prop] = undefined;
            throw new UncomputableError(`Uncomputable Active Effect ${effect.activeEffect.name}`, effect.activeEffect.uuid, effect.change.value, computedProps);
        }
        foundry.utils.mergeObject(actor, newValue);
    });
    computedProps[prop] = actor.system.props[prop];
}
