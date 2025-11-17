import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../structures/Command';

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
    const startTime = Date.now();
    const guildId = interaction.guild?.id || '';
    const translationService = (this.bot as any).translationService;
    
    const response = translationService.t(guildId, 'messages.pong', {
      latency: '...'
    });
    
    await interaction.reply(response);
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    const finalMessage = translationService.t(guildId, 'messages.pong', {
      latency: latency.toString()
    });
    
    await interaction.editReply(finalMessage);
  }
}