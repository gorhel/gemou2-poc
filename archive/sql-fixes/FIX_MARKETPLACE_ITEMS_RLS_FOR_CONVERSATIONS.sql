-- =====================================================
-- Script de correction: RLS marketplace_items pour conversations
-- Date: 2025-01-28
-- Description: Permet aux membres d'une conversation marketplace
--              de voir l'annonce associée même si elle n'est pas 'available'
-- 
-- PROBLÈME CORRIGÉ:
-- Les conversations marketplace ne s'affichaient pas car les politiques RLS
-- empêchaient la lecture des marketplace_items lors du join depuis conversations
-- =====================================================

-- Supprimer la politique si elle existe déjà
DROP POLICY IF EXISTS "Conversation members can view marketplace items" ON public.marketplace_items;

-- Ajouter une politique pour permettre aux membres d'une conversation marketplace
-- de voir l'annonce associée
CREATE POLICY "Conversation members can view marketplace items"
ON public.marketplace_items
FOR SELECT
USING (
  -- L'annonce est visible si :
  -- 1. Elle est disponible (politique existante)
  status = 'available'
  OR
  -- 2. L'utilisateur est le vendeur (politique existante)
  auth.uid() = seller_id
  OR
  -- 3. L'utilisateur est membre d'une conversation liée à cette annonce
  EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN public.conversation_members cm ON c.id = cm.conversation_id
    WHERE c.marketplace_item_id = marketplace_items.id
      AND cm.user_id = auth.uid()
      AND c.type = 'marketplace'
  )
);

-- Vérification
DO $$
BEGIN
  RAISE NOTICE 'Politique RLS créée avec succès';
  RAISE NOTICE 'Les membres de conversations marketplace peuvent maintenant voir les annonces associées';
END $$;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

