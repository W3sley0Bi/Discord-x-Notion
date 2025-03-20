"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const discord_interactions_1 = require("discord-interactions");
const interactions_1 = require("./modules/interactions");
// Create an express app
const app = (0, express_1.default)();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
if (process.env.PUBLIC_KEY) {
    //@ts-ignore
    app.post('/interactions', (0, discord_interactions_1.verifyKeyMiddleware)(process.env.PUBLIC_KEY), (req, res) => (0, interactions_1.interactions)(req, res));
    app.listen(PORT, () => {
        console.log('Listening on port', PORT);
    });
}
