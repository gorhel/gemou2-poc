'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

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

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinEvent?: (eventId: string) => void;
}

export default function EventDetailsModal({ 
  event, 
  isOpen, 
  onClose, 
  onJoinEvent 
}: EventDetailsModalProps) {
  if (!event) return null;

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
  const isFull = event.current_participants >= event.max_participants;
  const spotsLeft = event.max_participants - event.current_participants;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
              {isFull && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                  Complet
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Image */}
        {event.image_url && (
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date et heure */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📅 Date et heure</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <span className="font-medium mr-2">Date :</span>
                  <span>{date}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="font-medium mr-2">Heure :</span>
                  <span>{time}</span>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📍 Localisation</h3>
              <p className="text-gray-700">{event.location}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Participants</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Inscrits :</span>
                  <span className="font-medium">{event.current_participants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Places disponibles :</span>
                  <span className={`font-medium ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                    {isFull ? '0' : spotsLeft}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Capacité totale :</span>
                  <span className="font-medium">{event.max_participants}</span>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progression</h3>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isFull ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min((event.current_participants / event.max_participants) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {Math.round((event.current_participants / event.max_participants) * 100)}% des places occupées
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Description</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Créé le :</span>
              <span className="ml-2">
                {new Date(event.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div>
              <span className="font-medium">Dernière mise à jour :</span>
              <span className="ml-2">
                {new Date(event.updated_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
          {event.status === 'active' && !isFull && onJoinEvent && (
            <Button onClick={() => onJoinEvent(event.id)}>
              Rejoindre l'événement
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

