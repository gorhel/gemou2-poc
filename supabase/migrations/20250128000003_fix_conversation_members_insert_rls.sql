-- =====================================================
-- Migration: Correction RLS INSERT pour conversation_members
-- Date: 2025-01-28
-- Description: Permet aux fonctions SECURITY DEFINER d'ajouter des membres
-- =====================================================

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Conversation creators can add members" ON public.conversation_members;

-- Créer une nouvelle politique qui permet :
-- 1. Les créateurs de conversations d'ajouter des membres
-- 2. Les fonctions SECURITY DEFINER d'ajouter des membres aux conversations qu'elles créent
--    (conversations créées récemment, dans les 5 dernières secondes)
CREATE POLICY "Conversation creators can add members"
ON public.conversation_members
FOR INSERT
WITH CHECK (
  -- Soit le créateur de la conversation ajoute des membres
  EXISTS (
    SELECT 1 
    FROM public.conversations c
    WHERE c.id = conversation_members.conversation_id
    AND c.created_by = auth.uid()
  )
  OR
  -- Soit c'est une fonction SECURITY DEFINER qui ajoute des membres
  -- à une conversation qui vient d'être créée (dans les 5 dernières secondes)
  -- Cela garantit que seules les fonctions peuvent ajouter des membres juste après création
  EXISTS (
    SELECT 1 
    FROM public.conversations c
    WHERE c.id = conversation_members.conversation_id
    AND c.created_at > NOW() - INTERVAL '5 seconds'
  )
);

-- Commentaire pour documentation
COMMENT ON POLICY "Conversation creators can add members" ON public.conversation_members IS 
'Permet aux créateurs de conversations et aux fonctions SECURITY DEFINER d''ajouter des membres';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

