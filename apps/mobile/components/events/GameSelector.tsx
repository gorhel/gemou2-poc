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
  Image,
  Alert,
  Switch
} from 'react-native'
import { supabase } from '../../lib'

interface BoardGame {
  id: string
  name: string
  yearPublished: string
  minPlayers: number
  maxPlayers: number
  playingTime: number
  complexity: number
  image: string
  thumbnail: string
  categories: string[]
  mechanics: string[]
  designers: string[]
  artists: string[]
  publishers: string[]
  averageRating: number
  usersRated: number
  rank: number
}

interface EventGame {
  id?: string
  game_id?: string
  game_name: string
  game_thumbnail?: string
  game_image?: string
  year_published?: number
  min_players?: number
  max_players?: number
  playing_time?: number
  complexity?: number
  is_custom: boolean
  is_optional: boolean
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  estimated_duration?: number
  brought_by_user_id?: string
  notes?: string
}

interface GameSelectorProps {
  eventId?: string
  onGamesChange: (games: EventGame[]) => void
  initialGames?: EventGame[]
}

export default function GameSelector({ eventId, onGamesChange, initialGames = [] }: GameSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BoardGame[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedGames, setSelectedGames] = useState<EventGame[]>(initialGames)
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customGameName, setCustomGameName] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [expandedGameIndex, setExpandedGameIndex] = useState<number | null>(null)

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    onGamesChange(selectedGames)
  }, [selectedGames, onGamesChange])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const searchGames = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      // Utiliser l'API web pour rechercher des jeux
      // En production, utiliser l'URL de l'API web, sinon localhost pour le développement
      const baseUrl = process.env.EXPO_PUBLIC_WEB_URL || 
                      (__DEV__ ? 'http://localhost:3000' : 'https://gemou2.com')
      const response = await fetch(`${baseUrl}/api/games/search?q=${encodeURIComponent(query)}&limit=10`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setSearchResults(data.games || [])
    } catch (error) {
      console.error('Error searching games:', error)
      setSearchResults([])
      // Afficher une alerte silencieuse en cas d'erreur
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.warn('Impossible de se connecter à l\'API de recherche de jeux. Vérifiez votre connexion.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (text: string) => {
    setSearchQuery(text)
    searchGames(text)
  }

  const addGame = (game: BoardGame) => {
    const eventGame: EventGame = {
      game_id: game.id,
      game_name: game.name,
      game_thumbnail: game.thumbnail,
      game_image: game.image,
      year_published: parseInt(game.yearPublished),
      min_players: game.minPlayers,
      max_players: game.maxPlayers,
      playing_time: game.playingTime,
      complexity: game.complexity,
      is_custom: false,
      is_optional: false,
      experience_level: 'beginner',
      estimated_duration: game.playingTime,
      brought_by_user_id: currentUser?.id,
      notes: ''
    }

    setSelectedGames(prev => [...prev, eventGame])
    setSearchQuery('')
    setSearchResults([])
  }

  const addCustomGame = () => {
    if (!customGameName.trim()) return

    const customGame: EventGame = {
      game_name: customGameName.trim(),
      is_custom: true,
      is_optional: false,
      experience_level: 'beginner',
      estimated_duration: 60,
      brought_by_user_id: currentUser?.id,
      notes: ''
    }

    setSelectedGames(prev => [...prev, customGame])
    setCustomGameName('')
    setShowAddCustom(false)
  }

  const removeGame = (index: number) => {
    Alert.alert(
      'Supprimer le jeu',
      'Êtes-vous sûr de vouloir supprimer ce jeu ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setSelectedGames(prev => prev.filter((_, i) => i !== index))
        }
      ]
    )
  }

  const updateGame = (index: number, field: keyof EventGame, value: any) => {
    setSelectedGames(prev => prev.map((game, i) =>
      i === index ? { ...game, [field]: value } : game
    ))
  }

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#d1fae5'
      case 'intermediate': return '#fef3c7'
      case 'advanced': return '#fed7aa'
      case 'expert': return '#fee2e2'
      default: return '#f3f4f6'
    }
  }

  const getExperienceLevelTextColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#065f46'
      case 'intermediate': return '#92400e'
      case 'advanced': return '#9a3412'
      case 'expert': return '#991b1b'
      default: return '#374151'
    }
  }

  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Débutant'
      case 'intermediate': return 'Intermédiaire'
      case 'advanced': return 'Avancé'
      case 'expert': return 'Expert'
      default: return level
    }
  }

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un jeu (ex: Catan, Wingspan...)"
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholderTextColor="#9ca3af"
        />
        {loading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        )}
      </View>

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <ScrollView style={styles.searchResults} nestedScrollEnabled>
          {searchResults.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.searchResultItem}
              onPress={() => addGame(game)}
            >
              {game.thumbnail && (
                <Image
                  source={{ uri: game.thumbnail }}
                  style={styles.gameThumbnail}
                />
              )}
              <View style={styles.searchResultContent}>
                <Text style={styles.searchResultName}>{game.name}</Text>
                <Text style={styles.searchResultDetails}>
                  {game.minPlayers}-{game.maxPlayers} joueurs • {game.playingTime} min • {game.complexity.toFixed(1)}/5
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addGame(game)}
              >
                <Text style={styles.addButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Ajouter un jeu personnalisé */}
      <View style={styles.customGameContainer}>
        {!showAddCustom ? (
          <TouchableOpacity
            style={styles.addCustomButton}
            onPress={() => setShowAddCustom(true)}
          >
            <Text style={styles.addCustomButtonText}>➕ Ajouter un jeu personnalisé</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.customGameForm}>
            <TextInput
              style={styles.customGameInput}
              placeholder="Nom du jeu personnalisé"
              value={customGameName}
              onChangeText={setCustomGameName}
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.customGameButtons}>
              <TouchableOpacity
                style={[styles.customGameButton, !customGameName.trim() && styles.customGameButtonDisabled]}
                onPress={addCustomGame}
                disabled={!customGameName.trim()}
              >
                <Text style={styles.customGameButtonText}>Ajouter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customGameButton, styles.customGameButtonCancel]}
                onPress={() => {
                  setShowAddCustom(false)
                  setCustomGameName('')
                }}
              >
                <Text style={[styles.customGameButtonText, styles.customGameButtonTextCancel]}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Jeux sélectionnés */}
      {selectedGames.length > 0 && (
        <View style={styles.selectedGamesContainer}>
          <Text style={styles.selectedGamesTitle}>
            🎮 Jeux sélectionnés ({selectedGames.length})
          </Text>
          <ScrollView style={styles.selectedGamesList} nestedScrollEnabled>
            {selectedGames.map((game, index) => (
              <View key={index} style={styles.selectedGameCard}>
                <View style={styles.selectedGameHeader}>
                  <View style={styles.selectedGameInfo}>
                    {game.game_thumbnail && (
                      <Image
                        source={{ uri: game.game_thumbnail }}
                        style={styles.selectedGameThumbnail}
                      />
                    )}
                    <View style={styles.selectedGameDetails}>
                      <Text style={styles.selectedGameName}>{game.game_name}</Text>
                      {game.year_published && (
                        <Text style={styles.selectedGameYear}>({game.year_published})</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeGame(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Bouton pour développer/réduire */}
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setExpandedGameIndex(expandedGameIndex === index ? null : index)}
                >
                  <Text style={styles.expandButtonText}>
                    {expandedGameIndex === index ? '▼ Réduire' : '▶ Configurer'}
                  </Text>
                </TouchableOpacity>

                {/* Configuration détaillée */}
                {expandedGameIndex === index && (
                  <View style={styles.gameConfig}>
                    {/* Niveau d'expérience */}
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Niveau d'expérience</Text>
                      <View style={styles.experienceButtons}>
                        {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                          <TouchableOpacity
                            key={level}
                            style={[
                              styles.experienceButton,
                              game.experience_level === level && {
                                backgroundColor: getExperienceLevelColor(level),
                                borderColor: getExperienceLevelTextColor(level)
                              }
                            ]}
                            onPress={() => updateGame(index, 'experience_level', level)}
                          >
                            <Text
                              style={[
                                styles.experienceButtonText,
                                game.experience_level === level && {
                                  color: getExperienceLevelTextColor(level)
                                }
                              ]}
                            >
                              {getExperienceLevelText(level)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Durée estimée */}
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Durée estimée (minutes)</Text>
                      <TextInput
                        style={styles.configInput}
                        value={game.estimated_duration?.toString() || ''}
                        onChangeText={(text) => updateGame(index, 'estimated_duration', parseInt(text) || 0)}
                        keyboardType="number-pad"
                        placeholder="60"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    {/* Jeu optionnel */}
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Jeu optionnel</Text>
                      <Switch
                        value={game.is_optional}
                        onValueChange={(value) => updateGame(index, 'is_optional', value)}
                        trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                        thumbColor={game.is_optional ? '#3b82f6' : '#f3f4f6'}
                      />
                    </View>

                    {/* Notes */}
                    <View style={styles.configRow}>
                      <Text style={styles.configLabel}>Notes (optionnel)</Text>
                      <TextInput
                        style={styles.configTextArea}
                        value={game.notes || ''}
                        onChangeText={(text) => updateGame(index, 'notes', text)}
                        placeholder="Ajoutez des notes sur ce jeu..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Badges */}
                    <View style={styles.badgesContainer}>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: getExperienceLevelColor(game.experience_level) }
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: getExperienceLevelTextColor(game.experience_level) }
                          ]}
                        >
                          {getExperienceLevelText(game.experience_level)}
                        </Text>
                      </View>
                      {game.is_optional && (
                        <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
                          <Text style={[styles.badgeText, { color: '#1e40af' }]}>Optionnel</Text>
                        </View>
                      )}
                      {game.is_custom && (
                        <View style={[styles.badge, { backgroundColor: '#e9d5ff' }]}>
                          <Text style={[styles.badgeText, { color: '#6b21a8' }]}>Personnalisé</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 12
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937'
  },
  loadingIndicator: {
    position: 'absolute',
    right: 12,
    top: 12
  },
  searchResults: {
    maxHeight: 200,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  gameThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12
  },
  searchResultContent: {
    flex: 1
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  searchResultDetails: {
    fontSize: 12,
    color: '#6b7280'
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  customGameContainer: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  addCustomButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center'
  },
  addCustomButtonText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500'
  },
  customGameForm: {
    gap: 12
  },
  customGameInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937'
  },
  customGameButtons: {
    flexDirection: 'row',
    gap: 12
  },
  customGameButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center'
  },
  customGameButtonDisabled: {
    backgroundColor: '#d1d5db'
  },
  customGameButtonCancel: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  customGameButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600'
  },
  customGameButtonTextCancel: {
    color: '#6b7280'
  },
  selectedGamesContainer: {
    marginTop: 16
  },
  selectedGamesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12
  },
  selectedGamesList: {
    maxHeight: 400
  },
  selectedGameCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  selectedGameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  selectedGameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  selectedGameThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12
  },
  selectedGameDetails: {
    flex: 1
  },
  selectedGameName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  selectedGameYear: {
    fontSize: 12,
    color: '#6b7280'
  },
  removeButton: {
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  expandButton: {
    paddingVertical: 8,
    alignItems: 'center'
  },
  expandButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500'
  },
  gameConfig: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 16
  },
  configRow: {
    gap: 8
  },
  configLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4
  },
  experienceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  experienceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  },
  experienceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280'
  },
  configInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937'
  },
  configTextArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 80
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600'
  }
})

