"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const discord_interactions_1 = require("discord-interactions");
const interactions_1 = require("./modules/interactions");
const webhook_1 = require("./modules/webhook");
const app = (0, express_1.default)();
// TODO: use this middleweare if you use the enchanced webhoook 
// app.use(express.json());
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
if (process.env.PUBLIC_KEY) {
    app.post('/interactions', (0, discord_interactions_1.verifyKeyMiddleware)(process.env.PUBLIC_KEY), (req, res) => (0, interactions_1.interactions)(req, res));
    /**
     * Events endpoint URL where Discord will send HTTP requests
     */
    app.post('/events/:channelId', (req, res) => (0, webhook_1.notionDBAutomationWebHook)(req, res));
}
app.listen(PORT, () => { console.log('Listening on port', PORT); });
