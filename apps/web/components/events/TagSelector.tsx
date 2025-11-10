'use client'

import React, { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '../../lib/supabase-client'

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
  const supabase = createClientSupabaseClient()
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

        setTags(data || [])
      } catch (err) {
        console.error('Erreur:', err)
        setErrorMessage('Erreur lors du chargement des tags')
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [supabase])

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
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (maximum {maxTags})
        </label>
        <div className="text-sm text-gray-500">Chargement des tags...</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags (maximum {maxTags})
        {selectedTags.length > 0 && (
          <span className="ml-2 text-xs text-gray-500">
            ({selectedTags.length}/{maxTags} sélectionnés)
          </span>
        )}
      </label>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagToggle(tag.id)}
              disabled={!isSelected && selectedTags.length >= maxTags}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isSelected
                    ? 'bg-pink-100 text-pink-800 border-2 border-pink-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                }
                ${
                  !isSelected && selectedTags.length >= maxTags
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Désélectionner' : 'Sélectionner'} le tag ${tag.name}`}
            >
              {tag.name}
            </button>
          )
        })}
      </div>

      {displayError && (
        <p className="text-red-500 text-sm mt-1">{displayError}</p>
      )}

      {selectedTags.length === 0 && !displayError && (
        <p className="text-gray-500 text-sm mt-1">
          Sélectionnez jusqu'à {maxTags} tags pour catégoriser votre événement
        </p>
      )}
    </div>
  )
}
