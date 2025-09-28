-- Migration pour adapter user_games à la structure cloud réelle
-- Basée sur les captures d'écran fournies

-- Ajouter les colonnes manquantes à user_games si elles n'existent pas
DO $$ 
BEGIN
    -- Colonnes de jeu supplémentaires
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_games' AND column_name = 'game_name') THEN
        ALTER TABLE public.user_games ADD COLUMN game_name TEXT;
        RAISE NOTICE 'Colonne game_name ajoutée';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_games' AND column_name = 'game_thumbnail') THEN
        ALTER TABLE public.user_games ADD COLUMN game_thumbnail TEXT;
        RAISE NOTICE 'Colonne game_thumbnail ajoutée';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_games' AND column_name = 'game_image') THEN
        ALTER TABLE public.user_games ADD COLUMN game_image TEXT;
        RAISE NOTICE 'Colonne game_image ajoutée';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_games' AND column_name = 'year_published') THEN
        ALTER TABLE public.user_games ADD COLUMN year_published SMALLINT;
        RAISE NOTICE 'Colonne year_published ajoutée';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_games' AND column_name = 'min_players') THEN
        ALTER TABLE public.user_games ADD COLUMN min_players SMALLINT;
        RAISE NOTICE 'Colonne min_players ajoutée';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_games' AND column_name = 'max_players') THEN
        ALTER TABLE public.user_games ADD COLUMN max_players SMALLINT;
        RAISE NOTICE 'Colonne max_players ajoutée';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_games' AND column_name = 'added_at') THEN
        ALTER TABLE public.user_games ADD COLUMN added_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Colonne added_at ajoutée';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_games' AND column_name = 'updated_at') THEN
        ALTER TABLE public.user_games ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée';
    END IF;

    RAISE NOTICE 'Structure user_games mise à jour selon le cloud';
END $$;

-- Créer un trigger pour updated_at
CREATE OR REPLACE FUNCTION update_user_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_games_updated_at ON public.user_games;
CREATE TRIGGER trigger_update_user_games_updated_at
    BEFORE UPDATE ON public.user_games
    FOR EACH ROW
    EXECUTE FUNCTION update_user_games_updated_at();

-- Ajouter des commentaires
COMMENT ON TABLE public.user_games IS 'Jeux des utilisateurs avec détails complets (structure cloud)';
COMMENT ON COLUMN public.user_games.game_name IS 'Nom du jeu (dupliqué pour performance)';
COMMENT ON COLUMN public.user_games.game_thumbnail IS 'Miniature du jeu';
COMMENT ON COLUMN public.user_games.game_image IS 'Image principale du jeu';
COMMENT ON COLUMN public.user_games.year_published IS 'Année de publication du jeu';
COMMENT ON COLUMN public.user_games.min_players IS 'Nombre minimum de joueurs';
COMMENT ON COLUMN public.user_games.max_players IS 'Nombre maximum de joueurs';
COMMENT ON COLUMN public.user_games.added_at IS 'Date d''ajout du jeu à la collection';
COMMENT ON COLUMN public.user_games.updated_at IS 'Date de dernière modification';

RAISE NOTICE 'Migration user_games cloud terminée !';
