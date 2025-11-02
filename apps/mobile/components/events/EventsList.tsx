import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner, LoadingPage } from '../ui/Loading';
import { Button } from '../ui/Button';
import EventCard from './EventCard';

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
  creator_id?: string;
  created_at?: string;
  updated_at?: string;
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date_time', { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setError('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleViewDetails = (event: Event) => {
    // TODO: Naviguer vers la page de détails
    console.log('View details:', event.id);
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour rejoindre un événement');
        return;
      }

      // Vérifier si l'utilisateur participe déjà
      const { data: existingParticipation } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingParticipation) {
        Alert.alert('Information', 'Vous participez déjà à cet événement');
        return;
      }

      // Vérifier si l'événement est complet
      const { data: event } = await supabase
        .from('events')
        .select('current_participants, max_participants, status')
        .eq('id', eventId)
        .single();

      if (!event) {
        Alert.alert('Erreur', 'Événement non trouvé');
        return;
      }

      if (event.status !== 'active') {
        Alert.alert('Erreur', 'Cet événement n\'est plus actif');
        return;
      }

      if (event.current_participants >= event.max_participants) {
        Alert.alert('Erreur', 'Cet événement est complet');
        return;
      }

      // Ajouter le participant
      const { error: insertError } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'registered'
        });

      if (insertError) {
        throw insertError;
      }

      // Mettre à jour le compteur de participants
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          current_participants: event.current_participants + 1 
        })
        .eq('id', eventId);

      if (updateError) {
        throw updateError;
      }

      // Rafraîchir la liste des événements
      await fetchEvents();
      
      Alert.alert('Succès', 'Vous avez rejoint l\'événement avec succès !');
    } catch (error: any) {
      console.error('Error joining event:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'ajout à l\'événement: ' + error.message);
    }
  };

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.date_time);

    switch (filter) {
      case 'active':
        return event.status === 'active';
      case 'upcoming':
        return event.status === 'active' && eventDate > now;
      default:
        return true;
    }
  });

  const getFilterButtonClass = (filterType: string) => {
    return filter === filterType
      ? 'bg-blue-500'
      : 'bg-gray-100';
  };

  const getFilterTextClass = (filterType: string) => {
    return filter === filterType
      ? 'text-white'
      : 'text-gray-700';
  };

  if (loading && !refreshing) {
    return <LoadingPage text="Chargement des événements..." />;
  }

  if (error && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</Text>
        <Text className="text-gray-600 mb-4 text-center">{error}</Text>
        <Button onPress={fetchEvents} variant="ghost">
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 p-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Filtres */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          onPress={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${getFilterButtonClass('all')}`}
        >
          <Text className={`text-sm font-medium ${getFilterTextClass('all')}`}>
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg ${getFilterButtonClass('active')}`}
        >
          <Text className={`text-sm font-medium ${getFilterTextClass('active')}`}>
            Actifs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg ${getFilterButtonClass('upcoming')}`}
        >
          <Text className={`text-sm font-medium ${getFilterTextClass('upcoming')}`}>
            À venir
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des événements */}
      {filteredEvents.length === 0 ? (
        <View className="items-center py-12">
          <Text className="text-6xl mb-4">🎲</Text>
          <Text className="text-lg font-semibold text-gray-900 mb-2">Aucun événement trouvé</Text>
          <Text className="text-gray-600 text-center">
            {filter === 'all' 
              ? 'Il n\'y a pas encore d\'événements programmés.'
              : 'Aucun événement ne correspond à ce filtre.'
            }
          </Text>
        </View>
      ) : (
        <View>
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={handleViewDetails}
              onJoinEvent={handleJoinEvent}
              onParticipationChange={fetchEvents}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

