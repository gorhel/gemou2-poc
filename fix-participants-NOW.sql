-- ⚡ SCRIPT DE CORRECTION RAPIDE - Participants
-- Exécutez ce script dans Supabase SQL Editor
-- Il corrige immédiatement les compteurs ET installe les triggers

-- ============================================
-- ÉTAPE 1: Nettoyer tout ce qui existe
-- ============================================

-- Supprimer les triggers
DROP TRIGGER IF EXISTS trigger_update_participants_count_insert ON public.event_participants CASCADE;
DROP TRIGGER IF EXISTS trigger_update_participants_count_update ON public.event_participants CASCADE;
DROP TRIGGER IF EXISTS trigger_update_participants_count_delete ON public.event_participants CASCADE;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS update_event_participants_count() CASCADE;
DROP FUNCTION IF EXISTS sync_all_event_participants_count() CASCADE;
DROP FUNCTION IF EXISTS check_participants_consistency() CASCADE;
DROP FUNCTION IF EXISTS check_participants_count_consistency() CASCADE;
DROP FUNCTION IF EXISTS get_real_participants_count(uuid) CASCADE;

-- ============================================
-- ÉTAPE 2: Créer la fonction de trigger
-- ============================================

CREATE FUNCTION update_event_participants_count()
RETURNS TRIGGER AS $$
DECLARE
  v_event_id uuid;
  v_count integer;
BEGIN
  -- Déterminer l'event_id
  IF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
  ELSE
    v_event_id := NEW.event_id;
  END IF;

  -- Compter les participants actifs
  SELECT COUNT(*) INTO v_count
  FROM public.event_participants 
  WHERE event_id = v_event_id
    AND status != 'cancelled';

  -- Mettre à jour le compteur
  UPDATE public.events 
  SET 
    current_participants = v_count,
    updated_at = now()
  WHERE id = v_event_id;

  -- Retourner la ligne
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ÉTAPE 3: Créer les triggers
-- ============================================

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

-- ============================================
-- ÉTAPE 4: Corriger tous les compteurs existants
-- ============================================

DO $$
DECLARE
  v_event record;
  v_real_count integer;
  v_updated integer := 0;
BEGIN
  RAISE NOTICE '=== Correction des compteurs ===';
  
  FOR v_event IN 
    SELECT 
      e.id,
      e.title,
      e.current_participants as old_count,
      COUNT(ep.id) as real_count
    FROM events e
    LEFT JOIN event_participants ep 
      ON ep.event_id = e.id 
      AND ep.status != 'cancelled'
    GROUP BY e.id, e.title, e.current_participants
    HAVING e.current_participants != COUNT(ep.id)
  LOOP
    UPDATE events 
    SET 
      current_participants = v_event.real_count,
      updated_at = now()
    WHERE id = v_event.id;
    
    v_updated := v_updated + 1;
    RAISE NOTICE 'Event "%" : % → % participants', 
      v_event.title, 
      v_event.old_count, 
      v_event.real_count;
  END LOOP;
  
  IF v_updated = 0 THEN
    RAISE NOTICE '✅ Tous les compteurs sont déjà corrects !';
  ELSE
    RAISE NOTICE '✅ % événements corrigés', v_updated;
  END IF;
END $$;

-- ============================================
-- ÉTAPE 5: Vérification finale
-- ============================================

DO $$
DECLARE
  v_check record;
  v_inconsistent integer := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== Vérification finale ===';
  
  FOR v_check IN 
    SELECT 
      e.title,
      e.current_participants as stored,
      COUNT(ep.id) as real,
      CASE 
        WHEN e.current_participants = COUNT(ep.id) THEN '✅'
        ELSE '❌'
      END as status
    FROM events e
    LEFT JOIN event_participants ep 
      ON ep.event_id = e.id 
      AND ep.status != 'cancelled'
    GROUP BY e.id, e.title, e.current_participants
  LOOP
    IF v_check.stored != v_check.real THEN
      v_inconsistent := v_inconsistent + 1;
      RAISE NOTICE '❌ "%": Stocké=%, Réel=%', v_check.title, v_check.stored, v_check.real;
    ELSE
      RAISE NOTICE '✅ "%": % participants', v_check.title, v_check.stored;
    END IF;
  END LOOP;
  
  IF v_inconsistent = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TOUT EST CORRECT ! Les triggers fonctionnent maintenant.';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ %  incohérences restantes - Réexécutez le script', v_inconsistent;
  END IF;
END $$;

-- ============================================
-- ÉTAPE 6: Afficher les triggers installés
-- ============================================

SELECT 
  trigger_name as "✅ Trigger installé",
  event_manipulation as "Type"
FROM information_schema.triggers
WHERE event_object_table = 'event_participants'
ORDER BY trigger_name;

