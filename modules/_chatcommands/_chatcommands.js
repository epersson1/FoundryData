import AutocompleteMenu from "./scripts/autocompleteMenu.mjs";
import ChatCommand from "./scripts/chatCommand.mjs";
import ChatCommands from "./scripts/chatCommands.mjs";
import { registerCoreCommands } from "./scripts/coreCommands.mjs";
import { initializeSettings } from "./scripts/settings.mjs";

window._chatcommands = { ChatCommand: ChatCommand }

Hooks.once("init", function () {
    initializeSettings();
    createChatInputMoveHook();
    ChatCommands.initialize();
    AutocompleteMenu.initialize();
});

Hooks.once("setup", function () {
    registerCoreCommands();
});

Hooks.once("ready", function () {
    Hooks.callAll("chatCommandsReady", game.chatCommands);
});

/**
 * Wraps methods to call a hook when the chat message input is moved.
 */
function createChatInputMoveHook() {
    if (game.modules.get("lib-wrapper")?.active) {
        window.libWrapper.register(
            "_chatcommands",
            "CONFIG.ui.chat.prototype._toggleNotifications",
            function (wrapped, options) {
                const result = wrapped(options);
                callChatInputMoveHook();
                return result;
            },
            "WRAPPER");
    } else {
        const originalToggleNotifications = CONFIG.ui.chat.prototype._toggleNotifications;
        CONFIG.ui.chat.prototype._toggleNotifications = function (options) {
            const result = originalToggleNotifications.call(this, options);
            callChatInputMoveHook();
            return result;
        }
    }
}

/**
 * Calls a hook when the chat message input was moved.
 * The hook is also called when the parent didn't change because the element may have moved within it.
 */
function callChatInputMoveHook() {
    const input = document.getElementById("chat-message");
    Hooks.callAll("moveChatInput", input);
}