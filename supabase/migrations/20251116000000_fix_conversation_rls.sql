-- Migration pour corriger les politiques RLS des conversations
-- Date: 2025-11-16
-- Description: Ajoute les politiques manquantes pour permettre la création de conversations et l'ajout de membres

-- 1. Activer RLS sur conversation_members si pas déjà fait
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "conversation_members_viewable_by_self" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_insertable_by_creator" ON public.conversation_members;
DROP POLICY IF EXISTS "Users can view conversation members" ON public.conversation_members;
DROP POLICY IF EXISTS "Conversation creators can add members" ON public.conversation_members;

-- 3. Créer les nouvelles politiques pour conversation_members
-- Les membres peuvent voir les autres membres de leurs conversations
CREATE POLICY "Users can view conversation members"
ON public.conversation_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.conversation_members cm
    WHERE cm.conversation_id = conversation_members.conversation_id
    AND cm.user_id = auth.uid()
  )
);

-- Le créateur de la conversation peut ajouter des membres
CREATE POLICY "Conversation creators can add members"
ON public.conversation_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.conversations c
    WHERE c.id = conversation_members.conversation_id
    AND c.created_by = auth.uid()
  )
);

-- 4. Vérifier et corriger les politiques pour conversations
DROP POLICY IF EXISTS "authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversations are viewable by members" ON public.conversations;

-- Les utilisateurs authentifiés peuvent créer des conversations
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Les membres peuvent voir leurs conversations
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.conversation_members cm
    WHERE cm.conversation_id = conversations.id
    AND cm.user_id = auth.uid()
  )
);

-- 5. Vérifier et corriger les politiques pour messages
DROP POLICY IF EXISTS "messages_v2 are viewable by conversation members" ON public.messages;
DROP POLICY IF EXISTS "messages_v2 can be inserted by conversation members" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;

-- Les membres peuvent voir les messages de leurs conversations
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id
    AND cm.user_id = auth.uid()
  )
);

-- Les membres peuvent envoyer des messages dans leurs conversations
CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 
    FROM public.conversation_members cm
    WHERE cm.conversation_id = messages.conversation_id
    AND cm.user_id = auth.uid()
  )
);

-- 6. Vérifier les permissions sur les tables
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT SELECT, INSERT ON public.conversation_members TO authenticated;
GRANT SELECT, INSERT ON public.messages TO authenticated;

-- 7. Ajouter des commentaires explicatifs
COMMENT ON POLICY "Users can create conversations" ON public.conversations IS 
  'Permet aux utilisateurs authentifiés de créer des conversations où ils sont le créateur';

COMMENT ON POLICY "Conversation creators can add members" ON public.conversation_members IS 
  'Permet au créateur d''une conversation d''ajouter des membres';

COMMENT ON POLICY "Users can view messages in their conversations" ON public.messages IS 
  'Permet aux membres d''une conversation de voir tous les messages';

COMMENT ON POLICY "Users can send messages in their conversations" ON public.messages IS 
  'Permet aux membres d''une conversation d''envoyer des messages';

-- 8. Créer un index pour améliorer les performances des requêtes RLS
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id 
ON public.conversation_members(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id 
ON public.conversation_members(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by 
ON public.conversations(created_by);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
ON public.messages(sender_id);

-- Confirmer la migration
DO $$
BEGIN
  RAISE NOTICE 'Migration des politiques RLS pour les conversations terminée avec succès';
END $$;


