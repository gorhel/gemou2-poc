-- Migration pour corriger le compteur de participants
-- Synchronise current_participants avec le nombre réel de participants

-- 1. Fonction pour mettre à jour le compteur de participants
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le compteur pour l'événement concerné
  UPDATE public.events 
  SET current_participants = (
    SELECT COUNT(*) 
    FROM public.event_participants 
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    AND status != 'cancelled'
  ),
  updated_at = timezone('utc'::text, now())
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger pour INSERT (ajout de participant)
CREATE TRIGGER trigger_update_participants_count_insert
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- 3. Trigger pour UPDATE (changement de statut)
CREATE TRIGGER trigger_update_participants_count_update
  AFTER UPDATE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- 4. Trigger pour DELETE (suppression de participant)
CREATE TRIGGER trigger_update_participants_count_delete
  AFTER DELETE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- 5. Fonction pour synchroniser tous les compteurs existants
CREATE OR REPLACE FUNCTION sync_all_event_participants_count()
RETURNS void AS $$
BEGIN
  UPDATE public.events 
  SET current_participants = (
    SELECT COUNT(*) 
    FROM public.event_participants 
    WHERE event_participants.event_id = events.id
    AND event_participants.status != 'cancelled'
  ),
  updated_at = timezone('utc'::text, now())
  WHERE EXISTS (
    SELECT 1 FROM public.event_participants 
    WHERE event_participants.event_id = events.id
  );
END;
$$ LANGUAGE plpgsql;

-- 6. Synchroniser immédiatement tous les compteurs existants
SELECT sync_all_event_participants_count();

-- 7. Fonction helper pour obtenir le nombre réel de participants
CREATE OR REPLACE FUNCTION get_real_participants_count(event_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM public.event_participants 
    WHERE event_id = event_uuid
    AND status != 'cancelled'
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Fonction pour vérifier la cohérence des compteurs
CREATE OR REPLACE FUNCTION check_participants_count_consistency()
RETURNS TABLE(
  event_id uuid,
  event_title text,
  stored_count integer,
  real_count integer,
  is_consistent boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.current_participants,
    get_real_participants_count(e.id),
    (e.current_participants = get_real_participants_count(e.id)) as is_consistent
  FROM public.events e
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 9. Commentaires pour la documentation
COMMENT ON FUNCTION update_event_participants_count() IS 'Met à jour automatiquement le compteur de participants d''un événement';
COMMENT ON FUNCTION sync_all_event_participants_count() IS 'Synchronise tous les compteurs de participants existants';
COMMENT ON FUNCTION get_real_participants_count(uuid) IS 'Retourne le nombre réel de participants pour un événement';
COMMENT ON FUNCTION check_participants_count_consistency() IS 'Vérifie la cohérence entre le compteur stocké et le nombre réel de participants';


