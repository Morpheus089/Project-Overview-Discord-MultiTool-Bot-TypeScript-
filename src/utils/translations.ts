export interface Translations {
  [key: string]: any;
}

export const translations: Record<string, Translations> = {
  en: {
    commands: {
      ping: {
        name: 'ping',
        description: 'Check the bot latency',
        title: 'Pong!',
        latencyLabel: 'Bot Latency',
        statusLabel: 'Status',
        statusExcellent: 'Excellent',
        statusGood: 'Good',
        statusAverage: 'Average',
        statusSlow: 'Slow',
        error: 'An error occurred while executing the ping command.'
      },
      stats: {
        name: 'stats',
        description: 'Show bot statistics',
        title: 'Bot Statistics',
        serversLabel: 'Servers',
        usersLabel: 'Users',
        memoryLabel: 'Memory',
        uptimeLabel: 'Uptime',
        error: 'An error occurred while retrieving statistics.'
      },
      kick: {
        name: 'kick',
        description: 'Kick a member from the server',
        title: 'Member Kicked',
        userLabel: 'User',
        reasonLabel: 'Reason',
        noReason: 'No reason specified',
        invalidUser: 'Invalid user or server.',
        selfKick: 'You cannot kick yourself.',
        ownerKick: 'You cannot kick the server owner.',
        memberNotFound: 'This member is not in the server or could not be found.',
        noPermission: 'You do not have permission to use this command.',
        error: 'An error occurred while kicking the member.',
        successDescription: '**{user}** has been kicked from the server'
      },
      language: {
        name: 'language',
        description: 'Change bot language for this server',
        languageOption: 'Language to set',
        currentTitle: 'Current Language',
        currentDescription: 'The current language for this server is **{lang}**',
        successTitle: 'Language Changed',
        successDescription: 'The server language has been updated to **{lang}**',
        errorTitle: 'Error',
        errorDescription: 'Invalid language. Available languages are: **EN** and **FR**'
      }
    },
    common: {
      error: 'Error',
      actionDenied: 'Action Denied',
      permissionDenied: 'Permission Denied'
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
        description: 'Vérifier la latence du bot',
        title: 'Pong!',
        latencyLabel: 'Latence du bot',
        statusLabel: 'Status',
        statusExcellent: 'Excellente',
        statusGood: 'Bonne',
        statusAverage: 'Moyenne',
        statusSlow: 'Lente',
        error: 'Une erreur s\'est produite lors de l\'exécution de la commande ping.'
      },
      stats: {
        name: 'stats',
        description: 'Afficher les statistiques du bot',
        title: 'Statistiques du Bot',
        serversLabel: 'Serveurs',
        usersLabel: 'Utilisateurs',
        memoryLabel: 'Mémoire',
        uptimeLabel: 'Temps de fonctionnement',
        error: 'Une erreur s\'est produite lors de la récupération des statistiques.'
      },
      kick: {
        name: 'kick',
        description: 'Expulser un membre du serveur',
        title: 'Membre Expulsé',
        userLabel: 'Utilisateur',
        reasonLabel: 'Raison',
        noReason: 'Aucune raison spécifiée',
        invalidUser: 'Utilisateur ou serveur invalide.',
        selfKick: 'Vous ne pouvez pas vous expulser vous-même.',
        ownerKick: 'Vous ne pouvez pas expulser le propriétaire du serveur.',
        memberNotFound: 'Ce membre n\'est pas dans le serveur ou n\'a pas pu être trouvé.',
        noPermission: 'Vous n\'avez pas la permission d\'utiliser cette commande.',
        error: 'Une erreur s\'est produite lors de l\'expulsion du membre.',
        successDescription: '**{user}** a été expulsé du serveur'
      },
      language: {
        name: 'language',
        description: 'Changer la langue du bot pour ce serveur',
        languageOption: 'Langue à définir',
        currentTitle: 'Langue Actuelle',
        currentDescription: 'La langue actuelle de ce serveur est **{lang}**',
        successTitle: 'Langue Modifiée',
        successDescription: 'La langue du serveur a été mise à jour vers **{lang}**',
        errorTitle: 'Erreur',
        errorDescription: 'Langue invalide. Les langues disponibles sont : **EN** et **FR**'
      }
    },
    common: {
      error: 'Erreur',
      actionDenied: 'Action Refusée',
      permissionDenied: 'Permission Refusée'
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