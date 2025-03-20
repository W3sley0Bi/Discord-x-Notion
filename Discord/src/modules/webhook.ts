import axios from 'axios';
import { response } from 'express';

//@ts-ignore
export const createWebhook = async (name, channel_id) => {

      try {
        const response = await axios.post(
          `https://discord.com/api/v10/channels/${channel_id}/webhooks`,
          {
            name: "Notion Board",
            // avatar: webhookAvatar, // Optional
          },
          {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
    
        const webhook = response.data;
        
        console.log('Webhook created:', webhook);
        // res.status(201).send({
        //   message: 'Webhook created successfully!',
        //   webhookUrl: `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`,
        // });

        return webhook;

      } catch (error) {
        //@ts-ignore
        console.error('Error creating webhook:', error.response?.data || error.message);
        response.status(500).send('Failed to create webhook.');
      }
    }
