import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../structures/Command';
import { EmbedBuilder } from '../utils/EmbedBuilder';

export class StatsCommand extends Command {
  constructor() {
    super({
      name: 'stats',
      description: 'Show bot statistics',
      type: 'SLASH'
    });
  }

  public buildCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Show bot statistics');
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guild?.id || '';
    const translationService = (this.bot as any).translationService;
    
    try {
      await interaction.deferReply();
      
      const client = interaction.client;
      const uptime = this.formatUptime(this.bot.uptime);
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      
      const guilds = client.guilds.cache.size;
      const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

      const title = translationService.t(guildId, 'commands.stats.title');
      const serversLabel = translationService.t(guildId, 'commands.stats.serversLabel');
      const usersLabel = translationService.t(guildId, 'commands.stats.usersLabel');
      const memoryLabel = translationService.t(guildId, 'commands.stats.memoryLabel');
      const uptimeLabel = translationService.t(guildId, 'commands.stats.uptimeLabel');

      const embed = EmbedBuilder.stats(
        title,
        serversLabel,
        usersLabel,
        memoryLabel,
        uptimeLabel,
        guilds,
        users,
        uptime,
        `${memoryUsageMB}MB`,
        interaction
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in stats command:', error);
      
      try {
        const errorTitle = translationService.t(guildId, 'common.error');
        const errorDesc = translationService.t(guildId, 'commands.stats.error');
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

  private formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];
    
    if (days > 0) parts.push(`${days}j`);
    if (hours % 24 > 0) parts.push(`${hours % 24}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);

    return parts.join(' ') || '0s';
  }
}
