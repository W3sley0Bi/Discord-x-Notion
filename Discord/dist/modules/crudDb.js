"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDBs = fetchDBs;
exports.fetchDbProperties = fetchDbProperties;
const client_1 = require("@notionhq/client");
const notion = new client_1.Client({ auth: process.env.NOTION_API_KEY });
async function fetchDBs() {
    const response = await notion.search({
        query: '',
        filter: { value: 'database', property: 'object' },
        sort: { direction: 'ascending', timestamp: 'last_edited_time' },
    });
    const commandChoices = response.results.map(choice => ({
        // @ts-ignore
        name: choice.title?.[0]?.plain_text || "Untitled Database", // Avoids crashes
        value: choice.id,
    }));
    return commandChoices;
}
async function fetchDbProperties(id) {
    const response = await notion.databases.retrieve({ database_id: id });
    return response;
}
