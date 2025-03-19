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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordRequest = DiscordRequest;
exports.InstallGlobalCommands = InstallGlobalCommands;
exports.getRandomEmoji = getRandomEmoji;
exports.capitalize = capitalize;
require("dotenv/config");
function DiscordRequest(endpoint, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // append endpoint to root API URL
        const url = 'https://discord.com/api/v10/' + endpoint;
        // Stringify payloads
        if (options.body)
            options.body = JSON.stringify(options.body);
        // Use fetch to make requests
        const res = yield fetch(url, Object.assign({ headers: {
                Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json; charset=UTF-8',
                'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
            } }, options));
        // throw API errors
        if (!res.ok) {
            const data = yield res.json();
            console.log(res.status);
            throw new Error(JSON.stringify(data));
        }
        // return original response
        return res;
    });
}
function InstallGlobalCommands(appId, commands) {
    return __awaiter(this, void 0, void 0, function* () {
        // API endpoint to overwrite global commands
        const endpoint = `applications/${appId}/commands`;
        try {
            // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
            yield DiscordRequest(endpoint, { method: 'PUT', body: commands });
        }
        catch (err) {
            console.error(err);
        }
    });
}
// Simple method that returns a random emoji from list
function getRandomEmoji() {
    const emojiList = ['😭', '😄', '😌', '🤓', '😎', '😤', '🤖', '😶‍🌫️', '🌏', '📸', '💿', '👋', '🌊', '✨'];
    return emojiList[Math.floor(Math.random() * emojiList.length)];
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
