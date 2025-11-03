'use client'

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib'
import { ConfirmationModal, ModalVariant, LocationAutocomplete } from '../../components/ui'

export default function CreateEventPage() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_time: '',
    location: '',
    max_participants: 4,
    visibility: 'public' as 'public' | 'private' | 'invitation'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [modalVisible, setModalVisible] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    variant: ModalVariant
    title: string
    message: string
  }>({
    variant: 'success',
    title: '',
    message: ''
  })

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.replace('/login')
          return
        }

        setUser(user)

        // Si un eventId est fourni, charger les données de l'événement
        if (eventId) {
          setIsEditMode(true)
          await loadEventData(eventId, user.id)
        }
      } catch (error) {
        console.error('Error:', error)
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [eventId])

  const loadEventData = async (id: string, userId: string) => {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Vérifier que l'utilisateur est bien le créateur
      if (event.creator_id !== userId) {
        Alert.alert('Erreur', 'Vous n\'êtes pas autorisé à modifier cet événement')
        router.back()
        return
      }

      // Charger les données dans le formulaire
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date_time: event.date_time || '',
        location: event.location || '',
        max_participants: event.max_participants || 4,
        visibility: event.visibility || 'public'
      })
    } catch (error: any) {
      console.error('Error loading event:', error)
      Alert.alert('Erreur', 'Impossible de charger l\'événement')
      router.back()
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire'
    }

    if (!formData.date_time) {
      newErrors.date_time = 'La date et heure sont obligatoires'
    } else {
      const eventDate = new Date(formData.date_time)
      const now = new Date()
      if (eventDate <= now) {
        newErrors.date_time = 'La date doit être dans le futur'
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Le lieu est obligatoire'
    }

    if (formData.max_participants < 2) {
      newErrors.max_participants = 'Minimum 2 participants'
    }

    if (formData.max_participants > 50) {
      newErrors.max_participants = 'Maximum 50 participants'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !user) return

    setSubmitting(true)
    try {
      if (isEditMode && eventId) {
        // Mode édition : mettre à jour l'événement existant
        const { error } = await supabase
          .from('events')
          .update({
            title: formData.title,
            description: formData.description,
            date_time: formData.date_time,
            location: formData.location,
            max_participants: formData.max_participants,
            visibility: formData.visibility
          })
          .eq('id', eventId)
          .eq('creator_id', user.id) // Sécurité supplémentaire

        if (error) throw error

        setModalConfig({
          variant: 'success',
          title: 'Événement modifié',
          message: 'Votre événement a été modifié avec succès'
        })
        setModalVisible(true)
        
        setTimeout(() => {
          router.push(`/(tabs)/events/${eventId}`)
        }, 2000)
      } else {
        // Mode création : créer un nouvel événement
        const { data, error } = await supabase
          .from('events')
          .insert([
            {
              ...formData,
              creator_id: user.id,
              status: 'active',
              current_participants: 1
            }
          ])
          .select()
          .single()

        if (error) throw error

        // Ajouter le créateur comme participant
        await supabase
          .from('event_participants')
          .insert({
            event_id: data.id,
            user_id: user.id,
            status: 'registered'
          })

        setModalConfig({
          variant: 'success',
          title: 'Événement créé !',
          message: 'Votre événement a été créé avec succès'
        })
        setModalVisible(true)
        
        setTimeout(() => {
          router.push(`/(tabs)/events/${data.id}`)
        }, 2000)
      }
    } catch (error: any) {
      const message = error.message || 'Une erreur est survenue'
      setModalConfig({
        variant: 'error',
        title: 'Erreur',
        message
      })
      setModalVisible(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Modifier l\'événement' : 'Créer un événement'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isEditMode ? 'Modifier votre événement 🎲' : 'Nouvel événement 🎲'}
        </Text>

        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Soirée jeux de société"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            placeholder="Décrivez votre événement..."
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Date & Time */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date et heure *</Text>
          <TextInput
            style={[styles.input, errors.date_time && styles.inputError]}
            placeholder="2024-12-31 19:00"
            value={formData.date_time}
            onChangeText={(text) => setFormData(prev => ({ ...prev, date_time: text }))}
          />
          <Text style={styles.helpText}>Format : AAAA-MM-JJ HH:MM</Text>
          {errors.date_time && <Text style={styles.errorText}>{errors.date_time}</Text>}
        </View>

        {/* Location */}
        <LocationAutocomplete
          label="Lieu"
          value={formData.location}
          onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
          required
          error={errors.location}
          placeholder="Ex: Le Moufia, Saint-Denis"
        />

        {/* Max Participants */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre maximum de participants *</Text>
          <TextInput
            style={[styles.input, errors.max_participants && styles.inputError]}
            placeholder="4"
            value={String(formData.max_participants)}
            onChangeText={(text) => setFormData(prev => ({ ...prev, max_participants: parseInt(text) || 4 }))}
            keyboardType="number-pad"
          />
          <Text style={styles.helpText}>Entre 2 et 50 participants</Text>
          {errors.max_participants && <Text style={styles.errorText}>{errors.max_participants}</Text>}
        </View>

        {/* Visibility */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Visibilité</Text>
          <View style={styles.visibilityButtons}>
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                formData.visibility === 'public' && styles.visibilityButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
            >
              <Text style={[
                styles.visibilityButtonText,
                formData.visibility === 'public' && styles.visibilityButtonTextActive
              ]}>
                🌍 Public
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityButton,
                formData.visibility === 'private' && styles.visibilityButtonActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
            >
              <Text style={[
                styles.visibilityButtonText,
                formData.visibility === 'private' && styles.visibilityButtonTextActive
              ]}>
                🔒 Privé
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.push('/dashboard')}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Enregistrer les modifications' : 'Créer l\'événement'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmationModal
        visible={modalVisible}
        variant={modalConfig.variant}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: Platform.select({ ios: 60, android: 16, web: 16 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  visibilityButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  visibilityButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  visibilityButtonTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

