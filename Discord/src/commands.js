import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
import { createNewIssue } from './modules/crudDb.js';

async function createCommandChoices() {
  const choices = await createNewIssue();
  
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      // @ts-ignore
      name: capitalize(choice.title[0].plain_text),
      // @ts-ignore
      value: choice.title[0].plain_text.toLowerCase(),
    });
  }

  console.log(commandChoices)
  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};


const NEW_ISSUE = {
  name: 'new_issue',
  description: 'Create a new issue',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Select a database',
      required: true,
      // this is not dynamic, make it dynamic
      choices: createCommandChoices(),
    },
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



const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, GENERATE_WEBOOK_COMMAND, NEW_ISSUE];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
