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
import { SelectDB, CreateIssue } from './commands/newIssue.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

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
      switch(data.name){
        case 'new_issue':
          return SelectDB(data,res);
        default:
          console.error('❌ Unknown command:', data.name);
          return res.status(400).json({ error: 'unknown command' });
      }
    }
  
    /**
     * Handle Slash Command requests (type 2)
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      switch(name){
        case 'new_issue':
          return await CreateIssue(data,res);
        case 'create-notion-link':
          const webhook = await createWebhook(name, channel_id);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `✅ Webhook created! [Click Here](https://discord.com/api/webhooks/${webhook.id}/${webhook.token})`
            },
          });
          case 'test':
            console.log('Test command received', type);
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `Hello world! ${getRandomEmoji()}`,
              },
            });
          default:
            console.error('❌ Unknown command:', name);
            return res.status(400).json({ error: 'unknown command' });
      }
    }
  
    console.error('❌ Unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
  });

  app.listen(PORT, () => {
    console.log('Listening on port', PORT);
  });
}  