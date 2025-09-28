-- Migration simple pour la table event_games
-- Cette migration ajoute seulement les colonnes essentielles sans contraintes complexes

-- Ajouter les colonnes de base si elles n'existent pas
DO $$ 
BEGIN
    -- Colonnes essentielles pour la fonctionnalité
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'game_name') THEN
        ALTER TABLE public.event_games ADD COLUMN game_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'game_thumbnail') THEN
        ALTER TABLE public.event_games ADD COLUMN game_thumbnail TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'game_image') THEN
        ALTER TABLE public.event_games ADD COLUMN game_image TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'year_published') THEN
        ALTER TABLE public.event_games ADD COLUMN year_published INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'min_players') THEN
        ALTER TABLE public.event_games ADD COLUMN min_players INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'max_players') THEN
        ALTER TABLE public.event_games ADD COLUMN max_players INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'playing_time') THEN
        ALTER TABLE public.event_games ADD COLUMN playing_time INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'complexity') THEN
        ALTER TABLE public.event_games ADD COLUMN complexity DECIMAL(3,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'experience_level') THEN
        ALTER TABLE public.event_games ADD COLUMN experience_level TEXT DEFAULT 'beginner';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'estimated_duration') THEN
        ALTER TABLE public.event_games ADD COLUMN estimated_duration INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'brought_by_user_id') THEN
        ALTER TABLE public.event_games ADD COLUMN brought_by_user_id UUID REFERENCES public.profiles(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'notes') THEN
        ALTER TABLE public.event_games ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'is_custom') THEN
        ALTER TABLE public.event_games ADD COLUMN is_custom BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_games' AND column_name = 'is_optional') THEN
        ALTER TABLE public.event_games ADD COLUMN is_optional BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Créer les index de base
CREATE INDEX IF NOT EXISTS idx_event_games_event_id ON public.event_games (event_id);
CREATE INDEX IF NOT EXISTS idx_event_games_game_id ON public.event_games (game_id);

-- Activer RLS
ALTER TABLE public.event_games ENABLE ROW LEVEL SECURITY;

-- Politiques RLS de base
DROP POLICY IF EXISTS "Event games are viewable by everyone" ON public.event_games;
CREATE POLICY "Event games are viewable by everyone" ON public.event_games
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Event organizers can manage games" ON public.event_games;
CREATE POLICY "Event organizers can manage games" ON public.event_games
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_games.event_id 
            AND events.creator_id = auth.uid()
        )
    );
