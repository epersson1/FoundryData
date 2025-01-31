/**
 * Registers core commands for autocompletion.
 * @private
 */
export const registerCoreCommands = function () {
    if (!game.settings.get("_chatcommands", "includeCoreCommands")) return;

    const commands = game.chatCommands;
    registerMessageCommands(commands);
    registerRollCommands(commands);
}

/**
 * Registers core commands for modifying messages.
 * @param {ChatCommands} commands The game's chat command API instance.
 * @private
 */
function registerMessageCommands(commands) {
    commands.register({
        name: "/ic",
        module: "core",
        icon: "<i class='fas fa-id-badge'></i>",
        description: game.i18n.localize("_chatcommands.coreCommands.ic")
    });
    commands.register({
        name: "/ooc",
        module: "core",
        icon: "<i class='fas fa-chalkboard-user'></i>",
        description: game.i18n.localize("_chatcommands.coreCommands.ooc")
    });
    commands.register({
        name: "/emote",
        module: "core",
        aliases: ["/em", "/me"],
        icon: "<i class='fas fa-address-card'></i>",
        description: game.i18n.localize("_chatcommands.coreCommands.emote")
    });
    commands.register({
        name: "/whisper",
        module: "core",
        aliases: ["/w", "@"],
        icon: "<i class='fas fa-message'></i>",
        description: game.i18n.localize("_chatcommands.coreCommands.whisper.description"),
        autocompleteCallback: game.modules.get("autocomplete-whisper")?.active ? () => [] : completeWhisper
    });
}

/**
 * Creates entries for completing user names and suggests bracket syntax as needed.
 * @param {AutocompleteMenu} menu The menu that initiated the completion process.
 * @param {string} alias The alias of the command.
 * @param {string} parameters The parameters of the command.
 * @returns {HTMLElement[]} The HTML elements containing syntax and recent roll entries.
 * @private
 */
function completeWhisper(menu, alias, parameters) {
    let userNames = ["GM", "Players"].concat(Array.from(game.users.values()).map(u => u.name));
    const included = [];
    const suggested = [];
    const candidates = parameters.split(',');
    let match = false;
    for (let i = 0; i < candidates.length; i++) {
        // Strip whitespace, brackets and capitalization.
        const name = candidates[i].toLowerCase().replace(/^[\s\[]*|[\s\]]*$/g, "");
        match = false;

        // Check all users that haven't already been added.
        for (let userName of userNames.filter(n => !included.includes(n))) {
            if (userName.toLowerCase() === name) {
                // Exact match, include the user.
                match = true;
                included.push(userName);
                break;
            } else if (i === candidates.length - 1 && (name === "" || userName.toLowerCase().includes(name))) {
                // Last entry may not have exact match, suggest the user if the name could match the input.
                match = true;
                suggested.push(userName);
            }
        }

        // Stop searching if any input doesn't have a match (which likely means a comma within the message).
        if (!match) break;
    }

    // Not all candidates have a match, close the menu.
    if (!match) return [];

    // There are no suggestions, check if the paramters still need syntax adjustments.
    const needsRedirect = alias === "@";
    if (!suggested.length) {
        const needsBrackets = included.length > 1 || included[0]?.includes(' ');
        const hasBrackets = parameters.startsWith('[') && parameters.trimEnd().endsWith(']');
        if (included.length && (needsRedirect || (hasBrackets !== needsBrackets))) {
            // Suggest /w without displaying a menu.
            menu.suggest(needsBrackets ? `/w [${included.join(", ")}]` : "/w " + included.join(", "));
        }
        return [];
    }

    let prefix = needsRedirect ? "/w " : alias + " "; // Redirect @ to /w
    if (included.length) {
        // There already is a user in the parameters, suggest multi user syntax.
        return suggested.map(n => createUserElement(`${prefix}[${included.join(", ")}, ${n}]`, n));
    } else {
        // We don't have a user yet, suggest single user syntax.
        return suggested.map(n => {
            const completedName = n.includes(' ') ? `[${n}]` : n; // Handle user names with spaces.
            return createUserElement(prefix + completedName, n);
        });
    }
}

/**
 * Creates a command element for the given user's name. This may add additional information when the name is a
 * special string rather than a user's name, e.g. "GM" or "Players".
 * @param {string} command The command to complete when selecting the user.
 * @param {string} name The name of the user.
 * @returns {HTMLElement} An HTML element containing the command entry for the user.
 * @private
 */
function createUserElement(command, name) {
    let content = name;
    if (name === "GM") {
        const gmLocal = game.i18n.localize("_chatcommands.coreCommands.whisper.gm");
        if (gmLocal !== name) content += ` (${gmLocal})`;
        content += ` <span class="notes">${game.users.filter(u => u.isGM).map(u => u.name).join(", ")}</span>`;
    } else if (name === "Players") {
        const playerLocal = game.i18n.localize("_chatcommands.coreCommands.whisper.players");
        if (playerLocal !== name) content += ` (${playerLocal})`;
        content += ` <span class="notes">${game.users.filter(u => !u.isGM).map(u => u.name).join(", ")}</span>`;
    }

    return game.chatCommands.createCommandElement(command, content);
}

/**
 * Registers hooks and core commands for displaying roll syntax and recent rolls.
 * @param {ChatCommands} commands The game's chat command API instance.
 * @private
 */
function registerRollCommands(commands) {
    // Register setting to store recent rolls per user.
    game.settings.register("_chatcommands", "recentRolls", {
        name: "Recent dice rolls",
        scope: 'client',
        config: false,
        type: Array,
        default: []
    });

    // Register hook to track recent rolls for core commands.
    Hooks.on("invokeChatCommand", (_, command, parameters) => {
        if (!command.name.endsWith("roll") || command.module !== "core") return;

        const recentRolls = game.settings.get("_chatcommands", "recentRolls");
        const existingRoll = recentRolls.indexOf(parameters);
        if (existingRoll !== -1) recentRolls.splice(existingRoll, 1);
        recentRolls.unshift(parameters);
        game.settings.set("_chatcommands", "recentRolls", recentRolls.slice(0, 5));
    });

    commands.register({
        name: "/roll",
        module: "core",
        aliases: ["/r"],
        icon: "<i class='fas fa-dice'></i>",
        description: game.i18n.localize("_chatcommands.coreCommands.roll.basic"),
        autocompleteCallback: completeDice,
        closeOnComplete: false
    });
    commands.register({
        name: "/gmroll",
        module: "core",
        aliases: ["/gmr"],
        icon: "<i class='fas fa-dice-two'></i>",
        description: game.i18n.localize("_chatcommands.coreCommands.roll.gm"),
        autocompleteCallback: completeDice,
        closeOnComplete: false
    });
    commands.register({
        name: "/blindroll",
        module: "core",
        aliases: ["/broll", "/br"],
        icon: "<i class='fas fa-eye-slash'></i>",
        description: game.i18n.localize("_chatcommands.coreCommands.roll.blind"),
        autocompleteCallback: completeDice,
        closeOnComplete: false
    });
    commands.register({
        name: "/selfroll",
        module: "core",
        aliases: ["/sr"],
        icon: "<i class='fas fa-dice-one'></i>",
        description: game.i18n.localize("_chatcommands.coreCommands.roll.self"),
        autocompleteCallback: completeDice,
        closeOnComplete: false
    });
    commands.register({
        name: "/publicroll",
        module: "core",
        aliases: ["/pr"],
        icon: "<i class='fas fa-dice-five'></i>",
        description: game.i18n.localize("_chatcommands.coreCommands.roll.public"),
        autocompleteCallback: completeDice,
        closeOnComplete: false
    });
}

/**
 * Creates a set of menu entries to display roll syntax information and suggest recent rolls. Some info entries may
 * be skipped if the menu doesn't have enough space.
 * @param {AutocompleteMenu} menu The menu that initiated the completion process.
 * @param {string} alias The alias of the command.
 * @param {string} parameters The parameters of the command.
 * @returns {HTMLElement[]} The HTML elements containing syntax and recent roll entries.
 * @private
 */
function completeDice(menu, alias, parameters) {
    const commands = game.chatCommands;
    const recentRolls = game.settings.get("_chatcommands", "recentRolls")
        .slice()
        .filter(r => r.includes(parameters))
        .map(r => commands.createCommandElement(alias + " " + r, r));
    let info;
    if (menu.maxEntries >= 10) {
        info = [
            commands.createInfoElement(game.i18n.localize("_chatcommands.coreCommands.roll.simpleInfo")),
            commands.createInfoElement(game.i18n.localize("_chatcommands.coreCommands.roll.descriptionInfo")),
            commands.createInfoElement(game.i18n.localize("_chatcommands.coreCommands.roll.modifierInfo")),
            commands.createInfoElement(game.i18n.localize("_chatcommands.coreCommands.roll.advancedInfo"))
        ];
        if (!recentRolls.length) return info;
        info.push(commands.createInfoElement(`<hr><p class="notes">
                ${game.i18n.localize("_chatcommands.coreCommands.roll.recent")}</p>`));
    } else if (menu.maxEntries > 5) {
        info = [commands.createInfoElement(game.i18n.localize("_chatcommands.coreCommands.roll.simpleInfo"))];
    } else {
        return recentRolls;
    }

    return info.concat(recentRolls);
}