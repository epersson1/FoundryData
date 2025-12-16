import CounterConfig from "./counterConfig.js";
import { DurationType } from "./durationType.js";
import { createDuration, getRemainingDuration } from "./effectUtils.js";

export default class StatusCounter {
    /**
     * The counter's parent effect.
     * @type {ActiveEffect}
     */
    parent;

    /**
     * The type of the counter.
     * @type {string}
     */
    type = "default";

    /**
     * The path to the counter's source value.
     * @type {string}
     */
    dataSource = "flags.statuscounter.value";

    /**
     * Indicates whether the counter's value may become negative.
     * @type {boolean}
     */
    // allowNegative = false;

    /**
     * Indicates whether the counter should multiply the parent effect's changes.
     * @type {boolean}
     */
    multiplyEffect = false;

    /**
     * The mode for displaying the effect's duration.
     * @see DurationType
     * @type {number}
     */
    durationType = DurationType.None;

    /**
     * Indicates whether setting values changes the duration instead of the data source.
     * @type {boolean}
     */
    modifyDuration = false;

    constructor(parent, data) {
        this.parent = parent;
        Object.assign(this, data);
    }

    /**
     * @returns {string} A human readable name for this counter type.
     */
    static get label() {
        return game.i18n.localize("statuscounter.config.type.default");
    }

    /**
     * Checks if this counter type can be used for the given effect.
     * @param {Document} parent The effect to check.
     * @returns {boolean} True if this counter type can be used, false otherwise.
     */
    static allowType(parent) {
        return true;
    }

    /**
     * Applies data for a new counter to the given document's source.
     * @param {Document} document The document that is being created.
     * @param {object} data The data to create the counter with.
     */
    static create(document, data) {
        // Apply duration instead of value.
        const remaining = getRemainingDuration(document);
        if (remaining > 0 && remaining < 1000 && !data.config.hasOwnProperty("durationType")) {
            data.config.durationType = DurationType.Round;
        }

        if (data.config.modifyDuration) {
            const durationType = data.config.durationType ?? DurationType.None;
            if (durationType !== DurationType.None) {
                const durationUpdate = createDuration(document, data.value, durationType);
                document.updateSource(durationUpdate);
                data.value = 1;
                data.visible = false;
            }
        }

        data.visible ??= data.value > 1 || game.settings.get("statuscounter", "displayOne") === "always";

        if (data.config.hasOwnProperty("dataSource")) {
            document.updateSource({ [data.config.dataSource]: data.value });
        } else if (game.modules.get("dae")?.active && document.getFlag("dae", "stackable")?.startsWith("count")) {
            // Use Dynamic Active Effects stack count for its stackable effects.
            data.config.dataSource = "flags.dae.stacks";
            document.updateSource({ "flags.dae.stacks": data.value });
        }

        document.updateSource({ "flags.statuscounter": data });
    }

    /**
     * Creates a new canvas font for rendering the counter's value.
     * @param {number} size The target size of the font.
     * @returns {PIXI.TextStyle} The font to use.
     */
    static createFont(size) {
        const font = CONFIG.canvasTextStyle.clone();
        font.fontSize = size;
        font.fill = `#${game.settings.get("statuscounter", "counterColor").replace('#', '')}`;
        return font;
    }

    /**
     * Creates a new canvas font for rendering the counter's duration.
     * @param {number} size The target size of the font.
     * @returns {PIXI.TextStyle} The font to use.
     */
    static createDurationFont(size) {
        const font = this.createFont(size);
        font.fill = `#${game.settings.get("statuscounter", "countdownColor").replace('#', '')}`;
        return font;
    }

    /**
     * @returns {boolean} True if the value counter should be displayed, false otherwise.
     */
    get visible() {
        return this.parent.getFlag("statuscounter", "visible") ?? false;
    }

    /**
     * @returns {number?} The counter value to display.
     */
    get displayValue() {
        return foundry.utils.getProperty(this.parent, this.dataSource) ?? 1;
    }

    /**
     * @returns {number} The source value of the counter.
     * @private
     */
    get _sourceValue() {
        return foundry.utils.getProperty(this.parent._source, this.dataSource)
            ?? this.displayValue
            ?? 1;
    }

    /**
     * Updates the value of the counter's data source.
     * @param {number} value The value to set.
     * @returns {Promise} A promise representing the effect update.
     */
    setValue(value) {
        // if (!this.allowNegative) value = Math.max(0, value);
        if (this._isNegative(value)) return this._deleteParent();

        const displayOne = game.settings.get("statuscounter", "displayOne");
        const visible = value > 1 || displayOne === "always" || displayOne === "countdown" && this._sourceValue > 1;
        return this.parent.update({
            [this.dataSource]: value,
            "flags.statuscounter.visible": visible,
        });
    }

    /**
     * Increments the value or duration of the counter by 1.
     * @param {boolean} [alt=false] Toggle the modification of the value or the duration.
     * @returns {Promise} A promise representing the effect update.
     */
    increment(alt = false) {
        let { modifyDuration } = this;
        if (alt) modifyDuration = !modifyDuration;
        return modifyDuration ? this.setDuration(this.displayDuration + 1) : this.setValue(this._sourceValue + 1);
    }

    /**
     * Decrements the value or duration of the counter by 1.
     * @param {boolean} [alt=false] Toggle the modification of the value or the duration.
     * @returns {Promise} A promise representing the effect update.
     */
    decrement(alt = false) {
        let { modifyDuration } = this;
        if (alt) modifyDuration = !modifyDuration;
        return modifyDuration ? this.setDuration(this.displayDuration - 1) : this.setValue(this._sourceValue - 1);
    }

    /**
     * Updates the value or duration of the counter.
     * @param {number} value The value to set.
     * @param {boolean} [alt=false] Toggle the modification of the value or the duration. 
     * @returns {Promise} A promise representing the effect update.
     */
    set(value, alt = false) {
        let { modifyDuration } = this;
        if (alt) modifyDuration = !modifyDuration;
        return modifyDuration ? this.setDuration(value) : this.setValue(value);
    }

    /**
     * @returns {number?} The remaining duration to display.
     */
    get displayDuration() {
        switch (this.durationType) {
            case DurationType.Round: return Math.ceil(getRemainingDuration(this.parent));
            case DurationType.Turn:
                const remaining = this.parent.duration?.remaining ?? 0;
                const rounds = Math.floor(remaining);
                const turnsPerRound = game.combat?.turns.length ?? 1;
                return Math.round(rounds * turnsPerRound + (remaining - rounds) * 100);
            default: return null;
        }
    }

    /**
     * Updates the duration of the counter's effect.
     * @param {number} value The duration to set.
     * @returns {Promise} A promise representing the effect update.
     */
    setDuration(value) {
        if (this.durationType === DurationType.None) return Promise.resolve();
        if (this._isOver(value)) return this._deleteParent();

        const durationUpdate = createDuration(this.parent, value, this.durationType);
        return this.parent.update(durationUpdate);
    }

    /**
     * Opens the configuration for this counter.
     * @returns {Promise} A promise representing the configuration rendering.
     */
    configure() {
        if (!this.parent.id) {
            ui.notifications.warn(
                `Status Icon Counters | ${game.i18n.format("statuscounter.config.localEffect", { name: this.parent.name })}`
            );
            return Promise.resolve();
        }

        return new CounterConfig({ document: this.parent }).render(true);
    }

    /**
     * Checks if the counter's value would become 0 when setting the given value.
     * @param {number} value The value to check.
     * @returns {boolean} True if the new value would be 0 or lower, false otherwise.
     */
    _isNegative(value) {
        // if (this.allowNegative) return false;
        const delta = this.displayValue - this._sourceValue;
        return value + delta <= 0;
    }

    /**
     * Checks if the effect's duration would become 0 when setting the given duration.
     * @param {number} duration The duration to check.
     * @returns {boolean} True if the new duration would be 0 or lower, false otherwise.
     */
    _isOver(duration) {
        return duration <= 0;
    }

    /**
     * Removes the parent effect from its actor.
     * @returns {Promise} A promise representing the deletion.
     */
    _deleteParent() {
        if (game.system.id === "sfrpg" && this.parent.actor?._isCondition(this.parent)) {
            return this.parent.actor.setCondition(this.parent.name.toLowerCase(), false);
        }

        return this.parent.transfer ? this.parent.update({ disabled: true }) : this.parent.delete();
    }

    /**
     * Multiplies the given delta value with the counter's value.
     * @param {*} delta The delta value provided by FoundryVTT.
     * @returns {*} The multiplied delta value.
     */
    _multiplyDelta(delta) {
        return this.multiplyEffect && typeof (delta) === "number" ? delta * this.displayValue : delta;
    }
}
