import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import { InteractionWebhook } from 'discord.js';
import {createWebhook} from './modules/webhook.js';
import { fetchDBs } from './modules/crudDb.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
if (process.env.PUBLIC_KEY) {
//@ts-ignore
  app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    const { type, data, channel_id } = req.body;
  
    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
      
    }
  
    /**
     * Handle Autocomplete requests (type 4)
     */
    if (type === 4) { // Discord's autocomplete interaction type
      if (data.name === 'new_issue') {
        try {
          // Fetch latest choices dynamically from Notion
          const choices = await fetchDBs();
          console.log('Fetched choices:', choices);
  
          // Extract user input (if they are typing)
          const focusedValue = data.options.find(opt => opt.focused)?.value || '';
  
          // Filter results based on user input (optional)
          const filteredChoices = choices
            .filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()))
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
    }
  
    /**
     * Handle Slash Command requests (type 2)
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;
  
      if (name === 'create-notion-link') {
        const webhook = await createWebhook(name, channel_id);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `✅ Webhook created! [Click Here](https://discord.com/api/webhooks/${webhook.id}/${webhook.token})`
          },
        });
      }
  
      if (name === 'new_issue') {

        const databaseId = data.options?.find(opt => opt.name === 'database')?.value;

        // TODO Post the new ticket in the selected db
        // const options = {
        //   method: 'PATCH',
        //   headers: {accept: 'application/json', 'content-type': 'application/json'}
        // };
        
        // fetch('https://api.notion.com/v1/databases/database_id', options)
        //   .then(res => res.json())
        //   .then(res => console.log(res))
        //   .catch(err => console.error(err));


        console.log(data)
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '✅ Issue creation started! Please select a database.',
          },
        });
      }
  
      if (name === 'test') {
        console.log('Test command received', type);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Hello world! ${getRandomEmoji()}`,
          },
        });
      }
  
      console.error(`❌ Unknown command: ${name}`);
      return res.status(400).json({ error: 'unknown command' });
    }
  
    console.error('❌ Unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
  });

  app.listen(PORT, () => {
    console.log('Listening on port', PORT);
  });
}  