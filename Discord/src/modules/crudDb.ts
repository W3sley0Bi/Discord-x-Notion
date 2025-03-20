import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function fetchDBs() {
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
