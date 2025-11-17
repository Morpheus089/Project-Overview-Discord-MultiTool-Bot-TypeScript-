import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../structures/Command';
import { EmbedBuilder } from '../utils/EmbedBuilder';

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
    
    try {
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || translationService.t(guildId, 'commands.kick.noReason');

      if (!targetUser || !interaction.guild) {
        const errorTitle = translationService.t(guildId, 'common.error');
        const errorDesc = translationService.t(guildId, 'commands.kick.invalidUser');
        const embed = EmbedBuilder.error(errorTitle, errorDesc, interaction);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const moderator = interaction.member;
      const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

      if (targetUser.id === interaction.user.id) {
        const errorTitle = translationService.t(guildId, 'common.actionDenied');
        const errorDesc = translationService.t(guildId, 'commands.kick.selfKick');
        const embed = EmbedBuilder.error(errorTitle, errorDesc, interaction);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      if (targetUser.id === interaction.guild.ownerId) {
        const errorTitle = translationService.t(guildId, 'common.actionDenied');
        const errorDesc = translationService.t(guildId, 'commands.kick.ownerKick');
        const embed = EmbedBuilder.error(errorTitle, errorDesc, interaction);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      if (!targetMember) {
        const errorTitle = translationService.t(guildId, 'common.error');
        const errorDesc = translationService.t(guildId, 'commands.kick.memberNotFound');
        const embed = EmbedBuilder.error(errorTitle, errorDesc, interaction);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      if (!moderator || !interaction.guild.members.me) {
        const errorTitle = translationService.t(guildId, 'common.permissionDenied');
        const errorDesc = translationService.t(guildId, 'commands.kick.noPermission');
        const embed = EmbedBuilder.error(errorTitle, errorDesc, interaction);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      await targetMember.kick(`${interaction.user.username}: ${reason}`);

      const title = translationService.t(guildId, 'commands.kick.title');
      const description = translationService.t(guildId, 'commands.kick.successDescription', { user: targetUser.username });
      const userLabel = translationService.t(guildId, 'commands.kick.userLabel');
      const reasonLabel = translationService.t(guildId, 'commands.kick.reasonLabel');

      const embed = EmbedBuilder.kick(title, description, userLabel, reasonLabel, targetUser.username, reason, interaction);

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error in kick command:', error);
      
      const errorTitle = translationService.t(guildId, 'common.error');
      const errorDesc = translationService.t(guildId, 'commands.kick.error');
      const embed = EmbedBuilder.error(errorTitle, errorDesc, interaction);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else if (interaction.deferred) {
        await interaction.editReply({ embeds: [embed] });
      }
    }
  }
}
