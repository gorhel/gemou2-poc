-- Migration pour forcer la correction des triggers de comptage des participants
-- Date: 29 octobre 2025
-- Résout le problème de mise à jour de current_participants

-- 1. Supprimer les anciens triggers s'ils existent
DROP TRIGGER IF EXISTS trigger_update_participants_count_insert ON public.event_participants;
DROP TRIGGER IF EXISTS trigger_update_participants_count_update ON public.event_participants;
DROP TRIGGER IF EXISTS trigger_update_participants_count_delete ON public.event_participants;

-- 2. Supprimer les anciennes fonctions si elles existent
DROP FUNCTION IF EXISTS update_event_participants_count() CASCADE;
DROP FUNCTION IF EXISTS get_real_participants_count(uuid) CASCADE;

-- 3. Créer la fonction de mise à jour du compteur
CREATE OR REPLACE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
DECLARE
  v_event_id uuid;
  v_count integer;
BEGIN
  -- Déterminer l'event_id concerné
  IF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
  ELSE
    v_event_id := NEW.event_id;
  END IF;

  -- Compter les participants (exclure les statuts 'cancelled')
  SELECT COUNT(*) INTO v_count
  FROM public.event_participants 
  WHERE event_id = v_event_id
    AND status != 'cancelled';

  -- Mettre à jour le compteur dans la table events
  UPDATE public.events 
  SET 
    current_participants = v_count,
    updated_at = timezone('utc'::text, now())
  WHERE id = v_event_id;

  -- Log pour debug (optionnel)
  RAISE NOTICE 'Event % participants count updated to %', v_event_id, v_count;

  -- Retourner la ligne appropriée
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer les triggers
CREATE TRIGGER trigger_update_participants_count_insert
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

CREATE TRIGGER trigger_update_participants_count_update
  AFTER UPDATE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

CREATE TRIGGER trigger_update_participants_count_delete
  AFTER DELETE ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_event_participants_count();

-- 5. Supprimer l'ancienne fonction de synchronisation si elle existe
DROP FUNCTION IF EXISTS sync_all_event_participants_count() CASCADE;

-- 5. Fonction pour synchroniser manuellement tous les événements
CREATE OR REPLACE FUNCTION sync_all_event_participants_count()
RETURNS TABLE(
  event_id uuid,
  event_title text,
  old_count integer,
  new_count integer,
  updated boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH counts AS (
    SELECT 
      e.id,
      e.title,
      e.current_participants as old_count,
      COALESCE((
        SELECT COUNT(*) 
        FROM public.event_participants ep
        WHERE ep.event_id = e.id 
          AND ep.status != 'cancelled'
      ), 0) as new_count
    FROM public.events e
  )
  UPDATE public.events e
  SET 
    current_participants = counts.new_count,
    updated_at = timezone('utc'::text, now())
  FROM counts
  WHERE e.id = counts.id
    AND e.current_participants != counts.new_count
  RETURNING 
    counts.id as event_id,
    counts.title as event_title,
    counts.old_count,
    counts.new_count,
    true as updated;
END;
$$ LANGUAGE plpgsql;

-- 6. Supprimer l'ancienne fonction de diagnostic si elle existe
DROP FUNCTION IF EXISTS check_participants_consistency() CASCADE;
DROP FUNCTION IF EXISTS check_participants_count_consistency() CASCADE;

-- 6. Fonction de diagnostic
CREATE OR REPLACE FUNCTION check_participants_consistency()
RETURNS TABLE(
  event_id uuid,
  event_title text,
  stored_count integer,
  real_count bigint,
  is_consistent boolean,
  difference integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as event_id,
    e.title as event_title,
    e.current_participants as stored_count,
    COUNT(ep.id) as real_count,
    (e.current_participants = COUNT(ep.id)) as is_consistent,
    (e.current_participants - COUNT(ep.id)::integer) as difference
  FROM public.events e
  LEFT JOIN public.event_participants ep 
    ON ep.event_id = e.id 
    AND ep.status != 'cancelled'
  GROUP BY e.id, e.title, e.current_participants
  ORDER BY is_consistent ASC, e.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. Synchroniser immédiatement tous les compteurs
DO $$
DECLARE
  sync_result record;
  total_updated integer := 0;
BEGIN
  RAISE NOTICE '=== Synchronisation des compteurs de participants ===';
  
  FOR sync_result IN 
    SELECT * FROM sync_all_event_participants_count()
  LOOP
    total_updated := total_updated + 1;
    RAISE NOTICE 'Event "%" (%) : % → % participants', 
      sync_result.event_title, 
      sync_result.event_id, 
      sync_result.old_count, 
      sync_result.new_count;
  END LOOP;
  
  IF total_updated = 0 THEN
    RAISE NOTICE 'Tous les compteurs sont déjà à jour !';
  ELSE
    RAISE NOTICE 'Total: % événements mis à jour', total_updated;
  END IF;
END $$;

-- 8. Afficher l'état de cohérence
DO $$
DECLARE
  check_result record;
  total_inconsistent integer := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== Vérification de cohérence ===';
  
  FOR check_result IN 
    SELECT * FROM check_participants_consistency()
    WHERE is_consistent = false
  LOOP
    total_inconsistent := total_inconsistent + 1;
    RAISE NOTICE 'INCOHÉRENCE - Event "%" : Stocké=%, Réel=%, Diff=%', 
      check_result.event_title,
      check_result.stored_count,
      check_result.real_count,
      check_result.difference;
  END LOOP;
  
  IF total_inconsistent = 0 THEN
    RAISE NOTICE '✅ Tous les compteurs sont cohérents !';
  ELSE
    RAISE NOTICE '⚠️ %  événements avec incohérence détectés', total_inconsistent;
  END IF;
END $$;

-- 9. Commentaires
COMMENT ON FUNCTION update_event_participants_count() IS 'Trigger function: Met à jour automatiquement current_participants lors d''un INSERT/UPDATE/DELETE sur event_participants';
COMMENT ON FUNCTION sync_all_event_participants_count() IS 'Synchronise manuellement tous les compteurs de participants et retourne les changements';
COMMENT ON FUNCTION check_participants_consistency() IS 'Vérifie la cohérence entre current_participants et le nombre réel de participants';

-- 10. Instructions pour utilisation manuelle
COMMENT ON TABLE public.events IS 'Pour synchroniser les compteurs manuellement: SELECT * FROM sync_all_event_participants_count();';
COMMENT ON TABLE public.event_participants IS 'Les triggers mettent à jour automatiquement events.current_participants';

