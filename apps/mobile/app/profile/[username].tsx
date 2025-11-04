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
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib';
import { ConfirmationModal, ModalVariant } from '../../components/ui';

export default function PublicProfilePage() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    eventsCreated: 0,
    eventsParticipated: 0,
    gamesOwned: 0
  });
  
  // États pour la gestion des amis
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted' | 'loading'>('none');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    variant: ModalVariant;
    title: string;
    message: string;
  }>({
    variant: 'success',
    title: '',
    message: ''
  });

  const loadFriendshipStatus = async (userId: string, profileId: string) => {
    try {
      setFriendshipStatus('loading');
      
      const { data, error } = await supabase
        .from('friends')
        .select('id, friendship_status')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .or(`user_id.eq.${profileId},friend_id.eq.${profileId}`)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFriendshipId(data.id);
        setFriendshipStatus(data.friendship_status as 'pending' | 'accepted');
      } else {
        setFriendshipStatus('none');
      }
    } catch (error) {
      console.error('Error loading friendship status:', error);
      setFriendshipStatus('none');
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Charger le statut d'amitié si ce n'est pas son propre profil
      if (user && user.id !== profileData.id) {
        await loadFriendshipStatus(user.id, profileData.id);
      }

      // Charger les stats
      const [eventsCreated, eventsParticipated, gamesOwned] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('creator_id', profileData.id),
        supabase.from('event_participants').select('id', { count: 'exact', head: true }).eq('user_id', profileData.id),
        supabase.from('user_games').select('id', { count: 'exact', head: true }).eq('user_id', profileData.id)
      ]);

      setStats({
        eventsCreated: eventsCreated.count || 0,
        eventsParticipated: eventsParticipated.count || 0,
        gamesOwned: gamesOwned.count || 0
      });

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user || !profile) return;

    try {
      setActionLoading(true);
      
      const { data, error } = await supabase.rpc('send_friend_request', {
        friend_uuid: profile.id
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
        
        setModalConfig({
          variant: 'error',
          title: 'Erreur',
          message
        });
        setModalVisible(true);
        return;
      }

      // Recharger le statut d'amitié
      await loadFriendshipStatus(user.id, profile.id);
      
      setModalConfig({
        variant: 'success',
        title: result.auto_accepted ? 'Vous êtes amis !' : 'Demande envoyée',
        message: result.auto_accepted 
          ? `Vous et ${profile.full_name || profile.username} êtes maintenant amis`
          : `Demande d'ami envoyée à ${profile.full_name || profile.username}`
      });
      setModalVisible(true);
      
    } catch (error) {
      console.error('Error sending friend request:', error);
      setModalConfig({
        variant: 'error',
        title: 'Erreur',
        message: 'Impossible d\'envoyer la demande'
      });
      setModalVisible(true);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

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
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Profil introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwnProfile = user?.id === profile.id;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.full_name?.charAt(0) || profile.username?.charAt(0) || '👤'}
          </Text>
        </View>

        <Text style={styles.fullName}>{profile.full_name || 'Utilisateur'}</Text>
        <Text style={styles.username}>@{profile.username}</Text>

        {profile.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}

        {profile.city && (
          <Text style={styles.location}>📍 {profile.city}</Text>
        )}

        {isOwnProfile && (
          <View style={styles.ownProfileBadge}>
            <Text style={styles.ownProfileText}>C'est vous !</Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.eventsCreated}</Text>
          <Text style={styles.statLabel}>Événements</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.eventsParticipated}</Text>
          <Text style={styles.statLabel}>Participations</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.gamesOwned}</Text>
          <Text style={styles.statLabel}>Jeux</Text>
        </View>
      </View>

      {!isOwnProfile && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>💬 Envoyer un message</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButtonSecondary,
              friendshipStatus === 'accepted' && styles.actionButtonFriend,
              friendshipStatus === 'pending' && styles.actionButtonPending,
              (actionLoading || friendshipStatus === 'loading') && styles.actionButtonDisabled
            ]}
            onPress={handleSendFriendRequest}
            disabled={friendshipStatus !== 'none' || actionLoading}
          >
            {(actionLoading || friendshipStatus === 'loading') ? (
              <ActivityIndicator size="small" color="#6b7280" />
            ) : (
              <Text style={[
                styles.actionButtonSecondaryText,
                friendshipStatus === 'accepted' && styles.actionButtonFriendText,
                friendshipStatus === 'pending' && styles.actionButtonPendingText
              ]}>
                {friendshipStatus === 'none' && '👥 Ajouter en ami'}
                {friendshipStatus === 'pending' && '⏳ Demande en attente'}
                {friendshipStatus === 'accepted' && '✅ Amis'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <ConfirmationModal
        visible={modalVisible}
        variant={modalConfig.variant}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: Platform.select({ ios: 60, android: 16, web: 16 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    marginTop: 8,
  },
  ownProfileBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  ownProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
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
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonFriend: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  actionButtonFriendText: {
    color: '#059669',
  },
  actionButtonPending: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  actionButtonPendingText: {
    color: '#d97706',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
});

