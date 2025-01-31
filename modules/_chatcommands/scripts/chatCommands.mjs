import ChatCommand from "./chatCommand.mjs";

/**
 * Registry for chat commands and utility methods.
 */
class ChatCommands {
    /**
     * The map of currently registered commands and their aliases. Each alias has a separate entry that points to the
     * same @see ChatCommand instance.
     * @type {Map.<string, ChatCommand>}
     */
    commands = new Map();

    /**
     * A set of valid command start characters. These are used to quickly verify whether a command is present.
     * @type {Set.<string>}
     * @private
     */
    startChars = new Set();

    /**
     * Attaches the API to the game instance and registers a hook to handle chat messages.
     * @package
     */
    static initialize() {
        game.chatCommands = new ChatCommands();
        game.modules.get("_chatcommands").api = game.chatCommands;
        Hooks.on("chatMessage", (chat, message, data) => game.chatCommands.handleMessage(chat, message, data));
        Hooks.on('renderChatLog', (_, html) => {
            const loader = document.createElement("div");
            loader.id = "chatcommand-loading";
            loader.dataset.active = 0;
            html[0].querySelector("#chat-message").before(loader);
        });
    }

    /**
     * Returns the class implementing a single chat command.
     * @returns The @see ChatCommand class.
     */
    get commandClass() {
        return ChatCommand;
    }

    /**
     * Registers a single chat command using its data.
     * @see ChatCommand.constructor for valid fields.
     * @param {object|ChatCommand} command The command object to register.
     * @param {boolean=} override Force the new command to override existing entries. Defaults to false.
     */
    register(command, override = false) {
        let deprecations = [];
        if (!command.module) {
            deprecations.push(`Missing module property. Please provide it with the ID of your module.`);
            command.module = "Unknown";
        }

        if (command.commandKey) {
            deprecations.push("The commandKey property is deprecated. Please use the newer name property.");
            command.name = command.commandKey;
        }

        if (command.iconClass) {
            deprecations.push("The iconClass property is deprecated. Please use the newer icon property.");
            command.icon = `<i class="fas ${command.iconClass}"></i>`;
        }

        if (command.gmOnly) {
            deprecations.push("The gmOnly property is deprecated. Please use the newer requiredRole property.");
            command.requiredRole = "GAMEMASTER";
        }

        if (command.invokeOnCommand) {
            deprecations.push("The invokeOnCommand property is deprecated. Please use the newer callback property.");
            command.callback = async (chat, parameters, messageData) => {
                let text = command.invokeOnCommand(chat, parameters.trimEnd(), messageData);
                if (text instanceof Promise) text = await text;
                if (!command.shouldDisplayToChat) return {};
                return {
                    content: text,
                    type: command.createdMessageType ?? messageData.createdMessageType
                }
            }
        }

        if (deprecations.length) {
            deprecations.unshift(`Chat Commander | Command ${command.name} has deprecations:`);
            console.warn(deprecations.join("\n"));
        }

        if (!(command instanceof ChatCommand)) command = new ChatCommand(command);
        command.names.forEach(alias => this._registerAlias(command, alias, override));
        console.info(`Chat Commander | Module ${command.module} registered command ${command.name} with ${command.aliases.length} aliases.`);
    }

    /**
     * Attempts to register an alias for the given command.
     * Depending on the currently registered commands, the new alias may replace other aliases or receive a namespace.
     * The registration may be skipped when the new alias isn't the command's original name.
     * @param {ChatCommand} command The command to register the alias for.
     * @param {string} alias The alias to register.
     * @param {boolean} override Force the alias to override existing entries.
     * @private
     */
    _registerAlias(command, alias, override) {
        const existing = this.commands.get(alias);
        if (existing) {
            if (override || existing.module === "core") {
                // Allow force override or replacing core commands.
                console.info(`Chat Commander | Overriding existing command ${alias}.`);
            } else if (alias === command.name) {
                if (alias === existing.name) {
                    // Both commands are original names, use a namespace to disambiguate.
                    console.warn(`Chat Commander | Using namespace for command ${alias} due to conflict.`);
                    command.name = alias = alias[0] + command.module + "." + command.name.substring(1);
                } else {
                    // Allow replacing aliases.
                    console.warn(`Chat Commander | Overriding alias ${alias} with new command.`);
                    existing.removeAlias(alias);
                }
            } else {
                // Prevent aliases from replacing commands.
                console.warn(`Chat Commander | Prevented alias override for command ${alias}.`);
                command.removeAlias(alias);
                return;
            }
        }

        this.commands.set(alias, command);
        this.startChars.add(alias[0]);
    }

    /**
     * Unregisters the given chat command and its aliases.
     * @param {string|ChatCommand} name The name of the command or the command itself.
     */
    unregister(name) {
        const command = typeof (name) === "string" ? this.commands.get(name.toLowerCase()) : name;
        if (!command) return;

        command.names.forEach(c => this.commands.delete(c));
        console.info(`Chat Commander | Unregistered command ${command.name} with ${command.aliases.length}`);
    }

    /**
     * Creates a selectable list entry for a single command.
     * @param {string} command The command that the entry applies when it is selected.
     * @param {string} content An HTML string containing the displayed entry.
     * @returns {HTMLElement} An HTML element containing a selectable command entry.
     */
    createCommandElement(command, content) {
        const el = document.createElement("li");
        el.dataset.command = command;
        el.classList.add("context-item", "command");
        el.tabIndex = 0;
        el.innerHTML = content;
        return el;
    }

    /**
     * Creates a non-selectable list entry for displaying additional information.
     * @param {string} content An HTML string containing the displayed entry.
     * @returns {HTMLElement} An HTML element containing an informational entry.
     */
    createInfoElement(content) {
        const el = document.createElement("li");
        el.classList.add("context-item", "info");
        el.disabled = true;
        el.innerHTML = content;
        return el;
    }

    /**
     * Creates a list entry displaying a separator.
     * @returns {HTMLElement} An HTML element containing a separator entry.
     */
    createSeparatorElement() {
        const el = document.createElement("li");
        el.classList.add("context-item", "separator");
        el.disabled = true;
        el.appendChild(document.createElement("hr"));
        return el;
    }

    /**
     * Creates a list entry displaying a loading indicator.
     * @returns {HTMLElement} An HTML element containing a loading entry.
     */
    createLoadingElement() {
        const el = document.createElement("li");
        el.classList.add("context-item", "loading");
        el.disabled = true;
        return el;
    }

    /**
     * Creates an informational element indicating that more results are available.
     * @returns {HTMLElement} An HTML element containing the overflow hint.
     */
    createOverflowElement() {
        return this.createInfoElement(`<p class="notes">${game.i18n.localize("_chatcommands.extraEntries")}</p>`);
    }

    /**
     * Checks if the given text might contain a command. Note that this only checks if the first character is a command
     * character, not that a command with that input actually exists.
     * @param {string} text The text to check.
     * @returns {boolean} True if the input might be a command, false otherwise.
     */
    isCommand(text) {
        return text && this.startChars.has(text[0].toLowerCase());
    }

    /**
     * Parses the given text to find a command and its parameters.
     * @param {string} text The text to search for commands in.
     * @returns {object?} An object containing the command itself, the used alias and the parameters (or null if no
     *  command was found).
     */
    parseCommand(text) {
        if (!this.isCommand(text)) return null;

        // Check for single character commands.
        const separator = game.chatCommands.commands.has(text[0].toLowerCase()) ? 1 : text.indexOf(' ');

        // Extract the name of the command.
        let alias = text.toLowerCase();
        if (separator !== -1) alias = alias.substring(0, separator);
        if (alias === "") return null;

        // Look for a command matching the name.
        const command = this.commands.get(alias);
        if (!command) return null;

        // Extract parameters.
        return {
            command,
            alias,
            parameters: separator > 0 ? text.substring(alias.length === 1 ? separator : separator + 1) : ""
        };
    }

    /**
     * Processes a chat message to check if it contains a command. If so, a permission check is performed, the command
     * is invoked and the invokeChatCommand hook is called. The result indicates whether a message will be sent.
     * @param {ChatLog} chat The chat that emitted the message.
     * @param {string} message The content of the message to send.
     * @param {object} messageData The data of the message to send.
     * @returns {boolean?} False if the command was handled, undefined otherwise.
     */
    handleMessage(chat, message, messageData) {
        const commandInfo = this.parseCommand(message);
        if (!commandInfo) return;

        if (!commandInfo.command.canInvoke()) {
            ui.notifications.error(game.i18n.format("_chatcommands.insufficientPermissions", { command: commandInfo.alias }));
            return false;
        }

        // Invoke the command with its parameters.
        let result = commandInfo.command.invoke(chat, commandInfo.parameters, messageData);
        if (result instanceof Promise) {
            const loader = chat.element[0].querySelector("#chatcommand-loading");
            loader.dataset.active++;
            result.then(r =>
                this._resumeMessageHandling(chat, commandInfo.command, commandInfo.parameters, r ?? {}, messageData))
                .finally(() => loader.dataset.active--);
            return false;
        } else {
            return this._resumeMessageHandling(chat, commandInfo.command, commandInfo.parameters, result, messageData);
        }
    }

    /**
     * Resumes asynchronous processing of a chat message that contains a command.
     * @param {ChatLog} chat The chat that emitted the message.
     * @param {ChatCommand} command The command that was invoked by the message.
     * @param {string} parameters The parameters of the command invocation.
     * @param {object?} result The result of the command invocation.
     * @param {object} messageData The data of the message to send.
     * @returns {boolean?} False if the hook listeners prevented core handling, undefined otherwise.
     * @private
     */
    _resumeMessageHandling(chat, command, parameters, result, messageData) {
        // Handle internally or forward to FoundryVTT core.
        const options = { handleCore: !result };
        result ??= {}; // Allow hook listeners to add content even if the command returned none.
        Hooks.callAll("invokeChatCommand", chat, command, parameters, result, options);
        if (result.content) {
            result.content = result.content.replace(/\n/g, "<br>");
            getDocumentClass("ChatMessage").create(foundry.utils.mergeObject(messageData, result));
        } else if (options.handleCore) return;
        return false;
    }

    /** @deprecated */
    registerCommand(command) {
        console.warn("Chat Commander | The registerCommand method is deprecated. Please use the newer register method.");
        this.register(command);
    }

    /** @deprecated */
    deregisterCommand(command) {
        console.warn("Chat Commander | The deregisterCommand method is deprecated."
            + " Please use the newer unregister method.");
        this.unregister(command.commandKey ?? command.name);
    }

    /** @deprecated */
    createCommand(commandKey, shouldDisplayToChat, invokeOnCommand, createdMessageType = 0) {
        console.warn("Chat Commander | The createCommand method is obsolete."
            + " Please create a command data object and pass it directly to the register method.");
        return {
            name: commandKey,
            shouldDisplayToChat,
            invokeOnCommand,
            createdMessageType,
            iconClass: "",
            description: ""
        };
    }

    /** @deprecated */
    createCommandFromData(data) {
        console.warn("Chat Commander | The createCommandFromData method is obsolete."
            + " Please pass the command data directly to the register method.");
        data.name ??= data.commandKey;
        data.shouldDisplayToChat ??= false;
        data.createdMessageType ??= 0;
        data.iconClass ??= "";
        data.description ??= "";
        data.requiredRole ??= "NONE";
        return data;
    }
}

export default ChatCommands;