/**
 * Système de cache pour les données de l'application
 * 
 * Permet de stocker des données en mémoire avec une durée de validité
 * pour éviter les requêtes répétées lors des rechargements de page.
 * 
 * Utilise un cache mémoire pour les performances et SecureStore pour la persistance.
 */

import * as SecureStore from 'expo-secure-store'
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

// Liste des clés de cache pour le nettoyage
const cacheKeysList: Set<string> = new Set()

/**
 * Récupère une entrée du cache
 * Vérifie d'abord le cache mémoire, puis SecureStore si nécessaire
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  // 1. Vérifier le cache mémoire
  const memoryEntry = memoryCache.get(key)
  if (memoryEntry && Date.now() < memoryEntry.expiresAt) {
    return memoryEntry.data as T
  }

  // 2. Vérifier SecureStore (uniquement pour les données importantes)
  try {
    const storedValue = await SecureStore.getItemAsync(`cache_${key}`)
    if (storedValue) {
      const entry: CacheEntry<T> = JSON.parse(storedValue)
      if (Date.now() < entry.expiresAt) {
        // Restaurer dans le cache mémoire
        memoryCache.set(key, entry)
        return entry.data
      }
      // Supprimer l'entrée expirée
      await SecureStore.deleteItemAsync(`cache_${key}`)
    }
  } catch (error) {
    // SecureStore peut échouer sur le web, on ignore silencieusement
  }

  return null
}

/**
 * Stocke une entrée dans le cache
 */
export async function setInCache<T>(
  key: string, 
  data: T, 
  duration: number = CACHE_DURATIONS.MEDIUM,
  persist: boolean = false
): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + duration,
  }

  // Stocker en mémoire
  memoryCache.set(key, entry)
  cacheKeysList.add(key)

  // Stocker dans SecureStore si persistance demandée
  if (persist) {
    try {
      await SecureStore.setItemAsync(`cache_${key}`, JSON.stringify(entry))
    } catch (error) {
      // SecureStore peut échouer sur le web, on ignore silencieusement
    }
  }
}

/**
 * Invalide une entrée du cache
 */
export async function invalidateCache(key: string): Promise<void> {
  memoryCache.delete(key)
  cacheKeysList.delete(key)
  try {
    await SecureStore.deleteItemAsync(`cache_${key}`)
  } catch (error) {
    // Ignorer les erreurs
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
      cacheKeysList.delete(key)
    }
  }
}

/**
 * Nettoie toutes les entrées expirées du cache mémoire
 */
export function cleanExpiredCache(): void {
  const now = Date.now()

  // Nettoyer le cache mémoire
  for (const [key, entry] of memoryCache.entries()) {
    if (now >= entry.expiresAt) {
      memoryCache.delete(key)
      cacheKeysList.delete(key)
    }
  }
}

/**
 * Vide entièrement le cache mémoire
 */
export function clearAllCache(): void {
  memoryCache.clear()
  cacheKeysList.clear()
}

/**
 * Vérifie si une entrée de cache existe et est valide
 */
export function isCacheValid(key: string): boolean {
  const entry = memoryCache.get(key)
  return entry !== undefined && Date.now() < entry.expiresAt
}

/**
 * Récupère une entrée du cache de manière synchrone (mémoire uniquement)
 */
export function getFromCacheSync<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T
  }
  return null
}

/**
 * Stocke une entrée dans le cache de manière synchrone (mémoire uniquement)
 */
export function setInCacheSync<T>(
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
  cacheKeysList.add(key)
}

// Clés de cache pour les différentes données
export const CACHE_KEYS = {
  PROFILE_STATS: (userId: string) => `profile_stats_${userId}`,
  PROFILE_DATA: (userId: string) => `profile_data_${userId}`,
  FRIENDS_LIST: (userId: string) => `friends_list_${userId}`,
  FRIENDS_COUNT: (userId: string) => `friends_count_${userId}`,
  USER_EVENTS: (userId: string) => `user_events_${userId}`,
}

