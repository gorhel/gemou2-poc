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
  Alert,
  Image
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib'
import { ConfirmationModal, ModalVariant, LocationAutocomplete, DateTimePicker } from '../../components/ui'
import GameSelector from '../../components/events/GameSelector'
import TagSelector from '../../components/events/TagSelector'

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
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedGames, setSelectedGames] = useState<any[]>([])
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

      // Charger l'image si présente
      if (event.image_url) {
        setImageUri(event.image_url)
      }

      // Charger les jeux associés à l'événement
      const { data: eventGames, error: gamesError } = await supabase
        .from('event_games')
        .select('*')
        .eq('event_id', id)

      if (!gamesError && eventGames) {
        setSelectedGames(eventGames.map(game => ({
          id: game.id,
          game_id: game.game_id,
          game_name: game.game_name,
          game_thumbnail: game.game_thumbnail,
          game_image: game.game_image,
          year_published: game.year_published,
          min_players: game.min_players,
          max_players: game.max_players,
          playing_time: game.playing_time,
          complexity: game.complexity,
          is_custom: game.is_custom,
          is_optional: game.is_optional,
          experience_level: game.experience_level,
          estimated_duration: game.estimated_duration,
          brought_by_user_id: game.brought_by_user_id,
          notes: game.notes
        })))
      }
      // Charger les tags associés à l'événement
      const { data: eventTags, error: tagsError } = await supabase
        .from('event_tags')
        .select('tag_id')
        .eq('event_id', id)

      if (!tagsError && eventTags) {
        setSelectedTags(eventTags.map((et: any) => et.tag_id))
      } else if (tagsError) {
        console.error('Erreur lors du chargement des tags:', tagsError)
      }
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

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos.'
        )
        return false
      }
    }
    return true
  }

  const pickImage = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets[0]) {
      setImageUri(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à votre caméra.'
      )
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets[0]) {
      setImageUri(result.assets[0].uri)
    }
  }

  const uploadImageToStorage = async (): Promise<string | null> => {
    if (!imageUri || !user) return null

    setUploadingImage(true)
    try {
      const fileExt = imageUri.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const response = await fetch(imageUri)
      const blob = await response.blob()

      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Erreur upload image:', error)
      Alert.alert('Erreur', 'Impossible d\'uploader l\'image')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm() || !user) return

    setSubmitting(true)
    try {
      // Upload de l'image si présente
      let imageUrl: string | null = null
      if (imageUri) {
        imageUrl = await uploadImageToStorage()
        if (!imageUrl && imageUri) {
          // Si l'upload échoue, demander confirmation
          Alert.alert(
            'Erreur d\'upload',
            'Impossible d\'uploader l\'image. Voulez-vous continuer sans image ?',
            [
              { text: 'Annuler', style: 'cancel', onPress: () => { setSubmitting(false); return; } },
              { text: 'Continuer', onPress: async () => { imageUrl = null } }
            ]
          )
          return
        }
      }

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
            visibility: formData.visibility,
            image_url: imageUrl
          })
          .eq('id', eventId)
          .eq('creator_id', user.id) // Sécurité supplémentaire

        if (error) throw error

        // Supprimer les anciens jeux et ajouter les nouveaux
        await supabase
          .from('event_games')
          .delete()
          .eq('event_id', eventId)

        // Ajouter les jeux sélectionnés
        if (selectedGames.length > 0) {
          const gamesToInsert = selectedGames.map(game => ({
            event_id: eventId,
            game_id: game.game_id,
            game_name: game.game_name,
            game_thumbnail: game.game_thumbnail,
            game_image: game.game_image,
            year_published: game.year_published,
            min_players: game.min_players,
            max_players: game.max_players,
            playing_time: game.playing_time,
            complexity: game.complexity,
            is_custom: game.is_custom,
            is_optional: game.is_optional,
            experience_level: game.experience_level,
            estimated_duration: game.estimated_duration,
            brought_by_user_id: game.brought_by_user_id,
            notes: game.notes
          }))

          const { error: gamesError } = await supabase
            .from('event_games')
            .insert(gamesToInsert)

          if (gamesError) throw gamesError
        }

        // Supprimer les anciens tags et ajouter les nouveaux
        await supabase
          .from('event_tags')
          .delete()
          .eq('event_id', eventId)

        // Ajouter les tags sélectionnés
        if (selectedTags.length > 0) {
          const tagsToInsert = selectedTags.map(tagId => ({
            event_id: eventId,
            tag_id: tagId
          }))

          console.log('🏷️ Insertion des tags (édition):', tagsToInsert)
          const { data: insertedTags, error: tagsError } = await supabase
            .from('event_tags')
            .insert(tagsToInsert)
            .select()

          if (tagsError) {
            console.error('❌ Erreur lors de l\'ajout des tags:', tagsError)
            Alert.alert('Attention', `Les tags n'ont pas pu être ajoutés: ${tagsError.message}`)
          } else {
            console.log('✅ Tags ajoutés avec succès:', insertedTags)
          }
        } else {
          console.log('ℹ️ Aucun tag sélectionné pour cet événement')
        }

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
              image_url: imageUrl,
              creator_id: user.id,
              status: 'active',
              current_participants: 0
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

        // Ajouter les jeux sélectionnés
        if (selectedGames.length > 0) {
          const gamesToInsert = selectedGames.map(game => ({
            event_id: data.id,
            game_id: game.game_id,
            game_name: game.game_name,
            game_thumbnail: game.game_thumbnail,
            game_image: game.game_image,
            year_published: game.year_published,
            min_players: game.min_players,
            max_players: game.max_players,
            playing_time: game.playing_time,
            complexity: game.complexity,
            is_custom: game.is_custom,
            is_optional: game.is_optional,
            experience_level: game.experience_level,
            estimated_duration: game.estimated_duration,
            brought_by_user_id: game.brought_by_user_id,
            notes: game.notes
          }))

          const { error: gamesError } = await supabase
            .from('event_games')
            .insert(gamesToInsert)

          if (gamesError) throw gamesError
        }

        // Ajouter les tags sélectionnés
        if (selectedTags.length > 0) {
          const tagsToInsert = selectedTags.map(tagId => ({
            event_id: data.id,
            tag_id: tagId
          }))

          console.log('🏷️ Insertion des tags:', tagsToInsert)
          const { data: insertedTags, error: tagsError } = await supabase
            .from('event_tags')
            .insert(tagsToInsert)
            .select()

          if (tagsError) {
            console.error('❌ Erreur lors de l\'ajout des tags:', tagsError)
            Alert.alert('Attention', `Les tags n'ont pas pu être ajoutés: ${tagsError.message}`)
          } else {
            console.log('✅ Tags ajoutés avec succès:', insertedTags)
          }
        } else {
          console.log('ℹ️ Aucun tag sélectionné pour cet événement')
        }

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

        {/* Image */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Photo de l'événement (optionnelle)</Text>
          
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.imageRemoveButton}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.imageRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {!imageUri && (
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={pickImage}
                disabled={uploadingImage}
              >
                <Text style={styles.imageButtonIcon}>📷</Text>
                <Text style={styles.imageButtonText}>Galerie</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imageButton}
                onPress={takePhoto}
                disabled={uploadingImage}
              >
                <Text style={styles.imageButtonIcon}>📸</Text>
                <Text style={styles.imageButtonText}>Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {uploadingImage && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.uploadingText}>Upload en cours...</Text>
            </View>
          )}

          <Text style={styles.helpText}>Format 16:9 recommandé, max 5MB</Text>
        </View>

        {/* Date & Time */}
        <DateTimePicker
          label="Date et heure"
          value={formData.date_time}
          onChange={(value) => setFormData(prev => ({ ...prev, date_time: value }))}
          required
          error={errors.date_time}
          minDate={new Date().toISOString()}
          placeholder="Sélectionnez la date et l'heure de l'événement"
        />

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

        {/* Tags (optionnel) */}
        <View style={styles.inputContainer}>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            error={errors.tags}
            maxTags={3}
          />
        </View>

        {/* Jeux qui seront joués (optionnel) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Jeux qui seront joués (optionnel)</Text>
          <GameSelector
            eventId={eventId}
            onGamesChange={setSelectedGames}
            initialGames={selectedGames}
          />
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
  imagePreviewContainer: {
    position: 'relative',
    marginVertical: 12,
    alignSelf: 'center',
  },
  imagePreview: {
    width: 300,
    height: 169, // 16:9 ratio
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  imageRemoveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  imageButtonIcon: {
    fontSize: 20,
  },
  imageButtonText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  uploadingText: {
    fontSize: 14,
    color: '#6b7280',
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

