'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClientSupabaseClient } from '../../lib/supabase-client'
import { logger } from '../../lib/logger'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, LoadingSpinner, Modal, useModal } from '../ui'
import { LocationAutocomplete } from '../marketplace/LocationAutocomplete'
import { Profile } from '../../../packages/database/types'

interface ProfileInfoSectionProps {
  userId: string
  onUpdate?: () => void
  inModal?: boolean
}

export default function ProfileInfoSection({ userId, onUpdate, inModal = false }: ProfileInfoSectionProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClientSupabaseClient()

  // États pour la gestion de l'upload d'avatar avec confirmation
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarConfirmModal = useModal()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    first_name: '',
    last_name: '',
    bio: '',
    city: '',
    avatar_url: ''
  })

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      setProfile(data)
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        bio: data.bio || '',
        city: data.city || '',
        avatar_url: data.avatar_url || ''
      })
    } catch (err: any) {
      logger.error('ProfileInfoSection', err, { action: 'loadProfile' })
      setError(err.message || 'Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
    if (success) setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const updateData: any = {
        username: formData.username || null,
        full_name: formData.full_name || null,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        bio: formData.bio || null,
        city: formData.city || null,
        updated_at: new Date().toISOString()
      }

      // Utiliser avatar_url ou profile_photo_url selon ce qui existe
      if (formData.avatar_url) {
        updateData.avatar_url = formData.avatar_url
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      if (updateError) throw updateError

      setSuccess(true)
      onUpdate?.()
      
      // Recharger le profil
      await loadProfile()
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      logger.error('ProfileInfoSection', err, { action: 'updateProfile' })
      setError(err.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Gère la sélection d'un fichier image pour l'avatar
   * Crée une prévisualisation et ouvre la modale de confirmation
   */
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Valider le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image')
      return
    }

    // Valider la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image doit faire moins de 5MB')
      return
    }

    // Créer une prévisualisation
    const reader = new FileReader()
    reader.onloadend = () => {
      setPendingAvatarPreview(reader.result as string)
      setPendingAvatarFile(file)
      avatarConfirmModal.open()
    }
    reader.readAsDataURL(file)
    
    // Reset l'input pour permettre la resélection du même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Annule le changement d'avatar en cours
   */
  const handleCancelAvatarChange = () => {
    setPendingAvatarFile(null)
    setPendingAvatarPreview(null)
    avatarConfirmModal.close()
  }

  /**
   * Confirme et effectue l'upload de l'avatar
   */
  const handleConfirmAvatarUpload = async () => {
    if (!pendingAvatarFile) return

    try {
      setIsUploadingAvatar(true)
      setError(null)

      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non authentifié')

      const fileExt = pendingAvatarFile.name.split('.').pop()
      const fileName = `avatars/${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, pendingAvatarFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName)

      // Mettre à jour le profil en base de données
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Mettre à jour l'état local
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      
      // Nettoyer les états temporaires
      setPendingAvatarFile(null)
      setPendingAvatarPreview(null)
      avatarConfirmModal.close()

      setSuccess(true)
      onUpdate?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      logger.error('ProfileInfoSection', err, { action: 'uploadAvatar' })
      setError(err.message || 'Erreur lors de l\'upload de l\'avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCityChange = (value: string, quarter?: string, cityName?: string) => {
    // Stocker le nom de la ville (pas le district, quarter)
    const cityToStore = cityName || value
    setFormData(prev => ({ ...prev, city: cityToStore }))
    if (error) setError(null)
    if (success) setSuccess(false)
  }

  if (loading) {
    return (
      <Card padding={inModal ? 'none' : 'md'}>
        <CardHeader>
          <CardTitle>👤 Informations du profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card padding={inModal ? 'none' : 'md'}>
      <CardHeader>
        <CardTitle>👤 Informations du profil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar avec upload et prévisualisation */}
          <div className="space-y-4">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 transition-all group-hover:border-blue-400"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 transition-all group-hover:border-blue-400">
                    <span className="text-4xl text-gray-400">
                      {formData.full_name?.charAt(0) || formData.username?.charAt(0) || '👤'}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
                  title="Modifier la photo de profil"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
                <input
                  ref={fileInputRef}
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                  disabled={saving || isUploadingAvatar}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Photo de profil
                </p>
                <p className="text-sm text-gray-600">
                  Cliquez sur l'icône pour modifier votre photo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Formats acceptés : JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Nom d'utilisateur */}
          <Input
            label="Nom d'utilisateur"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Votre nom d'utilisateur"
            fullWidth
            disabled={saving}
            helperText="Ce nom sera visible publiquement"
          />

          {/* Nom complet */}
          <Input
            label="Nom complet"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            placeholder="Votre nom complet"
            fullWidth
            disabled={saving}
          />

          {/* Prénom et Nom (optionnel) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Votre prénom"
              fullWidth
              disabled={saving}
            />
            <Input
              label="Nom de famille"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Votre nom de famille"
              fullWidth
              disabled={saving}
            />
          </div>

          {/* Bio */}
          <Textarea
            label="Biographie"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Parlez-nous de vous..."
            rows={4}
            fullWidth
            disabled={saving}
            helperText="Décrivez-vous en quelques mots (optionnel)"
          />

          {/* Ville avec autocomplétion depuis la table locations */}
          <LocationAutocomplete
            label="Ville"
            value={formData.city}
            onChange={handleCityChange}
            error={error && error.includes('ville') ? error : undefined}
          />

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600">
                ✅ Profil mis à jour avec succès !
              </p>
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={loadProfile}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={saving}
              loading={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Modale de confirmation pour le changement de photo de profil */}
      <Modal
        isOpen={avatarConfirmModal.isOpen}
        onClose={handleCancelAvatarChange}
        title="Modifier la photo de profil"
        size="md"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={handleCancelAvatarChange}
              disabled={isUploadingAvatar}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmAvatarUpload}
              loading={isUploadingAvatar}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? 'Enregistrement...' : 'Confirmer le changement'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 text-center">
            Êtes-vous sûr de vouloir remplacer votre photo de profil actuelle par cette nouvelle image ?
          </p>

          {/* Comparaison avant/après */}
          <div className="flex items-center justify-center gap-8">
            {/* Image actuelle */}
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Photo actuelle
              </p>
              <div className="relative">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Photo actuelle"
                    className="w-28 h-28 rounded-full object-cover border-2 border-gray-200 opacity-60"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 opacity-60">
                    <span className="text-4xl text-gray-400">
                      {formData.full_name?.charAt(0) || formData.username?.charAt(0) || '👤'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Flèche */}
            <div className="flex-shrink-0">
              <svg 
                className="w-8 h-8 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </div>

            {/* Nouvelle image */}
            <div className="text-center">
              <p className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wide">
                Nouvelle photo
              </p>
              <div className="relative">
                {pendingAvatarPreview ? (
                  <img
                    src={pendingAvatarPreview}
                    alt="Nouvelle photo"
                    className="w-28 h-28 rounded-full object-cover border-2 border-blue-500 shadow-lg ring-4 ring-blue-100"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <LoadingSpinner size="lg" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Informations sur le fichier */}
          {pendingAvatarFile && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">
                <span className="font-medium">{pendingAvatarFile.name}</span>
                <span className="mx-2">•</span>
                <span>{(pendingAvatarFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </p>
            </div>
          )}
        </div>
      </Modal>
    </Card>
  )
}


