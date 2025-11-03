/**
 * Hook pour fournir les handlers par défaut pour les actions du header
 * Toutes les actions définies dans headers.config.ts doivent avoir un handler ici
 */

import { router } from 'expo-router'
import { supabase } from '../lib/supabase'
import { Alert } from 'react-native'

export function useDefaultActionHandlers() {
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut()
              router.replace('/login')
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error)
              Alert.alert('Erreur', 'Impossible de se déconnecter')
            }
          }
        }
      ]
    )
  }

  const handleCreateTrade = () => {
    router.push('/create-trade')
  }

  const handleCreateEvent = () => {
    router.push('/create-event')
  }

  const handleSearch = () => {
    router.push('/search')
  }

  const handleSettings = () => {
    // TODO: Créer la page des paramètres
    Alert.alert('Paramètres', 'Page des paramètres à venir')
  }

  const handleEventMenu = () => {
    // Ce handler devrait être override par la page de détail de l'événement
    console.warn('handleEventMenu devrait être override par la page')
  }

  const handleTradeMenu = () => {
    // Ce handler devrait être override par la page de détail de l'annonce
    console.warn('handleTradeMenu devrait être override par la page')
  }

  const handleFavoriteGame = () => {
    // Ce handler devrait être override par la page de détail du jeu
    console.warn('handleFavoriteGame devrait être override par la page')
  }

  // Mapping des actions vers leurs handlers
  const defaultHandlers: Record<string, () => void> = {
    'logout': handleLogout,
    'create-trade': handleCreateTrade,
    '/create-trade': handleCreateTrade, // Support des deux formats
    'create-event': handleCreateEvent,
    '/create-event': handleCreateEvent,
    'search': handleSearch,
    'settings': handleSettings,
    'event-menu': handleEventMenu,
    'trade-menu': handleTradeMenu,
    'favorite-game': handleFavoriteGame,
  }

  return defaultHandlers
}

