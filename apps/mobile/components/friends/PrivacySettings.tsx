import React, { useState, useEffect } from 'react'
import { View, Text, Switch, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { supabase } from '../../lib'
import { PrivacySettings as PrivacySettingsType } from './types'

interface PrivacySettingsProps {
  userId: string
}

export function PrivacySettings({ userId }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<PrivacySettingsType>({
    friends_list_public: false,
    notify_friend_request_inapp: true,
    notify_friend_request_push: true,
    notify_friend_request_email: false,
    notify_friend_accepted_inapp: true,
    notify_friend_accepted_push: true,
    notify_friend_accepted_email: false
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [userId])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          friends_list_public,
          notify_friend_request_inapp,
          notify_friend_request_push,
          notify_friend_request_email,
          notify_friend_accepted_inapp,
          notify_friend_accepted_push,
          notify_friend_accepted_email
        `)
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        setSettings(data as PrivacySettingsType)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof PrivacySettingsType, value: boolean) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('id', userId)

      if (error) throw error

      setSettings(prev => ({ ...prev, [key]: value }))
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      Alert.alert('Erreur', 'Impossible de mettre à jour les paramètres')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Section Visibilité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Amis & Recherche</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Liste d'amis publique</Text>
            <Text style={styles.settingDescription}>
              Si activé, tout le monde peut voir vos amis
            </Text>
          </View>
          <Switch
            value={settings.friends_list_public}
            onValueChange={(value) => updateSetting('friends_list_public', value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={settings.friends_list_public ? '#3b82f6' : '#f3f4f6'}
          />
        </View>
      </View>

      {/* Section Notifications - Demandes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications - Demandes d'amitié</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>In-app</Text>
          </View>
          <Switch
            value={settings.notify_friend_request_inapp}
            onValueChange={(value) => updateSetting('notify_friend_request_inapp', value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={settings.notify_friend_request_inapp ? '#3b82f6' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push</Text>
          </View>
          <Switch
            value={settings.notify_friend_request_push}
            onValueChange={(value) => updateSetting('notify_friend_request_push', value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={settings.notify_friend_request_push ? '#3b82f6' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email</Text>
          </View>
          <Switch
            value={settings.notify_friend_request_email}
            onValueChange={(value) => updateSetting('notify_friend_request_email', value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={settings.notify_friend_request_email ? '#3b82f6' : '#f3f4f6'}
          />
        </View>
      </View>

      {/* Section Notifications - Acceptations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications - Acceptations</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>In-app</Text>
          </View>
          <Switch
            value={settings.notify_friend_accepted_inapp}
            onValueChange={(value) => updateSetting('notify_friend_accepted_inapp', value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={settings.notify_friend_accepted_inapp ? '#3b82f6' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push</Text>
          </View>
          <Switch
            value={settings.notify_friend_accepted_push}
            onValueChange={(value) => updateSetting('notify_friend_accepted_push', value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={settings.notify_friend_accepted_push ? '#3b82f6' : '#f3f4f6'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email</Text>
          </View>
          <Switch
            value={settings.notify_friend_accepted_email}
            onValueChange={(value) => updateSetting('notify_friend_accepted_email', value)}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={settings.notify_friend_accepted_email ? '#3b82f6' : '#f3f4f6'}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
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
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
})




