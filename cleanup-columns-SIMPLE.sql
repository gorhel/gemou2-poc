-- ============================================
-- MIGRATION SIMPLIFIÉE - Nettoyage des colonnes en doublon
-- Version corrigée et simplifiée
-- Date: 29 octobre 2025
-- ============================================

-- ÉTAPE 1: Copier les données si nécessaire (sécurité)
-- Si max_participants est NULL mais capacity existe, copier
UPDATE events 
SET max_participants = capacity
WHERE max_participants IS NULL 
  AND capacity IS NOT NULL;

-- Si image_url est NULL mais event_photo_url existe, copier
UPDATE events 
SET image_url = event_photo_url
WHERE image_url IS NULL 
  AND event_photo_url IS NOT NULL;

-- Si avatar_url est NULL mais profile_photo_url existe, copier
UPDATE profiles 
SET avatar_url = profile_photo_url
WHERE avatar_url IS NULL 
  AND profile_photo_url IS NOT NULL;

-- ÉTAPE 2: Afficher ce qui sera supprimé (info)
SELECT 
  COUNT(*) as events_avec_capacity,
  'events.capacity sera supprimé' as info
FROM events 
WHERE capacity IS NOT NULL;

SELECT 
  COUNT(*) as events_avec_event_photo_url,
  'events.event_photo_url sera supprimé' as info
FROM events 
WHERE event_photo_url IS NOT NULL;

SELECT 
  COUNT(*) as profiles_avec_profile_photo_url,
  'profiles.profile_photo_url sera supprimé' as info
FROM profiles 
WHERE profile_photo_url IS NOT NULL;

SELECT 
  COUNT(*) as profiles_avec_password,
  '⚠️  profiles.password sera supprimé (SÉCURITÉ)' as info
FROM profiles 
WHERE password IS NOT NULL;

-- ÉTAPE 3: Suppression des colonnes
ALTER TABLE public.events 
DROP COLUMN IF EXISTS capacity CASCADE;

ALTER TABLE public.events 
DROP COLUMN IF EXISTS event_photo_url CASCADE;

ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS profile_photo_url CASCADE;

ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS password CASCADE;

-- ÉTAPE 4: Vérification finale
SELECT 
  'events' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'events'
ORDER BY ordinal_position;

SELECT 
  'profiles' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ÉTAPE 5: Ajouter des commentaires
COMMENT ON TABLE public.events IS 
'Événements de jeux de société. UTILISER: max_participants, image_url';

COMMENT ON TABLE public.profiles IS 
'Profils utilisateurs. UTILISER: avatar_url. Mots de passe dans auth.users.';

COMMENT ON COLUMN public.events.max_participants IS 
'Nombre maximum de participants (anciennement capacity)';

COMMENT ON COLUMN public.events.image_url IS 
'URL de l''image de l''événement (anciennement event_photo_url)';

COMMENT ON COLUMN public.profiles.avatar_url IS 
'URL de l''avatar (anciennement profile_photo_url)';

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
-- Colonnes supprimées:
--   ✅ events.capacity
--   ✅ events.event_photo_url
--   ✅ profiles.profile_photo_url
--   ✅ profiles.password
-- ============================================

