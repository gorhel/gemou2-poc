/**
 * Utilitaire de logging pour l'application web
 * 
 * Principes:
 * - Log uniquement en environnement de développement
 * - Log au chargement initial des pages/composants
 * - Log lors d'événements utilisateur (actions, clics)
 * - Ne log PAS à chaque re-render ou mise à jour d'état
 */

// Détection de l'environnement de développement
const isDev = (): boolean => {
  // Next.js / Node.js
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV === 'development'
  }
  // Browser
  if (typeof window !== 'undefined') {
    return window.location?.hostname === 'localhost' || 
           window.location?.hostname === '127.0.0.1'
  }
  return false
}

// Types d'événements de log
type LogEventType = 
  | 'PAGE_LOAD'      // Chargement initial d'une page
  | 'COMPONENT_MOUNT' // Montage d'un composant
  | 'USER_ACTION'    // Action utilisateur (clic, soumission)
  | 'DATA_FETCH'     // Récupération de données
  | 'AUTH_EVENT'     // Événement d'authentification
  | 'REALTIME_EVENT' // Événement temps réel
  | 'ERROR'          // Erreur

/**
 * Logger pour l'application web
 * N'affiche les logs qu'en développement
 */
class AppLogger {
  private enabled: boolean
  private prefix: string

  constructor() {
    this.enabled = isDev()
    this.prefix = '🎲 [Gemou]'
  }

  /**
   * Log au chargement d'une page
   */
  pageLoad(pageName: string, data?: Record<string, any>): void {
    if (!this.enabled) return
    console.log(`${this.prefix} [${pageName}] 📄 PAGE_LOAD`, data || '')
  }

  /**
   * Log au montage d'un composant
   */
  componentMount(componentName: string, data?: Record<string, any>): void {
    if (!this.enabled) return
    console.debug(`${this.prefix} [${componentName}] 🔧 COMPONENT_MOUNT`, data || '')
  }

  /**
   * Log lors d'une action utilisateur
   */
  userAction(context: string, action: string, data?: Record<string, any>): void {
    if (!this.enabled) return
    console.log(`${this.prefix} [${context}] 👆 USER_ACTION`, { action, ...data })
  }

  /**
   * Log lors d'une récupération de données
   */
  dataFetch(context: string, endpoint: string, data?: Record<string, any>): void {
    if (!this.enabled) return
    console.debug(`${this.prefix} [${context}] 📡 DATA_FETCH`, { endpoint, ...data })
  }

  /**
   * Log lors d'un événement d'authentification
   */
  authEvent(event: string, data?: Record<string, any>): void {
    if (!this.enabled) return
    console.log(`${this.prefix} [Auth] 🔐 AUTH_EVENT`, { event, ...data })
  }

  /**
   * Log lors d'un événement temps réel
   */
  realtimeEvent(channel: string, eventType: string, data?: Record<string, any>): void {
    if (!this.enabled) return
    console.debug(`${this.prefix} [Realtime] ⚡ REALTIME_EVENT`, { channel, eventType, ...data })
  }

  /**
   * Log d'erreur (toujours affiché, même en production pour le debugging)
   */
  error(context: string, error: Error | string, data?: Record<string, any>): void {
    const errorMessage = error instanceof Error ? error.message : error
    console.error(`${this.prefix} [${context}] ❌ ERROR`, errorMessage, data || '')
  }

  /**
   * Log d'avertissement
   */
  warn(context: string, message: string, data?: Record<string, any>): void {
    if (!this.enabled) return
    console.warn(`${this.prefix} [${context}] ⚠️ WARN`, message, data || '')
  }
}

// Instance singleton
export const logger = new AppLogger()



