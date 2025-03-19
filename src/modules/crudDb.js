import axios from 'axios';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const createNewIssue = async () => {
    const response = await notion.search({
        query: '',
        filter: {
          value: 'database',
          property: 'object'
        },
        sort: {
          direction: 'ascending',
          timestamp: 'last_edited_time'
        },
      });
      return response.results;

}