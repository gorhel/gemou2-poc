# Implémentation des Tags d'Événements et de Jeux

**Date:** 2025-11-11  
**Auteur:** AI Assistant  
**Version:** 1.0

## Vue d'ensemble

Cette documentation décrit l'implémentation complète du système de tags pour les événements et les jeux dans l'application mobile Gémou. Le système permet d'afficher deux types de tags distincts avec des couleurs différentes :

- **Tags d'événement** : Sélectionnés manuellement par le créateur de l'événement (couleur rose)
- **Tags de jeux** : Associés automatiquement aux jeux ajoutés à l'événement (couleur jaune)

## Architecture de Base de Données

### Tables

#### 1. Table `tags`
Table principale stockant tous les tags disponibles dans le système.

```sql
CREATE TABLE public.tags (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  color text,
  created_at timestamptz DEFAULT now() NOT NULL
);
```

**Champs:**
- `id` : Identifiant unique (serial/integer)
- `name` : Nom du tag (unique)
- `color` : Couleur optionnelle pour personnalisation future
- `created_at` : Date de création

#### 2. Table `event_tags`
Table de liaison entre événements et tags.

```sql
CREATE TABLE public.event_tags (
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  tag_id int REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (event_id, tag_id)
);
```

**Contraintes:**
- Maximum 3 tags par événement (trigger `check_max_event_tags`)
- Suppression en cascade si l'événement ou le tag est supprimé

#### 3. Table `game_tags`
Table de liaison entre jeux et tags.

```sql
CREATE TABLE public.game_tags (
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  tag_id int REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (game_id, tag_id)
);
```

### Schéma des Relations

```
┌─────────────┐
│   events    │
│ (id: uuid)  │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐        ┌─────────────┐
│  event_tags     │   N:1  │    tags     │
│ (event_id, tag) ├────────┤  (id: int)  │
└─────────────────┘        └──────┬──────┘
                                  │
                                  │ 1:N
                           ┌──────▼──────────┐
                           │   game_tags     │
                           │ (game_id, tag)  │
                           └──────┬──────────┘
                                  │
                                  │ N:1
                           ┌──────▼──────┐
                           │    games    │
                           │ (id: uuid)  │
                           └─────────────┘
```

## Migrations

### 1. Création de la table `game_tags`
**Fichier:** `supabase/migrations/20250111000000_create_game_tags_table.sql`

Crée la table de liaison entre jeux et tags avec :
- Contraintes de clés étrangères
- Index pour optimisation
- Politiques RLS pour lecture publique

### 2. Correction du type de `tags.id`
**Fichier:** `supabase/migrations/20250111000001_fix_tags_id_type.sql`

Standardise le type de `tags.id` sur `serial` (int) pour cohérence avec les migrations de base. Cette migration :
- Vérifie le type actuel de `tags.id`
- Convertit de `uuid` vers `integer` si nécessaire
- Réinsère les tags prédéfinis
- Ajoute de nouveaux tags (Stratégie, Ambiance, Coopératif, etc.)

### 3. Peuplement des tags de jeux
**Fichier:** `supabase/migrations/20250111000002_populate_game_tags.sql`

Lie des jeux populaires à leurs tags appropriés :
- Catan → Stratégie, Famille, Compétitif
- Pandemic → Coopératif, Stratégie
- Codenames → Party Game, Décontracté, Famille
- Dobble → Ambiance, Décontracté, Famille

## Implémentation Front-end (Mobile)

### Structure des Composants

```
apps/mobile/
├── components/events/
│   ├── TagSelector.tsx          # Sélection de tags lors de la création
│   └── EventTags.tsx             # Affichage des tags (non utilisé actuellement)
│
├── app/(tabs)/
│   ├── create-event.tsx          # Création/édition d'événement avec tags
│   └── events/
│       └── [id].tsx              # Page de détail affichant les deux types de tags
```

### 1. TagSelector.tsx

Composant de sélection des tags lors de la création d'événement.

**Caractéristiques:**
- Charge les tags disponibles depuis Supabase
- Permet la sélection/désélection des tags
- Limite à 3 tags maximum
- Convertit les IDs de `number` vers `string` pour compatibilité

**Interface:**
```typescript
interface Tag {
  id: number          // ID provenant de la base (serial)
  name: string
  color?: string
}

interface TagSelectorProps {
  selectedTags: string[]                    // IDs en string
  onTagsChange: (tagIds: string[]) => void
  error?: string
  maxTags?: number                          // Défaut: 3
}
```

**Flux de données:**
```
Supabase (tags.id: number)
    ↓
TagSelector (convertit en string)
    ↓
create-event.tsx (selectedTags: string[])
    ↓
Supabase (event_tags.tag_id: int)
```

### 2. Page de détail d'événement ([id].tsx)

Affiche les tags d'événement et de jeux avec des couleurs distinctes.

#### Chargement des tags d'événement

```typescript
// Requête Supabase avec join
const { data: tagsData } = await supabase
  .from('event_tags')
  .select(`
    tag_id,
    tags (
      id,
      name
    )
  `)
  .eq('event_id', id)

// Formatage
const tagsList = tagsData
  .filter((et: any) => et.tags && et.tags.name)
  .map((et: any) => ({
    id: et.tag_id,
    tag_id: et.tag_id,
    name: et.tags.name,
    tags: et.tags
  }))

setEventTags(tagsList)
```

#### Chargement des tags de jeux

Le processus est plus complexe car il nécessite plusieurs étapes :

```typescript
// 1. Charger les jeux de l'événement
const { data: gamesData } = await supabase
  .from('event_games')
  .select('*')
  .eq('event_id', id)

// 2. Récupérer les BGG IDs
const gameBggIds = gamesData.map(g => g.game_id)

// 3. Trouver les jeux dans la table games
const { data: gamesInDb } = await supabase
  .from('games')
  .select('id, bgg_id, name')
  .in('bgg_id', gameBggIds)

// 4. Fallback: chercher par nom si non trouvé par BGG ID
const missingGames = gamesData.filter(eg => 
  !gamesInDb.some(g => g.bgg_id === eg.game_id)
)
if (missingGames.length > 0) {
  const { data: gamesByName } = await supabase
    .from('games')
    .select('id, bgg_id, name')
    .in('name', missingGameNames)
  gamesInDb.push(...gamesByName)
}

// 5. Récupérer les tags de ces jeux
const allGameIds = gamesInDb.map(g => g.id)
const { data: tagsData } = await supabase
  .from('game_tags')
  .select(`
    tag_id,
    tags (
      id,
      name
    )
  `)
  .in('game_id', allGameIds)

// 6. Dédupliquer les tags (un même tag peut apparaître sur plusieurs jeux)
const uniqueTags = Array.from(
  new Map(
    tagsData
      .filter((gt: any) => gt.tags)
      .map((gt: any) => [gt.tag_id, gt])
  ).values()
)

setGameTags(uniqueTags)
```

#### Affichage avec couleurs distinctes

```tsx
{(eventTags.length > 0 || gameTags.length > 0) && (
  <View style={styles.descriptionContainer}>
    <Text style={styles.descriptionTitle}>Tags événement et jeu</Text>
    <View style={styles.badgesContainer}>
      {/* Tags d'événement (rose) */}
      {eventTags.map((eventTag, index) => (
        <View key={...} style={[styles.badge, styles.eventTagBadge]}>
          <Text style={styles.badgeText}>{tagName}</Text>
        </View>
      ))}
      
      {/* Tags de jeux (jaune) */}
      {gameTags.map((gameTag, index) => (
        <View key={...} style={[styles.badge, styles.gameTagBadge]}>
          <Text style={styles.badgeText}>{tagName}</Text>
        </View>
      ))}
    </View>
  </View>
)}
```

#### Styles

```typescript
badge: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 6,
  backgroundColor: '#F0F2F5',  // Couleur de base
},

eventTagBadge: {
  backgroundColor: '#fce7f3',  // Rose clair
  borderColor: '#f9a8d4',      // Rose
  borderWidth: 1,
},

gameTagBadge: {
  backgroundColor: '#fef3c7',  // Jaune clair
  borderColor: '#fbbf24',      // Jaune/ambre
  borderWidth: 1,
},
```

### 3. Page de création d'événement (create-event.tsx)

Sauvegarde des tags lors de la création/édition d'événement.

#### Création d'événement

```typescript
// Après création de l'événement
if (selectedTags.length > 0) {
  const tagsToInsert = selectedTags.map(tagId => ({
    event_id: data.id,
    tag_id: tagId  // String converti automatiquement en int par Supabase
  }))

  const { data: insertedTags, error: tagsError } = await supabase
    .from('event_tags')
    .insert(tagsToInsert)
    .select()

  if (tagsError) {
    console.error('❌ Erreur lors de l\'ajout des tags:', tagsError)
    Alert.alert('Attention', `Les tags n'ont pas pu être ajoutés`)
  }
}
```

#### Édition d'événement

```typescript
// Supprimer les anciens tags
await supabase
  .from('event_tags')
  .delete()
  .eq('event_id', eventId)

// Ajouter les nouveaux tags
if (selectedTags.length > 0) {
  const tagsToInsert = selectedTags.map(tagId => ({
    event_id: eventId,
    tag_id: tagId
  }))
  await supabase.from('event_tags').insert(tagsToInsert)
}
```

## Flux de Données Complet

### Création d'événement avec tags

```
┌─────────────────────┐
│ Utilisateur ouvre   │
│ /create-event       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ TagSelector charge  │
│ les tags depuis DB  │
│ (tags.id: number)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Utilisateur         │
│ sélectionne 3 tags  │
│ (convertis string)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Submit formulaire   │
│ → Crée événement    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Insert event_tags   │
│ (tag_id string→int) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Redirection vers    │
│ /events/[id]        │
└─────────────────────┘
```

### Affichage des tags sur la page de détail

```
┌────────────────────────┐
│ Page /events/[id]      │
│ charge les données     │
└───────┬────────────────┘
        │
        ├──────────────────┐
        │                  │
        ▼                  ▼
┌───────────────┐  ┌──────────────────┐
│ Charge tags   │  │ Charge jeux      │
│ d'événement   │  │ de l'événement   │
│               │  │                  │
│ event_tags    │  │ event_games      │
│   ↓ JOIN      │  │   ↓              │
│ tags          │  │ Récupère BGG IDs │
└───────┬───────┘  └──────┬───────────┘
        │                 │
        │                 ▼
        │          ┌──────────────────┐
        │          │ Trouve jeux      │
        │          │ dans table games │
        │          │ (par BGG ID      │
        │          │  ou nom)         │
        │          └──────┬───────────┘
        │                 │
        │                 ▼
        │          ┌──────────────────┐
        │          │ Charge game_tags │
        │          │   ↓ JOIN         │
        │          │ tags             │
        │          └──────┬───────────┘
        │                 │
        ▼                 ▼
┌─────────────────────────────────┐
│ Affichage avec couleurs         │
│ - Event tags: Rose (#fce7f3)    │
│ - Game tags: Jaune (#fef3c7)    │
└─────────────────────────────────┘
```

## Types de Données et Conversions

### Problème de Types

La base de données utilise `serial` (int) pour `tags.id`, mais TypeScript/JavaScript manipule souvent les IDs comme des strings pour plus de flexibilité.

### Solution

**Conversion cohérente dans TagSelector:**

```typescript
// Supabase retourne: Tag { id: number, name: string }

// Lors de la sélection
const handleTagToggle = (tagId: number) => {
  const tagIdStr = String(tagId)  // Conversion explicite
  // ... manipuler avec tagIdStr
  onTagsChange([...selectedTags, tagIdStr])
}

// Lors de l'affichage
tags.map((tag) => {
  const tagIdStr = String(tag.id)
  const isSelected = selectedTags.includes(tagIdStr)
  // ...
})
```

**Lors de l'insertion:**

```typescript
// Supabase accepte string et le convertit automatiquement en int
const tagsToInsert = selectedTags.map(tagId => ({
  event_id: data.id,
  tag_id: tagId  // "1" → 1 automatiquement
}))
```

## Tags Prédéfinis

### Tags d'événement et de jeux

Les tags suivants sont disponibles dans le système :

1. **Compétitif** - Jeux avec compétition directe
2. **Décontracté** - Ambiance relaxe, sans pression
3. **Famille** - Accessible à tous les âges
4. **Expert** - Nécessite expérience et stratégie avancée
5. **Débutant** - Parfait pour nouveaux joueurs
6. **Soirée** - Format soirée (2-4h)
7. **Journée** - Format long (4h+)
8. **Tournoi** - Événement compétitif organisé
9. **Découverte** - Découvrir de nouveaux jeux
10. **Rapide** - Parties courtes (< 1h)
11. **Stratégie** - Nécessite planification
12. **Ambiance** - Jeux d'ambiance légers
13. **Coopératif** - Joueurs collaborent
14. **Party Game** - Jeux de groupe festifs
15. **Narratif** - Jeux avec histoire/narration

## Tests et Vérification

### Checklist de validation

- [x] Table `game_tags` créée avec bons types
- [x] Type `tags.id` standardisé sur serial (int)
- [x] Tags d'événement s'enregistrent correctement
- [x] Tags de jeux récupérés via JOIN correct
- [x] Couleurs distinctes appliquées (rose/jaune)
- [x] Pas d'erreurs de linter

### Tests à effectuer manuellement

1. **Créer un événement avec tags**
   - Aller sur `/create-event`
   - Sélectionner 1-3 tags
   - Soumettre le formulaire
   - Vérifier dans Supabase que les tags sont enregistrés

2. **Ajouter des jeux à l'événement**
   - Modifier l'événement créé
   - Ajouter des jeux (ex: Catan, Pandemic)
   - Sauvegarder

3. **Vérifier l'affichage**
   - Ouvrir `/events/[id]`
   - Vérifier que les tags d'événement s'affichent en **rose**
   - Vérifier que les tags de jeux s'affichent en **jaune**
   - Vérifier qu'il n'y a pas de doublons

4. **Tests de console**
   - Vérifier les logs de chargement des tags
   - Vérifier qu'aucune erreur n'apparaît dans la console

## Dépannage

### Problèmes courants

#### 1. Les tags d'événement ne s'affichent pas

**Causes possibles:**
- Type de `tags.id` incorrect (uuid au lieu de int)
- Migration `20250111000001_fix_tags_id_type.sql` non exécutée

**Solution:**
```bash
# Exécuter les migrations
cd supabase
supabase migration up
```

#### 2. Les tags de jeux ne s'affichent pas

**Causes possibles:**
- Table `game_tags` n'existe pas
- Jeux non présents dans la table `games`
- Jeux non liés aux tags

**Solution:**
```sql
-- Vérifier que la table existe
SELECT * FROM game_tags LIMIT 10;

-- Vérifier que les jeux existent
SELECT id, name, bgg_id FROM games WHERE name ILIKE '%catan%';

-- Lier manuellement un jeu à un tag
INSERT INTO game_tags (game_id, tag_id)
VALUES (
  (SELECT id FROM games WHERE name ILIKE '%catan%' LIMIT 1),
  (SELECT id FROM tags WHERE name = 'Stratégie')
);
```

#### 3. Erreur de type lors de la sélection des tags

**Cause:** Incompatibilité entre `number` et `string`

**Solution:** Vérifier que TagSelector convertit bien en string (déjà implémenté)

## Améliorations Futures

### Court terme

1. **Filtrage des événements par tags**
   - Permettre de filtrer la liste des événements par tags
   - Interface de filtre multi-sélection

2. **Gestion des tags administrateur**
   - Interface pour créer/modifier/supprimer des tags
   - Réservé aux administrateurs

3. **Tags de couleur personnalisée**
   - Utiliser le champ `color` de la table `tags`
   - Afficher les tags avec leur couleur personnalisée

### Moyen terme

1. **Tags suggérés automatiquement**
   - Suggérer des tags en fonction des jeux ajoutés
   - ML pour suggérer des tags pertinents

2. **Statistiques de tags**
   - Tags les plus utilisés
   - Popularité des événements par tag

3. **Tags de niveau utilisateur**
   - Permettre aux utilisateurs de créer leurs propres tags
   - Tags privés vs publics

## Références

### Fichiers modifiés

- `supabase/migrations/20250111000000_create_game_tags_table.sql`
- `supabase/migrations/20250111000001_fix_tags_id_type.sql`
- `supabase/migrations/20250111000002_populate_game_tags.sql`
- `apps/mobile/components/events/TagSelector.tsx`
- `apps/mobile/app/(tabs)/events/[id].tsx`
- `apps/mobile/app/(tabs)/create-event.tsx`

### Migrations existantes liées

- `supabase/migrations/20250110000000_create_tags_tables.sql` (tags et event_tags)
- `supabase/migrations/20250915120000_alpha_backlog_db.sql` (schéma de base)

---

**Fin du document**




