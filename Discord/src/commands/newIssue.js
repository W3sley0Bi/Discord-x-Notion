
import { fetchDBs } from '../modules/crudDb.js';
import { Client } from '@notionhq/client';

import { InteractionResponseType } from 'discord-interactions';

const notion = new Client({ auth: process.env.NOTION_API_KEY });


export async function SelectDB(data, res) {
    try {
        // Fetch latest choices dynamically from Notion
        const choices = await fetchDBs();
        console.log('Fetched choices:', choices);

        // Extract user input (if they are typing)
        const userDbChoise = data.options.find(opt => opt.focused)?.value || '';

        // Filter results based on user input (optional)
        const filteredChoices = choices
            .filter(choice => choice.name.toLowerCase().includes(userDbChoise.toLowerCase()))
            .slice(0, 25);

        return res.json({
            type: 8, // nees to be 8 !!!
            data: { choices: filteredChoices }
        });


    } catch (error) {
        console.error('❌ Error fetching Notion databases:', error);
        return res.sendStatus(500);
    }
}

export async function CreateIssue(data, res) {
    let shouldI = false;
    data.options.forEach(element => {
        element.value != '' ? shouldI = true : shouldI = false;
    });
    if (shouldI) {

        let response = await AddPageDb(data.options);
        console.log(response);

        return res.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [
                    {
                        title: "✅ Issue Created",
                        description: `Issue Added to ${data.options[0].value}`,
                        color: 5763719, // Hex color #57F287 (green)
                        fields: data.options.map(option => ({
                            name: option.name,
                            value: option.value || "N/A",
                            inline: true,
                        })),
                        footer: {
                            text: "Thank you for using our bot!",
                        },
                        timestamp: new Date().toISOString(),
                    },
                ],
            },
        });
    }
}



export async function AddPageDb(data) {

    const response = await notion.pages.create({
        // "cover": {
        //     "type": "external",
        //     "external": {
        //         "url": "https://upload.wikimedia.org/wikipedia/commons/6/62/Tuscankale.jpg"
        //     }
        // },
        "icon": {
            "type": "emoji",
            "emoji": "⚠️"
        },
        "parent": {
            "type": "database_id",
            "database_id": `${data[0].value}`
        },
        "properties": {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": `${data[1].value}`
                        }
                    }
                ]
            },
        },
        "children": [
            {
                "object": "block",
                "heading_2": {
                    "rich_text": [
                        {
                            "text": {
                                "content": "Lacinato kale"
                            }
                        }
                    ]
                }
            },
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "text": {
                                "content": `${data[2] !== undefined ? data[2].value : 'No description provided'}`,
                                "link": {
                                    "url": "https://en.wikipedia.org/wiki/Lacinato_kale"
                                }
                            },
                        }
                    ],
                    "color": "default"
                }
            }
        ]
    });
    return response


}




