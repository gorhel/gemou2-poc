-- Migration pour corriger la table event_games existante
-- Cette migration vérifie d'abord la structure existante et ajoute les colonnes manquantes

-- Vérifier et ajouter les colonnes manquantes
DO $$ 
BEGIN
    -- Ajouter la colonne game_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'game_name') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN game_name TEXT;
    END IF;

    -- Ajouter la colonne game_thumbnail si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'game_thumbnail') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN game_thumbnail TEXT;
    END IF;

    -- Ajouter la colonne game_image si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'game_image') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN game_image TEXT;
    END IF;

    -- Ajouter la colonne year_published si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'year_published') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN year_published INTEGER;
    END IF;

    -- Ajouter la colonne min_players si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'min_players') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN min_players INTEGER;
    END IF;

    -- Ajouter la colonne max_players si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'max_players') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN max_players INTEGER;
    END IF;

    -- Ajouter la colonne playing_time si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'playing_time') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN playing_time INTEGER;
    END IF;

    -- Ajouter la colonne complexity si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'complexity') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN complexity DECIMAL(3,2);
    END IF;

    -- Ajouter la colonne experience_level si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'experience_level') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN experience_level TEXT DEFAULT 'beginner' 
        CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
    END IF;

    -- Ajouter la colonne estimated_duration si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'estimated_duration') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN estimated_duration INTEGER;
    END IF;

    -- Ajouter la colonne brought_by_user_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'brought_by_user_id') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN brought_by_user_id UUID REFERENCES public.profiles(id);
    END IF;

    -- Ajouter la colonne notes si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'notes') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN notes TEXT;
    END IF;

    -- Ajouter la colonne is_custom si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'is_custom') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN is_custom BOOLEAN DEFAULT FALSE;
    END IF;

    -- Ajouter la colonne is_optional si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'is_optional') THEN
        ALTER TABLE public.event_games 
        ADD COLUMN is_optional BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Créer les index s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_event_games_event_id ON public.event_games (event_id);
CREATE INDEX IF NOT EXISTS idx_event_games_game_id ON public.event_games (game_id);
CREATE INDEX IF NOT EXISTS idx_event_games_brought_by ON public.event_games (brought_by_user_id);

-- Créer la contrainte unique seulement si toutes les colonnes existent
DO $$ 
BEGIN
    -- Vérifier que toutes les colonnes nécessaires existent
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'event_games' AND column_name = 'event_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'game_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'game_name') THEN
        
        -- Créer la contrainte unique si elle n'existe pas
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'event_games_event_game_unique') THEN
            ALTER TABLE public.event_games
            ADD CONSTRAINT event_games_event_game_unique UNIQUE (event_id, game_id, game_name);
        END IF;
    END IF;
END $$;

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.event_games ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Event games are viewable by everyone" ON public.event_games;
DROP POLICY IF EXISTS "Event organizers can add games to their events" ON public.event_games;
DROP POLICY IF EXISTS "Event organizers can update games in their events" ON public.event_games;
DROP POLICY IF EXISTS "Event organizers can delete games from their events" ON public.event_games;

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

-- Ajouter les commentaires
COMMENT ON TABLE public.event_games IS 'Jeux associés aux événements avec détails spécifiques';
COMMENT ON COLUMN public.event_games.event_id IS 'ID de l\'événement';
COMMENT ON COLUMN public.event_games.game_id IS 'ID du jeu depuis BoardGameGeek (NULL pour jeux personnalisés)';
COMMENT ON COLUMN public.event_games.game_name IS 'Nom du jeu';
COMMENT ON COLUMN public.event_games.is_custom IS 'TRUE si le jeu a été ajouté manuellement par l\'organisateur';
COMMENT ON COLUMN public.event_games.is_optional IS 'TRUE si le jeu est optionnel pour l\'événement';
COMMENT ON COLUMN public.event_games.experience_level IS 'Niveau d\'expérience requis (beginner, intermediate, advanced, expert)';
COMMENT ON COLUMN public.event_games.brought_by_user_id IS 'ID de l\'utilisateur qui apporte le jeu';
COMMENT ON COLUMN public.event_games.estimated_duration IS 'Durée estimée en minutes pour cet événement';
