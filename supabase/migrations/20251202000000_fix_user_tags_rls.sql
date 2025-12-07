-- Migration: Corriger les politiques RLS pour user_tags
-- Date: 2025-12-02
-- Description: Ajouter les politiques permettant aux utilisateurs de gérer leurs propres tags

-- Vérifier si la table user_tags existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.user_tags (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, tag_id)
);

-- Activer RLS sur user_tags si ce n'est pas déjà fait
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "user_tags_select_policy" ON public.user_tags;
DROP POLICY IF EXISTS "user_tags_insert_policy" ON public.user_tags;
DROP POLICY IF EXISTS "user_tags_delete_policy" ON public.user_tags;
DROP POLICY IF EXISTS "Users can view their own tags" ON public.user_tags;
DROP POLICY IF EXISTS "Users can insert their own tags" ON public.user_tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON public.user_tags;
DROP POLICY IF EXISTS "User tags are publicly readable" ON public.user_tags;

-- Politique SELECT: Les utilisateurs peuvent voir leurs propres tags (et les autres peuvent les voir aussi pour les profils publics)
CREATE POLICY "User tags are publicly readable"
  ON public.user_tags
  FOR SELECT
  USING (true);

-- Politique INSERT: Les utilisateurs peuvent ajouter leurs propres tags
CREATE POLICY "Users can insert their own tags"
  ON public.user_tags
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique DELETE: Les utilisateurs peuvent supprimer leurs propres tags
CREATE POLICY "Users can delete their own tags"
  ON public.user_tags
  FOR DELETE
  USING (auth.uid() = user_id);

-- Politique UPDATE (optionnel, au cas où): Les utilisateurs peuvent modifier leurs propres tags
CREATE POLICY "Users can update their own tags"
  ON public.user_tags
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON public.user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_tag_id ON public.user_tags(tag_id);

-- Fonction pour limiter le nombre de tags par utilisateur (max 5)
CREATE OR REPLACE FUNCTION check_max_user_tags()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.user_tags WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'Un utilisateur ne peut avoir que 5 tags maximum';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_check_max_user_tags ON public.user_tags;

-- Créer le trigger pour appliquer la limite
CREATE TRIGGER trigger_check_max_user_tags
  BEFORE INSERT ON public.user_tags
  FOR EACH ROW
  EXECUTE FUNCTION check_max_user_tags();

-- Commentaires pour documentation
COMMENT ON TABLE public.user_tags IS 'Table de liaison entre utilisateurs et leurs tags de préférences de jeu. Maximum 5 tags par utilisateur.';
COMMENT ON POLICY "User tags are publicly readable" ON public.user_tags IS 'Permet à tous de voir les tags des utilisateurs';
COMMENT ON POLICY "Users can insert their own tags" ON public.user_tags IS 'Permet aux utilisateurs d''ajouter leurs propres tags';
COMMENT ON POLICY "Users can delete their own tags" ON public.user_tags IS 'Permet aux utilisateurs de supprimer leurs propres tags';


