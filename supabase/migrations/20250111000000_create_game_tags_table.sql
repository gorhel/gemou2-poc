-- Migration pour créer la table game_tags
-- Cette table lie les jeux aux tags pour catégorisation
-- Utilise le même système de tags que event_tags

-- Table de liaison game_tags
CREATE TABLE IF NOT EXISTS public.game_tags (
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  tag_id int REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (game_id, tag_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_game_tags_game_id ON public.game_tags(game_id);
CREATE INDEX IF NOT EXISTS idx_game_tags_tag_id ON public.game_tags(tag_id);

-- Activer RLS sur la table
ALTER TABLE public.game_tags ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour game_tags
-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Game tags are publicly readable" ON public.game_tags;
DROP POLICY IF EXISTS "Authenticated users can manage game tags" ON public.game_tags;

-- Lecture publique
CREATE POLICY "Game tags are publicly readable"
  ON public.game_tags
  FOR SELECT
  USING (true);

-- Écriture réservée aux utilisateurs authentifiés (pour permettre l'ajout de tags aux jeux)
CREATE POLICY "Authenticated users can manage game tags"
  ON public.game_tags
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Commentaire pour documentation
COMMENT ON TABLE public.game_tags IS 'Table de liaison entre jeux et tags. Permet de catégoriser les jeux avec les mêmes tags que les événements.';

