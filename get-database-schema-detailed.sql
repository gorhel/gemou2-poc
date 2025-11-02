-- ========================================
-- SCHÉMA DÉTAILLÉ - EXPORT SQL FORMAT
-- Exécutez dans Supabase SQL Editor
-- Résultat copiable dans un fichier .sql
-- ========================================

-- EXPORT DU SCHÉMA COMPLET EN FORMAT SQL
SELECT 
  'CREATE TABLE ' || table_name || ' (' || E'\n' ||
  string_agg(
    '  ' || column_name || ' ' || 
    CASE 
      WHEN data_type = 'character varying' THEN 'varchar(' || character_maximum_length || ')'
      WHEN data_type = 'timestamp with time zone' THEN 'timestamptz'
      WHEN data_type = 'timestamp without time zone' THEN 'timestamp'
      WHEN data_type = 'USER-DEFINED' THEN udt_name
      ELSE data_type
    END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
    CASE 
      WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
      ELSE ''
    END,
    ',' || E'\n'
    ORDER BY ordinal_position
  ) || E'\n' || ');' || E'\n' as create_statement
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- DÉTAILS PAR TABLE (Plus lisible)
DO $$
DECLARE
  r record;
  c record;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SCHÉMA DE BASE DE DONNÉES COMPLET';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  FOR r IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  LOOP
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'TABLE: %', r.table_name;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    FOR c IN 
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = r.table_name
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE '  % | % | %',
        rpad(c.column_name, 30),
        rpad(
          CASE 
            WHEN c.data_type = 'character varying' 
            THEN 'varchar(' || c.character_maximum_length || ')'
            WHEN c.data_type = 'timestamp with time zone' 
            THEN 'timestamptz'
            ELSE c.data_type
          END, 
          25
        ),
        CASE 
          WHEN c.is_nullable = 'NO' THEN 'NOT NULL'
          ELSE 'NULL'
        END || 
        CASE 
          WHEN c.column_default IS NOT NULL 
          THEN ' DEFAULT ' || left(c.column_default, 40)
          ELSE ''
        END;
    END LOOP;
    
    RAISE NOTICE '';
  END LOOP;
  
  RAISE NOTICE '========================================';
END $$;

