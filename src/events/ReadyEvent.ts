import { Event } from '../structures/Event';

export class ReadyEvent extends Event {
  constructor(bot: any) {
    super(bot, {
      name: 'ready',
      once: true
    });
  }

  public async execute(client: any): Promise<void> {
    try {
      console.log(`🤖 ${client.user?.tag} is now online!`);
      console.log(`📊 Servers: ${client.guilds.cache.size}`);
      console.log(`👥 Users: ${client.guilds.cache.reduce((acc: number, guild: any) => acc + guild.memberCount, 0)}`);

      this.setBotStatus(client);
    } catch (error) {
      console.error('Error in ready event:', error);
    }
  }

  private setBotStatus(client: any): void {
    client.user?.setPresence({
      status: 'online',
      activities: [
        { name: `${client.guilds.cache.size} servers`, type: 3 }
      ]
    });

    console.log(`🎯 Status set: online - ${client.guilds.cache.size} servers`);
  }
}