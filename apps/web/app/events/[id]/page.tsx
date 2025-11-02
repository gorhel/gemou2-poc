'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientSupabaseClient } from '../../../lib/supabase-client';
import { useEventParticipantsCount } from '../../../hooks/useEventParticipantsCount';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/Loading';
import { ResponsiveLayout, PageHeader, PageFooter } from '../../../components/layout';

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

export default function EventPageOptimized() {
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

  // États pour gérer les participants
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // États pour les tags de l'événement
  const [eventTags, setEventTags] = useState<any[]>([]);
  
  // États pour le slider des participants
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fonctions pour gérer les participants
  const fetchParticipants = useCallback(async () => {
    if (!eventId) return;
    
    setLoadingParticipants(true);
    try {
      // Récupérer les participants et les tags en parallèle
      const [participantsResult, tagsResult] = await Promise.allSettled([
        supabase
          .from('event_participants')
          .select(`
            *,
            profiles (
              id,
              username,
              full_name,
              avatar_url,
              city
            )
          `)
          .eq('event_id', eventId),
        supabase
          .from('event_tags')
          .select(`
            tag_id,
            tags (
              id,
              name
            )
          `)
          .eq('event_id', eventId)
      ]);

      // Traiter les participants
      if (participantsResult.status === 'fulfilled') {
        const { data: participantsData, error: participantsError } = participantsResult.value;
        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);
      } else {
        console.error('Erreur lors du chargement des participants:', participantsResult.reason);
        setParticipants([]);
      }

      // Traiter les tags
      if (tagsResult.status === 'fulfilled') {
        const { data: tagsData, error: tagsError } = tagsResult.value;
        if (tagsError) {
          console.warn('Erreur lors du chargement des tags:', tagsError);
          setEventTags([]);
        } else {
          setEventTags(tagsData || []);
        }
      } else {
        console.warn('Erreur lors du chargement des tags:', tagsResult.reason);
        setEventTags([]);
      }

    } catch (error: any) {
      console.error('Erreur lors du chargement des participants:', error);
      setParticipants([]);
      setEventTags([]);
    } finally {
      setLoadingParticipants(false);
    }
  }, [eventId, supabase]);

  const addParticipant = useCallback((participant: any) => {
    setParticipants(prev => [...prev, participant]);
  }, []);

  const removeParticipant = useCallback((userId: string) => {
    setParticipants(prev => prev.filter(p => p.user_id !== userId));
  }, []);

  const refreshParticipants = useCallback(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Fonctions pour le slider des participants
  const nextSlide = useCallback(() => {
    const participantsPerSlide = 4; // Nombre de participants visibles à la fois (w-1/4)
    const maxSlide = Math.max(0, Math.ceil(participants.length / participantsPerSlide) - 1);
    setCurrentSlide(prev => (prev + 1) % (maxSlide + 1));
  }, [participants.length]);

  const prevSlide = useCallback(() => {
    const participantsPerSlide = 4;
    const maxSlide = Math.max(0, Math.ceil(participants.length / participantsPerSlide) - 1);
    setCurrentSlide(prev => (prev - 1 + (maxSlide + 1)) % (maxSlide + 1));
  }, [participants.length]);

  // Utiliser le hook pour obtenir le nombre réel de participants
  const {
    count: realParticipantsCount,
    loading: loadingCount,
    refreshCount
  } = useEventParticipantsCount(eventId);

  // Fonction pour récupérer les données fraîches de l'événement
  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupération des données de l'événement

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Erreur lors de la récupération de l\'événement:', eventError);
        throw eventError;
      }

      if (!eventData) {
        throw new Error('Événement non trouvé');
      }

      // Événement récupéré avec succès

      setEvent(eventData);

      // Récupérer le créateur
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', (eventData as Event).creator_id)
        .single();

      if (creatorError) {
        console.error('Erreur lors de la récupération du créateur:', creatorError);
      } else {
        setCreator(creatorData);
      }

    } catch (error: any) {
      console.error('Erreur lors du chargement de l\'événement:', error);
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
      // Vérification de la participation pour l'utilisateur - optimisée
      const { data: participation, error } = await supabase
        .from('event_participants')
        .select('id') // Seulement l'ID pour optimiser
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Erreur silencieuse pour les erreurs de réseau temporaires
        if (error.message?.includes('Failed to fetch')) {
          console.warn('Erreur réseau temporaire lors de la vérification de participation');
          return;
        }
        console.error('Erreur lors de la vérification de participation:', error);
        return;
      }

      const participating = !!participation;
      setIsParticipating(participating);
    } catch (error: any) {
      // Erreur silencieuse pour les erreurs de réseau
      if (error?.message?.includes('Failed to fetch')) {
        console.warn('Erreur réseau temporaire');
        return;
      }
      console.error('Erreur lors de la vérification de participation:', error);
      setIsParticipating(false);
    }
  }, [user, eventId, supabase]);

  // Effect pour charger les détails de l'événement au montage
  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchParticipants();
    }
  }, [eventId, fetchEventDetails, fetchParticipants]);

  // Effect pour écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Changement d'état d'authentification détecté
      setUser(session?.user || null);
      
      // Ne rafraîchir que si c'est un changement significatif et si l'utilisateur existe
      if ((event === 'SIGNED_IN' || event === 'SIGNED_OUT') && eventId) {
        setTimeout(() => {
          if (session?.user) {
            checkParticipation();
          } else {
            setIsParticipating(false);
          }
        }, 100);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, checkParticipation]); // Simplifié les dépendances

  // Effect pour vérifier la participation quand l'utilisateur change
  useEffect(() => {
    if (user && eventId) {
      // Délai pour éviter les requêtes répétitives
      const timeoutId = setTimeout(() => {
        checkParticipation();
      }, 200);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsParticipating(false);
    }
  }, [user?.id, eventId, checkParticipation]); // Utiliser user.id au lieu de user pour éviter les re-renders

  const handleJoinEvent = async () => {
    try {
      setIsLoadingAction(true);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      // Action de participation en cours

      if (isParticipating) {
        // Quitter l'événement
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', currentUser.id);

        if (error) {
          console.error('Erreur lors de la sortie:', error);
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
          console.error('Erreur lors de la mise à jour du compteur:', updateError);
        }

        // Mettre à jour la liste des participants localement
        removeParticipant(currentUser.id);

        // Sortie de l'événement réussie

      } else {
        // Vérifier si l'événement est complet
        if (event && actualParticipantsCount >= event.max_participants) {
          alert('Cet événement est complet');
          return;
        }

        if (event && event.status !== 'active') {
          alert('Cet événement n\'est plus actif');
          return;
        }

        // Rejoindre l'événement
        const { data: newParticipation, error } = await supabase
          .from('event_participants')
          .insert({
            event_id: eventId,
            user_id: currentUser.id,
            status: 'registered'
          })
          .select(`
            id,
            user_id,
            event_id,
            status,
            joined_at,
            profile:user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .single();

        if (error) {
          if (error.code === '23505') {
            alert('Vous participez déjà à cet événement');
            return;
          }
          console.error('Erreur lors de l\'ajout:', error);
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
          console.error('Erreur lors de la mise à jour du compteur:', updateError);
        }

        // Mettre à jour la liste des participants localement
        if (newParticipation) {
          const participantWithRole = {
            ...newParticipation,
            role: newParticipation.user_id === event?.creator_id ? 'host' : 'participant'
          };
          addParticipant(participantWithRole);
        }

        // Ajout à l'événement réussi
      }

      // Rafraîchir les données après l'action - optimisé
      await Promise.allSettled([
        fetchEventDetails(),
        checkParticipation(),
        refreshCount(),
        fetchParticipants() // Rafraîchir la liste des participants
      ]);

    } catch (error: any) {
      console.error('Erreur lors de l\'action:', error);
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

  // Utiliser le nombre réel de participants ou le nombre stocké en fallback
  const actualParticipantsCount = realParticipantsCount > 0 ? realParticipantsCount : event.current_participants;
  const isEventFull = actualParticipantsCount >= event.max_participants;
  const canJoin = !isEventFull && event.status === 'active' && user;

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
        <PageHeader
          icon="🎲"
          title={event?.title || 'Détail de l\'événement'}
          subtitle={event ? `${formatDate(event.date_time)} • ${event.location}` : ''}
          showBackButton
        />
        
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1">
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
                      👥 {actualParticipantsCount}/{event.max_participants} participants
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
                    {actualParticipantsCount}/{event.max_participants}
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
                  <Link href={`/profile/${creator.username}`} className="block">
                    <div className="items-center space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
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
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{creator.full_name}</h3>
                        <p className="text-gray-600">@{creator.username}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mt-1">
                          👑 Organisateur
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-gray-500">Chargement...</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Liste des participants - Slider */}
          <Card>
            <CardHeader>
              <CardTitle>👥 Participants ({participants.length}/{event?.max_participants || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingParticipants ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="md" />
                </div>
              ) : participants.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun participant pour le moment</p>
              ) : (
                <div className="relative">
                  {/* Conteneur du slider */}
                  <div className="overflow-hidden">
                    <div 
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{ 
                        transform: `translateX(-${currentSlide * 25}%)`,
                        width: `${Math.ceil(participants.length / 4) * 100}%`
                      }}
                    >
                      {participants.map((participant, index) => (
                        
                          <div key={participant.id} className="w-1/4 flex-shrink-0 px-3">
                            <Link href={`/profile/${participant.profiles.username}`} className="block">
                            <div className="flex flex-col items-center text-center">
                              {/* Avatar - 128px */}
                              <div className="w-32 h-32 rounded-full bg-[#F5E6D3] overflow-hidden mb-4">
                                {participant.profiles?.avatar_url ? (
                                  <img 
                                    src={participant.profiles.avatar_url} 
                                    alt={participant.profiles.username || 'Avatar'}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full">
                                    <span className="text-4xl text-gray-400">
                                      {participant.profiles?.username?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Nom + Ville */}
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {participant.profiles?.username || 'Utilisateur anonyme'}
                              </h3>
                              {participant.profiles?.city && (
                                <p className="text-sm text-gray-600 mb-3">
                                  {participant.profiles.city}
                                </p>
                              )}
                              
                              {/* Préférences */}
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">Préférences :</p>
                                <div className="text-sm text-gray-700">
                                  {eventTags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 justify-center">
                                      {eventTags.slice(0, 2).map((eventTag) => (
                                        <span 
                                          key={eventTag.tag_id}
                                          className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs"
                                        >
                                          {eventTag.tags?.name}
                                        </span>
                                      ))}
                                      {eventTags.length > 2 && (
                                        <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs">
                                          +{eventTags.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-xs">Aucune préférence</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            </Link>
                          </div>
                        
                      ))}
                    </div>
                  </div>

                  {/* Boutons de navigation */}
                  {participants.length > 4 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-0 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-colors z-10 ml-2"
                        aria-label="Participants précédents"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-0 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-colors z-10 mr-2"
                        aria-label="Participants suivants"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Indicateurs de pagination */}
                  {participants.length > 3 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      {Array.from({ length: Math.ceil(participants.length / 3) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            currentSlide === index ? 'bg-primary-600' : 'bg-gray-300'
                          }`}
                          aria-label={`Aller au slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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
                  <div><strong>Current Participants:</strong> {actualParticipantsCount}</div>
                  <div><strong>Max Participants:</strong> {event.max_participants}</div>
                  <div><strong>Participants Count:</strong> {participants.length}</div>
                  <div><strong>Is Participating:</strong> {isParticipating ? 'Oui' : 'Non'}</div>
                  <div><strong>Event Status:</strong> {event.status}</div>
                  <div><strong>Can Join:</strong> {canJoin ? 'Oui' : 'Non'}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <PageFooter />
      </div>
    </ResponsiveLayout>
  );
}