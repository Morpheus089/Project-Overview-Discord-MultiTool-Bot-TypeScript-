import { EmbedBuilder as DiscordEmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

export class EmbedBuilder {
  private static readonly COLORS = {
    SUCCESS: 0x00FF00,
    ERROR: 0xFF0000,
    INFO: 0x5865F2,
    WARNING: 0xFFA500,
    PING: 0x00FFFF,
    LANGUAGE: 0x9B59B6,
    STATS: 0x3498DB,
    KICK: 0xE74C3C
  };

  public static success(
    title: string, 
    description: string, 
    interaction: ChatInputCommandInteraction,
    fields?: Array<{ name: string, value: string, inline?: boolean }>
  ): DiscordEmbedBuilder {
    const embed = new DiscordEmbedBuilder()
      .setTitle(`✅ ${title}`)
      .setDescription(description)
      .setColor(this.COLORS.SUCCESS)
      .setTimestamp();

    if (interaction.client.user?.displayAvatarURL) {
      embed.setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }));
    }

    if (fields) {
      embed.addFields(fields);
    }

    return embed;
  }

  public static error(
    title: string, 
    description: string, 
    interaction: ChatInputCommandInteraction,
    fields?: Array<{ name: string, value: string, inline?: boolean }>
  ): DiscordEmbedBuilder {
    const embed = new DiscordEmbedBuilder()
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setColor(this.COLORS.ERROR)
      .setTimestamp();

    if (interaction.client.user?.displayAvatarURL) {
      embed.setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }));
    }

    if (fields) {
      embed.addFields(fields);
    }

    return embed;
  }

  public static info(
    title: string, 
    description: string, 
    interaction: ChatInputCommandInteraction,
    fields?: Array<{ name: string, value: string, inline?: boolean }>
  ): DiscordEmbedBuilder {
    const embed = new DiscordEmbedBuilder()
      .setTitle(`ℹ️ ${title}`)
      .setDescription(description)
      .setColor(this.COLORS.INFO)
      .setTimestamp();

    if (interaction.client.user?.displayAvatarURL) {
      embed.setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }));
    }

    if (fields) {
      embed.addFields(fields);
    }

    return embed;
  }

  public static ping(
    latency: number,
    title: string,
    latencyLabel: string,
    statusLabel: string,
    statusText: string,
    interaction: ChatInputCommandInteraction
  ): DiscordEmbedBuilder {
    const pingEmoji = latency < 50 ? '⚡' : latency < 100 ? '🔸' : '🔴';
    const statusEmoji = latency < 50 ? '🟢' : latency < 100 ? '🟡' : '🔴';
    
    const embed = new DiscordEmbedBuilder()
      .setTitle(`${pingEmoji} ${title}`)
      .setDescription(`**${latencyLabel}:** ${latency}ms\n\n${statusEmoji} **${statusLabel}:** ${statusText}`)
      .setColor(this.COLORS.PING)
      .setTimestamp();

    if (interaction.client.user?.displayAvatarURL) {
      embed.setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }));
    }

    return embed;
  }

  public static language(
    type: 'current' | 'success' | 'error',
    title: string,
    description: string,
    interaction?: ChatInputCommandInteraction
  ): DiscordEmbedBuilder {
    const embed = new DiscordEmbedBuilder()
      .setColor(this.COLORS.LANGUAGE)
      .setTimestamp();

    if (interaction?.client.user?.displayAvatarURL) {
      embed.setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }));
    }

    const icons = {
      current: '🌐',
      success: '✅',
      error: '❌'
    };

    const colors = {
      current: this.COLORS.INFO,
      success: this.COLORS.SUCCESS,
      error: this.COLORS.ERROR
    };

    embed
      .setTitle(`${icons[type]} ${title}`)
      .setDescription(description)
      .setColor(colors[type]);

    return embed;
  }

  public static stats(
    title: string,
    serversLabel: string,
    usersLabel: string,
    memoryLabel: string,
    uptimeLabel: string,
    guilds: number,
    users: number,
    uptime: string,
    memory: string,
    interaction: ChatInputCommandInteraction
  ): DiscordEmbedBuilder {
    const embed = new DiscordEmbedBuilder()
      .setTitle(`📊 ${title}`)
      .setColor(this.COLORS.STATS)
      .setTimestamp();

    if (interaction.client.user?.displayAvatarURL) {
      embed.setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }));
    }

    embed.addFields([
      { name: `📈 ${serversLabel}`, value: guilds.toLocaleString(), inline: true },
      { name: `👥 ${usersLabel}`, value: users.toLocaleString(), inline: true },
      { name: `💾 ${memoryLabel}`, value: memory, inline: true },
      { name: `⏰ ${uptimeLabel}`, value: uptime, inline: false }
    ]);

    return embed;
  }

  public static kick(
    title: string,
    description: string,
    userLabel: string,
    reasonLabel: string,
    user: string,
    reason: string,
    interaction: ChatInputCommandInteraction
  ): DiscordEmbedBuilder {
    const embed = new DiscordEmbedBuilder()
      .setTitle(`👢 ${title}`)
      .setDescription(description)
      .setColor(this.COLORS.KICK)
      .setTimestamp();

    embed.addFields([
      { name: `👤 ${userLabel}`, value: user, inline: true },
      { name: `📝 ${reasonLabel}`, value: reason, inline: true }
    ]);

    return embed;
  }
}
