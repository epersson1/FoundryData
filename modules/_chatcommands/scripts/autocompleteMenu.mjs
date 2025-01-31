/**
 * A set of keys to ignore when processing events.
 * @private
 */
const ignoredKeys = new Set(["Control", "ContextMenu", "AltGraph", "Alt", "Shift", "Meta"]);

/**
 * Extension for the chat text input to enable autocomplete functionalities.
 */
class AutocompleteMenu {
    /**
     * Indicates whether the menu is currently displayed.
     * @type {boolean}
     * @private
     */
    visible = false;

    /**
     * Parent element of the menu.
     * @type {HTMLElement}
     * @private
     */
    container;

    /**
     * Chat text input rendered by FoundryVTT.
     * @type {HTMLTextAreaElement}
     * @private
     */
    chatInput;

    /**
     * Text area to display suggestions.
     * @type {HTMLTextAreaElement}
     * @private
     */
    suggestionArea;

    /**
     * Maximum amount of entries that can be displayed in the menu.
     * @type {number}
     */
    maxEntries;

    /**
     * Indicates whether the command footer should be displayed.
     * @type {boolean}
     */
    showFooter;

    /**
     * Stores the command that is currently being autocompleted. May be null to indicate that we're completing the
     * command itself.
     * @type {ChatCommand?}
     */
    currentCommand;

    /**
     * Creates a new menu and registers listeners to enable autocompletion of commands.
     * @param {HTMLTextAreaElement} chatInput The text area to attach the listeners to.
     */
    constructor(chatInput) {
        // Create UI markup.
        const menuContainer = "<div id='autocomplete-menu'></div>";
        const suggestionArea = "<textarea id='autocomplete-suggestion' autocomplete='off' disabled></textarea>";

        // Insert UI into DOM.
        chatInput.parentElement.insertAdjacentHTML("beforebegin", menuContainer);
        chatInput.insertAdjacentHTML("afterend", suggestionArea);

        // Store important elements locally.
        this.container = chatInput.parentElement.previousElementSibling;
        this.chatInput = chatInput;
        this.suggestionArea = chatInput.nextElementSibling;

        // Activate listeners.
        chatInput.addEventListener("input", event => this.open(event.currentTarget.value));
        chatInput.addEventListener("keydown", event => this.focus(event), true); // Use capture to run first.
        this.container.addEventListener("keydown", event => this.navigate(event));
        this.container.addEventListener("click", event => {
            if (event.target.tagName === "A" || !event.target.closest("li")?.matches(".command")) return;
            this.select(event.target.dataset.command);
        });

        this.maxEntries = game.settings.get("_chatcommands", "maxEntries");
        this.showFooter = game.settings.get("_chatcommands", "displayFooter");
    }

    /**
     * Initialize the hook to attach autocomplete menus to chat message inputs.
     * @package
     */
    static initialize() {
        Hooks.on('renderChatLog', (app, html) => {
            if (!game.settings.get("_chatcommands", "autocomplete")) return;
            app.autocompleteMenu = new AutocompleteMenu(html[0].querySelector("#chat-message"));
        });
    }

    /**
     * Prevents all propagation for the given event so that no other handlers are called.
     * @param {Event} event The event to stop.
     * @package
     */
    static stopEvent(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
    }

    /**
     * Checks if the input of the target text area contains a command that can be autocompleted. If so, the menu is
     * populated and displayed above the input.
     * @param {string} text The text to complete.
     */
    open(text) {
        if (!game.chatCommands.isCommand(text)) return this.close(); // Input is not a command.

        let entries;
        const commandInfo = game.chatCommands.parseCommand(text);
        if (!commandInfo || (commandInfo.alias.length > 1 && text.length === commandInfo.alias.length)) {
            // Could not find command or delimiter, autocomplete the command itself.
            this.currentCommand = null;
            if (text.includes(' ')) return this.close();
            entries = this._createCommandList(text);
        } else {
            // Found a command, autocomplete it with its parameters.
            this.currentCommand = commandInfo.command;
            if (!this.currentCommand.canInvoke()) return this.close();
            entries = this._createCommandEntries(commandInfo.alias, commandInfo.parameters);
        }

        if (!entries.length) return this.close(); // No entries available.
        if (!this.visible) {
            // Display the menu if it was not created yet.
            this.visible = true;
            $(window).on("click.outside-autocomplete-menu", event => {
                if (!event.target.closest("#autocomplete-menu")) this.close();
            });

            const maxHeight = this.container.parentElement.querySelector("#chat-log")?.offsetHeight ?? 900;
            this.container.innerHTML = `<nav id="context-menu" class="expand-up" style="max-height: ${maxHeight}px">
                <ol class="context-items"></ol></nav>`;
        }

        this.display(entries);
    }

    /**
     * Replaces the current menu entries with the given array of elements. Elements exceeding the @see maxEntries limit
     * are omitted and an overflow entry is displayed instead.
     * @param {HTMLElement[]} entries The menu entries to display.
     * @param {boolean=} append Indicates whether the entries will be appended to the menu (instead of replacing
     *  existing entries). Defaults to false.
     * @param {boolean=} done Indicates whether the menu is complete. When false, a loading indicator will be
     *  displayed. Defaults to true.
     */
    display(entries, append = false, done = true) {
        if (!this.visible) return;

        const list = this.container.querySelector("ol.context-items");
        if (!list) return;

        // Add or remove loading indicator.
        let previousLength = append ? list.children.length : 0;
        if (!previousLength && !done) entries.push(game.chatCommands.createLoadingElement());
        if (previousLength && list.lastElementChild.matches("li.loading")) {
            previousLength--;
            if (done) list.lastElementChild.remove();
        }
        if (!entries.length) return;

        // Clip the list to the maximum amount of entries.
        const newLength = previousLength + entries.length;
        if (newLength > this.maxEntries) {
            const overflowEntry = game.chatCommands.createOverflowElement();
            if (previousLength > this.maxEntries) {
                // The list already had more entries before appending.
                list.firstElementChild.replaceWith(overflowEntry);
                return;
            } else {
                // The list now has more entries.
                entries.length = Math.max(0, this.maxEntries - previousLength);
                entries.unshift(overflowEntry);
            }
        }

        // Insert the new entries into the DOM.
        if (append) list.prepend(...entries);
        else list.replaceChildren(...entries);

        // Suggest the only command or clear the suggestion.
        const commands = list.querySelectorAll("li.command");
        if (commands.length === 1 && !this.suggestionArea.value) this.suggest(commands[0].dataset.command);
    }

    /**
     * Handles focus changes between the text area and the menu.
     * @param {Event} event The input event that triggered the action.
     */
    focus(event) {
        // Allow applying a suggestion even when the menu is not visible.
        if (event.key === "Tab") {
            let suggestedValue = this.suggestionArea.value;
            if (suggestedValue) {
                // Apply suggested command.
                if (suggestedValue.startsWith(this.chatInput.value + "\n")) {
                    // Trim the suggestion if it was placed on a new line.
                    suggestedValue = suggestedValue.substring(this.chatInput.value.length + 1);
                }
                this.select(suggestedValue);
                return this.constructor.stopEvent(event);
            }

            if (this.visible) {
                // Nothing was applied, close the menu.
                this.close();
                return this.constructor.stopEvent(event);
            }

            return; // Let other listeners handle the event.
        }

        if (ignoredKeys.has(event.key)) return;
        this.resetSuggestion();
        if (!this.visible) return;
        switch (event.key) {
            case "ArrowUp":
                // Select the last focusable entry.
                this._focusPreviousEntry(this.container.querySelector("ol.context-items").lastElementChild);
                return this.constructor.stopEvent(event);
            case "ArrowDown":
                // Select the first focusable entry.
                this._focusNextEntry(this.container.querySelector("ol.context-items").firstElementChild);
                return this.constructor.stopEvent(event);
            case "Escape":
                this.constructor.stopEvent(event);
            case "Enter":
                this.close();
        }
    }

    /**
     * Returns the focus from the menu to the text area.
     */
    blur() {
        this.chatInput.focus();
        this.resetSuggestion();
    }

    /**
     * Handles focus changes within the menu.
     * @param {Event} event The input event that triggered the action.
     */
    navigate(event) {
        let entry = event.target;
        if (!this.visible || !entry.matches("li.context-item")) return;
        switch (event.key) {
            case "ArrowUp":
                // Select the previous focusable entry.
                this._focusPreviousEntry(entry.previousElementSibling);
                return this.constructor.stopEvent(event);
            case "ArrowDown":
                // Select the next focusable entry.
                this._focusNextEntry(entry.nextElementSibling);
                return this.constructor.stopEvent(event);
            case "Tab":
            case "Enter":
                // Apply the currently selected command.
                this.select(entry.dataset.command);
                return this.constructor.stopEvent(event);
            case "Escape":
                // Abort the autocomplete.
                this.blur();
                this.close();
                return this.constructor.stopEvent(event);
        }
    }

    /**
     * Closes the menu and resets its state.
     */
    close() {
        if (!this.visible) return;
        this.visible = false;
        $(window).off("click.outside-autocomplete-menu");
        this.container.replaceChildren();
        this.currentCommand?.abortAutocomplete();
    }

    /**
     * Displays the given command in the suggestion area.
     * @param {string} command The string containing the command to suggest.
     */
    suggest(command) {
        if (!command) return this.resetSuggestion();
        const currentValue = this.chatInput.value;
        if (!currentValue || command.startsWith(currentValue)) {
            // Direct match, display behind the current text.
            this.suggestionArea.value = command;
        } else {
            // Approximate match, display below the current text.
            this.suggestionArea.value = currentValue + "\n" + command;
        }
    }

    /**
     * Applies the given command to the chat message input and closes the menu.
     * @param {string} command The command to select.
     */
    select(command) {
        if (!command) return;
        this.resetSuggestion();
        this.chatInput.value = command;
        this.chatInput.focus();
        
        if (this.currentCommand && (this.currentCommand.closeOnComplete ?? true)) this.close();
        else this.open(command);
    }

    /**
     * Clears the suggested command.
     */
    resetSuggestion() {
        this.suggestionArea.value = "";
    }

    /**
     * Searches the registered commands using the given text and creates a list element for each match.
     * @param {string} text The text to search within command names.
     * @returns {HTMLCollection} The collection of command entries to display.
     * @private
     */
    _createCommandList(text) {
        text = text.toLowerCase(); // Case insensitive matching.
        if (!game.chatCommands.isCommand(text)) return [];
        const firstChar = text[0];
        text = text.substring(1);

        const matchedCommands = new Set();
        const matches = [];
        for (let [name, command] of game.chatCommands.commands.entries()) {
            if (name[0] !== firstChar) continue;
            const startIndex = name.toLowerCase().indexOf(text);
            if (startIndex === -1 || matchedCommands.has(command.name) || !command.canInvoke()) continue;

            // Created highlighted command name entry.
            const content = command.getDescription(name, this.showFooter);

            matchedCommands.add(command.name);
            matches.push(game.chatCommands.createCommandElement(name + " ", content));
        }

        if (!matches.length && this.visible) {
            matches.push(game.chatCommands.createInfoElement(
                `<p class="notes">${game.i18n.localize("_chatcommands.noEntries")}</p>`));
        }
        return matches;
    }

    /**
     * Creates HTML list elements using the output of the given command's autocomplete handler.
     * @param {string} command The command to complete.
     * @param {string} parameters The current parameters of the command.
     * @returns {HTMLCollection} The collection of entries to display.
     * @private
     */
    _createCommandEntries(command, parameters) {
        if (!this.currentCommand) return [];

        const result = this.currentCommand.autocomplete(this, command, parameters, this.maxEntries);
        if (result) return result;
        if (this.visible) {
            return [game.chatCommands.createInfoElement(this.currentCommand.getDescription(command, this.showFooter))];
        }
        return [];
    }

    /**
     * Attempts to focus the given entry or any entry before it. If no focusable entry is found, the menu is unfocused.
     * @param {HTMLElement} entry The first entry to attempt focusing.
     * @private
     */
    _focusPreviousEntry(entry) {
        while (entry) {
            if (this._tryFocusEntry(entry)) return;
            entry = entry.previousElementSibling;
        }

        this.blur();
    }

    /**
     * Attempts to focus the given entry or any entry after it. If no focusable entry is found, the menu is unfocused.
     * @param {HTMLElement} entry The first entry to attempt focusing.
     * @private
     */
    _focusNextEntry(entry) {
        while (entry) {
            if (this._tryFocusEntry(entry)) return;
            entry = entry.nextElementSibling;
        }

        this.blur();
    }

    /**
     * Attempts to focus the given entry and returns whether it can be focused.
     * @param {HTMLElement} entry The entry to focus.
     * @returns {boolean} True if the entry was focused, false otherwise.
     * @private
     */
    _tryFocusEntry(entry) {
        if (entry.tabIndex > -1) {
            entry.focus();
            this.suggest(entry.dataset.command);
            return true;
        }

        return false;
    }
}

export default AutocompleteMenu;