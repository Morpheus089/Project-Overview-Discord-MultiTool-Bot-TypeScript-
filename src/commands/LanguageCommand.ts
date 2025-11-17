import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../structures/Command';

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
    
    const language = interaction.options.getString('language');
    
    if (!language) {
      const currentLang = await translationService.getGuildLanguage(guildId);
      const message = translationService.t(guildId, 'commands.language.current', {
        lang: currentLang.toUpperCase()
      });
      
      await interaction.reply({ content: message, ephemeral: true });
      return;
    }

    if (!translationService.getAvailableLanguages().includes(language)) {
      const message = translationService.t(guildId, 'commands.language.invalid');
      await interaction.reply({ content: message, ephemeral: true });
      return;
    }

    try {
      await translationService.setGuildLanguage(guildId, language);
      const message = translationService.t(guildId, 'commands.language.success', {
        lang: language.toUpperCase()
      });
      
      await interaction.reply({ content: message });
    } catch (error) {
      console.error('Error setting language:', error);
      const message = translationService.t(guildId, 'messages.error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
}