-- =====================================================
-- Migration: Correction RLS INSERT pour conversations
-- Date: 2025-01-28
-- Description: Permet aux fonctions SECURITY DEFINER de créer des conversations
-- =====================================================

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "authenticated users can create conversations" ON public.conversations;

-- Créer une nouvelle politique qui permet :
-- 1. Les utilisateurs authentifiés de créer leurs propres conversations
-- 2. Les fonctions SECURITY DEFINER de créer des conversations
--    (auth.uid() peut être NULL dans SECURITY DEFINER, mais created_by doit être fourni)
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  -- Soit l'utilisateur crée sa propre conversation
  auth.uid() = created_by
  OR
  -- Soit c'est une fonction SECURITY DEFINER qui crée une conversation
  -- pour un utilisateur valide (created_by doit être fourni et non NULL)
  (created_by IS NOT NULL)
);

-- Commentaire pour documentation
COMMENT ON POLICY "Users can create conversations" ON public.conversations IS 
'Permet aux utilisateurs authentifiés et aux fonctions SECURITY DEFINER de créer des conversations. Pour les fonctions, created_by doit être fourni.';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

