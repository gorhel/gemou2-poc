-- =====================================================
-- Script de vérification : Fonction RPC create_marketplace_conversation
-- Date: 2025-11-21
-- Description: Vérifie l'existence et la configuration de la fonction RPC
-- =====================================================

-- 1. Vérifier l'existence de la fonction
SELECT 
  '=== EXISTENCE DE LA FONCTION ===' AS section;

SELECT 
  routine_name,
  routine_type,
  data_type AS return_type,
  security_type,
  CASE 
    WHEN security_type = 'DEFINER' THEN '✅ OK - SECURITY DEFINER configuré'
    ELSE '❌ PROBLÈME - SECURITY DEFINER manquant'
  END AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_marketplace_conversation';

-- 2. Vérifier les paramètres de la fonction
SELECT 
  '=== PARAMÈTRES DE LA FONCTION ===' AS section;

SELECT 
  p.parameter_name,
  p.data_type,
  p.parameter_mode
FROM information_schema.parameters p
JOIN information_schema.routines r 
  ON p.specific_name = r.specific_name
WHERE r.routine_schema = 'public'
  AND r.routine_name = 'create_marketplace_conversation'
ORDER BY p.ordinal_position;

-- 3. Vérifier le code source de la fonction (si accessible)
SELECT 
  '=== CODE SOURCE DE LA FONCTION ===' AS section;

SELECT 
  proname AS function_name,
  pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname = 'create_marketplace_conversation'
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. Vérifier les permissions sur la fonction
SELECT 
  '=== PERMISSIONS SUR LA FONCTION ===' AS section;

SELECT 
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  CASE 
    WHEN p.prosecdef THEN '✅ SECURITY DEFINER'
    ELSE '❌ SECURITY INVOKER'
  END AS security_type,
  CASE 
    WHEN has_function_privilege('public', p.oid, 'EXECUTE') THEN '✅ EXECUTE autorisé pour public'
    ELSE '❌ EXECUTE non autorisé pour public'
  END AS execute_permission
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'create_marketplace_conversation';

-- 5. Test de la fonction (nécessite des IDs valides)
-- Décommentez et remplacez les UUIDs par des valeurs réelles pour tester
/*
SELECT 
  '=== TEST DE LA FONCTION ===' AS section;

-- Remplacez ces UUIDs par des valeurs réelles de votre base de données
DO $$
DECLARE
  test_marketplace_item_id UUID := '00000000-0000-0000-0000-000000000000'; -- Remplacez
  test_buyer_id UUID := '00000000-0000-0000-0000-000000000000'; -- Remplacez
  result UUID;
BEGIN
  SELECT create_marketplace_conversation(test_marketplace_item_id, test_buyer_id) INTO result;
  RAISE NOTICE 'Fonction exécutée avec succès. Conversation ID: %', result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''exécution: %', SQLERRM;
END $$;
*/

-- =====================================================
-- FIN DE LA VÉRIFICATION
-- =====================================================

