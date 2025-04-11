
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

export async function CreateIssue(dbName:string,data:any, res:any) {
    let shouldI = false;
    
    //@ts-ignore
    data.options.forEach(element => {
        element.value != '' ? shouldI = true : shouldI = false;
    });
    if (shouldI) {

      await AddPageDb(data.options);

        return res.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [
                    {
                        title: "✅ Issue Created",
                        description: `Issue Added to ${dbName}`,
                        color: 5763719, // Hex color #57F287 (green)
                        //@ts-ignore
                        fields: data.options.map(option => ({
                            name: option.name,
                            value: option.name == 'database' ? dbName : option.value ? option.value : 'N/A' ,
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
    }else{
        return res.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [
                    {
                        title: "❌ Error",
                        description: `Please fill in all fields`,
                        color: 16711680, // Hex color #FF0000 (red)
                        footer: {
                            text: "Please try again.",
                        },
                        timestamp: new Date().toISOString(),
                    },
                ],
            },
        });
    }
}

function findPropertyByName(data: any[], name: string) {
    let value: any = data.find((prop: { name: string}) => prop.name === name);
    return value ? value : '';    
}


//@ts-ignore
export async function AddPageDb(data) {
    const statusValue = findPropertyByName(data, 'status').value;
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
            //@ts-ignore
            "database_id": `${findPropertyByName(data, 'database').value}`
        },
        "properties": {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": `${findPropertyByName(data, 'title').value}`
                        }
                    }
                ]
                
            },
            ...(statusValue && { 
                "Status": {
                    "status": {
                        "name": statusValue
                    }
                }
            })
        },
        "children": [
            {
                "object": "block",
                "paragraph": {
                    "rich_text": [
                        {
                            "text": {
                                "content": `${findPropertyByName(data, 'description').value}`,
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




