/**
 * Service de notifications push pour l'application mobile
 * Gère l'enregistrement des tokens et la réception des notifications
 */

import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { supabase } from './supabase'

// Configuration par défaut des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export interface PushNotificationState {
  expoPushToken: string | null
  notification: Notifications.Notification | null
}

/**
 * Vérifie si le device peut recevoir des notifications push
 */
export function canReceivePushNotifications(): boolean {
  return Device.isDevice && Platform.OS !== 'web'
}

/**
 * Demande les permissions de notification et récupère le token Expo Push
 * @returns Le token Expo Push ou null si non disponible
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Sur le web, on ne supporte pas les push notifications Expo
  if (Platform.OS === 'web') {
    console.log('[Notifications] Push notifications not supported on web')
    return null
  }

  // Les notifications push ne fonctionnent que sur un device physique
  if (!Device.isDevice) {
    console.log('[Notifications] Push notifications require a physical device')
    return null
  }

  try {
    // Vérifier les permissions existantes
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    // Si pas encore autorisé, demander la permission
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted')
      return null
    }

    // Récupérer le token Expo Push
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId

    if (!projectId) {
      console.log('[Notifications] No project ID found, using default')
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    })

    const token = tokenData.data
    console.log('[Notifications] Expo Push Token:', token)

    // Configuration spécifique Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
      })

      // Canal spécifique pour les messages
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        description: 'Notifications de nouveaux messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: 'default',
      })
    }

    return token
  } catch (error) {
    console.error('[Notifications] Error registering for push notifications:', error)
    return null
  }
}

/**
 * Enregistre le token push dans la base de données
 * @param userId - ID de l'utilisateur
 * @param token - Token Expo Push
 */
export async function savePushToken(userId: string, token: string): Promise<boolean> {
  try {
    const platform = Platform.OS as 'ios' | 'android' | 'web'
    
    const { error } = await supabase.rpc('upsert_push_token', {
      p_user_id: userId,
      p_token: token,
      p_platform: platform,
      p_device_id: Constants.deviceId || null,
    })

    if (error) {
      console.error('[Notifications] Error saving push token:', error)
      return false
    }

    console.log('[Notifications] Push token saved successfully')
    return true
  } catch (error) {
    console.error('[Notifications] Exception saving push token:', error)
    return false
  }
}

/**
 * Désactive un token push (déconnexion par exemple)
 * @param userId - ID de l'utilisateur
 * @param token - Token à désactiver
 */
export async function deactivatePushToken(userId: string, token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('token', token)

    if (error) {
      console.error('[Notifications] Error deactivating push token:', error)
      return false
    }

    console.log('[Notifications] Push token deactivated')
    return true
  } catch (error) {
    console.error('[Notifications] Exception deactivating push token:', error)
    return false
  }
}

/**
 * Initialise les notifications push pour l'utilisateur courant
 * @returns Le token push ou null
 */
export async function initializePushNotifications(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('[Notifications] No user logged in')
    return null
  }

  const token = await registerForPushNotificationsAsync()
  
  if (token) {
    await savePushToken(user.id, token)
  }

  return token
}

/**
 * Ajoute un listener pour les notifications reçues
 * @param callback - Fonction appelée quand une notification est reçue
 * @returns Subscription à nettoyer
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback)
}

/**
 * Ajoute un listener pour les réponses aux notifications (tap)
 * @param callback - Fonction appelée quand l'utilisateur interagit avec une notification
 * @returns Subscription à nettoyer
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback)
}

/**
 * Programme une notification locale
 * @param title - Titre de la notification
 * @param body - Corps de la notification
 * @param data - Données additionnelles
 * @param trigger - Déclencheur (par défaut immédiat)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: trigger || null,
  })
}

/**
 * Met à jour le badge de l'application
 * @param count - Nombre à afficher (0 pour masquer)
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'web') return
  
  try {
    await Notifications.setBadgeCountAsync(count)
  } catch (error) {
    console.error('[Notifications] Error setting badge count:', error)
  }
}

/**
 * Récupère le nombre de notifications en attente
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'web') return 0
  
  try {
    return await Notifications.getBadgeCountAsync()
  } catch {
    return 0
  }
}

