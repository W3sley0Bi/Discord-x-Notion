"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactions = interactions;
const discord_interactions_1 = require("discord-interactions");
const utils_1 = require("../utils");
const newIssue_1 = require("../commands/newIssue");
//@ts-ignore
async function interactions(req, res) {
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
        switch (data.name) {
            case 'new_issue':
                return (0, newIssue_1.SelectDB)(data, res);
            default:
                console.error('❌ Unknown command:', data.name);
                return res.status(400).json({ error: 'unknown command' });
        }
    }
    /**
     * Handle Slash Command requests (type 2)
     */
    if (type === discord_interactions_1.InteractionType.APPLICATION_COMMAND) {
        const { name } = data;
        switch (name) {
            case 'new-issue':
                return await (0, newIssue_1.CreateIssue)(data, res);
            case 'create-notion-link':
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `✅ Link created! Paste this link into Notion DB automation:\n\`\`\`\n${process.env.HOST}/events/${channel_id}\n\`\`\``
                    }
                });
            case 'test':
                console.log('Test command received', type, "Channell ID:", channel_id);
                ;
                return res.send({
                    type: discord_interactions_1.InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: `Hello world! ${(0, utils_1.getRandomEmoji)()}`,
                    },
                });
            default:
                console.error('❌ Unknown command:', name);
                return res.status(400).json({ error: 'unknown command' });
        }
    }
    console.error('❌ Unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
}
