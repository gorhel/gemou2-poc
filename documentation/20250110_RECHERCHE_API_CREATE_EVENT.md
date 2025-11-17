# Documentation : Recherche de jeux via API sur `/create-event`

**Date de création** : 10 janvier 2025

## Vue d'ensemble

La fonctionnalité de recherche de jeux sur la page `/create-event` permet aux utilisateurs de rechercher et d'ajouter des jeux de société à leurs événements. La recherche combine deux sources de données :
1. **Base de données locale** (Supabase)
2. **API BoardGameGeek** (BGG) - la plus grande base de données de jeux de société au monde

## Architecture du flux de recherche

### Structure des composants

#### Arbre de structure complet

```
📁 /create-event (Route)
│
├── 🌐 WEB (apps/web/)
│   │
│   ├── 📄 app/create-event/page.tsx
│   │   ├── ResponsiveLayout (wrapper)
│   │   ├── Vérification authentification
│   │   └── CreateEventForm
│   │
│   └── 📦 components/events/
│       │
│       ├── CreateEventForm.tsx
│       │   ├── État: formData (titre, description, date, lieu, etc.)
│       │   ├── État: selectedGames (EventGame[])
│       │   ├── État: loading, errors
│       │   ├── DateTimePicker (composant UI)
│       │   ├── LocationAutocomplete (composant UI)
│       │   └── GameSelector ⭐ (composant de recherche)
│       │
│       └── GameSelector.tsx ⭐ (COMPOSANT PRINCIPAL DE RECHERCHE)
│           ├── État: searchQuery (string)
│           ├── État: searchResults (BoardGame[])
│           ├── État: selectedGames (EventGame[])
│           ├── État: loading (boolean)
│           ├── État: showAddCustom (boolean)
│           ├── Fonction: searchGames() → Appel API /api/games/search
│           ├── Fonction: handleSearchChange() → Déclenche searchGames()
│           ├── Fonction: addGame() → Ajoute un jeu aux sélectionnés
│           ├── Fonction: addCustomGame() → Ajoute un jeu personnalisé
│           ├── Fonction: removeGame() → Retire un jeu
│           ├── Fonction: updateGame() → Met à jour les propriétés d'un jeu
│           ├── UI: Champ de recherche avec indicateur de chargement
│           ├── UI: Liste des résultats de recherche
│           ├── UI: Bouton "Ajouter un jeu personnalisé"
│           └── UI: Liste des jeux sélectionnés avec configuration
│
└── 📱 MOBILE (apps/mobile/)
    │
    ├── 📄 app/(tabs)/create-event.tsx
    │   ├── État: formData (titre, description, date, lieu, etc.)
    │   ├── État: selectedGames (EventGame[])
    │   ├── État: selectedTags (string[])
    │   ├── État: imageUri, uploadingImage
    │   ├── État: loading, submitting, errors
    │   ├── DateTimePicker (composant UI)
    │   ├── LocationAutocomplete (composant UI)
    │   ├── TagSelector (composant UI)
    │   └── GameSelector ⭐ (composant de recherche)
    │
    └── 📦 components/events/
        │
        └── GameSelector.tsx ⭐ (COMPOSANT PRINCIPAL DE RECHERCHE)
            ├── État: searchQuery (string)
            ├── État: searchResults (BoardGame[])
            ├── État: selectedGames (EventGame[])
            ├── État: loading (boolean)
            ├── État: showAddCustom (boolean)
            ├── État: expandedGameIndex (number | null)
            ├── Fonction: searchGames() → Recherche locale + API web (fallback)
            ├── Fonction: handleSearchChange() → Déclenche searchGames()
            ├── Fonction: addGame() → Ajoute un jeu aux sélectionnés
            ├── Fonction: addCustomGame() → Ajoute un jeu personnalisé
            ├── Fonction: removeGame() → Retire un jeu (avec confirmation)
            ├── Fonction: updateGame() → Met à jour les propriétés d'un jeu
            ├── UI: TextInput de recherche avec ActivityIndicator
            ├── UI: ScrollView des résultats de recherche
            ├── UI: Bouton "Ajouter un jeu personnalisé"
            └── UI: Liste des jeux sélectionnés avec configuration expandable

🔌 API ROUTE
│
└── 📄 apps/web/app/api/games/search/route.ts
    │
    ├── GET(request: NextRequest) → NextResponse
    │   ├── Extraction: query (q), limit
    │   ├── Validation: query requis
    │   ├── Appel parallèle: Promise.all([dbGames, bggGames])
    │   ├── Fusion et déduplication des résultats
    │   └── Retour: { games: BoardGame[] }
    │
    ├── 🔍 GameSearchService (classe)
    │   ├── Constructor: Initialise client Supabase
    │   └── searchDatabaseGames(query, limit)
    │       ├── Requête Supabase: .from('games').ilike('name', `%${query}%`)
    │       ├── Sélection: id, bgg_id, name, description, min_players, etc.
    │       └── Transformation: Format DB → Format BoardGame
    │
    └── 🌍 BoardGameGeekSearchService (classe)
        ├── Constructor: baseUrl = 'https://boardgamegeek.com/xmlapi2'
        ├── searchGames(query, limit)
        │   ├── Requête BGG: /search?query={query}&type=boardgame
        │   ├── Parsing XML → JSON
        │   ├── Extraction: gameId, name, yearPublished
        │   └── Pour chaque jeu: getGameDetails(gameId)
        │
        └── getGameDetails(gameId) (privé)
            ├── Requête BGG: /boardgame/{id}?stats=1
            ├── Parsing XML → JSON
            ├── Extraction: name, yearPublished, minPlayers, maxPlayers, etc.
            ├── Extraction: image, thumbnail, description
            ├── Extraction: categories, mechanics, designers, artists, publishers
            ├── Extraction: averageRating, usersRated, rank, complexity
            └── Retour: Objet BoardGame complet
```

### Diagramme de flux de recherche

```
┌─────────────────────────────────────────────────────────────────┐
│                    UTILISATEUR SAISIT DU TEXTE                 │
│                    (minimum 2 caractères)                      │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   GameSelector Component      │
         │   handleSearchChange()        │
         └───────────┬───────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────┐
    │     VERSION WEB vs MOBILE          │
    └────┬───────────────────┬───────────┘
         │                   │
         ▼                   ▼
    ┌─────────┐        ┌──────────┐
    │   WEB   │        │  MOBILE  │
    └────┬────┘        └────┬─────┘
         │                  │
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌──────────────────────┐
│ Appel direct    │  │ 1. Recherche locale   │
│ /api/games/     │  │    Supabase DB        │
│ search           │  │                      │
└────────┬────────┘  │ 2. Si disponible:    │
         │            │    Appel API web      │
         │            │    (timeout 3s)       │
         │            └──────────┬───────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────┐
│     API Route: /api/games/search            │
│     GET(request)                            │
└───────────────┬─────────────────────────────┘
                │
                ▼
    ┌───────────────────────────┐
    │   Promise.all([           │
    │     dbGames,              │
    │     bggGames              │
    │   ])                      │
    └───────┬───────────┬───────┘
            │           │
            ▼           ▼
    ┌─────────────┐  ┌──────────────────────┐
    │ GameSearch │  │ BoardGameGeekSearch   │
    │ Service    │  │ Service               │
    └─────┬───────┘  └──────────┬───────────┘
          │                     │
          ▼                     ▼
    ┌─────────────┐      ┌──────────────────┐
    │ Supabase    │      │ BGG XML API      │
    │ .from('games')│      │ /search?query=... │
    │ .ilike('name')│      │                  │
    └─────┬───────┘      └────────┬──────────┘
          │                      │
          │                      ▼
          │              ┌──────────────────┐
          │              │ Pour chaque jeu: │
          │              │ getGameDetails() │
          │              │ /boardgame/{id}  │
          │              └────────┬──────────┘
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │ Fusion & Déduplication│
          │ - Priorité DB        │
          │ - Éviter doublons   │
          │ - Limiter résultats │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   Retour JSON        │
          │   { games: [...] }    │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Affichage résultats │
          │  dans GameSelector   │
          └──────────┬────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Utilisateur clique  │
          │  "Ajouter"           │
          └──────────┬────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Jeu ajouté à        │
          │  selectedGames[]     │
          └──────────────────────┘
```

## Flux de recherche détaillé

### 1. Version Web (`apps/web`)

#### Étape 1 : Saisie utilisateur
L'utilisateur saisit du texte dans le champ de recherche du composant `GameSelector`.

```78:101:apps/web/components/events/GameSelector.tsx
  const searchGames = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      setSearchResults(data.games || []);
    } catch (error) {
      console.error('Error searching games:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
```

**Caractéristiques** :
- Déclenchement automatique à chaque changement de texte
- Minimum 2 caractères requis pour lancer la recherche
- Limite de 10 résultats par défaut
- Gestion des erreurs avec fallback sur tableau vide

#### Étape 2 : Appel API
L'API `/api/games/search` est appelée avec les paramètres :
- `q` : la requête de recherche (encodée en URI)
- `limit` : nombre maximum de résultats (défaut: 10)

#### Étape 3 : Traitement côté serveur
L'API route (`apps/web/app/api/games/search/route.ts`) effectue une recherche parallèle :

```234:238:apps/web/app/api/games/search/route.ts
    // Rechercher dans la base de données ET dans BoardGameGeek en parallèle
    const [dbGames, bggGames] = await Promise.all([
      gameSearchService.searchDatabaseGames(query, Math.ceil(limit / 2)),
      boardGameGeekSearchService.searchGames(query, Math.ceil(limit / 2))
    ]);
```

**Recherche en base de données locale** :
```17:48:apps/web/app/api/games/search/route.ts
  async searchDatabaseGames(query: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('games')
        .select('id, bgg_id, name, description, min_players, max_players, duration_min, photo_url, data')
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) {
        console.error('Error searching database games:', error);
        return [];
      }

      return (data || []).map(game => ({
        id: game.bgg_id || game.id,
        dbId: game.id,
        name: game.name,
        yearPublished: game.data?.yearPublished || '',
        minPlayers: game.min_players || 0,
        maxPlayers: game.max_players || 0,
        playingTime: game.duration_min || 0,
        image: game.photo_url || '',
        thumbnail: game.photo_url || '',
        description: game.description || '',
        complexity: game.data?.complexity || 0,
        source: 'database'
      }));
    } catch (error) {
      console.error('Error searching database games:', error);
      return [];
    }
  }
```

**Recherche BoardGameGeek** :
```56:98:apps/web/app/api/games/search/route.ts
  async searchGames(query: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}&type=boardgame`,
        {
          headers: {
            'User-Agent': 'Gémou2/1.0 (https://gemou2.com)',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const items = xmlDoc.getElementsByTagName('item');
      const games = [];

      for (let i = 0; i < Math.min(items.length, limit); i++) {
        const item = items[i];
        const gameId = item.getAttribute('id');
        const name = item.getElementsByTagName('name')[0]?.getAttribute('value') || '';
        const yearPublished = item.getElementsByTagName('yearpublished')[0]?.getAttribute('value') || '';

        if (gameId && name) {
          // Récupérer les détails du jeu
          const gameDetails = await this.getGameDetails(gameId);
          if (gameDetails) {
            games.push(gameDetails);
          }
        }
      }

      return games;
    } catch (error) {
      console.error('Error searching games:', error);
      return [];
    }
  }
```

**Détails BGG** : Pour chaque jeu trouvé, l'API récupère les détails complets via `getGameDetails()` :
- Informations de base (nom, année, joueurs, durée)
- Images (thumbnail et image complète)
- Catégories, mécaniques, designers, artistes, éditeurs
- Statistiques (note moyenne, complexité, classement)

#### Étape 4 : Fusion et déduplication
Les résultats sont combinés en évitant les doublons :

```240:257:apps/web/app/api/games/search/route.ts
    // Combiner les résultats, en priorisant ceux de la DB
    // Éviter les doublons en utilisant le bgg_id ou le nom
    const allGames = [...dbGames];
    const dbGameIds = new Set(dbGames.map(g => g.id?.toString().toLowerCase()));
    const dbGameNames = new Set(dbGames.map(g => g.name?.toLowerCase()));

    for (const bggGame of bggGames) {
      const bggId = bggGame.id?.toString().toLowerCase();
      const bggName = bggGame.name?.toLowerCase();
      
      // Ajouter seulement si ce n'est pas déjà dans la DB
      if (!dbGameIds.has(bggId) && !dbGameNames.has(bggName)) {
        allGames.push({ ...bggGame, source: 'bgg' });
      }
    }

    // Limiter le nombre total de résultats
    const games = allGames.slice(0, limit);
    
    return NextResponse.json({ games });
```

**Stratégie de déduplication** :
- Les jeux de la base de données sont prioritaires
- Les jeux BGG sont ajoutés seulement s'ils ne sont pas déjà présents (comparaison par ID BGG ou nom)
- Limitation finale au nombre de résultats demandé

#### Étape 5 : Affichage des résultats
Les résultats sont affichés dans une liste déroulante :

```200:233:apps/web/components/events/GameSelector.tsx
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {game.thumbnail && (
                      <img
                        src={game.thumbnail}
                        alt={game.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{game.name}</h4>
                      <p className="text-sm text-gray-600">
                        {game.minPlayers}-{game.maxPlayers} joueurs • {game.playingTime} min • {game.complexity.toFixed(1)}/5
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => addGame(game)}
                    size="sm"
                    variant="outline"
                  >
                    Ajouter
                  </Button>
                </div>
              ))}
            </div>
          )}
```

### 2. Version Mobile (`apps/mobile`)

#### Différences avec la version web

La version mobile utilise une approche hybride :

1. **Recherche locale d'abord** : Recherche directe dans Supabase
2. **Fallback API web** : Si disponible, appelle l'API web pour les résultats BGG

```86:216:apps/mobile/components/events/GameSelector.tsx
  const searchGames = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      
      // Rechercher d'abord dans la base de données locale
      const { data: dbGames, error: dbError } = await supabase
        .from('games')
        .select('id, bgg_id, name, description, min_players, max_players, duration_min, photo_url, data')
        .ilike('name', `%${query}%`)
        .limit(5)

      const results: BoardGame[] = []

      // Convertir les jeux de la DB au format BoardGame
      if (!dbError && dbGames) {
        dbGames.forEach(game => {
          results.push({
            id: game.bgg_id || game.id,
            name: game.name,
            yearPublished: game.data?.yearPublished?.toString() || '',
            minPlayers: game.min_players || 0,
            maxPlayers: game.max_players || 0,
            playingTime: game.duration_min || 0,
            complexity: game.data?.complexity || 0,
            image: game.photo_url || '',
            thumbnail: game.photo_url || '',
            categories: game.data?.categories || [],
            mechanics: game.data?.mechanics || [],
            designers: game.data?.designers || [],
            artists: game.data?.artists || [],
            publishers: game.data?.publishers || [],
            averageRating: game.data?.averageRating || 0,
            usersRated: game.data?.usersRated || 0,
            rank: game.data?.rank || 0
          })
        })
      }

      // Essayer d'appeler l'API web pour les jeux BGG si disponible
      try {
        // Détecter l'URL de base pour l'API web
        let baseUrl = process.env.EXPO_PUBLIC_WEB_URL
        
        if (!baseUrl) {
          // En développement, essayer différentes URLs possibles
          if (__DEV__) {
            // Sur web, utiliser window.location
            if (typeof window !== 'undefined' && window.location) {
              baseUrl = `${window.location.protocol}//${window.location.host}`
            } else {
              // Sur mobile, essayer l'IP locale ou laisser vide pour ne pas utiliser l'API BGG
              baseUrl = null
            }
          } else {
            baseUrl = 'https://gemou2.com'
          }
        }

        if (baseUrl) {
          try {
            // Créer un AbortController pour le timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000)
            
            const response = await fetch(`${baseUrl}/api/games/search?q=${encodeURIComponent(query)}&limit=5`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            if (response.ok) {
              const data = await response.json()
              if (data.games && Array.isArray(data.games)) {
                // Ajouter les jeux BGG en évitant les doublons
                const existingNames = new Set(results.map(g => g.name.toLowerCase()))
                data.games.forEach((game: any) => {
                  if (!existingNames.has(game.name?.toLowerCase())) {
                    results.push({
                      id: game.id,
                      name: game.name,
                      yearPublished: game.yearPublished || '',
                      minPlayers: game.minPlayers || 0,
                      maxPlayers: game.maxPlayers || 0,
                      playingTime: game.playingTime || 0,
                      complexity: game.complexity || 0,
                      image: game.image || '',
                      thumbnail: game.thumbnail || '',
                      categories: game.categories || [],
                      mechanics: game.mechanics || [],
                      designers: game.designers || [],
                      artists: game.artists || [],
                      publishers: game.publishers || [],
                      averageRating: game.averageRating || 0,
                      usersRated: game.usersRated || 0,
                      rank: game.rank || 0
                    })
                  }
                })
              }
            }
          } catch (fetchError: any) {
            // Ignorer les erreurs de timeout ou de connexion
            if (fetchError.name !== 'AbortError' && !fetchError.message?.includes('Failed to fetch')) {
              console.warn('Erreur lors de l\'appel à l\'API BGG:', fetchError)
            }
          }
        }
      } catch (apiError) {
        // Ignorer silencieusement l'erreur de l'API BGG si la DB a des résultats
        if (results.length === 0) {
          console.warn('Impossible de se connecter à l\'API de recherche de jeux. Utilisation de la base de données locale uniquement.')
        }
      }

      setSearchResults(results.slice(0, 10)) // Limiter à 10 résultats
    } catch (error) {
      console.error('Error searching games:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }
```

**Caractéristiques spécifiques mobile** :
- Recherche locale Supabase en premier (plus rapide)
- Tentative d'appel API web avec timeout de 3 secondes
- Gestion gracieuse des erreurs (continue même si l'API BGG échoue)
- Déduplication par nom de jeu
- Détection automatique de l'URL de base (dev/prod)

## Format des données

### Format de réponse API

```typescript
{
  games: [
    {
      id: string,                    // ID BGG ou ID DB
      dbId?: string,                  // ID base de données (si source: 'database')
      name: string,                   // Nom du jeu
      yearPublished: string,          // Année de publication
      minPlayers: number,             // Nombre minimum de joueurs
      maxPlayers: number,             // Nombre maximum de joueurs
      playingTime: number,            // Durée de jeu en minutes
      complexity: number,              // Complexité (0-5)
      image: string,                  // URL image complète
      thumbnail: string,              // URL miniature
      description?: string,            // Description du jeu
      categories?: string[],           // Catégories BGG
      mechanics?: string[],           // Mécaniques de jeu
      designers?: string[],           // Designers
      artists?: string[],             // Artistes
      publishers?: string[],          // Éditeurs
      averageRating?: number,         // Note moyenne BGG
      usersRated?: number,           // Nombre d'utilisateurs ayant noté
      rank?: number,                  // Classement BGG
      source: 'database' | 'bgg'      // Source des données
    }
  ]
}
```

### Format EventGame (après sélection)

```typescript
interface EventGame {
  id?: string;                        // ID de la relation event_games
  game_id?: string;                   // ID BGG ou DB
  game_name: string;                  // Nom du jeu
  game_thumbnail?: string;            // URL miniature
  game_image?: string;                // URL image complète
  year_published?: number;            // Année de publication
  min_players?: number;               // Nombre minimum de joueurs
  max_players?: number;               // Nombre maximum de joueurs
  playing_time?: number;              // Durée de jeu en minutes
  complexity?: number;                 // Complexité (0-5)
  is_custom: boolean;                  // Jeu personnalisé (non-BGG)
  is_optional: boolean;                // Jeu optionnel
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_duration?: number;        // Durée estimée pour l'événement
  brought_by_user_id?: string;        // ID utilisateur qui apporte le jeu
  notes?: string;                     // Notes additionnelles
}
```

## Optimisations et bonnes pratiques

### 1. Performance
- **Recherche parallèle** : Les recherches DB et BGG sont effectuées en parallèle avec `Promise.all()`
- **Limitation des résultats** : Limite par défaut de 10 résultats pour éviter la surcharge
- **Timeout mobile** : Timeout de 3 secondes pour les appels API BGG sur mobile
- **Debounce implicite** : La recherche se déclenche à chaque changement, mais avec un minimum de 2 caractères

### 2. Fiabilité
- **Fallback gracieux** : Si l'API BGG échoue, les résultats de la DB sont toujours retournés
- **Gestion d'erreurs** : Toutes les erreurs sont capturées et loggées sans bloquer l'interface
- **Déduplication** : Évite les doublons entre DB et BGG

### 3. Expérience utilisateur
- **Feedback visuel** : Indicateur de chargement pendant la recherche
- **Recherche instantanée** : Pas de bouton "Rechercher", recherche automatique
- **Résultats visuels** : Affichage avec miniature, nom, et métadonnées clés
- **Ajout rapide** : Bouton "Ajouter" directement dans les résultats

## Points d'amélioration potentiels

1. **Debounce explicite** : Ajouter un debounce de 300-500ms pour réduire les appels API
2. **Cache côté client** : Mettre en cache les résultats de recherche récents
3. **Pagination** : Implémenter la pagination pour les résultats nombreux
4. **Recherche avancée** : Ajouter des filtres (catégorie, complexité, durée)
5. **Historique** : Sauvegarder les recherches récentes de l'utilisateur
6. **Suggestions** : Afficher des suggestions pendant la saisie

## Configuration requise

### Variables d'environnement

**Web** :
- `NEXT_PUBLIC_SUPABASE_URL` : URL de l'instance Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase

**Mobile** :
- `EXPO_PUBLIC_WEB_URL` : URL de base de l'API web (optionnel, pour recherche BGG)

### Dépendances API externes

- **BoardGameGeek XML API** : `https://boardgamegeek.com/xmlapi2`
  - Endpoint de recherche : `/search?query={query}&type=boardgame`
  - Endpoint de détails : `/boardgame/{id}?stats=1`
  - Format : XML (converti en JSON côté serveur)

## Sécurité

- **Validation des entrées** : Encodage URI des requêtes utilisateur
- **Limitation des résultats** : Limite maximale pour éviter les abus
- **User-Agent** : En-tête User-Agent approprié pour les requêtes BGG
- **Timeout** : Timeout sur les requêtes externes pour éviter les blocages

## Tests recommandés

1. **Tests unitaires** :
   - Fonction `searchGames()` avec différentes requêtes
   - Fonction de déduplication
   - Conversion de formats de données

2. **Tests d'intégration** :
   - Appel API complet avec requête réelle
   - Gestion des erreurs API BGG
   - Fusion des résultats DB + BGG

3. **Tests E2E** :
   - Recherche complète depuis l'interface utilisateur
   - Ajout d'un jeu depuis les résultats
   - Gestion des cas limites (pas de résultats, erreur réseau)

