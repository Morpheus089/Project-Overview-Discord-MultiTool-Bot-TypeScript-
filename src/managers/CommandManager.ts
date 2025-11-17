import { 
  Collection,
  REST,
  Routes,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  SlashCommandBuilder,
  ContextMenuCommandBuilder
} from 'discord.js';
import { DiscordBot } from '../index';
import { Command } from '../structures/Command';
import { Config } from '../utils/Config';
import { readdirSync } from 'fs';
import { join, basename, dirname } from 'path';

export class CommandManager {
  private readonly bot: DiscordBot;
  private readonly config: Config;
  private readonly commands: Collection<string, Command>;
  private rest: REST;

  constructor(bot: DiscordBot, commands: Collection<string, Command>) {
    this.bot = bot;
    this.config = new Config();
    this.commands = commands;
    this.rest = new REST({ version: '10' }).setToken(this.config.DISCORD_TOKEN);
  }

  public async loadCommands(): Promise<void> {
    try {
      this.commands.clear();

      await this.loadCommandsFromFolder('src/commands');

      await this.registerCommands();

    } catch (error) {
      console.error('Error loading commands:', error);
      throw error;
    }
  }

  private async loadCommandsFromFolder(folderPath: string): Promise<void> {
    try {
      const fs = require('fs');
      
      if (!fs.existsSync(folderPath)) {
        return;
      }

      const files = readdirSync(folderPath, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isDirectory()) {
          await this.loadCommandsFromFolder(join(folderPath, file.name));
        } else if (file.name.endsWith('.ts') && !file.name.includes('.test.')) {
          await this.loadCommandFile(join(folderPath, file.name));
        }
      }
    } catch (error) {
      console.error(`Error loading folder ${folderPath}:`, error);
    }
  }

  private async loadCommandFile(filePath: string): Promise<void> {
    try {
      const moduleName = basename(filePath, '.ts');
      
      // Le fichier est dans dist/commands/, depuis dist/managers/ utiliser ../
      const relativePath = filePath.replace(/src[\\/]/, '').replace('.ts', '.js');
      const modulePath = `../${relativePath}`;
      
      let commandModule: any;
      
      try {
        commandModule = require(modulePath);
      } catch (err) {
        console.warn(`⚠️ Could not load command from ${filePath}:`, (err as Error).message);
        return;
      }

      if (!commandModule) {
        return;
      }

      // Trouver la classe command exportée
      const CommandClass = Object.values(commandModule).find((exported: any) => 
        exported && typeof exported === 'function' && 
        exported.prototype && typeof exported.prototype.execute === 'function'
      ) as any;

      if (!CommandClass) {
        return;
      }

      const command = new CommandClass();
      command.bot = this.bot;
      
      if (!(command instanceof Command)) {
        return;
      }

      this.registerCommand(command);

    } catch (error) {
      console.error(`Error loading ${filePath}:`, error);
    }
  }

  private registerCommand(command: Command): void {
    this.commands.set(command.name, command);
  }

  private async registerCommands(): Promise<void> {
    try {
      const slashCommands: (SlashCommandBuilder | ContextMenuCommandBuilder)[] = [];
      
      for (const command of this.commands.values()) {
        const builder = command.buildCommand();
        if (builder) {
          slashCommands.push(builder);
        }
      }

      if (slashCommands.length === 0) {
        return;
      }

      if (this.config.DISCORD_GUILD_ID) {
        await this.rest.put(
          Routes.applicationGuildCommands(this.config.DISCORD_CLIENT_ID, this.config.DISCORD_GUILD_ID),
          { body: slashCommands }
        );
        console.log(`Registered ${slashCommands.length} guild commands`);
      } else {
        await this.rest.put(
          Routes.applicationCommands(this.config.DISCORD_CLIENT_ID),
          { body: slashCommands }
        );
        console.log(`Registered ${slashCommands.length} global commands`);
      }

    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }

  public async executeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const commandName = interaction.commandName;
    const command = this.commands.get(commandName);

    if (!command) {
      await interaction.reply({
        content: `Command "${commandName}" not found.`,
        ephemeral: true
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      await interaction.reply({
        content: 'An error occurred while executing this command.',
        ephemeral: true
      });
    }
  }

  public getCommand(name: string): Command | undefined {
    return this.commands.get(name.toLowerCase());
  }

  public getAllCommands(): Collection<string, Command> {
    return this.commands;
  }
}