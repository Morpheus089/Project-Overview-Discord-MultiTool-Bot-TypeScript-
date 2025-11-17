import { 
  SlashCommandBuilder, 
  ContextMenuCommandBuilder,
  PermissionFlagsBits,
  ApplicationCommandType,
  AutocompleteFocusedOption,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  User,
  Guild,
  TextChannel,
  ThreadChannel,
  VoiceChannel,
  CategoryChannel,
  NewsChannel,
  StageChannel,
  ForumChannel,
  MediaChannel,
  Role,
  GuildMember
} from 'discord.js';

export interface CommandContext {
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
  guild?: Guild;
  channel?: TextChannel | NewsChannel | ThreadChannel | ForumChannel | MediaChannel | VoiceChannel | StageChannel;
  author?: User;
  member?: GuildMember | null;
}

export interface CommandCooldown {
  userId: string;
  commandName: string;
  timestamp: number;
}

export interface CommandOptions {
  name: string;
  description: string;
  cooldown?: number;
  userPermissions?: bigint[];
  botPermissions?: bigint[];
  guildOnly?: boolean;
  nsfw?: boolean;
  developerOnly?: boolean;
}

export interface SlashCommandOptions {
  name: string;
  description: string;
  options?: any[];
  defaultMemberPermissions?: bigint;
  dmPermission?: boolean;
}

export interface ContextMenuCommandOptions {
  name: string;
  type: ApplicationCommandType;
}

export type CommandType = 'SLASH' | 'CONTEXT_MENU';

export interface CommandData {
  type: CommandType;
  options: CommandOptions;
  slashOptions?: SlashCommandOptions;
  contextMenuOptions?: ContextMenuCommandOptions;
}

export interface CommandExecuteContext {
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
  context: CommandContext;
}

export interface CommandResult {
  success: boolean;
  content?: string;
  embeds?: any[];
  files?: any[];
  ephemeral?: boolean;
  deleteOriginal?: boolean;
  reply?: boolean;
  followUp?: boolean;
}

export interface CommandExecutor {
  execute(ctx: CommandExecuteContext): Promise<CommandResult>;
  autocomplete?(option: AutocompleteFocusedOption): Promise<any[]>;
}

export interface EventExecuteContext {
  client: any;
  args: any[];
}

export interface EventExecutor {
  execute(ctx: EventExecuteContext): Promise<void> | void;
}

export interface EventData {
  name: string;
  once?: boolean;
  rest?: boolean;
}

export interface EventOptions {
  name: string;
  once?: boolean;
  rest?: boolean;
}