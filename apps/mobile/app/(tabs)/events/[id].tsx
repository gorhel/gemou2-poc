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
  event_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  status: string;
  creator_id: string;
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
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>📅</Text>
            <Text style={styles.metaText}>
              {new Date(event.event_date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>📍</Text>
            <Text style={styles.metaText}>{event.location}</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaEmoji}>👥</Text>
            <Text style={styles.metaText}>
              {participants.length}/{event.max_participants} participants
            </Text>
          </View>

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
                  Organisé par {creator.full_name || creator.username}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{event.description}</Text>
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
                    {participant.profiles?.full_name || participant.profiles?.username || 'Utilisateur'}
                  </Text>
                  {participant.profiles?.city && (
                    <Text style={styles.participantCity}>
                      📍 {participant.profiles.city}
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
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 32,
    height: 32,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  participantsContainer: {
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
  },
  participateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
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
});

