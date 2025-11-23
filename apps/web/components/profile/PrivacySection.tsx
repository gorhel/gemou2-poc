'use client'

import React, { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '../../lib/supabase-client'
import { Card, CardHeader, CardTitle, CardContent, Button, Toggle, Select, LoadingSpinner } from '../ui'
import { UserSettings } from '../../../packages/database/types'

interface PrivacySectionProps {
  userId: string
  settings: UserSettings | null
  onUpdate?: () => void
}

export default function PrivacySection({ userId, settings, onUpdate }: PrivacySectionProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClientSupabaseClient()

  const [formData, setFormData] = useState({
    profile_visibility: 'public',
    allow_friend_requests: 'all',
    email_visibility: 'private',
    location_visibility: 'friends',
    games_collection_visibility: 'public',
    friends_list_public: false
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        profile_visibility: settings.profile_visibility || 'public',
        allow_friend_requests: settings.allow_friend_requests || 'all',
        email_visibility: settings.email_visibility || 'private',
        location_visibility: settings.location_visibility || 'friends',
        games_collection_visibility: settings.games_collection_visibility || 'public',
        friends_list_public: false // Ce champ reste dans profiles
      })
      
      // Charger friends_list_public depuis profiles
      loadFriendsListPublic()
    }
  }, [settings, userId])

  const loadFriendsListPublic = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('friends_list_public')
        .eq('id', userId)
        .single()

      if (!fetchError && data) {
        setFormData(prev => ({ ...prev, friends_list_public: data.friends_list_public || false }))
      }
    } catch (err) {
      console.error('Error loading friends_list_public:', err)
    }
  }

  const handleUpdate = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Mettre à jour user_settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .update({
          profile_visibility: formData.profile_visibility,
          allow_friend_requests: formData.allow_friend_requests,
          email_visibility: formData.email_visibility,
          location_visibility: formData.location_visibility,
          games_collection_visibility: formData.games_collection_visibility,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (settingsError) throw settingsError

      // Mettre à jour friends_list_public dans profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ friends_list_public: formData.friends_list_public })
        .eq('id', userId)

      if (profileError) throw profileError

      setSuccess(true)
      onUpdate?.()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error updating privacy settings:', err)
      setError(err.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔒 Confidentialité</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Visibilité du profil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilité du profil
            </label>
            <Select
              value={formData.profile_visibility}
              onChange={(e) => setFormData(prev => ({ ...prev, profile_visibility: e.target.value }))}
              options={[
                { value: 'public', label: 'Public - Visible par tous' },
                { value: 'friends', label: 'Amis uniquement' },
                { value: 'private', label: 'Privé - Moi uniquement' }
              ]}
              fullWidth
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Détermine qui peut voir votre profil
            </p>
          </div>

          {/* Autoriser les demandes d'amitié */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Autoriser les demandes d'amitié
            </label>
            <Select
              value={formData.allow_friend_requests}
              onChange={(e) => setFormData(prev => ({ ...prev, allow_friend_requests: e.target.value }))}
              options={[
                { value: 'all', label: 'Tout le monde' },
                { value: 'friends_only', label: 'Amis d\'amis uniquement' }
              ]}
              fullWidth
              disabled={loading}
            />
          </div>

          {/* Visibilité de l'email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilité de l'email
            </label>
            <Select
              value={formData.email_visibility}
              onChange={(e) => setFormData(prev => ({ ...prev, email_visibility: e.target.value }))}
              options={[
                { value: 'private', label: 'Privé - Non visible' },
                { value: 'friends', label: 'Amis uniquement' },
                { value: 'public', label: 'Public' }
              ]}
              fullWidth
              disabled={loading}
            />
          </div>

          {/* Visibilité de la localisation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilité de la localisation
            </label>
            <Select
              value={formData.location_visibility}
              onChange={(e) => setFormData(prev => ({ ...prev, location_visibility: e.target.value }))}
              options={[
                { value: 'private', label: 'Privé - Non visible' },
                { value: 'friends', label: 'Amis uniquement' },
                { value: 'public', label: 'Public' }
              ]}
              fullWidth
              disabled={loading}
            />
          </div>

          {/* Visibilité de la collection de jeux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilité de la collection de jeux
            </label>
            <Select
              value={formData.games_collection_visibility}
              onChange={(e) => setFormData(prev => ({ ...prev, games_collection_visibility: e.target.value }))}
              options={[
                { value: 'public', label: 'Public - Visible par tous' },
                { value: 'friends', label: 'Amis uniquement' },
                { value: 'private', label: 'Privé - Moi uniquement' }
              ]}
              fullWidth
              disabled={loading}
            />
          </div>

          {/* Liste d'amis publique */}
          <div className="flex items-center justify-between py-2 border-t border-gray-200">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liste d'amis publique
              </label>
              <p className="text-xs text-gray-500">
                Si activé, tout le monde peut voir vos amis
              </p>
            </div>
            <Toggle
              checked={formData.friends_list_public}
              onChange={(checked) => setFormData(prev => ({ ...prev, friends_list_public: checked }))}
              disabled={loading}
            />
          </div>

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600">
                ✅ Paramètres de confidentialité mis à jour !
              </p>
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

