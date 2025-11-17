import { Event } from '../structures/Event';
import { ChatInputCommandInteraction } from 'discord.js';
import { CommandManager } from '../managers/CommandManager';
import { EmbedBuilder } from '../utils/EmbedBuilder';

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
      
      // Ne pas essayer de répondre si l'interaction a déjà été traitée
      if (interaction.replied || interaction.deferred) {
        console.log('Interaction already processed, skipping error response');
        return;
      }

      // Gestion spécifique des erreurs connues
      const errorMessage = this.getErrorMessage(error);
      const embed = EmbedBuilder.error(
        'Erreur de Commande',
        errorMessage,
        interaction
      );

      try {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (replyError) {
        console.error('Error sending error response:', replyError);
      }
    }
  }

  private async handleInteractionError(interaction: any, error: any): Promise<void> {
    console.error('Interaction error:', error);

    // Ne pas essayer de répondre si l'interaction a déjà été traitée
    if (interaction.replied || interaction.deferred) {
      console.log('Interaction already processed, skipping error response');
      return;
    }

    try {
      const errorMessage = this.getErrorMessage(error);
      const embed = EmbedBuilder.error(
        'Erreur Inconnue',
        errorMessage,
        interaction
      );
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (responseError) {
      console.error('Error sending error response:', responseError);
    }
  }

  private getErrorMessage(error: any): string {
    // Gestion spécifique des erreurs connues
    if (error.code === 10062) {
      return '❌ Cette interaction a expiré. Veuillez réessayer la commande.';
    }
    
    if (error.code === 40060) {
      return '❌ Cette interaction a déjà été traitée.';
    }

    if (error.message?.includes('Unknown interaction')) {
      return '❌ Interaction inconnue ou expirée. Veuillez réessayer.';
    }

    if (error.message?.includes('Already acknowledged')) {
      return '❌ Cette interaction a déjà été traitée.';
    }

    // Erreur générique
    return `❌ Une erreur s'est produite: ${error.message || 'Erreur inconnue'}`;
  }
}