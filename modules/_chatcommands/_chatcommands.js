import AutocompleteMenu from "./scripts/autocompleteMenu.mjs";
import ChatCommand from "./scripts/chatCommand.mjs";
import ChatCommands from "./scripts/chatCommands.mjs";
import { registerCoreCommands } from "./scripts/coreCommands.mjs";
import { initializeSettings } from "./scripts/settings.mjs";

window._chatcommands = { ChatCommand: ChatCommand }

Hooks.once("init", function () {
    initializeSettings();
    ChatCommands.initialize();
    AutocompleteMenu.initialize();
});

Hooks.once("setup", function () {
    registerCoreCommands();
});

Hooks.once("ready", function () {
    Hooks.callAll("chatCommandsReady", game.chatCommands);
});