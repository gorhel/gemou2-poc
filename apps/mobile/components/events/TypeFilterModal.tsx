import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { supabase } from '../../lib'

interface Tag {
  id: number
  name: string
}

interface TypeFilterModalProps {
  visible: boolean
  onClose: () => void
  selectedTags: number[]
  onApply: (tags: number[]) => void
}

export default function TypeFilterModal({
  visible,
  onClose,
  selectedTags,
  onApply
}: TypeFilterModalProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [tempSelected, setTempSelected] = useState<number[]>(selectedTags)

  useEffect(() => {
    if (visible) {
      loadTags()
      setTempSelected(selectedTags)
    }
  }, [visible, selectedTags])

  const loadTags = async () => {
    try {
      setLoading(true)
      
      // Récupérer tous les tags disponibles
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .order('name', { ascending: true })

      if (error) throw error

      setTags(data || [])
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId: number) => {
    setTempSelected(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      }
      return [...prev, tagId]
    })
  }

  const handleApply = () => {
    onApply(tempSelected)
    onClose()
  }

  const handleReset = () => {
    setTempSelected([])
  }

  const getTagEmoji = (tagName: string): string => {
    const lowerName = tagName.toLowerCase()
    
    // Emojis par catégorie de jeu
    if (lowerName.includes('stratégie') || lowerName.includes('strategy')) return '🎯'
    if (lowerName.includes('aventure') || lowerName.includes('adventure')) return '🗺️'
    if (lowerName.includes('famille') || lowerName.includes('family')) return '👨‍👩‍👧‍👦'
    if (lowerName.includes('party')) return '🎉'
    if (lowerName.includes('coopératif') || lowerName.includes('cooperative')) return '🤝'
    if (lowerName.includes('abstract')) return '🔷'
    if (lowerName.includes('deck') || lowerName.includes('cartes')) return '🃏'
    if (lowerName.includes('dés') || lowerName.includes('dice')) return '🎲'
    if (lowerName.includes('plateau') || lowerName.includes('board')) return '🎮'
    if (lowerName.includes('ambiance')) return '😄'
    if (lowerName.includes('expert')) return '🧠'
    if (lowerName.includes('enfant') || lowerName.includes('kids')) return '🧒'
    if (lowerName.includes('rapide') || lowerName.includes('quick')) return '⚡'
    if (lowerName.includes('rôle') || lowerName.includes('role')) return '🎭'
    
    return '🏷️'
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎲 Filtrer par type</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Chargement des tags...</Text>
              </View>
            ) : tags.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun tag disponible</Text>
              </View>
            ) : (
              <>
                <Text style={styles.subtitle}>
                  Sélectionnez les types d'événements ou de jeux qui vous intéressent
                </Text>
                <ScrollView style={styles.tagsList} showsVerticalScrollIndicator={false}>
                  <View style={styles.tagsGrid}>
                    {tags.map((tag) => (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.tagChip,
                          tempSelected.includes(tag.id) && styles.tagChipSelected
                        ]}
                        onPress={() => toggleTag(tag.id)}
                      >
                        <Text style={styles.tagEmoji}>{getTagEmoji(tag.name)}</Text>
                        <Text style={[
                          styles.tagText,
                          tempSelected.includes(tag.id) && styles.tagTextSelected
                        ]}>
                          {tag.name}
                        </Text>
                        {tempSelected.includes(tag.id) && (
                          <Text style={styles.tagCheckmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                Appliquer {tempSelected.length > 0 && `(${tempSelected.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280'
  },
  tagsList: {
    flex: 1
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 16
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6
  },
  tagChipSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6'
  },
  tagEmoji: {
    fontSize: 16
  },
  tagText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500'
  },
  tagTextSelected: {
    color: '#3b82f6',
    fontWeight: '600'
  },
  tagCheckmark: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginLeft: 4
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center'
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280'
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center'
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
})

