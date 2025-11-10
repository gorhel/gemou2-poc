'use client'

import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TextInput,
  Image,
  FlatList,
  Dimensions,
  ScrollView
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../../lib'
import { PageLayout } from '../../../components/layout'
import LocationFilterModal from '../../../components/events/LocationFilterModal'
import DateFilterModal from '../../../components/events/DateFilterModal'
import TypeFilterModal from '../../../components/events/TypeFilterModal'
import PlayersFilterModal from '../../../components/events/PlayersFilterModal'


const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  status: string;
  creator_id: string;
  image_url?: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

type TabType = 'upcoming' | 'participating' | 'organizing' | 'past' | 'draft';

interface FilterState {
  cities: string[];
  startDate: Date | null;
  endDate: Date | null;
  tags: number[];
  maxPlayers: number | null;
}

export default function EventsPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [participatingEventIds, setParticipatingEventIds] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    cities: [],
    startDate: null,
    endDate: null,
    tags: [],
    maxPlayers: null
  });

  // États pour les modaux de filtres
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [playersModalVisible, setPlayersModalVisible] = useState(false);

  // Map pour stocker les événements avec leurs tags
  const [eventTagsMap, setEventTagsMap] = useState<Map<string, number[]>>(new Map());

  const loadUser = async () => {
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
    }
  };

  const loadEvents = async () => {
    try {
      // Charger les événements avec creator_id
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          date_time,
          location,
          max_participants,
          current_participants,
          status,
          creator_id,
          image_url,
          profiles!creator_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('date_time', { ascending: true });

      if (error) throw error;

      const eventsData = (data || []).map(event => ({
        ...event,
        profiles: Array.isArray(event.profiles) ? event.profiles[0] : event.profiles
      }));
      setEvents(eventsData);
      
      // Charger les participations de l'utilisateur si connecté
      if (user) {
        const { data: participations, error: participationsError } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', user.id)
          .eq('status', 'registered');

        if (!participationsError && participations) {
          const eventIds = participations.map(p => p.event_id);
          setParticipatingEventIds(eventIds);
        }
      }

      // Charger les tags pour tous les événements
      await loadEventTags(eventsData.map(e => e.id));
      
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadEventTags = async (eventIds: string[]) => {
    try {
      if (eventIds.length === 0) return;

      const { data, error } = await supabase
        .from('event_tags')
        .select('event_id, tag_id')
        .in('event_id', eventIds);

      if (error) throw error;

      const tagsMap = new Map<string, number[]>();
      (data || []).forEach(item => {
        const existingTags = tagsMap.get(item.event_id) || [];
        tagsMap.set(item.event_id, [...existingTags, item.tag_id]);
      });

      setEventTagsMap(tagsMap);
    } catch (error) {
      console.error('Error loading event tags:', error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, activeTab, selectedFilters, participatingEventIds, user, eventTagsMap]);

  const filterEvents = () => {
    let filtered = [...events];
    const now = new Date();

    // Filtre par onglet
    switch (activeTab) {
      case 'upcoming':
        // "A venir" : tous les événements futurs publiés, peu importe l'hôte
        filtered = filtered.filter(event => 
          new Date(event.date_time) >= now && 
          event.status !== 'draft' &&
          event.status !== 'cancelled'
        );
        break;
        
      case 'participating':
        // "Je participe" : événements où l'utilisateur est participant
        filtered = filtered.filter(event => 
          participatingEventIds.includes(event.id)
        );
        break;
        
      case 'organizing':
        // "J'organise" : événements où l'utilisateur est l'hôte
        filtered = filtered.filter(event => 
          event.creator_id === user?.id
        );
        break;
        
      case 'past':
        // "Passés" : événements dont la date est avant maintenant
        filtered = filtered.filter(event => 
          new Date(event.date_time) < now
        );
        break;
        
      case 'draft':
        // "Brouillon" : événements non publiés dont l'utilisateur est l'hôte
        filtered = filtered.filter(event => 
          event.status === 'draft' && 
          event.creator_id === user?.id
        );
        break;
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par villes (OR logique - si au moins une ville correspond)
    if (selectedFilters.cities.length > 0) {
      filtered = filtered.filter(event =>
        selectedFilters.cities.some(city => 
          event.location.toLowerCase().includes(city.toLowerCase())
        )
      );
    }

    // Filtre par dates (période)
    if (selectedFilters.startDate && selectedFilters.endDate) {
      const startDate = new Date(selectedFilters.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedFilters.endDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date_time);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }

    // Filtre par tags (OR logique - si au moins un tag correspond)
    if (selectedFilters.tags.length > 0) {
      filtered = filtered.filter(event => {
        const eventTags = eventTagsMap.get(event.id) || [];
        return selectedFilters.tags.some(tagId => eventTags.includes(tagId));
      });
    }

    // Filtre par nombre de joueurs (événements avec nombre de participants <= sélection)
    if (selectedFilters.maxPlayers !== null) {
      filtered = filtered.filter(event => 
        event.current_participants <= selectedFilters.maxPlayers!
      );
    }

    setFilteredEvents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const getTimeSection = (dateTime: string) => {
  const eventDate = new Date(dateTime)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const eventDateOnly = new Date(eventDate)
  eventDateOnly.setHours(0, 0, 0, 0)

  const startOfWeek = new Date(today)
  const day = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1
  startOfWeek.setDate(startOfWeek.getDate() - day)

  const startOfLastWeek = new Date(startOfWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfLastMonth = new Date(startOfCurrentMonth)
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const in7Days = new Date(today)
  in7Days.setDate(today.getDate() + 7)

  const in14Days = new Date(today)
  in14Days.setDate(today.getDate() + 14)

  const in30Days = new Date(today)
  in30Days.setDate(today.getDate() + 30)

  if (eventDateOnly.getTime() === today.getTime()) {
    return 'Aujourd\'hui'
  }

  if (eventDateOnly.getTime() === tomorrow.getTime()) {
    return 'Demain'
  }

  if (eventDateOnly > today) {
    if (eventDate < in7Days) return 'Cette semaine'
    if (eventDate < in14Days) return 'Semaine prochaine'
    if (eventDate < in30Days) return 'Mois prochain'
    return 'Dans plus d\'un mois'
  }

  if (eventDateOnly >= startOfWeek) {
    return 'Cette semaine'
  }

  if (eventDateOnly >= startOfLastWeek) {
    return 'La semaine dernière'
  }

  if (eventDateOnly >= startOfLastMonth) {
    return 'Le mois dernier'
  }

  return 'Plus loin'
  };

  const formatDate = (dateTime: string) => {
    const d = new Date(dateTime);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('fr-FR', { month: 'long' });
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day} ${month}, ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }
  

  
  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/(tabs)/events/${item.id}`)}
    >
      <View style={styles.eventContent}>
        <View style={styles.eventTextContent}>
          <Text style={styles.eventTimeSection}> {formatDate(item.date_time)}</Text>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.eventTime}>
            {new Date(item.date_time).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })} - {new Date(new Date(item.date_time).getTime() + 4 * 60 * 60 * 1000).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })} · {item.current_participants}/{item.max_participants} participants
          </Text>
        </View>
        <View style={styles.eventImageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.eventImage} />
          ) : (
          <Image source={{ uri: '../../../assets/eventImagePlaceholder.png' }} style={styles.eventImage} />
            
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const groupedEvents = filteredEvents.reduce((groups: { [key: string]: Event[] }, event) => {
    const timeSection = getTimeSection(event.date_time);
    if (!groups[timeSection]) {
      groups[timeSection] = [];
    }
    groups[timeSection].push(event);
    return groups;
  }, {});

  return (
    <PageLayout showHeader={true} refreshing={refreshing} onRefresh={onRefresh}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des événements..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {[
            { key: 'upcoming', label: 'A venir' },
            { key: 'participating', label: 'Je participe' },
            { key: 'organizing', label: "J'organise" },
            { key: 'past', label: 'Passés' },
            { key: 'draft', label: 'Brouillon' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key as TabType)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {/* Filtre Date */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              (selectedFilters.startDate || selectedFilters.endDate) && styles.activeFilterButton
            ]}
            onPress={() => setDateModalVisible(true)}
          >
            <Text style={styles.filterIcon}>📅</Text>
            <Text style={[
              styles.filterLabel,
              (selectedFilters.startDate || selectedFilters.endDate) && styles.activeFilterLabel
            ]}>
              Date
            </Text>
            {(selectedFilters.startDate || selectedFilters.endDate) && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Filtre Lieu */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilters.cities.length > 0 && styles.activeFilterButton
            ]}
            onPress={() => setLocationModalVisible(true)}
          >
            <Text style={styles.filterIcon}>📍</Text>
            <Text style={[
              styles.filterLabel,
              selectedFilters.cities.length > 0 && styles.activeFilterLabel
            ]}>
              Lieu
            </Text>
            {selectedFilters.cities.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedFilters.cities.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Filtre Type */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilters.tags.length > 0 && styles.activeFilterButton
            ]}
            onPress={() => setTypeModalVisible(true)}
          >
            <Text style={styles.filterIcon}>🎲</Text>
            <Text style={[
              styles.filterLabel,
              selectedFilters.tags.length > 0 && styles.activeFilterLabel
            ]}>
              Type
            </Text>
            {selectedFilters.tags.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedFilters.tags.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Filtre Joueurs */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilters.maxPlayers !== null && styles.activeFilterButton
            ]}
            onPress={() => setPlayersModalVisible(true)}
          >
            <Text style={styles.filterIcon}>👥</Text>
            <Text style={[
              styles.filterLabel,
              selectedFilters.maxPlayers !== null && styles.activeFilterLabel
            ]}>
              Joueurs
            </Text>
            {selectedFilters.maxPlayers !== null && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>≤{selectedFilters.maxPlayers}</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Modals de filtres */}
      <LocationFilterModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        selectedCities={selectedFilters.cities}
        onApply={(cities) => setSelectedFilters(prev => ({ ...prev, cities }))}
      />

      <DateFilterModal
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
        startDate={selectedFilters.startDate}
        endDate={selectedFilters.endDate}
        onApply={(startDate, endDate) => 
          setSelectedFilters(prev => ({ ...prev, startDate, endDate }))
        }
      />

      <TypeFilterModal
        visible={typeModalVisible}
        onClose={() => setTypeModalVisible(false)}
        selectedTags={selectedFilters.tags}
        onApply={(tags) => setSelectedFilters(prev => ({ ...prev, tags }))}
      />

      <PlayersFilterModal
        visible={playersModalVisible}
        onClose={() => setPlayersModalVisible(false)}
        maxPlayers={selectedFilters.maxPlayers}
        onApply={(maxPlayers) => setSelectedFilters(prev => ({ ...prev, maxPlayers }))}
      />

      {/* Events List */}
      <FlatList
        data={Object.entries(groupedEvents)}
        keyExtractor={([timeSection]) => timeSection}
        renderItem={({ item: [timeSection, events] }) => (
          <View style={styles.timeSection}>
            <Text style={styles.timeSectionTitle}>{timeSection}</Text>
            {events.map((event) => (
              <View key={event.id}>
                {renderEvent({ item: event })}
              </View>
            ))}
          </View>
        )}
        style={styles.eventsList}
        contentContainerStyle={styles.eventsListContent}
        showsVerticalScrollIndicator={false}
      />
    </PageLayout>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: Platform.select({ ios: 60, android: 20, web: 20 }),
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 24,
    marginRight: 12,
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabsScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#3b82f6',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterLabel: {
    color: 'white',
  },
  filterBadge: {
    backgroundColor: 'white',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 6
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    paddingBottom: 20,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeSectionTitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
  },
  eventCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventContent: {
    flexDirection: 'row',
    padding: 16,
  },
  eventTextContent: {
    flex: 1,
    marginRight: 12,
  },
  eventTimeSection: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventImageEmoji: {
    fontSize: 32,
  },
  fixedButton: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 8, // Ombre sur Android
    shadowColor: '#000', // Ombre sur iOS
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

