# 🔧 Correction du Problème UUID sur event_games

**Date:** 15 novembre 2025  
**Problème:** `Invalid input syntax for type uuid : "68448"`

## 🎯 Analyse du Problème

### Cause Racine
Il existe un conflit dans la définition de la table `event_games` :

1. **Migration 20250124000001** : Définit `game_id` comme `TEXT` (pour les IDs BoardGameGeek comme "68448")
2. **Migration 20250917170000** : A recréé la table avec `game_id` comme `UUID` (référence vers une table `games`)

Le code frontend utilise correctement l'ID BoardGameGeek (string "68448"), mais la base de données attend un UUID, d'où l'erreur.

## 🛠️ Solution

### Option 1 : Via le Dashboard Supabase (Recommandé)

#### Étape 1 : Accéder au SQL Editor
1. Ouvrez votre projet Supabase : https://supabase.com/dashboard/project/qpnofwgxjgvmpwdrhzid
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête

#### Étape 2 : Exécuter le Script de Correction
Copiez et exécutez le script suivant :

```sql
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
DROP POLICY IF EXISTS "Event games are viewable by everyone" ON public.event_games;
CREATE POLICY "Event games are viewable by everyone" ON public.event_games
    FOR SELECT
    USING (true);

-- Les organisateurs d'événements peuvent ajouter des jeux
DROP POLICY IF EXISTS "Event organizers can add games" ON public.event_games;
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
DROP POLICY IF EXISTS "Event organizers can update games" ON public.event_games;
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
DROP POLICY IF EXISTS "Event organizers can delete games" ON public.event_games;
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
```

#### Étape 3 : Vérifier la Correction
Exécutez cette requête pour vérifier que la structure est correcte :

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'event_games' 
ORDER BY ordinal_position;
```

Vous devriez voir `game_id` avec le type `text` et non `uuid`.

### Option 2 : Via Supabase CLI (Quand le Pool de Connexions sera Disponible)

Attendre que le problème de timeout de connexion soit résolu, puis :

```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735
npx supabase db push --linked
```

## 📊 Structure Finale Attendue

### Table event_games
| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `event_id` | UUID | Référence vers `events(id)` |
| `game_id` | **TEXT** | ID BoardGameGeek (ex: "68448") ou NULL pour jeux personnalisés |
| `game_name` | TEXT | Nom du jeu |
| `game_thumbnail` | TEXT | URL de la miniature |
| `game_image` | TEXT | URL de l'image complète |
| `year_published` | INTEGER | Année de publication |
| `min_players` | INTEGER | Nombre minimum de joueurs |
| `max_players` | INTEGER | Nombre maximum de joueurs |
| `playing_time` | INTEGER | Durée de jeu en minutes |
| `complexity` | DECIMAL(3,2) | Complexité (1.0-5.0) |
| `is_custom` | BOOLEAN | TRUE si jeu personnalisé |
| `is_optional` | BOOLEAN | TRUE si jeu optionnel |
| `experience_level` | TEXT | Niveau requis (beginner/intermediate/advanced/expert) |
| `estimated_duration` | INTEGER | Durée estimée pour l'événement |
| `brought_by_user_id` | UUID | Qui apporte le jeu |
| `notes` | TEXT | Notes supplémentaires |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de modification |

## 🔍 Pourquoi game_id Doit Être TEXT ?

BoardGameGeek utilise des identifiants numériques comme chaînes de caractères (ex: "68448", "174430", "167791"). Ces IDs ne sont **pas des UUIDs** et ne peuvent pas être convertis en UUID.

Notre application :
1. Recherche des jeux dans l'API BoardGameGeek
2. Récupère l'ID du jeu (format string numérique)
3. Stocke cet ID dans `game_id` pour référence future
4. Pour les jeux personnalisés, `game_id` est NULL

## ✅ Tests de Validation

Après avoir appliqué la correction, testez :

1. **Ajouter un jeu BoardGameGeek à un événement**
   - Créer un événement
   - Rechercher un jeu (ex: "Catan")
   - L'ajouter à l'événement
   - ✅ Devrait fonctionner sans erreur UUID

2. **Ajouter un jeu personnalisé**
   - Créer un événement
   - Ajouter un jeu personnalisé
   - ✅ Devrait s'enregistrer avec `game_id = NULL`

3. **Vérifier les politiques RLS**
   - En tant qu'organisateur : ajouter/modifier/supprimer des jeux ✅
   - En tant que participant : voir les jeux ✅
   - En tant que non-participant : voir les jeux publics ✅

## 🚨 Notes Importantes

1. **Perte de données** : Cette migration supprime et recrée la table. Les jeux déjà ajoutés aux événements seront perdus.

2. **Migration précédente problématique** : La migration `20250917170000_update_schema_out123.sql` a créé une définition incompatible qui devrait être corrigée dans les futures migrations.

3. **Synchronisation** : Après avoir appliqué cette correction via le dashboard, marquez la migration comme appliquée localement :
   ```bash
   npx supabase migration repair --status applied 20251115000001
   ```

## 📝 Fichiers Modifiés

- ✅ `supabase/migrations/20251115000001_fix_event_games_conflict.sql` - Migration de correction
- ✅ `informations/2025-11-15_CORRECTION_EVENT_GAMES_UUID_ERROR.md` - Ce guide

## 🔗 Références

- Issue originale : Ajout de jeux aux événements
- Migration initiale correcte : `20250124000001_create_event_games_table.sql`
- Migration problématique : `20250917170000_update_schema_out123.sql`
- Documentation BoardGameGeek API : https://boardgamegeek.com/wiki/page/BGG_XML_API2




