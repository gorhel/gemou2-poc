# ⚡ Correction Rapide - Erreur UUID lors de l'ajout de jeux

## 🎯 Problème
`Invalid input syntax for type uuid : "68448"` lors de l'ajout d'un jeu à un événement.

## 🚀 Solution Rapide (5 minutes)

### 1. Ouvrez le Dashboard Supabase
https://supabase.com/dashboard/project/qpnofwgxjgvmpwdrhzid/sql

### 2. Exécutez ce SQL
Copiez-collez et exécutez :

```sql
-- Supprimer l'ancienne table avec la mauvaise structure
DROP TABLE IF EXISTS public.event_games CASCADE;

-- Recréer avec la bonne structure (game_id TEXT au lieu de UUID)
CREATE TABLE public.event_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    game_id TEXT, -- IDs BoardGameGeek comme "68448"
    game_name TEXT NOT NULL,
    game_thumbnail TEXT,
    game_image TEXT,
    year_published INTEGER,
    min_players INTEGER,
    max_players INTEGER,
    playing_time INTEGER,
    complexity DECIMAL(3,2),
    is_custom BOOLEAN DEFAULT FALSE,
    is_optional BOOLEAN DEFAULT FALSE,
    experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_duration INTEGER,
    brought_by_user_id UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_event_games_event_id ON public.event_games (event_id);
CREATE INDEX idx_event_games_game_id ON public.event_games (game_id);

-- Contrainte unique
ALTER TABLE public.event_games
ADD CONSTRAINT event_games_event_game_unique 
UNIQUE NULLS NOT DISTINCT (event_id, game_id, game_name);

-- RLS
ALTER TABLE public.event_games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Event games are viewable by everyone" ON public.event_games;
CREATE POLICY "Event games are viewable by everyone" ON public.event_games
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Event organizers can add games" ON public.event_games;
CREATE POLICY "Event organizers can add games" ON public.event_games
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_games.event_id
            AND events.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Event organizers can update games" ON public.event_games;
CREATE POLICY "Event organizers can update games" ON public.event_games
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_games.event_id
            AND events.creator_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Event organizers can delete games" ON public.event_games;
CREATE POLICY "Event organizers can delete games" ON public.event_games
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_games.event_id
            AND events.creator_id = auth.uid()
        )
    );

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_event_games_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_event_games_updated_at_trigger ON public.event_games;
CREATE TRIGGER update_event_games_updated_at_trigger
    BEFORE UPDATE ON public.event_games
    FOR EACH ROW
    EXECUTE FUNCTION update_event_games_updated_at();
```

### 3. Testez
Essayez à nouveau d'ajouter un jeu à un événement. ✅ Ça devrait fonctionner !

## 📖 Documentation Complète
Voir : `informations/2025-11-15_CORRECTION_EVENT_GAMES_UUID_ERROR.md`



