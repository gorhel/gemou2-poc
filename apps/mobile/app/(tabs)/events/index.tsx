'use client';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  RefreshControl,
  TextInput,
  Image,
  FlatList,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib';
import { TopHeader } from '../../../components/TopHeader';


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
  image_url?: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

type TabType = 'participating' | 'organizing' | 'past' | 'draft';

export default function EventsPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('participating');
  const [selectedFilters, setSelectedFilters] = useState<{
    date?: string;
    location?: string;
    type?: string;
    players?: string;
  }>({});

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
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, activeTab, selectedFilters]);

  const filterEvents = () => {
    let filtered = [...events];

    // Filtre par onglet
    const now = new Date();
    switch (activeTab) {
      case 'participating':
        // Événements où l'utilisateur participe (pour simplifier, on montre tous les événements actifs)
        filtered = filtered.filter(event => event.status === 'active' && new Date(event.date_time) >= now);
        break;
      case 'organizing':
        // Événements organisés par l'utilisateur
        filtered = filtered.filter(event => event.status === 'active' && new Date(event.date_time) >= now);
        break;
      case 'past':
        filtered = filtered.filter(event => new Date(event.date_time) < now);
        break;
      case 'draft':
        filtered = filtered.filter(event => event.status === 'draft');
        break;
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const getTimeSection = (dateTime: string) => {
    const eventDate = new Date(dateTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    // Calculer les limites de temps
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);
    
    const in14Days = new Date(today);
    in14Days.setDate(today.getDate() + 14);
    
    const in30Days = new Date(today);
    in30Days.setDate(today.getDate() + 30);
  
    // Normaliser eventDate pour comparaison
    const eventDateOnly = new Date(eventDate);
    eventDateOnly.setHours(0, 0, 0, 0);
  
    if (eventDateOnly.getTime() === today.getTime()) {
      return 'Aujourd\'hui';
    } else if (eventDateOnly.getTime() === tomorrow.getTime()) {
      return 'Demain';
    } else if (eventDate < in7Days) {
      return 'Cette semaine';
    } else if (eventDate < in14Days) {
      return 'Semaine prochaine';
    } else if (eventDate < in30Days) {
      return 'Mois prochain';
    } else {
      return 'Dans plus d\'un mois';
    }
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
            <View style={styles.eventImagePlaceholder}>
              <Text style={styles.eventImageEmoji}>🎲</Text>
            </View>
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
    
    <View style={styles.container}>
      {/* Header */}
      <View style={{ flex: 1 }}>
        <TopHeader />  {/* Auto-configuration ! */}
        <ScrollView>
          {/* Contenu */}
        </ScrollView>
      </View>

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
          {[
            { key: 'date', icon: '📅', label: 'Date' },
            { key: 'location', icon: '📍', label: 'Location' },
            { key: 'type', icon: '🎲', label: 'Type' },
            { key: 'players', icon: '👥', label: 'Play' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilters[filter.key as keyof typeof selectedFilters] && styles.activeFilterButton
              ]}
              onPress={() => {
                // Toggle filter
                setSelectedFilters(prev => ({
                  ...prev,
                  [filter.key]: prev[filter.key as keyof typeof selectedFilters] ? undefined : 'active'
                }));
              }}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text style={[
                styles.filterLabel,
                selectedFilters[filter.key as keyof typeof selectedFilters] && styles.activeFilterLabel
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.eventsListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
});

