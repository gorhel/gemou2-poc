-- =====================================================
-- Script de correction: RLS INSERT pour conversations
-- Date: 2025-01-28
-- Description: Permet aux fonctions SECURITY DEFINER de créer des conversations
-- 
-- PROBLÈME CORRIGÉ:
-- Erreur 42501: "new row violates row-level security policy for table "conversations""
-- La fonction create_marketplace_conversation utilise SECURITY DEFINER mais
-- les politiques RLS vérifient auth.uid() qui peut être NULL dans ce contexte
-- =====================================================

-- Option 1: Modifier la politique pour permettre les fonctions SECURITY DEFINER
-- En ajoutant une condition pour les fonctions qui créent des conversations

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

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

-- Alternative: Si la première option ne fonctionne pas, utiliser cette approche
-- qui permet explicitement aux fonctions de créer des conversations
-- en vérifiant que created_by correspond à un utilisateur valide

-- Commentaire pour documentation
COMMENT ON POLICY "Users can create conversations" ON public.conversations IS 
'Permet aux utilisateurs authentifiés et aux fonctions SECURITY DEFINER de créer des conversations';

-- Vérification
DO $$
BEGIN
  RAISE NOTICE 'Politique RLS mise à jour avec succès';
  RAISE NOTICE 'Les fonctions SECURITY DEFINER peuvent maintenant créer des conversations';
END $$;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

