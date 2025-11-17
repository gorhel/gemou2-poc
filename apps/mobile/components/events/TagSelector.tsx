'use client'

import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { supabase } from '../../lib'

interface Tag {
  id: string
  name: string
  color?: string
}

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tagIds: string[]) => void
  error?: string
  maxTags?: number
}

export default function TagSelector({
  selectedTags,
  onTagsChange,
  error,
  maxTags = 3
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Charger les tags disponibles
  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('tags')
          .select('id, name, color')
          .order('name', { ascending: true })

        if (error) {
          console.error('Erreur lors du chargement des tags:', error)
          setErrorMessage('Impossible de charger les tags')
          return
        }

        console.log('✅ Tags chargés:', data?.length || 0, data)
        setTags(data || [])
      } catch (err) {
        console.error('Erreur:', err)
        setErrorMessage('Erreur lors du chargement des tags')
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      // Désélectionner le tag
      onTagsChange(selectedTags.filter(id => id !== tagId))
      setErrorMessage('')
    } else {
      // Vérifier la limite de tags
      if (selectedTags.length >= maxTags) {
        setErrorMessage(`Vous ne pouvez sélectionner que ${maxTags} tags maximum`)
        return
      }
      // Sélectionner le tag
      onTagsChange([...selectedTags, tagId])
      setErrorMessage('')
    }
  }

  const displayError = error || errorMessage

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          Tags (maximum {maxTags})
        </Text>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          Tags (maximum {maxTags})
        </Text>
        {selectedTags.length > 0 && (
          <Text style={styles.counter}>
            ({selectedTags.length}/{maxTags} sélectionnés)
          </Text>
        )}
      </View>

      <View style={styles.tagsContainer}>
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id)
          const isDisabled = !isSelected && selectedTags.length >= maxTags
          
          return (
            <TouchableOpacity
              key={tag.id}
              onPress={() => handleTagToggle(tag.id)}
              disabled={isDisabled}
              style={[
                styles.tagButton,
                isSelected ? styles.tagButtonSelected : styles.tagButtonUnselected,
                isDisabled && styles.tagButtonDisabled
              ]}
              accessibilityLabel={`${isSelected ? 'Désélectionner' : 'Sélectionner'} le tag ${tag.name}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.tagText,
                  isSelected ? styles.tagTextSelected : styles.tagTextUnselected,
                  isDisabled && styles.tagTextDisabled
                ]}
              >
                {tag.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {displayError && (
        <Text style={styles.errorText}>{displayError}</Text>
      )}

      {selectedTags.length === 0 && !displayError && (
        <Text style={styles.helperText}>
          Sélectionnez jusqu'à {maxTags} tags pour catégoriser votre événement
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  counter: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 8
  },
  tagButtonSelected: {
    backgroundColor: '#fce7f3',
    borderColor: '#f9a8d4'
  },
  tagButtonUnselected: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db'
  },
  tagButtonDisabled: {
    opacity: 0.5
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500'
  },
  tagTextSelected: {
    color: '#9f1239'
  },
  tagTextUnselected: {
    color: '#374151'
  },
  tagTextDisabled: {
    color: '#9ca3af'
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  }
})
