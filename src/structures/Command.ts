import { SlashCommandBuilder } from 'discord.js';

export interface CommandData {
  name: string;
  description: string;
  type: 'SLASH';
}

export abstract class Command {
  public bot: any;
  public readonly name: string;
  public readonly description: string;
  public readonly type: 'SLASH';

  constructor(data: CommandData) {
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
  }

  public abstract buildCommand(): SlashCommandBuilder;
  public abstract execute(interaction: any): Promise<void>;
}