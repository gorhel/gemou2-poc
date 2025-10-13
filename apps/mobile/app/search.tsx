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
import { supabase } from '../lib';

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

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ events: [], users: [], games: [] });
      return;
    }

    setSearching(true);
    try {
      const searchTerm = `%${query}%`;

      // Rechercher des événements
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10);

      // Rechercher des utilisateurs
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
        .limit(10);

      setSearchResults({
        events: events || [],
        users: users || [],
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
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        {!searchQuery ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>Commencez votre recherche</Text>
            <Text style={styles.emptyText}>
              Recherchez des événements, des joueurs ou des jeux
            </Text>
          </View>
        ) : resultsToShow.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>😕</Text>
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyText}>
              Essayez une autre recherche
            </Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {/* Events */}
            {(activeTab === 'all' || activeTab === 'events') && searchResults.events.map((event: any) => (
              <TouchableOpacity
                key={event.id}
                style={styles.resultCard}
                onPress={() => router.push(`/events/${event.id}`)}
              >
                <Text style={styles.resultEmoji}>📅</Text>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultType}>Événement</Text>
                  <Text style={styles.resultTitle}>{event.title}</Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {new Date(event.event_date).toLocaleDateString('fr-FR')} • {event.location}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
});

