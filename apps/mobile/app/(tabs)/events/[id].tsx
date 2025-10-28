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
        .eq('profile_id', user.id)
        .single();

      setIsParticipating(!!participationData);

      // Charger les participants
      const { data: participantsData } = await supabase
        .from('event_participants')
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            avatar_url,
            gaming_preferences
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
          .eq('profile_id', user.id);

        if (error) throw error;

        setIsParticipating(false);
        if (Platform.OS !== 'web') {
          Alert.alert('Succès', 'Vous ne participez plus à cet événement');
        }
      } else {
        // Participer
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: event.id,
            profile_id: user.id,
            status: 'confirmed'
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
  const isFull = (event.current_participants || participants.length) >= event.max_participants;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
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
              <Text style={styles.metaEmoji}>👤</Text>
              <Text style={styles.metaText}>
                Organisé par {creator.full_name || creator.username}
              </Text>
            </View>
          )}

          <View style={styles.separator} />

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>📍</Text>
            <Text style={styles.metaText}>{event.location}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>📅</Text>
            <Text style={styles.metaText}>
              {new Date(event.date_time).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>

          <View style={styles.separator} />

          

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>👥</Text>
            <Text style={styles.metaText}>
              {participants.length}/{event.max_participants} participants
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Jeux</Text>
            <TouchableOpacity 
              style={styles.gameCard}
              onPress={() => router.push(`/games/${gameId}`)}
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

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Tag.s événement et jeu</Text>
            <View style={styles.badgesContainer}>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Default</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Dark</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Red</Text>
              </View>
              <View style={[styles.badge]}>
                <Text style={styles.badgeText}>Green</Text>
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

        </View>

        

        {/* Participants */}
        {participants.length > 0 && (
          <View style={styles.participantsSection}>
            <Text style={styles.participantsTitle}>
              Participants ({participants.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.participantsScroll}>
              {participants.map((participant) => {
                const isOrganizer = participant.profiles?.id === event?.creator_id;
                const preferences = participant.profiles?.gaming_preferences || null;
                
                return (
                  <View key={participant.id} style={styles.participantContainer}>
                    <TouchableOpacity
                      style={styles.participantCard}
                      onPress={() => participant.profiles?.username && router.push(`/profile/${participant.profiles.username}`)}
                    >
                      <View style={styles.participantAvatar}>
                        {participant.profiles?.avatar_url ? (
                          <Image
                            source={{ uri: participant.profiles.avatar_url }}
                            style={styles.participantAvatarImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.participantAvatarText}>
                            {participant.profiles?.full_name?.charAt(0) || participant.profiles?.username?.charAt(0) || '👤'}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.participantName} numberOfLines={1}>
                        {participant.profiles?.full_name || 'Utilisateur'}
                      </Text>
                      <Text style={styles.participantUsername} numberOfLines={1}>
                        @{participant.profiles?.username || 'anonyme'}
                      </Text>
                      
                      {/* Préférences de jeu */}
                      {preferences && (
                        <View style={styles.participantPreferences}>
                          <Text style={styles.preferencesText} numberOfLines={1}>
                            {preferences.favorite_type && `🎲 ${preferences.favorite_type}`}
                          </Text>
                          {preferences.experience_level && (
                            <Text style={styles.preferencesText} numberOfLines={1}>
                              ⭐ {preferences.experience_level}
                            </Text>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                    
                    {/* Badge Organisateur */}
                    {isOrganizer && (
                      <View style={styles.organizerBadge}>
                        <Text style={styles.organizerBadgeText}>👑 Organisateur</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}


        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.contactButton}>
            <Text style={styles.contactButtonText}>
              Contacter l'organisateur
            </Text>
          </TouchableOpacity>
          {!isCreator && (
            
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
                  {isParticipating ? '✓ Je participe' : isFull ? 'Complet' : 'Participer'}
                </Text>
                
              )}
            </TouchableOpacity>
          )}
          

          {isCreator && (
            <View style={styles.creatorBadge}>
              <Text style={styles.creatorBadgeText}>
                ⭐ Vous êtes l'organisateur
              </Text>
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
    backgroundColor: 'white',
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  metaContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  metaText: {
    fontSize: 15,
    color: '#4b5563',
    flex: 1,
  },
  descriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  participantsSection: {
    marginBottom: 20,
  },
  participantsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  participantsScroll: {
    marginBottom: 16,
  },
  participantContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  participantCard: {
    width: 150,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  participantAvatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  participantAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 64,
  },
  participantAvatarText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  participantName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  participantUsername: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  participantPreferences: {
    marginTop: 8,
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  preferencesText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 2,
  },
  organizerBadge: {
    marginTop: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  organizerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  
  },
  participateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '50%',
  },
  participateButtonActive: {
    backgroundColor: '#10b981',
  },
  participateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  participateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '50%',
  },
  contactButtonText: {
    color: '#121417',
    fontSize: 16,
    fontWeight: 'bold',
  },
  creatorBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  creatorBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
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
    backgroundColor: '#3b82f6',
  },
  
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
});
