/**
 * Configuration centralisée des headers pour l'application mobile
 * Toutes les pages utilisent cette configuration pour leur header
 */

export interface HeaderAction {
  label?: string
  icon?: string
  action: string
}

export interface HeaderConfig {
  title: string | 'dynamic'
  subtitle?: string | 'dynamic'
  showBackButton: boolean
  rightActions?: HeaderAction[]
}

export const HEADER_CONFIGS: Record<string, HeaderConfig> = {
  // ═══════════════════════════════════════════════════════
  // Pages principales (visibles dans le menu tabs)
  // ═══════════════════════════════════════════════════════
  
  '/dashboard': {
    title: 'Tableau de bord',
    subtitle: 'dynamic', // Sera remplacé par l'email de l'utilisateur
    showBackButton: false,
    rightActions: [
      { label: 'Déconnexion', action: 'logout' }
    ]
  },

  '/(tabs)/dashboard': {
    title: 'Tableau de bord',
    subtitle: 'dynamic',
    showBackButton: false,
    rightActions: [
      { label: 'Déconnexion', action: 'logout' }
    ]
  },
  
  '/events': {
    title: '📅 Événements',
    showBackButton: false,
    rightActions: [
      { icon: '🔍', action: 'search' }
    ]
  },

  '/(tabs)/events': {
    title: '📅 Événements',
    showBackButton: false,
    rightActions: [
      { icon: '🔍', action: 'search' }
    ]
  },
  
  '/marketplace': {
    title: '🛒 Marketplace',
    showBackButton: false,
    rightActions: [
      { icon: '➕', action: 'create-trade' }
    ]
  },

  '/(tabs)/marketplace': {
    title: '🛒 Marketplace',
    showBackButton: false,
    rightActions: [
      { icon: '➕', action: 'create-trade' }
    ]
  },
  
  '/community': {
    title: '💬 Communauté',
    showBackButton: false,
    rightActions: [
      { icon: '🔍', action: 'search' }
    ]
  },

  '/(tabs)/community': {
    title: '💬 Communauté',
    showBackButton: false,
    rightActions: [
      { icon: '🔍', action: 'search' }
    ]
  },
  
  '/profile': {
    title: '👤 Profil',
    showBackButton: false,
    rightActions: [
      { icon: '⚙️', action: 'settings' }
    ]
  },

  '/(tabs)/profile': {
    title: '👤 Profil',
    showBackButton: false,
    rightActions: [
      { icon: '⚙️', action: 'settings' }
    ]
  },
  
  // ═══════════════════════════════════════════════════════
  // Pages secondaires (masquées du menu, avec retour)
  // ═══════════════════════════════════════════════════════
  
  '/search': {
    title: '🔍 Recherche',
    showBackButton: true,
  },

  '/(tabs)/search': {
    title: '🔍 Recherche',
    showBackButton: true,
  },
  
  '/create-event': {
    title: 'Créer un événement',
    showBackButton: true,
  },

  '/(tabs)/create-event': {
    title: 'Créer un événement',
    showBackButton: true,
  },
  
  '/create-trade': {
    title: 'Créer une annonce',
    showBackButton: true,
  },

  '/(tabs)/create-trade': {
    title: 'Créer une annonce',
    showBackButton: true,
  },
  
  // ═══════════════════════════════════════════════════════
  // Pages de détail dynamiques
  // ═══════════════════════════════════════════════════════
  
  '/events/[id]': {
    title: 'Détails de l\'événement',
    showBackButton: true,
    rightActions: [
      { icon: '⋮', action: 'event-menu' }
    ]
  },

  '/(tabs)/events/[id]': {
    title: 'Détails de l\'événement',
    showBackButton: true,
    rightActions: [
      { icon: '⋮', action: 'event-menu' }
    ]
  },
  
  '/trade/[id]': {
    title: 'Détails de l\'annonce',
    showBackButton: true,
    rightActions: [
      { icon: '⋮', action: 'trade-menu' }
    ]
  },
  
  '/profile/[username]': {
    title: 'dynamic', // Sera remplacé par le nom de l'utilisateur
    showBackButton: true,
  },
  
  '/games/[id]': {
    title: 'dynamic', // Sera remplacé par le nom du jeu
    showBackButton: true,
    rightActions: [
      { icon: '❤️', action: 'favorite-game' }
    ]
  },
}

/**
 * Configuration par défaut si une route n'est pas trouvée
 */
export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  title: 'Gémou2',
  showBackButton: true,
}

/**
 * Récupère la configuration du header pour une route donnée
 */
export function getHeaderConfig(pathname: string): HeaderConfig {
  // Essayer la route exacte
  if (HEADER_CONFIGS[pathname]) {
    return HEADER_CONFIGS[pathname]
  }
  
  // Essayer avec (tabs) préfixe
  const tabsPath = `/(tabs)${pathname}`
  if (HEADER_CONFIGS[tabsPath]) {
    return HEADER_CONFIGS[tabsPath]
  }
  
  // Vérifier les routes dynamiques
  for (const [route, config] of Object.entries(HEADER_CONFIGS)) {
    if (route.includes('[')) {
      // Convertir /events/[id] en regex /events/.*
      const pattern = route.replace(/\[.*?\]/g, '.*')
      const regex = new RegExp(`^${pattern}$`)
      if (regex.test(pathname)) {
        return config
      }
    }
  }
  
  // Retourner la config par défaut
  return DEFAULT_HEADER_CONFIG
}

