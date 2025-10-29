-- ========================================
-- SCRIPT POUR EXTRAIRE LE SCHÉMA COMPLET
-- Exécutez ce script dans Supabase SQL Editor
-- ========================================

-- 1. TOUTES LES TABLES
SELECT 
  '=== TABLES ===' as info,
  '' as details
UNION ALL
SELECT 
  table_name as info,
  table_type as details
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. COLONNES DE CHAQUE TABLE
SELECT 
  '' as separator,
  '=== STRUCTURE DES TABLES ===' as title
UNION ALL
SELECT 
  table_name || '.' || column_name as column_info,
  data_type || 
  CASE 
    WHEN character_maximum_length IS NOT NULL 
    THEN '(' || character_maximum_length || ')'
    ELSE ''
  END || 
  CASE 
    WHEN is_nullable = 'NO' THEN ' NOT NULL'
    ELSE ' NULL'
  END ||
  CASE 
    WHEN column_default IS NOT NULL 
    THEN ' DEFAULT ' || column_default
    ELSE ''
  END as details
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. CONTRAINTES PRIMARY KEY
SELECT 
  '' as separator,
  '=== PRIMARY KEYS ===' as title
UNION ALL
SELECT 
  tc.table_name || '.' || kcu.column_name as pk_info,
  'PRIMARY KEY' as type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY tc.table_name;

-- 4. CONTRAINTES FOREIGN KEY
SELECT 
  '' as separator,
  '=== FOREIGN KEYS ===' as title
UNION ALL
SELECT 
  tc.table_name || '.' || kcu.column_name as fk_info,
  'REFERENCES ' || ccu.table_name || '(' || ccu.column_name || ')' as reference
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;

-- 5. CONTRAINTES UNIQUE
SELECT 
  '' as separator,
  '=== UNIQUE CONSTRAINTS ===' as title
UNION ALL
SELECT 
  tc.table_name || '.' || kcu.column_name as unique_info,
  'UNIQUE' as type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name;

-- 6. CONTRAINTES CHECK
SELECT 
  '' as separator,
  '=== CHECK CONSTRAINTS ===' as title
UNION ALL
SELECT 
  tc.table_name as check_info,
  cc.check_clause as constraint
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name;

-- 7. INDEX
SELECT 
  '' as separator,
  '=== INDEX ===' as title
UNION ALL
SELECT 
  schemaname || '.' || tablename || '.' || indexname as index_info,
  indexdef as definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 8. TRIGGERS
SELECT 
  '' as separator,
  '=== TRIGGERS ===' as title
UNION ALL
SELECT 
  trigger_name || ' ON ' || event_object_table as trigger_info,
  event_manipulation || ' → ' || action_statement as action
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 9. FONCTIONS
SELECT 
  '' as separator,
  '=== FUNCTIONS ===' as title
UNION ALL
SELECT 
  routine_name as function_info,
  routine_type || ' RETURNS ' || COALESCE(data_type, 'trigger') as signature
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 10. POLITIQUES RLS (Row Level Security)
SELECT 
  '' as separator,
  '=== RLS POLICIES ===' as title
UNION ALL
SELECT 
  schemaname || '.' || tablename || '.' || policyname as policy_info,
  cmd || ' - ' || qual as details
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

