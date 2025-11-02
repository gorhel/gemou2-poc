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

export default function EventsSlider() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const supabase = createClientSupabaseClient();

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date().toISOString();
             // Récupération des événements depuis Supabase Cloud

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gte('date_time', now)
        .order('date_time', { ascending: true })
        .limit(10);

             // Événements récupérés depuis Supabase Cloud

      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching upcoming events:', error);
      setError('Erreur lors du chargement des événements depuis Supabase Cloud: ' + error.message);
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
      await fetchUpcomingEvents();
      
      alert('Vous avez rejoint l\'événement avec succès !');
    } catch (error: any) {
      console.error('Error joining event:', error);
      alert('Erreur lors de l\'ajout à l\'événement: ' + error.message);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= events.length - 3 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? Math.max(0, events.length - 3) : prevIndex - 1
    );
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
        <Button onClick={fetchUpcomingEvents} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <span className="text-6xl">🎲</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun événement trouvé</h3>
        <p className="text-gray-600">
          Il n'y a pas encore d'événements actifs dans la base de données.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Conteneur du slider */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / Math.min(3, events.length))}%)`,
            width: `${(events.length / Math.min(3, events.length)) * 100}%`
          }}
        >
          {events.map((event) => (
            <div 
              key={event.id}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / events.length}%` }}
            >
              <div className="h-64">
                <EventCard
                  event={event}
                  onViewDetails={handleViewDetails}
                  onJoinEvent={handleJoinEvent}
                  onParticipationChange={fetchUpcomingEvents}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boutons de navigation */}
      {events.length > 3 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
            aria-label="Événement précédent"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow z-10"
            aria-label="Événement suivant"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicateurs de pagination */}
      {events.length > 3 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(events.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / 3) === index ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-label={`Page ${index + 1}`}
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
