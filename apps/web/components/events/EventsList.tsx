'use client';

import React, { useState, useEffect } from 'react';
import { createClientSupabaseClient } from '../../lib/supabase-client';
import { LoadingSpinner } from '../ui/Loading';
import { Button } from '../ui/Button';
import EventCard from './EventCard';
import EventDetailsModal from './EventDetailsModal';

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
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all');

  const supabase = createClientSupabaseClient();

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
    }
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Vous devez être connecté pour rejoindre un événement');
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
        alert('Vous participez déjà à cet événement');
        return;
      }

      // Vérifier si l'événement est complet
      const { data: event } = await supabase
        .from('events')
        .select('current_participants, max_participants, status')
        .eq('id', eventId)
        .single();

      if (!event) {
        alert('Événement non trouvé');
        return;
      }

      if (event.status !== 'active') {
        alert('Cet événement n\'est plus actif');
        return;
      }

      if (event.current_participants >= event.max_participants) {
        alert('Cet événement est complet');
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
      
      alert('Vous avez rejoint l\'événement avec succès !');
    } catch (error: any) {
      console.error('Error joining event:', error);
      alert('Erreur lors de l\'ajout à l\'événement: ' + error.message);
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
    const baseClass = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
    return filter === filterType
      ? `${baseClass} bg-blue-500 text-white`
      : `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchEvents} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres compacts */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={getFilterButtonClass('all')}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter('active')}
          className={getFilterButtonClass('active')}
        >
          Actifs
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={getFilterButtonClass('upcoming')}
        >
          À venir
        </button>
      </div>

      {/* Liste des événements - Format rectangulaire horizontal */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <span className="text-6xl">🎲</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun événement trouvé</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Il n\'y a pas encore d\'événements programmés.'
              : 'Aucun événement ne correspond à ce filtre.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEvents.slice(0, 6).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={handleViewDetails}
              onJoinEvent={handleJoinEvent}
              onParticipationChange={fetchEvents}
            />
          ))}
        </div>
      )}

      {/* Modal de détails */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onJoinEvent={handleJoinEvent}
      />
    </div>
  );
}

