"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const discord_interactions_1 = require("discord-interactions");
const utils_js_1 = require("./utils.js");
const game_js_1 = require("./game.js");
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
app.post('/interactions', (0, discord_interactions_1.verifyKeyMiddleware)(process.env.PUBLIC_KEY), function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Interaction type and data
        const { type, id, data } = req.body;
        /**
         * Handle verification requests
         */
        if (type === discord_interactions_1.InteractionType.PING) {
            return res.send({ type: discord_interactions_1.InteractionResponseType.PONG });
        }
        /**
         * Handle slash command requests
         * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
         */
        if (type === discord_interactions_1.InteractionType.APPLICATION_COMMAND) {
            const { name } = data;
            // "test" command
            if (name === 'test') {
                // Send a message into the channel where command was triggered from
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        // Fetches a random emoji to send from a helper function
                        content: `hello world ${(0, utils_js_1.getRandomEmoji)()}`,
                    },
                });
            }
            // "challenge" command
            if (name === 'challenge' && id) {
                // Interaction context
                const context = req.body.context;
                // User ID is in user field for (G)DMs, and member for servers
                const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
                // User's object choice
                const objectName = req.body.data.options[0].value;
                // Create active game using message ID as the game ID
                activeGames[id] = {
                    id: userId,
                    objectName,
                };
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        // Fetches a random emoji to send from a helper function
                        content: `Rock papers scissors challenge from <@${userId}>`,
                        components: [
                            {
                                type: discord_interactions_1.MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: discord_interactions_1.MessageComponentTypes.BUTTON,
                                        // Append the game ID to use later on
                                        custom_id: `accept_button_${req.body.id}`,
                                        label: 'Accept',
                                        style: discord_interactions_1.ButtonStyleTypes.PRIMARY,
                                    },
                                ],
                            },
                        ],
                    },
                });
            }
            console.error(`unknown command: ${name}`);
            return res.status(400).json({ error: 'unknown command' });
        }
        /**
         * Handle requests from interactive components
         * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
         */
        if (type === discord_interactions_1.InteractionType.MESSAGE_COMPONENT) {
            // custom_id set in payload when sending message component
            const componentId = data.custom_id;
            if (componentId.startsWith('accept_button_')) {
                // get the associated game ID
                const gameId = componentId.replace('accept_button_', '');
                // Delete message with token in request body
                const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
                try {
                    yield res.send({
                        type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                        data: {
                            content: 'What is your object of choice?',
                            // Indicates it'll be an ephemeral message
                            flags: discord_interactions_1.InteractionResponseFlags.EPHEMERAL,
                            components: [
                                {
                                    type: discord_interactions_1.MessageComponentTypes.ACTION_ROW,
                                    components: [
                                        {
                                            type: discord_interactions_1.MessageComponentTypes.STRING_SELECT,
                                            // Append game ID
                                            custom_id: `select_choice_${gameId}`,
                                            options: (0, game_js_1.getShuffledOptions)(),
                                        },
                                    ],
                                },
                            ],
                        },
                    });
                    // Delete previous message
                    yield (0, utils_js_1.DiscordRequest)(endpoint, { method: 'DELETE' });
                }
                catch (err) {
                    console.error('Error sending message:', err);
                }
            }
            else if (componentId.startsWith('select_choice_')) {
                // get the associated game ID
                const gameId = componentId.replace('select_choice_', '');
                if (activeGames[gameId]) {
                    // Interaction context
                    const context = req.body.context;
                    // Get user ID and object choice for responding user
                    // User ID is in user field for (G)DMs, and member for servers
                    const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
                    const objectName = data.values[0];
                    // Calculate result from helper function
                    const resultStr = (0, game_js_1.getResult)(activeGames[gameId], {
                        id: userId,
                        objectName,
                    });
                    // Remove game from storage
                    delete activeGames[gameId];
                    // Update message with token in request body
                    const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
                    try {
                        // Send results
                        yield res.send({
                            type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: { content: resultStr },
                        });
                        // Update ephemeral message
                        yield (0, utils_js_1.DiscordRequest)(endpoint, {
                            method: 'PATCH',
                            body: {
                                content: 'Nice choice ' + (0, utils_js_1.getRandomEmoji)(),
                                components: [],
                            },
                        });
                    }
                    catch (err) {
                        console.error('Error sending message:', err);
                    }
                }
            }
            return;
        }
        console.error('unknown interaction type', type);
        return res.status(400).json({ error: 'unknown interaction type' });
    });
});
app.post(`/channels/{channel.id}/webhooks`, (0, discord_interactions_1.verifyKeyMiddleware)(process.env.PUBLIC_KEY), function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
    });
});
app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
