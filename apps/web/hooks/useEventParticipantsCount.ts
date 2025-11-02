import { useState, useEffect, useCallback } from 'react';
import { createClientSupabaseClient } from '../lib/supabase-client';

interface ParticipantsCountData {
  eventId: string;
  storedCount: number;
  realCount: number;
  isConsistent: boolean;
}

export function useEventParticipantsCount(eventId: string) {
  const supabase = createClientSupabaseClient();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipantsCount = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      // Récupérer le nombre réel de participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .neq('status', 'cancelled');

      if (participantsError) {
        throw participantsError;
      }

      const realCount = participantsData?.length || 0;
      setCount(realCount);

      // Optionnel : Mettre à jour le compteur en base si nécessaire
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('current_participants')
        .eq('id', eventId)
        .single();

      if (!eventError && eventData && eventData.current_participants !== realCount) {
        // Synchronisation du compteur nécessaire
        
        // Mettre à jour le compteur en base
        await supabase
          .from('events')
          .update({ 
            current_participants: realCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', eventId);
      }

    } catch (error: any) {
      console.error('Erreur lors de la récupération du compteur:', error);
      setError(error.message || 'Erreur lors du chargement du compteur');
    } finally {
      setLoading(false);
    }
  }, [eventId, supabase]);

  useEffect(() => {
    if (eventId) {
      fetchParticipantsCount();
    }
  }, [eventId, fetchParticipantsCount]);

  const refreshCount = () => {
    fetchParticipantsCount();
  };

  return {
    count,
    loading,
    error,
    refreshCount
  };
}

// Hook pour vérifier la cohérence de tous les événements
export function useParticipantsCountConsistency() {
  const supabase = createClientSupabaseClient();
  const [data, setData] = useState<ParticipantsCountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConsistency = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: consistencyData, error: consistencyError } = await supabase
        .rpc('check_participants_count_consistency');

      if (consistencyError) {
        throw consistencyError;
      }

      setData(consistencyData || []);

    } catch (error: any) {
      console.error('Erreur lors de la vérification de cohérence:', error);
      setError(error.message || 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const syncAllCounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: syncError } = await supabase
        .rpc('sync_all_event_participants_count');

      if (syncError) {
        throw syncError;
      }

      // Re-vérifier la cohérence après synchronisation
      await checkConsistency();

    } catch (error: any) {
      console.error('Erreur lors de la synchronisation:', error);
      setError(error.message || 'Erreur lors de la synchronisation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConsistency();
  }, []);

  return {
    data,
    loading,
    error,
    checkConsistency,
    syncAllCounts
  };
}


