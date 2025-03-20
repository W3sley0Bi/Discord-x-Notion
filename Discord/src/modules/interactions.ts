import {
    InteractionType,
    InteractionResponseType,
  } from 'discord-interactions';

  import { getRandomEmoji, DiscordRequest } from '../utils';
  import {createWebhook} from './webhook';
  import { SelectDB, CreateIssue } from '../commands/newIssue';
  
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
  }