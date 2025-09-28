-- Migration pour créer la table event_games
-- Cette table lie les événements aux jeux qui seront joués

-- Créer la table event_games
CREATE TABLE IF NOT EXISTS public.event_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    game_id TEXT, -- ID du jeu depuis BoardGameGeek (peut être NULL pour jeux personnalisés)
    game_name TEXT NOT NULL,
    game_thumbnail TEXT,
    game_image TEXT,
    year_published INTEGER,
    min_players INTEGER,
    max_players INTEGER,
    playing_time INTEGER, -- Durée en minutes
    complexity DECIMAL(3,2), -- Complexité de 1.0 à 5.0
    is_custom BOOLEAN DEFAULT FALSE, -- TRUE si jeu personnalisé ajouté par l'organisateur
    is_optional BOOLEAN DEFAULT FALSE, -- TRUE si jeu optionnel
    experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_duration INTEGER, -- Durée estimée en minutes pour cet événement
    brought_by_user_id UUID REFERENCES public.profiles(id), -- Qui apporte le jeu
    notes TEXT, -- Notes supplémentaires sur le jeu
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_event_games_event_id ON public.event_games (event_id);
CREATE INDEX IF NOT EXISTS idx_event_games_game_id ON public.event_games (game_id);
CREATE INDEX IF NOT EXISTS idx_event_games_brought_by ON public.event_games (brought_by_user_id);

-- Créer une contrainte unique pour éviter les doublons de jeux dans un même événement
ALTER TABLE public.event_games
ADD CONSTRAINT event_games_event_game_unique UNIQUE (event_id, game_id, game_name);

-- Activer RLS
ALTER TABLE public.event_games ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
-- Les utilisateurs peuvent voir tous les jeux des événements
CREATE POLICY "Event games are viewable by everyone" ON public.event_games
    FOR SELECT USING (true);

-- Les organisateurs d'événements peuvent ajouter des jeux à leurs événements
CREATE POLICY "Event organizers can add games to their events" ON public.event_games
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_games.event_id 
            AND events.creator_id = auth.uid()
        )
    );

-- Les organisateurs d'événements peuvent modifier les jeux de leurs événements
CREATE POLICY "Event organizers can update games in their events" ON public.event_games
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_games.event_id 
            AND events.creator_id = auth.uid()
        )
    );

-- Les organisateurs d'événements peuvent supprimer les jeux de leurs événements
CREATE POLICY "Event organizers can delete games from their events" ON public.event_games
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_games.event_id 
            AND events.creator_id = auth.uid()
        )
    );

-- Commentaires sur la table
COMMENT ON TABLE public.event_games IS 'Jeux associés aux événements avec détails spécifiques';
COMMENT ON COLUMN public.event_games.event_id IS 'ID de l\'événement';
COMMENT ON COLUMN public.event_games.game_id IS 'ID du jeu depuis BoardGameGeek (NULL pour jeux personnalisés)';
COMMENT ON COLUMN public.event_games.game_name IS 'Nom du jeu';
COMMENT ON COLUMN public.event_games.is_custom IS 'TRUE si le jeu a été ajouté manuellement par l\'organisateur';
COMMENT ON COLUMN public.event_games.is_optional IS 'TRUE si le jeu est optionnel pour l\'événement';
COMMENT ON COLUMN public.event_games.experience_level IS 'Niveau d\'expérience requis (beginner, intermediate, advanced, expert)';
COMMENT ON COLUMN public.event_games.brought_by_user_id IS 'ID de l\'utilisateur qui apporte le jeu';
COMMENT ON COLUMN public.event_games.estimated_duration IS 'Durée estimée en minutes pour cet événement';
