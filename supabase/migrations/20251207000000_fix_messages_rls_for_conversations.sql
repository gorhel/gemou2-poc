-- Migration: Correction définitive des politiques RLS pour les messages dans les conversations
-- Date: 2025-12-07
-- Problème: L'ancienne politique "Users can view messages they sent or received" 
--           empêche les membres d'une conversation de voir les messages des autres participants
-- Solution: Supprimer l'ancienne politique et s'assurer que la nouvelle politique basée sur 
--           conversation_members est la seule active

-- =====================================================
-- ÉTAPE 1: Supprimer TOUTES les anciennes politiques SELECT sur messages
-- =====================================================

-- Supprimer l'ancienne politique qui ne vérifie que sender_id/receiver_id
DROP POLICY IF EXISTS "Users can view messages they sent or received." ON public.messages;

-- Supprimer d'autres politiques potentiellement conflictuelles
DROP POLICY IF EXISTS "messages_v2 are viewable by conversation members" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Messages are viewable by conversation members" ON public.messages;

-- =====================================================
-- ÉTAPE 2: Créer la politique correcte pour les messages
-- =====================================================

-- Les membres d'une conversation peuvent voir TOUS les messages de cette conversation
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  -- Vérifier que l'utilisateur est membre de la conversation du message
  EXISTS (
    SELECT 1 
    FROM public.conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id
    AND cm.user_id = auth.uid()
  )
  -- OU le message n'a pas de conversation_id (ancien système de messages directs)
  OR (
    messages.conversation_id IS NULL 
    AND (auth.uid() = messages.sender_id OR auth.uid() = messages.receiver_id)
  )
);

-- =====================================================
-- ÉTAPE 3: Vérifier/Recréer la politique INSERT
-- =====================================================

DROP POLICY IF EXISTS "Users can insert their own messages." ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

-- Les membres peuvent envoyer des messages dans leurs conversations
CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND (
    -- Pour les messages avec conversation_id, vérifier l'appartenance
    EXISTS (
      SELECT 1 
      FROM public.conversation_members cm
      WHERE cm.conversation_id = messages.conversation_id
      AND cm.user_id = auth.uid()
    )
    -- OU pour les anciens messages directs sans conversation_id
    OR messages.conversation_id IS NULL
  )
);

-- =====================================================
-- ÉTAPE 4: S'assurer que RLS est activé
-- =====================================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ÉTAPE 5: Accorder les permissions nécessaires
-- =====================================================

GRANT SELECT, INSERT ON public.messages TO authenticated;

-- =====================================================
-- ÉTAPE 6: Créer des index pour améliorer les performances
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON public.messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_id 
ON public.messages(receiver_id);

-- =====================================================
-- ÉTAPE 7: Ajouter des commentaires explicatifs
-- =====================================================

COMMENT ON POLICY "Users can view messages in their conversations" ON public.messages IS 
  'Permet aux membres d''une conversation de voir TOUS les messages de cette conversation, pas seulement les leurs';

COMMENT ON POLICY "Users can send messages in their conversations" ON public.messages IS 
  'Permet aux membres d''une conversation d''envoyer des messages';

-- =====================================================
-- Confirmer la migration
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration des politiques RLS pour les messages terminée';
  RAISE NOTICE '   - Ancienne politique "sender_id/receiver_id" supprimée';
  RAISE NOTICE '   - Nouvelle politique basée sur conversation_members créée';
  RAISE NOTICE '   - Tous les membres peuvent maintenant voir tous les messages de la conversation';
END $$;

