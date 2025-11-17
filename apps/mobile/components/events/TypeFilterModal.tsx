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
  id: number | string
  name: string
  type: 'event' | 'game' // Type de tag pour la couleur
}

interface TypeFilterModalProps {
  visible: boolean
  onClose: () => void
  selectedTags: (number | string)[]
  onApply: (tags: (number | string)[]) => void
}

export default function TypeFilterModal({
  visible,
  onClose,
  selectedTags,
  onApply
}: TypeFilterModalProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [tempSelected, setTempSelected] = useState<(number | string)[]>(selectedTags)

  useEffect(() => {
    if (visible) {
      loadTags()
      setTempSelected(selectedTags)
    }
  }, [visible, selectedTags])

  const loadTags = async () => {
    try {
      setLoading(true)
      
      // 1. Récupérer les tags des événements
      const { data: eventTagsData, error: eventTagsError } = await supabase
        .from('event_tags')
        .select(`
          tag_id,
          tags (
            id,
            name
          )
        `)

      if (eventTagsError) {
        console.error('Erreur lors du chargement des tags d\'événements:', eventTagsError)
      }

      // 2. Récupérer les jeux associés aux événements
      const { data: eventGamesData, error: eventGamesError } = await supabase
        .from('event_games')
        .select('game_id, game_name')

      if (eventGamesError) {
        console.error('Erreur lors du chargement des jeux d\'événements:', eventGamesError)
      }

      // 3. Récupérer les tags des jeux depuis la colonne JSONB data
      const gameTagsFromData: Array<{ id: string; name: string }> = []
      
      if (eventGamesData && eventGamesData.length > 0) {
        // Extraire les BGG IDs
        const gameBggIds = eventGamesData
          .map(eg => eg.game_id)
          .filter(Boolean)

        if (gameBggIds.length > 0) {
          // Trouver les jeux dans la base de données par BGG ID avec la colonne data
          const { data: gamesInDb } = await supabase
            .from('games')
            .select('id, bgg_id, name, data')
            .in('bgg_id', gameBggIds)

          // Fallback: chercher par nom pour les jeux non trouvés par BGG ID
          const foundBggIds = gamesInDb?.map(g => g.bgg_id).filter(Boolean) || []
          const missingGames = eventGamesData.filter(eg => 
            eg.game_id && !foundBggIds.includes(eg.game_id)
          )

          if (missingGames.length > 0) {
            const gameNames = missingGames.map(eg => eg.game_name).filter(Boolean)
            if (gameNames.length > 0) {
              const { data: gamesByName } = await supabase
                .from('games')
                .select('id, bgg_id, name, data')
                .in('name', gameNames)
              
              if (gamesByName) {
                gamesInDb?.push(...gamesByName)
              }
            }
          }

          // Extraire les tags depuis la colonne data JSONB
          if (gamesInDb && gamesInDb.length > 0) {
            console.log(`🔍 Extraction des tags depuis data JSONB pour ${gamesInDb.length} jeu(x)`)
            
            const seenTags = new Set<string>()
            
            for (const game of gamesInDb) {
              if (!game.data || typeof game.data !== 'object') {
                continue
              }

              // Extraire le type (string)
              if (game.data.type && typeof game.data.type === 'string') {
                const typeKey = game.data.type.toLowerCase()
                if (!seenTags.has(typeKey)) {
                  gameTagsFromData.push({
                    id: `type-${game.data.type}`,
                    name: game.data.type
                  })
                  seenTags.add(typeKey)
                }
              }

              // Extraire les mécaniques (array)
              if (Array.isArray(game.data.mechanisms)) {
                for (const mechanism of game.data.mechanisms) {
                  if (typeof mechanism === 'string') {
                    const mechanismKey = mechanism.toLowerCase()
                    if (!seenTags.has(mechanismKey)) {
                      gameTagsFromData.push({
                        id: `mechanism-${mechanism}`,
                        name: mechanism
                      })
                      seenTags.add(mechanismKey)
                    }
                  }
                }
              }
            }
            
            console.log(`✅ ${gameTagsFromData.length} tags extraits depuis data JSONB`)
          }
        }
      }

      // 4. Combiner et dédupliquer les tags
      const allTags = new Map<string, Tag>()

      // Ajouter les tags d'événements (ROUGE)
      if (eventTagsData) {
        eventTagsData.forEach((et: any) => {
          if (et.tags && et.tags.id && et.tags.name) {
            allTags.set(`event-${et.tags.id}`, {
              id: et.tags.id,
              name: et.tags.name,
              type: 'event'
            })
          }
        })
      }

      // Ajouter les tags extraits des jeux (BLEU)
      gameTagsFromData.forEach((tag) => {
        const key = tag.name.toLowerCase()
        if (!allTags.has(key)) {
          allTags.set(key, {
            id: tag.id,
            name: tag.name,
            type: 'game'
          })
        }
      })

      // Convertir en tableau et trier par nom
      const tagsArray = Array.from(allTags.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      )

      setTags(tagsArray)
      console.log(`✅ ${tagsArray.length} tags disponibles chargés pour les filtres (${eventTagsData?.length || 0} tags d'événements + ${gameTagsFromData.length} tags de jeux)`)
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId: number | string) => {
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
    if (lowerName.includes('stratégie') || lowerName.includes('strategy')) return '' //'🎯'
    if (lowerName.includes('aventure') || lowerName.includes('adventure')) return '' //'🗺️'
    if (lowerName.includes('famille') || lowerName.includes('family')) return '' //'👨‍👩‍👧‍👦'
    if (lowerName.includes('party')) return '' //'🎉'
    if (lowerName.includes('coopératif') || lowerName.includes('cooperative')) return '' //'🤝'
    if (lowerName.includes('abstract')) return '' //'🔷'
    if (lowerName.includes('deck') || lowerName.includes('cartes')) return '' //'🃏'
    if (lowerName.includes('dés') || lowerName.includes('dice')) return '' //'🎲'
    if (lowerName.includes('plateau') || lowerName.includes('board')) return '' //'🎮'
    if (lowerName.includes('ambiance')) return '' //'😄'
    if (lowerName.includes('expert')) return '' //'🧠'
    if (lowerName.includes('enfant') || lowerName.includes('kids')) return '' //'🧒'
    if (lowerName.includes('rapide') || lowerName.includes('quick')) return '' //'⚡'
    if (lowerName.includes('rôle') || lowerName.includes('role')) return '' //'🎭'
    
    return '' // 🏷️ 
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
                    {tags.map((tag) => {
                      const isSelected = tempSelected.includes(tag.id)
                      const isEventTag = tag.type === 'event'
                      const isGameTag = tag.type === 'game'
                      
                      return (
                        <TouchableOpacity
                          key={tag.id}
                          style={[
                            styles.tagChip,
                            isEventTag && styles.tagChipEvent,
                            isGameTag && styles.tagChipGame,
                            isSelected && isEventTag && styles.tagChipEventSelected,
                            isSelected && isGameTag && styles.tagChipGameSelected
                          ]}
                          onPress={() => toggleTag(tag.id)}
                        >
                          <Text style={styles.tagEmoji}>{getTagEmoji(tag.name)}</Text>
                          <Text style={[
                            styles.tagText,
                            isEventTag && styles.tagTextEvent,
                            isGameTag && styles.tagTextGame,
                            isSelected && isEventTag && styles.tagTextEventSelected,
                            isSelected && isGameTag && styles.tagTextGameSelected
                          ]}>
                            {tag.name.charAt(0).toUpperCase() + tag.name.slice(1)}
                          </Text>
                          {isSelected && (
                            <Text style={[
                              styles.tagCheckmark,
                              isEventTag && styles.tagCheckmarkEvent,
                              isGameTag && styles.tagCheckmarkGame
                            ]}>✓</Text>
                          )}
                        </TouchableOpacity>
                      )
                    })}
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
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6
  },
  // Tags d'événement (ROUGE)
  tagChipEvent: {
    backgroundColor: '#fce7f3',
    borderColor: '#f9a8d4'
  },
  tagChipEventSelected: {
    backgroundColor: '#fee2e2',
    borderColor: '#f9a8d4'
  },
  tagTextEvent: {
    color: '#1f2937'
  },
  tagTextEventSelected: {
    color: '#dc2626',
    fontWeight: '600'
  },
  tagCheckmarkEvent: {
    color: '#dc2626'
  },
  // Tags de jeu (BLEU)
  tagChipGame: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24'
  },
  tagChipGameSelected: {
    backgroundColor: '#fef9c3',
    borderColor: '#fbbf24'
  },
  tagTextGame: {
    color: '#1f2937'
  },
  tagTextGameSelected: {
    color: '#e3a400',
    fontWeight: '600'
  },
  tagCheckmarkGame: {
    color: '#e3a400'
  },
  // Styles génériques (obsolètes mais gardés pour rétrocompatibilité)
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





