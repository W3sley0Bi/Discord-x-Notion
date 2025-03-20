import 'dotenv/config';
import {InstallGlobalCommands } from './utils';



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
      name: 'title',
      description: 'Enter the title of the issue',
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

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
