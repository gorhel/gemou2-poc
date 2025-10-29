# Schéma de Base de Données - Référence

**Date d'export:** 29 octobre 2025  
**Source:** Supabase Production Database

---

## 📋 Tables Principales

### `event_participants`

Gère les participations aux événements.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `event_id` | uuid | Référence vers `events.id` |
| **`user_id`** | uuid | ⚠️ **Référence vers `profiles.id`** (PAS profile_id !) |
| `status` | text | Statut: `'registered'`, `'attended'`, `'cancelled'` |
| `joined_at` | timestamptz | Date d'inscription |

**Contraintes:**
- UNIQUE(event_id, user_id) - Un utilisateur ne peut s'inscrire qu'une fois par événement
- CHECK: status IN ('registered', 'attended', 'cancelled')

**Triggers:**
- ✅ `trigger_update_participants_count_insert` - Incrémente current_participants
- ✅ `trigger_update_participants_count_update` - Met à jour current_participants
- ✅ `trigger_update_participants_count_delete` - Décrémente current_participants

---

### `events`

Stocke les événements de jeux de société.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `title` | text | Titre de l'événement |
| `description` | text | Description détaillée |
| `date_time` | timestamptz | Date et heure de l'événement |
| `location` | text | Lieu de l'événement |
| **`max_participants`** | integer | Nombre maximum de participants |
| **`current_participants`** | integer | ⚠️ **Mis à jour automatiquement par triggers** |
| `creator_id` | uuid | Référence vers `profiles.id` |
| `image_url` | text | URL de l'image principale |
| `status` | text | Statut: `'active'`, `'cancelled'`, `'completed'` |
| `created_at` | timestamptz | Date de création |
| `updated_at` | timestamptz | Date de dernière modification |
| `capacity` | integer | ⚠️ Doublon avec max_participants ? |
| `price` | numeric | Prix de participation |
| `visibility` | text | Visibilité: `'public'`, `'private'`, `'approval'` |
| `latitude` | double precision | Coordonnée GPS |
| `longitude` | double precision | Coordonnée GPS |
| `game_types` | jsonb | Types de jeux (array JSON) |
| `event_photo_url` | text | ⚠️ Doublon avec image_url ? |

**Notes:**
- `current_participants` est géré automatiquement, **ne jamais le mettre à jour manuellement**
- Utiliser `max_participants` pour la limite (pas `capacity`)
- Utiliser `image_url` pour l'image (pas `event_photo_url`)

---

### `games`

Catalogue des jeux de société.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire |
| `bgg_id` | text | ID BoardGameGeek |
| `name` | text | Nom du jeu |
| `min_players` | integer | Nombre minimum de joueurs |
| `max_players` | integer | Nombre maximum de joueurs |
| `duration_min` | integer | Durée en minutes |
| `data` | jsonb | Données supplémentaires (JSON) |
| `description` | text | Description du jeu |
| `photo_url` | text | URL de l'image du jeu |

---

### `profiles`

Profils utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Clé primaire (= auth.users.id) |
| `username` | text | Nom d'utilisateur unique |
| `full_name` | text | Nom complet |
| `avatar_url` | text | URL de l'avatar |
| `bio` | text | Biographie |
| `created_at` | timestamptz | Date de création |
| `updated_at` | timestamptz | Date de modification |
| `first_name` | text | Prénom |
| `last_name` | text | Nom de famille |
| `city` | text | Ville |
| `level` | integer | Niveau de l'utilisateur |
| `favorite_games` | jsonb | Jeux favoris (array JSON) |
| `profile_photo_url` | text | ⚠️ Doublon avec avatar_url ? |
| `email` | text | Email |
| `password` | text | ⚠️ Ne devrait pas être ici (géré par auth.users) |
| `gaming_preferences` | jsonb | Préférences de jeu (JSON) |

**Notes:**
- Utiliser `avatar_url` pour l'avatar (pas `profile_photo_url`)
- `password` ne devrait pas être dans cette table (Supabase Auth gère ça)

---

## 🔑 Relations entre tables

```
profiles (utilisateurs)
    ↓ creator_id
events (événements)
    ↓ event_id
event_participants (participations)
    ↓ user_id
profiles (participants)
```

---

## ⚠️ Points d'attention critiques

### 1. Colonnes à utiliser dans le code

| ✅ UTILISER | ❌ NE PAS UTILISER | Table |
|-------------|---------------------|-------|
| `user_id` | `profile_id` | event_participants |
| `max_participants` | `capacity` | events |
| `image_url` | `event_photo_url` | events |
| `avatar_url` | `profile_photo_url` | profiles |
| `current_participants` (lecture seule) | - | events |

### 2. Colonnes en lecture seule

**Ne JAMAIS mettre à jour manuellement :**
- `events.current_participants` → Géré par triggers
- `events.updated_at` → Géré automatiquement
- `profiles.created_at` → Immuable

### 3. Contraintes CHECK importantes

**event_participants.status:**
```sql
CHECK (status IN ('registered', 'attended', 'cancelled'))
```
⚠️ Utiliser `'registered'` par défaut, **PAS** `'confirmed'`

**events.status:**
```sql
CHECK (status IN ('active', 'cancelled', 'completed'))
```

**events.visibility:**
```sql
CHECK (visibility IN ('public', 'private', 'approval'))
```

---

## 📝 Bonnes pratiques

### Insertion dans event_participants

```typescript
// ✅ BON
await supabase
  .from('event_participants')
  .insert({
    event_id: eventId,
    user_id: userId,        // ✅ user_id
    status: 'registered'    // ✅ registered
  });

// ❌ MAUVAIS
await supabase
  .from('event_participants')
  .insert({
    event_id: eventId,
    profile_id: userId,     // ❌ Colonne n'existe pas
    status: 'confirmed'     // ❌ Valeur invalide
  });
```

### Lecture du nombre de participants

```typescript
// ✅ BON - Utiliser la colonne DB
const count = event.current_participants;

// ❌ MAUVAIS - Compter manuellement
const count = participants.length;
```

### Création d'événement

```typescript
// ✅ BON
const { data } = await supabase
  .from('events')
  .insert({
    title: 'Mon événement',
    date_time: new Date().toISOString(),
    location: 'Paris',
    max_participants: 10,     // ✅ max_participants
    creator_id: user.id,
    status: 'active'
  });
```

---

## 🔄 Triggers actifs

### Sur event_participants

| Trigger | Action | Effet |
|---------|--------|-------|
| `trigger_update_participants_count_insert` | AFTER INSERT | Incrémente `events.current_participants` |
| `trigger_update_participants_count_update` | AFTER UPDATE | Recalcule `events.current_participants` |
| `trigger_update_participants_count_delete` | AFTER DELETE | Décrémente `events.current_participants` |

### Fonction appelée

```sql
update_event_participants_count()
```

Cette fonction :
1. Compte les participants avec `status != 'cancelled'`
2. Met à jour `events.current_participants`
3. Met à jour `events.updated_at`

---

## 🧹 Colonnes à nettoyer (optionnel)

Ces colonnes semblent en doublon et pourraient être supprimées après vérification :

### Dans `events`
- `capacity` (utiliser `max_participants`)
- `event_photo_url` (utiliser `image_url`)

### Dans `profiles`
- `profile_photo_url` (utiliser `avatar_url`)
- `password` (géré par Supabase Auth, pas besoin ici)

**⚠️ Ne pas supprimer sans vérifier qu'aucun code ne les utilise !**

---

## 📊 Types de données importants

### UUID
Toutes les clés primaires et étrangères utilisent des UUID v4.

### JSONB
Colonnes stockant du JSON :
- `events.game_types` - Array de types de jeux
- `games.data` - Données supplémentaires du jeu
- `profiles.favorite_games` - Array de jeux favoris
- `profiles.gaming_preferences` - Préférences

### Timestamps
Tous les timestamps sont en UTC (`timestamptz`).

---

## 🔍 Requêtes utiles

### Vérifier la cohérence des participants

```sql
SELECT 
  e.title,
  e.current_participants as stored,
  COUNT(ep.id) as real,
  CASE 
    WHEN e.current_participants = COUNT(ep.id) THEN '✅ OK'
    ELSE '❌ Décalage'
  END as status
FROM events e
LEFT JOIN event_participants ep 
  ON ep.event_id = e.id 
  AND ep.status != 'cancelled'
GROUP BY e.id, e.title, e.current_participants;
```

### Lister les participants d'un événement

```sql
SELECT 
  p.username,
  p.full_name,
  ep.status,
  ep.joined_at
FROM event_participants ep
JOIN profiles p ON p.id = ep.user_id
WHERE ep.event_id = 'EVENT_ID_ICI'::uuid
ORDER BY ep.joined_at;
```

---

**Version:** 1.0  
**Dernière mise à jour:** 29 octobre 2025  
**Source:** Production Database

