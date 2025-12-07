-- Migration : Création de la table user_settings pour les paramètres utilisateur
-- Date: 2025-11-22
-- Description: Crée la table user_settings avec tous les paramètres de profil, confidentialité, notifications, préférences et sécurité

-- 1. Créer la table user_settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Paramètres de confidentialité
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  allow_friend_requests TEXT DEFAULT 'all' CHECK (allow_friend_requests IN ('all', 'friends_only')),
  email_visibility TEXT DEFAULT 'private' CHECK (email_visibility IN ('public', 'friends', 'private')),
  location_visibility TEXT DEFAULT 'friends' CHECK (location_visibility IN ('public', 'friends', 'private')),
  games_collection_visibility TEXT DEFAULT 'public' CHECK (games_collection_visibility IN ('public', 'friends', 'private')),
  
  -- Notifications - Demandes d'amitié (existent déjà dans profiles, mais on les met aussi ici pour cohérence)
  notify_friend_request_inapp BOOLEAN DEFAULT true,
  notify_friend_request_push BOOLEAN DEFAULT true,
  notify_friend_request_email BOOLEAN DEFAULT false,
  
  -- Notifications - Acceptations d'amitié
  notify_friend_accepted_inapp BOOLEAN DEFAULT true,
  notify_friend_accepted_push BOOLEAN DEFAULT true,
  notify_friend_accepted_email BOOLEAN DEFAULT false,
  
  -- Notifications - Événements
  notify_events_inapp BOOLEAN DEFAULT true,
  notify_events_push BOOLEAN DEFAULT true,
  notify_events_email BOOLEAN DEFAULT false,
  notify_event_invitations_inapp BOOLEAN DEFAULT true,
  notify_event_invitations_push BOOLEAN DEFAULT true,
  notify_event_invitations_email BOOLEAN DEFAULT false,
  notify_event_reminders_inapp BOOLEAN DEFAULT true,
  notify_event_reminders_push BOOLEAN DEFAULT true,
  notify_event_reminders_email BOOLEAN DEFAULT false,
  notify_event_updates_inapp BOOLEAN DEFAULT true,
  notify_event_updates_push BOOLEAN DEFAULT true,
  notify_event_updates_email BOOLEAN DEFAULT false,
  
  -- Notifications - Messages
  notify_messages_inapp BOOLEAN DEFAULT true,
  notify_messages_push BOOLEAN DEFAULT true,
  notify_messages_email BOOLEAN DEFAULT false,
  notify_message_replies_inapp BOOLEAN DEFAULT true,
  notify_message_replies_push BOOLEAN DEFAULT true,
  notify_message_replies_email BOOLEAN DEFAULT false,
  notify_message_mentions_inapp BOOLEAN DEFAULT true,
  notify_message_mentions_push BOOLEAN DEFAULT true,
  notify_message_mentions_email BOOLEAN DEFAULT false,
  
  -- Notifications - Activité
  notify_activity_comments_inapp BOOLEAN DEFAULT true,
  notify_activity_comments_push BOOLEAN DEFAULT true,
  notify_activity_comments_email BOOLEAN DEFAULT false,
  notify_activity_reviews_inapp BOOLEAN DEFAULT true,
  notify_activity_reviews_push BOOLEAN DEFAULT true,
  notify_activity_reviews_email BOOLEAN DEFAULT false,
  notify_activity_games_added_inapp BOOLEAN DEFAULT true,
  notify_activity_games_added_push BOOLEAN DEFAULT true,
  notify_activity_games_added_email BOOLEAN DEFAULT false,
  
  -- Notifications - Marketplace
  notify_marketplace_new_offers_inapp BOOLEAN DEFAULT true,
  notify_marketplace_new_offers_push BOOLEAN DEFAULT true,
  notify_marketplace_new_offers_email BOOLEAN DEFAULT false,
  notify_marketplace_messages_inapp BOOLEAN DEFAULT true,
  notify_marketplace_messages_push BOOLEAN DEFAULT true,
  notify_marketplace_messages_email BOOLEAN DEFAULT false,
  
  -- Préférences d'application
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'es', 'de', 'it')),
  timezone TEXT DEFAULT 'Europe/Paris',
  date_format TEXT DEFAULT 'DD/MM/YYYY' CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
  distance_unit TEXT DEFAULT 'km' CHECK (distance_unit IN ('km', 'miles')),
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  
  -- Paramètres d'affichage (web uniquement)
  display_density TEXT DEFAULT 'normal' CHECK (display_density IN ('compact', 'normal', 'spacious')),
  font_size TEXT DEFAULT 'normal' CHECK (font_size IN ('small', 'normal', 'large', 'extra-large')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Créer un index sur user_id pour les performances
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- 3. Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer un trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- 5. Activer RLS sur la table
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS
-- Les utilisateurs peuvent voir leurs propres paramètres
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres paramètres
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
CREATE POLICY "Users can create their own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres paramètres
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Fonction pour créer automatiquement les paramètres par défaut lors de la création d'un profil
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer un trigger pour créer automatiquement les paramètres par défaut
DROP TRIGGER IF EXISTS trigger_create_default_user_settings ON public.profiles;
CREATE TRIGGER trigger_create_default_user_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- 9. Migrer les données existantes depuis profiles vers user_settings
-- Synchroniser les paramètres de notifications existants dans profiles
INSERT INTO public.user_settings (user_id, 
  notify_friend_request_inapp,
  notify_friend_request_push,
  notify_friend_request_email,
  notify_friend_accepted_inapp,
  notify_friend_accepted_push,
  notify_friend_accepted_email)
SELECT 
  id,
  COALESCE(notify_friend_request_inapp, true),
  COALESCE(notify_friend_request_push, true),
  COALESCE(notify_friend_request_email, false),
  COALESCE(notify_friend_accepted_inapp, true),
  COALESCE(notify_friend_accepted_push, true),
  COALESCE(notify_friend_accepted_email, false)
FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_settings)
ON CONFLICT (user_id) DO UPDATE SET
  notify_friend_request_inapp = EXCLUDED.notify_friend_request_inapp,
  notify_friend_request_push = EXCLUDED.notify_friend_request_push,
  notify_friend_request_email = EXCLUDED.notify_friend_request_email,
  notify_friend_accepted_inapp = EXCLUDED.notify_friend_accepted_inapp,
  notify_friend_accepted_push = EXCLUDED.notify_friend_accepted_push,
  notify_friend_accepted_email = EXCLUDED.notify_friend_accepted_email;

-- 10. Commentaires pour la documentation
COMMENT ON TABLE public.user_settings IS 'Table contenant tous les paramètres utilisateur : confidentialité, notifications, préférences et affichage';
COMMENT ON COLUMN public.user_settings.profile_visibility IS 'Visibilité du profil : public, friends, private';
COMMENT ON COLUMN public.user_settings.allow_friend_requests IS 'Qui peut envoyer des demandes d''amitié : all, friends_only';
COMMENT ON COLUMN public.user_settings.email_visibility IS 'Visibilité de l''email : public, friends, private';
COMMENT ON COLUMN public.user_settings.location_visibility IS 'Visibilité de la localisation : public, friends, private';
COMMENT ON COLUMN public.user_settings.games_collection_visibility IS 'Visibilité de la collection de jeux : public, friends, private';
COMMENT ON COLUMN public.user_settings.language IS 'Langue de l''interface : fr, en, es, de, it';
COMMENT ON COLUMN public.user_settings.timezone IS 'Fuseau horaire de l''utilisateur';
COMMENT ON COLUMN public.user_settings.date_format IS 'Format de date préféré : DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD';
COMMENT ON COLUMN public.user_settings.distance_unit IS 'Unité de distance : km, miles';
COMMENT ON COLUMN public.user_settings.theme IS 'Thème d''affichage : light, dark, auto';
COMMENT ON COLUMN public.user_settings.display_density IS 'Densité d''affichage : compact, normal, spacious';
COMMENT ON COLUMN public.user_settings.font_size IS 'Taille de la police : small, normal, large, extra-large';


