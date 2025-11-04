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
import { LocationAutocomplete } from '../../components/ui'

export default function CreateTradePage() {
  const { id: editId } = useLocalSearchParams<{ id?: string }>()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    type: 'sale' as 'sale' | 'exchange' | 'donation',
    title: '',
    description: '',
    condition: 'good' as 'new' | 'excellent' | 'good' | 'acceptable',
    price: '',
    location_quarter: '',
    location_city: '',
    wanted_game: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [images, setImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    const initPage = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.replace('/login')
          return
        }

        setUser(user)

        // Si mode édition, charger les données
        if (editId) {
          await loadTradeData(editId, user.id)
        }
      } catch (error) {
        console.error('Error:', error)
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [editId])

  const loadTradeData = async (tradeId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('id', tradeId)
        .single()

      if (error) {
        console.error('Error loading trade:', error)
        Alert.alert('Erreur', 'Impossible de charger l\'annonce')
        return
      }

      // Vérifier que l'utilisateur est bien le propriétaire
      if (data.user_id !== userId && data.seller_id !== userId) {
        Alert.alert('Erreur', 'Vous n\'êtes pas autorisé à modifier cette annonce')
        router.back()
        return
      }

      // Pré-remplir le formulaire
      setIsEditMode(true)
      setFormData({
        type: data.type || 'sale',
        title: data.title || '',
        description: data.description || '',
        condition: data.condition || 'good',
        price: data.price ? String(data.price) : '',
        location_quarter: data.location_quarter || '',
        location_city: data.location_city || '',
        wanted_game: data.wanted_game || ''
      })
    } catch (error) {
      console.error('Error:', error)
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement')
    }
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

  const pickImages = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    if (images.length >= 5) {
      Alert.alert('Limite atteinte', 'Vous pouvez ajouter maximum 5 images')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
    })

    if (!result.canceled && result.assets) {
      const newImages = result.assets.slice(0, 5 - images.length).map(asset => asset.uri)
      setImages([...images, ...newImages])
    }
  }

  const takePhoto = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    if (images.length >= 5) {
      Alert.alert('Limite atteinte', 'Vous pouvez ajouter maximum 5 images')
      return
    }

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
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets[0]) {
      setImages([...images, result.assets[0].uri])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const uploadImagesToStorage = async (): Promise<string[]> => {
    if (images.length === 0 || !user) return []

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (const imageUri of images) {
        const fileExt = imageUri.split('.').pop()
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const response = await fetch(imageUri)
        const blob = await response.blob()

        const { data, error } = await supabase.storage
          .from('marketplace-images')
          .upload(fileName, blob, {
            contentType: `image/${fileExt}`,
            upsert: false
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('marketplace-images')
          .getPublicUrl(data.path)

        uploadedUrls.push(publicUrl)
      }

      return uploadedUrls
    } catch (error) {
      console.error('Erreur upload images:', error)
      throw error
    } finally {
      setUploadingImages(false)
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

    if (!formData.location_quarter.trim() && !formData.location_city.trim()) {
      newErrors.location_city = 'La localisation est obligatoire'
    }

    if (formData.type === 'sale' && !formData.price) {
      newErrors.price = 'Le prix est obligatoire pour une vente'
    }

    if (formData.type === 'exchange' && !formData.wanted_game.trim()) {
      newErrors.wanted_game = 'Indiquez le jeu souhaité en échange'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !user) return

    setSubmitting(true)
    try {
      // Upload des images si présentes
      let uploadedImageUrls: string[] = []
      if (images.length > 0) {
        try {
          uploadedImageUrls = await uploadImagesToStorage()
        } catch (uploadError) {
          Alert.alert(
            'Erreur',
            'Impossible d\'uploader les images. Voulez-vous continuer sans images ?',
            [
              { text: 'Annuler', style: 'cancel', onPress: () => { setSubmitting(false); return; } },
              { text: 'Continuer', onPress: async () => { uploadedImageUrls = [] } }
            ]
          )
          return
        }
      }

      const itemData = {
        seller_id: user.id,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        condition: formData.condition,
        price: formData.type === 'sale' ? parseFloat(formData.price) : null,
        location_quarter: formData.location_quarter || null,
        location_city: formData.location_city || null,
        wanted_game: formData.type === 'exchange' ? formData.wanted_game : null,
        status: 'available',
        images: uploadedImageUrls,
        custom_game_name: formData.title, // Utiliser le titre comme nom de jeu temporaire
        game_id: null
      }

      if (isEditMode && editId) {
        // Mode édition : UPDATE
        const { data, error } = await supabase
          .from('marketplace_items')
          .update({
            ...itemData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId)
          .eq('seller_id', user.id)
          .select()
          .single()

        if (error) throw error

        Alert.alert(
          'Succès !',
          'Votre annonce a été mise à jour',
          [{ text: 'OK', onPress: () => router.push(`/trade/${data.id}`) }]
        )
      } else {
        // Mode création : INSERT
        const { data, error } = await supabase
          .from('marketplace_items')
          .insert([itemData])
          .select()
          .single()

        if (error) throw error

        if (Platform.OS === 'web') {
          router.push(`/trade/${data.id}`)
        } else {
          Alert.alert(
            'Succès !',
            'Votre annonce a été publiée',
            [{ text: 'OK', onPress: () => router.push(`/trade/${data.id}`) }]
          )
        }
      }
    } catch (error: any) {
      const message = error.message || 'Une erreur est survenue'
      if (Platform.OS === 'web') {
        alert(message)
      } else {
        Alert.alert('Erreur', message)
      }
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
          {isEditMode ? 'Modifier l\'annonce' : 'Créer une annonce'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isEditMode ? 'Modification 🛒' : 'Nouvelle annonce 🛒'}
        </Text>

        {/* Type */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type d'annonce *</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'sale' && styles.typeButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'sale' }))}
            >
              <Text style={styles.typeButtonText}>💰 Vente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'exchange' && styles.typeButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'exchange' }))}
            >
              <Text style={styles.typeButtonText}>🔄 Échange</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, formData.type === 'donation' && styles.typeButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, type: 'donation' }))}
            >
              <Text style={styles.typeButtonText}>🎁 Don</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Ex: Catan en excellent état"
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
            placeholder="Décrivez votre jeu..."
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Images */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Photos ({images.length}/5)</Text>
          
          {images.length > 0 && (
            <ScrollView horizontal style={styles.imagesPreview} showsHorizontalScrollIndicator={false}>
              {images.map((imageUri, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.imageRemoveButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.imageRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {images.length < 5 && (
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={pickImages}
                disabled={uploadingImages}
              >
                <Text style={styles.imageButtonIcon}>📷</Text>
                <Text style={styles.imageButtonText}>Galerie</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imageButton}
                onPress={takePhoto}
                disabled={uploadingImages}
              >
                <Text style={styles.imageButtonIcon}>📸</Text>
                <Text style={styles.imageButtonText}>Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {uploadingImages && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.uploadingText}>Upload en cours...</Text>
            </View>
          )}

          <Text style={styles.helpText}>Ajoutez jusqu'à 5 photos, max 10MB par image</Text>
        </View>

        {/* Price (si vente) */}
        {formData.type === 'sale' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Prix (€) *</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder="25"
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
              keyboardType="decimal-pad"
            />
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>
        )}

        {/* Wanted game (si échange) */}
        {formData.type === 'exchange' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Jeu souhaité en échange *</Text>
            <TextInput
              style={[styles.input, errors.wanted_game && styles.inputError]}
              placeholder="Ex: 7 Wonders, Splendor..."
              value={formData.wanted_game}
              onChangeText={(text) => setFormData(prev => ({ ...prev, wanted_game: text }))}
            />
            {errors.wanted_game && <Text style={styles.errorText}>{errors.wanted_game}</Text>}
          </View>
        )}

        {/* Location */}
        <LocationAutocomplete
          label="Localisation"
          value={formData.location_quarter ? `${formData.location_quarter}, ${formData.location_city}` : formData.location_city}
          onChange={(value, district, city) => {
            if (district && city) {
              setFormData(prev => ({ 
                ...prev, 
                location_quarter: district, 
                location_city: city 
              }))
            } else {
              setFormData(prev => ({ 
                ...prev, 
                location_quarter: '',
                location_city: value 
              }))
            }
          }}
          required
          error={errors.location_city}
          placeholder="Ex: Le Moufia, Saint-Denis"
        />

        {/* Condition */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>État</Text>
          <View style={styles.conditionButtons}>
            {['new', 'excellent', 'good', 'acceptable'].map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[styles.conditionButton, formData.condition === cond && styles.conditionButtonActive]}
                onPress={() => setFormData(prev => ({ ...prev, condition: cond as any }))}
              >
                <Text style={[styles.conditionText, formData.condition === cond && styles.conditionTextActive]}>
                  {cond === 'new' ? 'Neuf' : cond === 'excellent' ? 'Excellent' : cond === 'good' ? 'Bon' : 'Acceptable'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.push('/marketplace')}
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
                {isEditMode ? 'Mettre à jour' : 'Publier'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  imagesPreview: {
    marginVertical: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
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
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  conditionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  conditionButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  conditionText: {
    fontSize: 13,
    color: '#6b7280',
  },
  conditionTextActive: {
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

