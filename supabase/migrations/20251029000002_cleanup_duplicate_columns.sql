-- Migration de nettoyage des colonnes en doublon
-- Date: 29 octobre 2025
-- Supprime les colonnes inutilisées/en doublon après vérification du code

-- ============================================
-- IMPORTANT: Cette migration est DESTRUCTIVE
-- Assurez-vous d'avoir une sauvegarde avant !
-- ============================================

-- 1. VÉRIFICATION: S'assurer qu'aucune donnée importante n'est perdue
-- Ces requêtes affichent les données qui seraient perdues

DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION PRÉ-SUPPRESSION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Vérifier events.capacity vs max_participants
  RAISE NOTICE '=== Events: capacity vs max_participants ===';
  FOR rec IN 
    SELECT 
      id,
      title,
      max_participants,
      capacity,
      CASE 
        WHEN capacity IS NULL THEN 'capacity NULL'
        WHEN max_participants = capacity THEN 'Identiques'
        ELSE 'DIFFÉRENTS ⚠️'
      END as comparison
    FROM events
    WHERE capacity IS NOT NULL
    LIMIT 10
  LOOP
    RAISE NOTICE 'Event "%": max=%, capacity=% (%)', 
      rec.title, rec.max_participants, rec.capacity, rec.comparison;
  END LOOP;
  
  -- Vérifier events.event_photo_url vs image_url
  RAISE NOTICE '';
  RAISE NOTICE '=== Events: event_photo_url vs image_url ===';
  FOR rec IN 
    SELECT 
      id,
      title,
      image_url,
      event_photo_url,
      CASE 
        WHEN event_photo_url IS NULL THEN 'event_photo_url NULL'
        WHEN image_url = event_photo_url THEN 'Identiques'
        ELSE 'DIFFÉRENTS ⚠️'
      END as comparison
    FROM events
    WHERE event_photo_url IS NOT NULL
    LIMIT 10
  LOOP
    RAISE NOTICE 'Event "%": image_url=%, event_photo_url=% (%)', 
      rec.title, rec.image_url, rec.event_photo_url, rec.comparison;
  END LOOP;
  
  -- Vérifier profiles.profile_photo_url vs avatar_url
  RAISE NOTICE '';
  RAISE NOTICE '=== Profiles: profile_photo_url vs avatar_url ===';
  FOR rec IN 
    SELECT 
      id,
      username,
      avatar_url,
      profile_photo_url,
      CASE 
        WHEN profile_photo_url IS NULL THEN 'profile_photo_url NULL'
        WHEN avatar_url = profile_photo_url THEN 'Identiques'
        ELSE 'DIFFÉRENTS ⚠️'
      END as comparison
    FROM profiles
    WHERE profile_photo_url IS NOT NULL
    LIMIT 10
  LOOP
    RAISE NOTICE 'User "%": avatar=%, profile_photo=% (%)', 
      rec.username, rec.avatar_url, rec.profile_photo_url, rec.comparison;
  END LOOP;
  
  -- Vérifier profiles.password
  RAISE NOTICE '';
  RAISE NOTICE '=== Profiles: colonne password ===';
  RAISE NOTICE 'Utilisateurs avec password renseigné: %', 
    (SELECT COUNT(*) FROM profiles WHERE password IS NOT NULL);
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- 2. COPIER LES DONNÉES SI NÉCESSAIRE
-- Avant de supprimer, copier les valeurs si les colonnes sources sont vides
-- ============================================

-- 2.1. Pour events: Si max_participants est NULL mais capacity existe, copier
UPDATE events 
SET max_participants = capacity
WHERE max_participants IS NULL 
  AND capacity IS NOT NULL;

-- 2.2. Pour events: Si image_url est NULL mais event_photo_url existe, copier
UPDATE events 
SET image_url = event_photo_url
WHERE image_url IS NULL 
  AND event_photo_url IS NOT NULL;

-- 2.3. Pour profiles: Si avatar_url est NULL mais profile_photo_url existe, copier
UPDATE profiles 
SET avatar_url = profile_photo_url
WHERE avatar_url IS NULL 
  AND profile_photo_url IS NOT NULL;

-- Afficher les résultats des copies
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== Données copiées ===';
  RAISE NOTICE 'Si des lignes étaient affectées ci-dessus, les données ont été sauvegardées.';
  RAISE NOTICE '';
END $$;

-- ============================================
-- 3. SUPPRESSION DES COLONNES EN DOUBLON
-- ============================================

-- 3.1. Supprimer events.capacity
ALTER TABLE public.events 
DROP COLUMN IF EXISTS capacity CASCADE;

-- 3.2. Supprimer events.event_photo_url
ALTER TABLE public.events 
DROP COLUMN IF EXISTS event_photo_url CASCADE;

-- 3.3. Supprimer profiles.profile_photo_url
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS profile_photo_url CASCADE;

-- 3.4. Supprimer profiles.password (colonne dangereuse et inutilisée)
-- ⚠️ Les mots de passe sont gérés par auth.users, pas par cette table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS password CASCADE;

-- ============================================
-- 4. VÉRIFICATION POST-SUPPRESSION
-- ============================================

DO $$
DECLARE
  v_events_columns text[];
  v_profiles_columns text[];
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION POST-SUPPRESSION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Lister les colonnes restantes dans events
  SELECT array_agg(column_name ORDER BY ordinal_position)
  INTO v_events_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'events';
  
  RAISE NOTICE 'Colonnes dans events: %', array_to_string(v_events_columns, ', ');
  
  -- Lister les colonnes restantes dans profiles
  SELECT array_agg(column_name ORDER BY ordinal_position)
  INTO v_profiles_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'profiles';
  
  RAISE NOTICE 'Colonnes dans profiles: %', array_to_string(v_profiles_columns, ', ');
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration terminée avec succès !';
  RAISE NOTICE '';
  RAISE NOTICE 'Colonnes supprimées:';
  RAISE NOTICE '  - events.capacity';
  RAISE NOTICE '  - events.event_photo_url';
  RAISE NOTICE '  - profiles.profile_photo_url';
  RAISE NOTICE '  - profiles.password';
  RAISE NOTICE '';
  RAISE NOTICE 'Colonnes à utiliser maintenant:';
  RAISE NOTICE '  - events.max_participants (au lieu de capacity)';
  RAISE NOTICE '  - events.image_url (au lieu de event_photo_url)';
  RAISE NOTICE '  - profiles.avatar_url (au lieu de profile_photo_url)';
  RAISE NOTICE '  - Supabase Auth pour les mots de passe (pas profiles.password)';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- 5. COMMENTAIRES ET DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.events IS 
'Événements de jeux de société. 
UTILISER: max_participants (PAS capacity), image_url (PAS event_photo_url)';

COMMENT ON TABLE public.profiles IS 
'Profils utilisateurs. 
UTILISER: avatar_url (PAS profile_photo_url). 
Les mots de passe sont dans auth.users, PAS dans profiles.';

COMMENT ON COLUMN public.events.max_participants IS 
'Nombre maximum de participants. Cette colonne est utilisée pour vérifier le quota.';

COMMENT ON COLUMN public.events.image_url IS 
'URL de l''image de l''événement. Colonne principale pour les images.';

COMMENT ON COLUMN public.profiles.avatar_url IS 
'URL de l''avatar de l''utilisateur. Colonne principale pour les avatars.';

