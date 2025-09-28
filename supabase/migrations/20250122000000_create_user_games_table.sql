-- Migration pour créer la table user_games
-- Cette table lie les utilisateurs aux jeux qu'ils possèdent

-- Créer la table user_games
CREATE TABLE IF NOT EXISTS public.user_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL, -- ID du jeu depuis BoardGameGeek
    game_name TEXT NOT NULL,
    game_thumbnail TEXT,
    game_image TEXT,
    year_published INTEGER,
    min_players INTEGER,
    max_players INTEGER,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON public.user_games (user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_game_id ON public.user_games (game_id);

-- Créer une contrainte unique pour éviter les doublons
ALTER TABLE public.user_games
ADD CONSTRAINT user_games_user_game_unique UNIQUE (user_id, game_id);

-- Activer RLS
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
-- Les utilisateurs peuvent voir tous les jeux des autres utilisateurs
CREATE POLICY "User games are viewable by everyone" ON public.user_games
    FOR SELECT USING (true);

-- Les utilisateurs peuvent ajouter leurs propres jeux
CREATE POLICY "Users can insert their own games" ON public.user_games
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres jeux
CREATE POLICY "Users can update their own games" ON public.user_games
    FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres jeux
CREATE POLICY "Users can delete their own games" ON public.user_games
    FOR DELETE USING (auth.uid() = user_id);

-- Commentaire sur la table
COMMENT ON TABLE public.user_games IS 'Table de liaison entre utilisateurs et jeux possédés';
COMMENT ON COLUMN public.user_games.user_id IS 'ID de l''utilisateur propriétaire du jeu';
COMMENT ON COLUMN public.user_games.game_id IS 'ID du jeu depuis BoardGameGeek';
COMMENT ON COLUMN public.user_games.game_name IS 'Nom du jeu';
COMMENT ON COLUMN public.user_games.added_at IS 'Date d''ajout du jeu à la collection';
