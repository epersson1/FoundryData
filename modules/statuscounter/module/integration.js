/**
 * Register hooks for integrating with the Visual Active Effects module.
 */
export function registerVisualActiveEffects() {
    Hooks.on("visual-active-effects.createEffectButtons", (effect, buttons) => {
        const { statusCounter } = effect;
        if (!statusCounter) return;

        buttons.push({
            label: game.i18n.localize("statuscounter.config.title"),
            callback: () => statusCounter.configure(),
        });
    });

    Hooks.on("renderVisualActiveEffects", (app, html) => {
        const counterColor = game.settings.get("statuscounter", "counterColor").replace("#", "");
        const effects = html[0].querySelectorAll(".effect-item");
        for (const effectElement of effects) {
            const { effectUuid } = effectElement.dataset;
            if (!effectUuid) continue;

            const effect = fromUuidSync(effectUuid, { strict: false });
            if (!effect?.statusCounter?.visible) continue;

            effectElement.querySelector(".effect-icon:not(.temporary)")?.insertAdjacentHTML(
                "beforeend",
                `<div class='badge vae-sic-counter' style='color: #${counterColor};'>${effect.statusCounter.displayValue}</div>`,
            );
        }
    });
}