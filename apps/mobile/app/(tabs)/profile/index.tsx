'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
  Image
} from 'react-native'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { supabase, logger } from '../../../lib'
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
import { GamePreferencesEditor } from '../../../components/users/GamePreferencesEditor'
import { Modal, useModal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input, Textarea } from '../../../components/ui/Input'
import { LocationAutocomplete } from '../../../components/ui/LocationAutocomplete'
import { useProfileRealtime } from '../../../hooks/useRealtime'
import { useProfileStats, invalidateProfileStatsCache } from '../../../hooks/useProfileStats'
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

type TabType = 'informations' | 'friends' | 'privacy' | 'notifications' | 'security' | 'preferences' | 'preferences_jeu' | 'account' | 'events';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Utiliser le hook avec cache pour les statistiques
  const { 
    stats, 
    loading: loadingStats, 
    refresh: refreshStats,
    invalidate: invalidateStats,
    fromCache: statsFromCache 
  } = useProfileStats(user?.id)
  
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // États pour l'upload d'image de profil
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarConfirmModal = useModal();

  const loadProfile = async () => {
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        router.replace('/login')
        return
      }

      setUser(currentUser)

      // Charger le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Les statistiques sont gérées par le hook useProfileStats avec cache

    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'loadProfile' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Ref pour éviter les logs multiples
  const hasLoggedMount = useRef(false)

  useEffect(() => {
    // Log unique au chargement de la page
    if (!hasLoggedMount.current) {
      logger.pageLoad('ProfilePage')
      hasLoggedMount.current = true
    }
    loadProfile()
  }, [])

  // Écouter les changements en temps réel du profil
  useProfileRealtime(
    user?.id,
    (payload) => {
      // Log uniquement pour les événements importants
      logger.realtimeEvent('profiles', payload.eventType)
      
      // Si c'est une mise à jour du profil actuel, recharger les données
      if (payload.eventType === 'UPDATE' && payload.new) {
        loadProfile()
        
        // Mettre à jour aussi le formulaire d'édition si ouvert
        if (activeTab === 'informations' && payload.new) {
          setEditFormData({
            username: payload.new.username || '',
            full_name: payload.new.full_name || '',
            bio: payload.new.bio || '',
            city: payload.new.city || ''
          })
        }
      }
    },
    true // Activer l'abonnement Realtime
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const onRefresh = () => {
    setRefreshing(true)
    loadProfile()
    // Rafraîchir les statistiques (invalide le cache et recharge)
    refreshStats()
    if (activeTab === 'friends') {
      loadFriendsData()
    }
  }

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
      setShowSuccessMessage(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setActiveTab(null);
    setShowSuccessMessage(false);
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

      return { available: true }
    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'checkUsernameAvailability' })
      return { available: false, error: 'Erreur de connexion' }
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async () => {
    // Réinitialiser les erreurs
    setEditErrors({});

    // Vérifier que l'utilisateur est connecté
    if (!user || !user.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour modifier votre profil')
      logger.error('ProfilePage', 'user ou user.id est undefined', { action: 'handleSaveProfile' })
      return
    }

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
              // Vérifier et rafraîchir la session avant la mise à jour
              const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();
              
              if (sessionError || !currentUser || !currentUser.id) {
                logger.error('ProfilePage', 'Erreur de session', { action: 'handleSaveProfile' })
                Alert.alert('Erreur', 'Votre session a expiré. Veuillez vous reconnecter.')
                router.replace('/login')
                return
              }

              // S'assurer que l'ID utilisateur correspond
              if (currentUser.id !== user.id) {
                logger.warn('ProfilePage', 'ID utilisateur différent')
                setUser(currentUser)
              }

              // Préparer les données à mettre à jour - seulement les champs qui ont changé
              const updateData: Record<string, any> = {};
              
              // Ne mettre à jour que les champs qui ont réellement changé
              const trimmedUsername = editFormData.username.trim() || null;
              const trimmedFullName = editFormData.full_name.trim() || null;
              const trimmedBio = editFormData.bio.trim() || null;
              const trimmedCity = editFormData.city.trim() || null;

              if (trimmedUsername !== (profile?.username || null)) {
                updateData.username = trimmedUsername;
              }
              if (trimmedFullName !== (profile?.full_name || null)) {
                updateData.full_name = trimmedFullName;
              }
              if (trimmedBio !== (profile?.bio || null)) {
                updateData.bio = trimmedBio;
              }
              if (trimmedCity !== (profile?.city || null)) {
                updateData.city = trimmedCity;
              }

              // Si aucun champ n'a changé, ne rien faire
              if (Object.keys(updateData).length === 0) {
                Alert.alert('Information', 'Aucune modification à enregistrer');
                setIsSaving(false);
                return;
              }

              // Effectuer la mise à jour avec .single() pour forcer une erreur si aucune ligne n'est mise à jour
              const { data: updatedData, error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', currentUser.id)
                .select()
                .single();

              if (updateError) {
                logger.error('ProfilePage', updateError as Error, { 
                  action: 'handleSaveProfile',
                  code: updateError.code 
                })

                // Gestion spécifique des erreurs connues
                if (updateError.code === '23505') {
                  // Violation de contrainte unique
                  Alert.alert('Erreur', 'Ce nom d\'utilisateur est déjà utilisé')
                  setEditErrors({ username: 'Ce nom d\'utilisateur est déjà pris' })
                } else if (updateError.code === '42501') {
                  // Permission denied (RLS)
                  Alert.alert(
                    'Erreur de permission',
                    'Vous n\'avez pas la permission de modifier ce profil. Vérifiez vos politiques de sécurité RLS.'
                  )
                } else if (updateError.code === 'PGRST116') {
                  // Aucune ligne trouvée
                  Alert.alert(
                    'Erreur',
                    'Aucun profil trouvé avec cet ID. La mise à jour n\'a pas pu être effectuée.'
                  )
                } else {
                  // Autre erreur
                  const errorMessage = updateError.message || 'Erreur inconnue'
                  Alert.alert(
                    'Erreur de sauvegarde',
                    `Impossible de sauvegarder les modifications.\n\nCode: ${updateError.code || 'N/A'}\nMessage: ${errorMessage}`
                  )
                }
                setIsSaving(false)
                return
              }

              // Vérifier que les données ont été retournées
              if (!updatedData) {
                logger.error('ProfilePage', 'Aucune donnée retournée après la mise à jour', { action: 'handleSaveProfile' })
                Alert.alert(
                  'Erreur',
                  'La mise à jour semble avoir échoué. Aucune donnée n\'a été retournée.'
                )
                setIsSaving(false)
                return
              }

              // Préparer le message de confirmation avec les détails des modifications
              const modifications: string[] = [];
              if (trimmedUsername !== (profile?.username || null)) {
                modifications.push(`Nom d'utilisateur: ${trimmedUsername || 'Non renseigné'}`);
              }
              if (trimmedFullName !== (profile?.full_name || null)) {
                modifications.push(`Nom complet: ${trimmedFullName || 'Non renseigné'}`);
              }
              if (trimmedBio !== (profile?.bio || null)) {
                modifications.push(`Bio: ${trimmedBio ? 'Modifiée' : 'Supprimée'}`);
              }
              if (trimmedCity !== (profile?.city || null)) {
                modifications.push(`Ville: ${trimmedCity || 'Non renseignée'}`);
              }

              const messageDetails = modifications.length > 0
                ? `\n\nModifications enregistrées:\n${modifications.map(m => `• ${m}`).join('\n')}`
                : '';

              // Recharger le profil pour afficher les nouvelles données
              await loadProfile();
              setHasChanges(false);
              
              // Afficher le message de succès dans l'interface
              setShowSuccessMessage(true);
              
              // Fermer la modale après un court délai pour laisser voir le message
              setTimeout(() => {
                setModalOpen(false);
                setActiveTab(null);
              }, 500);
              
              // Masquer le message de succès après 3 secondes
              setTimeout(() => {
                setShowSuccessMessage(false);
              }, 3000);
              
              // Afficher aussi une alerte pour confirmation
              Alert.alert(
                '✅ Modifications enregistrées',
                `Vos informations ont été mises à jour avec succès.${messageDetails}`,
                [{ text: 'Parfait', style: 'default' }]
              );
            } catch (error) {
              logger.error('ProfilePage', error as Error, { action: 'handleSaveProfile' })
              Alert.alert(
                'Erreur',
                `Une erreur inattendue est survenue lors de la sauvegarde.\n\n${error instanceof Error ? error.message : 'Erreur inconnue'}`
              )
            } finally {
              setIsSaving(false)
            }
          }
        }
      ]
    )
  }

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

  // Gérer la sélection de ville depuis LocationAutocomplete
  const handleCityChange = (value: string, district?: string, cityName?: string) => {
    // Si une sélection a été faite depuis la liste (cityName est défini),
    // stocker uniquement le nom de la ville pour la base de données
    // Si c'est une saisie manuelle, stocker la valeur telle quelle
    const cityToStore = cityName || value
    handleFormChange('city', cityToStore)
  }

  /**
   * Demande les permissions et ouvre le sélecteur d'images
   */
  const handleSelectAvatar = async () => {
    try {
      // Demander les permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'accès à la galerie est nécessaire pour modifier votre photo de profil.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Ouvrir le sélecteur d'images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Vérifier la taille du fichier (max 5MB)
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Erreur', 'L\'image doit faire moins de 5MB');
          return;
        }

        // Stocker l'URI et ouvrir la modale de confirmation
        setPendingAvatarUri(asset.uri);
        avatarConfirmModal.open();
      }
    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'handleSelectAvatar' });
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  /**
   * Annule le changement d'avatar
   */
  const handleCancelAvatarChange = () => {
    setPendingAvatarUri(null);
    avatarConfirmModal.close();
  };

  /**
   * Confirme et upload l'avatar vers Supabase
   */
  const handleConfirmAvatarUpload = async () => {
    if (!pendingAvatarUri || !user) return;

    try {
      setIsUploadingAvatar(true);

      // Créer un FormData pour l'upload
      const fileName = `avatars/${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      
      // Fetch l'image et la convertir en blob
      const response = await fetch(pendingAvatarUri);
      const blob = await response.blob();

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Recharger le profil
      await loadProfile();
      
      // Fermer la modale et réinitialiser
      setPendingAvatarUri(null);
      avatarConfirmModal.close();

      Alert.alert('Succès', 'Votre photo de profil a été mise à jour !');
    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'handleConfirmAvatarUpload' });
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo de profil');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getSectionTitle = () => {
    const titles: Record<TabType, string> = {
      informations: '👤 Mes infos',
      friends: '👫 Mes amis',
      privacy: '🔒 Confidentialité',
      notifications: '🔔 Notifications',
      security: '🛡️ Sécurité',
      preferences: '⚙️ Préférences',
      preferences_jeu: '🎯 Préférences de jeu',
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
        logger.error('ProfilePage', organizedError as Error, { action: 'fetchOrganizedEvents' })
        return
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
        logger.error('ProfilePage', participatedError as Error, { action: 'fetchParticipatedEvents' })
        return
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

      setUserEvents(allEvents)
    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'fetchUserEvents' })
    } finally {
      setLoadingEvents(false)
    }
  }

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
      setStats(prev => ({ ...prev, friends: formattedFriends.length }))

    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'loadFriendsData' })
    } finally {
      setLoadingFriends(false)
    }
  }

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

      await loadFriendsData()
      // Invalider le cache des stats car le nombre d'amis peut avoir changé
      if (user?.id) {
        await invalidateProfileStatsCache(user.id)
        refreshStats()
      }
      
      if (result.auto_accepted) {
        onSuccess?.()
      } else {
        onSuccess?.()
      }
    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'sendFriendRequest' })
      onError?.('Impossible d\'envoyer la demande')
    } finally {
      setActionLoading(null)
    }
  }

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

      await loadFriendsData()
      // Invalider le cache des stats car le nombre d'amis a changé
      if (user?.id) {
        await invalidateProfileStatsCache(user.id)
        refreshStats()
      }
      onSuccess?.()
    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'acceptFriendRequest' })
      onError?.('Impossible d\'accepter la demande')
    } finally {
      setActionLoading(null)
    }
  }

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

      await loadFriendsData()
      onSuccess?.()
    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'rejectFriendRequest' })
      onError?.('Impossible de refuser la demande')
    } finally {
      setActionLoading(null)
    }
  }

  // Annuler une demande envoyée

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

      await loadFriendsData()
      onSuccess?.()
    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'cancelFriendRequest' })
      onError?.('Impossible d\'annuler la demande')
    } finally {
      setActionLoading(null)
    }
  }

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

      await loadFriendsData()
      // Invalider le cache des stats car le nombre d'amis a changé
      if (user?.id) {
        await invalidateProfileStatsCache(user.id)
        refreshStats()
      }
      onSuccess?.()
    } catch (error) {
      logger.error('ProfilePage', error as Error, { action: 'removeFriend' })
      onError?.('Impossible de retirer cet ami')
    } finally {
      setActionLoading(null)
    }
  }

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
          <TouchableOpacity 
            style={styles.avatarWrapper}
            onPress={handleSelectAvatar}
            activeOpacity={0.8}
          >
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || '👤'}
                </Text>
              </View>
            )}
            {/* Bouton de modification superposé */}
            <View style={styles.avatarEditButton}>
              <Text style={styles.avatarEditIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Appuyez pour modifier</Text>
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
            { key: 'preferences_jeu', label: 'Préférences de jeu', icon: '🎯' },
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
                  onCloseModal={handleModalClose}
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
                  onCloseModal={handleModalClose}
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
                  onCloseModal={handleModalClose}
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

        {activeTab === 'preferences_jeu' && (
          <GamePreferencesEditor 
            userId={user?.id || ''} 
            onUpdate={loadProfile}
            onClose={handleModalClose}
          />
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

                <LocationAutocomplete
                  label="Ville"
                  value={editFormData.city}
                  onChange={handleCityChange}
                  error={editErrors.city}
                  placeholder="Ex: Le Moufia, Saint-Denis"
                />
              </View>

              {showSuccessMessage && (
                <View style={styles.successMessageContainer}>
                  <Text style={styles.successMessageIcon}>✅</Text>
                  <View style={styles.successMessageContent}>
                    <Text style={styles.successMessageTitle}>Modifications enregistrées</Text>
                    <Text style={styles.successMessageText}>Vos informations ont été mises à jour avec succès.</Text>
                  </View>
                </View>
              )}

              {hasChanges && !showSuccessMessage && (
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

      {/* Modale de confirmation pour le changement de photo de profil */}
      <Modal
        isOpen={avatarConfirmModal.isOpen}
        onClose={handleCancelAvatarChange}
        title="📷 Modifier la photo de profil"
        size="md"
        footer={
          <View style={styles.avatarModalFooter}>
            <Button 
              variant="secondary" 
              onPress={handleCancelAvatarChange}
              disabled={isUploadingAvatar}
              style={styles.avatarModalButton}
            >
              Annuler
            </Button>
            <Button 
              variant="primary"
              onPress={handleConfirmAvatarUpload}
              loading={isUploadingAvatar}
              disabled={isUploadingAvatar}
              style={styles.avatarModalButton}
            >
              {isUploadingAvatar ? 'Enregistrement...' : 'Confirmer'}
            </Button>
          </View>
        }
      >
        <View style={styles.avatarModalContent}>
          <Text style={styles.avatarModalDescription}>
            Êtes-vous sûr de vouloir remplacer votre photo de profil actuelle ?
          </Text>

          {/* Comparaison avant/après */}
          <View style={styles.avatarComparisonContainer}>
            {/* Image actuelle */}
            <View style={styles.avatarComparisonItem}>
              <Text style={styles.avatarComparisonLabel}>Photo actuelle</Text>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatarComparisonImageOld}
                />
              ) : (
                <View style={styles.avatarComparisonPlaceholder}>
                  <Text style={styles.avatarComparisonPlaceholderText}>
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || '👤'}
                  </Text>
                </View>
              )}
            </View>

            {/* Flèche */}
            <View style={styles.avatarComparisonArrow}>
              <Text style={styles.avatarComparisonArrowIcon}>→</Text>
            </View>

            {/* Nouvelle image */}
            <View style={styles.avatarComparisonItem}>
              <Text style={styles.avatarComparisonLabelNew}>Nouvelle photo</Text>
              {pendingAvatarUri ? (
                <View style={styles.avatarComparisonNewWrapper}>
                  <Image
                    source={{ uri: pendingAvatarUri }}
                    style={styles.avatarComparisonImageNew}
                  />
                  <View style={styles.avatarComparisonCheckmark}>
                    <Text style={styles.avatarComparisonCheckmarkIcon}>✓</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.avatarComparisonPlaceholder}>
                  <ActivityIndicator size="small" color={MachiColors.primary} />
                </View>
              )}
            </View>
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    paddingHorizontal: 16,
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
  successMessageContainer: {
    flexDirection: 'row',
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  successMessageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  successMessageContent: {
    flex: 1,
  },
  successMessageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 4,
  },
  successMessageText: {
    fontSize: 14,
    color: '#047857',
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
  // Styles pour l'upload d'avatar
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: MachiColors.primary,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: MachiColors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: MachiColors.textSecondary,
    fontStyle: 'italic',
  },
  // Styles pour la modale de confirmation d'avatar
  avatarModalContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarModalDescription: {
    fontSize: 14,
    color: MachiColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  avatarComparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  avatarComparisonItem: {
    alignItems: 'center',
  },
  avatarComparisonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: MachiColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  avatarComparisonLabelNew: {
    fontSize: 11,
    fontWeight: '600',
    color: MachiColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  avatarComparisonImageOld: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    opacity: 0.6,
  },
  avatarComparisonPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    opacity: 0.6,
  },
  avatarComparisonPlaceholderText: {
    fontSize: 28,
    color: MachiColors.textSecondary,
  },
  avatarComparisonArrow: {
    paddingHorizontal: 8,
  },
  avatarComparisonArrowIcon: {
    fontSize: 24,
    color: MachiColors.primary,
    fontWeight: 'bold',
  },
  avatarComparisonNewWrapper: {
    position: 'relative',
  },
  avatarComparisonImageNew: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: MachiColors.primary,
  },
  avatarComparisonCheckmark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: MachiColors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarComparisonCheckmarkIcon: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  avatarModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarModalButton: {
    flex: 1,
  },
});




