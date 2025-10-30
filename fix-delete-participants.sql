-- Fix: Impossible de quitter un événement
-- Problème: Manque de politique RLS pour DELETE sur event_participants
-- Date: 29 octobre 2025

-- 1. Vérifier les politiques actuelles
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'event_participants'
ORDER BY cmd;

-- 2. Ajouter la politique DELETE manquante
-- Permet aux utilisateurs de supprimer leur propre participation

-- Supprimer d'abord si elle existe (au cas où)
DROP POLICY IF EXISTS "Users can cancel their own participation." ON public.event_participants;
DROP POLICY IF EXISTS "Users can leave events." ON public.event_participants;

-- Créer la nouvelle politique
CREATE POLICY "Users can cancel their own participation" 
ON public.event_participants
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 3. Vérifier que la politique est créée
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'event_participants'
  AND cmd = 'DELETE';

-- 4. Tester (remplacer les IDs par des valeurs réelles)
-- SELECT * FROM event_participants WHERE user_id = auth.uid();
-- DELETE FROM event_participants WHERE event_id = 'EVENT_ID' AND user_id = auth.uid();

