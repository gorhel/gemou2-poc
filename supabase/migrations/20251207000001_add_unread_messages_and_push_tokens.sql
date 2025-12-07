-- Migration: Système de messages non lus et notifications push
-- Date: 2025-12-07
-- Description: Ajoute le tracking des messages non lus et la gestion des tokens push

-- ═══════════════════════════════════════════════════════════
-- 1. Ajouter la colonne last_read_at à conversation_members
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.conversation_members
ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN public.conversation_members.last_read_at IS 'Date de dernière lecture des messages par ce membre';

-- ═══════════════════════════════════════════════════════════
-- 2. Créer la table push_tokens pour stocker les tokens de notification
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, token)
);

-- Index pour recherche rapide par utilisateur
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON public.push_tokens(is_active) WHERE is_active = true;

-- Commentaires
COMMENT ON TABLE public.push_tokens IS 'Tokens de notification push pour les utilisateurs';
COMMENT ON COLUMN public.push_tokens.token IS 'Token Expo Push ou autre service de notification';
COMMENT ON COLUMN public.push_tokens.platform IS 'Plateforme du device (ios, android, web)';
COMMENT ON COLUMN public.push_tokens.device_id IS 'Identifiant unique du device';

-- ═══════════════════════════════════════════════════════════
-- 3. Politiques RLS pour push_tokens
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres tokens
DROP POLICY IF EXISTS "Users can view their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can view their own push tokens" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres tokens
DROP POLICY IF EXISTS "Users can insert their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can insert their own push tokens" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres tokens
DROP POLICY IF EXISTS "Users can update their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can update their own push tokens" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres tokens
DROP POLICY IF EXISTS "Users can delete their own push tokens" ON public.push_tokens;
CREATE POLICY "Users can delete their own push tokens" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- 4. Fonction pour marquer les messages comme lus
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.mark_conversation_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE conversation_members
  SET last_read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$;

COMMENT ON FUNCTION public.mark_conversation_as_read IS 'Marque tous les messages d''une conversation comme lus pour un utilisateur';

-- ═══════════════════════════════════════════════════════════
-- 5. Fonction pour compter les messages non lus par conversation
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_unread_messages_count(
  p_user_id UUID
)
RETURNS TABLE (
  conversation_id UUID,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.conversation_id,
    COUNT(m.id)::BIGINT AS unread_count
  FROM conversation_members cm
  LEFT JOIN messages m ON m.conversation_id = cm.conversation_id
    AND m.created_at > COALESCE(cm.last_read_at, cm.joined_at)
    AND m.sender_id != p_user_id -- Ne pas compter ses propres messages
  WHERE cm.user_id = p_user_id
  GROUP BY cm.conversation_id
  HAVING COUNT(m.id) > 0;
END;
$$;

COMMENT ON FUNCTION public.get_unread_messages_count IS 'Retourne le nombre de messages non lus par conversation pour un utilisateur';

-- ═══════════════════════════════════════════════════════════
-- 6. Fonction pour obtenir le total des messages non lus
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_total_unread_messages(
  p_user_id UUID
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_unread BIGINT;
BEGIN
  SELECT COALESCE(SUM(unread_count), 0)::BIGINT INTO total_unread
  FROM public.get_unread_messages_count(p_user_id);
  
  RETURN total_unread;
END;
$$;

COMMENT ON FUNCTION public.get_total_unread_messages IS 'Retourne le total des messages non lus pour un utilisateur';

-- ═══════════════════════════════════════════════════════════
-- 7. Fonction pour récupérer les tokens push des membres d'une conversation
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_conversation_push_tokens(
  p_conversation_id UUID,
  p_exclude_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  token TEXT,
  platform TEXT,
  username TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.user_id,
    pt.token,
    pt.platform,
    p.username,
    p.full_name
  FROM push_tokens pt
  JOIN conversation_members cm ON cm.user_id = pt.user_id
  JOIN profiles p ON p.id = pt.user_id
  WHERE cm.conversation_id = p_conversation_id
    AND pt.is_active = true
    AND (p_exclude_user_id IS NULL OR pt.user_id != p_exclude_user_id);
END;
$$;

COMMENT ON FUNCTION public.get_conversation_push_tokens IS 'Récupère les tokens push de tous les membres d''une conversation (sauf l''utilisateur exclu)';

-- ═══════════════════════════════════════════════════════════
-- 8. Fonction pour enregistrer/mettre à jour un token push
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.upsert_push_token(
  p_user_id UUID,
  p_token TEXT,
  p_platform TEXT,
  p_device_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token_id UUID;
BEGIN
  INSERT INTO push_tokens (user_id, token, platform, device_id, is_active, updated_at)
  VALUES (p_user_id, p_token, p_platform, p_device_id, true, NOW())
  ON CONFLICT (user_id, token) 
  DO UPDATE SET 
    platform = p_platform,
    device_id = COALESCE(p_device_id, push_tokens.device_id),
    is_active = true,
    updated_at = NOW()
  RETURNING id INTO v_token_id;
  
  RETURN v_token_id;
END;
$$;

COMMENT ON FUNCTION public.upsert_push_token IS 'Enregistre ou met à jour un token push pour un utilisateur';

-- ═══════════════════════════════════════════════════════════
-- 9. Trigger pour mettre à jour updated_at sur push_tokens
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_push_tokens_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_push_tokens_updated_at ON public.push_tokens;
CREATE TRIGGER trigger_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_push_tokens_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 10. Initialiser last_read_at pour les membres existants
-- ═══════════════════════════════════════════════════════════

-- Mettre à jour last_read_at basé sur la date du dernier message lu
-- Pour les membres existants, on considère qu'ils ont lu tous les messages
UPDATE conversation_members cm
SET last_read_at = COALESCE(
  (SELECT MAX(m.created_at) 
   FROM messages m 
   WHERE m.conversation_id = cm.conversation_id),
  cm.joined_at
)
WHERE cm.last_read_at IS NULL;

-- ═══════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE 'Migration 20251207000001_add_unread_messages_and_push_tokens terminée avec succès !';
  RAISE NOTICE 'Tables créées: push_tokens';
  RAISE NOTICE 'Colonnes ajoutées: conversation_members.last_read_at';
  RAISE NOTICE 'Fonctions créées: mark_conversation_as_read, get_unread_messages_count, get_total_unread_messages, get_conversation_push_tokens, upsert_push_token';
END $$;

