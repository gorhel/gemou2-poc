-- ⚡ FIX IMMÉDIAT: Permettre aux utilisateurs de quitter un événement
-- Problème: Politique DELETE manquante sur event_participants
-- Solution: Ajouter la politique RLS pour DELETE
-- Date: 29 octobre 2025

-- ============================================
-- ÉTAPE 1: Vérifier les politiques actuelles
-- ============================================

SELECT 
  '=== Politiques actuelles sur event_participants ===' as info;

SELECT 
  policyname as "Nom de la politique",
  cmd as "Type (SELECT/INSERT/UPDATE/DELETE)",
  CASE 
    WHEN cmd = 'DELETE' THEN '✅ DELETE autorisé'
    ELSE '⚠️ ' || cmd
  END as "Status"
FROM pg_policies
WHERE tablename = 'event_participants'
ORDER BY cmd;

-- ============================================
-- ÉTAPE 2: Ajouter la politique DELETE
-- ============================================

-- Supprimer d'abord si elle existe déjà (au cas où)
DROP POLICY IF EXISTS "Users can cancel their own participation." ON public.event_participants;
DROP POLICY IF EXISTS "Users can cancel their own participation" ON public.event_participants;
DROP POLICY IF EXISTS "Users can leave events." ON public.event_participants;
DROP POLICY IF EXISTS "Users can delete their own participation." ON public.event_participants;

-- Créer la nouvelle politique DELETE
CREATE POLICY "Users can cancel their own participation"
ON public.event_participants
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 3: Vérification
-- ============================================

SELECT 
  '=== Vérification après ajout ===' as info;

SELECT 
  policyname as "Politique",
  cmd as "Type",
  CASE 
    WHEN cmd = 'DELETE' THEN '✅ DELETE maintenant autorisé !'
    ELSE cmd
  END as "Status",
  qual as "Condition"
FROM pg_policies
WHERE tablename = 'event_participants'
ORDER BY cmd;

-- ============================================
-- ÉTAPE 4: Test (optionnel)
-- ============================================

-- Décommenter pour tester (remplacer EVENT_ID par un vrai ID)
/*
-- Voir vos participations
SELECT 
  ep.id,
  ep.event_id,
  e.title,
  ep.status,
  ep.joined_at
FROM event_participants ep
JOIN events e ON e.id = ep.event_id
WHERE ep.user_id = auth.uid();

-- Tester la suppression (ATTENTION: supprime réellement !)
-- DELETE FROM event_participants 
-- WHERE event_id = 'EVENT_ID_ICI'::uuid 
--   AND user_id = auth.uid();
*/

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Vous devriez maintenant pouvoir:
-- ✅ Rejoindre un événement (INSERT) - fonctionnait déjà
-- ✅ Quitter un événement (DELETE) - fonctionne maintenant !
-- ============================================

