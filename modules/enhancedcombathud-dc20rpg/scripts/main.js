import {initConfig} from "./config.js";
import { registerSettings } from "./settings.js";

export const MODULE_ID = "enhancedcombathud-dc20rpg";

Hooks.on("setup", async () => {
    registerSettings();
    await initConfig();
});

Hooks.once('init', async function() {
    //registerHandlebars()
});


