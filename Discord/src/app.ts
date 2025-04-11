import 'dotenv/config';
import express from 'express';
import {
  verifyKeyMiddleware,
} from 'discord-interactions';
import {interactions} from './modules/interactions';
import {notionDBAutomationWebHook} from './modules/webhook';

const app = express();
// TODO: use this middleweare if you use the enchanced webhoook 
// app.use(express.json());
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
if (process.env.PUBLIC_KEY) {
  
  app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), (req,res) => interactions(req,res));


/**
 * Events endpoint URL where Discord will send HTTP requests
 */

  app.post('/events/:channelId', (req, res) => notionDBAutomationWebHook(req, res));

}  

app.listen(PORT, () => { console.log('Listening on port', PORT); });