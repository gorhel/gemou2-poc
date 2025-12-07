-- Migration: Trigger pour les notifications push sur nouveaux messages
-- Date: 2025-12-07
-- Description: Configure un webhook pour appeler l'Edge Function lors d'un nouveau message

-- ═══════════════════════════════════════════════════════════
-- Configuration du webhook via pg_net (extension Supabase)
-- ═══════════════════════════════════════════════════════════

-- Note: Cette migration nécessite que l'extension pg_net soit activée
-- et que l'Edge Function `send-push-notification` soit déployée.
-- 
-- Alternative: Vous pouvez configurer le webhook via l'interface Supabase
-- Dashboard > Database > Webhooks > New Webhook

-- ═══════════════════════════════════════════════════════════
-- Fonction pour notifier les push notifications
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payload JSONB;
  v_supabase_url TEXT;
  v_service_key TEXT;
BEGIN
  -- Construire le payload
  v_payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'messages',
    'record', jsonb_build_object(
      'id', NEW.id,
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'content', NEW.content,
      'created_at', NEW.created_at
    )
  );

  -- Logger pour debug
  RAISE LOG 'New message notification payload: %', v_payload;

  -- Insérer dans une table de queue pour traitement asynchrone
  -- (Alternative si pg_net n'est pas disponible)
  INSERT INTO public.notification_queue (
    type,
    payload,
    created_at
  ) VALUES (
    'new_message',
    v_payload,
    NOW()
  ) ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- Table de queue pour les notifications (fallback)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour le traitement rapide
CREATE INDEX IF NOT EXISTS idx_notification_queue_unprocessed 
ON public.notification_queue(created_at) 
WHERE processed = false;

-- Commentaires
COMMENT ON TABLE public.notification_queue IS 'Queue pour les notifications push en attente de traitement';
COMMENT ON COLUMN public.notification_queue.type IS 'Type de notification (new_message, etc.)';
COMMENT ON COLUMN public.notification_queue.payload IS 'Données de la notification';

-- ═══════════════════════════════════════════════════════════
-- Créer le trigger sur la table messages
-- ═══════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- ═══════════════════════════════════════════════════════════
-- Fonction pour nettoyer les anciennes notifications traitées
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cleanup_notification_queue()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les notifications traitées de plus de 7 jours
  DELETE FROM notification_queue
  WHERE processed = true
    AND processed_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_notification_queue IS 'Nettoie les anciennes notifications traitées';

-- ═══════════════════════════════════════════════════════════
-- RLS pour notification_queue (accès restreint)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Seul le service role peut accéder à cette table
-- (pas de policy = pas d'accès pour les utilisateurs normaux)

-- ═══════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE 'Migration 20251207000002_add_message_notification_trigger terminée !';
  RAISE NOTICE 'Trigger créé: trigger_notify_new_message sur messages';
  RAISE NOTICE 'Table créée: notification_queue';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Configurez le webhook Supabase pour appeler l''Edge Function:';
  RAISE NOTICE '1. Allez dans Dashboard > Database > Webhooks';
  RAISE NOTICE '2. Créez un webhook sur INSERT de la table messages';
  RAISE NOTICE '3. URL: https://[PROJECT_REF].supabase.co/functions/v1/send-push-notification';
END $$;

