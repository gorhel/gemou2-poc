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
import { PrivacySettings } from '../../../components/profile/PrivacySettings'
import { NotificationsSettings } from '../../../components/profile/NotificationsSettings'
import { SecuritySettings } from '../../../components/profile/SecuritySettings'
import { PreferencesSettings } from '../../../components/profile/PreferencesSettings'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input, Textarea } from '../../../components/ui/Input'
import MachiColors from '../../../theme/colors'

interface UserEvent {
  id: string
  title: string
  description: string | null
  date_time: string
  location: string
  status?: string
  role: 'organizer' | 'participant'
}

type TabType = 'informations' | 'friends' | 'privacy' | 'notifications' | 'security' | 'preferences' | 'account' | 'events';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  // États pour les événements
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // États pour l'édition des informations
  const [editFormData, setEditFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    city: ''
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  const handleSectionClick = (section: TabType) => {
    setActiveTab(section);
    setModalOpen(true);
    if (section === 'friends') {
      loadFriendsData();
    }
    if (section === 'events') {
      fetchUserEvents();
    }
    if (section === 'informations' && profile) {
      // Initialiser les données du formulaire avec les valeurs actuelles
      setEditFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        city: profile.city || ''
      });
      setEditErrors({});
      setHasChanges(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setActiveTab(null);
  };

  const handleValidate = async () => {
    if (activeTab === 'informations') {
      await handleSaveProfile();
    } else {
      // Action de validation - peut être personnalisée selon la section
      setModalOpen(false);
      setActiveTab(null);
    }
  };

  // Vérifier l'unicité du username
  const checkUsernameAvailability = async (username: string, currentUsername?: string) => {
    // Si le username n'a pas changé, pas besoin de vérifier
    if (username === currentUsername) {
      return { available: true };
    }

    if (username.length < 3) {
      return { available: false, error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' };
    }

    // Validation du format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { available: false, error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores' };
    }

    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return { available: false, error: 'Erreur lors de la vérification' };
      }

      if (data) {
        return { available: false, error: 'Ce nom d\'utilisateur est déjà pris' };
      }

      return { available: true };
    } catch (error) {
      console.error('Erreur lors de la vérification du username:', error);
      return { available: false, error: 'Erreur de connexion' };
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async () => {
    // Réinitialiser les erreurs
    setEditErrors({});

    // Validation
    const errors: Record<string, string> = {};

    if (!editFormData.username || editFormData.username.trim().length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

    if (errors.username) {
      setEditErrors(errors);
      return;
    }

    // Vérifier l'unicité du username si il a changé
    if (editFormData.username !== profile?.username) {
      const usernameCheck = await checkUsernameAvailability(editFormData.username, profile?.username);
      if (!usernameCheck.available) {
        setEditErrors({ username: usernameCheck.error || 'Ce nom d\'utilisateur est déjà pris' });
        return;
      }
    }

    // Afficher l'alerte de confirmation
    Alert.alert(
      'Confirmer la modification',
      'Êtes-vous sûr de vouloir enregistrer ces modifications ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Confirmer',
          onPress: async () => {
            setIsSaving(true);
            try {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  username: editFormData.username.trim() || null,
                  full_name: editFormData.full_name.trim() || null,
                  bio: editFormData.bio.trim() || null,
                  city: editFormData.city.trim() || null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', user?.id);

              if (updateError) {
                if (updateError.code === '23505') { // Violation de contrainte unique
                  Alert.alert('Erreur', 'Ce nom d\'utilisateur est déjà utilisé');
                  setEditErrors({ username: 'Ce nom d\'utilisateur est déjà pris' });
                } else {
                  Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
                  console.error('Erreur lors de la mise à jour:', updateError);
                }
                return;
              }

              // Recharger le profil pour afficher les nouvelles données
              await loadProfile();
              setHasChanges(false);
              setModalOpen(false);
              setActiveTab(null);
              Alert.alert('Succès', 'Vos informations ont été mises à jour');
            } catch (error) {
              console.error('Erreur lors de la sauvegarde:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  // Gérer les changements dans le formulaire
  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    setEditErrors(prev => ({ ...prev, [field]: '' }));
    
    // Vérifier si des changements ont été apportés
    const originalData = {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      city: profile?.city || ''
    };
    
    const newData = { ...editFormData, [field]: value };
    const changed = 
      newData.username !== originalData.username ||
      newData.full_name !== originalData.full_name ||
      newData.bio !== originalData.bio ||
      newData.city !== originalData.city;
    
    setHasChanges(changed);
  };

  const getSectionTitle = () => {
    const titles: Record<TabType, string> = {
      informations: '👤 Mes infos',
      friends: '👫 Mes amis',
      privacy: '🔒 Confidentialité',
      notifications: '🔔 Notifications',
      security: '🛡️ Sécurité',
      preferences: '⚙️ Préférences',
      account: '💼 Mon compte',
      events: '📅 Mes événements'
    };
    return activeTab ? titles[activeTab] : '';
  };

  // Fonction pour récupérer les événements de l'utilisateur
  const fetchUserEvents = async () => {
    if (!user) return;
    
    setLoadingEvents(true);
    try {
      // Récupérer les événements organisés
      const { data: organizedEvents, error: organizedError } = await supabase
        .from('events')
        .select('id, title, description, date_time, location')
        .eq('creator_id', user.id)
        .order('date_time', { ascending: false });

      if (organizedError) {
        console.error('Error fetching organized events:', organizedError);
        return;
      }

      // Récupérer les événements participés
      const { data: participatedEvents, error: participatedError } = await supabase
        .from('event_participants')
        .select(`
          id,
          events!inner(id, title, description, date_time, location)
        `)
        .eq('user_id', user.id)
        .eq('status', 'registered')
        .order('joined_at', { ascending: false });

      if (participatedError) {
        console.error('Error fetching participated events:', participatedError);
        return;
      }

      // Combiner et formater les événements
      const organizedFormatted: UserEvent[] = organizedEvents?.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date_time: event.date_time,
        location: event.location,
        status: 'active',
        role: 'organizer' as const
      })) || [];

      const participatedFormatted: UserEvent[] = participatedEvents?.map(participant => ({
        id: (participant as any).events.id,
        title: (participant as any).events.title,
        description: (participant as any).events.description,
        date_time: (participant as any).events.date_time,
        location: (participant as any).events.location,
        status: 'registered',
        role: 'participant' as const
      })) || [];

      // Fusionner et trier par date
      const allEvents = [...organizedFormatted, ...participatedFormatted]
        .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());

      setUserEvents(allEvents);
    } catch (error) {
      console.error('Error fetching user events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <ActivityIndicator size="large" color={MachiColors.primary} />
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

      {/* Liste des sections */}
      <View style={styles.sectionsListContainer}>
        <ScrollView 
          horizontal={false} 
          showsVerticalScrollIndicator={false}
          style={styles.sectionsListScroll}
        >
          {[
            { key: 'informations', label: 'Mes infos', icon: '👤' },
            { key: 'friends', label: 'Mes amis', icon: '👫' },
            { key: 'events', label: 'Mes événements', icon: '📅' },
            { key: 'privacy', label: 'Confidentialité', icon: '🔒' },
            { key: 'notifications', label: 'Notifications', icon: '🔔' },
            { key: 'security', label: 'Sécurité', icon: '🛡️' },
            { key: 'preferences', label: 'Préférences', icon: '⚙️' },
            { key: 'account', label: 'Mon compte', icon: '💼' }
          ].map((section) => (
              <TouchableOpacity
                key={section.key}
                style={[
                  styles.actionButton,
                  activeTab === section.key && styles.activeSectionItem
                ]}
                onPress={() => handleSectionClick(section.key as TabType)}
              >
              <Text style={styles.actionButtonEmoji}>{section.icon}</Text>
              <Text style={[
                styles.actionButtonText,
                activeTab === section.key && styles.activeSectionText
              ]}>
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Modale pour le contenu des sections */}
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title={getSectionTitle()}
        size="lg"
        contentPadding={0}
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 2, padding: 6 }}>
            <Button
              variant="secondary"
              onPress={handleModalClose}
              style={{ flex: 1 }}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onPress={handleValidate}
              style={{ flex: 1 }}
              disabled={isSaving || (activeTab === 'informations' && !hasChanges)}
            >
              {isSaving ? 'Enregistrement...' : 'Valider'}
            </Button>
          </View>
        }
      >
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
              <ActivityIndicator size="small" color={MachiColors.primary} style={{ marginVertical: 20 }} />
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
          <PrivacySettings userId={user?.id || ''} onUpdate={loadProfile} />
        )}

        {activeTab === 'notifications' && (
          <NotificationsSettings userId={user?.id || ''} onUpdate={loadProfile} />
        )}

        {activeTab === 'security' && (
          <SecuritySettings userId={user?.id || ''} onUpdate={loadProfile} />
        )}

        {activeTab === 'preferences' && (
          <PreferencesSettings userId={user?.id || ''} onUpdate={loadProfile} />
        )}

        {activeTab === 'informations' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              
              <View style={styles.formContainer}>
                <Text style={styles.label}>Nom d'utilisateur</Text>
                <Input
                  style={styles.formContainerInput}
                  value={editFormData.username}
                  onChangeText={(value) => handleFormChange('username', value)}
                  placeholder="Entrez votre nom d'utilisateur"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={editErrors.username}
                  fullWidth
                  editable={!isSaving && !isCheckingUsername}
                  helperText={isCheckingUsername ? 'Vérification...' : '3 caractères minimum, lettres, chiffres, tirets et underscores uniquement'}
                />

                <Text style={styles.label}>Nom complet</Text>
                <Input
                  style={styles.formContainerInput}
                  value={editFormData.full_name}
                  onChangeText={(value) => handleFormChange('full_name', value)}
                  placeholder="Entrez votre nom complet"
                  autoCapitalize="words"
                  error={editErrors.full_name}
                  fullWidth
                  editable={!isSaving}
                />

                <Text style={styles.label}>Bio</Text>
                <Textarea
                  style={styles.formContainerInputTextarea}
                  value={editFormData.bio}
                  onChangeText={(value) => handleFormChange('bio', value)}
                  placeholder="Décrivez-vous en quelques mots..."
                  rows={4}
                  fullWidth
                  editable={!isSaving}
                />

                <Text style={styles.label}>Ville</Text>
                <Input
                  style={styles.formContainerInput}
                  value={editFormData.city}
                  onChangeText={(value) => handleFormChange('city', value)}
                  placeholder="Entrez votre ville"
                  autoCapitalize="words"
                  error={editErrors.city}
                  fullWidth
                  editable={!isSaving}
                />
              </View>

              {hasChanges && (
                <Text style={styles.helperText}>
                  💡 Des modifications ont été apportées. Cliquez sur "Valider" pour les enregistrer.
                </Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'account' && (
          <View style={styles.tabContent}>
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email :</Text>
              <Text style={styles.infoValue}>{user?.email || 'Non défini'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membre depuis :</Text>
              <Text style={styles.infoValue}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Non disponible'}
              </Text>
            </View>
            </View>
          </View>
        )}

        {activeTab === 'events' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              {loadingEvents ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="small" color={MachiColors.primary} style={{ marginVertical: 20 }} />
                  <Text style={styles.emptyStateText}>Chargement des événements...</Text>
                </View>
              ) : userEvents.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateEmoji}>📅</Text>
                  <Text style={styles.emptyStateText}>Aucun événement participé</Text>
                  <Text style={styles.emptyStateSubtext}>Vous n'avez pas encore participé à d'événements</Text>
                </View>
              ) : (
                <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
                  {userEvents.map((event, index) => (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.eventCard}
                      onPress={() => router.push(`/(tabs)/events/${event.id}`)}
                    >
                      <View style={styles.eventTimeline}>
                        <View style={styles.eventTimelineDot}>
                          <Text style={styles.eventTimelineIcon}>📅</Text>
                        </View>
                        {index < userEvents.length - 1 && (
                          <View style={styles.eventTimelineLine} />
                        )}
                      </View>
                      <View style={styles.eventContent}>
                        <View style={styles.eventHeader}>
                          <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                          <View style={[
                            styles.eventBadge,
                            event.role === 'organizer' ? styles.eventBadgeOrganizer : styles.eventBadgeParticipant
                          ]}>
                            <Text style={[
                              styles.eventBadgeText,
                              event.role === 'organizer' ? styles.eventBadgeTextOrganizer : styles.eventBadgeTextParticipant
                            ]}>
                              {event.role === 'organizer' ? 'Organisateur' : 'Participant'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.eventDate}>
                          {formatDate(event.date_time)} • {event.location}
                        </Text>
                        {event.description && (
                          <Text style={styles.eventDescription} numberOfLines={2}>
                            {event.description}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        )}
      </Modal>

      {/* Actions */}
      <View style={styles.actionsContainer}>
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
    backgroundColor: MachiColors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: MachiColors.textSecondary,
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: Platform.select({ ios: 80, android: 40, web: 40 }),
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: MachiColors.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MachiColors.primary,
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
    color: MachiColors.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: MachiColors.textSecondary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: MachiColors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: MachiColors.textSecondary,
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
    color: MachiColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: MachiColors.textSecondary,
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
    color: MachiColors.text,
  },
  signOutButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  signOutText: {
    color: '#dc2626',
  },
  sectionsListContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: MachiColors.border,
    paddingVertical: 8,
  },
  sectionsListScroll: {
    paddingHorizontal: 16,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  activeSectionItem: {
    backgroundColor: MachiColors.neutral,
    borderLeftWidth: 4,
    borderLeftColor: MachiColors.primary,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionText: {
    fontSize: 15,
    color: MachiColors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  activeSectionText: {
    color: MachiColors.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: 0,
  },
  tabContentText: {
    fontSize: 16,
    color: MachiColors.textSecondary,
    textAlign: 'center',
    padding: 4,
  },
  section: {
    backgroundColor: 'blac',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MachiColors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: MachiColors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
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
    paddingLeft: 16,

  },
  badge: {
    backgroundColor: MachiColors.primary,
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
    padding: 16,
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
  formContainer: {
    gap: 6,
    padding: 16,
  },
    formContainerInput: {
    fontSize: 16,
    color: '#9ca3af',
    height:56,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    placeholderTextColor: 'red',
    },
    formContainerInputTextarea: {
    fontSize: 16,
    color: '#9ca3af',
    height:150,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    placeholderTextColor: 'red',
    },
    label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop:20
  },
  eventsList: {
    maxHeight: 500,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTimeline: {
    alignItems: 'center',
    marginRight: 12,
  },
  eventTimelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTimelineIcon: {
    fontSize: 16,
  },
  eventTimelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginTop: 8,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MachiColors.text,
    flex: 1,
    marginRight: 8,
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventBadgeOrganizer: {
    backgroundColor: '#f3e8ff',
  },
  eventBadgeParticipant: {
    backgroundColor: '#d1fae5',
  },
  eventBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventBadgeTextOrganizer: {
    color: '#7c3aed',
  },
  eventBadgeTextParticipant: {
    color: '#059669',
  },
  eventDate: {
    fontSize: 14,
    color: MachiColors.textSecondary,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
});



