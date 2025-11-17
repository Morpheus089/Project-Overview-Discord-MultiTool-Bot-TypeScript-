import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../structures/Command';
import { EmbedBuilder } from '../utils/EmbedBuilder';

export class LanguageCommand extends Command {
  constructor() {
    super({
      name: 'language',
      description: 'Change bot language for this server',
      type: 'SLASH'
    });
  }

  public buildCommand(): any {
    return {
      name: 'language',
      description: 'Change bot language for this server',
      options: [
        {
          name: 'language',
          description: 'Language to set',
          type: 3,
          required: false,
          choices: [
            { name: 'English', value: 'en' },
            { name: 'Français', value: 'fr' }
          ]
        }
      ]
    };
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guild?.id || '';
    const translationService = (this.bot as any).translationService;
    
    try {
      const language = interaction.options.getString('language');
      const currentLang = await translationService.getGuildLanguage(guildId);
      
      if (!language) {
        const title = translationService.t(guildId, 'commands.language.currentTitle');
        const description = translationService.t(guildId, 'commands.language.currentDescription', { lang: currentLang.toUpperCase() });
        const embed = EmbedBuilder.language('current', title, description, interaction);
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      if (!translationService.getAvailableLanguages().includes(language)) {
        const title = translationService.t(guildId, 'commands.language.errorTitle');
        const description = translationService.t(guildId, 'commands.language.errorDescription');
        const embed = EmbedBuilder.language('error', title, description, interaction);
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      await translationService.setGuildLanguage(guildId, language);
      
      const title = translationService.t(language, 'commands.language.successTitle');
      const description = translationService.t(language, 'commands.language.successDescription', { lang: language.toUpperCase() });
      const embed = EmbedBuilder.language('success', title, description, interaction);
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error setting language:', error);
      const embed = EmbedBuilder.error(
        'Error',
        'An error occurred while changing the language.',
        interaction
      );
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else if (interaction.deferred) {
        await interaction.editReply({ embeds: [embed] });
      }
    }
  }
}
