import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native'
import { supabase } from '../../lib'
import MachiColors from '../../theme/colors'

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
  onClose?: () => void
}

export function GamePreferencesEditor({ userId, onUpdate, onClose }: GamePreferencesEditorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set())
  const [initialTagIds, setInitialTagIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
      Alert.alert('Erreur', 'Impossible de charger les préférences de jeu')
    } finally {
      setLoading(false)
    }
  }, [userId])

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
      setTimeout(() => {
        setSuccess(false)
        onClose?.()
      }, 1500)
    } catch (err: any) {
      console.error('Error saving preferences:', err)
      setError(err.message || 'Erreur lors de la sauvegarde des préférences')
      Alert.alert('Erreur', 'Impossible de sauvegarder les préférences')
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MachiColors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Légende */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendIcon}>💡</Text>
        <View style={styles.legendTextContainer}>
          <Text style={styles.legendTitle}>Sélectionnez vos préférences de jeu</Text>
          <Text style={styles.legendDescription}>
            Choisissez jusqu'à <Text style={styles.legendBold}>{MAX_PREFERENCES} tags</Text> qui 
            décrivent le mieux votre style de jeu.
          </Text>
        </View>
      </View>

      {/* Compteur de sélection */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterLabel}>Tags sélectionnés</Text>
        <Text style={[
          styles.counterValue,
          selectedTagIds.size >= MAX_PREFERENCES && styles.counterValueMax
        ]}>
          {selectedTagIds.size} / {MAX_PREFERENCES}
        </Text>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBarFill,
            { 
              width: `${(selectedTagIds.size / MAX_PREFERENCES) * 100}%`,
              backgroundColor: selectedTagIds.size >= MAX_PREFERENCES 
                ? '#f97316' 
                : MachiColors.primary
            }
          ]} 
        />
      </View>

      {/* Liste des tags */}
      {availableTags.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏷️</Text>
          <Text style={styles.emptyText}>Aucun tag disponible</Text>
        </View>
      ) : (
        <View style={styles.tagsContainer}>
          {availableTags.map((tag) => {
            const isSelected = selectedTagIds.has(tag.id)
            const isDisabled = !isSelected && selectedTagIds.size >= MAX_PREFERENCES
            
            return (
              <TouchableOpacity
                key={tag.id}
                onPress={() => handleTagToggle(tag.id)}
                disabled={saving || isDisabled}
                style={[
                  styles.tagButton,
                  isSelected && styles.tagButtonSelected,
                  isDisabled && styles.tagButtonDisabled
                ]}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
                <Text style={[
                  styles.tagText,
                  isSelected && styles.tagTextSelected,
                  isDisabled && styles.tagTextDisabled
                ]}>
                  {tag.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      {/* Messages d'erreur et de succès */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✅ Préférences enregistrées !</Text>
        </View>
      )}

      {/* Boutons d'action */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={handleReset}
          disabled={saving || !hasChanges()}
        >
          <Text style={[
            styles.cancelButtonText,
            (!hasChanges() || saving) && styles.buttonTextDisabled
          ]}>
            Annuler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.saveButton,
            (!hasChanges() || saving) && styles.buttonDisabled
          ]}
          onPress={handleSave}
          disabled={saving || !hasChanges()}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              Enregistrer
            </Text>
          )}
        </TouchableOpacity>
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
    padding: 40,
    backgroundColor: '#f0f4f8'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280'
  },
  legendContainer: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  legendIcon: {
    fontSize: 24,
    marginRight: 12
  },
  legendTextContainer: {
    flex: 1
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4
  },
  legendDescription: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20
  },
  legendBold: {
    fontWeight: '700'
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  counterLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  counterValue: {
    fontSize: 14,
    fontWeight: '600',
    color: MachiColors.primary
  },
  counterValueMax: {
    color: '#f97316'
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 24,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'white',
    borderColor: '#d1d5db'
  },
  tagButtonSelected: {
    backgroundColor: MachiColors.primary,
    borderColor: MachiColors.primary
  },
  tagButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    opacity: 0.5
  },
  checkmark: {
    fontSize: 14,
    color: 'white',
    marginRight: 6,
    fontWeight: '700'
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  tagTextSelected: {
    color: 'white'
  },
  tagTextDisabled: {
    color: '#9ca3af'
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 32
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db'
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151'
  },
  saveButton: {
    backgroundColor: MachiColors.primary
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white'
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af'
  },
  buttonTextDisabled: {
    color: '#9ca3af'
  }
})

export default GamePreferencesEditor


