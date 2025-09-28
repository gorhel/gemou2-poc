-- Migration adaptative pour la table event_games
-- Cette migration vérifie l'état actuel de la table et applique uniquement les modifications nécessaires
-- Date: 2025-01-25
-- Description: Mise à jour sécurisée de la table event_games existante

-- Fonction utilitaire pour vérifier si une colonne existe
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = $2
    );
END;
$$ LANGUAGE plpgsql;

-- Fonction utilitaire pour vérifier si un index existe
CREATE OR REPLACE FUNCTION index_exists(index_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = $1
    );
END;
$$ LANGUAGE plpgsql;

-- Fonction utilitaire pour vérifier si une contrainte existe
CREATE OR REPLACE FUNCTION constraint_exists(constraint_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = $1
        AND table_schema = 'public'
    );
END;
$$ LANGUAGE plpgsql;

-- Vérifier que la table event_games existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_games' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'La table event_games n''existe pas. Veuillez d''abord créer la table de base.';
    END IF;
END $$;

-- Ajouter les colonnes manquantes de manière sécurisée
DO $$ 
BEGIN
    -- Colonnes de base du jeu
    IF NOT column_exists('event_games', 'game_name') THEN
        ALTER TABLE public.event_games ADD COLUMN game_name TEXT;
        RAISE NOTICE 'Colonne game_name ajoutée';
    ELSE
        RAISE NOTICE 'Colonne game_name existe déjà';
    END IF;

    IF NOT column_exists('event_games', 'game_thumbnail') THEN
        ALTER TABLE public.event_games ADD COLUMN game_thumbnail TEXT;
        RAISE NOTICE 'Colonne game_thumbnail ajoutée';
    ELSE
        RAISE NOTICE 'Colonne game_thumbnail existe déjà';
    END IF;

    IF NOT column_exists('event_games', 'game_image') THEN
        ALTER TABLE public.event_games ADD COLUMN game_image TEXT;
        RAISE NOTICE 'Colonne game_image ajoutée';
    ELSE
        RAISE NOTICE 'Colonne game_image existe déjà';
    END IF;

    -- Informations sur le jeu
    IF NOT column_exists('event_games', 'year_published') THEN
        ALTER TABLE public.event_games ADD COLUMN year_published INTEGER;
        RAISE NOTICE 'Colonne year_published ajoutée';
    ELSE
        RAISE NOTICE 'Colonne year_published existe déjà';
    END IF;

    IF NOT column_exists('event_games', 'min_players') THEN
        ALTER TABLE public.event_games ADD COLUMN min_players INTEGER;
        RAISE NOTICE 'Colonne min_players ajoutée';
    ELSE
        RAISE NOTICE 'Colonne min_players existe déjà';
    END IF;

    IF NOT column_exists('event_games', 'max_players') THEN
        ALTER TABLE public.event_games ADD COLUMN max_players INTEGER;
        RAISE NOTICE 'Colonne max_players ajoutée';
    ELSE
        RAISE NOTICE 'Colonne max_players existe déjà';
    END IF;

    IF NOT column_exists('event_games', 'playing_time') THEN
        ALTER TABLE public.event_games ADD COLUMN playing_time INTEGER;
        RAISE NOTICE 'Colonne playing_time ajoutée';
    ELSE
        RAISE NOTICE 'Colonne playing_time existe déjà';
    END IF;

    IF NOT column_exists('event_games', 'complexity') THEN
        ALTER TABLE public.event_games ADD COLUMN complexity DECIMAL(3,2);
        RAISE NOTICE 'Colonne complexity ajoutée';
    ELSE
        RAISE NOTICE 'Colonne complexity existe déjà';
    END IF;

    -- Colonnes de configuration
    IF NOT column_exists('event_games', 'experience_level') THEN
        ALTER TABLE public.event_games ADD COLUMN experience_level TEXT DEFAULT 'beginner' 
        CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
        RAISE NOTICE 'Colonne experience_level ajoutée';
    ELSE
        RAISE NOTICE 'Colonne experience_level existe déjà';
    END IF;

    IF NOT column_exists('event_games', 'estimated_duration') THEN
        ALTER TABLE public.event_games ADD COLUMN estimated_duration INTEGER;
        RAISE NOTICE 'Colonne estimated_duration ajoutée';
    ELSE
        RAISE NOTICE 'Colonne estimated_duration existe déjà';
    END IF;

    -- Colonnes relationnelles
    IF NOT column_exists('event_games', 'brought_by_user_id') THEN
        ALTER TABLE public.event_games ADD COLUMN brought_by_user_id UUID REFERENCES public.profiles(id);
        RAISE NOTICE 'Colonne brought_by_user_id ajoutée';
    ELSE
        RAISE NOTICE 'Colonne brought_by_user_id existe déjà';
    END IF;

    -- Colonnes de métadonnées
    IF NOT column_exists('event_games', 'notes') THEN
        ALTER TABLE public.event_games ADD COLUMN notes TEXT;
        RAISE NOTICE 'Colonne notes ajoutée';
    ELSE
        RAISE NOTICE 'Colonne notes existe déjà';
    END IF;

    IF NOT column_exists('event_games', 'is_custom') THEN
        ALTER TABLE public.event_games ADD COLUMN is_custom BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Colonne is_custom ajoutée';
    ELSE
        RAISE NOTICE 'Colonne is_custom existe déjà';
    END IF;

    IF NOT column_exists('event_games', 'is_optional') THEN
        ALTER TABLE public.event_games ADD COLUMN is_optional BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Colonne is_optional ajoutée';
    ELSE
        RAISE NOTICE 'Colonne is_optional existe déjà';
    END IF;

    RAISE NOTICE 'Vérification des colonnes terminée';
END $$;

-- Créer les index de performance s'ils n'existent pas
DO $$ 
BEGIN
    IF NOT index_exists('idx_event_games_event_id') THEN
        CREATE INDEX idx_event_games_event_id ON public.event_games (event_id);
        RAISE NOTICE 'Index idx_event_games_event_id créé';
    ELSE
        RAISE NOTICE 'Index idx_event_games_event_id existe déjà';
    END IF;

    IF NOT index_exists('idx_event_games_game_id') THEN
        CREATE INDEX idx_event_games_game_id ON public.event_games (game_id);
        RAISE NOTICE 'Index idx_event_games_game_id créé';
    ELSE
        RAISE NOTICE 'Index idx_event_games_game_id existe déjà';
    END IF;

    IF NOT index_exists('idx_event_games_brought_by') THEN
        CREATE INDEX idx_event_games_brought_by ON public.event_games (brought_by_user_id);
        RAISE NOTICE 'Index idx_event_games_brought_by créé';
    ELSE
        RAISE NOTICE 'Index idx_event_games_brought_by existe déjà';
    END IF;

    RAISE NOTICE 'Vérification des index terminée';
END $$;

-- Créer la contrainte unique si elle n'existe pas
DO $$ 
BEGIN
    IF NOT constraint_exists('event_games_event_game_unique') THEN
        -- Vérifier que les colonnes nécessaires existent avant de créer la contrainte
        IF column_exists('event_games', 'event_id') 
           AND column_exists('event_games', 'game_id') 
           AND column_exists('event_games', 'game_name') THEN
            ALTER TABLE public.event_games
            ADD CONSTRAINT event_games_event_game_unique UNIQUE (event_id, game_id, game_name);
            RAISE NOTICE 'Contrainte event_games_event_game_unique créée';
        ELSE
            RAISE NOTICE 'Impossible de créer la contrainte unique : colonnes manquantes';
        END IF;
    ELSE
        RAISE NOTICE 'Contrainte event_games_event_game_unique existe déjà';
    END IF;
END $$;

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.event_games ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent et créer les nouvelles
DO $$ 
BEGIN
    -- Supprimer les anciennes politiques
    DROP POLICY IF EXISTS "Event games are viewable by everyone" ON public.event_games;
    DROP POLICY IF EXISTS "Event organizers can add games to their events" ON public.event_games;
    DROP POLICY IF EXISTS "Event organizers can update games in their events" ON public.event_games;
    DROP POLICY IF EXISTS "Event organizers can delete games from their events" ON public.event_games;
    DROP POLICY IF EXISTS "Event organizers can manage games" ON public.event_games;

    -- Créer les nouvelles politiques RLS
    CREATE POLICY "Event games are viewable by everyone" ON public.event_games
        FOR SELECT USING (true);

    CREATE POLICY "Event organizers can add games to their events" ON public.event_games
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.events 
                WHERE events.id = event_games.event_id 
                AND events.creator_id = auth.uid()
            )
        );

    CREATE POLICY "Event organizers can update games in their events" ON public.event_games
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM public.events 
                WHERE events.id = event_games.event_id 
                AND events.creator_id = auth.uid()
            )
        );

    CREATE POLICY "Event organizers can delete games from their events" ON public.event_games
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM public.events 
                WHERE events.id = event_games.event_id 
                AND events.creator_id = auth.uid()
            )
        );

    RAISE NOTICE 'Politiques RLS mises à jour';
END $$;

-- Ajouter les commentaires sur la table et les colonnes
COMMENT ON TABLE public.event_games IS 'Jeux associés aux événements avec détails spécifiques et métadonnées';

-- Commentaires sur les colonnes principales
DO $$ 
BEGIN
    IF column_exists('event_games', 'event_id') THEN
        COMMENT ON COLUMN public.event_games.event_id IS 'ID de l''événement associé';
    END IF;

    IF column_exists('event_games', 'game_id') THEN
        COMMENT ON COLUMN public.event_games.game_id IS 'ID du jeu depuis BoardGameGeek (NULL pour jeux personnalisés)';
    END IF;

    IF column_exists('event_games', 'game_name') THEN
        COMMENT ON COLUMN public.event_games.game_name IS 'Nom du jeu';
    END IF;

    IF column_exists('event_games', 'is_custom') THEN
        COMMENT ON COLUMN public.event_games.is_custom IS 'TRUE si le jeu a été ajouté manuellement par l''organisateur';
    END IF;

    IF column_exists('event_games', 'is_optional') THEN
        COMMENT ON COLUMN public.event_games.is_optional IS 'TRUE si le jeu est optionnel pour l''événement';
    END IF;

    IF column_exists('event_games', 'experience_level') THEN
        COMMENT ON COLUMN public.event_games.experience_level IS 'Niveau d''expérience requis (beginner, intermediate, advanced, expert)';
    END IF;

    IF column_exists('event_games', 'brought_by_user_id') THEN
        COMMENT ON COLUMN public.event_games.brought_by_user_id IS 'ID de l''utilisateur qui apporte le jeu';
    END IF;

    IF column_exists('event_games', 'estimated_duration') THEN
        COMMENT ON COLUMN public.event_games.estimated_duration IS 'Durée estimée en minutes pour cet événement';
    END IF;

    RAISE NOTICE 'Commentaires ajoutés';
END $$;

-- Nettoyer les fonctions utilitaires temporaires
DROP FUNCTION IF EXISTS column_exists(text, text);
DROP FUNCTION IF EXISTS index_exists(text);
DROP FUNCTION IF EXISTS constraint_exists(text);

-- Message de fin
DO $$ 
BEGIN
    RAISE NOTICE 'Migration adaptative event_games terminée avec succès !';
    RAISE NOTICE 'La table event_games a été mise à jour de manière sécurisée.';
END $$;
