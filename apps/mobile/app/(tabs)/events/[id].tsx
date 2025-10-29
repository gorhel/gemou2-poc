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
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../lib';
import { TopHeader } from '../../../components/TopHeader';

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

export default function EventDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  const loadEvent = async () => {
    try {
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

      // Vérifier si l'utilisateur participe
      const { data: participationData } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single();

      setIsParticipating(!!participationData);

      // Charger les participants
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
        .eq('event_id', id);

      setParticipants(participantsData || []);

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

    setIsLoadingAction(true);
    try {
      if (isParticipating) {
        // Annuler la participation
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsParticipating(false);
        if (Platform.OS !== 'web') {
          Alert.alert('Succès', 'Vous ne participez plus à cet événement');
        }
      } else {
        // Vérifier le quota avant de participer
        const currentParticipantsCount = event.current_participants || 0;
        if (currentParticipantsCount >= event.max_participants) {
          if (Platform.OS === 'web') {
            alert('Le quota de participants est atteint');
          } else {
            Alert.alert('Quota atteint', 'Le nombre maximum de participants est déjà atteint pour cet événement');
          }
          return;
        }

        // Participer
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: event.id,
            user_id: user.id,
            status: 'registered'
          });

        if (error) throw error;

        setIsParticipating(true);
        if (Platform.OS !== 'web') {
          Alert.alert('Succès', 'Vous participez maintenant à cet événement !');
        }
      }

      // Recharger les données
      loadEvent();
    } catch (error: any) {
      const message = error.message || 'Une erreur est survenue';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Erreur', message);
      }
    } finally {
      setIsLoadingAction(false);
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

  const isCreator = user?.id === event.creator_id;
  const isFull = (event.current_participants || 0) >= event.max_participants;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header avec bouton retour */}
      <View style={{ flex: 1 }}>
        <TopHeader />  {/* Auto-configuration ! */}
        <ScrollView>
          {/* Contenu */}
        </ScrollView>
      </View>

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
            <Text style={styles.eventImagePlaceholder}>📅</Text>
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
                <span style={{ fontWeight:700 }}>Hôte</span> 
                <br /> 
                Organisé par {isCreator ? 'vous' : creator.full_name || creator.username}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>📍</Text>
            <Text style={styles.metaText}>
            <span style={{ fontWeight:700 }}>Lieu de l'événement</span> 
            <br />
              {event.location}
              </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>📅</Text>
            <Text style={styles.metaText}>
            <span style={{ fontWeight:700 }}>Horaire</span> 
            <br />
              {formatDate(event.date_time)}
            </Text>
          </View>


          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>👥</Text>
            
            <Text style={styles.metaText}>
            <span style={{ fontWeight:700 }}>Capacité</span> 
            <br />
              {event.current_participants || 0}/{event.max_participants} participants
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>💰​​</Text>
            <Text style={styles.metaText}>
            <span style={{ fontWeight:700 }}>Coût</span> 
            <br />
              Gratuit</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description de l'événement</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Jeux</Text>
            <TouchableOpacity 
              style={styles.gameCard}
              // onPress={() => router.push(`/games/${gameId}`)} // TODO: Implémenter la navigation vers le jeu
            >
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>7 Wonders</Text>
                <Text style={styles.gameCategory}>Jeu de stratégie</Text>
              </View>
              
              <View style={styles.gameImageContainer}>
                <Image
                  source={{ uri: event.image_url }}
                  style={styles.gameImage}
                  resizeMode="cover"
                />
                
              </View>
              <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>›</Text>
                </View>
            </TouchableOpacity>
          </View>

          <View style={styles.separator} />

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Tag.s événement et jeu</Text>
            <View style={styles.badgesContainer}>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Familial</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Narratif</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Pas de nourriture</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Strategie</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={[styles.badgeText]}>Yellow</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Indigo</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Purple</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Pink</Text>
              </View>
            </View>
          </View>

        {/* Participants */}
        {participants.length > 0 && (
          <View style={styles.participantsContainer}>
            <Text style={styles.participantsTitle}>
              Participants ({participants.length})
            </Text>
            {participants.map((participant) => (
              <View key={participant.id} style={styles.participantCard}>
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
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!isCreator && (

          <View style={styles.creatorBadge}>
            <TouchableOpacity
            style={styles.GroupContactButton}
            onPress={() => router.push('/')}> {/* // déclencher la conversation avec les participants TODO: implémenter la conversation avec les participants */}
              <Text style={styles.creatorBadgeText}>
                Contacter l'hôte
              </Text>
            </TouchableOpacity> 
            
            <TouchableOpacity
              style={[
                styles.participateButton,
                isParticipating && styles.participateButtonActive,
                isFull && !isParticipating && styles.participateButtonDisabled
              ]}
              onPress={handleParticipate}
              disabled={isLoadingAction || (isFull && !isParticipating)}
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
              onPress={() => router.push('/')}> {/* // déclencher la conversation avec les participants TODO: implémenter la conversation avec les participants */}
                <Text style={styles.creatorBadgeText}>
                  Contacter les participants
                </Text>
              </TouchableOpacity> 

              <TouchableOpacity
              
              style={[
                styles.participateButton,
                isParticipating && styles.participateButtonActive,
                isFull && !isParticipating && styles.participateButtonDisabled
              ]}
              onPress={handleParticipate}
              disabled={isLoadingAction || (isFull && !isParticipating)}
            >
              {isLoadingAction ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.participateButtonText}>
                  {isCreator ? 'Modifier le Gémou' : isFull ? 'Complet' : 'Participer'}
                </Text>
              )}
                
              </TouchableOpacity>
            </View>
            
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  participateButton: {
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
    justifyContent: 'space-around',
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
    fontSize: 24,
    color: '#6b7280',
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
    color: '#121417',
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
  GroupContactButton: {
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
});

