import mysql from 'mysql2/promise';
import { Config } from '../utils/Config';
import { logger } from '../utils/Logger';

export interface DatabaseStats {
  connected: boolean;
  threadRunning: number;
  threadConnected: number;
  host: string;
  port: number;
  database: string;
  connections: number;
  uptime: number;
}

export interface DatabaseMetrics {
  operations: {
    total: number;
    successful: number;
    failed: number;
    averageTime: number;
  };
  connections: {
    active: number;
    idle: number;
    total: number;
  };
  memory: {
    resident: number;
    virtual: number;
  };
}

export class DatabaseManager {
  private readonly config: Config;
  private connection: mysql.Connection | null = null;
  private operationMetrics = {
    total: 0,
    successful: 0,
    failed: 0,
    totalTime: 0
  };

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Se connecte à la base de données MariaDB
   */
  public async connect(): Promise<void> {
    try {
      logger.info('[DatabaseManager] 🔄 Connexion à la base de données MariaDB...');

      const startTime = Date.now();
      
      this.connection = await mysql.createConnection({
        host: this.config.MARIADB_HOST,
        port: this.config.MARIADB_PORT,
        user: this.config.MARIADB_USER,
        password: this.config.MARIADB_PASSWORD,
        database: this.config.MARIADB_DATABASE,
        charset: 'utf8mb4'
      });

      const connectionTime = Date.now() - startTime;
      
      logger.success(`[DatabaseManager] ✅ Connecté à MariaDB en ${connectionTime}ms`);
      logger.info(`[DatabaseManager] 📊 Base: ${this.config.MARIADB_DATABASE} sur ${this.config.MARIADB_HOST}:${this.config.MARIADB_PORT}`);

      // Gestion des événements de connexion
      this.setupConnectionHandlers();

      // Créer les tables si elles n'existent pas
      await this.createTables();

    } catch (error) {
      logger.error('[DatabaseManager] ❌ Erreur de connexion à MariaDB:', error);
      throw error;
    }
  }

  /**
   * Se déconnecte de la base de données
   */
  public async disconnect(): Promise<void> {
    if (!this.connection) {
      logger.warn('[DatabaseManager] Déjà déconnecté de la base de données');
      return;
    }

    try {
      logger.info('[DatabaseManager] 🔄 Déconnexion de MariaDB...');
      
      await this.connection.end();
      this.connection = null;
      
      logger.success('[DatabaseManager] ✅ Déconnecté de MariaDB');
    } catch (error) {
      logger.error('[DatabaseManager] ❌ Erreur lors de la déconnexion:', error);
    }
  }

  /**
   * Exécute une opération avec métriques
   */
  public async executeWithMetrics<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.operationMetrics.total++;

    try {
      const result = await operation();
      this.operationMetrics.successful++;
      this.operationMetrics.totalTime += Date.now() - startTime;
      
      const duration = Date.now() - startTime;
      logger.performance('Opération DB', duration);
      
      return result;
    } catch (error) {
      this.operationMetrics.failed++;
      this.operationMetrics.totalTime += Date.now() - startTime;
      
      logger.error('Erreur opération DB:', error, 'DatabaseManager');
      throw error;
    }
  }

  /**
   * Configure les gestionnaires d'événements de connexion
   */
  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    this.connection.on('error', (error) => {
      logger.error('❌ Erreur MariaDB:', error, 'DatabaseManager');
      if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        logger.warn('🔌 Connexion MariaDB perdue, tentative de reconnexion...', 'DatabaseManager');
        setTimeout(async () => {
          try {
            await this.connect();
          } catch (error) {
            logger.error('Échec de reconnexion:', error, 'DatabaseManager');
          }
        }, 5000);
      }
    });

    this.connection.on('end', () => {
      logger.warn('🔌 Connexion MariaDB terminée', 'DatabaseManager');
    });

    this.connection.on('close', () => {
      logger.info('🔌 Connexion MariaDB fermée', 'DatabaseManager');
    });
  }

  /**
   * Crée les tables nécessaires pour le bot
   */
  private async createTables(): Promise<void> {
    try {
      logger.info('[DatabaseManager] 🔄 Création des tables...');

      // Table pour les configurations des serveurs
      await this.connection?.query(`
        CREATE TABLE IF NOT EXISTS guild_configs (
          guild_id VARCHAR(20) PRIMARY KEY,
          language VARCHAR(5) DEFAULT 'fr' NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_guild (guild_id)
        )
      `);

      // Table pour les statistiques des serveurs
      await this.connection?.query(`
        CREATE TABLE IF NOT EXISTS guild_stats (
          guild_id VARCHAR(20) PRIMARY KEY,
          member_count INT DEFAULT 0,
          bot_count INT DEFAULT 0,
          channel_count INT DEFAULT 0,
          role_count INT DEFAULT 0,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_guild_stats (guild_id)
        )
      `);

      logger.success('[DatabaseManager] ✅ Tables créées avec succès');

    } catch (error) {
      logger.error('[DatabaseManager] ❌ Erreur lors de la création des tables:', error);
      throw error;
    }
  }

  /**
   * Vérifie la santé de la connexion
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.connection) {
        return false;
      }

      // Ping simple pour vérifier la connexion
      await this.connection.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Health check failed:', error, 'DatabaseManager');
      return false;
    }
  }

  /**
   * Obtient les statistiques de la base de données
   */
  public async getStats(): Promise<DatabaseStats> {
    if (!this.connection) {
      throw new Error('Non connecté à la base de données');
    }

    try {
      const [rows] = await this.connection.query('SHOW STATUS LIKE ?', ['Threads_connected']);
      const [rows2] = await this.connection.query('SHOW STATUS LIKE ?', ['Threads_running']);
      const [rows3] = await this.connection.query('SHOW STATUS LIKE ?', ['Uptime']);

      const connections = Array.isArray(rows) && rows.length > 0 ? parseInt((rows[0] as any)?.Value || (rows[0] as any)?.value || '0') : 0;
      const threadRunning = Array.isArray(rows2) && rows2.length > 0 ? parseInt((rows2[0] as any)?.Value || (rows2[0] as any)?.value || '0') : 0;
      const uptime = Array.isArray(rows3) && rows3.length > 0 ? parseInt((rows3[0] as any)?.Value || (rows3[0] as any)?.value || '0') : 0;

      return {
        connected: true,
        threadRunning,
        threadConnected: connections,
        host: this.config.MARIADB_HOST,
        port: this.config.MARIADB_PORT,
        database: this.config.MARIADB_DATABASE,
        connections,
        uptime
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des stats:', error, 'DatabaseManager');
      throw error;
    }
  }

  /**
   * Obtient les métriques de performance
   */
  public getMetrics(): DatabaseMetrics {
    return {
      operations: {
        total: this.operationMetrics.total,
        successful: this.operationMetrics.successful,
        failed: this.operationMetrics.failed,
        averageTime: this.operationMetrics.total > 0 
          ? this.operationMetrics.totalTime / this.operationMetrics.total 
          : 0
      },
      connections: {
        active: 0,
        idle: 0,
        total: 1
      },
      memory: {
        resident: process.memoryUsage().heapUsed,
        virtual: process.memoryUsage().heapTotal
      }
    };
  }

  /**
   * Obtient l'état de la connexion
   */
  public getConnectionState(): {
    connected: boolean;
    host: string;
    port: number;
    database: string;
  } {
    if (!this.connection) {
      return {
        connected: false,
        host: '',
        port: 0,
        database: ''
      };
    }

    return {
      connected: true,
      host: this.config.MARIADB_HOST,
      port: this.config.MARIADB_PORT,
      database: this.config.MARIADB_DATABASE
    };
  }

  /**
   * Nettoie les ressources de la base de données
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.query('SELECT 1');
      }
      
      logger.info('🧹 Nettoyage de la base de données effectué', 'DatabaseManager');
    } catch (error) {
      logger.error('Erreur lors du nettoyage:', error, 'DatabaseManager');
    }
  }

  /**
   * Exécute une transaction MySQL
   */
  public async executeTransaction<T>(queries: string[]): Promise<T[]> {
    if (!this.connection) {
      throw new Error('Non connecté à la base de données');
    }

    try {
      await this.connection.beginTransaction();
      const results: T[] = [];
      
      for (const query of queries) {
        const [rows] = await this.connection.query(query);
        results.push(rows as T);
      }
      
      await this.connection.commit();
      return results;
    } catch (error) {
      await this.connection.rollback();
      throw error;
    }
  }

  /**
   * Obtient les tables de la base de données
   */
  public async getTables(): Promise<string[]> {
    if (!this.connection) {
      throw new Error('Non connecté à la base de données');
    }

    try {
      const [rows] = await this.connection.query('SHOW TABLES');
      const tables = Array.isArray(rows) ? rows : [];
      return tables.map((row: any) => Object.values(row)[0] as string);
    } catch (error) {
      logger.error('Erreur récupération tables:', error, 'DatabaseManager');
      throw error;
    }
  }

  /**
   * Exécute une requête SQL
   */
  public async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.connection) {
      throw new Error('Non connecté à la base de données');
    }

    try {
      const [rows] = await this.connection.query(sql, params);
      return Array.isArray(rows) ? rows as T[] : [];
    } catch (error) {
      logger.error(`Erreur exécution requête: ${sql}`, error, 'DatabaseManager');
      throw error;
    }
  }

  /**
   * Obtient la connexion active
   */
  public getConnection(): mysql.Connection | null {
    return this.connection;
  }
}