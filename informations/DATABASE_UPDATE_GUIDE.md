# 🔄 Guide de Mise à Jour de la Base de Données

## 📋 Problème Identifié
La base de données n'est pas à jour avec les dernières modifications. Voici comment la synchroniser.

## 🔍 Étape 1 : Vérifier l'État Actuel

### Option A : Script Automatique
```bash
cd /Users/essykouame/Downloads/gemou2-poc
node check-database-status.js
```

### Option B : Vérification Manuelle
1. **Allez sur** [supabase.com](https://supabase.com)
2. **Ouvrez** votre projet
3. **Allez dans** "Table Editor"
4. **Vérifiez** que ces tables existent :
   - ✅ `profiles`
   - ✅ `events`
   - ✅ `event_participants`
   - ❓ `event_games` (peut manquer ou être incomplète)

## 🔧 Étape 2 : Synchroniser la Base de Données

### Option A : Script Automatique (Recommandée)
```bash
cd /Users/essykouame/Downloads/gemou2-poc
./sync-database.sh
```

### Option B : Synchronisation Manuelle
```bash
cd /Users/essykouame/Downloads/gemou2-poc
supabase db push
```

### Option C : Dashboard Supabase
1. **Allez sur** [supabase.com](https://supabase.com)
2. **Ouvrez** "SQL Editor"
3. **Copiez et exécutez** le contenu de `supabase/migrations/20250124000004_simple_event_games_update.sql`

## 📦 Étape 3 : Appliquer les Migrations Manquantes

### Migration Simple (Recommandée)
Copiez et exécutez ce SQL dans le Dashboard Supabase :

```sql
-- Migration simple pour la table event_games
-- Cette migration ajoute seulement les colonnes essentielles

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
```

## ✅ Étape 4 : Vérifier la Mise à Jour

### Vérification Automatique
```bash
cd /Users/essykouame/Downloads/gemou2-poc
node check-database-status.js
```

### Vérification Manuelle
1. **Allez sur** [supabase.com](https://supabase.com)
2. **Ouvrez** "Table Editor"
3. **Vérifiez** que la table `event_games` a toutes les colonnes :
   - ✅ `event_id`
   - ✅ `game_id`
   - ✅ `game_name`
   - ✅ `game_thumbnail`
   - ✅ `game_image`
   - ✅ `year_published`
   - ✅ `min_players`
   - ✅ `max_players`
   - ✅ `playing_time`
   - ✅ `complexity`
   - ✅ `experience_level`
   - ✅ `estimated_duration`
   - ✅ `brought_by_user_id`
   - ✅ `notes`
   - ✅ `is_custom`
   - ✅ `is_optional`

## 🎯 Étape 5 : Tester la Fonctionnalité

### Test de Création d'Événement avec Jeux
1. **Allez sur** http://localhost:3000/create-event
2. **Remplissez** le formulaire de base
3. **Dans la section "Jeux"** :
   - Recherchez "Catan" ou "Wingspan"
   - Ajoutez des jeux
   - Configurez les détails
4. **Créez** l'événement
5. **Vérifiez** que les jeux sont sauvegardés

### Test de Participation
1. **Allez sur** http://localhost:3000/dashboard
2. **Cliquez** sur "Rejoindre" pour un événement
3. **Vérifiez** que le compteur se met à jour
4. **Rechargez** la page pour vérifier la persistance

## 🔧 En Cas de Problème

### Erreur de Connexion
```bash
# Vérifier la configuration
supabase status
supabase link
```

### Erreur de Migration
1. **Appliquez manuellement** via le Dashboard Supabase
2. **Vérifiez** les permissions de votre projet
3. **Contactez** le support Supabase si nécessaire

### Données Manquantes
1. **Vérifiez** que les migrations ont été appliquées
2. **Rafraîchissez** la page du Dashboard
3. **Vérifiez** les politiques RLS

## 📊 Résultat Attendu

Après la mise à jour, vous devriez avoir :
- ✅ **Table `event_games`** complète avec toutes les colonnes
- ✅ **Index de performance** créés
- ✅ **Politiques RLS** configurées
- ✅ **Fonctionnalité de gestion des jeux** opérationnelle
- ✅ **Participation aux événements** persistante

## 🚀 Prochaines Étapes

Une fois la base de données mise à jour :
1. **Testez** la création d'événements avec des jeux
2. **Testez** la participation aux événements
3. **Vérifiez** que les données sont persistantes
4. **Déployez** en production si nécessaire

---

**Status** : 🔄 **EN COURS** - Mise à jour de la base de données
**Date** : 24 Janvier 2025
**Version** : 1.0.0
