-- Script de correction manuelle des compteurs de participants
-- À exécuter si les triggers ne fonctionnent pas automatiquement

-- ÉTAPE 1: Diagnostiquer le problème
SELECT 
  e.id,
  e.title,
  e.current_participants as old_count,
  COUNT(ep.id) as real_count,
  COUNT(ep.id) - e.current_participants as difference
FROM events e
LEFT JOIN event_participants ep 
  ON ep.event_id = e.id 
  AND ep.status != 'cancelled'
GROUP BY e.id, e.title, e.current_participants
HAVING e.current_participants != COUNT(ep.id)
ORDER BY difference DESC;

-- ÉTAPE 2: Corriger tous les compteurs
UPDATE events e
SET 
  current_participants = (
    SELECT COUNT(*) 
    FROM event_participants ep
    WHERE ep.event_id = e.id 
      AND ep.status != 'cancelled'
  ),
  updated_at = now()
WHERE TRUE;

-- ÉTAPE 3: Vérifier le résultat
SELECT 
  e.id,
  e.title,
  e.current_participants as "Compteur mis à jour",
  COUNT(ep.id) as "Participants réels",
  CASE 
    WHEN e.current_participants = COUNT(ep.id) THEN '✅ Synchronisé'
    ELSE '❌ Encore un problème'
  END as "État"
FROM events e
LEFT JOIN event_participants ep 
  ON ep.event_id = e.id 
  AND ep.status != 'cancelled'
GROUP BY e.id, e.title, e.current_participants
ORDER BY e.created_at DESC;

-- ÉTAPE 4: Test d'insertion (optionnel - pour tester les triggers)
-- Remplacez les UUIDs par des valeurs valides de votre base
/*
-- Récupérer un event_id et user_id valides
SELECT id FROM events LIMIT 1; -- Copier un ID d'événement
SELECT id FROM profiles LIMIT 1; -- Copier un ID d'utilisateur

-- Tester l'insertion
INSERT INTO event_participants (event_id, user_id, status)
VALUES (
  'VOTRE_EVENT_ID_ICI'::uuid,
  'VOTRE_USER_ID_ICI'::uuid,
  'registered'
);

-- Vérifier si current_participants a été incrémenté automatiquement
SELECT id, title, current_participants 
FROM events 
WHERE id = 'VOTRE_EVENT_ID_ICI'::uuid;

-- Nettoyer le test
DELETE FROM event_participants 
WHERE event_id = 'VOTRE_EVENT_ID_ICI'::uuid 
  AND user_id = 'VOTRE_USER_ID_ICI'::uuid;
*/

