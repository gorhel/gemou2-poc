-- =====================================================
-- SCRIPT DE DEBUG - Problème d'insertion marketplace_items
-- =====================================================
-- Copiez-collez ce script dans Supabase SQL Editor pour diagnostiquer le problème
-- =====================================================

-- 1. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'marketplace_items'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes CHECK
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'marketplace_items'
AND con.contype = 'c'
ORDER BY con.conname;

-- 3. Vérifier les politiques RLS actives
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'marketplace_items'
ORDER BY policyname;

-- 4. Test d'insertion simple (simulé)
DO $$
DECLARE
    test_user_id UUID;
    test_result RECORD;
BEGIN
    -- Récupérer un utilisateur de test
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'TEST D''INSERTION MARKETPLACE';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'User ID de test: %', test_user_id;
    
    -- Tenter une insertion de test (sans réellement insérer)
    -- On simule juste pour voir les erreurs potentielles
    
    IF test_user_id IS NULL THEN
        RAISE WARNING '❌ Aucun utilisateur trouvé dans auth.users';
        RAISE NOTICE 'Créez d''abord un compte utilisateur pour tester.';
    ELSE
        RAISE NOTICE '✅ Utilisateur trouvé';
        RAISE NOTICE '';
        RAISE NOTICE 'Test des contraintes:';
        
        -- Vérifier que seller_id existe
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'marketplace_items' 
            AND column_name = 'seller_id'
        ) THEN
            RAISE NOTICE '  ✅ Colonne seller_id existe';
        ELSE
            RAISE WARNING '  ❌ Colonne seller_id MANQUANTE';
        END IF;
        
        -- Vérifier les colonnes requises
        RAISE NOTICE '';
        RAISE NOTICE 'Colonnes NOT NULL:';
        FOR test_result IN (
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'marketplace_items' 
            AND is_nullable = 'NO'
            ORDER BY column_name
        ) LOOP
            RAISE NOTICE '  - %', test_result.column_name;
        END LOOP;
    END IF;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
END $$;

-- 5. Vérifier les valeurs autorisées pour les ENUM-like
SELECT 
    con.conname,
    pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'marketplace_items'
AND con.contype = 'c'
AND pg_get_constraintdef(con.oid) LIKE '%IN%'
ORDER BY con.conname;

-- =====================================================
-- DIAGNOSTIC COMPLET
-- =====================================================

DO $$
DECLARE
    policies_count INTEGER;
    has_seller_id BOOLEAN;
    has_game_id BOOLEAN;
    required_cols TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '📋 DIAGNOSTIC COMPLET';
    RAISE NOTICE '===========================================';
    
    -- Compter les politiques
    SELECT COUNT(*) INTO policies_count
    FROM pg_policies
    WHERE tablename = 'marketplace_items';
    
    RAISE NOTICE 'Politiques RLS: %', policies_count;
    
    -- Vérifier colonnes clés
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'seller_id'
    ) INTO has_seller_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'game_id'
    ) INTO has_game_id;
    
    RAISE NOTICE 'Colonne seller_id: %', has_seller_id;
    RAISE NOTICE 'Colonne game_id: %', has_game_id;
    
    -- Lister les colonnes requises
    SELECT string_agg(column_name, ', ') INTO required_cols
    FROM information_schema.columns 
    WHERE table_name = 'marketplace_items' 
    AND is_nullable = 'NO'
    AND column_default IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Colonnes obligatoires (NOT NULL sans défaut): %', required_cols;
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
    
    -- Recommandations
    RAISE NOTICE '📝 RECOMMANDATIONS:';
    RAISE NOTICE '';
    
    IF NOT has_seller_id THEN
        RAISE NOTICE '❌ URGENT: Exécutez FIX_SELLER_ID.sql';
    ELSE
        RAISE NOTICE '✅ seller_id OK';
    END IF;
    
    IF policies_count < 3 THEN
        RAISE WARNING '⚠️ Nombre de politiques RLS insuffisant';
        RAISE NOTICE '   Exécutez la migration 20251009120000_add_marketplace_trade_features.sql';
    ELSE
        RAISE NOTICE '✅ Politiques RLS OK';
    END IF;
    
    RAISE NOTICE '';
END $$;


