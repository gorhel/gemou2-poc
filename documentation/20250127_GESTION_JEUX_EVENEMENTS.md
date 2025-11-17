# 🎮 Gestion des Jeux dans les Événements

## 📋 Vue d'ensemble

Ce document décrit l'implémentation de la fonctionnalité permettant aux organisateurs d'événements d'ajouter des jeux qui seront présents durant leurs événements. Les jeux peuvent être sélectionnés depuis une liste combinant la base de données locale (`games`) et l'API BoardGameGeek.

## 🏗️ Architecture

### Structure des Composants

```
apps/mobile/
├── app/(tabs)/
│   ├── create-event.tsx          # Formulaire de création/édition d'événement
│   └── events/
│       └── [id].tsx              # Page de détail d'un événement (affiche les jeux)
└── components/events/
    └── GameSelector.tsx          # Composant multiselect avec autocomplétion

apps/web/
└── app/api/games/
    └── search/
        └── route.ts             # API de recherche combinant DB + BoardGameGeek
```

### Arborescence des Composants

#### Page Create Event (`create-event.tsx`)
```
CreateEventPage
├── FormData (titre, description, date, lieu, etc.)
├── ImageUpload
├── DateTimePicker
├── LocationAutocomplete
├── TagSelector
└── GameSelector ⭐
    ├── SearchInput (autocomplétion)
    ├── SearchResults (liste déroulante)
    ├── CustomGameForm (ajout manuel)
    └── SelectedGamesList
        └── GameCard (pour chaque jeu sélectionné)
            ├── GameInfo
            ├── ExperienceLevelSelector
            ├── DurationInput
            ├── OptionalSwitch
            └── NotesTextArea
```

#### Page Event Detail (`events/[id].tsx`)
```
EventDetailsPage
├── EventHeader (image, titre)
├── EventMeta (organisateur, lieu, date, capacité)
├── EventDescription
├── EventGames ⭐
│   └── GameCard[] (pour chaque jeu)
│       ├── GameImage
│       ├── GameTitle
│       ├── GameDetails (année, joueurs, durée)
│       └── GameComplexity
├── EventTags
└── ParticipantsList
```

#### Composant GameSelector (`GameSelector.tsx`)
```
GameSelector
├── SearchContainer
│   ├── TextInput (recherche)
│   └── LoadingIndicator
├── SearchResults (ScrollView)
│   └── SearchResultItem[]
│       ├── GameThumbnail
│       ├── GameName
│       ├── GameDetails
│       └── AddButton
├── CustomGameSection
│   ├── AddCustomButton
│   └── CustomGameForm
└── SelectedGamesContainer
    └── SelectedGameCard[]
        ├── GameHeader
        ├── ExpandButton
        └── GameConfig (si développé)
            ├── ExperienceLevelButtons
            ├── DurationInput
            ├── OptionalSwitch
            └── NotesTextArea
```

## 🔄 Flux de Données

### 1. Recherche de Jeux

```
Utilisateur tape dans le champ de recherche
    ↓
GameSelector.handleSearchChange()
    ↓
API: GET /api/games/search?q={query}&limit=10
    ↓
GameSearchService.searchDatabaseGames() ──┐
    ↓                                    │
Recherche dans table 'games'             │
    ↓                                    │
BoardGameGeekSearchService.searchGames()│
    ↓                                    │
Recherche via API BoardGameGeek          │
    ↓                                    │
Combinaison et déduplication ────────────┘
    ↓
Retourne résultats combinés
    ↓
Affichage dans SearchResults
```

### 2. Ajout d'un Jeu

```
Utilisateur clique sur "Ajouter" dans les résultats
    ↓
GameSelector.addGame(game)
    ↓
Création d'un EventGame avec données du jeu
    ↓
Ajout à selectedGames[]
    ↓
onGamesChange(selectedGames) → parent
    ↓
Stockage dans le state du formulaire
```

### 3. Sauvegarde des Jeux

```
Utilisateur soumet le formulaire
    ↓
CreateEventPage.handleSubmit()
    ↓
Création/Mise à jour de l'événement
    ↓
Suppression des anciens jeux (si édition)
    ↓
Insertion des jeux dans event_games
    ↓
Chaque jeu contient:
    - event_id
    - game_id (BGG ID ou NULL)
    - game_name
    - game_thumbnail/image
    - year_published
    - min/max_players
    - playing_time
    - complexity
    - is_custom
    - is_optional
    - experience_level
    - estimated_duration
    - brought_by_user_id
    - notes
```

### 4. Affichage des Jeux sur Event Detail

```
EventDetailsPage.loadEvent()
    ↓
Requête Supabase: SELECT * FROM event_games WHERE event_id = {id}
    ↓
Stockage dans eventGames[]
    ↓
Rendu dans la section "Jeux"
    ↓
Affichage de chaque jeu avec:
    - Image (si disponible)
    - Nom
    - Année de publication
    - Nombre de joueurs
    - Durée
    - Complexité
```

## 🗄️ Structure de la Base de Données

### Table `event_games`

```sql
CREATE TABLE public.event_games (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    game_id TEXT,                    -- ID BoardGameGeek (NULL pour jeux personnalisés)
    game_name TEXT NOT NULL,
    game_thumbnail TEXT,
    game_image TEXT,
    year_published INTEGER,
    min_players INTEGER,
    max_players INTEGER,
    playing_time INTEGER,             -- Durée en minutes
    complexity DECIMAL(3,2),         -- Complexité 1.0-5.0
    is_custom BOOLEAN DEFAULT FALSE,
    is_optional BOOLEAN DEFAULT FALSE,
    experience_level TEXT DEFAULT 'beginner',
    estimated_duration INTEGER,
    brought_by_user_id UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table `games` (référence)

```sql
CREATE TABLE public.games (
    id UUID PRIMARY KEY,
    bgg_id TEXT,                      -- ID BoardGameGeek
    name TEXT NOT NULL,
    description TEXT,
    min_players INTEGER,
    max_players INTEGER,
    duration_min INTEGER,
    photo_url TEXT,
    data JSONB DEFAULT '{}'          -- Données supplémentaires
);
```

## 🔌 API Endpoints

### GET `/api/games/search`

**Paramètres:**
- `q` (requis): Terme de recherche
- `limit` (optionnel): Nombre maximum de résultats (défaut: 10)

**Réponse:**
```json
{
  "games": [
    {
      "id": "12345",
      "dbId": "uuid-from-db",
      "name": "Catan",
      "yearPublished": "1995",
      "minPlayers": 3,
      "maxPlayers": 4,
      "playingTime": 90,
      "image": "https://...",
      "thumbnail": "https://...",
      "complexity": 2.3,
      "source": "database" | "bgg"
    }
  ]
}
```

**Logique de recherche:**
1. Recherche parallèle dans `games` (DB) et BoardGameGeek API
2. Priorisation des résultats de la DB
3. Déduplication par `bgg_id` ou `name`
4. Limitation du nombre total de résultats

## 🎨 Interface Utilisateur

### GameSelector - Caractéristiques

1. **Recherche en temps réel**
   - Déclenchement après 2 caractères
   - Debounce intégré
   - Indicateur de chargement

2. **Résultats de recherche**
   - Liste déroulante avec scroll
   - Affichage de la miniature
   - Informations essentielles (joueurs, durée, complexité)
   - Bouton "Ajouter" pour chaque résultat

3. **Jeux personnalisés**
   - Section dédiée pour ajouter manuellement
   - Formulaire simple avec nom du jeu
   - Marqué comme `is_custom: true`

4. **Gestion des jeux sélectionnés**
   - Liste des jeux ajoutés
   - Configuration détaillée par jeu:
     - Niveau d'expérience (débutant/intermédiaire/avancé/expert)
     - Durée estimée
     - Jeu optionnel (switch)
     - Notes additionnelles
   - Suppression avec confirmation

### Event Detail - Affichage des Jeux

- **Section dédiée** "Jeux"
- **État vide**: Message "Aucun jeu spécifié"
- **Liste des jeux**:
  - Carte par jeu avec image
  - Informations complètes
  - Navigation vers détail du jeu (TODO)

## 🔐 Sécurité et Permissions

### Row Level Security (RLS)

```sql
-- Lecture: Tous les utilisateurs peuvent voir les jeux des événements
CREATE POLICY "Event games are viewable by everyone" 
ON public.event_games FOR SELECT USING (true);

-- Écriture: Seuls les organisateurs peuvent gérer les jeux
CREATE POLICY "Event organizers can manage games" 
ON public.event_games FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = event_games.event_id 
        AND events.creator_id = auth.uid()
    )
);
```

## 📱 Responsive et Mobile-First

- **Mobile**: Interface optimisée pour petits écrans
- **ScrollView** pour les listes longues
- **Touch targets** adaptés (minimum 44x44px)
- **Images** avec fallback si absentes

## 🚀 Utilisation

### Pour l'organisateur

1. **Créer/Modifier un événement**
   - Aller sur `/create-event`
   - Section "Jeux qui seront joués (optionnel)"
   - Rechercher un jeu dans le champ
   - Cliquer sur "Ajouter" pour le jeu souhaité
   - Configurer les options (niveau, durée, etc.)
   - Sauvegarder l'événement

2. **Ajouter un jeu personnalisé**
   - Cliquer sur "➕ Ajouter un jeu personnalisé"
   - Entrer le nom du jeu
   - Cliquer sur "Ajouter"

### Pour les participants

1. **Voir les jeux d'un événement**
   - Aller sur `/events/{id}`
   - Section "Jeux" affiche tous les jeux
   - Informations complètes pour chaque jeu

## 🔮 Évolutions Futures

1. **Tags liés aux types de jeux**
   - Affichage automatique des tags basés sur les catégories des jeux
   - Filtrage par type de jeu

2. **Navigation vers détail du jeu**
   - Page dédiée pour chaque jeu
   - Informations complètes depuis BGG ou DB

3. **Synchronisation DB ↔ BGG**
   - Mise en cache des jeux BGG dans la DB
   - Mise à jour périodique des données

4. **Recommandations de jeux**
   - Suggestions basées sur les jeux déjà sélectionnés
   - Compatibilité entre jeux

## 📝 Notes Techniques

- **Performance**: Recherche parallèle DB + API pour rapidité
- **Déduplication**: Évite les doublons entre DB et BGG
- **Fallback**: Si API BGG échoue, seule la DB est utilisée
- **Validation**: Vérification des données avant insertion
- **Types**: TypeScript strict pour sécurité des types

## 🐛 Gestion d'Erreurs

- **API BGG indisponible**: Fallback sur DB uniquement
- **Jeu non trouvé**: Message d'erreur clair
- **Erreur de sauvegarde**: Modal d'erreur avec message
- **Connexion perdue**: Gestion gracieuse avec retry



