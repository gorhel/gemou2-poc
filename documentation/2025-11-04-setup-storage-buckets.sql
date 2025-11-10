-- =====================================================
-- Script de création des buckets Storage
-- Date: 4 novembre 2025
-- Description: Crée les buckets event-images et marketplace-images
--              avec toutes les politiques RLS nécessaires
-- =====================================================
--
-- INSTRUCTIONS D'EXÉCUTION:
-- 1. Ouvrir https://supabase.com/dashboard
-- 2. Sélectionner votre projet
-- 3. Aller dans "SQL Editor"
-- 4. Cliquer sur "New Query"
-- 5. Copier-coller ce script complet
-- 6. Cliquer sur "Run" (ou Ctrl+Enter)
-- 7. Vérifier les messages de succès
--
-- =====================================================

BEGIN;

-- =====================================================
-- PARTIE 1: BUCKET EVENT-IMAGES
-- =====================================================

-- Créer le bucket pour les images d'événements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques si elles existent (event-images)
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Event creators can delete their images" ON storage.objects;

-- Politique 1: Upload (authentifiés uniquement)
CREATE POLICY "Authenticated users can upload event images" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- Politique 2: Lecture (tout le monde)
CREATE POLICY "Anyone can view event images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'event-images');

-- Politique 3: Suppression (propriétaire uniquement)
CREATE POLICY "Event creators can delete their images" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'event-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- PARTIE 2: BUCKET MARKETPLACE-IMAGES
-- =====================================================

-- Créer le bucket pour les images marketplace
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true, -- Public pour que les images soient accessibles sans authentification
  10485760, -- 10MB limit (10 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques si elles existent (marketplace-images)
DROP POLICY IF EXISTS "Authenticated users can upload marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own marketplace images" ON storage.objects;

-- Politique 1: Upload (authentifiés uniquement)
CREATE POLICY "Authenticated users can upload marketplace images" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'marketplace-images' 
  AND auth.role() = 'authenticated'
);

-- Politique 2: Lecture (tout le monde)
CREATE POLICY "Anyone can view marketplace images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'marketplace-images');

-- Politique 3: Mise à jour (propriétaire uniquement)
CREATE POLICY "Users can update own marketplace images" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique 4: Suppression (propriétaire uniquement)
CREATE POLICY "Users can delete own marketplace images" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- PARTIE 3: VÉRIFICATION
-- =====================================================

DO $$
DECLARE
  event_bucket_exists BOOLEAN;
  marketplace_bucket_exists BOOLEAN;
  event_policy_count INTEGER;
  marketplace_policy_count INTEGER;
BEGIN
  -- Vérifier que les buckets existent
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'event-images'
  ) INTO event_bucket_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'marketplace-images'
  ) INTO marketplace_bucket_exists;
  
  -- Compter les politiques créées
  SELECT COUNT(*) INTO event_policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%event images%';
    
  SELECT COUNT(*) INTO marketplace_policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%marketplace images%';
  
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '✅ Configuration des Buckets Storage';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📦 EVENT-IMAGES:';
  RAISE NOTICE '   Bucket créé: %', event_bucket_exists;
  RAISE NOTICE '   Politiques RLS: % (attendu: 3)', event_policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '📦 MARKETPLACE-IMAGES:';
  RAISE NOTICE '   Bucket créé: %', marketplace_bucket_exists;
  RAISE NOTICE '   Politiques RLS: % (attendu: 4)', marketplace_policy_count;
  RAISE NOTICE '';
  
  IF event_bucket_exists AND marketplace_bucket_exists 
     AND event_policy_count = 3 AND marketplace_policy_count = 4 THEN
    RAISE NOTICE '🎉 SUCCESS! Les deux buckets sont configurés correctement.';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Résumé de la configuration:';
    RAISE NOTICE '';
    RAISE NOTICE '1️⃣  EVENT-IMAGES:';
    RAISE NOTICE '   - Taille max: 5MB';
    RAISE NOTICE '   - Formats: JPEG, PNG, GIF, WebP';
    RAISE NOTICE '   - Public: Oui (lecture seule)';
    RAISE NOTICE '   - Upload: Authentifiés uniquement';
    RAISE NOTICE '   - Organisation: {userId}/filename.ext';
    RAISE NOTICE '';
    RAISE NOTICE '2️⃣  MARKETPLACE-IMAGES:';
    RAISE NOTICE '   - Taille max: 10MB';
    RAISE NOTICE '   - Formats: JPEG, JPG, PNG, GIF, WebP';
    RAISE NOTICE '   - Public: Oui (lecture seule)';
    RAISE NOTICE '   - Upload: Authentifiés uniquement';
    RAISE NOTICE '   - Organisation: {userId}/filename.ext';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Vous pouvez maintenant uploader des images!';
  ELSE
    RAISE WARNING '⚠️  Configuration incomplète. Vérifiez les logs ci-dessus.';
  END IF;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
END $$;

COMMIT;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================




