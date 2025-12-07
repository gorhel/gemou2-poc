/**
 * Hook pour gérer les statistiques du profil avec cache
 * 
 * Charge les statistiques depuis le cache si disponibles,
 * sinon effectue une requête et met en cache le résultat.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib'
import { logger } from '../lib/logger'
import { 
  getFromCache, 
  setInCache, 
  invalidateCache,
  getFromCacheSync,
  setInCacheSync,
  isCacheValid,
  CACHE_KEYS, 
  CACHE_DURATIONS 
} from '../lib/cache'

export interface ProfileStats {
  eventsCreated: number
  eventsParticipated: number
  gamesOwned: number
  friends: number
}

interface UseProfileStatsOptions {
  /** Durée de validité du cache en ms */
  cacheDuration?: number
  /** Forcer le rafraîchissement même si le cache est valide */
  forceRefresh?: boolean
}

interface UseProfileStatsReturn {
  stats: ProfileStats
  loading: boolean
  error: string | null
  /** Rafraîchit les stats depuis la base de données */
  refresh: () => Promise<void>
  /** Invalide le cache et force un rechargement */
  invalidate: () => Promise<void>
  /** Indique si les données proviennent du cache */
  fromCache: boolean
}

const DEFAULT_STATS: ProfileStats = {
  eventsCreated: 0,
  eventsParticipated: 0,
  gamesOwned: 0,
  friends: 0
}

export function useProfileStats(
  userId: string | null | undefined,
  options: UseProfileStatsOptions = {}
): UseProfileStatsReturn {
  const { 
    cacheDuration = CACHE_DURATIONS.MEDIUM,
    forceRefresh = false 
  } = options

  const [stats, setStats] = useState<ProfileStats>(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)
  
  const isInitialized = useRef(false)
  const isFetching = useRef(false)

  /**
   * Charge les statistiques depuis la base de données
   */
  const fetchStats = useCallback(async (skipCache: boolean = false): Promise<void> => {
    if (!userId || isFetching.current) return

    const cacheKey = CACHE_KEYS.PROFILE_STATS(userId)

    // 1. Vérifier le cache si pas de skip
    if (!skipCache) {
      // D'abord synchrone (mémoire)
      const cachedSync = getFromCacheSync<ProfileStats>(cacheKey)
      if (cachedSync) {
        setStats(cachedSync)
        setFromCache(true)
        setLoading(false)
        logger.pageLoad('ProfileStats', { source: 'memory_cache', userId })
        return
      }

      // Puis async (SecureStore)
      const cached = await getFromCache<ProfileStats>(cacheKey)
      if (cached) {
        setStats(cached)
        setFromCache(true)
        setLoading(false)
        logger.pageLoad('ProfileStats', { source: 'storage_cache', userId })
        return
      }
    }

    // 2. Charger depuis la base de données
    isFetching.current = true
    setLoading(true)
    setError(null)

    try {
      logger.dataFetch('ProfileStats', 'profile_stats', { userId })

      const [eventsCreatedResult, eventsParticipatedResult, gamesOwnedResult, friendsResult] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('creator_id', userId),
        supabase.from('event_participants').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('user_games').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('friends')
          .select('id', { count: 'exact', head: true })
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq('friendship_status', 'accepted')
          .is('deleted_at', null)
      ])

      const newStats: ProfileStats = {
        eventsCreated: eventsCreatedResult.count || 0,
        eventsParticipated: eventsParticipatedResult.count || 0,
        gamesOwned: gamesOwnedResult.count || 0,
        friends: friendsResult.count || 0
      }

      // Logger les erreurs sans bloquer
      if (eventsCreatedResult.error) {
        logger.warn('ProfileStats', 'Erreur chargement événements créés')
      }
      if (eventsParticipatedResult.error) {
        logger.warn('ProfileStats', 'Erreur chargement participations')
      }
      if (gamesOwnedResult.error) {
        logger.warn('ProfileStats', 'Erreur chargement jeux')
      }
      if (friendsResult.error) {
        logger.warn('ProfileStats', 'Erreur chargement amis')
      }

      // 3. Mettre en cache
      setInCacheSync(cacheKey, newStats, cacheDuration)
      // Persister aussi dans SecureStore pour la prochaine session
      await setInCache(cacheKey, newStats, cacheDuration, true)

      setStats(newStats)
      setFromCache(false)
      
      logger.pageLoad('ProfileStats', { source: 'database', userId, stats: newStats })

    } catch (err) {
      logger.error('ProfileStats', err as Error, { action: 'fetchStats' })
      setError('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [userId, cacheDuration])

  /**
   * Force le rafraîchissement des données
   */
  const refresh = useCallback(async (): Promise<void> => {
    logger.userAction('ProfileStats', 'refresh', { userId })
    await fetchStats(true)
  }, [fetchStats, userId])

  /**
   * Invalide le cache et recharge
   */
  const invalidate = useCallback(async (): Promise<void> => {
    if (userId) {
      await invalidateCache(CACHE_KEYS.PROFILE_STATS(userId))
      logger.userAction('ProfileStats', 'invalidate', { userId })
      await fetchStats(true)
    }
  }, [userId, fetchStats])

  // Charger les stats au montage ou changement d'userId
  useEffect(() => {
    if (userId) {
      // Premier chargement ou changement d'utilisateur
      if (!isInitialized.current || forceRefresh) {
        fetchStats(forceRefresh)
        isInitialized.current = true
      }
    } else {
      setStats(DEFAULT_STATS)
      setLoading(false)
    }
  }, [userId, fetchStats, forceRefresh])

  return {
    stats,
    loading,
    error,
    refresh,
    invalidate,
    fromCache
  }
}

/**
 * Invalide le cache des statistiques pour un utilisateur
 * À appeler après une action qui modifie les stats (ajout d'ami, création d'événement, etc.)
 */
export async function invalidateProfileStatsCache(userId: string): Promise<void> {
  await invalidateCache(CACHE_KEYS.PROFILE_STATS(userId))
}



