
import { fetchDBs } from '../modules/crudDb.js';
import { Client } from '@notionhq/client';
import { log } from 'console';

import { InteractionResponseType } from 'discord-interactions';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

//@ts-ignore
export async function SelectDB(data, res) {
    try {
        // Fetch latest choices dynamically from Notion
        const choices = await fetchDBs();
        console.log('Fetched choices:', choices);

        // Extract user input (if they are typing)
        //@ts-ignore
        const userDbChoise = data.options.find(opt => opt.focused)?.value || '';

        // Filter results based on user input (optional)
        const filteredChoices = choices
            .filter(choice => choice.name.toLowerCase().includes(userDbChoise.toLowerCase()))
            .slice(0, 25);

        return filteredChoices


    } catch (error) {
        console.error('❌ Error fetching Notion databases:', error);
        return res.sendStatus(500);
    }
}

export async function CreateIssue(data:any, res:any) {
    let shouldI = false;
    //@ts-ignore
    data.options.forEach(element => {
        element.value != '' ? shouldI = true : shouldI = false;
    });
    if (shouldI) {

        let response = await AddPageDb(data.options);
        console.log('diocane',JSON.parse(JSON.stringify(response)));

        return res.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [
                    {
                        title: "✅ Issue Created",
                        description: `Issue Added to ${data.options[0].value}`,
                        color: 5763719, // Hex color #57F287 (green)
                        //@ts-ignore
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


//@ts-ignore
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
            "Status": {
                "status": {
                    "name": `${data[3] !== undefined ? data[3].value : 'No status provided'}`
                }
            }
            
        },
        "children": [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "text": {
                                "content": `${data[2] !== undefined ? data[2].value : 'No description provided'}`,
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




