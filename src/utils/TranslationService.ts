import { translations, Translations } from './translations';
import { DatabaseManager } from '../managers/DatabaseManager';

export class TranslationService {
  private database: DatabaseManager;
  private guildLanguages: Map<string, string> = new Map();

  constructor(database: DatabaseManager) {
    this.database = database;
  }

  public async getGuildLanguage(guildId: string): Promise<string> {
    if (this.guildLanguages.has(guildId)) {
      return this.guildLanguages.get(guildId)!;
    }

    try {
      const result = await this.database.query(
        'SELECT language FROM guild_configs WHERE guild_id = ?',
        [guildId]
      );

      const language = result.length > 0 ? result[0].language : 'en';
      this.guildLanguages.set(guildId, language);
      return language;
    } catch (error) {
      console.error('Error fetching guild language:', error);
      return 'en';
    }
  }

  public async setGuildLanguage(guildId: string, language: string): Promise<void> {
    const validLanguages = ['en', 'fr'];
    if (!validLanguages.includes(language)) {
      throw new Error('Invalid language');
    }

    try {
      await this.database.query(
        'INSERT INTO guild_configs (guild_id, language, created_at, updated_at) VALUES (?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE language = ?, updated_at = NOW()',
        [guildId, language, language]
      );

      this.guildLanguages.set(guildId, language);
    } catch (error) {
      console.error('Error setting guild language:', error);
      throw error;
    }
  }

  public t(guildId: string, key: string, variables?: Record<string, string>): string {
    const language = this.guildLanguages.get(guildId) || 'en';
    const lang = translations[language] || translations.en;
    
    const keys = key.split('.');
    let value: any = lang;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key not found: ${key} for language: ${language}`);
      return key;
    }
    
    if (variables) {
      return this.replaceVariables(value, variables);
    }
    
    return value;
  }

  private replaceVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
  }

  public getAvailableLanguages(): string[] {
    return Object.keys(translations);
  }
}