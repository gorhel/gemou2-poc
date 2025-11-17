'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '../../../lib'
import { createEventConversation, notifyConversationCreated } from '@gemou2/database'
import { PageLayout } from '../../../components/layout'
import { ConfirmationModal, ModalVariant, ConfirmModal, SuccessModal } from '../../../components/ui'
import EventTags from '../../../components/events/EventTags'

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
  image_url: string;
}

interface GameDataTag {
  id: string;
  name: string;
  source: 'type' | 'mechanism';
  gameId: string;
}

interface GameWithData {
  id: string;
  bgg_id: string | null;
  name: string;
  data: any;
}

export default function EventDetailsPage() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [event, setEvent] = useState<Event | null>(null);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false)
  const [eventTags, setEventTags] = useState<any[]>([])
  const [eventGames, setEventGames] = useState<any[]>([])
  const [gameTags, setGameTags] = useState<any[]>([])
  const [modalConfig, setModalConfig] = useState<{
    variant: ModalVariant
    title: string
    message: string
  }>({
    variant: 'success',
    title: '',
    message: ''
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  const navigateToProfile = useCallback((username?: string) => {
    if (!username) {
      return
    }

    router.push(`/profile/${username}`)
  }, [])

  const loadEvent = async () => {
    try {
      if (!id) {
        console.error('❌ ID d\'événement manquant')
        router.back()
        return
      }

      // Charger l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUser(user);

      // Charger l'événement
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Charger le créateur
      const { data: creatorData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', eventData.creator_id)
        .single();

      setCreator(creatorData);

      // Vérifier si l'utilisateur participe (exclure les participants avec le statut 'cancelled')
      const { data: participationData } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .single();

      setIsParticipating(!!participationData);

      // Charger les participants (exclure les participants avec le statut 'cancelled')
      const { data: participantsData } = await supabase
        .from('event_participants')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('event_id', id)
        .neq('status', 'cancelled');

      setParticipants(participantsData || []);

      // Charger les tags de l'événement
      console.log('🔍 Chargement des tags de l\'événement:', id);
      const { data: tagsData, error: tagsError } = await supabase
        .from('event_tags')
        .select(`
          tag_id,
          tags (
            id,
            name
          )
        `)
        .eq('event_id', id);

      console.log('🏷️ Tags de l\'événement récupérés:', { tagsData, tagsError, count: tagsData?.length || 0 });
      console.log('🏷️ Détails des tags bruts:', JSON.stringify(tagsData, null, 2));

      if (tagsError) {
        console.error('❌ Erreur lors du chargement des tags:', tagsError);
        setEventTags([]);
      } else if (tagsData && tagsData.length > 0) {
        const tagsList = tagsData
          .filter((et: any) => et.tags && et.tags.name)
          .map((et: any) => ({
            id: et.tag_id,
            tag_id: et.tag_id,
            name: et.tags.name,
            tags: et.tags
          }));
        console.log('✅ Tags de l\'événement formatés:', tagsList.length, tagsList);
        setEventTags(tagsList);
        
        // Si des tags ont été filtrés, les logger
        const filteredOut = tagsData.filter((et: any) => !et.tags || !et.tags.name);
        if (filteredOut.length > 0) {
          console.warn('⚠️ Tags filtrés (sans relation tags):', filteredOut);
        }
      } else {
        console.warn('⚠️ Aucun tag trouvé pour cet événement (tagsData est vide ou null)');
        setEventTags([]);
      }

      // Charger les jeux de l'événement
      console.log('🔍 Chargement des jeux pour l\'événement:', id)
      const { data: gamesData, error: gamesError } = await supabase
        .from('event_games')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: true });

      console.log('📦 Résultat chargement jeux:', { gamesData, gamesError, count: gamesData?.length || 0 })

      if (gamesError) {
        console.error('❌ Erreur lors du chargement des jeux:', gamesError)
        setEventGames([])
      } else {
        setEventGames(gamesData || [])
        console.log('✅ Jeux chargés avec succès:', gamesData?.length || 0, 'jeu(x)')
        
                // Récupérer les tags des jeux
        if (gamesData && gamesData.length > 0) {
          console.log('🔍 Récupération des tags pour', gamesData.length, 'jeu(x)');
          const gameBggIds = gamesData
            .map(g => g.game_id)
            .filter((id): id is string => !!id);
          
          console.log('🎮 BGG IDs des jeux:', gameBggIds);
          
          if (gameBggIds.length > 0) {
            const { data: gamesInDb, error: gamesInDbError } = await supabase
              .from('games')
              .select('id, bgg_id, name, data')
              .in('bgg_id', gameBggIds);
            
            console.log('🎯 Jeux trouvés dans la table games:', { gamesInDb, gamesInDbError, count: gamesInDb?.length || 0 });
            
            if (!gamesInDbError && gamesInDb && gamesInDb.length > 0) {
              const missingGames = gamesData.filter(eg => 
                !gamesInDb.some(g => g.bgg_id === eg.game_id)
              );
              
              console.log('🔍 Jeux non trouvés par bgg_id:', missingGames.length);
              
              if (missingGames.length > 0) {
                const missingGameNames = missingGames.map(eg => eg.game_name);
                const { data: gamesByName, error: gamesByNameError } = await supabase
                  .from('games')
                  .select('id, bgg_id, name, data')
                  .in('name', missingGameNames);
                
                console.log('📝 Jeux trouvés par nom:', { gamesByName, gamesByNameError, count: gamesByName?.length || 0 });
                
                if (!gamesByNameError && gamesByName) {
                  gamesInDb.push(...gamesByName);
                }
              }
              
                            // Extraire les tags depuis la colonne data JSONB
              console.log('🆔 Extraction des tags depuis data JSONB pour', gamesInDb.length, 'jeu(x)');
              
              const extractedTags = extractGameTagsFromData(gamesInDb as GameWithData[]);
              console.log('✅ Tags extraits depuis data:', extractedTags.length, extractedTags);
              
              // Transformer en format compatible avec l'affichage existant
              const formattedTags = extractedTags.map(tag => ({
                id: tag.id,
                tag_id: tag.id,
                name: tag.name,
                source: tag.source,
                gameId: tag.gameId
              }));
              
              setGameTags(formattedTags);
            } else {
              console.warn('⚠️ Aucun jeu trouvé dans la table games pour cet événement:', gamesInDbError);
              setGameTags([]);
            }
          } else {
            console.warn('⚠️ Aucun game_id (bgg_id) trouvé dans les jeux de l\'événement');
            setGameTags([]);
          }
        } else {
          console.warn('⚠️ Aucun jeu trouvé pour cet événement');
          setGameTags([]);
        }
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const handleParticipate = async () => {
    if (!user || !event) return;

    // Si l'utilisateur est le créateur, rediriger vers la page d'édition
    if (isCreator) {
      router.push({
        pathname: '/(tabs)/create-event',
        params: { eventId: event.id }
      });
      return;
    }

    setIsLoadingAction(true);
    try {
      if (!isParticipating) {
        const currentParticipantsCount = event.current_participants || 0
        if (currentParticipantsCount >= event.max_participants) {
          setModalConfig({
            variant: 'warning',
            title: 'Quota atteint',
            message: 'Le nombre maximum de participants est déjà atteint pour cet événement'
          })
          setModalVisible(true)
          return
        }
      }

      const { error } = await supabase.rpc('update_event_participation', {
        p_event_id: event.id,
        p_join: !isParticipating
      })

      if (error) {
        const message = error.message || 'Une erreur est survenue'
        const isQuotaReached = message.toLowerCase().includes('quota')
        setModalConfig({
          variant: isQuotaReached ? 'warning' : 'error',
          title: isQuotaReached ? 'Quota atteint' : 'Erreur',
          message
        })
        setModalVisible(true)
        return
      }

      setModalConfig({
        variant: isParticipating ? 'info' : 'success',
        title: isParticipating ? 'Participation annulée' : 'Inscription confirmée !',
        message: isParticipating
          ? 'Vous ne participez plus à cet événement'
          : 'Vous participez maintenant à cet événement !'
      })
      setModalVisible(true)
      setIsParticipating(!isParticipating)

      await loadEvent()
    } catch (error: any) {
      const message = error.message || 'Une erreur est survenue';
      setModalConfig({
        variant: 'error',
        title: 'Erreur',
        message
      })
      setModalVisible(true)
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleContactParticipants = async () => {
    if (!event || !user || isCreatingConversation) return

    setIsCreatingConversation(true)
    try {
      // Créer ou récupérer la conversation
      const { conversationId, error: convError } = await createEventConversation(supabase, event.id, user.id)
      
      if (convError) {
        console.error('Error creating conversation:', convError)
        setModalConfig({
          variant: 'error',
          title: 'Erreur',
          message: 'Impossible de créer la conversation'
        })
        setModalVisible(true)
        return
      }

      // Récupérer les participants pour les notifier (exclure le créateur)
      const participantIds = participants
        .filter(p => p.user_id !== user.id)
        .map(p => p.user_id)

      // Envoyer les notifications
      if (participantIds.length > 0) {
        await notifyConversationCreated(supabase, participantIds, event.id, event.title)
      }

      // Rediriger vers la conversation
      router.push(`/conversations/${conversationId}`)
    } catch (error) {
      console.error('Error:', error)
      setModalConfig({
        variant: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue'
      })
      setModalVisible(true)
    } finally {
      setIsCreatingConversation(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!event || !user) return;

    setIsDeleting(true);

    try {
      // Appeler la fonction de soft delete
      const { error } = await supabase.rpc('soft_delete_event', {
        event_id: event.id
      });

      if (error) {
        console.error('Error deleting event:', error);
        setModalConfig({
          variant: 'error',
          title: 'Erreur',
          message: 'Impossible de supprimer l\'événement'
        })
        setModalVisible(true)
        return;
      }

      // Fermer la modale de confirmation et afficher la modale de succès
      setShowConfirmDelete(false);
      setShowSuccess(true);

      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/(tabs)/events');
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      setModalConfig({
        variant: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue'
      })
      setModalVisible(true)
    } finally {
      setIsDeleting(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvent();
  };

  const formatDate = (dateTime: string) => {
    if (!dateTime) return 'Date non définie';
    
    const d = new Date(dateTime);
    
    // Vérifier si la date est valide
    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }
    
    const dayOfWeek = d.toLocaleString('fr-FR', { weekday: 'long' });
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('fr-FR', { month: 'long' });
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${dayOfWeek} ${day} ${month}, ${hours}:${minutes}`;
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Événement introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function extractGameTagsFromData(games: GameWithData[]): GameDataTag[] {
  const tags: GameDataTag[] = []
  const seenTags = new Set<string>()

  for (const game of games) {
    if (!game.data || typeof game.data !== 'object') {
      continue
    }

    // Extraire le type (string)
    if (game.data.type && typeof game.data.type === 'string') {
      const typeKey = `type-${game.data.type.toLowerCase()}`
      if (!seenTags.has(typeKey)) {
        tags.push({
          id: `type-${game.id}-${game.data.type}`,
          name: game.data.type,
          source: 'type',
          gameId: game.id
        })
        seenTags.add(typeKey)
      }
    }

    // Extraire les mécaniques (array)
    if (Array.isArray(game.data.mechanisms)) {
      for (const mechanism of game.data.mechanisms) {
        if (typeof mechanism === 'string') {
          const mechanismKey = `mechanism-${mechanism.toLowerCase()}`
          if (!seenTags.has(mechanismKey)) {
            tags.push({
              id: `mechanism-${game.id}-${mechanism}`,
              name: mechanism,
              source: 'mechanism',
              gameId: game.id
            })
            seenTags.add(mechanismKey)
          }
        }
      }
    }
  }

  return tags
}
  

  const isCreator = user?.id === event.creator_id;
  const isFull = (event.current_participants || 0) >= event.max_participants;
  
  // Debug: vérifier les tags
  console.log('🔍 Debug tags - eventTags:', eventTags.length, eventTags);
  console.log('🔍 Debug tags - gameTags:', gameTags.length, gameTags);

  // Actions du header pour le créateur
  const headerActions = isCreator ? [
    {
      icon: '✏️',
      onPress: () => {
        router.push({
          pathname: '/(tabs)/create-event',
          params: { eventId: event.id }
        });
      }
    },
    {
      icon: '🗑️',
      onPress: () => setShowConfirmDelete(true)
    }
  ] : undefined;

  return (
    <PageLayout 
      showHeader={true} 
      refreshing={refreshing} 
      onRefresh={onRefresh}
      overrideRightActions={headerActions}
    >
      {/* Header avec bouton retour */}

      {/* Event Details */}
      <View style={styles.content}>

      <View style={styles.eventImageContainer}>
          {event.image_url ? (
            <Image
              source={{ uri: event.image_url }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          ) : (
            <Image source={require('../../../assets/img/eventImagePlaceholder.png')} style={styles.eventImage} />
          )}
        </View>


        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.metaContainer}>
        {creator && (
            <View style={styles.metaItem}>
              <View style={styles.organizerContainer}>
                <View style={styles.organizerAvatar}>
                  {creator.avatar_url ? (
                    <Image
                      source={{ uri: creator.avatar_url }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View 
                      style={[
                        styles.avatarFallback,
                        { backgroundColor: `hsl(${creator.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }
                      ]}
                    >
                      <Text style={styles.avatarInitials}>
                        {getInitials(creator.full_name || creator.username)}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.metaText}>
                  <Text style={{ fontWeight: '700' }}>Hôte</Text>
                  {'\n'}
                  Organisé par {isCreator ? 'vous' : creator.full_name || creator.username}
                </Text>
              </View>
            </View>
          )}


          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>📍</Text>
            <Text style={styles.metaText}>
              <Text style={{ fontWeight: '700' }}>Lieu de l'événement</Text>
              {'\n'}
              {event.location}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>📅</Text>
            <Text style={styles.metaText}>
              <Text style={{ fontWeight: '700' }}>Horaire</Text>
              {'\n'}
              {formatDate(event.date_time)}
            </Text>
          </View>


          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>👥</Text>
            <Text style={styles.metaText}>
              <Text style={{ fontWeight: '700' }}>Capacité</Text>
              {'\n'}
              {event.current_participants || 0}/{event.max_participants} participants
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>💰​​</Text>
            <Text style={styles.metaText}>
              <Text style={{ fontWeight: '700' }}>Coût</Text>
              {'\n'}
              Gratuit
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          {event.description ? (
            <Text style={styles.description}>{event.description}</Text>
          ) : (
            <Text style={styles.emptyStateText}>Aucune description n'a été ajoutée pour cet événement.</Text>
          )}
        </View>

        {/* Liste des jeux */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Jeux ({eventGames.length})</Text>
          {eventGames.length > 0 ? (
            eventGames.map((game, index) => (
              <View key={game.id || `game-${index}`} style={styles.gameCard}>
                {game.image_url && (
                  <View style={styles.gameImageContainer}>
                    <Image
                      source={{ uri: game.image_url }}
                      style={styles.gameImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.game_name}</Text>
                  {game.category && (
                    <Text style={styles.gameCategory}>{game.category}</Text>
                  )}
                  <View style={styles.gameDetailsRow}>
                    {game.min_players && game.max_players && (
                      <Text style={styles.gameComplexity}>
                        👥 {game.min_players}-{game.max_players} joueurs
                      </Text>
                    )}
                    {game.min_playtime && game.max_playtime && (
                      <Text style={styles.gameComplexity}>
                        {' • ⏱️ '}{game.min_playtime}-{game.max_playtime} min
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>Aucun jeu n'a été ajouté à cet événement.</Text>
          )}
        </View>

        {/* Tags */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Tags événement et jeu</Text>
          {(eventTags.length > 0 || gameTags.length > 0) ? (
            <View style={styles.badgesContainer}>
              {eventTags.map((eventTag, index) => {
                const tagName = eventTag.tags?.name || eventTag.name || 'Tag inconnu';
                const tagKey = eventTag.tag_id || eventTag.id || eventTag.tags?.id || `event-tag-${index}`;
                return (
                  <View key={tagKey} style={[styles.badge, styles.eventTagBadge]}>
                    <Text style={styles.badgeText}>{tagName}</Text>
                  </View>
                );
              })}
              {gameTags.map((gameTag, index) => {
                const tagName = gameTag.tags?.name || gameTag.name || 'Tag inconnu';
                const tagKey = gameTag.tag_id || gameTag.id || gameTag.tags?.id || `game-tag-${index}`;
                return (
                  <View key={tagKey} style={[styles.badge, styles.gameTagBadge]}>
                    <Text style={styles.badgeText}>
                    {tagName.charAt(0).toUpperCase() + tagName.slice(1)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyStateText}>Aucun tag n'a été associé à cet événement.</Text>
          )}
        </View>

        {/* Participants */}
        <View style={styles.participantsContainer}>
          <Text style={styles.participantsTitle}>
            Participants ({participants.length})
          </Text>
          {participants.length > 0 ? (
            participants.map((participant) => {
              const profileUsername = participant.profiles?.username

              return (
                <TouchableOpacity
                  key={participant.id}
                  style={styles.participantCard}
                  activeOpacity={profileUsername ? 0.8 : 1}
                  accessibilityRole="button"
                  disabled={!profileUsername}
                  onPress={
                    profileUsername
                      ? () => navigateToProfile(profileUsername)
                      : undefined
                  }
                >
                  <View style={styles.participantAvatar}>
                    {participant.profiles?.avatar_url ? (
                      <Image
                        source={{ uri: participant.profiles.avatar_url }}
                        style={styles.participantAvatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.participantAvatarFallback,
                          { backgroundColor: `hsl(${participant.profiles?.id?.charCodeAt(0) * 137.5 % 360 || 200}, 70%, 50%)` }
                        ]}
                      >
                        <Text style={styles.participantAvatarInitials}>
                          {getInitials(participant.profiles?.full_name || participant.profiles?.username || 'U')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                      @{participant.profiles?.username || 'Utilisateur'}
                    </Text>
                    {participant.profiles?.city && (
                      <Text style={styles.participantCity}>
                        {isCreator ? 'vous' : participant.full_name || participant.username}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })
          ) : (
            <Text style={styles.emptyStateText}>Aucun participant pour le moment. Soyez le premier à vous inscrire !</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!isCreator && (

          <View style={styles.creatorBadge}>
            <TouchableOpacity
            style={styles.GroupContactButton}
            onPress={handleContactParticipants}
            disabled={isCreatingConversation}>
              {isCreatingConversation ? (
                <ActivityIndicator size="small" color="#121417" />
              ) : (
                <Text style={styles.creatorBadgeText}>
                  Contacter l'hôte
                </Text>
              )}
            </TouchableOpacity> 
            
            <TouchableOpacity
              style={[
                styles.participateButton,
                isParticipating && !isCreator && styles.participateButtonActive,
                isFull && !isParticipating && styles.participateButtonDisabled
              ]}
              onPress={handleParticipate}
              disabled={isLoadingAction || (isFull && !isParticipating && !isCreator)}
            >
              {isLoadingAction ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.participateButtonText}>
                  {isParticipating ? 'Quitter le gémou' : isFull ? 'Complet' : 'Participer'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          )}
          

          {isCreator && (

            
            <View style={styles.creatorBadge}>
              <TouchableOpacity
              style={styles.GroupContactButton}
              onPress={handleContactParticipants}
              disabled={isCreatingConversation}>
                {isCreatingConversation ? (
                  <ActivityIndicator size="small" color="#121417" />
                ) : (
                  <Text style={styles.creatorBadgeText}>
                    Contacter les participants
                  </Text>
                )}
              </TouchableOpacity> 

              <TouchableOpacity
              
              style={[
                styles.participateButton,
                !isCreator && styles.participateButtonActive
              ]}
              onPress={handleParticipate}
              disabled={isLoadingAction}
            >
              {isLoadingAction ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.participateButtonText}>
                  {isCreator ? 'Modifier' : isFull ? 'Complet' : 'Participer'}
                </Text>
              )}
                
              </TouchableOpacity>
            </View>
            
          )}
        </View>
      </View>

      <ConfirmationModal
        visible={modalVisible}
        variant={modalConfig.variant}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />

      {/* Modales de suppression */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteEvent}
        title="Supprimer l'événement"
        description="Êtes-vous sûr de vouloir supprimer définitivement cet événement ? Cette action est irréversible et tous les participants seront notifiés."
        confirmText="Supprimer"
        cancelText="Annuler"
        confirmVariant="destructive"
        loading={isDeleting}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.push('/(tabs)/events');
        }}
        title="Événement supprimé"
        description="Votre événement a été supprimé avec succès. Vous allez être redirigé vers la liste des événements."
        confirmText="OK"
      />
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
    textAlign: 'center',
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
    padding: 16,
    paddingTop: Platform.select({ ios: 60, android: 16, web: 16 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  content: {
    padding: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    padding: 16,
  },
  metaContainer: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaEmoji: {
    fontSize: 38,
    marginRight: 12,
    borderRadius:10,
    backgroundColor: '#F0F2F5',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',

    display: 'flex',
  },
  metaText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
  },
  descriptionContainer: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 22,
    textAlign: 'justify',
  },
  participantsContainer: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  participantsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  },
  participantAvatarImage: {
    width: '100%',
    height: '100%',
  },
  participantAvatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarInitials: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  participantCity: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  participateButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  participateButtonActive: {
    backgroundColor: '#ef4444',
  },
  participateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  participateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  creatorBadge: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  creatorBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121417',
  },
  eventImageContainer: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0'
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    fontSize: 124,
    color: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  gameInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  gameCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  gameDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  gameComplexity: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  noGamesText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  loadingGamesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingGamesText: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  gameImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#2C3E50',
    overflow: 'hidden',
    marginRight: 12,
  },
  
  gameImage: {
    width: '100%',
    height: '100%',
  },
  
  arrowContainer: {
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  arrow: {
    fontSize: 40,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F0F2F5',
  },
  
  badgeText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  eventTagBadge: {
    backgroundColor: '#fce7f3',
    borderColor: '#f9a8d4',
    borderWidth: 1,
  },
  gameTagBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
    borderWidth: 1,
  },
    gameTypeBadge: {
      backgroundColor: '#dbeafe',
      borderColor: '#93c5fd',
      borderWidth: 1
    },
    gameMechanismBadge: {
      backgroundColor: '#e9d5ff',
      borderColor: '#c084fc',
      borderWidth: 1
    },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
  GroupContactButton: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  GroupContactButtonText: {
    color: '#121417',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

