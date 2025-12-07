-- ==========================================
-- FIX CONVERSATIONS - POLITIQUES RLS
-- À exécuter dans l'éditeur SQL de Supabase
-- ==========================================

-- ÉTAPE 1: Activer RLS sur conversation_members
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 2: Supprimer les anciennes politiques
DROP POLICY IF EXISTS "conversation_members_viewable_by_self" ON public.conversation_members;
DROP POLICY IF EXISTS "conversation_members_insertable_by_creator" ON public.conversation_members;
DROP POLICY IF EXISTS "Users can view conversation members" ON public.conversation_members;
DROP POLICY IF EXISTS "Conversation creators can add members" ON public.conversation_members;
DROP POLICY IF EXISTS "authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "conversations are viewable by members" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;

-- ÉTAPE 3: Créer les politiques pour conversation_members
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

-- ÉTAPE 4: Créer les politiques pour conversations
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

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

-- ÉTAPE 5: Accorder les permissions
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT SELECT, INSERT ON public.conversation_members TO authenticated;
GRANT SELECT, INSERT ON public.messages TO authenticated;

-- ÉTAPE 6: Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id 
ON public.conversation_members(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id 
ON public.conversation_members(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by 
ON public.conversations(created_by);

-- Vérifier que tout fonctionne
SELECT 'Migration terminée avec succès !' AS status;



