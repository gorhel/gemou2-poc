-- Migration pour gérer les deux tables messages (messages et messages_v2)
-- Basée sur les captures d'écran fournies

-- 1. Vérifier et créer messages_v2 si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages_v2' AND table_schema = 'public') THEN
        CREATE TABLE public.messages_v2 (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
            sender_id UUID REFERENCES public.profiles(id),
            content TEXT,
            attachments JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Table messages_v2 créée';
    ELSE
        RAISE NOTICE 'Table messages_v2 existe déjà';
    END IF;
END $$;

-- 2. Vérifier que la table conversations existe (requise pour messages_v2)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public') THEN
        CREATE TABLE public.conversations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            type TEXT NOT NULL CHECK (type IN ('direct','group','event')),
            event_id UUID REFERENCES public.events(id),
            created_by UUID REFERENCES public.profiles(id),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'Table conversations créée pour messages_v2';
    ELSE
        RAISE NOTICE 'Table conversations existe déjà';
    END IF;
END $$;

-- 3. Ajouter les colonnes manquantes à messages si nécessaire
DO $$ 
BEGIN
    -- Vérifier si messages a conversation_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
        ALTER TABLE public.messages ADD COLUMN conversation_id UUID REFERENCES public.conversations(id);
        RAISE NOTICE 'Colonne conversation_id ajoutée à messages';
    END IF;

    -- Vérifier si messages a attachments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'attachments') THEN
        ALTER TABLE public.messages ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonne attachments ajoutée à messages';
    END IF;

    RAISE NOTICE 'Table messages mise à jour';
END $$;

-- 4. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_v2_conversation_id ON public.messages_v2 (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at);
CREATE INDEX IF NOT EXISTS idx_messages_v2_created_at ON public.messages_v2 (created_at);

-- 5. Activer RLS sur les nouvelles tables
ALTER TABLE public.messages_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS pour messages_v2
DROP POLICY IF EXISTS "messages_v2 are viewable by conversation members" ON public.messages_v2;
CREATE POLICY "messages_v2 are viewable by conversation members" ON public.messages_v2
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members 
            WHERE conversation_id = messages_v2.conversation_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "messages_v2 can be inserted by conversation members" ON public.messages_v2;
CREATE POLICY "messages_v2 can be inserted by conversation members" ON public.messages_v2
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversation_members 
            WHERE conversation_id = messages_v2.conversation_id 
            AND user_id = auth.uid()
        )
    );

-- 7. Créer les politiques RLS pour conversations
DROP POLICY IF EXISTS "conversations are viewable by members" ON public.conversations;
CREATE POLICY "conversations are viewable by members" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members 
            WHERE conversation_id = conversations.id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "authenticated users can create conversations" ON public.conversations;
CREATE POLICY "authenticated users can create conversations" ON public.conversations
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- 8. Ajouter des commentaires
COMMENT ON TABLE public.messages_v2 IS 'Messages version 2 - basés sur les conversations';
COMMENT ON TABLE public.conversations IS 'Conversations pour le système de messagerie';
COMMENT ON COLUMN public.messages_v2.conversation_id IS 'ID de la conversation';
COMMENT ON COLUMN public.messages_v2.attachments IS 'Pièces jointes au message (JSON)';

-- 9. Créer une fonction pour migrer les anciens messages vers messages_v2
CREATE OR REPLACE FUNCTION migrate_messages_to_v2()
RETURNS void AS $$
BEGIN
    -- Cette fonction peut être utilisée pour migrer les anciens messages
    -- vers la nouvelle structure si nécessaire
    RAISE NOTICE 'Fonction de migration messages créée (à utiliser si nécessaire)';
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE 'Migration messages/messages_v2 terminée !';
