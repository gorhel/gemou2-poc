import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientSupabaseClient } from '../lib/supabase-client'
import { logger } from '../lib/logger'

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
      logger.error('useEventParticipation', error as Error, { action: 'fetchEventData' })
      return null
    }
  }, [eventId, supabase])

  // Fonction pour vérifier la participation
  const checkUserParticipation = useCallback(async () => {
    try {
      setIsCheckingParticipation(true);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

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
        logger.error('useEventParticipation', error as Error, { action: 'checkParticipation' })
        return
      }

      setIsParticipating(!!participation)
    } catch (error) {
      logger.error('useEventParticipation', error as Error, { action: 'checkParticipation' })
    } finally {
      setIsCheckingParticipation(false)
    }
  }, [eventId, supabase])

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
      // Log uniquement pour les événements importants
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        logger.authEvent(event, { userId: session?.user?.id })
      }
      
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (eventId) {
          checkUserParticipation()
          fetchEventData()
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [eventId, checkUserParticipation, fetchEventData, supabase.auth])

  const mutateParticipation = useCallback(async (shouldJoin: boolean) => {
    try {
      setIsLoading(true);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        onError?.(shouldJoin
          ? 'Vous devez être connecté pour rejoindre un événement'
          : 'Vous devez être connecté pour quitter un événement');
        return;
      }

      if (shouldJoin && isParticipating) {
        onError?.('Vous participez déjà à cet événement');
        return;
      }

      if (!shouldJoin && !isParticipating) {
        onError?.('Vous ne participez pas à cet événement');
        return;
      }

      const event = await fetchEventData();
      if (!event) {
        onError?.('Événement non trouvé');
        return;
      }

      if (shouldJoin && event.status !== 'active') {
        onError?.('Cet événement n\'est plus actif');
        return;
      }

      if (shouldJoin && event.current_participants >= event.max_participants) {
        onError?.('Cet événement est complet');
        return;
      }

      const { error } = await supabase.rpc('update_event_participation', {
        p_event_id: eventId,
        p_join: shouldJoin
      });

      if (error) {
        const message = error.message || 'Erreur lors de la mise à jour de la participation';
        onError?.(message);
        return;
      }

      setIsParticipating(shouldJoin);

      const freshEvent = await fetchEventData();
      if (freshEvent) {
        setEventData(freshEvent);
      } else {
        setEventData(prev => {
          if (!prev) return prev;
          const delta = shouldJoin ? 1 : -1;
          const nextCount = Math.max(0, prev.current_participants + delta);
          return { ...prev, current_participants: nextCount };
        });
      }

      onSuccess?.()
    } catch (error: any) {
      logger.error('useEventParticipation', error, { action: 'mutateParticipation' })
      onError?.(error.message || 'Erreur lors de la mise à jour de la participation')
    } finally {
      setIsLoading(false)
    }
  }, [eventId, fetchEventData, isParticipating, onError, onSuccess, supabase])

  const joinEvent = async () => {
    await mutateParticipation(true);
  };

  const leaveEvent = async () => {
    await mutateParticipation(false);
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
