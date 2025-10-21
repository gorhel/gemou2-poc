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
  Dimensions,
  Image,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  image_url?: string;
  status: string;
}

interface User {
  id: string;
  username: string;
  full_name: string;
  bio?: string;
  avatar_url?: string;
}

interface MarketplaceItem {
  id: string;
  title: string;
  type: 'sale' | 'exchange';
  price?: number;
  condition: string;
  game_name?: string;
  wanted_game?: string;
  images?: string[];
  seller_city?: string;
}

interface BoardGame {
  id: string;
  name: string;
  image_url?: string;
  min_players?: number;
  max_players?: number;
  play_time?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // États pour les données
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [games, setGames] = useState<BoardGame[]>([]);

  // États de chargement
  const [eventsLoading, setEventsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.replace('/login');
        return;
      }

      setUser(user);
      // Charger toutes les données en parallèle
      await Promise.all([
        loadEvents(),
        loadUsers(),
        loadMarketplace(),
        loadGames()
      ]);
    } catch (error) {
      console.error('Error:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gte('date_time', now)
        .order('date_time', { ascending: true })
        .limit(10);

      if (!error) {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('username', 'is', null)
        .not('full_name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error) {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadMarketplace = async () => {
    try {
      setMarketplaceLoading(true);
      const { data, error } = await supabase
        .from('marketplace_items_enriched')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error) {
        setMarketplaceItems(data || []);
      }
    } catch (error) {
      console.error('Error loading marketplace:', error);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const loadGames = async () => {
    try {
      setGamesLoading(true);
      // Simuler des jeux populaires pour le moment
      // TODO: Connecter à l'API BoardGameGeek
      setGames([]);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setGamesLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUser();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
          <Text style={styles.headerSubtitle}>Bienvenue, {user.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>🎲 Bienvenue sur Gémou2 !</Text>
        <Text style={styles.welcomeText}>
          Découvrez les événements, rencontrez des joueurs et explorez de nouveaux jeux.
        </Text>
      </View>
      

      {/* Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Événements à venir</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {eventsLoading ? (
          <ActivityIndicator color="#3b82f6" style={{ marginVertical: 20 }} />
        ) : events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎲</Text>
            <Text style={styles.emptyText}>Aucun événement à venir</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/(tabs)/events/${event.id}`)}
              >
                <View style={styles.eventImageContainer}>
                {event.image_url ? (
                  <Image
                  source={{ uri: event.image_url }}
                  style={styles.eventImage}
                  resizeMode="cover"
                  
                  />

                  ) : (
                    <Text style={styles.eventImagePlaceholder}>📅</Text>
                    )}
                </View>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <Text style={styles.eventLocation} numberOfLines={1}>📍 {event.location}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.date_time).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}, 👤 4/6
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Marketplace Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Annonces de vente et d'échange</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/marketplace')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {marketplaceLoading ? (
          <ActivityIndicator color="#3b82f6" style={{ marginVertical: 20 }} />
        ) : marketplaceItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>Aucune annonce disponible</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {marketplaceItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.marketplaceCard}
                onPress={() => router.push(`/trade/${item.id}`)}
              >
                <View style={styles.marketplaceImage}>
                  {item.images && item.images.length > 0 ? (
                    <Image source={{ uri: item.images[0] }} style={styles.marketplaceImageFill} />
                  ) : (
                    <Text style={styles.marketplaceImagePlaceholder}>🎲</Text>
                  )}
                  {item.type === 'sale' && item.price && (
                    <View style={styles.priceTag}>
                      <Text style={styles.priceText}>{item.price.toFixed(2)} €</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.marketplaceTitle} numberOfLines={2}>
                {item.type === 'sale' && (
                  'Vente : ' + item.title
                )}
                {item.type === 'exchange' && (
                  'Échange : ' + item.title
                )}
                  
                  </Text>
                
                  <Text style={styles.marketplaceGame} numberOfLines={1}>🎮 {item.game_name}</Text>

              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Users Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggestions de joueurs</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/community')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {usersLoading ? (
          <ActivityIndicator color="#3b82f6" style={{ marginVertical: 20 }} />
        ) : users.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>Aucun joueur trouvé</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {users.slice(0, 10).map((userItem) => (
              <TouchableOpacity
                key={userItem.id}
                style={styles.userCard}
                onPress={() => router.push(`/profile/${userItem.username}`)}
              >
                <View style={styles.userAvatar}>
                {userItem.avatar_url ? (
                  <Image
                  source={{ uri: userItem.avatar_url }}
                  style={styles.userAvatarImage}
                  resizeMode="cover"
                  />
                  ) : (
                    <Text style={styles.userAvatarText}>
                      {userItem.full_name?.charAt(0) || '👤'}
                    </Text>
                  )}
                </View>
                <Text style={styles.userName} numberOfLines={1}>{userItem.full_name}</Text>
                <Text style={styles.userUsername} numberOfLines={1}>@{userItem.username}</Text>
                <Text style={styles.userUsername} numberOfLines={1}>@{userItem.username}</Text>
              </TouchableOpacity>
                      ))}
            </ScrollView>
                      )}
          </View>



      {/* Spacer for bottom tab bar */}
      <View style={{ height: 20 }} />
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  logoutText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  horizontalScroll: {
    marginBottom: 16,
  },
  eventCard: {
    width: 200,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    elevation: 3,
  },
  eventImageContainer: {
    height: 100,
    backgroundColor: '#112211',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8, // optionnel, pour arrondir les coins
  },
  eventImagePlaceholder: {
    fontSize: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    position: 'absolute',
    backgroundColor: 'white',
    opacity: 0.7,
    top:'37%'
  },
  eventLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#61758A',
    fontWeight: '500',
  },
  userCard: {
    width: 150,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    elevation: 3,
  },
  userAvatar: {
    width: 96,
    height: 96,
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%', // ou la moitié de la largeur/hauteur pour un cercle parfait
  },
  userAvatarText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  marketplaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  marketplaceCard: {
    width: 200,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    elevation: 3,
    overflow: 'hidden'
  },
  marketplaceImage: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor:'#112211',
    borderRadius: 8,
  },
  marketplaceImageFill: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  marketplaceImagePlaceholder: {
    fontSize: 48,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  marketplaceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    padding: 8,
    paddingBottom: 4,
  },
  marketplaceGame: {
    fontSize: 11,
    color: '#6b7280',
    paddingHorizontal: 8,
    paddingBottom: 8
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
