"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebhook = void 0;
const axios_1 = __importDefault(require("axios"));
const express_1 = require("express");
//@ts-ignore
const createWebhook = async (name, channel_id) => {
    try {
        const response = await axios_1.default.post(`https://discord.com/api/v10/channels/${channel_id}/webhooks`, {
            name: "Notion Board",
            // avatar: webhookAvatar, // Optional
        }, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        const webhook = response.data;
        console.log('Webhook created:', webhook);
        // res.status(201).send({
        //   message: 'Webhook created successfully!',
        //   webhookUrl: `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`,
        // });
        return webhook;
    }
    catch (error) {
        //@ts-ignore
        console.error('Error creating webhook:', error.response?.data || error.message);
        express_1.response.status(500).send('Failed to create webhook.');
    }
};
exports.createWebhook = createWebhook;
