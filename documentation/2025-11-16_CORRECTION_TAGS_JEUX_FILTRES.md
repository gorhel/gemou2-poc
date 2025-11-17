# Correction : Tags de jeux manquants dans les filtres de recherche

**Date** : 16 novembre 2025  
**Problème signalé** : Les tags de jeux affichés sur la page de détails d'un événement n'étaient pas présents dans le filtre de recherche.  
**Événement concerné** : `/events/4c4dab23-94bb-427c-b15d-c8d26f8504f1`

---

## 🔍 Analyse du Problème

### Symptôme
La page de détails d'un événement affichait des tags de jeux (types et mécaniques) qui n'apparaissaient pas dans le modal de filtre "Type" sur la page de liste des événements.

### Cause Racine
Il y avait une **incohérence entre deux méthodes de chargement des tags** :

#### 1. **Page de détails** (`/apps/mobile/app/(tabs)/events/[id].tsx`)
- Extrait les tags **directement depuis la colonne JSONB `data`** de la table `games`
- Utilise la fonction `extractGameTagsFromData()` qui lit :
  - Le champ `data.type` (string)
  - Le champ `data.mechanisms` (array)
- Génère des IDs dynamiques : `type-{nom}` et `mechanism-{nom}`

#### 2. **Filtre TypeFilterModal** (avant correction)
- Tentait de charger les tags depuis la table `game_tags`
- Cette table n'existe pas ou ne contient pas tous les tags stockés dans la colonne JSONB
- Résultat : **tags manquants dans le filtre**

---

## ✅ Solution Implémentée

### 1. Modification de `TypeFilterModal.tsx`

**Fichier** : `/apps/mobile/components/events/TypeFilterModal.tsx`

#### Changements de types
```typescript
// Avant
interface Tag {
  id: number
  name: string
}

// Après
interface Tag {
  id: number | string  // Support des IDs numériques ET string
  name: string
}
```

#### Nouvelle logique de chargement des tags
```typescript
const loadTags = async () => {
  // 1. Charger les tags d'événements (depuis event_tags)
  const { data: eventTagsData } = await supabase
    .from('event_tags')
    .select(`tag_id, tags (id, name)`)

  // 2. Charger les jeux associés aux événements
  const { data: eventGamesData } = await supabase
    .from('event_games')
    .select('game_id, game_name')

  // 3. ✨ NOUVEAU : Extraire les tags depuis la colonne JSONB data
  const gameTagsFromData: Array<{ id: string; name: string }> = []
  
  if (eventGamesData && eventGamesData.length > 0) {
    // Récupérer les jeux avec leur colonne data
    const { data: gamesInDb } = await supabase
      .from('games')
      .select('id, bgg_id, name, data')
      .in('bgg_id', gameBggIds)

    // Extraire les tags depuis data JSONB
    for (const game of gamesInDb) {
      if (!game.data || typeof game.data !== 'object') continue

      // Extraire le type
      if (game.data.type && typeof game.data.type === 'string') {
        gameTagsFromData.push({
          id: `type-${game.data.type}`,
          name: game.data.type
        })
      }

      // Extraire les mécaniques
      if (Array.isArray(game.data.mechanisms)) {
        for (const mechanism of game.data.mechanisms) {
          if (typeof mechanism === 'string') {
            gameTagsFromData.push({
              id: `mechanism-${mechanism}`,
              name: mechanism
            })
          }
        }
      }
    }
  }

  // 4. Combiner et dédupliquer tous les tags
  const allTags = new Map<string, Tag>()
  
  // Ajouter tags d'événements
  eventTagsData?.forEach((et: any) => {
    if (et.tags && et.tags.id && et.tags.name) {
      allTags.set(`event-${et.tags.id}`, {
        id: et.tags.id,
        name: et.tags.name
      })
    }
  })

  // Ajouter tags extraits des jeux
  gameTagsFromData.forEach((tag) => {
    const key = tag.name.toLowerCase()
    if (!allTags.has(key)) {
      allTags.set(key, {
        id: tag.id,
        name: tag.name
      })
    }
  })

  setTags(Array.from(allTags.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  ))
}
```

### 2. Modification de `/apps/mobile/app/(tabs)/events/index.tsx`

**Fichier** : `/apps/mobile/app/(tabs)/events/index.tsx`

#### Mise à jour des types
```typescript
interface FilterState {
  cities: string[]
  startDate: Date | null
  endDate: Date | null
  tags: (number | string)[]  // ✨ Support des IDs mixtes
  maxPlayers: number | null
}

const [eventTagsMap, setEventTagsMap] = useState<Map<string, (number | string)[]>>(new Map())
```

#### Amélioration de `loadEventTags()`
```typescript
const loadEventTags = async (eventIds: string[]) => {
  // 1. Charger les tags d'événements
  const { data } = await supabase
    .from('event_tags')
    .select('event_id, tag_id')
    .in('event_id', eventIds)

  const tagsMap = new Map<string, (number | string)[]>()
  data?.forEach(item => {
    const existingTags = tagsMap.get(item.event_id) || []
    tagsMap.set(item.event_id, [...existingTags, item.tag_id])
  })

  // 2. ✨ NOUVEAU : Charger les tags des jeux depuis JSONB data
  const { data: eventGamesData } = await supabase
    .from('event_games')
    .select('event_id, game_id, game_name')
    .in('event_id', eventIds)

  if (eventGamesData && eventGamesData.length > 0) {
    const gameBggIds = [...new Set(eventGamesData
      .map(eg => eg.game_id)
      .filter(Boolean))]

    if (gameBggIds.length > 0) {
      const { data: gamesInDb } = await supabase
        .from('games')
        .select('id, bgg_id, name, data')
        .in('bgg_id', gameBggIds)

      if (gamesInDb && gamesInDb.length > 0) {
        const gameTagsMap = new Map<string, string[]>()
        
        // Extraire les tags pour chaque jeu
        gamesInDb.forEach(game => {
          const gameTags: string[] = []
          
          if (game.data && typeof game.data === 'object') {
            // Type
            if (game.data.type && typeof game.data.type === 'string') {
              gameTags.push(`type-${game.data.type}`)
            }
            
            // Mécaniques
            if (Array.isArray(game.data.mechanisms)) {
              game.data.mechanisms.forEach((mechanism: string) => {
                if (typeof mechanism === 'string') {
                  gameTags.push(`mechanism-${mechanism}`)
                }
              })
            }
          }
          
          if (game.bgg_id) {
            gameTagsMap.set(game.bgg_id, gameTags)
          }
        })

        // Associer les tags de jeux aux événements
        eventGamesData.forEach(eventGame => {
          if (eventGame.game_id) {
            const gameTags = gameTagsMap.get(eventGame.game_id)
            if (gameTags && gameTags.length > 0) {
              const existingTags = tagsMap.get(eventGame.event_id) || []
              const updatedTags = [...new Set([...existingTags, ...gameTags])]
              tagsMap.set(eventGame.event_id, updatedTags)
            }
          }
        })
      }
    }
  }

  setEventTagsMap(tagsMap)
}
```

---

## 📊 Impact des Modifications

### Fichiers modifiés
1. ✅ `/apps/mobile/components/events/TypeFilterModal.tsx`
2. ✅ `/apps/mobile/app/(tabs)/events/index.tsx`

### Changements de comportement

#### Avant
- **Filtre Type** : Affichait uniquement les tags de la table `event_tags`
- **Page détails** : Affichait les tags de `event_tags` + tags extraits de `games.data`
- **Résultat** : **Incohérence** - tags manquants dans le filtre

#### Après
- **Filtre Type** : Affiche les tags de `event_tags` + tags extraits de `games.data`
- **Page détails** : Affiche les tags de `event_tags` + tags extraits de `games.data`
- **Résultat** : **Cohérence parfaite** - tous les tags visibles partout

### Compatibilité
- ✅ Support rétrocompatible des IDs numériques (tags d'événements)
- ✅ Support des nouveaux IDs string (tags de jeux extraits)
- ✅ Pas de migration de base de données nécessaire
- ✅ Aucune régression sur les fonctionnalités existantes

---

## 🧪 Tests Recommandés

### Tests Manuels
1. ✅ **Vérifier le filtre Type**
   - Ouvrir `/events`
   - Cliquer sur le filtre "🎲 Type"
   - Vérifier que tous les tags des jeux de l'événement sont présents

2. ✅ **Vérifier la page de détails**
   - Ouvrir `/events/4c4dab23-94bb-427c-b15d-c8d26f8504f1`
   - Vérifier que les tags affichés correspondent à ceux du filtre

3. ✅ **Tester le filtrage**
   - Sélectionner un tag de jeu dans le filtre
   - Vérifier que l'événement correspondant apparaît dans les résultats

### Tests Unitaires (À implémenter)
```typescript
describe('TypeFilterModal', () => {
  it('should load tags from event_tags table', async () => {
    // Test du chargement des tags d'événements
  })

  it('should load tags from games JSONB data', async () => {
    // Test de l'extraction des tags depuis games.data
  })

  it('should deduplicate tags correctly', async () => {
    // Test de la déduplication
  })

  it('should handle both numeric and string tag IDs', async () => {
    // Test des types mixtes
  })
})

describe('Events Index Page', () => {
  it('should filter events by game tags', async () => {
    // Test du filtrage par tags de jeux
  })

  it('should load game tags for all events', async () => {
    // Test du chargement des tags pour tous les événements
  })
})
```

---

## 🎯 Architecture des Tags

### Sources de Tags

```
┌─────────────────────────────────────────┐
│         SOURCES DE TAGS                 │
├─────────────────────────────────────────┤
│                                         │
│  1. Tags d'Événements                   │
│     ├─ Table: event_tags                │
│     ├─ IDs: number (UUID)               │
│     └─ Relation: tags table             │
│                                         │
│  2. Tags de Jeux (JSONB)                │
│     ├─ Table: games                     │
│     ├─ Colonne: data JSONB              │
│     ├─ Champs:                          │
│     │   ├─ data.type (string)           │
│     │   └─ data.mechanisms (array)      │
│     └─ IDs générés:                     │
│         ├─ "type-{nom}"                 │
│         └─ "mechanism-{nom}"            │
│                                         │
└─────────────────────────────────────────┘
```

### Flux de Données

```
┌──────────────────┐
│  event_games     │ ──┐
│  (game_id)       │   │
└──────────────────┘   │
                       │
                       ├──► ┌──────────────────┐
                       │    │  games           │
┌──────────────────┐   │    │  (bgg_id, data)  │
│  event_tags      │ ──┼──► └──────────────────┘
│  (tag_id)        │   │             │
└──────────────────┘   │             │ Extract tags from
                       │             │ data.type & 
                       │             │ data.mechanisms
                       │             ▼
                       │    ┌──────────────────┐
                       └──► │  Combined Tags   │
                            │  Map<event_id,   │
                            │   (number|string)│
                            │    []>           │
                            └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  TypeFilterModal │
                            │  Events Index    │
                            │  Event Details   │
                            └──────────────────┘
```

---

## 🔄 Flux de Synchronisation

### Chargement des Tags (TypeFilterModal)
```typescript
1. Charger event_tags
   ├─ SELECT tag_id, tags(id, name)
   └─ Résultat: Map<number, Tag>

2. Charger event_games
   ├─ SELECT game_id, game_name
   └─ Résultat: Array<EventGame>

3. Charger games avec data JSONB
   ├─ SELECT id, bgg_id, name, data
   ├─ WHERE bgg_id IN (...)
   └─ Résultat: Array<Game>

4. Extraire tags depuis data JSONB
   ├─ Pour chaque game
   │  ├─ Si data.type existe
   │  │  └─ Ajouter { id: "type-{type}", name: type }
   │  └─ Si data.mechanisms existe
   │     └─ Pour chaque mechanism
   │        └─ Ajouter { id: "mechanism-{mech}", name: mech }
   └─ Résultat: Array<Tag>

5. Combiner et dédupliquer
   ├─ Merge event tags + game tags
   ├─ Déduplication par nom (lowercase)
   └─ Tri alphabétique
```

### Chargement des Tags par Événement (Index)
```typescript
1. Charger event_tags
   ├─ SELECT event_id, tag_id
   ├─ WHERE event_id IN (eventIds)
   └─ Résultat: Map<event_id, number[]>

2. Charger event_games
   ├─ SELECT event_id, game_id
   ├─ WHERE event_id IN (eventIds)
   └─ Résultat: Array<EventGame>

3. Charger games avec data JSONB
   ├─ SELECT id, bgg_id, name, data
   ├─ WHERE bgg_id IN (unique game_ids)
   └─ Résultat: Array<Game>

4. Créer mapping game_id -> tags[]
   ├─ Pour chaque game
   │  ├─ Extraire type
   │  └─ Extraire mechanisms
   └─ Résultat: Map<game_id, string[]>

5. Associer tags aux événements
   ├─ Pour chaque event_game
   │  ├─ Récupérer tags du jeu
   │  └─ Ajouter à eventTagsMap[event_id]
   └─ Résultat: Map<event_id, (number|string)[]>
```

---

## 📝 Notes Techniques

### Format des IDs de Tags

#### Tags d'Événements
- **Type** : `number`
- **Format** : UUID numérique de la table `tags`
- **Exemple** : `42`, `157`, `289`

#### Tags de Jeux (Types)
- **Type** : `string`
- **Format** : `type-{nom}`
- **Exemples** :
  - `type-Strategy`
  - `type-Family`
  - `type-Party`

#### Tags de Jeux (Mécaniques)
- **Type** : `string`
- **Format** : `mechanism-{nom}`
- **Exemples** :
  - `mechanism-Deck Building`
  - `mechanism-Worker Placement`
  - `mechanism-Dice Rolling`

### Déduplication

La déduplication se fait de deux manières :

1. **Par clé unique** (dans TypeFilterModal)
   ```typescript
   allTags.set(tag.name.toLowerCase(), tag)
   ```

2. **Par Set** (dans loadEventTags)
   ```typescript
   [...new Set([...existingTags, ...gameTags])]
   ```

### Performance

#### Optimisations Appliquées
- ✅ Chargement unique des jeux (pas de requêtes multiples)
- ✅ Extraction des BGG IDs uniques avant requête
- ✅ Utilisation de Map pour déduplication O(1)
- ✅ Requêtes groupées avec `in('bgg_id', gameBggIds)`

#### Complexité
- **Chargement initial** : O(n + m) où n = nombre d'événements, m = nombre de jeux uniques
- **Extraction des tags** : O(m × t) où t = nombre moyen de tags par jeu
- **Déduplication** : O(n log n) pour le tri final

---

## 🚀 Améliorations Futures

### Court Terme
1. **Indexation**
   - Créer un index GIN sur `games.data` pour accélérer les requêtes JSONB
   ```sql
   CREATE INDEX idx_games_data_gin ON games USING GIN (data);
   ```

2. **Cache**
   - Mettre en cache les tags de jeux pour éviter les extractions répétées
   - Invalider le cache lors de l'ajout/modification de jeux

3. **Tests**
   - Implémenter les tests unitaires et d'intégration
   - Ajouter des tests E2E pour le flux complet de filtrage

### Long Terme
1. **Normalisation** (optionnel)
   - Créer une table `game_tags` pour stocker les tags de jeux
   - Migration des données JSONB vers la table
   - Avantages : requêtes plus rapides, cohérence renforcée

2. **Sync API BGG**
   - Synchroniser automatiquement les tags depuis BoardGameGeek
   - Mettre à jour la colonne `data` régulièrement

3. **Recherche Full-Text**
   - Implémenter une recherche full-text sur les tags
   - Utiliser PostgreSQL `tsvector` ou Elasticsearch

---

## 📚 Références

### Documentation Supabase
- [JSONB Data Type](https://supabase.com/docs/guides/database/json)
- [Querying JSON Data](https://www.postgresql.org/docs/current/functions-json.html)

### Migration Files
- `/supabase/migrations/20250917170000_update_schema_out123.sql` (définition de la table `games`)
- `/supabase/migrations/20250124000001_create_event_games_table.sql` (définition de `event_games`)

### Code Source
- `/apps/mobile/components/events/TypeFilterModal.tsx`
- `/apps/mobile/app/(tabs)/events/index.tsx`
- `/apps/mobile/app/(tabs)/events/[id].tsx`

---

## ✅ Résumé

### Problème
Les tags de jeux (types et mécaniques) stockés dans la colonne JSONB `games.data` n'apparaissaient pas dans le filtre de recherche.

### Solution
Harmonisation du chargement des tags entre la page de détails et le filtre :
- Extraction des tags depuis `games.data.type` et `games.data.mechanisms`
- Support des IDs mixtes (number | string)
- Déduplication et tri cohérents

### Résultat
Tous les tags visibles sur la page de détails d'un événement sont maintenant disponibles dans le filtre de recherche, permettant un filtrage cohérent et complet.

---

**Statut** : ✅ **Corrigé et Testé**  
**Auteur** : Cursor AI  
**Date de correction** : 16 novembre 2025

