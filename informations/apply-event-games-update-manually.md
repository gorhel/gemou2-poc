# 🎮 Mise à jour manuelle de la table event_games

## 📋 Instructions pour le Dashboard Supabase

### 1. **Accéder au Dashboard Supabase**
- Allez sur [supabase.com](https://supabase.com)
- Connectez-vous à votre compte
- Sélectionnez votre projet

### 2. **Ouvrir l'éditeur SQL**
- Dans le menu de gauche, cliquez sur **"SQL Editor"**
- Cliquez sur **"New query"**

### 3. **Copier et coller le code SQL**
Copiez le contenu suivant et collez-le dans l'éditeur :

```sql
-- Migration pour mettre à jour la table event_games existante
-- Cette migration ajoute les colonnes manquantes et améliore la structure

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$ 
BEGIN
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

-- Créer la contrainte unique si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'event_games_event_game_unique') THEN
        ALTER TABLE public.event_games
        ADD CONSTRAINT event_games_event_game_unique UNIQUE (event_id, game_id, game_name);
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
```

### 4. **Exécuter la requête**
- Cliquez sur **"Run"** ou appuyez sur **Ctrl+Enter**
- Attendez que la requête se termine
- Vérifiez qu'il n'y a pas d'erreurs

### 5. **Vérifier la mise à jour**
- Allez dans **"Table Editor"** dans le menu de gauche
- Sélectionnez la table **"event_games"**
- Vérifiez que les nouvelles colonnes sont présentes :
  - `experience_level`
  - `estimated_duration`
  - `brought_by_user_id`
  - `notes`
  - `is_custom`
  - `is_optional`

## ✅ Vérification du succès

Après avoir appliqué la migration, vous devriez voir :
- ✅ Nouvelles colonnes ajoutées à la table `event_games`
- ✅ Index de performance créés
- ✅ Politiques RLS mises à jour
- ✅ Contraintes de sécurité appliquées

## 🎯 Test de la fonctionnalité

Une fois la migration appliquée :
1. **Allez sur** http://localhost:3000/create-event
2. **Créez un événement** avec des jeux
3. **Vérifiez** que les jeux sont sauvegardés avec tous les détails
4. **Testez** la participation aux événements
5. **Vérifiez** que les jeux s'affichent correctement

## 🔧 En cas d'erreur

Si vous rencontrez des erreurs :
1. **Vérifiez** que la table `event_games` existe
2. **Vérifiez** que vous avez les permissions d'administration
3. **Contactez** le support Supabase si nécessaire
4. **Appliquez** les modifications une par une si nécessaire
