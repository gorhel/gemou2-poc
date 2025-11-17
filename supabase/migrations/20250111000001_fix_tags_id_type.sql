-- Migration pour standardiser le type de tags.id sur serial (int)
-- Les migrations de base (alpha_backlog_db, sync_cloud_to_local) utilisent serial
-- Cette migration corrige les incohérences

-- Vérifier et corriger le type de tags.id si nécessaire
DO $$
DECLARE
  current_type text;
BEGIN
  -- Récupérer le type actuel de la colonne id dans tags
  SELECT data_type INTO current_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'tags'
    AND column_name = 'id';
  
  RAISE NOTICE 'Type actuel de tags.id: %', current_type;
  
  -- Si le type est uuid, on doit le convertir en integer
  IF current_type = 'uuid' THEN
    RAISE NOTICE 'Conversion de tags.id de uuid vers integer';
    
    -- Désactiver temporairement les contraintes FK
    ALTER TABLE public.event_tags DROP CONSTRAINT IF EXISTS event_tags_tag_id_fkey;
    ALTER TABLE public.game_tags DROP CONSTRAINT IF EXISTS game_tags_tag_id_fkey;
    ALTER TABLE public.user_tags DROP CONSTRAINT IF EXISTS user_tags_tag_id_fkey;
    
    -- Supprimer les données existantes (car impossible de convertir uuid en int)
    TRUNCATE TABLE public.event_tags CASCADE;
    TRUNCATE TABLE public.game_tags CASCADE;
    TRUNCATE TABLE public.user_tags CASCADE;
    TRUNCATE TABLE public.tags CASCADE;
    
    -- Modifier le type de la colonne
    ALTER TABLE public.tags DROP COLUMN id CASCADE;
    ALTER TABLE public.tags ADD COLUMN id serial PRIMARY KEY;
    
    -- Modifier event_tags.tag_id
    ALTER TABLE public.event_tags ALTER COLUMN tag_id TYPE int USING tag_id::text::int;
    
    -- Modifier game_tags.tag_id si elle existe
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'game_tags' 
        AND column_name = 'tag_id'
    ) THEN
      ALTER TABLE public.game_tags ALTER COLUMN tag_id TYPE int USING tag_id::text::int;
    END IF;
    
    -- Modifier user_tags.tag_id si elle existe
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'user_tags' 
        AND column_name = 'tag_id'
    ) THEN
      ALTER TABLE public.user_tags ALTER COLUMN tag_id TYPE int USING tag_id::text::int;
    END IF;
    
    -- Recréer les contraintes FK
    ALTER TABLE public.event_tags 
      ADD CONSTRAINT event_tags_tag_id_fkey 
      FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_tags' AND table_schema = 'public') THEN
      ALTER TABLE public.game_tags 
        ADD CONSTRAINT game_tags_tag_id_fkey 
        FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_tags' AND table_schema = 'public') THEN
      ALTER TABLE public.user_tags 
        ADD CONSTRAINT user_tags_tag_id_fkey 
        FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;
    END IF;
    
    RAISE NOTICE 'Conversion terminée: tags.id est maintenant de type integer';
  ELSE
    RAISE NOTICE 'tags.id est déjà de type integer/serial, aucune conversion nécessaire';
  END IF;
  
  -- Réinsérer les tags prédéfinis s'ils n'existent pas
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
  
END $$;

-- Commentaire
COMMENT ON COLUMN public.tags.id IS 'ID du tag (serial/integer pour compatibilité avec les migrations de base)';

