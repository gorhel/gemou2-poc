'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '../../lib/supabase-client'
import { Button, LoadingSpinner, Input } from '../../components/ui'
import { ResponsiveLayout } from '../../components/layout'

interface Tag {
  id: number
  name: string
}

interface SearchResults {
  events: any[]
  users: any[]
  games: any[]
}

export default function SearchPage() {
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults>({
    events: [],
    users: [],
    games: []
  })
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'users' | 'games'>('all')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/login')
          return
        }

        setUser(user)
      } catch (error) {
        console.error('Error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase.auth])

  // Charger les tags disponibles au montage du composant
  useEffect(() => {
    loadAvailableTags()
  }, [])

  /**
   * Récupère les tags utilisés par les événements et les jeux dans ces événements
   */
  const loadAvailableTags = async () => {
    setLoadingTags(true)
    try {
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

      // 3. Récupérer les tags des jeux
      let gameTagsData: any[] = []
      if (eventGamesData && eventGamesData.length > 0) {
        // Extraire les BGG IDs
        const gameBggIds = eventGamesData
          .map(eg => eg.game_id)
          .filter(Boolean)

        if (gameBggIds.length > 0) {
          // Trouver les jeux dans la base de données par BGG ID
          const { data: gamesInDb } = await supabase
            .from('games')
            .select('id, bgg_id, name')
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
                .select('id, bgg_id, name')
                .in('name', gameNames)
              
              if (gamesByName) {
                gamesInDb?.push(...gamesByName)
              }
            }
          }

          // Récupérer les tags de ces jeux
          if (gamesInDb && gamesInDb.length > 0) {
            const gameIds = gamesInDb.map(g => g.id)
            const { data: gameTags } = await supabase
              .from('game_tags')
              .select(`
                tag_id,
                tags (
                  id,
                  name
                )
              `)
              .in('game_id', gameIds)

            if (gameTags) {
              gameTagsData = gameTags
            }
          }
        }
      }

      // 4. Combiner et dédupliquer les tags
      const allTags = new Map<number, Tag>()

      // Ajouter les tags d'événements
      if (eventTagsData) {
        eventTagsData.forEach((et: any) => {
          if (et.tags && et.tags.id && et.tags.name) {
            allTags.set(et.tags.id, {
              id: et.tags.id,
              name: et.tags.name
            })
          }
        })
      }

      // Ajouter les tags de jeux
      if (gameTagsData) {
        gameTagsData.forEach((gt: any) => {
          if (gt.tags && gt.tags.id && gt.tags.name) {
            allTags.set(gt.tags.id, {
              id: gt.tags.id,
              name: gt.tags.name
            })
          }
        })
      }

      // Convertir en tableau et trier par nom
      const tagsArray = Array.from(allTags.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      )

      setAvailableTags(tagsArray)
      console.log(`✅ ${tagsArray.length} tags disponibles chargés`)
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error)
    } finally {
      setLoadingTags(false)
    }
  }

  /**
   * Toggle la sélection d'un tag
   */
  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }

  /**
   * Réinitialiser tous les filtres
   */
  const clearFilters = () => {
    setSelectedTags([])
  }

  const performSearch = async (query: string, tagFilters: number[] = selectedTags) => {
    if (!query.trim() && tagFilters.length === 0) {
      setSearchResults({ events: [], users: [], games: [] })
      return
    }

    setSearching(true)
    try {
      let events: any[] = []
      let users: any[] = []

      // Rechercher des événements
      if (query.trim()) {
        const searchTerm = `%${query}%`
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(50)

        events = eventsData || []

        // Rechercher des utilisateurs
        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
          .limit(10)

        users = usersData || []
      }

      // Filtrer par tags si des tags sont sélectionnés
      if (tagFilters.length > 0) {
        // Récupérer les événements qui ont au moins un des tags sélectionnés
        const { data: eventsByTags } = await supabase
          .from('event_tags')
          .select('event_id')
          .in('tag_id', tagFilters)

        const eventIds = new Set(eventsByTags?.map(et => et.event_id) || [])

        // Récupérer aussi les événements qui contiennent des jeux avec ces tags
        const { data: gameTagsData } = await supabase
          .from('game_tags')
          .select(`
            game_id,
            games (
              bgg_id,
              name
            )
          `)
          .in('tag_id', tagFilters)

        if (gameTagsData && gameTagsData.length > 0) {
          // Extraire les BGG IDs et noms des jeux qui ont ces tags
          const gameBggIds = gameTagsData
            .map(gt => gt.games?.bgg_id)
            .filter(Boolean)
          
          const gameNames = gameTagsData
            .map(gt => gt.games?.name)
            .filter(Boolean)

          // Trouver les événements contenant ces jeux
          const { data: eventGamesData } = await supabase
            .from('event_games')
            .select('event_id, game_id, game_name')

          if (eventGamesData && eventGamesData.length > 0) {
            eventGamesData.forEach(eg => {
              // Matcher par BGG ID ou par nom de jeu
              if (
                (eg.game_id && gameBggIds.includes(eg.game_id)) ||
                (eg.game_name && gameNames.some(name => 
                  name.toLowerCase() === eg.game_name.toLowerCase()
                ))
              ) {
                eventIds.add(eg.event_id)
              }
            })
          }
        }

        // Si on a une recherche textuelle, filtrer les résultats
        if (query.trim() && events.length > 0) {
          events = events.filter(event => eventIds.has(event.id))
        } else {
          // Sinon, charger directement les événements filtrés
          if (eventIds.size > 0) {
            const { data: filteredEvents } = await supabase
              .from('events')
              .select('*')
              .in('id', Array.from(eventIds))
              .limit(50)
            
            events = filteredEvents || []
          } else {
            events = []
          }
        }
      }

      setSearchResults({
        events: events,
        users: users,
        games: []
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery, selectedTags)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedTags])

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600 text-lg">Chargement...</p>
          </div>
        </div>
      </ResponsiveLayout>
    )
  }

  if (!user) {
    return null
  }

  const resultsToShow = activeTab === 'all' 
    ? [...searchResults.events, ...searchResults.users]
    : activeTab === 'events'
    ? searchResults.events
    : searchResults.users

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">🔍 Recherche</h1>
            <p className="mt-2 text-gray-600">
              Recherchez des événements et des joueurs
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Input */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Rechercher des événements, joueurs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10"
                size="lg"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* Filtres par tags */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-900">
                🏷️ Type {selectedTags.length > 0 && `(${selectedTags.length})`}
              </span>
              <span className="text-gray-500">
                {showFilters ? '▲' : '▼'}
              </span>
            </button>

            {showFilters && (
              <div className="px-6 pb-6 border-t border-gray-200 pt-6 bg-gray-50">
                {loadingTags ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                    <span className="ml-3 text-gray-600">Chargement...</span>
                  </div>
                ) : availableTags.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun tag disponible</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-600 font-medium">
                        Filtrer par type d'événement ou de jeu
                      </p>
                      {selectedTags.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Effacer
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id)
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`
                              px-4 py-2 rounded-full text-sm font-medium transition-all
                              ${isSelected
                                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600'
                              }
                            `}
                          >
                            {tag.name}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6 flex border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`
                flex-1 px-6 py-4 text-center font-medium transition-colors
                ${activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              Tout ({searchResults.events.length + searchResults.users.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`
                flex-1 px-6 py-4 text-center font-medium transition-colors
                ${activeTab === 'events'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              Événements ({searchResults.events.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`
                flex-1 px-6 py-4 text-center font-medium transition-colors
                ${activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              Joueurs ({searchResults.users.length})
            </button>
          </div>

          {/* Results */}
          {!searchQuery && selectedTags.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Commencez votre recherche
              </h3>
              <p className="text-gray-600">
                Recherchez des événements, des joueurs ou filtrez par type
              </p>
            </div>
          ) : resultsToShow.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <span className="text-6xl mb-4 block">😕</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Aucun résultat
              </h3>
              <p className="text-gray-600">
                Essayez une autre recherche ou modifiez vos filtres
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Events */}
              {(activeTab === 'all' || activeTab === 'events') && searchResults.events.map((event: any) => (
                <button
                  key={event.id}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="w-full bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4 text-left"
                >
                  <span className="text-4xl">📅</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      Événement
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date_time).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} • {event.location}
                    </p>
                  </div>
                  <span className="text-2xl text-gray-400">→</span>
                </button>
              ))}

              {/* Users */}
              {(activeTab === 'all' || activeTab === 'users') && searchResults.users.map((userItem: any) => (
                <button
                  key={userItem.id}
                  onClick={() => router.push(`/profile/${userItem.username}`)}
                  className="w-full bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {userItem.full_name?.charAt(0) || userItem.username?.charAt(0) || '👤'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      Joueur
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {userItem.full_name || userItem.username}
                    </h3>
                    <p className="text-sm text-gray-600">@{userItem.username}</p>
                  </div>
                  <span className="text-2xl text-gray-400">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  )
}

