import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../structures/Command';

export class KickCommand extends Command {
  constructor() {
    super({
      name: 'kick',
      description: 'Kick a member from the server',
      type: 'SLASH'
    });
  }

  public buildCommand(): any {
    return {
      name: 'kick',
      description: 'Kick a member from the server',
      options: [
        {
          name: 'user',
          description: 'User to kick',
          type: 6,
          required: true
        },
        {
          name: 'reason',
          description: 'Reason for kicking',
          type: 3,
          required: false,
          max_length: 500
        }
      ],
      default_member_permissions: PermissionFlagsBits.KickMembers.toString()
    };
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guild?.id || '';
    const translationService = (this.bot as any).translationService;
    
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason specified';

    if (!targetUser || !interaction.guild) {
      const message = translationService.t(guildId, 'messages.invalidMember');
      await interaction.reply({ content: message, ephemeral: true });
      return;
    }

    const moderator = interaction.member;
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({ content: 'You cannot kick yourself.', ephemeral: true });
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.reply({ content: 'You cannot kick the server owner.', ephemeral: true });
      return;
    }

    if (!targetMember) {
      const message = translationService.t(guildId, 'messages.invalidMember');
      await interaction.reply({ content: message, ephemeral: true });
      return;
    }

    if (!moderator || !interaction.guild.members.me) {
      const message = translationService.t(guildId, 'messages.noPermission');
      await interaction.reply({ content: message, ephemeral: true });
      return;
    }

    try {
      await targetMember.kick(`Kicked by ${interaction.user.username}: ${reason}`);

      const message = translationService.t(guildId, 'messages.kicked', {
        user: targetUser.toString()
      });

      await interaction.reply({ content: message });
    } catch (error) {
      const message = translationService.t(guildId, 'messages.error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      await interaction.reply({ content: message, ephemeral: true });
    }
  }
}