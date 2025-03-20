import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import {interactions} from './modules/interactions';

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
  app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), (req,res) => interactions(req,res));

  app.listen(PORT, () => {
    console.log('Listening on port', PORT);
  });
}  