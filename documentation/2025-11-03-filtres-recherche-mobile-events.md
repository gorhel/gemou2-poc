# Filtres de Recherche Avancés - Page Events Mobile

**Date de création :** 3 novembre 2025  
**Module :** Mobile - Events  
**Fonctionnalité :** Système de filtrage cumulatif pour la recherche d'événements

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture des composants](#architecture-des-composants)
3. [Flux de données](#flux-de-données)
4. [Composants détaillés](#composants-détaillés)
5. [Logique de filtrage](#logique-de-filtrage)
6. [Intégration base de données](#intégration-base-de-données)
7. [Tests et validation](#tests-et-validation)

---

## 🎯 Vue d'ensemble

### Objectif

Implémenter un système de filtrage avancé et cumulatif permettant aux utilisateurs de rechercher des événements selon plusieurs critères :

- **📍 Lieu** : Filtrage par villes (sélection multiple, logique OR)
- **📅 Date** : Filtrage par période (date de début et date de fin)
- **🎲 Type** : Filtrage par tags d'événements (sélection multiple, logique OR)
- **👥 Joueurs** : Filtrage par nombre maximum de participants

### Principes de conception

1. **Filtres cumulatifs** : Tous les filtres s'appliquent ensemble (logique AND entre catégories)
2. **Logique OR intra-catégorie** : Pour lieu et type, si plusieurs valeurs sont sélectionnées, un événement doit correspondre à au moins une valeur
3. **UX mobile-first** : Interface optimisée pour mobile avec des modaux en bottom sheet
4. **Performance** : Chargement optimisé des données et mise en cache des tags
5. **Accessibilité** : Navigation claire avec indicateurs visuels (badges, icônes)

---

## 🏗 Architecture des composants

### Arbre de composants

```
EventsPage (apps/mobile/app/(tabs)/events/index.tsx)
│
├─ PageLayout (wrapper global)
│
├─ SearchBar (TextInput)
│  └─ État: searchQuery
│
├─ NavigationTabs (ScrollView horizontal)
│  ├─ Tab: A venir
│  ├─ Tab: Je participe
│  ├─ Tab: J'organise
│  ├─ Tab: Passés
│  └─ Tab: Brouillon
│
├─ FiltersBar (ScrollView horizontal)
│  ├─ FilterButton: Date
│  │  ├─ Icon: 📅
│  │  ├─ Label: "Date"
│  │  └─ Badge: "1" (si actif)
│  │
│  ├─ FilterButton: Lieu
│  │  ├─ Icon: 📍
│  │  ├─ Label: "Lieu"
│  │  └─ Badge: count (si actif)
│  │
│  ├─ FilterButton: Type
│  │  ├─ Icon: 🎲
│  │  ├─ Label: "Type"
│  │  └─ Badge: count (si actif)
│  │
│  └─ FilterButton: Joueurs
│     ├─ Icon: 👥
│     ├─ Label: "Joueurs"
│     └─ Badge: "≤N" (si actif)
│
├─ LocationFilterModal (components/events/LocationFilterModal.tsx)
│  ├─ Header
│  │  ├─ Title: "📍 Filtrer par lieu"
│  │  └─ CloseButton
│  │
│  ├─ Content
│  │  └─ CitiesList (ScrollView)
│  │     └─ CityItem[] (TouchableOpacity)
│  │        ├─ CityText
│  │        └─ Checkmark (si sélectionné)
│  │
│  └─ Footer
│     ├─ ResetButton
│     └─ ApplyButton (avec count)
│
├─ DateFilterModal (components/events/DateFilterModal.tsx)
│  ├─ Header
│  │  ├─ Title: "📅 Filtrer par date"
│  │  └─ CloseButton
│  │
│  ├─ Content
│  │  ├─ DateInfoContainer
│  │  │  ├─ StartDate
│  │  │  ├─ Separator: "→"
│  │  │  └─ EndDate
│  │  │
│  │  ├─ StatusContainer
│  │  │  └─ CurrentSelectionStatus
│  │  │
│  │  ├─ MonthNavigation
│  │  │  ├─ PreviousButton: "←"
│  │  │  ├─ MonthTitle
│  │  │  └─ NextButton: "→"
│  │  │
│  │  └─ Calendar
│  │     ├─ WeekDayHeaders (Dim, Lun, ...)
│  │     └─ DaysGrid
│  │        └─ DayCell[]
│  │           ├─ Style: selected
│  │           ├─ Style: inRange
│  │           └─ Style: past (disabled)
│  │
│  └─ Footer
│     ├─ ResetButton
│     └─ ApplyButton (disabled si incomplet)
│
├─ TypeFilterModal (components/events/TypeFilterModal.tsx)
│  ├─ Header
│  │  ├─ Title: "🎲 Filtrer par type"
│  │  └─ CloseButton
│  │
│  ├─ Content
│  │  ├─ Subtitle
│  │  └─ TagsGrid (ScrollView)
│  │     └─ TagChip[] (TouchableOpacity)
│  │        ├─ TagEmoji (dynamique selon nom)
│  │        ├─ TagText
│  │        └─ Checkmark (si sélectionné)
│  │
│  └─ Footer
│     ├─ ResetButton
│     └─ ApplyButton (avec count)
│
├─ PlayersFilterModal (components/events/PlayersFilterModal.tsx)
│  ├─ Header
│  │  ├─ Title: "👥 Filtrer par nombre de joueurs"
│  │  └─ CloseButton
│  │
│  ├─ Content
│  │  ├─ Subtitle
│  │  ├─ CurrentSelectionContainer (si actif)
│  │  └─ OptionsList (ScrollView)
│  │     └─ OptionItem[] (TouchableOpacity)
│  │        ├─ Radio (Circle avec dot)
│  │        ├─ OptionTextContainer
│  │        │  ├─ OptionText: "N joueurs"
│  │        │  └─ OptionDescription
│  │        │
│  │        └─ PlayerIconsContainer
│  │           └─ PlayerIcons: 👤👤👤...
│  │
│  └─ Footer
│     ├─ ResetButton
│     └─ ApplyButton (avec "≤N")
│
└─ EventsList (FlatList)
   └─ TimeSections[]
      ├─ TimeSectionTitle
      └─ EventCard[]
         ├─ EventContent
         │  ├─ EventTextContent
         │  │  ├─ EventTimeSection
         │  │  ├─ EventTitle
         │  │  └─ EventTime
         │  │
         │  └─ EventImageContainer
         │     └─ EventImage | Placeholder
         │
         └─ OnPress → Navigate to event detail
```

### Structure de fichiers

```
apps/mobile/
├─ app/(tabs)/events/
│  └─ index.tsx                     # Page principale avec logique de filtrage
│
└─ components/events/
   ├─ LocationFilterModal.tsx       # Modal filtre par lieu
   ├─ DateFilterModal.tsx          # Modal filtre par date
   ├─ TypeFilterModal.tsx          # Modal filtre par type/tags
   └─ PlayersFilterModal.tsx       # Modal filtre par joueurs
```

---

## 🔄 Flux de données

### 1. Initialisation

```
Utilisateur ouvre la page Events
    ↓
loadUser() → Vérifier authentification
    ↓
loadEvents() → Charger événements depuis Supabase
    ├─ Récupérer events avec profiles (créateurs)
    ├─ Récupérer participations de l'utilisateur
    └─ loadEventTags() → Charger les tags de tous les événements
        └─ Stocker dans eventTagsMap (Map<eventId, tagIds[]>)
    ↓
filterEvents() → Appliquer filtres initiaux
    ↓
Affichage de la liste d'événements
```

### 2. Interaction avec les filtres

```
Utilisateur clique sur un bouton de filtre (ex: 📍 Lieu)
    ↓
setLocationModalVisible(true)
    ↓
LocationFilterModal s'ouvre
    ↓
loadCities() → Récupérer villes uniques depuis events.location
    ↓
Utilisateur sélectionne/désélectionne des villes
    ├─ toggleCity(city) → Mise à jour état local tempSelected
    └─ Visual feedback immédiat (checkbox, couleur)
    ↓
Utilisateur clique sur "Appliquer"
    ↓
onApply(cities) → Callback vers page parent
    ↓
setSelectedFilters(prev => ({ ...prev, cities }))
    ↓
useEffect détecte changement de selectedFilters
    ↓
filterEvents() → Réappliquer tous les filtres
    ↓
Mise à jour de filteredEvents
    ↓
FlatList re-render avec nouvelle liste filtrée
```

### 3. Filtrage cumulatif

```
filterEvents() est appelée
    ↓
1. Copier events[] dans filtered[]
    ↓
2. Appliquer filtre par onglet (upcoming, participating, etc.)
    ↓
3. Appliquer filtre par recherche textuelle (searchQuery)
    ↓
4. SI selectedFilters.cities.length > 0
    │  └─ Filtrer: events dont location inclut au moins une city
    ↓
5. SI selectedFilters.startDate ET selectedFilters.endDate
    │  └─ Filtrer: events dont date_time est entre startDate et endDate
    ↓
6. SI selectedFilters.tags.length > 0
    │  └─ Filtrer: events qui ont au moins un tag correspondant
    │     └─ Récupérer tags depuis eventTagsMap
    ↓
7. SI selectedFilters.maxPlayers !== null
    │  └─ Filtrer: events dont current_participants ≤ maxPlayers
    ↓
8. setFilteredEvents(filtered)
    ↓
FlatList re-render
```

---

## 🧩 Composants détaillés

### 1. LocationFilterModal

**Props :**
```typescript
interface LocationFilterModalProps {
  visible: boolean
  onClose: () => void
  selectedCities: string[]
  onApply: (cities: string[]) => void
}
```

**État interne :**
```typescript
const [cities, setCities] = useState<string[]>([])       // Villes disponibles
const [loading, setLoading] = useState(true)
const [tempSelected, setTempSelected] = useState<string[]>(selectedCities)
```

**Fonctionnalités :**
- Chargement automatique des villes uniques depuis la base de données
- Sélection multiple avec toggle (clic pour ajouter/retirer)
- Indicateur visuel : checkmark ✓ pour les villes sélectionnées
- Boutons : Réinitialiser (vider sélection) et Appliquer (avec count)
- Badge sur le bouton "Appliquer" affichant le nombre de villes sélectionnées

**Requête Supabase :**
```typescript
const { data, error } = await supabase
  .from('events')
  .select('location')
  .not('location', 'is', null)

// Extraction des villes uniques triées
const uniqueCities = Array.from(
  new Set(data.map(event => event.location.trim()).filter(Boolean))
).sort()
```

---

### 2. DateFilterModal

**Props :**
```typescript
interface DateFilterModalProps {
  visible: boolean
  onClose: () => void
  startDate: Date | null
  endDate: Date | null
  onApply: (startDate: Date | null, endDate: Date | null) => void
}
```

**État interne :**
```typescript
const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate)
const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate)
const [selectingStartDate, setSelectingStartDate] = useState(true)
const [currentMonth, setCurrentMonth] = useState(new Date())
```

**Fonctionnalités :**
- Calendrier interactif avec navigation mensuelle (← et →)
- Sélection en deux étapes : d'abord date de début, puis date de fin
- Affichage visuel de la période sélectionnée (dates + plage)
- Désactivation automatique des dates passées
- Logique intelligente : si date de fin < date de début, inversion automatique
- Status bar indiquant quelle date est en cours de sélection

**Logique de sélection :**
```typescript
const handleDateSelect = (date: Date) => {
  if (selectingStartDate) {
    setTempStartDate(date)
    setSelectingStartDate(false)
    // Si date de fin existe et est avant la nouvelle date de début, la réinitialiser
    if (tempEndDate && date > tempEndDate) {
      setTempEndDate(null)
    }
  } else {
    // Si date de fin avant date de début, inverser
    if (tempStartDate && date < tempStartDate) {
      setTempEndDate(tempStartDate)
      setTempStartDate(date)
    } else {
      setTempEndDate(date)
    }
  }
}
```

**Styles de jours :**
- `dayCellSelected` : Date de début ou de fin (fond bleu)
- `dayCellInRange` : Dates entre début et fin (fond bleu clair)
- `dayCellPast` : Dates passées (grisées, désactivées)

---

### 3. TypeFilterModal

**Props :**
```typescript
interface TypeFilterModalProps {
  visible: boolean
  onClose: () => void
  selectedTags: number[]
  onApply: (tags: number[]) => void
}
```

**État interne :**
```typescript
interface Tag {
  id: number
  name: string
}

const [tags, setTags] = useState<Tag[]>([])
const [loading, setLoading] = useState(true)
const [tempSelected, setTempSelected] = useState<number[]>(selectedTags)
```

**Fonctionnalités :**
- Chargement des tags depuis la table `tags`
- Affichage en grille flexible avec chips
- Emoji dynamique selon le nom du tag (stratégie 🎯, aventure 🗺️, etc.)
- Sélection multiple avec toggle
- Indicateur visuel : checkmark ✓ et changement de couleur

**Requête Supabase :**
```typescript
const { data, error } = await supabase
  .from('tags')
  .select('id, name')
  .order('name', { ascending: true })
```

**Mapping d'emojis :**
```typescript
const getTagEmoji = (tagName: string): string => {
  const lowerName = tagName.toLowerCase()
  
  if (lowerName.includes('stratégie')) return '🎯'
  if (lowerName.includes('aventure')) return '🗺️'
  if (lowerName.includes('famille')) return '👨‍👩‍👧‍👦'
  if (lowerName.includes('party')) return '🎉'
  if (lowerName.includes('coopératif')) return '🤝'
  if (lowerName.includes('abstract')) return '🔷'
  if (lowerName.includes('cartes')) return '🃏'
  if (lowerName.includes('dés')) return '🎲'
  // ... etc.
  
  return '🏷️' // Emoji par défaut
}
```

---

### 4. PlayersFilterModal

**Props :**
```typescript
interface PlayersFilterModalProps {
  visible: boolean
  onClose: () => void
  maxPlayers: number | null
  onApply: (maxPlayers: number | null) => void
}
```

**État interne :**
```typescript
const [tempSelected, setTempSelected] = useState<number | null>(maxPlayers)
```

**Options prédéfinies :**
```typescript
const PLAYER_OPTIONS = [
  { value: 2, label: '2 joueurs' },
  { value: 4, label: '4 joueurs' },
  { value: 6, label: '6 joueurs' },
  { value: 8, label: '8 joueurs' },
  { value: 10, label: '10 joueurs' },
  { value: 15, label: '15 joueurs' },
  { value: 20, label: '20 joueurs' },
  { value: 30, label: '30 joueurs' },
  { value: 50, label: '50+ joueurs' }
]
```

**Fonctionnalités :**
- Sélection unique (radio buttons)
- Affichage visuel du nombre de joueurs avec icônes 👤
- Description claire : "Événements avec ≤ N participants"
- Badge sur le bouton "Appliquer" affichant "≤N"
- Toggle : cliquer sur l'option sélectionnée la désélectionne

**Logique de sélection :**
```typescript
const handleSelect = (value: number) => {
  setTempSelected(value === tempSelected ? null : value)
}
```

---

## 🔍 Logique de filtrage

### Structure de l'état des filtres

```typescript
interface FilterState {
  cities: string[]          // Villes sélectionnées (logique OR)
  startDate: Date | null    // Date de début de période
  endDate: Date | null      // Date de fin de période
  tags: number[]            // IDs des tags sélectionnés (logique OR)
  maxPlayers: number | null // Nombre maximum de participants
}
```

### Fonction filterEvents() - Étape par étape

```typescript
const filterEvents = () => {
  let filtered = [...events]
  const now = new Date()

  // ÉTAPE 1: Filtre par onglet actif
  switch (activeTab) {
    case 'upcoming':
      filtered = filtered.filter(event => 
        new Date(event.date_time) >= now && 
        event.status !== 'draft' &&
        event.status !== 'cancelled'
      )
      break
    
    case 'participating':
      filtered = filtered.filter(event => 
        participatingEventIds.includes(event.id)
      )
      break
    
    case 'organizing':
      filtered = filtered.filter(event => 
        event.creator_id === user?.id
      )
      break
    
    case 'past':
      filtered = filtered.filter(event => 
        new Date(event.date_time) < now
      )
      break
    
    case 'draft':
      filtered = filtered.filter(event => 
        event.status === 'draft' && 
        event.creator_id === user?.id
      )
      break
  }

  // ÉTAPE 2: Filtre par recherche textuelle
  if (searchQuery) {
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // ÉTAPE 3: Filtre par villes (OR logique)
  if (selectedFilters.cities.length > 0) {
    filtered = filtered.filter(event =>
      selectedFilters.cities.some(city => 
        event.location.toLowerCase().includes(city.toLowerCase())
      )
    )
  }

  // ÉTAPE 4: Filtre par dates (période)
  if (selectedFilters.startDate && selectedFilters.endDate) {
    const startDate = new Date(selectedFilters.startDate)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(selectedFilters.endDate)
    endDate.setHours(23, 59, 59, 999)

    filtered = filtered.filter(event => {
      const eventDate = new Date(event.date_time)
      return eventDate >= startDate && eventDate <= endDate
    })
  }

  // ÉTAPE 5: Filtre par tags (OR logique)
  if (selectedFilters.tags.length > 0) {
    filtered = filtered.filter(event => {
      const eventTags = eventTagsMap.get(event.id) || []
      return selectedFilters.tags.some(tagId => eventTags.includes(tagId))
    })
  }

  // ÉTAPE 6: Filtre par nombre de joueurs
  if (selectedFilters.maxPlayers !== null) {
    filtered = filtered.filter(event => 
      event.current_participants <= selectedFilters.maxPlayers!
    )
  }

  setFilteredEvents(filtered)
}
```

### Logique cumulative expliquée

Les filtres s'appliquent de manière **cumulative** (AND) :
- Un événement doit satisfaire **TOUS** les filtres actifs pour être affiché

Pour les filtres avec sélection multiple (villes, tags), la logique est **OR** :
- Un événement doit correspondre à **AU MOINS UNE** des valeurs sélectionnées

**Exemple :**
```
Filtres actifs :
- Villes : ["Paris", "Lyon"]
- Date : 2025-12-01 → 2025-12-31
- Tags : [1, 3] (Stratégie, Famille)
- Joueurs : ≤ 10

Résultat :
Événements qui sont :
  ET (location = "Paris" OU location = "Lyon")
  ET (date_time entre 2025-12-01 et 2025-12-31)
  ET (a le tag 1 OU le tag 3)
  ET (current_participants ≤ 10)
```

---

## 🗄 Intégration base de données

### Tables utilisées

#### 1. `events`
```sql
CREATE TABLE events (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text,
  date_time timestamptz NOT NULL,
  location text NOT NULL,
  max_participants int NOT NULL,
  current_participants int DEFAULT 0,
  status text DEFAULT 'published',
  creator_id uuid REFERENCES profiles(id),
  image_url text,
  created_at timestamptz DEFAULT now()
);
```

#### 2. `tags`
```sql
CREATE TABLE tags (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);
```

#### 3. `event_tags` (table de liaison)
```sql
CREATE TABLE event_tags (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  tag_id int REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_id)
);
```

#### 4. `event_participants`
```sql
CREATE TABLE event_participants (
  id uuid PRIMARY KEY,
  event_id uuid REFERENCES events(id),
  user_id uuid REFERENCES profiles(id),
  status text DEFAULT 'registered',
  created_at timestamptz DEFAULT now()
);
```

### Requêtes principales

#### Charger les événements avec leurs créateurs
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
    creator_id,
    image_url,
    profiles!creator_id (
      username,
      full_name,
      avatar_url
    )
  `)
  .order('date_time', { ascending: true })
```

#### Charger les tags de plusieurs événements
```typescript
const { data, error } = await supabase
  .from('event_tags')
  .select('event_id, tag_id')
  .in('event_id', eventIds)

// Transformer en Map pour accès rapide
const tagsMap = new Map<string, number[]>()
(data || []).forEach(item => {
  const existingTags = tagsMap.get(item.event_id) || []
  tagsMap.set(item.event_id, [...existingTags, item.tag_id])
})
```

#### Charger les villes disponibles
```typescript
const { data, error } = await supabase
  .from('events')
  .select('location')
  .not('location', 'is', null)

const uniqueCities = Array.from(
  new Set(data.map(event => event.location.trim()).filter(Boolean))
).sort()
```

#### Charger tous les tags
```typescript
const { data, error } = await supabase
  .from('tags')
  .select('id, name')
  .order('name', { ascending: true })
```

---

## 🎨 Design et UX

### Principes de design

1. **Mobile-first** : Toutes les modales utilisent le pattern bottom sheet
2. **Feedback visuel immédiat** : Changements de couleur, checkmarks, badges
3. **Clarté** : Labels explicites, descriptions, indicateurs de sélection
4. **Performance** : Pas de lag lors de l'ouverture des modales ou du filtrage

### Palette de couleurs

```typescript
// Couleurs principales
const PRIMARY = '#3b82f6'      // Bleu principal
const PRIMARY_LIGHT = '#dbeafe' // Bleu clair pour fond actif
const PRIMARY_DARK = '#1e40af'  // Bleu foncé pour texte

// Couleurs neutres
const GRAY_100 = '#f3f4f6'
const GRAY_200 = '#e5e7eb'
const GRAY_400 = '#9ca3af'
const GRAY_600 = '#6b7280'
const GRAY_900 = '#1f2937'

// Fond
const WHITE = 'white'
const OVERLAY = 'rgba(0, 0, 0, 0.5)'
```

### Icônes et emojis

- **📅 Date** : Calendrier
- **📍 Lieu** : Épingle de localisation
- **🎲 Type** : Dé (jeux de société)
- **👥 Joueurs** : Groupe de personnes
- **✓ Checkmark** : Validation de sélection
- **← →** : Navigation dans le calendrier
- **✕ Close** : Fermeture des modales

### Animations

- **Modales** : `animationType="slide"` (slide up depuis le bas)
- **Transitions** : Changements de couleur fluides via StyleSheet
- **ScrollViews** : Défilement horizontal sans indicateur pour les filtres

---

## ✅ Tests et validation

### Tests fonctionnels

#### 1. Test du filtre par lieu
- [ ] Ouvrir le modal de lieu
- [ ] Vérifier que les villes sont chargées et triées
- [ ] Sélectionner plusieurs villes
- [ ] Vérifier l'affichage des checkmarks
- [ ] Appliquer le filtre
- [ ] Vérifier que le badge affiche le bon nombre
- [ ] Vérifier que seuls les événements des villes sélectionnées sont affichés
- [ ] Réinitialiser le filtre et vérifier que tous les événements réapparaissent

#### 2. Test du filtre par date
- [ ] Ouvrir le modal de date
- [ ] Sélectionner une date de début
- [ ] Vérifier que le mode passe à "sélection de date de fin"
- [ ] Sélectionner une date de fin
- [ ] Vérifier l'affichage de la plage dans le calendrier
- [ ] Appliquer le filtre
- [ ] Vérifier que seuls les événements dans la période sont affichés
- [ ] Tester la navigation entre les mois
- [ ] Vérifier que les dates passées sont désactivées

#### 3. Test du filtre par type
- [ ] Ouvrir le modal de type
- [ ] Vérifier que les tags sont chargés
- [ ] Vérifier que les emojis sont affichés correctement
- [ ] Sélectionner plusieurs tags
- [ ] Appliquer le filtre
- [ ] Vérifier que le badge affiche le bon nombre
- [ ] Vérifier que seuls les événements avec au moins un tag correspondant sont affichés

#### 4. Test du filtre par joueurs
- [ ] Ouvrir le modal de joueurs
- [ ] Sélectionner une option (ex: 10 joueurs)
- [ ] Vérifier l'affichage du radio button
- [ ] Appliquer le filtre
- [ ] Vérifier que le badge affiche "≤N"
- [ ] Vérifier que seuls les événements avec ≤ N participants sont affichés

#### 5. Test des filtres cumulatifs
- [ ] Activer plusieurs filtres en même temps
- [ ] Vérifier que tous les filtres s'appliquent (logique AND)
- [ ] Désactiver un filtre à la fois et vérifier que les autres restent actifs
- [ ] Réinitialiser tous les filtres et vérifier le retour à l'état initial

### Tests d'intégration

- [ ] Test avec une base de données vide
- [ ] Test avec des événements sans tags
- [ ] Test avec des événements dans différentes villes
- [ ] Test avec des événements sur différentes périodes
- [ ] Test de performance avec 100+ événements

### Tests d'accessibilité

- [ ] Navigation au clavier possible (si applicable)
- [ ] Labels clairs et descriptifs
- [ ] Feedback visuel pour toutes les interactions
- [ ] Contraste de couleurs suffisant
- [ ] Taille des boutons adaptée au touch (44x44 minimum)

---

## 📊 Métriques et performance

### Temps de chargement cibles

- **Ouverture d'un modal** : < 100ms
- **Chargement des villes** : < 500ms
- **Chargement des tags** : < 500ms
- **Application d'un filtre** : < 200ms
- **Re-render de la liste** : < 100ms

### Optimisations implémentées

1. **Mise en cache des tags** : Les tags d'événements sont chargés une seule fois et stockés dans une `Map`
2. **Éviter les re-renders inutiles** : Utilisation de `useEffect` avec dépendances précises
3. **Scroll horizontal performant** : `showsHorizontalScrollIndicator={false}` pour réduire le overhead
4. **FlatList optimisée** : Utilisation de `keyExtractor` et pas de nested FlatList

---

## 🔧 Maintenance et évolutions

### Améliorations futures possibles

1. **Persistance des filtres** : Sauvegarder les filtres dans AsyncStorage pour les restaurer à la prochaine visite
2. **Filtres prédéfinis** : "Événements proches", "Ce week-end", "Petits groupes"
3. **Recherche textuelle dans les modaux** : Permettre de chercher une ville ou un tag
4. **Filtre par distance géographique** : Utiliser la géolocalisation
5. **Historique des filtres** : Suggestions basées sur les filtres précédents
6. **Statistiques** : Afficher le nombre de résultats pendant la sélection dans les modaux
7. **Animation des transitions** : Animer l'apparition/disparition des événements filtrés

### Points d'attention

- **Performances** : Surveiller les performances avec un grand nombre d'événements (> 500)
- **Cohérence des données** : Assurer que les villes dans `location` suivent un format standard
- **Gestion des erreurs** : Ajouter des fallbacks si les requêtes échouent
- **Tests E2E** : Implémenter des tests end-to-end avec Detox ou similar

---

## 📝 Changelog

### Version 1.0.0 (3 novembre 2025)

#### ✨ Nouvelles fonctionnalités
- Ajout du filtre par lieu avec sélection multiple de villes
- Ajout du filtre par date avec calendrier de période
- Ajout du filtre par type avec tags issus de `event_tags`
- Ajout du filtre par nombre de joueurs
- Implémentation de la logique de filtrage cumulative
- Badges d'indication sur les boutons de filtres
- Modales en bottom sheet pour une meilleure UX mobile

#### 🔧 Améliorations techniques
- Optimisation du chargement des tags avec mise en cache
- Séparation des composants de filtrage en fichiers distincts
- Structure d'état claire avec interface `FilterState`
- Gestion propre des états des modaux

#### 🎨 Design
- Interface mobile-first avec modales en bottom sheet
- Indicateurs visuels clairs (badges, checkmarks, couleurs)
- Emojis dynamiques pour les tags
- Feedback visuel immédiat pour toutes les interactions

---

## 👥 Auteurs et contributeurs

- **Développeur principal** : AI Assistant (Claude Sonnet 4.5)
- **Date de création** : 3 novembre 2025
- **Projet** : Gemou2 - Plateforme de gestion d'événements de jeux de société

---

## 📚 Ressources

### Documentation externe

- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.io/docs)
- [Expo Router](https://expo.github.io/router/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Fichiers liés

- `apps/mobile/app/(tabs)/events/index.tsx` - Page principale
- `apps/mobile/components/events/LocationFilterModal.tsx` - Modal filtre lieu
- `apps/mobile/components/events/DateFilterModal.tsx` - Modal filtre date
- `apps/mobile/components/events/TypeFilterModal.tsx` - Modal filtre type
- `apps/mobile/components/events/PlayersFilterModal.tsx` - Modal filtre joueurs

---

**Fin de la documentation**

