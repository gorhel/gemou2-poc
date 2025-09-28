'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '../../../lib/supabase-client';
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

export default function EventPageSync() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [creator, setCreator] = useState<EventCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [user, setUser] = useState<any>(null);

  const eventId = params.id as string;

  // Fonction pour récupérer les données fraîches de l'événement
  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Récupération des données de l\'événement:', eventId);

      // Récupérer l'événement avec les données les plus récentes
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('❌ Erreur lors de la récupération de l\'événement:', eventError);
        throw eventError;
      }

      if (!eventData) {
        throw new Error('Événement non trouvé');
      }

      console.log('✅ Événement récupéré:', {
        title: eventData.title,
        current_participants: eventData.current_participants,
        max_participants: eventData.max_participants
      });

      setEvent(eventData);

      // Récupérer le créateur
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', (eventData as Event).creator_id)
        .single();

      if (creatorError) {
        console.error('❌ Erreur lors de la récupération du créateur:', creatorError);
      } else {
        setCreator(creatorData);
      }

    } catch (error: any) {
      console.error('❌ Erreur lors du chargement de l\'événement:', error);
      setError(error.message || 'Erreur lors du chargement de l\'événement');
    } finally {
      setLoading(false);
    }
  }, [eventId, supabase]);

  // Fonction pour vérifier la participation
  const checkParticipation = useCallback(async () => {
    if (!user || !eventId) {
      setIsParticipating(false);
      return;
    }

    try {
      console.log('🔍 Vérification de la participation pour l\'utilisateur:', user.id);

      const { data: participation, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur lors de la vérification de participation:', error);
        return;
      }

      const participating = !!participation;
      console.log('📊 Statut de participation:', participating);
      setIsParticipating(participating);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de participation:', error);
      setIsParticipating(false);
    }
  }, [user, eventId, supabase]);

  // Effect pour charger les détails de l'événement au montage
  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, fetchEventDetails]);

  // Effect pour écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Changement d\'état d\'authentification:', event, session?.user?.id);
      setUser(session?.user || null);
      
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (eventId) {
          // Rafraîchir les données après changement d'auth
          setTimeout(() => {
            fetchEventDetails();
            checkParticipation();
          }, 100);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, fetchEventDetails, checkParticipation, supabase.auth]);

  // Effect pour vérifier la participation quand l'utilisateur change
  useEffect(() => {
    if (user && eventId) {
      checkParticipation();
    } else {
      setIsParticipating(false);
    }
  }, [user, eventId, checkParticipation]);

  const handleJoinEvent = async () => {
    try {
      setIsLoadingAction(true);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      console.log('🎮 Action de participation:', isParticipating ? 'Quitter' : 'Rejoindre');

      if (isParticipating) {
        // Quitter l'événement
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', currentUser.id);

        if (error) {
          console.error('❌ Erreur lors de la sortie:', error);
          throw error;
        }

        // Mettre à jour le compteur en base
        const { error: updateError } = await supabase
          .from('events')
          .update({ 
            current_participants: Math.max(0, (event?.current_participants || 0) - 1)
          })
          .eq('id', eventId);

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour du compteur:', updateError);
        }

        console.log('✅ Sortie de l\'événement réussie');

      } else {
        // Vérifier si l'événement est complet
        if (event && event.current_participants >= event.max_participants) {
          alert('Cet événement est complet');
          return;
        }

        if (event && event.status !== 'active') {
          alert('Cet événement n\'est plus actif');
          return;
        }

        // Rejoindre l'événement
        const { error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: currentUser.id,
            status: 'registered'
          });

        if (error) {
          if (error.code === '23505') {
            alert('Vous participez déjà à cet événement');
            return;
          }
          console.error('❌ Erreur lors de l\'ajout:', error);
          throw error;
        }

        // Mettre à jour le compteur en base
        const { error: updateError } = await supabase
          .from('events')
          .update({ 
            current_participants: (event?.current_participants || 0) + 1
          })
          .eq('id', eventId);

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour du compteur:', updateError);
        }

        console.log('✅ Ajout à l\'événement réussi');
      }

      // Rafraîchir les données après l'action
      await fetchEventDetails();
      await checkParticipation();

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'action:', error);
      alert('Erreur lors de l\'action: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setIsLoadingAction(false);
    }
  };

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

  const isEventFull = event.current_participants >= event.max_participants;
  const canJoin = !isEventFull && event.status === 'active' && user;

  console.log('🎯 État actuel:', {
    eventTitle: event.title,
    currentParticipants: event.current_participants,
    maxParticipants: event.max_participants,
    isParticipating,
    isEventFull,
    canJoin
  });

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
                    {event.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>📅 {formatDate(event.date_time)}</span>
                    <span>📍 {event.location}</span>
                    <span className={`font-medium ${
                      isEventFull ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      👥 {event.current_participants}/{event.max_participants} participants
                      {isEventFull && ' (Complet)'}
                    </span>
                    {user && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isParticipating 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isParticipating ? '✅ Vous participez' : '⭕ Non inscrit'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : event.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status === 'active' && 'Actif'}
                    {event.status === 'cancelled' && 'Annulé'}
                    {event.status === 'completed' && 'Terminé'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {event.image_url && (
                <div className="mb-6">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {event.description}
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
                  <span className="font-medium">{formatDate(event.date_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lieu :</span>
                  <span className="font-medium">{event.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants :</span>
                  <span className={`font-medium ${
                    isEventFull ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {event.current_participants}/{event.max_participants}
                    {isEventFull && ' (Complet)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut :</span>
                  <span className="font-medium capitalize">{event.status}</span>
                </div>
                {user && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Votre statut :</span>
                    <span className={`font-medium ${
                      isParticipating ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {isParticipating ? 'Inscrit' : 'Non inscrit'}
                    </span>
                  </div>
                )}
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
            {!user ? (
              <Button
                onClick={() => router.push('/login')}
                variant="default"
                className="flex-1 sm:flex-none sm:px-8"
              >
                🔐 Se connecter pour participer
              </Button>
            ) : (
              <Button
                onClick={handleJoinEvent}
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
                ) : event.status !== 'active' ? (
                  '❌ Événement non actif'
                ) : (
                  '🎮 Rejoindre l\'événement'
                )}
              </Button>
            )}
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 sm:flex-none sm:px-8"
            >
              Retour
            </Button>
          </div>

          {/* Debug Info (en développement) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">🔧 Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div><strong>Event ID:</strong> {eventId}</div>
                  <div><strong>User ID:</strong> {user?.id || 'Non connecté'}</div>
                  <div><strong>Current Participants:</strong> {event.current_participants}</div>
                  <div><strong>Max Participants:</strong> {event.max_participants}</div>
                  <div><strong>Is Participating:</strong> {isParticipating ? 'Oui' : 'Non'}</div>
                  <div><strong>Event Status:</strong> {event.status}</div>
                  <div><strong>Can Join:</strong> {canJoin ? 'Oui' : 'Non'}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}

