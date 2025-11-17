import { Events } from 'discord.js';

export interface EventData {
  name: string;
  once?: boolean;
  rest?: boolean;
}

export abstract class Event {
  public readonly data: EventData;
  public readonly bot: any;

  constructor(bot: any, data: EventData) {
    this.bot = bot;
    this.data = data;
  }

  public abstract execute(...args: any[]): Promise<void> | void;

  public getEventEnum(): string | Events {
    return Events[this.data.name as keyof typeof Events] || this.data.name;
  }

  public isOnce(): boolean {
    return this.data.once || false;
  }
}