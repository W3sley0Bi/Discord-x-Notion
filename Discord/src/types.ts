export interface DiscordInteraction {
    type: number;
    data: {
      name: string;
      options?: { name: string; value: string }[];
    };
    channel_id?: string;
  }
  