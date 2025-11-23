-- =====================================================
-- Script de diagnostic : État des politiques RLS pour conversations
-- Date: 2025-11-21
-- Description: Vérifie l'état actuel des politiques RLS et contraintes
--              pour identifier les différences avec les migrations locales
-- =====================================================

-- =====================================================
-- 1. VÉRIFIER LA CONTRAINTE CHECK SUR conversations.type
-- =====================================================

SELECT 
  '=== CONTRAINTE CHECK conversations.type ===' AS section;

SELECT 
  tc.constraint_name,
  tc.table_name,
  cc.check_clause,
  CASE 
    WHEN cc.check_clause LIKE '%marketplace%' THEN '✅ OK - marketplace inclus'
    ELSE '❌ PROBLÈME - marketplace manquant'
  END AS status
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'conversations'
  AND tc.constraint_type = 'CHECK'
  AND (tc.constraint_name LIKE '%type%' OR cc.check_clause LIKE '%type%');

-- =====================================================
-- 2. VÉRIFIER LES POLITIQUES RLS SUR conversations
-- =====================================================

SELECT 
  '=== POLITIQUES RLS conversations ===' AS section;

SELECT 
  tablename,
  policyname,
  cmd AS operation,
  CASE 
    WHEN cmd = 'INSERT' AND with_check LIKE '%created_by IS NOT NULL%' THEN '✅ OK - Permet SECURITY DEFINER'
    WHEN cmd = 'INSERT' AND with_check LIKE '%auth.uid() = created_by%' AND with_check NOT LIKE '%created_by IS NOT NULL%' THEN '❌ PROBLÈME - Ne permet PAS SECURITY DEFINER'
    ELSE '⚠️ À vérifier'
  END AS status,
  with_check AS condition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'conversations'
ORDER BY cmd, policyname;

-- =====================================================
-- 3. VÉRIFIER LES POLITIQUES RLS SUR conversation_members
-- =====================================================

SELECT 
  '=== POLITIQUES RLS conversation_members ===' AS section;

SELECT 
  tablename,
  policyname,
  cmd AS operation,
  CASE 
    WHEN cmd = 'INSERT' AND (with_check LIKE '%5 seconds%' OR with_check LIKE '%INTERVAL%') THEN '✅ OK - Permet SECURITY DEFINER'
    WHEN cmd = 'INSERT' AND with_check LIKE '%created_by = auth.uid()%' AND with_check NOT LIKE '%5 seconds%' THEN '❌ PROBLÈME - Ne permet PAS SECURITY DEFINER'
    ELSE '⚠️ À vérifier'
  END AS status,
  with_check AS condition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'conversation_members'
ORDER BY cmd, policyname;

-- =====================================================
-- 4. VÉRIFIER LES POLITIQUES RLS SUR marketplace_items
-- =====================================================

SELECT 
  '=== POLITIQUES RLS marketplace_items (conversations) ===' AS section;

SELECT 
  tablename,
  policyname,
  cmd AS operation,
  CASE 
    WHEN policyname LIKE '%conversation%' THEN '✅ OK - Politique pour conversations existe'
    ELSE '❌ PROBLÈME - Politique pour conversations manquante'
  END AS status,
  qual AS condition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'marketplace_items'
  AND (policyname LIKE '%conversation%' OR qual LIKE '%conversation%')
ORDER BY policyname;

-- =====================================================
-- 5. RÉSUMÉ DES PROBLÈMES IDENTIFIÉS
-- =====================================================

SELECT 
  '=== RÉSUMÉ DES PROBLÈMES ===' AS section;

WITH checks AS (
  -- Vérifier contrainte CHECK
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM information_schema.check_constraints cc
        JOIN information_schema.table_constraints tc 
          ON cc.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'conversations'
          AND tc.constraint_type = 'CHECK'
          AND cc.check_clause LIKE '%marketplace%'
      ) THEN 'OK'
      ELSE 'PROBLÈME: marketplace manquant dans contrainte CHECK'
    END AS check_constraint_status,
    
    -- Vérifier politique INSERT conversations
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM pg_policies
        WHERE tablename = 'conversations'
          AND cmd = 'INSERT'
          AND with_check LIKE '%created_by IS NOT NULL%'
      ) THEN 'OK'
      ELSE 'PROBLÈME: Politique INSERT conversations ne permet PAS SECURITY DEFINER'
    END AS conversations_insert_status,
    
    -- Vérifier politique INSERT conversation_members
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM pg_policies
        WHERE tablename = 'conversation_members'
          AND cmd = 'INSERT'
          AND (with_check LIKE '%5 seconds%' OR with_check LIKE '%INTERVAL%')
      ) THEN 'OK'
      ELSE 'PROBLÈME: Politique INSERT conversation_members ne permet PAS SECURITY DEFINER'
    END AS conversation_members_insert_status,
    
    -- Vérifier politique SELECT marketplace_items
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM pg_policies
        WHERE tablename = 'marketplace_items'
          AND policyname LIKE '%conversation%'
      ) THEN 'OK'
      ELSE 'PROBLÈME: Politique SELECT marketplace_items pour conversations manquante'
    END AS marketplace_items_select_status
)
SELECT 
  check_constraint_status,
  conversations_insert_status,
  conversation_members_insert_status,
  marketplace_items_select_status,
  CASE 
    WHEN check_constraint_status = 'OK' 
      AND conversations_insert_status = 'OK'
      AND conversation_members_insert_status = 'OK'
      AND marketplace_items_select_status = 'OK'
    THEN '✅ TOUT EST OK'
    ELSE '❌ PROBLÈMES DÉTECTÉS - Appliquer la migration 20251121000000_fix_conversations_marketplace_complete.sql'
  END AS conclusion
FROM checks;

-- =====================================================
-- 6. VÉRIFIER L'EXISTENCE DE LA FONCTION RPC
-- =====================================================

SELECT 
  '=== FONCTION RPC create_marketplace_conversation ===' AS section;

SELECT 
  routine_name,
  routine_type,
  security_type,
  CASE 
    WHEN security_type = 'DEFINER' THEN '✅ OK - SECURITY DEFINER configuré'
    ELSE '❌ PROBLÈME - SECURITY DEFINER manquant'
  END AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_marketplace_conversation';

-- =====================================================
-- FIN DU DIAGNOSTIC
-- =====================================================

