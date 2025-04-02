import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });


export const fetchNotionUser = async (userId: string) => {
    const response = await notion.users.retrieve({ user_id: userId });
    return response;
}

export const getNotionPage = async (pageId: string) => {
    const response = await notion.pages.retrieve({ page_id: pageId });
  return response
}



export const createComment = async (pageId: string, comment: string, user: string) => {
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
}



export const getComments = async (blockId: string)=> {
  const response = await notion.comments.list({ block_id: blockId });
    console.log(response);
    return response
} 

