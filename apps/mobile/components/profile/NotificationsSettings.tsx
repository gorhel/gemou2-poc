'use client'

import React, { useState, useEffect } from 'react'
import { View, Text, Switch, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native'
import { supabase } from '../../lib'
import { UserSettings } from '../../../../packages/database/types'

interface NotificationsSettingsProps {
  userId: string
  onUpdate?: () => void
}

interface NotificationCategory {
  title: string
  icon: string
  settings: {
    label: string
    inapp: string
    push: string
    email: string
  }
}

export function NotificationsSettings({ userId, onUpdate }: NotificationsSettingsProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [userId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Créer un enregistrement par défaut
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert({ user_id: userId })
            .select()
            .single()

          if (insertError) throw insertError
          setSettings(newSettings)
        } else {
          throw fetchError
        }
      } else {
        setSettings(data)
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des paramètres:', error)
      setError(error.message || 'Erreur lors du chargement des paramètres')
      Alert.alert('Erreur', 'Impossible de charger les paramètres')
    } finally {
      setLoading(false)
    }
  }

  const updateNotification = async (field: string, value: boolean) => {
    if (!settings) return

    setUpdating(true)
    setError(null)
    try {
      const updateData: any = { [field]: value, updated_at: new Date().toISOString() }

      const { error: updateError } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', userId)

      if (updateError) throw updateError

      setSettings(prev => prev ? { ...prev, [field]: value } : null)
      setSuccess(true)
      onUpdate?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      setError(error.message || 'Impossible de mettre à jour')
      Alert.alert('Erreur', 'Impossible de mettre à jour les paramètres')
    } finally {
      setUpdating(false)
    }
  }

  const renderNotificationCategory = (category: NotificationCategory) => {
    if (!settings) return null

    const { label, inapp, push, email } = category.settings

    return (
      <View style={styles.category}>
        <Text style={styles.categoryTitle}>
          {category.icon} {category.title}
        </Text>
        
        {/* In-app */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>In-app - {label}</Text>
          </View>
          <Switch
            value={settings[inapp as keyof UserSettings] as boolean || false}
            onValueChange={(value) => updateNotification(inapp, value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={(settings[inapp as keyof UserSettings] as boolean) ? '#3b82f6' : '#f3f4f6'}
          />
        </View>

        {/* Push */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push - {label}</Text>
          </View>
          <Switch
            value={settings[push as keyof UserSettings] as boolean || false}
            onValueChange={(value) => updateNotification(push, value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={(settings[push as keyof UserSettings] as boolean) ? '#3b82f6' : '#f3f4f6'}
          />
        </View>

        {/* Email */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email - {label}</Text>
          </View>
          <Switch
            value={settings[email as keyof UserSettings] as boolean || false}
            onValueChange={(value) => updateNotification(email, value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={(settings[email as keyof UserSettings] as boolean) ? '#3b82f6' : '#f3f4f6'}
          />
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  if (!settings) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Impossible de charger les paramètres</Text>
      </View>
    )
  }

  const categories: NotificationCategory[] = [
    {
      title: 'Demandes d\'amitié',
      icon: '👥',
      settings: {
        label: 'Demandes d\'amitié',
        inapp: 'notify_friend_request_inapp',
        push: 'notify_friend_request_push',
        email: 'notify_friend_request_email'
      }
    },
    {
      title: 'Acceptations d\'amitié',
      icon: '✅',
      settings: {
        label: 'Acceptations d\'amitié',
        inapp: 'notify_friend_accepted_inapp',
        push: 'notify_friend_accepted_push',
        email: 'notify_friend_accepted_email'
      }
    },
    {
      title: 'Événements',
      icon: '📅',
      settings: {
        label: 'Nouveaux événements',
        inapp: 'notify_events_inapp',
        push: 'notify_events_push',
        email: 'notify_events_email'
      }
    },
    {
      title: 'Invitations d\'événements',
      icon: '🎫',
      settings: {
        label: 'Invitations',
        inapp: 'notify_event_invitations_inapp',
        push: 'notify_event_invitations_push',
        email: 'notify_event_invitations_email'
      }
    },
    {
      title: 'Rappels d\'événements',
      icon: '⏰',
      settings: {
        label: 'Rappels',
        inapp: 'notify_event_reminders_inapp',
        push: 'notify_event_reminders_push',
        email: 'notify_event_reminders_email'
      }
    },
    {
      title: 'Messages',
      icon: '💬',
      settings: {
        label: 'Nouveaux messages',
        inapp: 'notify_messages_inapp',
        push: 'notify_messages_push',
        email: 'notify_messages_email'
      }
    },
    {
      title: 'Réponses aux messages',
      icon: '↩️',
      settings: {
        label: 'Réponses',
        inapp: 'notify_message_replies_inapp',
        push: 'notify_message_replies_push',
        email: 'notify_message_replies_email'
      }
    }
  ]

  return (
    <ScrollView style={styles.container}>
      {/* Messages de succès/erreur */}
      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✅ Paramètres mis à jour !</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Catégories de notifications */}
      {categories.map((category, index) => (
        <View key={index} style={styles.section}>
          {renderNotificationCategory(category)}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f8'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280'
  },
  successContainer: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  successText: {
    color: '#065f46',
    fontSize: 14,
    fontWeight: '500'
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  category: {
    marginBottom: 8
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  settingInfo: {
    flex: 1,
    marginRight: 16
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151'
  }
})

