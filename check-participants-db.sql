-- Script de diagnostic pour vérifier l'état des compteurs de participants
-- À exécuter dans Supabase SQL Editor ou psql

-- 1. Vérifier si les triggers existent
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'event_participants'
ORDER BY trigger_name;

-- 2. Vérifier si les fonctions existent
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%participant%'
ORDER BY routine_name;

-- 3. Comparer les compteurs stockés vs réels
SELECT 
  e.id,
  e.title,
  e.current_participants as "Compteur stocké",
  COUNT(ep.id) as "Participants réels",
  CASE 
    WHEN e.current_participants = COUNT(ep.id) THEN '✅ OK'
    ELSE '❌ DÉCALAGE'
  END as "État",
  (e.current_participants - COUNT(ep.id)) as "Différence"
FROM events e
LEFT JOIN event_participants ep 
  ON ep.event_id = e.id 
  AND ep.status != 'cancelled'
GROUP BY e.id, e.title, e.current_participants
ORDER BY 
  CASE WHEN e.current_participants = COUNT(ep.id) THEN 1 ELSE 0 END,
  e.created_at DESC;

-- 4. Détails des participants par événement
SELECT 
  e.title as "Événement",
  e.current_participants as "Compteur",
  ep.id as "Participant ID",
  p.username,
  p.full_name,
  ep.status,
  ep.joined_at
FROM events e
LEFT JOIN event_participants ep ON ep.event_id = e.id
LEFT JOIN profiles p ON p.id = ep.user_id
ORDER BY e.title, ep.joined_at;

-- 5. Statistiques globales
SELECT 
  COUNT(*) as "Total événements",
  SUM(current_participants) as "Total participants (compteur)",
  COUNT(ep.id) as "Total participants (réel)",
  COUNT(DISTINCT CASE 
    WHEN e.current_participants != COUNT(ep.id) OVER (PARTITION BY e.id)
    THEN e.id 
  END) as "Événements avec décalage"
FROM events e
LEFT JOIN event_participants ep 
  ON ep.event_id = e.id 
  AND ep.status != 'cancelled';

