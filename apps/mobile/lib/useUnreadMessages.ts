/**
 * Hook pour gérer les messages non lus
 * Utilise un état global avec Supabase Realtime pour les mises à jour en temps réel
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'
import { setBadgeCount } from './notifications'

interface UnreadCount {
  conversation_id: string
  unread_count: number
}

interface UseUnreadMessagesResult {
  /** Nombre total de messages non lus */
  totalUnread: number
  /** Comptage par conversation */
  unreadByConversation: Map<string, number>
  /** Rafraîchir les compteurs */
  refresh: () => Promise<void>
  /** Marquer une conversation comme lue */
  markAsRead: (conversationId: string) => Promise<void>
  /** État de chargement */
  isLoading: boolean
  /** Erreur éventuelle */
  error: Error | null
}

/**
 * Hook pour suivre les messages non lus de l'utilisateur courant
 * Se met à jour automatiquement via Supabase Realtime
 */
export function useUnreadMessages(): UseUnreadMessagesResult {
  const [totalUnread, setTotalUnread] = useState<number>(0)
  const [unreadByConversation, setUnreadByConversation] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const subscriptionRef = useRef<any>(null)

  // Récupérer l'utilisateur courant
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fonction pour charger les compteurs
  const loadUnreadCounts = useCallback(async () => {
    if (!userId) {
      setTotalUnread(0)
      setUnreadByConversation(new Map())
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Récupérer les compteurs par conversation
      const { data, error: rpcError } = await supabase.rpc('get_unread_messages_count', {
        p_user_id: userId,
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      // Construire la map des compteurs
      const countsMap = new Map<string, number>()
      let total = 0

      if (data) {
        for (const item of data as UnreadCount[]) {
          countsMap.set(item.conversation_id, Number(item.unread_count))
          total += Number(item.unread_count)
        }
      }

      setUnreadByConversation(countsMap)
      setTotalUnread(total)

      // Mettre à jour le badge de l'app
      await setBadgeCount(total)
    } catch (err) {
      console.error('[useUnreadMessages] Error loading unread counts:', err)
      setError(err instanceof Error ? err : new Error('Failed to load unread counts'))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Charger les compteurs initiaux et s'abonner aux changements
  useEffect(() => {
    if (!userId) return

    loadUnreadCounts()

    // S'abonner aux nouveaux messages via Realtime
    const subscription = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          // Un nouveau message a été créé
          const newMessage = payload.new as { sender_id: string; conversation_id: string }
          
          // Ne pas compter ses propres messages
          if (newMessage.sender_id === userId) return
          
          // Vérifier si l'utilisateur est membre de cette conversation
          const { data: memberCheck } = await supabase
            .from('conversation_members')
            .select('conversation_id')
            .eq('conversation_id', newMessage.conversation_id)
            .eq('user_id', userId)
            .single()
          
          if (memberCheck) {
            // Recharger les compteurs
            await loadUnreadCounts()
          }
        }
      )
      .subscribe()

    subscriptionRef.current = subscription

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [userId, loadUnreadCounts])

  // Fonction pour marquer une conversation comme lue
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!userId) return

    try {
      const { error: rpcError } = await supabase.rpc('mark_conversation_as_read', {
        p_conversation_id: conversationId,
        p_user_id: userId,
      })

      if (rpcError) {
        console.error('[useUnreadMessages] Error marking as read:', rpcError)
        return
      }

      // Mettre à jour l'état local immédiatement
      setUnreadByConversation(prev => {
        const newMap = new Map(prev)
        const previousCount = newMap.get(conversationId) || 0
        newMap.delete(conversationId)
        
        // Mettre à jour le total
        setTotalUnread(current => Math.max(0, current - previousCount))
        
        return newMap
      })

      // Mettre à jour le badge
      const newTotal = Math.max(0, totalUnread - (unreadByConversation.get(conversationId) || 0))
      await setBadgeCount(newTotal)
    } catch (err) {
      console.error('[useUnreadMessages] Exception marking as read:', err)
    }
  }, [userId, totalUnread, unreadByConversation])

  return {
    totalUnread,
    unreadByConversation,
    refresh: loadUnreadCounts,
    markAsRead,
    isLoading,
    error,
  }
}

/**
 * Hook simplifié pour obtenir uniquement le nombre total de messages non lus
 * Utilisé principalement pour le badge dans la navigation
 */
export function useTotalUnreadCount(): number {
  const { totalUnread } = useUnreadMessages()
  return totalUnread
}

