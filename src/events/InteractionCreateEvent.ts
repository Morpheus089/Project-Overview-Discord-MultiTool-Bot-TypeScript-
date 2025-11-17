import { Event } from '../structures/Event';
import { ChatInputCommandInteraction } from 'discord.js';
import { CommandManager } from '../managers/CommandManager';

export class InteractionCreateEvent extends Event {
  private readonly commandManager: CommandManager;

  constructor(bot: any, commandManager: CommandManager) {
    super(bot, {
      name: 'interactionCreate'
    });
    this.commandManager = commandManager;
  }

  public async execute(interaction: any): Promise<void> {
    try {
      if (interaction.isChatInputCommand()) {
        await this.handleChatInputCommand(interaction);
      }
    } catch (error) {
      await this.handleInteractionError(interaction, error);
    }
  }

  private async handleChatInputCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await this.commandManager.executeSlashCommand(interaction);
    } catch (error) {
      console.error('Slash command error:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'An error occurred while executing this command.',
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: 'An error occurred while executing this command.',
          ephemeral: true
        });
      }
    }
  }

  private async handleInteractionError(interaction: any, error: any): Promise<void> {
    console.error('Interaction error:', error);

    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'An unexpected error occurred.',
          ephemeral: true
        });
      }
    } catch (responseError) {
      console.error('Error sending error response:', responseError);
    }
  }
}