"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const utils_js_1 = require("./utils.js");
// Simple test command
const TEST_COMMAND = {
    name: 'test',
    description: 'Basic command',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};
const NEW_ISSUE = {
    name: 'new_issue',
    description: 'Create a new issue',
    options: [
        {
            type: 3,
            name: 'database',
            description: 'Select a database',
            required: true,
            autocomplete: true
        },
        {
            type: 3,
            name: 'name',
            description: 'Enter the name of the issue',
            required: true,
        },
        {
            type: 3,
            name: 'description',
            description: 'Enter the description of the issue',
        }
    ],
    type: 1,
    integration_types: [0],
    contexts: [0],
};
const GENERATE_WEBOOK_COMMAND = {
    name: 'create-notion-link',
    description: 'Use this command to generate a link to your Notion Board',
    type: 1,
    integration_types: [0],
    contexts: [0],
};
const ALL_COMMANDS = [TEST_COMMAND, GENERATE_WEBOOK_COMMAND, NEW_ISSUE];
(0, utils_js_1.InstallGlobalCommands)(process.env.APP_ID, ALL_COMMANDS);
