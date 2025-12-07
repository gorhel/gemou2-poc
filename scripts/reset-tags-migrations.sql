-- Script pour réinitialiser les migrations de tags en cas de problème
-- À utiliser seulement si les migrations sont bloquées

\echo '=========================================='
\echo 'RESET DES MIGRATIONS TAGS'
\echo '=========================================='

-- 1. Supprimer les politiques RLS existantes (qui causent les conflits)
\echo '\n1. Suppression des politiques RLS...'
DROP POLICY IF EXISTS "Game tags are publicly readable" ON public.game_tags;
DROP POLICY IF EXISTS "Authenticated users can manage game tags" ON public.game_tags;

-- 2. Supprimer la table game_tags si elle existe (elle sera recréée)
\echo '\n2. Suppression de la table game_tags (si existe)...'
DROP TABLE IF EXISTS public.game_tags CASCADE;

-- 3. Vérifier que les tags existent
\echo '\n3. Vérification des tags existants...'
SELECT COUNT(*) as tags_count FROM public.tags;

-- 4. Réinsérer les tags si nécessaire
\echo '\n4. Insertion des tags prédéfinis...'
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

-- 5. Recréer la table game_tags
\echo '\n5. Création de la table game_tags...'
CREATE TABLE IF NOT EXISTS public.game_tags (
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  tag_id int REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (game_id, tag_id)
);

-- 6. Créer les index
\echo '\n6. Création des index...'
CREATE INDEX IF NOT EXISTS idx_game_tags_game_id ON public.game_tags(game_id);
CREATE INDEX IF NOT EXISTS idx_game_tags_tag_id ON public.game_tags(tag_id);

-- 7. Activer RLS
\echo '\n7. Activation de RLS...'
ALTER TABLE public.game_tags ENABLE ROW LEVEL SECURITY;

-- 8. Créer les politiques RLS
\echo '\n8. Création des politiques RLS...'
CREATE POLICY "Game tags are publicly readable"
  ON public.game_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage game tags"
  ON public.game_tags
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 9. Vérifications finales
\echo '\n9. Vérifications finales...'
\echo 'Nombre de tags:'
SELECT COUNT(*) as tags_count FROM public.tags;

\echo '\nStructure de game_tags vérifiée:'
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'game_tags'
ORDER BY ordinal_position;

\echo '\nPolitiques RLS sur game_tags:'
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'game_tags';

\echo '\n=========================================='
\echo 'RESET TERMINÉ AVEC SUCCÈS'
\echo '==========================================\n'




