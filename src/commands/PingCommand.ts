import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../structures/Command';
import { EmbedBuilder } from '../utils/EmbedBuilder';

export class PingCommand extends Command {
  constructor() {
    super({
      name: 'ping',
      description: 'Check the bot latency',
      type: 'SLASH'
    });
  }

  public buildCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Check the bot latency');
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guild?.id || '';
    const translationService = (this.bot as any).translationService;
    
    const startTime = Date.now();
    
    try {
      await interaction.deferReply();
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      const title = translationService.t(guildId, 'commands.ping.title');
      const latencyLabel = translationService.t(guildId, 'commands.ping.latencyLabel');
      const statusLabel = translationService.t(guildId, 'commands.ping.statusLabel');
      const statusText = this.getPingStatus(latency, guildId, translationService);
      
      const embed = EmbedBuilder.ping(latency, title, latencyLabel, statusLabel, statusText, interaction);
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in ping command:', error);
      
      try {
        const errorTitle = translationService.t(guildId, 'common.error');
        const errorDesc = translationService.t(guildId, 'commands.ping.error');
        const embed = EmbedBuilder.error(errorTitle, errorDesc, interaction);
        
        if (interaction.deferred) {
          await interaction.editReply({ embeds: [embed] });
        } else if (!interaction.replied) {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      } catch (replyError) {
        console.error('Error sending error response:', replyError);
      }
    }
  }

  private getPingStatus(latency: number, guildId: string, translationService: any): string {
    if (latency < 50) return translationService.t(guildId, 'commands.ping.statusExcellent');
    if (latency < 100) return translationService.t(guildId, 'commands.ping.statusGood');
    if (latency < 200) return translationService.t(guildId, 'commands.ping.statusAverage');
    return translationService.t(guildId, 'commands.ping.statusSlow');
  }
}
