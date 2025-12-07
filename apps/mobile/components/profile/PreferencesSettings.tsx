'use client'

import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native'
import { supabase } from '../../lib'
import { UserSettings } from '../../../../packages/database/types'

interface PreferencesSettingsProps {
  userId: string
  onUpdate?: () => void
}

interface PreferenceOption {
  label: string
  value: string
}

export function PreferencesSettings({ userId, onUpdate }: PreferencesSettingsProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    language: 'fr',
    timezone: 'Europe/Paris',
    date_format: 'DD/MM/YYYY',
    distance_unit: 'km',
    theme: 'auto'
  })

  const languageOptions: PreferenceOption[] = [
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
    { label: 'Deutsch', value: 'de' },
    { label: 'Italiano', value: 'it' }
  ]

  const dateFormatOptions: PreferenceOption[] = [
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
  ]

  const distanceUnitOptions: PreferenceOption[] = [
    { label: 'Kilomètres (km)', value: 'km' },
    { label: 'Miles (mi)', value: 'miles' }
  ]

  const themeOptions: PreferenceOption[] = [
    { label: 'Automatique', value: 'auto' },
    { label: 'Clair', value: 'light' },
    { label: 'Sombre', value: 'dark' }
  ]

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
        setFormData({
          language: data.language || 'fr',
          timezone: data.timezone || 'Europe/Paris',
          date_format: data.date_format || 'DD/MM/YYYY',
          distance_unit: data.distance_unit || 'km',
          theme: data.theme || 'auto'
        })
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des préférences:', error)
      setError(error.message || 'Erreur lors du chargement')
      Alert.alert('Erreur', 'Impossible de charger les préférences')
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (field: string, value: string) => {
    setUpdating(true)
    setError(null)
    try {
      const updateData: any = { [field]: value, updated_at: new Date().toISOString() }

      const { error: updateError } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', userId)

      if (updateError) throw updateError

      setFormData(prev => ({ ...prev, [field]: value }))
      setSettings(prev => prev ? { ...prev, [field]: value } : null)
      setSuccess(true)
      onUpdate?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      setError(error.message || 'Impossible de mettre à jour')
      Alert.alert('Erreur', 'Impossible de mettre à jour les préférences')
    } finally {
      setUpdating(false)
    }
  }

  const renderPreferencePicker = (
    label: string,
    field: keyof typeof formData,
    options: PreferenceOption[],
    currentValue: string
  ) => {
    return (
      <View style={styles.preferenceItem}>
        <Text style={styles.preferenceLabel}>{label}</Text>
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                currentValue === option.value && styles.optionButtonActive
              ]}
              onPress={() => updatePreference(field, option.value)}
              disabled={updating}
            >
              <Text
                style={[
                  styles.optionText,
                  currentValue === option.value && styles.optionTextActive
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
      {/* Messages de succès/erreur */}
      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✅ Préférences mises à jour !</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Section Général */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Préférences générales</Text>
        
        {renderPreferencePicker(
          'Langue',
          'language',
          languageOptions,
          formData.language
        )}

        {renderPreferencePicker(
          'Format de date',
          'date_format',
          dateFormatOptions,
          formData.date_format
        )}

        {renderPreferencePicker(
          'Unité de distance',
          'distance_unit',
          distanceUnitOptions,
          formData.distance_unit
        )}

        {renderPreferencePicker(
          'Thème',
          'theme',
          themeOptions,
          formData.theme
        )}
      </View>

      {/* Section Fuseau horaire */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 Fuseau horaire</Text>
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Fuseau horaire</Text>
          <Text style={styles.timezoneText}>
            {formData.timezone}
          </Text>
          <Text style={styles.helperText}>
            Le fuseau horaire est défini automatiquement selon votre localisation
          </Text>
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
  preferenceItem: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  optionButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6'
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500'
  },
  optionTextActive: {
    color: 'white'
  },
  timezoneText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 4
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  }
})


