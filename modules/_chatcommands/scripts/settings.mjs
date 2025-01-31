/**
 * Registers FoundryVTT settings used by the module.
 * @private
 */
export function initializeSettings() {
    game.settings.register("_chatcommands", "autocomplete", {
        name: game.i18n.localize("_chatcommands.settings.enableAutocomplete"),
        hint: game.i18n.localize("_chatcommands.settings.enableAutocompleteHint"),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true
    });

    game.settings.register("_chatcommands", "maxEntries", {
        name: game.i18n.localize("_chatcommands.settings.maxEntries"),
        hint: game.i18n.localize("_chatcommands.settings.maxEntriesHint"),
        scope: "client",
        config: true,
        type: Number,
        default: 15,
        onChange: value => {
            if (ui.chat.autocompleteMenu) ui.chat.autocompleteMenu.maxEntries = value;
            if (ui.chat._popout?.autocompleteMenu) ui.chat._popout.autocompleteMenu.maxEntries = value;
        }
    });

    game.settings.register("_chatcommands", "includeCoreCommands", {
        name: game.i18n.localize("_chatcommands.settings.autocompleteCore"),
        hint: game.i18n.localize("_chatcommands.settings.autocompleteCoreHint"),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true
    });

    game.settings.register("_chatcommands", "displayFooter", {
        name: game.i18n.localize("_chatcommands.settings.displayFooter"),
        hint: game.i18n.localize("_chatcommands.settings.displayFooterHint"),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            if (ui.chat.autocompleteMenu) ui.chat.autocompleteMenu.showFooter = value;
            if (ui.chat._popout?.autocompleteMenu) ui.chat._popout.autocompleteMenu.showFooter = value;
        }
    });
}