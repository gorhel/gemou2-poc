import { useState, useEffect, useCallback } from 'react';
import { createClientSupabaseClient } from '../lib/supabase-client';

interface UseEventParticipationProps {
  eventId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useEventParticipation({ eventId, onSuccess, onError }: UseEventParticipationProps) {
  const supabase = createClientSupabaseClient();
  const [isParticipating, setIsParticipating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isCheckingParticipation, setIsCheckingParticipation] = useState(true);
  const [eventData, setEventData] = useState<any>(null);

  // Fonction pour récupérer les données de l'événement
  const fetchEventData = useCallback(async () => {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('current_participants, max_participants, status')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEventData(event);
      return event;
    } catch (error) {
      console.error('Error fetching event data:', error);
      return null;
    }
  }, [eventId, supabase]);

  // Fonction pour vérifier la participation
  const checkUserParticipation = useCallback(async () => {
    try {
      setIsCheckingParticipation(true);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        setIsParticipating(false);
        return;
      }

      const { data: participation, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking participation:', error);
        return;
      }

      setIsParticipating(!!participation);
    } catch (error) {
      console.error('Error checking participation:', error);
    } finally {
      setIsCheckingParticipation(false);
    }
  }, [eventId, supabase]);

  // Effect pour vérifier la participation au chargement et changement d'eventId
  useEffect(() => {
    if (eventId) {
      checkUserParticipation();
      fetchEventData();
    }
  }, [eventId, checkUserParticipation, fetchEventData]);

  // Effect pour écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (eventId) {
          checkUserParticipation();
          fetchEventData();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, checkUserParticipation, fetchEventData, supabase.auth]);

  const joinEvent = async () => {
    if (!user) {
      onError?.('Vous devez être connecté pour rejoindre un événement');
      return;
    }

    try {
      setIsLoading(true);

      // Vérifier si l'utilisateur participe déjà
      if (isParticipating) {
        onError?.('Vous participez déjà à cet événement');
        return;
      }

      // Récupérer les données actuelles de l'événement
      const event = await fetchEventData();
      if (!event) {
        onError?.('Événement non trouvé');
        return;
      }

      if (event.status !== 'active') {
        onError?.('Cet événement n\'est plus actif');
        return;
      }

      if (event.current_participants >= event.max_participants) {
        onError?.('Cet événement est complet');
        return;
      }

      // Utiliser une transaction pour s'assurer de la cohérence
      const { data: participation, error: insertError } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'registered'
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          // Contrainte unique violée - l'utilisateur participe déjà
          onError?.('Vous participez déjà à cet événement');
          return;
        }
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
        // Rollback: supprimer la participation si la mise à jour échoue
        await supabase
          .from('event_participants')
          .delete()
          .eq('id', participation.id);
        throw updateError;
      }

      setIsParticipating(true);
      setEventData(prev => prev ? { ...prev, current_participants: prev.current_participants + 1 } : null);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error joining event:', error);
      onError?.(error.message || 'Erreur lors de l\'ajout à l\'événement');
    } finally {
      setIsLoading(false);
    }
  };

  const leaveEvent = async () => {
    if (!user) {
      onError?.('Vous devez être connecté pour quitter un événement');
      return;
    }

    try {
      setIsLoading(true);

      if (!isParticipating) {
        onError?.('Vous ne participez pas à cet événement');
        return;
      }

      // Récupérer les données actuelles de l'événement
      const event = await fetchEventData();
      if (!event) {
        onError?.('Événement non trouvé');
        return;
      }

      // Supprimer le participant
      const { error: deleteError } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Mettre à jour le compteur de participants (avec protection contre les valeurs négatives)
      const newCount = Math.max(0, event.current_participants - 1);
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          current_participants: newCount
        })
        .eq('id', eventId);

      if (updateError) {
        throw updateError;
      }

      setIsParticipating(false);
      setEventData(prev => prev ? { ...prev, current_participants: newCount } : null);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error leaving event:', error);
      onError?.(error.message || 'Erreur lors de la sortie de l\'événement');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParticipation = async () => {
    if (isParticipating) {
      await leaveEvent();
    } else {
      await joinEvent();
    }
  };

  return {
    isParticipating,
    isLoading: isLoading || isCheckingParticipation,
    user,
    eventData,
    joinEvent,
    leaveEvent,
    toggleParticipation,
    refreshParticipation: checkUserParticipation,
    refreshEventData: fetchEventData
  };
}
