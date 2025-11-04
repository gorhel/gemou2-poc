-- =============================================================================
-- REQUÊTES DE DIAGNOSTIC - BASE DE DONNÉES SUPABASE
-- Date : 4 novembre 2025
-- Objectif : Vérifier l'état actuel avant d'appliquer les migrations friends
-- =============================================================================

-- Instructions :
-- 1. Ouvrir https://supabase.com/dashboard/project/qpnofwgxjgvmpwdrhzid/sql/new
-- 2. Copier-coller chaque requête une par une
-- 3. Exécuter et noter les résultats
-- 4. Partager les résultats pour obtenir le script SQL exact à appliquer

-- =============================================================================
-- REQUÊTE 1 : Lister toutes les tables existantes
-- =============================================================================
-- Cette requête liste toutes les tables dans le schéma public
-- Résultat attendu : Liste de tables (profiles, events, marketplace_items, etc.)

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;


-- =============================================================================
-- REQUÊTE 2 : Vérifier l'existence des tables friends et locations
-- =============================================================================
-- Cette requête vérifie si les tables friends et locations existent
-- Résultat attendu : 
--   friends_exists: true ou false
--   locations_exists: true ou false

SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'friends'
  ) as friends_exists,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'locations'
  ) as locations_exists;


-- =============================================================================
-- REQUÊTE 3 : Vérifier les fonctions RPC pour le système d'amitié
-- =============================================================================
-- Cette requête liste les fonctions RPC liées aux amis
-- Résultat attendu : Liste vide ou contenant :
--   - send_friend_request
--   - accept_friend_request
--   - reject_friend_request
--   - remove_friend
--   - check_friend_request_limit

SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'send_friend_request',
    'accept_friend_request',
    'reject_friend_request',
    'remove_friend',
    'check_friend_request_limit'
  )
ORDER BY routine_name;


-- =============================================================================
-- REQUÊTE 4 : Vérifier les colonnes de confidentialité dans profiles
-- =============================================================================
-- Cette requête liste les colonnes liées aux amis dans la table profiles
-- Résultat attendu : Liste vide ou contenant :
--   - friends_list_public
--   - notify_friend_request_inapp
--   - notify_friend_request_push
--   - notify_friend_request_email
--   - notify_friend_accepted_inapp
--   - notify_friend_accepted_push
--   - notify_friend_accepted_email

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name LIKE '%friend%'
ORDER BY column_name;


-- =============================================================================
-- REQUÊTE BONUS : Vérifier la structure de la table friends (si elle existe)
-- =============================================================================
-- Cette requête affiche la structure complète de la table friends
-- À exécuter SEULEMENT si la requête 2 montre que friends existe

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'friends'
ORDER BY ordinal_position;


-- =============================================================================
-- REQUÊTE BONUS : Vérifier les contraintes de la table friends (si elle existe)
-- =============================================================================
-- Cette requête liste les contraintes sur la table friends
-- À exécuter SEULEMENT si la requête 2 montre que friends existe

SELECT 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
  AND table_name = 'friends'
ORDER BY constraint_type, constraint_name;


-- =============================================================================
-- REQUÊTE BONUS : Compter les données dans les tables principales
-- =============================================================================
-- Cette requête compte le nombre de lignes dans chaque table
-- Utile pour comprendre l'état actuel de la base

SELECT 
  'profiles' as table_name, 
  COUNT(*) as row_count 
FROM profiles
UNION ALL
SELECT 
  'events', 
  COUNT(*) 
FROM events
UNION ALL
SELECT 
  'marketplace_items', 
  COUNT(*) 
FROM marketplace_items
UNION ALL
SELECT 
  'friends', 
  COUNT(*) 
FROM friends
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'friends'
)
UNION ALL
SELECT 
  'locations', 
  COUNT(*) 
FROM locations
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'locations'
)
ORDER BY table_name;


-- =============================================================================
-- FIN DES REQUÊTES DE DIAGNOSTIC
-- =============================================================================

-- PROCHAINES ÉTAPES :
-- 
-- 1. Exécuter les requêtes 1 à 4 (obligatoires)
-- 2. Noter tous les résultats
-- 3. Partager les résultats avec l'assistant IA
-- 4. Recevoir le script SQL exact à appliquer selon votre situation
-- 
-- ⚠️ NE PAS APPLIQUER DE MIGRATIONS AVANT D'AVOIR LES RÉSULTATS !
-- 
-- Questions à répondre après le diagnostic :
-- - La table friends existe-t-elle ? (Requête 2)
-- - La table locations existe-t-elle ? (Requête 2)
-- - Les fonctions RPC existent-elles ? (Requête 3)
-- - Les colonnes de confidentialité existent-elles ? (Requête 4)
-- 
-- En fonction des réponses, nous saurons exactement quoi appliquer.
-- =============================================================================

