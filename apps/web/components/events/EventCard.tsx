'use client';

import React from 'react';
import { Button } from '../ui/Button';
import EventParticipationButton from './EventParticipationButton';
import { useEventParticipantsCount } from '../../hooks/useEventParticipantsCount';

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
}

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
  onJoinEvent?: (eventId: string) => void;
  onParticipationChange?: () => void;
}

export default function EventCard({ event, onViewDetails, onJoinEvent, onParticipationChange }: EventCardProps) {
  // Utiliser le hook pour obtenir le nombre réel de participants
  const { count: realParticipantsCount } = useEventParticipantsCount(event.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const { date, time } = formatDate(event.date_time);
  
  // Utiliser le nombre réel de participants ou le nombre stocké en fallback
  const actualParticipantsCount = realParticipantsCount > 0 ? realParticipantsCount : event.current_participants;
  const isFull = actualParticipantsCount >= event.max_participants;
  const spotsLeft = event.max_participants - actualParticipantsCount;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div 
      className="relative h-48 rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-200"
      onClick={() => onViewDetails(event)}
    >
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-gray-300"
        style={{
          backgroundImage: `url(${event.image_url || '/placeholder-game.jpg'})`
        }}
      >
        {/* Overlay sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-opacity duration-200" />
      </div>

      {/* Contenu en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        {/* Titre principal */}
        <h3 className="text-lg font-bold mb-1 line-clamp-1">
          {event.title}
        </h3>
        
        {/* Sous-titre avec informations */}
        <div className="space-y-1 text-sm text-gray-200">
          <div className="flex items-center space-x-2">
            <span>📅</span>
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🕐</span>
            <span>{time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📍</span>
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>👥</span>
            <span>
              {actualParticipantsCount}/{event.max_participants} participants
            </span>
            {isFull ? (
              <span className="text-red-300 font-medium">• Complet</span>
            ) : (
              <span className="text-green-300 font-medium">
                • {spotsLeft} place{spotsLeft > 1 ? 's' : ''} restante{spotsLeft > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Indicateur de statut */}
      <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${getStatusColor(event.status)}`} />

      {/* Actions au hover */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex space-x-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(event);
            }}
            variant="outline"
            size="sm"
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Voir détails
          </Button>
          {event.status === 'active' && (
            <EventParticipationButton
              eventId={event.id}
              eventStatus={event.status}
              isFull={isFull}
              onSuccess={() => {
                onParticipationChange?.();
                onJoinEvent?.(event.id);
              }}
              onError={(error) => {
                alert(error);
              }}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}