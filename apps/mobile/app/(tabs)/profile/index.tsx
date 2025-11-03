'use client'

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../../lib'
import { PageLayout } from '../../../components/layout'
import {
  FriendRequestCard,
  SentRequestCard,
  FriendCard,
  UserSearchBar,
  FriendRequest,
  Friendship
} from '../../../components/friends'
import { PrivacySettings } from '../../../components/friends/PrivacySettings'

type TabType = 'informations' | 'friends' | 'privacy' | 'account';

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
  
  // États pour les amis
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        supabase.from('event_participants').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
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
    if (activeTab === 'friends') {
      loadFriendsData();
    }
  };

  // Charger les données d'amitié
  const loadFriendsData = async () => {
    if (!user) return;
    
    setLoadingFriends(true);
    try {
      // Demandes reçues
      const { data: received, error: receivedError } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          friendship_status,
          created_at,
          updated_at,
          deleted_at,
          sender:profiles!friends_user_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('friend_id', user.id)
        .eq('friendship_status', 'pending')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;
      setReceivedRequests((received || []) as unknown as FriendRequest[]);

      // Demandes envoyées
      const { data: sent, error: sentError } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          friendship_status,
          created_at,
          updated_at,
          deleted_at,
          receiver:profiles!friends_friend_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .eq('friendship_status', 'pending')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;
      setSentRequests((sent || []) as unknown as FriendRequest[]);

      // Liste d'amis
      const { data: friendsList, error: friendsError } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          friend_id,
          friendship_status,
          created_at,
          updated_at,
          deleted_at,
          friend:profiles!friends_friend_id_fkey(id, username, full_name, avatar_url, bio, friends_list_public)
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('friendship_status', 'accepted')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (friendsError) throw friendsError;
      
      // Formater les amis pour afficher le bon profil
      const formattedFriends = ((friendsList || []) as any[]).map(f => ({
        ...f,
        friend: f.friend_id === user.id 
          ? { id: f.user_id, username: null, full_name: null, avatar_url: null, bio: null, friends_list_public: false }
          : f.friend
      }));
      
      setFriends(formattedFriends as Friendship[]);

      // Mettre à jour le compteur d'amis dans les stats
      setStats(prev => ({ ...prev, friends: formattedFriends.length }));

    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Envoyer une demande d'amitié
  const handleSendRequest = async (
    friendId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    try {
      setActionLoading(friendId);
      const { data, error } = await supabase.rpc('send_friend_request', {
        friend_uuid: friendId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; auto_accepted?: boolean };
      
      if (!result.success) {
        let message = 'Impossible d\'envoyer la demande';
        if (result.error === 'rate_limit_exceeded') {
          message = 'Vous avez atteint la limite de 50 demandes par jour';
        } else if (result.error === 'already_friends') {
          message = 'Vous êtes déjà amis';
        } else if (result.error === 'request_already_sent') {
          message = 'Demande déjà envoyée';
        }
        onError?.(message);
        return;
      }

      await loadFriendsData();
      
      if (result.auto_accepted) {
        onSuccess?.();
      } else {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      onError?.('Impossible d\'envoyer la demande');
    } finally {
      setActionLoading(null);
    }
  };

  // Accepter une demande
  const handleAcceptRequest = async (
    requestId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    try {
      setActionLoading(requestId);
      const { data, error } = await supabase.rpc('accept_friend_request', {
        request_id: requestId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        onError?.('Impossible d\'accepter la demande');
        return;
      }

      await loadFriendsData();
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      onError?.('Impossible d\'accepter la demande');
    } finally {
      setActionLoading(null);
    }
  };

  // Refuser une demande
  const handleRejectRequest = async (
    requestId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    try {
      setActionLoading(requestId);
      const { data, error } = await supabase.rpc('reject_friend_request', {
        request_id: requestId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        onError?.('Impossible de refuser la demande');
        return;
      }

      await loadFriendsData();
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      onError?.('Impossible de refuser la demande');
    } finally {
      setActionLoading(null);
    }
  };

  // Annuler une demande envoyée
  const handleCancelRequest = async (
    requestId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    try {
      setActionLoading(requestId);
      const { data, error } = await supabase.rpc('cancel_friend_request', {
        request_id: requestId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        onError?.('Impossible d\'annuler la demande');
        return;
      }

      await loadFriendsData();
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      onError?.('Impossible d\'annuler la demande');
    } finally {
      setActionLoading(null);
    }
  };

  // Retirer un ami
  const handleRemoveFriend = async (
    friendId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    try {
      setActionLoading(friendId);
      const { data, error } = await supabase.rpc('remove_friend', {
        friend_uuid: friendId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        onError?.('Impossible de retirer cet ami');
        return;
      }

      await loadFriendsData();
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      onError?.('Impossible de retirer cet ami');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'friends' && user) {
      loadFriendsData();
    }
  }, [activeTab, user]);

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
    <PageLayout showHeader={true} refreshing={refreshing} onRefresh={onRefresh}>
      {/* Header */}

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
              { key: 'friends', label: 'Mes amis' },
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

      {/* Contenu des onglets */}
      {activeTab === 'friends' && (
        <View style={styles.tabContent}>
          {/* Recherche d'utilisateurs */}
          <UserSearchBar
            onSendRequest={handleSendRequest}
            currentUserId={user?.id || ''}
            existingFriendIds={friends.map(f => f.friend?.id || '')}
            pendingRequestIds={sentRequests.map(r => r.friend_id)}
          />

          {/* Demandes reçues */}
          {receivedRequests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📬 Demandes reçues</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{receivedRequests.length}</Text>
                </View>
              </View>
              {receivedRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                  loading={actionLoading === request.id}
                />
              ))}
            </View>
          )}

          {/* Demandes envoyées */}
          {sentRequests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📤 Demandes envoyées</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{sentRequests.length}</Text>
                </View>
              </View>
              {sentRequests.map((request) => (
                <SentRequestCard
                  key={request.id}
                  request={request}
                  onCancel={handleCancelRequest}
                  loading={actionLoading === request.id}
                />
              ))}
            </View>
          )}

          {/* Liste d'amis */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👫 Mes amis</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{friends.length}</Text>
              </View>
            </View>
            {loadingFriends ? (
              <ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 20 }} />
            ) : friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Aucun ami pour le moment</Text>
                <Text style={styles.emptyStateSubtext}>Recherchez des utilisateurs ci-dessus</Text>
              </View>
            ) : (
              friends.map((friendship) => (
                <FriendCard
                  key={friendship.id}
                  friend={friendship.friend!}
                  onRemove={handleRemoveFriend}
                  onMessage={() => {
                    // TODO: Implémenter la navigation vers les messages
                    Alert.alert('Info', 'Fonctionnalité de messagerie à venir')
                  }}
                />
              ))
            )}
          </View>
        </View>
      )}

      {activeTab === 'privacy' && (
        <PrivacySettings userId={user?.id || ''} />
      )}

      {activeTab === 'informations' && (
        <View style={styles.tabContent}>
          <Text style={styles.tabContentText}>Contenu de l'onglet Mes infos</Text>
        </View>
      )}

      {activeTab === 'account' && (
        <View style={styles.tabContent}>
          <Text style={styles.tabContentText}>Contenu de l'onglet Mon compte</Text>
        </View>
      )}

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
    </PageLayout>
  )
}

const styles = StyleSheet.create({
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
  tabContent: {
    padding: 16,
  },
  tabContentText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    padding: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});



