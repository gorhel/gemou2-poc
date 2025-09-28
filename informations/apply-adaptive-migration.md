# 🔧 Migration Adaptative pour la Table event_games

## 📋 Description

Cette migration adaptative a été créée pour modifier la table `event_games` existante de manière sécurisée. Elle vérifie automatiquement l'état actuel de la table et applique uniquement les modifications nécessaires.

## ✅ Fonctionnalités de la Migration

### 🔍 Vérifications Automatiques
- ✅ Vérifie l'existence de la table `event_games`
- ✅ Vérifie l'existence de chaque colonne avant de l'ajouter
- ✅ Vérifie l'existence des index avant de les créer
- ✅ Vérifie l'existence des contraintes avant de les ajouter
- ✅ Messages informatifs pour chaque opération

### 🏗️ Modifications Appliquées
- ✅ Ajout des colonnes manquantes (game_name, game_thumbnail, etc.)
- ✅ Création des index de performance
- ✅ Mise à jour des politiques RLS
- ✅ Ajout des commentaires sur la table et les colonnes

## 🚀 Comment Appliquer la Migration

### Option 1: Via Supabase CLI (Recommandé)

```bash
# 1. Aller dans le dossier du projet
cd /Users/essykouame/Downloads/gemou2-poc

# 2. Vérifier que Supabase est démarré
supabase status

# 3. Appliquer la migration
supabase db push

# 4. Vérifier le statut
supabase db diff
```

### Option 2: Via Dashboard Supabase

1. **Ouvrir le Dashboard Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Connectez-vous et sélectionnez votre projet

2. **Accéder à l'éditeur SQL**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New query"

3. **Copier le contenu de la migration**
   ```bash
   # Le contenu se trouve dans :
   /Users/essykouame/Downloads/gemou2-poc/supabase/migrations/20250125000000_adaptive_event_games_update.sql
   ```

4. **Exécuter la requête**
   - Collez le contenu dans l'éditeur
   - Cliquez sur "Run" ou appuyez sur Ctrl+Enter

## 📊 Colonnes Ajoutées

| Colonne | Type | Description | Valeur par défaut |
|---------|------|-------------|-------------------|
| `game_name` | TEXT | Nom du jeu | - |
| `game_thumbnail` | TEXT | URL de la miniature | - |
| `game_image` | TEXT | URL de l'image principale | - |
| `year_published` | INTEGER | Année de publication | - |
| `min_players` | INTEGER | Nombre minimum de joueurs | - |
| `max_players` | INTEGER | Nombre maximum de joueurs | - |
| `playing_time` | INTEGER | Durée de jeu en minutes | - |
| `complexity` | DECIMAL(3,2) | Niveau de complexité (1.0-5.0) | - |
| `experience_level` | TEXT | Niveau d'expérience requis | 'beginner' |
| `estimated_duration` | INTEGER | Durée estimée pour l'événement | - |
| `brought_by_user_id` | UUID | Utilisateur qui apporte le jeu | - |
| `notes` | TEXT | Notes supplémentaires | - |
| `is_custom` | BOOLEAN | Jeu personnalisé | FALSE |
| `is_optional` | BOOLEAN | Jeu optionnel | FALSE |

## 🔒 Sécurité (RLS)

### Politiques Appliquées
- ✅ **Lecture** : Tous les utilisateurs peuvent voir les jeux des événements
- ✅ **Insertion** : Seuls les organisateurs peuvent ajouter des jeux à leurs événements
- ✅ **Modification** : Seuls les organisateurs peuvent modifier les jeux de leurs événements
- ✅ **Suppression** : Seuls les organisateurs peuvent supprimer les jeux de leurs événements

## 🎯 Index de Performance

| Index | Colonnes | Description |
|-------|----------|-------------|
| `idx_event_games_event_id` | event_id | Recherche rapide par événement |
| `idx_event_games_game_id` | game_id | Recherche rapide par jeu |
| `idx_event_games_brought_by` | brought_by_user_id | Recherche par utilisateur |

## 🧪 Test de la Migration

Après avoir appliqué la migration :

1. **Vérifier la structure**
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'event_games'
   ORDER BY ordinal_position;
   ```

2. **Tester la création d'un événement avec des jeux**
   - Allez sur http://localhost:3000/create-event
   - Créez un événement avec des jeux
   - Vérifiez que les jeux sont sauvegardés

3. **Vérifier les politiques RLS**
   ```sql
   SELECT policyname, cmd, qual
   FROM pg_policies
   WHERE tablename = 'event_games';
   ```

## ⚠️ En Cas d'Erreur

### Erreur "Table n'existe pas"
- Vérifiez que la table `event_games` a été créée au préalable
- Exécutez d'abord la migration `20250124000001_create_event_games_table.sql`

### Erreur de Permissions
- Vérifiez que vous êtes connecté en tant qu'administrateur
- Vérifiez les permissions dans Supabase > Settings > Database

### Erreur de Contrainte
- La migration gère automatiquement les contraintes existantes
- Les messages informatifs vous indiqueront ce qui a été fait

## 📝 Logs de la Migration

La migration affiche des messages informatifs pour chaque opération :

```
NOTICE: Colonne game_name ajoutée
NOTICE: Colonne game_thumbnail existe déjà
NOTICE: Index idx_event_games_event_id créé
NOTICE: Politiques RLS mises à jour
NOTICE: Migration adaptative event_games terminée avec succès !
```

## ✅ Vérification du Succès

Après la migration, vous devriez voir :
- ✅ Toutes les colonnes présentes dans la table
- ✅ Index créés pour les performances
- ✅ Politiques RLS actives
- ✅ Commentaires sur la table et les colonnes

## 🎮 Prochaines Étapes

1. **Tester la création d'événements** avec des jeux
2. **Vérifier l'affichage** des jeux dans l'interface
3. **Tester la participation** aux événements
4. **Vérifier les performances** des requêtes
