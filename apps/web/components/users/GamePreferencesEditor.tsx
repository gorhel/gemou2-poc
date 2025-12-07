'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClientSupabaseClient } from '../../lib/supabase-client'
import { LoadingSpinner, Card, CardHeader, CardTitle, CardContent, Button } from '../ui'
import SmallPill from '../ui/SmallPill'

const MAX_PREFERENCES = 5

interface Tag {
  id: string
  name: string
  color?: string | null
}

interface UserTag {
  id: string
  tag_id: string
  tags: Tag | null
}

interface GamePreferencesEditorProps {
  userId: string
  onUpdate?: () => void
  inModal?: boolean
}

export default function GamePreferencesEditor({ 
  userId, 
  onUpdate,
  inModal = false 
}: GamePreferencesEditorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set())
  const [initialTagIds, setInitialTagIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClientSupabaseClient()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger tous les tags disponibles
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('id, name, color')
        .order('name')

      if (tagsError) throw tagsError

      setAvailableTags(tagsData || [])

      // Charger les préférences actuelles de l'utilisateur
      const { data: userTagsData, error: userTagsError } = await supabase
        .from('user_tags')
        .select(`
          id,
          tag_id,
          tags:tag_id (
            id,
            name,
            color
          )
        `)
        .eq('user_id', userId)

      if (userTagsError) throw userTagsError

      const userTagIds = new Set(
        (userTagsData as unknown as UserTag[])
          ?.filter(ut => ut.tag_id)
          .map(ut => ut.tag_id) || []
      )
      
      setSelectedTagIds(userTagIds)
      setInitialTagIds(new Set(userTagIds))
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError('Erreur lors du chargement des préférences')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleTagToggle = (tagId: string) => {
    setError(null)
    setSuccess(false)

    setSelectedTagIds(prev => {
      const newSet = new Set(prev)
      
      if (newSet.has(tagId)) {
        newSet.delete(tagId)
      } else {
        if (newSet.size >= MAX_PREFERENCES) {
          setError(`Vous ne pouvez sélectionner que ${MAX_PREFERENCES} préférences maximum`)
          return prev
        }
        newSet.add(tagId)
      }
      
      return newSet
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Supprimer les anciennes préférences
      const { error: deleteError } = await supabase
        .from('user_tags')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Insérer les nouvelles préférences
      if (selectedTagIds.size > 0) {
        const insertData = Array.from(selectedTagIds).map(tagId => ({
          user_id: userId,
          tag_id: tagId
        }))

        const { error: insertError } = await supabase
          .from('user_tags')
          .insert(insertData)

        if (insertError) throw insertError
      }

      setSuccess(true)
      setInitialTagIds(new Set(selectedTagIds))
      onUpdate?.()

      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error saving preferences:', err)
      setError(err.message || 'Erreur lors de la sauvegarde des préférences')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSelectedTagIds(new Set(initialTagIds))
    setError(null)
    setSuccess(false)
  }

  const hasChanges = () => {
    if (selectedTagIds.size !== initialTagIds.size) return true
    for (const id of selectedTagIds) {
      if (!initialTagIds.has(id)) return true
    }
    return false
  }

  if (loading) {
    return (
      <Card padding={inModal ? 'none' : 'md'}>
        <CardHeader>
          <CardTitle>🎮 Mes préférences de jeu</CardTitle>
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
        <CardTitle>🎮 Mes préférences de jeu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Légende */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-500 text-xl">💡</span>
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Sélectionnez vos préférences de jeu
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Choisissez jusqu'à <strong>{MAX_PREFERENCES} tags</strong> qui décrivent le mieux 
                  votre style de jeu. Ces préférences aideront les autres joueurs à vous trouver.
                </p>
              </div>
            </div>
          </div>

          {/* Compteur de sélection */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Tags sélectionnés
            </span>
            <span className={`text-sm font-semibold ${
              selectedTagIds.size >= MAX_PREFERENCES 
                ? 'text-orange-600' 
                : 'text-green-600'
            }`}>
              {selectedTagIds.size} / {MAX_PREFERENCES}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                selectedTagIds.size >= MAX_PREFERENCES 
                  ? 'bg-orange-500' 
                  : 'bg-green-500'
              }`}
              style={{ width: `${(selectedTagIds.size / MAX_PREFERENCES) * 100}%` }}
            />
          </div>

          {/* Liste des tags */}
          {availableTags.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <span className="text-4xl">🏷️</span>
              </div>
              <p className="text-gray-600">Aucun tag disponible</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.has(tag.id)
                const isDisabled = !isSelected && selectedTagIds.size >= MAX_PREFERENCES
                
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    disabled={saving || isDisabled}
                    className={`
                      inline-flex items-center px-4 py-2 rounded-full text-sm font-medium 
                      border-2 transition-all duration-200
                      ${isSelected 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                        : isDisabled
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                      }
                    `}
                  >
                    {isSelected && (
                      <svg 
                        className="w-4 h-4 mr-2" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                    {tag.name}
                  </button>
                )
              })}
            </div>
          )}

          {/* Messages d'erreur et de succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600">
                ✅ Préférences enregistrées avec succès !
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={saving || !hasChanges()}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges()}
              loading={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


