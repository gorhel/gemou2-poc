-- =====================================================
-- CORRECTION RAPIDE : Problème user_id → seller_id
-- =====================================================
-- Copiez-collez ce fichier ENTIER dans Supabase SQL Editor
-- et exécutez-le
-- =====================================================

-- ÉTAPE 1 : Vérifier la structure actuelle
DO $$
DECLARE
    has_user_id BOOLEAN;
    has_seller_id BOOLEAN;
BEGIN
    -- Vérifier si user_id existe
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'user_id'
    ) INTO has_user_id;
    
    -- Vérifier si seller_id existe
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'seller_id'
    ) INTO has_seller_id;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'État actuel de la table marketplace_items :';
    RAISE NOTICE '- user_id existe : %', has_user_id;
    RAISE NOTICE '- seller_id existe : %', has_seller_id;
    RAISE NOTICE '===========================================';
    
    -- CAS 1 : user_id existe mais pas seller_id → RENOMMER
    IF has_user_id AND NOT has_seller_id THEN
        RAISE NOTICE '🔧 RENOMMAGE de user_id en seller_id...';
        ALTER TABLE marketplace_items RENAME COLUMN user_id TO seller_id;
        RAISE NOTICE '✅ Colonne renommée avec succès !';
    
    -- CAS 2 : seller_id existe déjà → RIEN À FAIRE
    ELSIF has_seller_id THEN
        RAISE NOTICE '✅ La colonne seller_id existe déjà !';
        RAISE NOTICE 'ℹ️  Aucune action nécessaire.';
    
    -- CAS 3 : Ni user_id ni seller_id → CRÉER seller_id
    ELSE
        RAISE NOTICE '🔧 CRÉATION de la colonne seller_id...';
        ALTER TABLE marketplace_items 
        ADD COLUMN seller_id UUID REFERENCES auth.users(id);
        RAISE NOTICE '✅ Colonne créée avec succès !';
    END IF;
END $$;

-- ÉTAPE 2 : Recréer l'index (toujours)
DROP INDEX IF EXISTS idx_marketplace_items_user_id;
DROP INDEX IF EXISTS idx_marketplace_items_seller_id;
CREATE INDEX idx_marketplace_items_seller_id ON marketplace_items(seller_id);

-- ÉTAPE 3 : Vérification finale
DO $$
DECLARE
    col_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'seller_id'
    ) INTO col_exists;
    
    IF col_exists THEN
        RAISE NOTICE '';
        RAISE NOTICE '===========================================';
        RAISE NOTICE '🎉 SUCCÈS ! La colonne seller_id existe.';
        RAISE NOTICE '===========================================';
        RAISE NOTICE '';
        RAISE NOTICE '📋 Prochaines étapes :';
        RAISE NOTICE '1. Créer le bucket "marketplace-images" (si pas fait)';
        RAISE NOTICE '2. Tester /create-trade';
        RAISE NOTICE '3. Créer une annonce';
        RAISE NOTICE '';
    ELSE
        RAISE EXCEPTION '❌ ERREUR : seller_id n''existe toujours pas !';
    END IF;
END $$;

-- Afficher la structure finale
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'marketplace_items'
AND column_name IN ('seller_id', 'user_id')
ORDER BY column_name;







