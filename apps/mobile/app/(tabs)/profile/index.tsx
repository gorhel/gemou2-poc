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
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib';
import { TopHeader } from '../../../components/TopHeader';

type TabType = 'informations' | 'privacy' | 'account';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('informations');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    eventsCreated: 0,
    eventsParticipated: 0,
    gamesOwned: 0,
    friends: 0
  });

  const loadProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.replace('/login');
        return;
      }

      setUser(user);

      // Charger le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Charger les statistiques
      const [eventsCreated, eventsParticipated, gamesOwned, friends] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('creator_id', user.id),
        supabase.from('event_participants').select('id', { count: 'exact', head: true }).eq('profile_id', user.id),
        supabase.from('user_games').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('friends').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'accepted')
      ]);

      setStats({
        eventsCreated: eventsCreated.count || 0,
        eventsParticipated: eventsParticipated.count || 0,
        gamesOwned: gamesOwned.count || 0,
        friends: friends.count || 0
      });

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!profile) {
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
      <View style={{ flex: 1 }}>
        <TopHeader />  {/* Auto-configuration ! */}
        <ScrollView>
          {/* Contenu */}
        </ScrollView>
      </View>

      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.full_name?.charAt(0) || profile.username?.charAt(0) || '👤'}
            </Text>
          </View>
        </View>

        <Text style={styles.fullName}>{profile.full_name || 'Utilisateur'}</Text>
        <Text style={styles.username}>@{profile.username || 'username'}</Text>

              {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {[
              { key: 'informations', label: 'Mes infos' },
              { key: 'privacy', label: 'Ma confidentialité' },
              { key: 'account', label: 'Mon compte' }
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
        
        {profile.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}

        {profile.city && (
          <Text style={styles.location}>📍 {profile.city}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.eventsCreated}</Text>
          <Text style={styles.statLabel}>Événements créés</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.eventsParticipated}</Text>
          <Text style={styles.statLabel}>Participations</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.gamesOwned}</Text>
          <Text style={styles.statLabel}>Jeux</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.friends}</Text>
          <Text style={styles.statLabel}>Amis</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/events')}
        >
          <Text style={styles.actionButtonEmoji}>📅</Text>
          <Text style={styles.actionButtonText}>Mes événements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/community')}
        >
          <Text style={styles.actionButtonEmoji}>💬</Text>
          <Text style={styles.actionButtonText}>Communauté</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {}}
        >
          <Text style={styles.actionButtonEmoji}>⚙️</Text>
          <Text style={styles.actionButtonText}>Paramètres</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Text style={styles.actionButtonEmoji}>🚪</Text>
          <Text style={[styles.actionButtonText, styles.signOutText]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingTop: Platform.select({ ios: 80, android: 40, web: 40 }),
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
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
  actionButtonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  signOutButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  signOutText: {
    color: '#dc2626',
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
});



