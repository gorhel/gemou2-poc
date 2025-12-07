/**
 * Système de cache pour l'application web
 * 
 * Permet de stocker des données en mémoire avec une durée de validité
 * pour éviter les requêtes répétées lors des rechargements de page.
 */

import { logger } from './logger'

// Durées de cache par défaut (en millisecondes)
export const CACHE_DURATIONS = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 heure
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Cache en mémoire pour les données fréquemment accédées
const memoryCache = new Map<string, CacheEntry<any>>()

/**
 * Récupère une entrée du cache mémoire
 */
export function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T
  }
  
  // Supprimer l'entrée expirée
  if (entry) {
    memoryCache.delete(key)
  }
  
  return null
}

/**
 * Récupère une entrée du cache avec fallback vers localStorage (côté client uniquement)
 */
export function getFromCacheWithStorage<T>(key: string): T | null {
  // D'abord vérifier le cache mémoire
  const memoryResult = getFromCache<T>(key)
  if (memoryResult) return memoryResult

  // Puis vérifier localStorage (côté client)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`cache_${key}`)
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored)
        if (Date.now() < entry.expiresAt) {
          // Restaurer dans le cache mémoire
          memoryCache.set(key, entry)
          return entry.data
        }
        // Supprimer l'entrée expirée
        localStorage.removeItem(`cache_${key}`)
      }
    } catch (error) {
      // Ignorer les erreurs de parsing
    }
  }

  return null
}

/**
 * Stocke une entrée dans le cache mémoire
 */
export function setInCache<T>(
  key: string, 
  data: T, 
  duration: number = CACHE_DURATIONS.MEDIUM
): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + duration,
  }
  memoryCache.set(key, entry)
}

/**
 * Stocke une entrée dans le cache avec persistance localStorage
 */
export function setInCacheWithStorage<T>(
  key: string, 
  data: T, 
  duration: number = CACHE_DURATIONS.MEDIUM
): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + duration,
  }
  
  // Stocker en mémoire
  memoryCache.set(key, entry)
  
  // Stocker dans localStorage (côté client)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
    } catch (error) {
      // Ignorer les erreurs (quota dépassé, etc.)
    }
  }
}

/**
 * Invalide une entrée du cache
 */
export function invalidateCache(key: string): void {
  memoryCache.delete(key)
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      // Ignorer
    }
  }
}

/**
 * Invalide toutes les entrées du cache commençant par un préfixe
 */
export function invalidateCacheByPrefix(prefix: string): void {
  // Invalider le cache mémoire
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key)
    }
  }
  
  // Invalider localStorage
  if (typeof window !== 'undefined') {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(`cache_${prefix}`)) {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      // Ignorer
    }
  }
}

/**
 * Nettoie toutes les entrées expirées du cache
 */
export function cleanExpiredCache(): void {
  const now = Date.now()

  // Nettoyer le cache mémoire
  for (const [key, entry] of memoryCache.entries()) {
    if (now >= entry.expiresAt) {
      memoryCache.delete(key)
    }
  }
}

/**
 * Vide entièrement le cache
 */
export function clearAllCache(): void {
  memoryCache.clear()
}

/**
 * Vérifie si une entrée de cache existe et est valide
 */
export function isCacheValid(key: string): boolean {
  const entry = memoryCache.get(key)
  return entry !== undefined && Date.now() < entry.expiresAt
}

// Clés de cache pour les différentes données
export const CACHE_KEYS = {
  PROFILE_STATS: (userId: string) => `profile_stats_${userId}`,
  PROFILE_DATA: (userId: string) => `profile_data_${userId}`,
  FRIENDS_LIST: (userId: string) => `friends_list_${userId}`,
  FRIENDS_COUNT: (userId: string) => `friends_count_${userId}`,
  USER_EVENTS: (userId: string) => `user_events_${userId}`,
  EVENT_PARTICIPANTS: (eventId: string) => `event_participants_${eventId}`,
}



