-- Script pour vérifier la structure de la table event_games existante
-- Exécutez ce script d'abord pour voir quelles colonnes existent déjà

-- Vérifier la structure de la table event_games
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_games' 
ORDER BY ordinal_position;

-- Vérifier les contraintes existantes
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'event_games';

-- Vérifier les index existants
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'event_games';

-- Vérifier les politiques RLS existantes
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'event_games';
