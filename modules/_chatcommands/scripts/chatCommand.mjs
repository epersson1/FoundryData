/**
 * Represents a single chat command.
 */
class ChatCommand {
    /**
     * Creates a new chat command from the given data.
     * @param {object} data The data of the command.
     * @param {string} data.name The name that is used to invoke the command.
     * @param {string} data.module The ID of the module that registered the command.
     * @param {string[]} data.aliases Aliases that can be used instead of the name. Defaults to an empty array.
     * @param {string?} data.description The human readable description of the command.
     * @param {string?} data.icon An HTML string containing the icon of the command.
     * @param {string=} data.requiredRole A minimum role that is required to invoke the command. Defaults to "NONE" (everyone).
     * @param {Function?} data.callback An optional function that is called with the chat application that triggered
     *  the command, its parameters and the original message data. The function can return null to apply FoundryVTT
     *  core handling, an empty object to omit the message or a message data object that will be sent to the chat.
     * @param {Function?} data.autocompleteCallback An optional function that is called when a user is typing the
     *  command with the menu that triggered the completion, the command's alias and its parameters. The function can
     *  return an array of @see HTMLElement or an @see HTMLCollection that will be displayed in the autocomplete menu.
     *  It may also return an asynchronous generator yielding element arrays.
     * @param {boolean=} data.closeOnComplete Indicates that the menu should be closed after an entry is selected.
     *  Defaults to true.
     */
    constructor(data) {
        Object.assign(this, data);
        this.name = data.name.toLowerCase();
        this.aliases = (data.aliases ?? []).map(a => a.toLowerCase());
        if (data.module === "core") this.moduleName = "FoundryVTT";
        else if (data.module === game.system.id) this.moduleName = game.system.title;
        else this.moduleName = game.modules.get(data.module)?.title ?? data.module;
        this.requiredRole ??= "NONE";
    }

    /**
     * Returns every name that this command can be invoked with (including aliases).
     */
    get names() {
        return [this.name].concat(this.aliases);
    }

    /**
     * Describes the command with predefined elements.
     * @param {string} alias The alias that should be described.
     * @param {boolean} footer Indicates whether a footer with other aliases and the module name will be displayed.
     * @returns {string} An HTML string containing a detailed command description.
     */
    getDescription(alias = this.name, footer = true) {
        let content = "<span class='command-title'>";
        if (this.icon) content += this.icon;
        content += alias + "</span>";

        // Add additional information.
        if (this.description) content += " - " + this.description;
        if (footer) {
            content += `<div class="command-footer"><span class="notes">${this.moduleName}</span>`;
            if (this.aliases.length) {
                const aliases = this.names.filter(a => a !== alias);
                content += `<span class="notes">${aliases.join(", ")}</span>`;
            }
            content += "</div>";
        }

        return content;
    }

    /**
     * Removes an alias from this command. Note that this should only be called before registering the command since it
     * does not remove the alias from the command registry.
     * @param {string} name The alias to remove.
     */
    removeAlias(name) {
        const index = this.aliases.indexOf(name);
        if (index !== -1) this.aliases.splice(index, 1);
    }

    /**
     * Checks if the command can be invoked by the current user.
     * @returns {boolean} True if the command can be invoked by the current user, false otherwise.
     */
    canInvoke() {
        return this.requiredRole === "NONE" || game.user.hasRole(this.requiredRole);
    }

    /**
     * Invokes the callback of the command.
     * @param {ChatLog} chat The chat application that the command is being invoked from.
     * @param {string} parameters The parameters of the command (if any).
     * @param {object} messageData The data of the chat message invoking the command.
     * @returns {?object|Promise} A chat message data object containing a new message. If omitted, no message will be
     *  sent. Alternatively, this may return a promise representing the result if the command's callback is asynchronous.
     */
    invoke(chat, parameters, messageData) {
        if (!this.callback) return;
        return this.callback(chat, parameters, messageData);
    }

    /**
     * Invokes the autocomplete callback of the command.
     * @param {AutocompleteMenu} menu The menu that the autocompletion is being invoked from.
     * @param {string} alias The alias that was used to initiate the autocomplete.
     * @param {string} parameters The parameters of the command (if any).
     * @returns {?string[]} A list of HTML strings or an HTMLCollection containing entries to complete the command or
     *  null when the command has no autocomplete callback.
     */
    autocomplete(menu, alias, parameters) {
        if (!this.autocompleteCallback) return null;
        const result = this.autocompleteCallback(menu, alias, parameters);
        if (!result) return [];
        if (result instanceof HTMLCollection || Array.isArray(result)) return result;
        if (result.next instanceof Function) {
            // Callback returned an iterator.
            this.abortAutocomplete();
            result.menu = menu;
            result.remaining = menu.maxEntries;
            this.currentAutocomplete = result;
            setTimeout(() => this.resumeAutocomplete(result), 400);
            return [game.chatCommands.createLoadingElement()];
        }
    }

    /**
     * Calls the next iteration of the given generator if it still belongs to the current autocomplete process. The
     * result is displayed using the callback passed to @see autocomplete.
     * @param {AsyncGenerator} generator The generator to fetch new entries with.
     */
    async resumeAutocomplete(generator) {
        if (!generator || generator !== this.currentAutocomplete) return;
        let result;
        if (generator.remaining <= 0) {
            // Stop iterating after reaching the maximum entries.
            generator.return([]);
            result = { value: [null], done: true };
        } else {
            result = await generator.next(); // Get the next set of results.
            if (generator !== this.currentAutocomplete) return; // Make sure that we're still current after waiting.
        }

        const value = result.value ?? [];
        generator.remaining -= value.length;
        generator.menu.display(value, true, result.done);
        if (result.done) this.currentAutocomplete = null;
        else setTimeout(() => this.resumeAutocomplete(generator));
    }

    /**
     * Aborts the current autocomplete process (if there is one) without displaying the result.
     */
    abortAutocomplete() {
        this.currentAutocomplete?.return([]);
    }
}

export default ChatCommand;