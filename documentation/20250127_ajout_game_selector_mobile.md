# 🎮 Ajout du GameSelector Mobile - Documentation

## 📋 Résumé

Ajout de la section "Jeux qui seront joués (optionnel)" sur la page mobile de création/modification d'événements, en s'inspirant de l'implémentation web présente sur `/create-trade`.

## 🎯 Objectif

Permettre aux utilisateurs de la version mobile d'ajouter des jeux à leurs événements, avec les mêmes fonctionnalités que la version web :
- Recherche de jeux dans la base de données BoardGameGeek
- Ajout de jeux personnalisés
- Configuration détaillée de chaque jeu (niveau d'expérience, durée, notes, etc.)
- Gestion des jeux optionnels

## 📁 Fichiers Créés

### 1. `apps/mobile/components/events/GameSelector.tsx`

Composant React Native pour la sélection et la configuration de jeux.

**Fonctionnalités :**
- ✅ Recherche de jeux via l'API `/api/games/search`
- ✅ Affichage des résultats de recherche avec miniatures
- ✅ Ajout de jeux personnalisés
- ✅ Configuration détaillée de chaque jeu :
  - Niveau d'expérience (Débutant, Intermédiaire, Avancé, Expert)
  - Durée estimée
  - Jeu optionnel (toggle)
  - Notes personnalisées
- ✅ Affichage des badges (niveau, optionnel, personnalisé)
- ✅ Suppression de jeux avec confirmation

**Interface :**
```typescript
interface GameSelectorProps {
  eventId?: string
  onGamesChange: (games: EventGame[]) => void
  initialGames?: EventGame[]
}
```

## 📝 Fichiers Modifiés

### 1. `apps/mobile/app/(tabs)/create-event.tsx`

**Modifications :**
- ✅ Import du composant `GameSelector`
- ✅ Ajout de l'état `selectedGames` pour gérer les jeux sélectionnés
- ✅ Intégration du composant dans le formulaire (après la section Visibilité)
- ✅ Chargement des jeux existants en mode édition
- ✅ Sauvegarde des jeux lors de la création/modification de l'événement

**Changements dans `loadEventData` :**
```typescript
// Charger les jeux associés à l'événement
const { data: eventGames, error: gamesError } = await supabase
  .from('event_games')
  .select('*')
  .eq('event_id', id)

if (!gamesError && eventGames) {
  setSelectedGames(eventGames.map(game => ({
    // Mapping des données...
  })))
}
```

**Changements dans `handleSubmit` :**
- Mode création : insertion des jeux après création de l'événement
- Mode édition : suppression des anciens jeux puis insertion des nouveaux

### 2. `apps/mobile/components/events/index.ts`

**Modifications :**
- ✅ Ajout de l'export `GameSelector`

## 🌳 Structure des Composants

```
create-event.tsx
│
├── Header
│   ├── Bouton Retour
│   └── Titre
│
├── Formulaire
│   ├── Titre *
│   ├── Description *
│   ├── Photo (optionnelle)
│   ├── Date et heure *
│   ├── Lieu *
│   ├── Nombre max de participants *
│   ├── Visibilité
│   │
│   └── 🆕 Jeux qui seront joués (optionnel)
│       └── GameSelector
│           ├── Barre de recherche
│           ├── Résultats de recherche
│           ├── Ajouter jeu personnalisé
│           └── Jeux sélectionnés
│               ├── Carte jeu
│               │   ├── Miniature + Nom
│               │   ├── Bouton Configurer/Réduire
│               │   └── Configuration (si développé)
│               │       ├── Niveau d'expérience
│               │       ├── Durée estimée
│               │       ├── Jeu optionnel (toggle)
│               │       ├── Notes
│               │       └── Badges
│               └── Bouton Supprimer
│
└── Boutons d'action
    ├── Annuler
    └── Créer/Modifier
```

## 🔧 Configuration Technique

### API de Recherche

Le composant utilise l'API web pour rechercher des jeux :
- **Endpoint** : `/api/games/search?q={query}&limit=10`
- **Source** : BoardGameGeek XML API
- **URL de base** : 
  - Développement : `http://localhost:3000` (si `__DEV__`)
  - Production : Variable `EXPO_PUBLIC_WEB_URL` ou `https://gemou2.com`

### Base de Données

Les jeux sont stockés dans la table `event_games` avec les champs suivants :
- `event_id` : ID de l'événement
- `game_id` : ID du jeu (BoardGameGeek ou NULL pour jeux personnalisés)
- `game_name` : Nom du jeu
- `game_thumbnail` / `game_image` : Images du jeu
- `year_published` : Année de publication
- `min_players` / `max_players` : Nombre de joueurs
- `playing_time` : Durée de jeu
- `complexity` : Complexité (1-5)
- `is_custom` : Jeu personnalisé (booléen)
- `is_optional` : Jeu optionnel (booléen)
- `experience_level` : Niveau requis (beginner, intermediate, advanced, expert)
- `estimated_duration` : Durée estimée pour l'événement
- `brought_by_user_id` : Qui apporte le jeu
- `notes` : Notes personnalisées

## 🎨 Design et UX

### Style Mobile-First

Le composant est optimisé pour mobile avec :
- ✅ ScrollView pour gérer le défilement
- ✅ TouchableOpacity pour les interactions tactiles
- ✅ Alert pour les confirmations
- ✅ Switch pour les toggles
- ✅ Design responsive avec espacements adaptés

### Couleurs et Badges

- **Débutant** : Vert (`#d1fae5` / `#065f46`)
- **Intermédiaire** : Jaune (`#fef3c7` / `#92400e`)
- **Avancé** : Orange (`#fed7aa` / `#9a3412`)
- **Expert** : Rouge (`#fee2e2` / `#991b1b`)
- **Optionnel** : Bleu (`#dbeafe` / `#1e40af`)
- **Personnalisé** : Violet (`#e9d5ff` / `#6b21a8`)

## ✅ Tests à Effectuer

1. **Création d'événement :**
   - [ ] Rechercher et ajouter un jeu
   - [ ] Ajouter un jeu personnalisé
   - [ ] Configurer les détails d'un jeu
   - [ ] Créer l'événement et vérifier que les jeux sont sauvegardés

2. **Modification d'événement :**
   - [ ] Charger un événement existant avec des jeux
   - [ ] Modifier les jeux
   - [ ] Ajouter/supprimer des jeux
   - [ ] Sauvegarder et vérifier les modifications

3. **Recherche :**
   - [ ] Tester la recherche avec différents termes
   - [ ] Vérifier l'affichage des résultats
   - [ ] Tester avec une connexion limitée/erreur API

4. **Interface :**
   - [ ] Vérifier le défilement sur différents écrans
   - [ ] Tester les interactions tactiles
   - [ ] Vérifier l'affichage des badges et couleurs

## 🚀 Prochaines Étapes

1. **Améliorations possibles :**
   - Cache local des résultats de recherche
   - Recherche par catégories/mécaniques
   - Suggestions de jeux basées sur les préférences utilisateur
   - Partage de jeux entre événements

2. **Optimisations :**
   - Debounce sur la recherche pour réduire les appels API
   - Lazy loading des images
   - Pagination des résultats de recherche

## 📚 Références

- Composant web équivalent : `apps/web/components/events/GameSelector.tsx`
- API de recherche : `apps/web/app/api/games/search/route.ts`
- Migration base de données : `supabase/migrations/20250124000001_create_event_games_table.sql`

## 📅 Date de Création

27 janvier 2025




