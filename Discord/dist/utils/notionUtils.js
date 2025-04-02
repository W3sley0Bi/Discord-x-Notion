"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComments = exports.createComment = exports.getNotionPage = exports.fetchNotionUser = void 0;
const client_1 = require("@notionhq/client");
const notion = new client_1.Client({ auth: process.env.NOTION_API_KEY });
const fetchNotionUser = async (userId) => {
    const response = await notion.users.retrieve({ user_id: userId });
    return response;
};
exports.fetchNotionUser = fetchNotionUser;
const getNotionPage = async (pageId) => {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return response;
};
exports.getNotionPage = getNotionPage;
const createComment = async (pageId, comment, user) => {
    const response = await notion.comments.create({
        "parent": {
            "page_id": `${pageId}`
        },
        "rich_text": [
            {
                "text": {
                    "content": `${user} says: ${comment}`
                }
            }
        ]
    });
    return response;
};
exports.createComment = createComment;
const getComments = async (blockId) => {
    const response = await notion.comments.list({ block_id: blockId });
    console.log(response);
    return response;
};
exports.getComments = getComments;
