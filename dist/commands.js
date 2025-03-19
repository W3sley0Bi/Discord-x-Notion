"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const game_js_1 = require("./game.js");
const utils_js_1 = require("./utils.js");
// Get the game choices from game.js
function createCommandChoices() {
    const choices = (0, game_js_1.getRPSChoices)();
    const commandChoices = [];
    for (let choice of choices) {
        commandChoices.push({
            name: (0, utils_js_1.capitalize)(choice),
            value: choice.toLowerCase(),
        });
    }
    return commandChoices;
}
// Simple test command
const TEST_COMMAND = {
    name: 'test',
    description: 'Basic command',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};
// Command containing options
const CHALLENGE_COMMAND = {
    name: 'challenge',
    description: 'Challenge to a match of rock paper scissors',
    options: [
        {
            type: 3,
            name: 'object',
            description: 'Pick your object',
            required: true,
            choices: createCommandChoices(),
        },
    ],
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 2],
};
const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND];
(0, utils_js_1.InstallGlobalCommands)(process.env.APP_ID, ALL_COMMANDS);
