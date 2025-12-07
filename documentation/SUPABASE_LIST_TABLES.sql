-- ============================================
-- Requêtes SQL pour lister les tables Supabase
-- ============================================

-- ============================================
-- 1. LISTER TOUTES LES TABLES (méthode simple)
-- ============================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 2. LISTER LES TABLES AVEC PLUS DE DÉTAILS
-- ============================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 3. LISTER LES TABLES AVEC LE NOMBRE DE COLONNES
-- ============================================
SELECT 
  t.table_name,
  COUNT(c.column_name) as nombre_colonnes
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- ============================================
-- 4. LISTER UNIQUEMENT LES TABLES AVEC REALTIME ACTIVÉ
-- ============================================
SELECT 
  schemaname,
  tablename,
  '✅ Realtime activé' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ============================================
-- 5. COMPARAISON : TABLES AVEC/SANS REALTIME
-- ============================================
SELECT 
  t.table_name,
  CASE 
    WHEN r.tablename IS NOT NULL THEN '✅ Activé'
    ELSE '❌ Non activé'
  END as realtime_status
FROM information_schema.tables t
LEFT JOIN pg_publication_tables r 
  ON t.table_name = r.tablename 
  AND r.pubname = 'supabase_realtime'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY realtime_status DESC, t.table_name;

-- ============================================
-- 6. LISTER LES TABLES AVEC LEURS COLONNES (détaillé)
-- ============================================
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;



