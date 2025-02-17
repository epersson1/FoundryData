import {i18n, log, MonksTokenBar, setting} from "../monks-tokenbar.js";
import { divideXpOptions } from "../settings.js";

export class AssignXPApp extends Application {
    constructor(entities, options = {}) {
        super(options);

        this.customXP = false;

        this.reason = options?.reason || (entities != undefined && entities instanceof Combat ? i18n("MonksTokenBar.CombatExperience") : "");
        this.dividexp = options?.dividexp ? options?.dividexp : setting("divide-xp");
        this.divideXpOptions = divideXpOptions

        this.monsters = [];
        let collectMonsters = true;
        if (entities != undefined) {
            if (entities instanceof Combat) {
                entities = entities.combatants.map(c => c.token);
            } else if (!(entities instanceof Array)) {
                entities = [entities];
            }
        } else {
            if (canvas.tokens.controlled.length > 0) {
                entities = canvas.tokens.controlled;
            } else {
                entities = canvas.tokens.placeables;
                collectMonsters = false;
            }
        }

        this.actors = [];
        this.monsters = [];

        let npcShareXp = setting("npc-xp-sharing");

        for (let entity of entities) {
            if (entity) {
                if (!entity.actor)
                    return;
                let actor = entity.actor.isPolymorphed ? game.actors.find(a => a.id == entity.actor.getFlag(game.system.id, 'originalActor')) : entity.actor;
                let token = entity.document ? entity.document : entity;
                if (token.disposition == 1 && token.actorLink && ((actor.hasPlayerOwner && (actor.type == 'character' || actor?.type == 'Player Character')) || (npcShareXp && actor.type == 'npc'))) {
                    this.actors.push({ actor: actor, xp: 0 });
                } else if (token.disposition != 1 && !actor.hasPlayerOwner && collectMonsters) {
                    this.monsters.push({ actor: actor, defeated: AssignXPApp.isDefeated(actor) });
                }
            }
        }
        this.actors = this.actors.filter((a, index, self) => {
            if (!a) return false;
            return self.findIndex((i) => { return i?.actor.id == a.actor.id }) === index;
        });

        this.initialActors = foundry.utils.duplicate(this.actors);

        this.changeXP(options?.xp);
    }

    static isDefeated(actor) {
        return (actor && (actor.combatant && actor.combatant.defeated) || actor.statuses.has(CONFIG.specialStatusEffects.DEFEATED));
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "assignexperience",
            title: i18n("MonksTokenBar.AssignXP"),
            template: "./modules/monks-tokenbar/templates/assignxp.html",
            tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "players" }],
            width: 400,
            height: 'auto',
            popOut: true,
            dragDrop: [{ dropSelector: ".dialog-content" }],
            scrollY: [".tab.monsters .tab-inner", ".tab.players .tab-inner"]
        });
    }

    getData(options) {
        return {
            actors: this.actors,
            monsters: this.monsters,
            xp: this.xp,
            dividexp: this.dividexp,
            reason: this.reason,
            divideXpOptions: this.divideXpOptions
        };
    }

    recalculateXP() {
        this.customXP = false;
        this.changeXP();
        this.render(true);
    }

    changeXP(xp) {
        if (xp !== undefined)
            this.xp = xp;
        else if (!this.customXP) {
            this.xp = MonksTokenBar.system.calcXP(this.actors, this.monsters);
        }

        let sortedByLevel = this.actors.sort(function (a, b) {
            const aXP = MonksTokenBar.system.getXP(a.actor);
            const bXP = MonksTokenBar.system.getXP(b.actor);
            
            let value = (MonksTokenBar.system.getLevel(a.actor) + ((aXP?.value ?? 0) / (aXP?.max ?? 1))) - (MonksTokenBar.system.getLevel(b.actor) + ((bXP?.value ?? 0) / (bXP?.max ?? 1)));
            return value;
        });

        sortedByLevel.forEach(x => x.xp = 0);
        switch (this.dividexp) {
            case 'no-split':
                sortedByLevel.forEach(x => x.xp =  this.xp);
                break;
            case 'equal-split':
                sortedByLevel.forEach(x => x.xp = parseInt(this.xp / sortedByLevel.length));
                break;
            case 'robin-hood-split':
                // Take from the rich and give to the poor...
                distributeXp(sortedByLevel, parseInt(this.xp / sortedByLevel.length), 0.5, 1.5);
                break;
            case 'nottingham-split':
                // Take from the poor and give to the rich...
                distributeXp(sortedByLevel, parseInt(this.xp / sortedByLevel.length), 1.5, 0.5);
                break;
        }

        /**
         * Splits the xp among the actors according to the following algorithm: iterate from lowest, compare self with highest unprocessed, if same level just set xp, if different level use appropriate multiplier for poor/rich actor.
         * @param actors {Array}
         * @param charxp {number}
         * @param higherXpMultiplier {number}
         * @param lowerXpMultiplier {number}
         */
        function distributeXp(actors, charxp, higherXpMultiplier, lowerXpMultiplier) {
            const actors_reversed = actors.slice().reverse();
            for (let i = 0; i < actors.length / 2; i++) {
                let poor = actors[i];
                let rich = actors_reversed[i];
                if (MonksTokenBar.system.getLevel(poor.actor) !== MonksTokenBar.system.getLevel(rich.actor)) {
                    rich.xp += Math.ceil(charxp * higherXpMultiplier);
                    poor.xp += Math.floor(charxp * lowerXpMultiplier);
                } else if (poor !== rich) {
                    poor.xp += charxp;
                    rich.xp += charxp;
                } else {
                    poor.xp += charxp;
                }
            }
        }

    }

    addToken(tokens, collection = "actors") {
        if (!$.isArray(tokens))
            tokens = [tokens];

        let failed = [];
        tokens = tokens.filter(t => {
            if (t.actor == undefined)
                return false;
            //don't add this token a second time
            if (this.actors.some(e => e.actor._id == t.actor._id) || this.monsters.some(e => e.actor._id == t.actor._id))
                return false;

            return true;
        });

        if (failed.length > 0)
            ui.notifications.warn(i18n("MonksTokenBar.TokenNoActorAttrs"));

        if (tokens.length > 0)
            this[collection] = this[collection].concat(tokens.map(t => {
                let actor = t.actor;
                actor = (actor.isPolymorphed ? game.actors.find(a => a.id == actor.getFlag(game.system.id, 'originalActor')) : actor);
                return { actor: actor, defeated: AssignXPApp.isDefeated(actor) }
            }));

        this.changeXP();
        this.render(true);
    }

    removeActor(id) {
        let idx = this.actors.findIndex(a => a.actor._id === id);
        if (idx > -1) {
            this.actors.splice(idx, 1);
        }
        idx = this.monsters.findIndex(a => a.actor._id === id);
        if (idx > -1) {
            this.monsters.splice(idx, 1);
        }
        $(`li[data-item-id="${id}"]`, this.element).remove();
        this.changeXP();
        this.render(true);
    }

    activateListeners(html) {
        super.activateListeners(html);
        var that = this;

        $('.items-header .item-controls', html).click($.proxy(this.changeTokens, this));

        $('.item-list .item', html).each(function (elem) {
            $('.item-delete', this).click($.proxy(that.removeActor, that, this.dataset.itemId));
        });

        $('.dialog-button.assign', html).on("click", this.assign.bind(this));
        $('.dialog-button.auto-assign', html).on("click", this.autoassign.bind(this));

        $('.recalculate', html).on("click", this.recalculateXP.bind(this));

        $('#dividexp', html).change(function () {
            that.dividexp = $(this).find('option:selected').val();
            that.changeXP.call(that);
            that.render(true);
        });

        $('#assign-xp-value', html).blur(function () {
            that.xp = parseInt($(this).val() || '0');
            if (isNaN(that.xp))
                that.xp = 0;
            that.customXP = true;
            that.changeXP.call(that, that.xp);
            that.render(true);
        });

        $('.charxp', html).blur(this.adjustCharXP.bind(this));
        //$('.item-active', html).change(this.activateMonster.bind(this));
    };

    adjustCharXP(event) {
        let id = $(event.currentTarget).closest(".item")[0].dataset["itemId"];
        let actor = this.actors.find(a => a.actor._id == id);
        if (actor)
            actor.xp = parseInt($(event.currentTarget).val())
        this.render(true);
    }

    /*
    activateMonster(event) {
        let id = $(event.currentTarget).closest(".item")[0].dataset["itemId"];
        let monster = this.monsters.find(m => m.actor._id == id);
        if (monster)
            monster.active = $(event.currentTarget).prop("checked");

        this.xp = MonksTokenBar.system.calcXP(this.actors, this.monsters.filter(m => m.active));
        this.changeXP.call(this, this.xp);

        this.render(true);
    }
    */

    changeTokens(e) {
        let type = e.target.dataset.type;
        switch (type) {
            case 'player':
                this.actors = this.actors.concat(game.users.filter(u => {
                    return !u.isGM && u.character && !this.actors.some(e => e.actor._id == u.character.id)
                }).map(u => {
                    let actor = u.character;
                    actor = (actor.isPolymorphed ? game.actors.find(a => a.id == actor.getFlag(game.system.id, 'originalActor')) : actor);
                    return {
                        actor: actor,
                        xp: 0
                    }
                }));
                this.changeXP();
                this.render(true);
                break;
            case 'initial':
                this.actors = foundry.utils.duplicate(this.initialActors);
                this.changeXP();
                this.render(true);
                break;
            case 'last':
                if (AssignXP.lastTokens) {
                    this.actors = foundry.utils.duplicate(AssignXP.lastTokens);
                    this.changeXP();
                    this.render(true);
                }
                break;
            case 'actor': //toggle the select actor button
                let tokens = canvas.tokens.controlled.filter(t => t.actor != undefined && t.document.isLinked);
                if (tokens.length == 0)
                    ui.notifications.error('No tokens are currently selected');
                else {
                    this.addToken(tokens);
                }
                break;
            case 'monster':
                let monsters = canvas.tokens.controlled.filter(t => t.actor != undefined);
                if (monsters.length == 0)
                    ui.notifications.error('No tokens are currently selected');
                else {
                    this.addToken(monsters, "monsters");
                }
                break;
            case 'clear':
                this.actors = [];
                this.render(true);
                break;
            case 'disable':
                this.monsters = this.monsters.map(m => { m.active = false; return m; });
                this.render(true);
                break;
        }
    }

    async _onDrop(event) {
        // Try to extract the data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        }
        catch (err) {
            return false;
        }

        // Identify the drop target
        if (data.type == "Actor") {
            let actor = await fromUuid(data.uuid);
            actor = (actor.isPolymorphed ? game.actors.find(a => a.id == actor.getFlag(game.system.id, 'originalActor')) : actor);

            this.actors.push({
                actor: actor,
                xp: 0
            });
            this.changeXP();
            this.render(true);
        }
    }

    async assign() {
        let msg = null;
        let chatactors = this.actors
            .map(a => {
                return {
                    id: a.actor._id,
                    //actor: a.actor,
                    icon: a.actor.img,
                    name: a.actor.name,
                    xp: a.xp,
                    assigned: false
                }
            });

        if (chatactors.length > 0) {
            AssignXP.lastTokens = this.actors;

            let requestdata = {
                xp: this.xp,
                reason: $('#assign-xp-reason', this.element).val(),
                actors: chatactors
            };
            const html = await renderTemplate("./modules/monks-tokenbar/templates/assignxpchatmsg.html", requestdata);

            let chatData = {
                user: game.user.id,
                content: html
            };

            foundry.utils.setProperty(chatData, "flags.monks-tokenbar", requestdata);
            msg = await ChatMessage.create(chatData, {});
            this.close();
        } else
            ui.notifications.warn(i18n("MonksTokenBar.RequestNoneActorSelected"));

        return msg;
    }

    async autoassign() {
        let msg = await this.assign();
        if (msg) AssignXP.onAssignAllXP(msg);
        return msg;
    }
}

export class AssignXP {
    static lastTokens;
    static async onAssignXP(actorid, message, e) {
        if (game.user.isGM) {
            let actors = JSON.parse(JSON.stringify(message.getFlag('monks-tokenbar', 'actors')));
            let msgactor = actors.find(a => { return a.id === actorid; });

            if (!msgactor.assigned) {
                MonksTokenBar.system.assignXP(msgactor);
                msgactor.assigned = true;
            }
            await message.setFlag('monks-tokenbar', 'actors', actors);
        } else {
            if (e) $(e.target).prop("disabled", true);

            if (!game.users.find(u => u.isGM))
                return ui.notifications.warn("A GM needs to be logged in to receive the XP");
            MonksTokenBar.emit('assignxp', { actorid: actorid, msgid: message.id });
        }
    }

    static async onAssignAllXP(message) {
        if (game.user.isGM) {
            let actors = message.getFlag('monks-tokenbar', 'actors');
            for (let i = 0; i < actors.length; i++) {
                let msgactor = actors[i];
                if (!msgactor.assigned) {
                    await AssignXP.onAssignXP(msgactor.id, message);
                }
            };
        }
    }
}

Hooks.on("renderChatMessage", (message, html, data) => {
    const assignCard = html.find(".monks-tokenbar.assignxp");
    if (assignCard.length !== 0) {
        if (!game.user.isGM)
            html.find(".gm-only").remove();
        if (game.user.isGM)
            html.find(".player-only").remove();

        $('.assign-all', html).click($.proxy(AssignXP.onAssignAllXP, AssignXP, message));

        let actors = message.getFlag('monks-tokenbar', 'actors');

        let items = $('.item', html);
        for (let i = 0; i < items.length; i++) {
            var item = items[i];
            let actorId = $(item).attr('data-item-id');
            let actorData = actors.find(a => { return a.id == actorId; });
            let actor = game.actors.get(actorId);

            let assign = !actorData.assigned && (game.user.isGM || actor.isOwner);
            $('.add-xp', item).toggle(assign).click($.proxy(AssignXP.onAssignXP, this, actorId, message));
        }
    }
});