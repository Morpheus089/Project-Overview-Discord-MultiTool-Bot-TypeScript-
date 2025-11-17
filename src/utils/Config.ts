import dotenv from 'dotenv';

dotenv.config();

export class Config {
  public readonly DISCORD_TOKEN: string;
  public readonly DISCORD_CLIENT_ID: string;
  public readonly DISCORD_GUILD_ID: string;

  public readonly MARIADB_HOST: string;
  public readonly MARIADB_PORT: number;
  public readonly MARIADB_USER: string;
  public readonly MARIADB_PASSWORD: string;
  public readonly MARIADB_DATABASE: string;

  public readonly BOT_STATUS: string;
  public readonly BOT_ACTIVITY: string;

  public readonly LOG_LEVEL: string;
  public readonly LOG_FILE: string;

  public readonly ENCRYPTION_KEY: string;

  public readonly WEATHER_API_KEY?: string;
  public readonly REDDIT_CLIENT_ID?: string;
  public readonly REDDIT_CLIENT_SECRET?: string;

  public readonly DEVELOPERS: string[];

  constructor() {
    this.DISCORD_TOKEN = this.getEnv('DISCORD_TOKEN', true);
    this.DISCORD_CLIENT_ID = this.getEnv('DISCORD_CLIENT_ID', true);
    this.DISCORD_GUILD_ID = this.getEnv('DISCORD_GUILD_ID', false) || '';

    this.MARIADB_HOST = this.getEnv('MARIADB_HOST', false) || 'localhost';
    this.MARIADB_PORT = parseInt(this.getEnv('MARIADB_PORT', false) || '3306');
    this.MARIADB_USER = this.getEnv('MARIADB_USER', false) || 'root';
    this.MARIADB_PASSWORD = this.getEnv('MARIADB_PASSWORD', false) || '';
    this.MARIADB_DATABASE = this.getEnv('MARIADB_DATABASE', false) || 'discord_bot';

    this.BOT_STATUS = this.getEnv('BOT_STATUS', false) || 'online';
    this.BOT_ACTIVITY = this.getEnv('BOT_ACTIVITY', false) || 'Slash commands only';

    this.LOG_LEVEL = this.getEnv('LOG_LEVEL', false) || 'info';
    this.LOG_FILE = this.getEnv('LOG_FILE', false) || 'logs/bot.log';

    this.ENCRYPTION_KEY = this.getEnv('ENCRYPTION_KEY', false) || 'default_key_change_in_production';


    this.WEATHER_API_KEY = this.getEnv('WEATHER_API_KEY', false);
    this.REDDIT_CLIENT_ID = this.getEnv('REDDIT_CLIENT_ID', false);
    this.REDDIT_CLIENT_SECRET = this.getEnv('REDDIT_CLIENT_SECRET', false);


    this.DEVELOPERS = ['YOUR_DISCORD_USER_ID'];

    this.validateConfig();
  }

  private getEnv(key: string, required: boolean): string {
    const value = process.env[key];
    
    if (required && !value) {
      throw new Error(`❌ Variable d'environnement requise manquante: ${key}`);
    }

    return value || '';
  }

  private validateConfig(): void {
    const requiredEnvVars = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
      console.error(`❌ Variables d'environnement manquantes: ${missing.join(', ')}`);
      console.info('💡 Copiez .env.example vers .env et remplissez les valeurs requises');
      process.exit(1);
    }

    if (!/^[MN][A-Za-z\d]{23}$/.test(this.DISCORD_CLIENT_ID)) {
      console.warn('⚠️  Format du CLIENT_ID Discord incorrect (devrait commencer par M ou N)');
    }

    if (this.DEVELOPERS.length === 0 || this.DEVELOPERS.includes('YOUR_DISCORD_USER_ID')) {
      console.warn('⚠️  N\'oubliez pas d\'ajouter vos IDs Discord dans DEVELOPERS');
    }

    console.info('✅ Configuration validée avec succès');
  }

  public isDeveloper(userId: string): boolean {
    return this.DEVELOPERS.includes(userId);
  }

  public isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const configLevel = levels.indexOf(this.LOG_LEVEL.toLowerCase());
    const messageLevel = levels.indexOf(level.toLowerCase());
    
    return messageLevel <= configLevel;
  }
}