import { Client, Events, GatewayIntentBits, Collection, Partials } from 'discord.js';
import { Command } from './structures/Command';
import { Event } from './structures/Event';
import { logger } from './utils/Logger';
import { Config } from './utils/Config';
import { DatabaseManager } from './managers/DatabaseManager';
import { CommandManager } from './managers/CommandManager';
import { EventManager } from './managers/EventManager';
import { TranslationService } from './utils/TranslationService';

export class DiscordBot {
  public readonly client: Client;
  public readonly config: Config;
  public readonly logger: typeof logger;
  public readonly database: DatabaseManager;
  public readonly commands: CommandManager;
  public readonly events: EventManager;
  public readonly translationService: TranslationService;
  public readonly commandCollection: Collection<string, Command>;

  private isReady = false;

  constructor() {
    this.config = new Config();
    this.logger = logger;
    this.database = new DatabaseManager(this.config);
    this.translationService = new TranslationService(this.database);
    this.commandCollection = new Collection();
    
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
    });

    this.commands = new CommandManager(this, this.commandCollection);
    this.events = new EventManager(this.client, this);
  }

  public async start(): Promise<void> {
    try {
      await this.database.connect();
      await this.commands.loadCommands();
      await this.events.loadEvents();
      
      await this.client.login(this.config.DISCORD_TOKEN);
      
      this.isReady = true;
      const guildId = 'default';
      this.logger.info(`[DiscordBot] ${this.translationService.t(guildId, 'messages.ready')}`);
    } catch (error) {
      this.logger.error('[DiscordBot] Error starting bot:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    if (!this.isReady) return;

    try {
      await this.database.disconnect();
      await this.client.destroy();
      this.logger.info('[DiscordBot] Bot stopped properly');
    } catch (error) {
      this.logger.error('[DiscordBot] Error stopping bot:', error);
    }
  }

  public get uptime(): number {
    return this.client.uptime || 0;
  }
}

const bot = new DiscordBot();
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, stopping bot...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, stopping bot...');
  await bot.stop();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bot.start().catch(console.error);

export { bot };