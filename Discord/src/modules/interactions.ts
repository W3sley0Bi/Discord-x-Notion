import {
    InteractionType,
    InteractionResponseType,
  } from 'discord-interactions';

  import { getRandomEmoji, DiscordRequest } from '../utils';
  import {createWebhook} from './webhook';
  import { SelectDB, CreateIssue } from '../commands/newIssue';
import { fetchDbProperties } from './crudDb';
import { log } from 'node:console';
  
//@ts-ignore
export async function interactions(req, res) {
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
          const db = await SelectDB(data,res);
          // console.log('data:', data);
          if(data.options.length >= 4 && data.options[3].name == 'status'){
            // console.log('Fetching properties for database:', data.options[0].value);
            const props = await fetchDbProperties(data.options[0].value); 
            // @ts-ignore
           let status = props.properties.Status.status.options.map(element => {
              // console.log('Element:', element);
              return {name:element.name, value:element.name};
            });
            // console.log('Status:', status);
            return res.json({
              type: 8, // Tipo di risposta per autocomplete
              data: { choices: status},   
          });
          }else{
            return res.json({
              type: 8, // Tipo di risposta per autocomplete
              data: { choices: db },
          });
          }
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
  }