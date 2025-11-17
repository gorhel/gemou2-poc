-- Script de diagnostic et correction pour les tags
-- Ce script vérifie l'état des tags et les réinsère si nécessaire

\echo '=========================================='
\echo 'DIAGNOSTIC DES TAGS'
\echo '=========================================='

-- 1. Vérifier le type de tags.id
\echo '\n1. Type de la colonne tags.id:'
SELECT data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tags' 
  AND column_name = 'id';

-- 2. Compter les tags
\echo '\n2. Nombre de tags dans la base:'
SELECT COUNT(*) as total_tags FROM public.tags;

-- 3. Lister tous les tags
\echo '\n3. Liste complète des tags:'
SELECT id, name, created_at 
FROM public.tags 
ORDER BY id;

-- 4. Vérifier les tables liées
\echo '\n4. Statistiques des tables liées:'
SELECT 
  'event_tags' as table_name,
  COUNT(*) as count
FROM public.event_tags
UNION ALL
SELECT 
  'game_tags' as table_name,
  COUNT(*) as count
FROM public.game_tags
UNION ALL
SELECT 
  'user_tags' as table_name,
  COUNT(*) as count
FROM public.user_tags;

-- 5. Réinsérer les tags prédéfinis si nécessaire
\echo '\n5. Insertion des tags prédéfinis (si manquants):'
INSERT INTO public.tags (name) VALUES
  ('Compétitif'),
  ('Décontracté'),
  ('Famille'),
  ('Expert'),
  ('Débutant'),
  ('Soirée'),
  ('Journée'),
  ('Tournoi'),
  ('Découverte'),
  ('Rapide'),
  ('Stratégie'),
  ('Ambiance'),
  ('Coopératif'),
  ('Party Game'),
  ('Narratif')
ON CONFLICT (name) DO NOTHING;

-- 6. Vérifier à nouveau après insertion
\echo '\n6. Nombre de tags après insertion:'
SELECT COUNT(*) as total_tags FROM public.tags;

-- 7. Afficher tous les tags disponibles
\echo '\n7. Tags disponibles maintenant:'
SELECT id, name FROM public.tags ORDER BY name;

\echo '\n=========================================='
\echo 'FIN DU DIAGNOSTIC'
\echo '==========================================\n'



