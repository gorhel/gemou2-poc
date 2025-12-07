'use client'

import React, { useState, useEffect } from 'react'
import { View, Text, Switch, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native'
import { supabase } from '../../lib'
import { UserSettings } from '../../../../packages/database/types'

interface PrivacySettingsProps {
  userId: string
  onUpdate?: () => void
}

export function PrivacySettings({ userId, onUpdate }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [profileSettings, setProfileSettings] = useState({
    friends_list_public: false
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    profile_visibility: 'public',
    allow_friend_requests: 'all',
    email_visibility: 'private',
    location_visibility: 'friends',
    games_collection_visibility: 'public',
    friends_list_public: false
  })

  useEffect(() => {
    loadSettings()
  }, [userId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger user_settings
      const { data: userSettingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Si pas de settings, créer un enregistrement par défaut
      if (settingsError && settingsError.code === 'PGRST116') {
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({ user_id: userId })
          .select()
          .single()

        if (insertError) throw insertError
        setSettings(newSettings)
      } else if (settingsError) {
        throw settingsError
      } else {
        setSettings(userSettingsData)
      }

      // Charger friends_list_public depuis profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('friends_list_public')
        .eq('id', userId)
        .single()

      if (!profileError && profileData) {
        setProfileSettings({
          friends_list_public: profileData.friends_list_public || false
        })
        setFormData(prev => ({
          ...prev,
          friends_list_public: profileData.friends_list_public || false
        }))
      }

      // Mettre à jour formData avec les settings
      if (userSettingsData || newSettings) {
        const currentSettings = userSettingsData || newSettings
        setFormData(prev => ({
          ...prev,
          profile_visibility: currentSettings.profile_visibility || 'public',
          allow_friend_requests: currentSettings.allow_friend_requests || 'all',
          email_visibility: currentSettings.email_visibility || 'private',
          location_visibility: currentSettings.location_visibility || 'friends',
          games_collection_visibility: currentSettings.games_collection_visibility || 'public'
        }))
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des paramètres:', error)
      setError(error.message || 'Erreur lors du chargement des paramètres')
      Alert.alert('Erreur', 'Impossible de charger les paramètres')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (updates: any) => {
    setUpdating(true)
    setError(null)
    try {
      // Mettre à jour user_settings
      const settingsUpdate: any = {}
      if (updates.profile_visibility !== undefined) settingsUpdate.profile_visibility = updates.profile_visibility
      if (updates.allow_friend_requests !== undefined) settingsUpdate.allow_friend_requests = updates.allow_friend_requests
      if (updates.email_visibility !== undefined) settingsUpdate.email_visibility = updates.email_visibility
      if (updates.location_visibility !== undefined) settingsUpdate.location_visibility = updates.location_visibility
      if (updates.games_collection_visibility !== undefined) settingsUpdate.games_collection_visibility = updates.games_collection_visibility

      if (Object.keys(settingsUpdate).length > 0) {
        settingsUpdate.updated_at = new Date().toISOString()
        const { error: settingsError } = await supabase
          .from('user_settings')
          .update(settingsUpdate)
          .eq('user_id', userId)

        if (settingsError) throw settingsError
      }

      // Mettre à jour friends_list_public dans profiles
      if (updates.friends_list_public !== undefined) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ friends_list_public: updates.friends_list_public })
          .eq('id', userId)

        if (profileError) throw profileError
      }

      setFormData(prev => ({ ...prev, ...updates }))
      setSuccess(true)
      onUpdate?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      setError(error.message || 'Impossible de mettre à jour les paramètres')
      Alert.alert('Erreur', 'Impossible de mettre à jour les paramètres')
    } finally {
      setUpdating(false)
    }
  }

  const renderVisibilityPicker = (
    label: string,
    field: string,
    options: { value: string; label: string }[],
    currentValue: string
  ) => {
    return (
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <View style={styles.pickerContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.pickerOption,
                currentValue === option.value && styles.pickerOptionActive
              ]}
              onPress={() => updateSetting({ [field]: option.value })}
              disabled={updating}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  currentValue === option.value && styles.pickerOptionTextActive
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
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

  return (
    <ScrollView style={styles.container}>
      {/* Message de succès */}
      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✅ Paramètres mis à jour avec succès !</Text>
        </View>
      )}

      {/* Message d'erreur */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Section Visibilité du profil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Visibilité du profil</Text>
        
        {renderVisibilityPicker(
          'Visibilité du profil',
          'profile_visibility',
          [
            { value: 'public', label: 'Public' },
            { value: 'friends', label: 'Amis uniquement' },
            { value: 'private', label: 'Privé' }
          ],
          formData.profile_visibility
        )}

        {renderVisibilityPicker(
          'Autoriser les demandes d\'amitié',
          'allow_friend_requests',
          [
            { value: 'all', label: 'Tout le monde' },
            { value: 'friends_only', label: 'Amis d\'amis uniquement' }
          ],
          formData.allow_friend_requests
        )}
      </View>

      {/* Section Visibilité des informations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👁️ Visibilité des informations</Text>
        
        {renderVisibilityPicker(
          'Visibilité de l\'email',
          'email_visibility',
          [
            { value: 'private', label: 'Privé' },
            { value: 'friends', label: 'Amis uniquement' },
            { value: 'public', label: 'Public' }
          ],
          formData.email_visibility
        )}

        {renderVisibilityPicker(
          'Visibilité de la localisation',
          'location_visibility',
          [
            { value: 'private', label: 'Privé' },
            { value: 'friends', label: 'Amis uniquement' },
            { value: 'public', label: 'Public' }
          ],
          formData.location_visibility
        )}

        {renderVisibilityPicker(
          'Visibilité de la collection de jeux',
          'games_collection_visibility',
          [
            { value: 'public', label: 'Public' },
            { value: 'friends', label: 'Amis uniquement' },
            { value: 'private', label: 'Privé' }
          ],
          formData.games_collection_visibility
        )}
      </View>

      {/* Section Amis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Amis & Recherche</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Liste d'amis publique</Text>
            <Text style={styles.settingDescription}>
              Si activé, tout le monde peut voir vos amis
            </Text>
          </View>
          <Switch
            value={formData.friends_list_public}
            onValueChange={(value) => updateSetting({ friends_list_public: value })}
            disabled={updating}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={formData.friends_list_public ? '#3b82f6' : '#f3f4f6'}
          />
        </View>
      </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16
  },
  settingRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  settingInfo: {
    marginBottom: 8
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  pickerOptionActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6'
  },
  pickerOptionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500'
  },
  pickerOptionTextActive: {
    color: 'white'
  }
})


