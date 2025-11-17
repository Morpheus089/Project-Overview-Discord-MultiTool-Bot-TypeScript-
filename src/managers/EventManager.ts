import { Client, Events } from 'discord.js';
import { Event } from '../structures/Event';
import { readdirSync } from 'fs';
import { join, basename } from 'path';

export class EventManager {
  private readonly client: Client;
  private readonly bot: any;
  private readonly events: Map<string, Event> = new Map();

  constructor(client: Client, bot?: any) {
    this.client = client;
    this.bot = bot;
  }

  public async loadEvents(): Promise<void> {
    try {
      this.events.clear();

      await this.loadEventsFromFolder('src/events');

      console.log(`Loaded ${this.events.size} events successfully`);
    } catch (error) {
      console.error('Error loading events:', error);
      throw error;
    }
  }

  private async loadEventsFromFolder(folderPath: string): Promise<void> {
    try {
      const fs = require('fs');
      
      if (!fs.existsSync(folderPath)) {
        return;
      }

      const files = readdirSync(folderPath, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isDirectory()) {
          await this.loadEventsFromFolder(join(folderPath, file.name));
        } else if (file.name.endsWith('.ts') && !file.name.includes('.test.')) {
          await this.loadEventFile(join(folderPath, file.name));
        }
      }
    } catch (error) {
      console.error(`Error loading folder ${folderPath}:`, error);
    }
  }

  private async loadEventFile(filePath: string): Promise<void> {
    try {
      const moduleName = basename(filePath, '.ts');
      
      // Le fichier est dans dist/events/, depuis dist/managers/ utiliser ../
      const relativePath = filePath.replace(/src[\\/]/, '').replace('.ts', '.js');
      const modulePath = `../${relativePath}`;
      
      let eventModule: any;
      
      try {
        eventModule = require(modulePath);
      } catch (err) {
        console.warn(`⚠️ Could not load event from ${filePath}:`, (err as Error).message);
        return;
      }

      if (!eventModule) {
        return;
      }

      // Trouver la classe event exportée
      const EventClass = Object.values(eventModule).find((exported: any) => 
        exported && typeof exported === 'function' && 
        exported.prototype && typeof exported.prototype.execute === 'function'
      ) as any;

      if (!EventClass) {
        return;
      }

      let event: Event;
      
      // Passer des paramètres spéciaux à certains événements
      if (EventClass.name === 'InteractionCreateEvent' && this.bot?.commands) {
        event = new EventClass(this.client, this.bot.commands);
      } else {
        event = new EventClass(this.client);
      }

      if (!(event instanceof Event)) {
        return;
      }

      this.registerEvent(event);

    } catch (error) {
      console.error(`Error loading ${filePath}:`, error);
    }
  }

  private registerEvent(event: Event): void {
    const eventName = event.getEventEnum();
    
    this.client.removeAllListeners(eventName as string);

    const handler = async (...args: any[]) => {
      try {
        await event.execute(...args);
      } catch (error) {
        console.error(`Error in event ${event.data.name}:`, error);
      }
    };

    if (event.isOnce()) {
      this.client.once(eventName as string, handler);
    } else {
      this.client.on(eventName as string, handler);
    }

    this.events.set(event.data.name, event);
  }

  public getEvent(name: string): Event | undefined {
    return this.events.get(name);
  }

  public getAllEvents(): Map<string, Event> {
    return this.events;
  }
}