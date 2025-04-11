import {
    InteractionType,
    InteractionResponseType,
  } from 'discord-interactions';
  
import { getRandomEmoji, DiscordRequest } from '../utils';
import { SelectDB, CreateIssue } from '../commands/newIssue';
import { fetchDbProperties } from './crudDb';
import { createComment } from '../utils/notionUtils';


  
//@ts-ignore
export async function interactions(req, res) {
    const { type, data, channel_id, member } = req.body;
   
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
        case 'new-issue':
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
    
    // button click in message componet
    if (type === 3 || type === 5) {
            const customId = data.custom_id;
            if (customId.startsWith('add_comment_')) {
                const interactionId = customId.replace('add_comment_', '');
                return res.json({
                    type: 9,
                    data: {
                        custom_id: `submit_comment_${interactionId}`,
                        title: 'Add a Comment',
                        components: [
                            {
                                type: 1, // Action row
                                components: [
                                    {
                                        type: 4, // Text input
                                        custom_id: 'comment_text',
                                        style: 2,
                                        label: 'Write your comment',
                                        placeholder: 'Type your comment here...',
                                        min_length: 1,
                                        max_length: 300,
                                        required: true,
                                    },
                                ],
                            },
                        ],
                    },
                });
            }
            
            if (customId.startsWith('submit_comment_')) {
                        const pageId = customId.replace('submit_comment_', '');
                        const comment = data.components[0].components[0].value; 
                        try {
                            await createComment(pageId, comment, member.user.global_name);
                            return res.send({
                                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                                data: {
                                    content: 'Comment added successfully! ✅',
                                    flags: 64, 
                                },
                            });
                        } catch (error) {
                            console.error('Failed to create comment:', error);
                            return res.send({
                                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                                data: {
                                    content: 'Failed to add comment. ⚠️',
                                    flags: 64, 
                                },
                            });
                        }
                    }
        }

  
    /**
     * Handle Slash Command requests (type 2)
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      switch(name){
        case 'new-issue':
          return await CreateIssue(data,res);
        case 'create-notion-link':
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `✅ Link created! Paste this link into Notion DB automation:\n\`\`\`\n${process.env.HOST}/events/${channel_id}\n\`\`\``
            }
          });          
          case 'test':
            console.log('Test command received', type, "Channell ID:", channel_id);;
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

