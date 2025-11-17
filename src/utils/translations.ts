export interface Translations {
  [key: string]: any;
}

export const translations: Record<string, Translations> = {
  en: {
    commands: {
      ping: {
        name: 'ping',
        description: 'Check the bot latency'
      },
      stats: {
        name: 'stats',
        description: 'Show bot statistics'
      },
      kick: {
        name: 'kick',
        description: 'Kick a member from the server'
      },
      language: {
        name: 'language',
        description: 'Change bot language for this server',
        languageOption: 'Language to set',
        success: 'Language has been updated to: {lang}',
        current: 'Current language: {lang}',
        invalid: 'Invalid language. Available: en, fr'
      }
    },
    messages: {
      pong: 'Pong! {latency}ms',
      botStats: '📊 **Bot Statistics**\n• Uptime: {uptime}\n• Guilds: {guilds}\n• Users: {users}\n• Memory: {memory}',
      kicked: '{user} has been kicked from the server',
      invalidMember: 'Invalid member specified',
      noPermission: 'You do not have permission to use this command',
      ready: '🚀 Bot started successfully!',
      stopped: '🛑 Bot stopped properly',
      error: 'An error occurred: {error}'
    }
  },
  fr: {
    commands: {
      ping: {
        name: 'ping',
        description: 'Vérifier la latence du bot'
      },
      stats: {
        name: 'stats',
        description: 'Afficher les statistiques du bot'
      },
      kick: {
        name: 'kick',
        description: 'Expulser un membre du serveur'
      },
      language: {
        name: 'language',
        description: 'Changer la langue du bot pour ce serveur',
        languageOption: 'Langue à définir',
        success: 'La langue a été mise à jour vers: {lang}',
        current: 'Langue actuelle: {lang}',
        invalid: 'Langue invalide. Disponibles: en, fr'
      }
    },
    messages: {
      pong: 'Pong! {latency}ms',
      botStats: '📊 **Statistiques du bot**\n• Temps de fonctionnement: {uptime}\n• Serveurs: {guilds}\n• Utilisateurs: {users}\n• Mémoire: {memory}',
      kicked: '{user} a été expulsé du serveur',
      invalidMember: 'Membre spécifié invalide',
      noPermission: 'Vous n\'avez pas la permission d\'utiliser cette commande',
      ready: '🚀 Bot démarré avec succès!',
      stopped: '🛑 Bot arrêté proprement',
      error: 'Une erreur s\'est produite: {error}'
    }
  }
};