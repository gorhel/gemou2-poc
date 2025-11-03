# Système de Filtrage des Événements - Page Mobile

**Date :** 2 novembre 2025  
**Composant modifié :** `/apps/mobile/app/(tabs)/events/index.tsx`  
**Type de modification :** Amélioration fonctionnelle - Système de filtrage par onglets

---

## Problème Identifié

La page des événements mobile avait un système de filtrage incomplet et non fonctionnel :
- Les filtres ne distinguaient pas correctement les différents types d'événements
- Pas de filtre "A venir" pour voir tous les événements futurs
- Le filtre "Je participe" ne vérifiait pas réellement les participations
- Le filtre "J'organise" ne vérifiait pas le `creator_id`
- Le filtre "Brouillon" ne filtrait pas correctement

---

## Solution Implémentée

### 5 Onglets de Filtrage

#### 1. **"A venir"** (Onglet par défaut)
**Critères :**
- Date de l'événement ≥ maintenant
- Statut ≠ `'draft'`
- Statut ≠ `'cancelled'`
- **Tous les hôtes** (événements publics)

**Code :**
```typescript
case 'upcoming':
  filtered = filtered.filter(event => 
    new Date(event.date_time) >= now && 
    event.status !== 'draft' &&
    event.status !== 'cancelled'
  );
  break;
```

**Cas d'usage :**
- Découvrir les événements à venir
- Voir tous les événements publics disponibles
- Navigation par défaut pour les utilisateurs

---

#### 2. **"Je participe"**
**Critères :**
- L'utilisateur est inscrit dans `event_participants`
- `status = 'registered'`

**Code :**
```typescript
case 'participating':
  filtered = filtered.filter(event => 
    participatingEventIds.includes(event.id)
  );
  break;
```

**Récupération des participations :**
```typescript
const { data: participations, error: participationsError } = await supabase
  .from('event_participants')
  .select('event_id')
  .eq('user_id', user.id)
  .eq('status', 'registered');

if (!participationsError && participations) {
  const eventIds = participations.map(p => p.event_id);
  setParticipatingEventIds(eventIds);
}
```

**Cas d'usage :**
- Voir ses événements inscrits
- Gérer ses participations
- Préparer ses prochaines sessions de jeux

---

#### 3. **"J'organise"**
**Critères :**
- `creator_id = user.id`
- Tous les statuts (actifs, passés, brouillons)

**Code :**
```typescript
case 'organizing':
  filtered = filtered.filter(event => 
    event.creator_id === user?.id
  );
  break;
```

**Cas d'usage :**
- Gérer ses événements créés
- Voir l'historique de ses organisations
- Modifier ou supprimer ses événements

---

#### 4. **"Passés"**
**Critères :**
- Date de l'événement < maintenant
- Tous les événements (créés par tous les hôtes)

**Code :**
```typescript
case 'past':
  filtered = filtered.filter(event => 
    new Date(event.date_time) < now
  );
  break;
```

**Cas d'usage :**
- Consulter l'historique des événements
- Revivre les sessions passées
- Statistiques et souvenirs

---

#### 5. **"Brouillon"**
**Critères :**
- `status = 'draft'`
- `creator_id = user.id`
- **Uniquement les brouillons de l'utilisateur**

**Code :**
```typescript
case 'draft':
  filtered = filtered.filter(event => 
    event.status === 'draft' && 
    event.creator_id === user?.id
  );
  break;
```

**Cas d'usage :**
- Reprendre la création d'un événement
- Événements non encore publiés
- Préparer des événements futurs

---

## Modifications Techniques

### 1. Ajout du Type `TabType`

**Avant :**
```typescript
type TabType = 'participating' | 'organizing' | 'past' | 'draft';
```

**Après :**
```typescript
type TabType = 'upcoming' | 'participating' | 'organizing' | 'past' | 'draft';
```

### 2. Ajout du State `participatingEventIds`

```typescript
const [participatingEventIds, setParticipatingEventIds] = useState<string[]>([]);
```

Ce state stocke les IDs des événements auxquels l'utilisateur participe.

### 3. Modification de l'Interface `Event`

**Ajout du champ `creator_id` :**
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  status: string;
  creator_id: string; // ✅ Nouveau
  image_url?: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}
```

### 4. Récupération du `creator_id` dans `loadEvents`

```typescript
const { data, error } = await supabase
  .from('events')
  .select(`
    id,
    title,
    description,
    date_time,
    location,
    max_participants,
    current_participants,
    status,
    creator_id, // ✅ Ajouté
    image_url,
    profiles!creator_id (
      username,
      full_name,
      avatar_url
    )
  `)
  .order('date_time', { ascending: true });
```

### 5. Chargement des Participations

```typescript
// Charger les participations de l'utilisateur si connecté
if (user) {
  const { data: participations, error: participationsError } = await supabase
    .from('event_participants')
    .select('event_id')
    .eq('user_id', user.id)
    .eq('status', 'registered');

  if (!participationsError && participations) {
    const eventIds = participations.map(p => p.event_id);
    setParticipatingEventIds(eventIds);
  }
}
```

### 6. Séparation des `useEffect`

**Avant (problématique) :**
```typescript
useEffect(() => {
  loadUser();
  loadEvents(); // ❌ user n'est pas encore chargé
}, []);
```

**Après (correct) :**
```typescript
useEffect(() => {
  loadUser();
}, []);

useEffect(() => {
  if (user) {
    loadEvents(); // ✅ user est chargé
  }
}, [user]);
```

### 7. Mise à Jour des Dépendances du Filtre

```typescript
useEffect(() => {
  filterEvents();
}, [events, searchQuery, activeTab, selectedFilters, participatingEventIds, user]);
```

---

## Architecture des Données

```
┌─────────────────────────────────────────────────────────┐
│                    EventsPage Component                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  States:                                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ user (User)                                      │  │
│  │ events (Event[])                                 │  │
│  │ filteredEvents (Event[])                         │  │
│  │ participatingEventIds (string[])                 │  │
│  │ activeTab (TabType)                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Data Flow:                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. loadUser() → user                             │  │
│  │ 2. loadEvents() → events + participations        │  │
│  │ 3. filterEvents() → filteredEvents               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Database Queries:                                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • events (avec creator_id)                       │  │
│  │ • event_participants (user_id, status)           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Structure des Composants

```
EventsPage
├── SearchContainer
│   └── TextInput (Recherche)
│
├── TabsContainer (Scrollable horizontal)
│   ├── Tab: "A venir" [default]
│   ├── Tab: "Je participe"
│   ├── Tab: "J'organise"
│   ├── Tab: "Passés"
│   └── Tab: "Brouillon"
│
├── FiltersContainer (Scrollable horizontal)
│   ├── Filter: Date 📅
│   ├── Filter: Location 📍
│   ├── Filter: Type 🎲
│   └── Filter: Players 👥
│
└── EventsList (FlatList)
    └── TimeSection[]
        ├── TimeSectionTitle (Aujourd'hui, Demain, etc.)
        └── EventCard[]
            ├── EventTextContent
            │   ├── Date & Heure
            │   ├── Titre
            │   └── Participants
            └── EventImageContainer
```

---

## Flux de Navigation et Filtrage

```
User ouvre /events
        ↓
Tab par défaut: "A venir"
        ↓
loadUser() exécuté
        ↓
user chargé
        ↓
loadEvents() exécuté
        ↓
┌───────────────────────────────────┐
│ Récupération simultanée:         │
│ 1. Events avec creator_id        │
│ 2. Participations de l'utilisateur│
└───────────────────────────────────┘
        ↓
filterEvents() exécuté
        ↓
Affichage des événements "A venir"
        ↓
User change d'onglet
        ↓
activeTab mis à jour
        ↓
filterEvents() re-exécuté
        ↓
Affichage mis à jour
```

---

## Exemples de Requêtes SQL

### Récupération des Événements

```sql
SELECT 
  id,
  title,
  description,
  date_time,
  location,
  max_participants,
  current_participants,
  status,
  creator_id,
  image_url
FROM events
ORDER BY date_time ASC;
```

### Récupération des Participations

```sql
SELECT event_id
FROM event_participants
WHERE user_id = $1
  AND status = 'registered';
```

### Filtre "A venir" (logique équivalente)

```sql
SELECT * FROM events
WHERE date_time >= NOW()
  AND status NOT IN ('draft', 'cancelled')
ORDER BY date_time ASC;
```

### Filtre "Je participe" (logique équivalente)

```sql
SELECT e.*
FROM events e
INNER JOIN event_participants ep ON e.id = ep.event_id
WHERE ep.user_id = $1
  AND ep.status = 'registered'
ORDER BY e.date_time ASC;
```

### Filtre "J'organise" (logique équivalente)

```sql
SELECT * FROM events
WHERE creator_id = $1
ORDER BY date_time ASC;
```

### Filtre "Brouillon" (logique équivalente)

```sql
SELECT * FROM events
WHERE status = 'draft'
  AND creator_id = $1
ORDER BY date_time ASC;
```

---

## Tests Recommandés

### Tests Fonctionnels

#### Test 1 : Onglet "A venir"
1. ✅ Ouvrir la page /events
2. ✅ Vérifier que l'onglet "A venir" est actif par défaut
3. ✅ Vérifier que seuls les événements futurs sont affichés
4. ✅ Vérifier qu'aucun brouillon n'est visible
5. ✅ Vérifier qu'aucun événement annulé n'est visible

#### Test 2 : Onglet "Je participe"
1. ✅ S'inscrire à un événement
2. ✅ Aller sur l'onglet "Je participe"
3. ✅ Vérifier que l'événement inscrit est visible
4. ✅ Vérifier que les autres événements ne sont pas visibles

#### Test 3 : Onglet "J'organise"
1. ✅ Créer un événement
2. ✅ Aller sur l'onglet "J'organise"
3. ✅ Vérifier que l'événement créé est visible
4. ✅ Vérifier que les événements d'autres utilisateurs ne sont pas visibles

#### Test 4 : Onglet "Passés"
1. ✅ Aller sur l'onglet "Passés"
2. ✅ Vérifier que seuls les événements avec date < maintenant sont visibles
3. ✅ Vérifier que les événements futurs ne sont pas visibles

#### Test 5 : Onglet "Brouillon"
1. ✅ Créer un événement en brouillon (status = 'draft')
2. ✅ Aller sur l'onglet "Brouillon"
3. ✅ Vérifier que le brouillon est visible
4. ✅ Vérifier que les brouillons d'autres utilisateurs ne sont pas visibles

### Tests de Recherche

1. ✅ Taper un terme dans la barre de recherche
2. ✅ Vérifier que les résultats sont filtrés dans l'onglet actif
3. ✅ Changer d'onglet avec un terme de recherche actif
4. ✅ Vérifier que le filtre de recherche persiste

### Tests de Rafraîchissement

1. ✅ Pull-to-refresh sur chaque onglet
2. ✅ Vérifier que les données sont rechargées
3. ✅ Vérifier que l'onglet actif reste le même

---

## Gestion des Cas Limites

### Cas 1 : Utilisateur Non Connecté
**Comportement :** Redirection vers `/login`

```typescript
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  router.replace('/login');
  return;
}
```

### Cas 2 : Aucun Événement
**Comportement :** Liste vide affichée (pas d'erreur)

### Cas 3 : Aucune Participation
**Comportement :** Onglet "Je participe" vide

```typescript
if (!participationsError && participations) {
  const eventIds = participations.map(p => p.event_id);
  setParticipatingEventIds(eventIds); // Peut être []
}
```

### Cas 4 : Aucun Événement Organisé
**Comportement :** Onglet "J'organise" vide

### Cas 5 : Événement Sans `creator_id`
**Comportement :** Ne sera pas visible dans "J'organise" ni "Brouillon"

**Solution recommandée :** Ajouter une contrainte `NOT NULL` sur `creator_id` dans la migration

```sql
ALTER TABLE events
ALTER COLUMN creator_id SET NOT NULL;
```

---

## Performance et Optimisation

### 1. Chargement Initial

**Optimisé :**
- Une seule requête pour tous les événements
- Une seule requête pour les participations
- Pas de requêtes supplémentaires lors du changement d'onglet (filtrage côté client)

### 2. Filtrage Côté Client

**Avantage :**
```typescript
// ✅ Rapide : filtrage en mémoire
filtered = events.filter(event => ...)
```

**Inconvénient potentiel :**
- Si il y a des milliers d'événements, le filtrage côté client peut être lent
- Solution future : pagination ou filtrage côté serveur

### 3. Mise en Cache

Les événements et participations sont mis en cache dans le state React :
```typescript
const [events, setEvents] = useState<Event[]>([]);
const [participatingEventIds, setParticipatingEventIds] = useState<string[]>([]);
```

### 4. Amélioration Future : Pagination

```typescript
const loadEvents = async (page = 1, limit = 20) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .range(from, to)
    .order('date_time', { ascending: true });
}
```

---

## Impact sur la Base de Données

### Tables Utilisées

| Table | Champs Utilisés | Opération |
|-------|-----------------|-----------|
| `events` | `id`, `creator_id`, `status`, `date_time` | SELECT |
| `event_participants` | `event_id`, `user_id`, `status` | SELECT |
| `profiles` | `username`, `full_name`, `avatar_url` | JOIN |

### Index Recommandés

```sql
-- Index sur creator_id pour "J'organise"
CREATE INDEX IF NOT EXISTS idx_events_creator_id 
ON events(creator_id);

-- Index sur status pour filtrer les brouillons
CREATE INDEX IF NOT EXISTS idx_events_status 
ON events(status);

-- Index sur date_time pour les événements futurs/passés
CREATE INDEX IF NOT EXISTS idx_events_date_time 
ON events(date_time);

-- Index composite pour event_participants
CREATE INDEX IF NOT EXISTS idx_event_participants_user_status 
ON event_participants(user_id, status);
```

---

## Évolutions Futures Possibles

### 1. Notification de Nouveaux Événements
Ajouter un badge sur "A venir" pour signaler les nouveaux événements :
```typescript
const [newEventsCount, setNewEventsCount] = useState(0);
```

### 2. Tri Personnalisé
Permettre le tri par :
- Date (croissant/décroissant)
- Popularité (nombre de participants)
- Proximité géographique

### 3. Filtres Avancés
Implémenter les filtres existants (📅 Date, 📍 Location, 🎲 Type, 👥 Players)

### 4. Recherche Avancée
Ajouter la recherche par :
- Nom d'hôte
- Type de jeu
- Distance géographique

### 5. Mode Hors Ligne
Mettre en cache les événements pour consultation offline :
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarder
await AsyncStorage.setItem('cached_events', JSON.stringify(events));

// Récupérer
const cachedEvents = await AsyncStorage.getItem('cached_events');
```

---

## Conclusion

Le système de filtrage des événements offre maintenant :

✅ **5 onglets distincts** pour différents cas d'usage  
✅ **Filtrage précis** basé sur les données réelles (participations, création)  
✅ **Performance optimale** avec filtrage côté client  
✅ **Expérience utilisateur claire** avec onglet par défaut "A venir"  
✅ **Séparation des préoccupations** (événements publics vs personnels)  

Les utilisateurs peuvent maintenant facilement :
- Découvrir de nouveaux événements
- Gérer leurs participations
- Organiser leurs propres événements
- Consulter l'historique
- Travailler sur des brouillons

