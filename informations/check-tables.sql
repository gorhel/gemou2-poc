-- Script SQL pour vérifier la structure des tables sur le cloud
-- À exécuter dans le Dashboard Supabase > SQL Editor

-- 1. Vérifier la structure de user_games
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_games' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier s'il y a une table messages_2
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%messages%'
ORDER BY table_name;

-- 3. Comparer les colonnes de messages et messages_2
SELECT 
    'messages' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'

UNION ALL

SELECT 
    'messages_2' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'messages_2' 
AND table_schema = 'public'
ORDER BY table_name, column_name;

-- 4. Vérifier toutes les tables existantes
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
