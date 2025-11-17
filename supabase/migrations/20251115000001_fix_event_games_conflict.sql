-- Migration pour corriger le conflit de la table event_games
-- Cette migration résout le problème où game_id est de type UUID au lieu de TEXT
-- Le game_id doit être TEXT pour stocker les IDs BoardGameGeek (ex: "68448")

-- 1. Supprimer la table event_games si elle existe avec la mauvaise structure
DROP TABLE IF EXISTS public.event_games CASCADE;

-- 2. Recréer la table event_games avec la bonne structure
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

-- 3. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_event_games_event_id ON public.event_games (event_id);
CREATE INDEX IF NOT EXISTS idx_event_games_game_id ON public.event_games (game_id);
CREATE INDEX IF NOT EXISTS idx_event_games_brought_by ON public.event_games (brought_by_user_id);

-- 4. Créer une contrainte unique pour éviter les doublons de jeux dans un même événement
-- Note: On permet game_id NULL pour les jeux personnalisés
ALTER TABLE public.event_games
ADD CONSTRAINT event_games_event_game_unique 
UNIQUE NULLS NOT DISTINCT (event_id, game_id, game_name);

-- 5. Activer RLS
ALTER TABLE public.event_games ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS
-- Les utilisateurs peuvent voir tous les jeux des événements
CREATE POLICY "Event games are viewable by everyone" ON public.event_games
    FOR SELECT
    USING (true);

-- Les organisateurs d'événements peuvent ajouter des jeux
CREATE POLICY "Event organizers can add games" ON public.event_games
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_games.event_id
            AND events.creator_id = auth.uid()
        )
    );

-- Les organisateurs d'événements peuvent modifier les jeux de leurs événements
CREATE POLICY "Event organizers can update games" ON public.event_games
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_games.event_id
            AND events.creator_id = auth.uid()
        )
    );

-- Les organisateurs d'événements peuvent supprimer les jeux de leurs événements
CREATE POLICY "Event organizers can delete games" ON public.event_games
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_games.event_id
            AND events.creator_id = auth.uid()
        )
    );

-- 7. Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_event_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer un trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_event_games_updated_at_trigger ON public.event_games;
CREATE TRIGGER update_event_games_updated_at_trigger
    BEFORE UPDATE ON public.event_games
    FOR EACH ROW
    EXECUTE FUNCTION update_event_games_updated_at();

-- 9. Commentaires pour la documentation
COMMENT ON TABLE public.event_games IS 'Jeux associés aux événements. game_id est TEXT pour stocker les IDs BoardGameGeek.';
COMMENT ON COLUMN public.event_games.game_id IS 'ID du jeu depuis BoardGameGeek (format: string numérique comme "68448"). NULL pour les jeux personnalisés.';
COMMENT ON COLUMN public.event_games.is_custom IS 'TRUE si le jeu est personnalisé (non trouvé dans BoardGameGeek).';
COMMENT ON COLUMN public.event_games.experience_level IS 'Niveau d''expérience requis pour jouer à ce jeu lors de cet événement.';



