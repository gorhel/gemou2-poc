'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '../../../lib/supabase-client';
import { useEventParticipation } from '../../../hooks/useEventParticipation';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/Loading';
import { ResponsiveLayout } from '../../../components/layout';

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
}

interface EventCreator {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

export default function EventPageSimple() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [creator, setCreator] = useState<EventCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventId = params.id as string;

  // Utiliser le hook de participation
  const { 
    isParticipating, 
    isLoading: isLoadingAction, 
    toggleParticipation,
    refreshParticipation,
    refreshEventData,
    eventData 
  } = useEventParticipation({
    eventId,
    onSuccess: () => {
      // Rafraîchir les données de l'événement après une action
      fetchEventDetails();
    },
    onError: (error) => {
      alert(error);
    }
  });

  // Fonction pour récupérer les données de l'événement
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer l'événement
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        throw eventError;
      }

      if (!eventData) {
        throw new Error('Événement non trouvé');
      }

      setEvent(eventData);

      // Récupérer le créateur
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', (eventData as Event).creator_id)
        .single();

      if (creatorError) {
        console.error('Error fetching creator:', creatorError);
      } else {
        setCreator(creatorData);
      }

    } catch (error: any) {
      console.error('Error fetching event details:', error);
      setError(error.message || 'Erreur lors du chargement de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  // Effect pour charger les détails de l'événement
  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-4" />
            <p className="text-gray-600 text-lg">Chargement de l'événement...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !event) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Événement non trouvé</h3>
            <p className="text-gray-600 mb-4">{error || 'Cet événement n\'existe pas.'}</p>
            <Button onClick={() => router.back()} variant="outline">
              Retour
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  // Utiliser les données du hook si disponibles, sinon les données locales
  const currentEvent = eventData || event;
  const isEventFull = currentEvent.current_participants >= currentEvent.max_participants;
  const canJoin = !isEventFull && currentEvent.status === 'active';

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header de l'événement */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {currentEvent.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📅 {formatDate(currentEvent.date_time)}</span>
                    <span>📍 {currentEvent.location}</span>
                    <span className={`font-medium ${
                      isEventFull ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      👥 {currentEvent.current_participants}/{currentEvent.max_participants} participants
                      {isEventFull && ' (Complet)'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isParticipating 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isParticipating ? '✅ Vous participez' : '⭕ Non inscrit'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentEvent.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : currentEvent.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentEvent.status === 'active' && 'Actif'}
                    {currentEvent.status === 'cancelled' && 'Annulé'}
                    {currentEvent.status === 'completed' && 'Terminé'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentEvent.image_url && (
                <div className="mb-6">
                  <img 
                    src={currentEvent.image_url} 
                    alt={currentEvent.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {currentEvent.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">📊 Détails de l'événement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date et heure :</span>
                  <span className="font-medium">{formatDate(currentEvent.date_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lieu :</span>
                  <span className="font-medium">{currentEvent.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants :</span>
                  <span className={`font-medium ${
                    isEventFull ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {currentEvent.current_participants}/{currentEvent.max_participants}
                    {isEventFull && ' (Complet)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut :</span>
                  <span className="font-medium capitalize">{currentEvent.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Votre statut :</span>
                  <span className={`font-medium ${
                    isParticipating ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isParticipating ? 'Inscrit' : 'Non inscrit'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">👤 Organisateur</CardTitle>
              </CardHeader>
              <CardContent>
                {creator ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {creator.avatar_url ? (
                        <img
                          src={creator.avatar_url}
                          alt={creator.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: `hsl(${creator.id.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }}
                        >
                          {getInitials(creator.full_name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{creator.full_name}</h3>
                      <p className="text-gray-600">@{creator.username}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Chargement...</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={toggleParticipation}
              disabled={isLoadingAction || (!canJoin && !isParticipating)}
              variant={isParticipating ? "outline" : "default"}
              className="flex-1 sm:flex-none sm:px-8"
            >
              {isLoadingAction ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isParticipating ? 'Désinscription...' : 'Inscription...'}
                </>
              ) : isParticipating ? (
                '👋 Quitter l\'événement'
              ) : isEventFull ? (
                '❌ Événement complet'
              ) : currentEvent.status !== 'active' ? (
                '❌ Événement non actif'
              ) : (
                '🎮 Rejoindre l\'événement'
              )}
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 sm:flex-none sm:px-8"
            >
              Retour
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}

