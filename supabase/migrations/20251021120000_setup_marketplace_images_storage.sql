-- =====================================================
-- Migration: Configuration du stockage des images marketplace
-- Date: 2025-10-21
-- Description: Configure le bucket 'marketplace-images' avec 
--              les politiques RLS appropriées
-- =====================================================

-- =====================================================
-- ÉTAPE 1: Créer le bucket pour les images marketplace
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true, -- Public pour que les images soient accessibles sans authentification
  10485760, -- 10MB limit (10 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÉTAPE 2: Supprimer les anciennes politiques si elles existent
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can upload marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own marketplace images" ON storage.objects;

-- =====================================================
-- ÉTAPE 3: Créer les politiques RLS pour le bucket
-- =====================================================

-- Politique 1: Les utilisateurs authentifiés peuvent uploader des images
CREATE POLICY "Authenticated users can upload marketplace images" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'marketplace-images' 
  AND auth.role() = 'authenticated'
);

-- Politique 2: Tout le monde peut voir les images (bucket public)
CREATE POLICY "Anyone can view marketplace images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'marketplace-images');

-- Politique 3: Les utilisateurs peuvent mettre à jour leurs propres images
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

-- Politique 4: Les utilisateurs peuvent supprimer leurs propres images
CREATE POLICY "Users can delete own marketplace images" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- ÉTAPE 4: Vérification
-- =====================================================

DO $$
DECLARE
  bucket_exists BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Vérifier que le bucket existe
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'marketplace-images'
  ) INTO bucket_exists;
  
  -- Compter les politiques créées
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%marketplace images%';
  
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '✅ Configuration du Storage Marketplace';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Bucket créé: %', bucket_exists;
  RAISE NOTICE 'Politiques RLS configurées: %', policy_count;
  RAISE NOTICE '';
  
  IF bucket_exists AND policy_count = 4 THEN
    RAISE NOTICE '🎉 SUCCESS! Le storage marketplace est prêt.';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Configuration:';
    RAISE NOTICE '  - Bucket: marketplace-images';
    RAISE NOTICE '  - Public: Oui (lecture seule)';
    RAISE NOTICE '  - Taille max: 10MB';
    RAISE NOTICE '  - Formats: JPEG, PNG, GIF, WebP';
    RAISE NOTICE '  - Upload: Utilisateurs authentifiés uniquement';
  ELSE
    RAISE WARNING '⚠️ Configuration incomplète. Vérifiez les logs.';
  END IF;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

