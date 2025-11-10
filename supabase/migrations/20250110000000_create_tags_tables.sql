-- Migration pour créer les tables tags et event_tags
-- Supporte à la fois les tags prédéfinis et la création dynamique (pour admin)
-- Utilise uuid pour les IDs comme spécifié dans le plan

-- Enable uuid extension si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table tags avec uuid
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  color text, -- Optionnel, pour personnalisation future
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT tags_name_unique UNIQUE (name)
);

-- Table de liaison event_tags
CREATE TABLE IF NOT EXISTS public.event_tags (
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (event_id, tag_id)
);

-- S'assurer que la contrainte unique existe avec le bon nom
-- (au cas où la table existe déjà avec une contrainte unique non nommée)
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Vérifier si la table existe
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'tags'
  ) THEN
    -- Chercher une contrainte unique existante sur la colonne name
    SELECT conname INTO constraint_name
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE t.relname = 'tags'
      AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND c.contype = 'u'
      AND a.attname = 'name'
    LIMIT 1;
    
    -- Si une contrainte existe mais avec un nom différent, la supprimer
    IF constraint_name IS NOT NULL AND constraint_name != 'tags_name_unique' THEN
      EXECUTE format('ALTER TABLE public.tags DROP CONSTRAINT IF EXISTS %I', constraint_name);
    END IF;
    
    -- Ajouter la contrainte nommée si elle n'existe pas
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'tags_name_unique' 
      AND conrelid = 'public.tags'::regclass
    ) THEN
      ALTER TABLE public.tags ADD CONSTRAINT tags_name_unique UNIQUE (name);
    END IF;
  END IF;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON public.event_tags(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_tag_id ON public.event_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

-- Fonction pour valider le nombre maximum de tags par événement (max 3)
CREATE OR REPLACE FUNCTION check_max_event_tags()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.event_tags WHERE event_id = NEW.event_id) >= 3 THEN
    RAISE EXCEPTION 'Un événement ne peut avoir que 3 tags maximum';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appliquer la contrainte max 3 tags
DROP TRIGGER IF EXISTS trigger_check_max_event_tags ON public.event_tags;
CREATE TRIGGER trigger_check_max_event_tags
  BEFORE INSERT ON public.event_tags
  FOR EACH ROW
  EXECUTE FUNCTION check_max_event_tags();

-- Activer RLS sur les tables
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour tags (lecture publique, écriture admin uniquement)
-- Lecture publique
CREATE POLICY "Tags are publicly readable"
  ON public.tags
  FOR SELECT
  USING (true);

-- Écriture réservée aux admins (à adapter selon votre système d'admin)
-- Pour l'instant, permettre la création pour les utilisateurs authentifiés
-- Vous pouvez modifier cette politique pour restreindre aux admins uniquement
CREATE POLICY "Authenticated users can create tags"
  ON public.tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Politiques RLS pour event_tags
-- Lecture publique
CREATE POLICY "Event tags are publicly readable"
  ON public.event_tags
  FOR SELECT
  USING (true);

-- Écriture pour les créateurs d'événements uniquement
CREATE POLICY "Event creators can manage event tags"
  ON public.event_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_tags.event_id
      AND events.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_tags.event_id
      AND events.creator_id = auth.uid()
    )
  );

-- Insérer des tags prédéfinis
-- Ces tags seront disponibles pour la sélection lors de la création d'événements
INSERT INTO public.tags (name, color) VALUES
  ('Compétitif', NULL),
  ('Décontracté', NULL),
  ('Famille', NULL),
  ('Expert', NULL),
  ('Débutant', NULL),
  ('Soirée', NULL),
  ('Journée', NULL),
  ('Tournoi', NULL),
  ('Découverte', NULL),
  ('Rapide', NULL)
ON CONFLICT ON CONSTRAINT tags_name_unique DO NOTHING;

-- Commentaire pour documentation
COMMENT ON TABLE public.tags IS 'Tags disponibles pour catégoriser les événements. Supporte les tags prédéfinis et la création dynamique (admin).';
COMMENT ON TABLE public.event_tags IS 'Table de liaison entre événements et tags. Maximum 3 tags par événement.';
COMMENT ON FUNCTION check_max_event_tags() IS 'Valide qu''un événement ne peut avoir que 3 tags maximum';
