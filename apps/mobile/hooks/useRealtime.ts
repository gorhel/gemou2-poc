import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Helper pour les logs de développement (seulement en mode dev)
// __DEV__ est une variable globale dans React Native/Expo
const devLog = (...args: any[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.log(...args)
  }
}

/**
 * Hook personnalisé pour s'abonner aux changements en temps réel d'une table Supabase
 * 
 * @param tableName - Nom de la table à écouter
 * @param filter - Filtre optionnel (ex: { id: 'eq.user-id' })
 * @param callback - Fonction appelée à chaque changement
 * @param enabled - Activer/désactiver l'abonnement (par défaut: true)
 * 
 * @example
 * ```tsx
 * useRealtime('profiles', { id: `eq.${userId}` }, (payload) => {
 *   console.log('Changement détecté:', payload)
 * })
 * ```
 */
export function useRealtime<T = any>(
  tableName: string,
  filter?: Record<string, string>,
  callback?: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new?: T
    old?: T
  }) => void,
  enabled: boolean = true
) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Créer un canal pour cette table
    const channelName = `realtime:${tableName}${filter ? `:${JSON.stringify(filter)}` : ''}`
    
    // Construire la configuration du filtre
    const postgresConfig: {
      event: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
      schema: string
      table: string
      filter?: string
    } = {
      event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: tableName
    }

    // Ajouter le filtre si fourni (format: "column=value" ou "column=eq.value")
    if (filter) {
      const [column, value] = Object.entries(filter)[0]
      postgresConfig.filter = value.includes('eq.') ? value : `eq.${value}`
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        postgresConfig,
        (payload) => {
          if (callback) {
            callback({
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new as T,
              old: payload.old as T
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setError(null)
          devLog(`[useRealtime] Abonné à ${tableName}`)
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          setError(new Error(`Erreur de connexion au canal ${tableName}`))
          console.error(`[useRealtime] Erreur de connexion à ${tableName}`)
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false)
          setError(new Error(`Timeout de connexion au canal ${tableName}`))
          console.error(`[useRealtime] Timeout de connexion à ${tableName}`)
        } else if (status === 'CLOSED') {
          setIsConnected(false)
          devLog(`[useRealtime] Déconnecté de ${tableName}`)
        }
      })

    channelRef.current = channel

    // Nettoyage lors du démontage
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        setIsConnected(false)
        devLog(`[useRealtime] Nettoyage de l'abonnement à ${tableName}`)
      }
    }
  }, [tableName, enabled, JSON.stringify(filter), callback])

  return {
    isConnected,
    error,
    channel: channelRef.current
  }
}

/**
 * Hook spécialisé pour écouter les changements d'un profil utilisateur
 * 
 * @param userId - ID de l'utilisateur à écouter
 * @param callback - Fonction appelée à chaque changement
 * @param enabled - Activer/désactiver l'abonnement (par défaut: true)
 */
export function useProfileRealtime(
  userId: string | null | undefined,
  callback?: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new?: any
    old?: any
  }) => void,
  enabled: boolean = true
) {
  return useRealtime(
    'profiles',
    userId ? { id: `eq.${userId}` } : undefined,
    callback,
    enabled && !!userId
  )
}

/**
 * Hook spécialisé pour écouter les changements d'un événement
 * 
 * @param eventId - ID de l'événement à écouter
 * @param callback - Fonction appelée à chaque changement
 * @param enabled - Activer/désactiver l'abonnement (par défaut: true)
 */
export function useEventRealtime(
  eventId: string | null | undefined,
  callback?: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new?: any
    old?: any
  }) => void,
  enabled: boolean = true
) {
  return useRealtime(
    'events',
    eventId ? { id: `eq.${eventId}` } : undefined,
    callback,
    enabled && !!eventId
  )
}

