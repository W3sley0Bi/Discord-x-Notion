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

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res, next) {
  // Interaction type and data
  const { type, id, data, channel_id } = req.body;
  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    res.send({ type: InteractionResponseType.PONG });
    return next();
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if(name === 'create-notion-link'){
      const webhook = await createWebhook(name, channel_id)
      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`,
        },
      });
      return next();
    }

    if(name === 'new_issue'){

    }

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `hello world ${getRandomEmoji()}`,
        },
      });
      return next();
    }

    console.error(`unknown command: ${name}`);
    res.status(400).json({ error: 'unknown command' });
    return next();
  }


  console.error('unknown interaction type', type);
  res.status(400).json({ error: 'unknown interaction type' });
  return next();
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

}