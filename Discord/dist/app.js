"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const discord_interactions_1 = require("discord-interactions");
const utils_js_1 = require("./utils.js");
const webhook_js_1 = require("./modules/webhook.js");
const crudDb_js_1 = require("./modules/crudDb.js");
// Create an express app
const app = (0, express_1.default)();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};
/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
if (process.env.PUBLIC_KEY) {
    //@ts-ignore
    app.post('/interactions', (0, discord_interactions_1.verifyKeyMiddleware)(process.env.PUBLIC_KEY), async function (req, res) {
        const { type, data, channel_id } = req.body;
        /**
         * Handle verification requests
         */
        if (type === discord_interactions_1.InteractionType.PING) {
            return res.send({ type: discord_interactions_1.InteractionResponseType.PONG });
        }
        /**
         * Handle Autocomplete requests (type 4)
         */
        if (type === 4) { // Discord's autocomplete interaction type
            if (data.name === 'new_issue') {
                try {
                    // Fetch latest choices dynamically from Notion
                    const choices = await (0, crudDb_js_1.fetchDBs)();
                    console.log('Fetched choices:', choices);
                    //@ts-ignore
                    const focusedValue = data.options.find(opt => opt.focused)?.value || '';
                    // Filter results based on user input (optional)
                    const filteredChoices = choices
                        .filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()))
                        .slice(0, 25);
                    return res.json({
                        type: 8, // nees to be 8 !!!
                        data: { choices: filteredChoices }
                    });
                }
                catch (error) {
                    console.error('❌ Error fetching Notion databases:', error);
                    return res.sendStatus(500);
                }
            }
        }
        /**
         * Handle Slash Command requests (type 2)
         */
        if (type === discord_interactions_1.InteractionType.APPLICATION_COMMAND) {
            const { name } = data;
            if (name === 'create-notion-link') {
                const webhook = await (0, webhook_js_1.createWebhook)(name, channel_id);
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `✅ Webhook created! [Click Here](https://discord.com/api/webhooks/${webhook.id}/${webhook.token})`
                    },
                });
            }
            if (name === 'new_issue') {
                //@ts-ignore
                const databaseId = data.options?.find(opt => opt.name === 'database')?.value;
                // TODO Post the new ticket in the selected db
                // const options = {
                //   method: 'PATCH',
                //   headers: {accept: 'application/json', 'content-type': 'application/json'}
                // };
                // fetch('https://api.notion.com/v1/databases/database_id', options)
                //   .then(res => res.json())
                //   .then(res => console.log(res))
                //   .catch(err => console.error(err));
                console.log(data);
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: '✅ Issue creation started! Please select a database.',
                    },
                });
            }
            if (name === 'test') {
                console.log('Test command received', type);
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Hello world! ${(0, utils_js_1.getRandomEmoji)()}`,
                    },
                });
            }
            console.error(`❌ Unknown command: ${name}`);
            return res.status(400).json({ error: 'unknown command' });
        }
        console.error('❌ Unknown interaction type', type);
        return res.status(400).json({ error: 'unknown interaction type' });
    });
    app.listen(PORT, () => {
        console.log('Listening on port', PORT);
    });
}
