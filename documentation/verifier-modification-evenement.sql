-- Script pour vérifier qu'un événement a bien été modifié
-- Remplacez 'EVENT_ID_ICI' par l'ID de l'événement que vous testez

-- 1. Voir l'état actuel de l'événement
SELECT 
  id,
  title,
  description,
  date_time,
  location,
  max_participants,
  visibility,
  updated_at,
  created_at,
  creator_id
FROM events
WHERE id = 'EVENT_ID_ICI';

-- 2. Vérifier l'historique des modifications (si vous avez une table d'audit)
-- Note: Si vous n'avez pas de table d'audit, la colonne updated_at devrait changer

-- 3. Exemple pour voir tous les événements modifiés récemment (dernière heure)
SELECT 
  id,
  title,
  updated_at,
  created_at,
  CASE 
    WHEN updated_at > created_at THEN '✅ Modifié'
    ELSE '➖ Jamais modifié'
  END as statut_modification
FROM events
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;

-- 4. Comparaison avant/après (à exécuter AVANT la modification)
-- Sauvegardez le résultat, puis réexécutez après la modification
SELECT 
  id,
  title,
  description,
  location,
  max_participants,
  visibility,
  date_time,
  updated_at
FROM events
WHERE id = 'EVENT_ID_ICI';

