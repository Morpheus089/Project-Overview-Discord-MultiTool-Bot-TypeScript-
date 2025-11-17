import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../structures/Command';

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
      const client = interaction.client;
      const uptime = this.formatUptime(this.bot.uptime);
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      
      const guilds = client.guilds.cache.size;
      const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

      const message = translationService.t(guildId, 'messages.botStats', {
        uptime,
        guilds: guilds.toLocaleString(),
        users: users.toLocaleString(),
        memory: `${memoryUsageMB}MB`
      });

      const embed = new EmbedBuilder()
        .setDescription(message)
        .setColor(0x5865F2)
        .setThumbnail(client.user?.displayAvatarURL({ size: 256 }))
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const message = translationService.t(guildId, 'messages.error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      await interaction.reply({ content: message, ephemeral: true });
    }
  }

  private formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];
    
    if (days > 0) parts.push(`${days}d`);
    if (hours % 24 > 0) parts.push(`${hours % 24}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);

    return parts.join(' ') || '0s';
  }
}