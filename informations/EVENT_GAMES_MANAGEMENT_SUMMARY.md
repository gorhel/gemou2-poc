# 🎮 Gestion des Jeux dans les Événements - Résumé

## 📋 Critères d'Acceptation Implémentés

### ✅ Recherche et sélection de jeux dans une base de données
- **API de recherche** : `/api/games/search` avec BoardGameGeek
- **Interface de recherche** : Barre de recherche avec résultats en temps réel
- **Sélection facile** : Bouton "Ajouter" pour chaque jeu trouvé
- **Détails complets** : Images, durée, complexité, nombre de joueurs

### ✅ Ajout de jeux personnalisés si non trouvés
- **Jeux personnalisés** : Champ de saisie pour jeux non trouvés
- **Marquage spécial** : Badge "Personnalisé" pour les jeux ajoutés manuellement
- **Flexibilité** : Permet d'ajouter n'importe quel jeu

### ✅ Indication qui apporte quels jeux
- **Sélection de porteur** : "Je l'apporte", "Les participants", "L'organisateur"
- **Gestion des responsabilités** : Clarté sur qui doit apporter chaque jeu
- **Interface intuitive** : Menu déroulant simple

### ✅ Niveau d'expérience requis par jeu
- **4 niveaux** : Débutant, Intermédiaire, Avancé, Expert
- **Indicateurs visuels** : Couleurs distinctes pour chaque niveau
- **Sélection facile** : Menu déroulant avec descriptions

### ✅ Durée estimée par jeu
- **Champ personnalisable** : Durée en minutes (15-480 min)
- **Valeur par défaut** : Durée du jeu depuis BoardGameGeek
- **Flexibilité** : Adaptation selon l'événement

### ✅ Jeux optionnels vs obligatoires
- **Checkbox simple** : "Jeu optionnel" pour chaque jeu
- **Indicateur visuel** : Badge "Optionnel" en bleu
- **Gestion flexible** : Mélange de jeux obligatoires et optionnels

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers
```
apps/web/components/events/GameSelector.tsx
apps/web/app/api/games/search/route.ts
supabase/migrations/20250124000001_create_event_games_table.sql
apply-event-games-migration.sh
```

### Fichiers Modifiés
```
apps/web/components/events/CreateEventForm.tsx
apps/web/components/events/index.ts
```

## 🗄️ Structure de la Base de Données

### Table `event_games`
```sql
CREATE TABLE public.event_games (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    game_id TEXT, -- ID BoardGameGeek (NULL pour jeux personnalisés)
    game_name TEXT NOT NULL,
    game_thumbnail TEXT,
    game_image TEXT,
    year_published INTEGER,
    min_players INTEGER,
    max_players INTEGER,
    playing_time INTEGER, -- Durée en minutes
    complexity DECIMAL(3,2), -- Complexité 1.0-5.0
    is_custom BOOLEAN DEFAULT FALSE,
    is_optional BOOLEAN DEFAULT FALSE,
    experience_level TEXT DEFAULT 'beginner',
    estimated_duration INTEGER, -- Durée estimée pour l'événement
    brought_by_user_id UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎨 Interface Utilisateur

### Composant GameSelector
- **Recherche en temps réel** : Barre de recherche avec résultats instantanés
- **Ajout de jeux** : Bouton "Ajouter" pour chaque résultat
- **Jeux personnalisés** : Section dédiée pour ajouter des jeux manuellement
- **Gestion des jeux sélectionnés** : Interface complète pour configurer chaque jeu

### Configuration par Jeu
```typescript
interface EventGame {
  game_id?: string;           // ID BoardGameGeek
  game_name: string;          // Nom du jeu
  game_thumbnail?: string;    // Image miniature
  game_image?: string;        // Image complète
  year_published?: number;    // Année de publication
  min_players?: number;       // Nombre minimum de joueurs
  max_players?: number;       // Nombre maximum de joueurs
  playing_time?: number;      // Durée standard du jeu
  complexity?: number;        // Complexité 1.0-5.0
  is_custom: boolean;         // Jeu personnalisé
  is_optional: boolean;      // Jeu optionnel
  experience_level: string;   // Niveau requis
  estimated_duration?: number; // Durée estimée pour l'événement
  brought_by_user_id?: string; // Qui apporte le jeu
  notes?: string;             // Notes supplémentaires
}
```

## 🔍 Fonctionnalités de Recherche

### API de Recherche (`/api/games/search`)
- **Source** : BoardGameGeek XML API
- **Recherche** : Par nom de jeu
- **Limite** : 10 résultats par défaut
- **Détails complets** : Images, métadonnées, statistiques

### Résultats de Recherche
- **Affichage** : Image, nom, joueurs, durée, complexité
- **Ajout rapide** : Bouton "Ajouter" pour chaque résultat
- **Informations complètes** : Toutes les données du jeu

## 🎯 Gestion des Jeux

### Jeux de la Base de Données
- **Recherche** : Dans BoardGameGeek
- **Détails automatiques** : Images, durée, complexité
- **Métadonnées** : Année, joueurs, designers, etc.

### Jeux Personnalisés
- **Ajout manuel** : Nom du jeu saisi par l'utilisateur
- **Configuration** : Tous les paramètres configurables
- **Marquage** : Badge "Personnalisé" pour identification

## 🎨 Indicateurs Visuels

### Niveaux d'Expérience
- **Débutant** : Badge vert
- **Intermédiaire** : Badge jaune  
- **Avancé** : Badge orange
- **Expert** : Badge rouge

### Statuts des Jeux
- **Optionnel** : Badge bleu "Optionnel"
- **Personnalisé** : Badge violet "Personnalisé"
- **Durée** : Affichage en minutes

## 🔧 Configuration Technique

### Permissions RLS
```sql
-- Voir tous les jeux des événements
CREATE POLICY "Event games are viewable by everyone" ON public.event_games
    FOR SELECT USING (true);

-- Organisateurs peuvent gérer les jeux de leurs événements
CREATE POLICY "Event organizers can manage games" ON public.event_games
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_games.event_id 
            AND events.creator_id = auth.uid()
        )
    );
```

### API de Recherche
- **Endpoint** : `/api/games/search?q=query&limit=10`
- **Source** : BoardGameGeek XML API
- **Format** : JSON avec détails complets
- **Gestion d'erreurs** : Fallback gracieux

## 🚀 Utilisation

### Pour Ajouter des Jeux à un Événement
1. **Rechercher** : Tapez le nom du jeu dans la barre de recherche
2. **Sélectionner** : Cliquez sur "Ajouter" pour le jeu souhaité
3. **Configurer** : Définir niveau, durée, qui apporte, etc.
4. **Personnaliser** : Ajouter des jeux non trouvés
5. **Finaliser** : Les jeux sont sauvegardés avec l'événement

### Types de Jeux Supportés
- **Jeux de la base** : Recherche dans BoardGameGeek
- **Jeux personnalisés** : Ajout manuel par l'organisateur
- **Jeux optionnels** : Marqués comme non obligatoires
- **Jeux obligatoires** : Par défaut, tous les jeux sont obligatoires

## 📊 Aperçu des Jeux

### Dans le Formulaire de Création
- **Section dédiée** : "Jeux qui seront joués"
- **Interface complète** : Recherche + configuration
- **Aperçu** : Affichage des jeux sélectionnés

### Dans l'Aperçu de l'Événement
- **Liste des jeux** : Avec images et détails
- **Indicateurs** : Niveau, optionnel, personnalisé
- **Durée** : Affichage du temps estimé

## 🎯 Points Clés

- **Recherche intelligente** : API BoardGameGeek intégrée
- **Flexibilité maximale** : Jeux de base + personnalisés
- **Configuration complète** : Tous les paramètres configurables
- **Interface intuitive** : Ajout et configuration faciles
- **Gestion des responsabilités** : Qui apporte quoi
- **Niveaux d'expérience** : Attirer les bonnes personnes
- **Jeux optionnels** : Flexibilité pour les participants

## 🔄 Flux Utilisateur

```
Création d'événement → Recherche de jeux → Sélection → Configuration → Aperçu → Sauvegarde
```

## 📝 Notes Techniques

- **TypeScript** : Interfaces complètes pour type safety
- **React Hooks** : Gestion d'état complexe
- **Supabase** : Base de données avec RLS
- **API externe** : Intégration BoardGameGeek
- **Validation** : Côté client et serveur
- **Performance** : Recherche optimisée avec limite

---

**Status** : ✅ **COMPLET** - Fonctionnalité entièrement implémentée
**Date** : 24 Janvier 2025
**Version** : 1.0.0
