'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib';

interface Tag {
  id: number;
  name: string;
}

export default function SearchPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>({
    events: [],
    users: [],
    games: []
  });
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'users' | 'games'>('all');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.replace('/login');
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Error:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  // Charger les tags disponibles au montage du composant
  useEffect(() => {
    loadAvailableTags();
  }, []);

  /**
   * Récupère les tags utilisés par les événements et les jeux dans ces événements
   */
  const loadAvailableTags = async () => {
    setLoadingTags(true);
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
        `);

      if (eventTagsError) {
        console.error('Erreur lors du chargement des tags d\'événements:', eventTagsError);
      }

      // 2. Récupérer les jeux associés aux événements
      const { data: eventGamesData, error: eventGamesError } = await supabase
        .from('event_games')
        .select('game_id, game_name');

      if (eventGamesError) {
        console.error('Erreur lors du chargement des jeux d\'événements:', eventGamesError);
      }

      // 3. Récupérer les tags des jeux
      let gameTagsData: any[] = [];
      if (eventGamesData && eventGamesData.length > 0) {
        // Extraire les BGG IDs
        const gameBggIds = eventGamesData
          .map(eg => eg.game_id)
          .filter(Boolean);

        if (gameBggIds.length > 0) {
          // Trouver les jeux dans la base de données par BGG ID
          const { data: gamesInDb } = await supabase
            .from('games')
            .select('id, bgg_id, name')
            .in('bgg_id', gameBggIds);

          // Fallback: chercher par nom pour les jeux non trouvés par BGG ID
          const foundBggIds = gamesInDb?.map(g => g.bgg_id).filter(Boolean) || [];
          const missingGames = eventGamesData.filter(eg => 
            eg.game_id && !foundBggIds.includes(eg.game_id)
          );

          if (missingGames.length > 0) {
            const gameNames = missingGames.map(eg => eg.game_name).filter(Boolean);
            if (gameNames.length > 0) {
              const { data: gamesByName } = await supabase
                .from('games')
                .select('id, bgg_id, name')
                .in('name', gameNames);
              
              if (gamesByName) {
                gamesInDb?.push(...gamesByName);
              }
            }
          }

          // Récupérer les tags de ces jeux
          if (gamesInDb && gamesInDb.length > 0) {
            const gameIds = gamesInDb.map(g => g.id);
            const { data: gameTags } = await supabase
              .from('game_tags')
              .select(`
                tag_id,
                tags (
                  id,
                  name
                )
              `)
              .in('game_id', gameIds);

            if (gameTags) {
              gameTagsData = gameTags;
            }
          }
        }
      }

      // 4. Combiner et dédupliquer les tags
      const allTags = new Map<number, Tag>();

      // Ajouter les tags d'événements
      if (eventTagsData) {
        eventTagsData.forEach((et: any) => {
          if (et.tags && et.tags.id && et.tags.name) {
            allTags.set(et.tags.id, {
              id: et.tags.id,
              name: et.tags.name
            });
          }
        });
      }

      // Ajouter les tags de jeux
      if (gameTagsData) {
        gameTagsData.forEach((gt: any) => {
          if (gt.tags && gt.tags.id && gt.tags.name) {
            allTags.set(gt.tags.id, {
              id: gt.tags.id,
              name: gt.tags.name
            });
          }
        });
      }

      // Convertir en tableau et trier par nom
      const tagsArray = Array.from(allTags.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      setAvailableTags(tagsArray);
      console.log(`✅ ${tagsArray.length} tags disponibles chargés`);
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  /**
   * Toggle la sélection d'un tag
   */
  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  /**
   * Réinitialiser tous les filtres
   */
  const clearFilters = () => {
    setSelectedTags([]);
  };

  const performSearch = async (query: string, tagFilters: number[] = selectedTags) => {
    if (!query.trim() && tagFilters.length === 0) {
      setSearchResults({ events: [], users: [], games: [] });
      return;
    }

    setSearching(true);
    try {
      let events: any[] = [];
      let users: any[] = [];

      // Rechercher des événements
      if (query.trim()) {
        const searchTerm = `%${query}%`;
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(50);

        events = eventsData || [];

        // Rechercher des utilisateurs
        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
          .limit(10);

        users = usersData || [];
      }

      // Filtrer par tags si des tags sont sélectionnés
      if (tagFilters.length > 0) {
        // Récupérer les événements qui ont au moins un des tags sélectionnés
        const { data: eventsByTags } = await supabase
          .from('event_tags')
          .select('event_id')
          .in('tag_id', tagFilters);

        const eventIds = new Set(eventsByTags?.map(et => et.event_id) || []);

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
          .in('tag_id', tagFilters);

        if (gameTagsData && gameTagsData.length > 0) {
          // Extraire les BGG IDs et noms des jeux qui ont ces tags
          const gameBggIds = gameTagsData
            .map(gt => gt.games?.bgg_id)
            .filter(Boolean);
          
          const gameNames = gameTagsData
            .map(gt => gt.games?.name)
            .filter(Boolean);

          // Trouver les événements contenant ces jeux
          const { data: eventGamesData } = await supabase
            .from('event_games')
            .select('event_id, game_id, game_name');

          if (eventGamesData && eventGamesData.length > 0) {
            eventGamesData.forEach(eg => {
              // Matcher par BGG ID ou par nom de jeu
              if (
                (eg.game_id && gameBggIds.includes(eg.game_id)) ||
                (eg.game_name && gameNames.some(name => 
                  name.toLowerCase() === eg.game_name.toLowerCase()
                ))
              ) {
                eventIds.add(eg.event_id);
              }
            });
          }
        }

        // Si on a une recherche textuelle, filtrer les résultats
        if (query.trim() && events.length > 0) {
          events = events.filter(event => eventIds.has(event.id));
        } else {
          // Sinon, charger directement les événements filtrés
          if (eventIds.size > 0) {
            const { data: filteredEvents } = await supabase
              .from('events')
              .select('*')
              .in('id', Array.from(eventIds))
              .limit(50);
            
            events = filteredEvents || [];
          } else {
            events = [];
          }
        }
      }

      setSearchResults({
        events: events,
        users: users,
        games: []
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery, selectedTags);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTags]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const resultsToShow = activeTab === 'all' 
    ? [...searchResults.events, ...searchResults.users]
    : activeTab === 'events'
    ? searchResults.events
    : searchResults.users;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔍 Recherche</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des événements, joueurs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={Platform.OS === 'web'}
        />
        {searching && <ActivityIndicator style={styles.searchLoader} />}
      </View>

      {/* Filtres par tags */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterToggleBtn,
            selectedTags.length > 0 && styles.filterToggleBtnActive
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <View style={styles.filterToggleBtnContent}>
            <Text style={[
              styles.filterToggleText,
              selectedTags.length > 0 && styles.filterToggleTextActive
            ]}>
              🏷️ Type {selectedTags.length > 0 && `(${selectedTags.length})`}
            </Text>
            {availableTags.length > 0 && !showFilters && selectedTags.length === 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{availableTags.length}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.filterToggleIcon,
            selectedTags.length > 0 && styles.filterToggleIconActive
          ]}>
            {showFilters ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.tagsPanel}>
            {loadingTags ? (
              <View style={styles.tagsPanelLoading}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.tagsPanelLoadingText}>Chargement...</Text>
              </View>
            ) : availableTags.length === 0 ? (
              <View style={styles.tagsPanelEmpty}>
                <Text style={styles.tagsPanelEmptyText}>
                  Aucun tag disponible
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.tagsPanelHeader}>
                  <Text style={styles.tagsPanelTitle}>
                    Filtrer par type d'événement ou de jeu
                  </Text>
                  {selectedTags.length > 0 && (
                    <TouchableOpacity onPress={clearFilters}>
                      <Text style={styles.clearFiltersBtn}>Effacer</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.tagsGrid}>
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.tagChip,
                          isSelected && styles.tagChipSelected
                        ]}
                        onPress={() => toggleTag(tag.id)}
                      >
                        <Text
                          style={[
                            styles.tagChipText,
                            isSelected && styles.tagChipTextSelected
                          ]}
                        >
                          {tag.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Tout ({searchResults.events.length + searchResults.users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
            Événements ({searchResults.events.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            Joueurs ({searchResults.users.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView style={styles.scrollView}>
        {!searchQuery && selectedTags.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>Commencez votre recherche</Text>
            <Text style={styles.emptyText}>
              Recherchez des événements, des joueurs ou utilisez les filtres par type
            </Text>
          </View>
        ) : resultsToShow.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>😕</Text>
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyText}>
              Essayez une autre recherche ou modifiez vos filtres
            </Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {/* Events */}
            {(activeTab === 'all' || activeTab === 'events') && searchResults.events.map((event: any) => (
              <TouchableOpacity
                key={event.id}
                style={styles.resultCard}
                onPress={() => router.push(`/(tabs)/events/${event.id}`)}
              >
                <Text style={styles.resultEmoji}>📅</Text>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultType}>Événement</Text>
                  <Text style={styles.resultTitle}>{event.title}</Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {new Date(event.date_time).toLocaleDateString('fr-FR')} • {event.location}
                  </Text>
                </View>
                <Text style={styles.resultArrow}>→</Text>
              </TouchableOpacity>
            ))}

            {/* Users */}
            {(activeTab === 'all' || activeTab === 'users') && searchResults.users.map((userItem: any) => (
              <TouchableOpacity
                key={userItem.id}
                style={styles.resultCard}
                onPress={() => router.push(`/profile/${userItem.username}`)}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {userItem.full_name?.charAt(0) || userItem.username?.charAt(0) || '👤'}
                  </Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultType}>Joueur</Text>
                  <Text style={styles.resultTitle}>
                    {userItem.full_name || userItem.username}
                  </Text>
                  <Text style={styles.resultSubtitle}>@{userItem.username}</Text>
                </View>
                <Text style={styles.resultArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: Platform.select({ ios: 60, android: 20, web: 20 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingRight: 40,
  },
  searchLoader: {
    position: 'absolute',
    right: 28,
    top: 28,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultType: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  resultArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterToggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  filterToggleBtnActive: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  filterToggleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  filterToggleTextActive: {
    color: '#3b82f6',
  },
  filterToggleIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  filterToggleIconActive: {
    color: '#3b82f6',
  },
  filterBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tagsPanel: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tagsPanelLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  tagsPanelLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  tagsPanelEmpty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  tagsPanelEmptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  tagsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagsPanelTitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  clearFiltersBtn: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tagChipText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});
