# Structure de la page de détail d'événement

**Date:** 16 novembre 2025  
**Type:** Documentation - Structure des composants  
**Fichier:** `/apps/mobile/app/(tabs)/events/[id].tsx`

## 🌳 Arbre des composants

```
EventDetailsPage
│
└── PageLayout
    │
    ├── TopHeader
    │   │
    │   ├── [Section Gauche]
    │   │   └── TouchableOpacity (Bouton Retour)
    │   │       └── Text "← Retour"
    │   │
    │   ├── [Section Centre]
    │   │   ├── Text (Titre)
    │   │   │   └── "Détails de l'événement"
    │   │   └── Text? (Sous-titre optionnel)
    │   │
    │   └── [Section Droite]
    │       └── View (Actions conditionnelles)
    │           ├── TouchableOpacity (Modifier) [si isCreator]
    │           │   └── Text "✏️"
    │           └── TouchableOpacity (Supprimer) [si isCreator]
    │               └── Text "🗑️"
    │
    └── ScrollView (avec RefreshControl)
        │
        ├── View (content)
        │   │
        │   ├── [Image de l'événement]
        │   │   └── View (eventImageContainer)
        │   │       └── Image (eventImage)
        │   │           └── event.image_url || placeholder
        │   │
        │   ├── [Titre principal]
        │   │   └── Text (title)
        │   │       └── event.title
        │   │
        │   ├── [Métadonnées]
        │   │   └── View (metaContainer)
        │   │       │
        │   │       ├── View (metaItem - Hôte)
        │   │       │   └── View (organizerContainer)
        │   │       │       ├── View (organizerAvatar)
        │   │       │       │   ├── Image (avatar) [si creator.avatar_url]
        │   │       │       │   └── View (avatarFallback) [sinon]
        │   │       │       │       └── Text (initiales)
        │   │       │       └── Text (metaText)
        │   │       │           ├── "Hôte"
        │   │       │           └── "Organisé par [nom]"
        │   │       │
        │   │       ├── View (metaItem - Lieu)
        │   │       │   ├── Text (metaEmoji) "📍"
        │   │       │   └── Text (metaText)
        │   │       │       ├── "Lieu de l'événement"
        │   │       │       └── event.location
        │   │       │
        │   │       ├── View (metaItem - Horaire)
        │   │       │   ├── Text (metaEmoji) "📅"
        │   │       │   └── Text (metaText)
        │   │       │       ├── "Horaire"
        │   │       │       └── formatDate(event.date_time)
        │   │       │
        │   │       ├── View (metaItem - Capacité)
        │   │       │   ├── Text (metaEmoji) "👥"
        │   │       │   └── Text (metaText)
        │   │       │       ├── "Capacité"
        │   │       │       └── "{current}/{max} participants"
        │   │       │
        │   │       └── View (metaItem - Coût)
        │   │           ├── Text (metaEmoji) "💰"
        │   │           └── Text (metaText)
        │   │               ├── "Coût"
        │   │               └── "Gratuit"
        │   │
        │   ├── View (separator)
        │   │
        │   ├── [Description]
        │   │   └── View (descriptionContainer)
        │   │       ├── Text (descriptionTitle) "Description"
        │   │       └── Text (description) [ou emptyStateText]
        │   │           └── event.description
        │   │
        │   ├── [Liste des jeux]
        │   │   └── View (descriptionContainer)
        │   │       ├── Text (descriptionTitle) "Jeux (n)"
        │   │       └── eventGames.map()
        │   │           └── View (gameCard)
        │   │               ├── View (gameImageContainer) [si image_url]
        │   │               │   └── Image (gameImage)
        │   │               ├── View (gameInfo)
        │   │               │   ├── Text (gameTitle)
        │   │               │   ├── Text (gameCategory) [si category]
        │   │               │   └── View (gameDetailsRow)
        │   │               │       ├── Text "👥 min-max joueurs"
        │   │               │       └── Text "⏱️ min-max min"
        │   │               └── View (arrowContainer)
        │   │                   └── Text (arrow) "›"
        │   │
        │   ├── [Tags événement et jeu]
        │   │   └── View (descriptionContainer)
        │   │       ├── Text (descriptionTitle) "Tags événement et jeu"
        │   │       └── View (badgesContainer)
        │   │           ├── eventTags.map()
        │   │           │   └── View (badge + eventTagBadge)
        │   │           │       └── Text (badgeText)
        │   │           └── gameTags.map()
        │   │               └── View (badge + gameTagBadge)
        │   │                   └── Text (badgeText)
        │   │
        │   ├── [Participants]
        │   │   └── View (participantsContainer)
        │   │       ├── Text (participantsTitle) "Participants (n)"
        │   │       └── participants.map()
        │   │           └── TouchableOpacity (participantCard)
        │   │               ├── View (participantAvatar)
        │   │               │   ├── Image (avatar) [si avatar_url]
        │   │               │   └── View (fallback) [sinon]
        │   │               │       └── Text (initiales)
        │   │               └── View (participantInfo)
        │   │                   ├── Text (participantName) "@username"
        │   │                   └── Text (participantCity) [si city]
        │   │
        │   └── [Actions principales]
        │       └── View (actionsContainer)
        │           │
        │           ├── [Si NON créateur]
        │           │   └── View (creatorBadge)
        │           │       ├── TouchableOpacity (GroupContactButton)
        │           │       │   └── Text "Contacter l'hôte"
        │           │       └── TouchableOpacity (participateButton)
        │           │           └── Text "Participer" | "Quitter" | "Complet"
        │           │
        │           └── [Si créateur]
        │               └── View (creatorBadge)
        │                   ├── TouchableOpacity (GroupContactButton)
        │                   │   └── Text "Contacter les participants"
        │                   └── TouchableOpacity (participateButton)
        │                       └── Text "Modifier"
        │
        ├── ConfirmationModal
        │   └── Affiche messages de succès/erreur/warning
        │
        ├── ConfirmModal
        │   └── Confirmation de suppression
        │       ├── Title "Supprimer l'événement"
        │       ├── Description
        │       ├── Button "Annuler"
        │       └── Button "Supprimer" (destructive)
        │
        └── SuccessModal
            └── Confirmation de suppression réussie
                ├── Title "Événement supprimé"
                ├── Description
                └── Button "OK"
```

## 📊 États et données

### États principaux

```typescript
// Données de l'événement et utilisateur
const [event, setEvent] = useState<Event | null>(null)
const [creator, setCreator] = useState<any>(null)
const [user, setUser] = useState<any>(null)
const [participants, setParticipants] = useState<any[]>([])

// Jeux et tags
const [eventGames, setEventGames] = useState<any[]>([])
const [eventTags, setEventTags] = useState<any[]>([])
const [gameTags, setGameTags] = useState<any[]>([])

// États de chargement
const [loading, setLoading] = useState(true)
const [refreshing, setRefreshing] = useState(false)
const [isLoadingAction, setIsLoadingAction] = useState(false)
const [isCreatingConversation, setIsCreatingConversation] = useState(false)
const [isDeleting, setIsDeleting] = useState(false)

// États d'interaction
const [isParticipating, setIsParticipating] = useState(false)
const [modalVisible, setModalVisible] = useState(false)
const [showConfirmDelete, setShowConfirmDelete] = useState(false)
const [showSuccess, setShowSuccess] = useState(false)

// Configuration de modale
const [modalConfig, setModalConfig] = useState<{
  variant: ModalVariant
  title: string
  message: string
}>({
  variant: 'success',
  title: '',
  message: ''
})
```

### Valeurs dérivées

```typescript
const isCreator = user?.id === event.creator_id
const isFull = (event.current_participants || 0) >= event.max_participants

const headerActions = isCreator ? [
  { icon: '✏️', onPress: () => navigateToEdit() },
  { icon: '🗑️', onPress: () => setShowConfirmDelete(true) }
] : undefined
```

## 🔄 Flux de données

### 1. Chargement initial

```
useEffect (au montage)
    ↓
loadEvent()
    ├── Récupérer l'utilisateur courant
    ├── Récupérer l'événement par ID
    ├── Récupérer le créateur
    ├── Vérifier la participation
    ├── Récupérer les participants
    ├── Récupérer les tags de l'événement
    └── Récupérer les jeux et leurs tags
    ↓
setLoading(false)
    ↓
Affichage de la page
```

### 2. Actions utilisateur

#### a) Participer / Quitter

```
handleParticipate()
    ↓
[Si créateur] → Redirection vers édition
[Sinon]
    ↓
Vérifier si événement plein
    ↓
supabase.rpc('update_event_participation')
    ↓
Afficher modale de confirmation
    ↓
Recharger les données (loadEvent)
```

#### b) Contacter

```
handleContactParticipants()
    ↓
createEventConversation(supabase, event.id, user.id)
    ↓
notifyConversationCreated(...)
    ↓
router.push(`/conversations/${conversationId}`)
```

#### c) Modifier (header)

```
Clic sur ✏️
    ↓
router.push({
  pathname: '/(tabs)/create-event',
  params: { eventId: event.id }
})
```

#### d) Supprimer (header)

```
Clic sur 🗑️
    ↓
setShowConfirmDelete(true)
    ↓
[Modale de confirmation]
    ↓
Utilisateur confirme
    ↓
handleDeleteEvent()
    ↓
supabase.rpc('soft_delete_event', { event_id })
    ↓
setShowSuccess(true)
    ↓
setTimeout(() => {
  router.push('/(tabs)/events')
}, 2000)
```

### 3. Rafraîchissement

```
Geste pull-to-refresh
    ↓
setRefreshing(true)
    ↓
loadEvent()
    ↓
setRefreshing(false)
```

## 📐 Dimensions et styles clés

### Header (TopHeader)

```typescript
header: {
  minHeight: 60,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#e5e7eb'
}

actionButton: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 8,
  backgroundColor: 'white'
}
```

### Image de l'événement

```typescript
eventImageContainer: {
  width: '100%',
  height: 200,
  overflow: 'hidden',
  backgroundColor: '#E0E0E0'
}
```

### Avatar du créateur

```typescript
organizerAvatar: {
  width: 56,
  height: 56,
  borderRadius: 16,
  marginRight: 12,
  overflow: 'hidden'
}
```

### Cartes de jeu

```typescript
gameCard: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  elevation: 3
}

gameImageContainer: {
  width: 80,
  height: 80,
  borderRadius: 12,
  backgroundColor: '#2C3E50',
  overflow: 'hidden',
  marginRight: 12
}
```

### Badges

```typescript
badge: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 6,
  backgroundColor: '#F0F2F5'
}

eventTagBadge: {
  backgroundColor: '#fce7f3',  // Rose pâle
  borderColor: '#f9a8d4',
  borderWidth: 1
}

gameTagBadge: {
  backgroundColor: '#fef3c7',  // Jaune pâle
  borderColor: '#fbbf24',
  borderWidth: 1
}
```

### Boutons d'action

```typescript
participateButton: {
  backgroundColor: '#3b82f6',  // Bleu
  borderRadius: 8,
  padding: 16,
  alignItems: 'center'
}

participateButtonActive: {
  backgroundColor: '#ef4444'  // Rouge (pour "Quitter")
}

participateButtonDisabled: {
  backgroundColor: '#9ca3af'  // Gris (pour "Complet")
}

GroupContactButton: {
  backgroundColor: '#F0F2F5',  // Gris clair
  borderRadius: 8,
  padding: 16,
  alignItems: 'center'
}
```

## 🎨 Palette de couleurs

```typescript
// Couleurs principales
const colors = {
  primary: '#3b82f6',        // Bleu - Actions principales
  danger: '#ef4444',         // Rouge - Actions destructives
  success: '#10b981',        // Vert - Confirmations
  warning: '#f59e0b',        // Orange - Avertissements
  
  // Couleurs de texte
  textPrimary: '#1f2937',    // Gris foncé - Titres
  textSecondary: '#6b7280',  // Gris moyen - Corps de texte
  textTertiary: '#9ca3af',   // Gris clair - Texte secondaire
  
  // Couleurs de fond
  bgWhite: '#ffffff',        // Fond blanc - Cartes
  bgGray: '#f8fafc',         // Gris très clair - Fond de page
  bgLightGray: '#F0F2F5',    // Gris clair - Éléments UI
  
  // Couleurs de bordure
  borderLight: '#e5e7eb',    // Bordures claires
  
  // Tags
  eventTag: '#fce7f3',       // Rose pâle
  eventTagBorder: '#f9a8d4', // Rose
  gameTag: '#fef3c7',        // Jaune pâle
  gameTagBorder: '#fbbf24'   // Jaune
}
```

## 📱 Zones interactives

### Cliquables

1. **Header**
   - Bouton retour (← Retour)
   - Icône modifier (✏️) [créateur uniquement]
   - Icône supprimer (🗑️) [créateur uniquement]

2. **Corps de page**
   - Avatar des participants → Navigation vers profil
   - Bouton "Contacter l'hôte/participants"
   - Bouton "Participer / Quitter / Modifier"

### Non-cliquables

- Image de l'événement
- Textes descriptifs
- Métadonnées (lieu, date, capacité)
- Tags
- Cartes de jeux (pour le moment)

## 🔐 Contrôles d'accès

### Affichage conditionnel basé sur `isCreator`

```typescript
// Dans le header
if (isCreator) {
  // Afficher ✏️ et 🗑️
}

// Dans le corps
if (isCreator) {
  // Afficher "Contacter les participants"
  // Afficher bouton "Modifier"
} else {
  // Afficher "Contacter l'hôte"
  // Afficher bouton "Participer" / "Quitter"
}
```

### Désactivation basée sur l'état

```typescript
// Bouton "Participer" désactivé si :
disabled={isLoadingAction || (isFull && !isParticipating && !isCreator)}

// Bouton "Contacter" désactivé si :
disabled={isCreatingConversation}

// Bouton "Supprimer" dans modale désactivé si :
loading={isDeleting}
```

## 🌐 Gestion des états vides

### Aucune description

```typescript
{event.description ? (
  <Text style={styles.description}>{event.description}</Text>
) : (
  <Text style={styles.emptyStateText}>
    Aucune description n'a été ajoutée pour cet événement.
  </Text>
)}
```

### Aucun jeu

```typescript
{eventGames.length > 0 ? (
  eventGames.map(...)
) : (
  <Text style={styles.emptyStateText}>
    Aucun jeu n'a été ajouté à cet événement.
  </Text>
)}
```

### Aucun tag

```typescript
{(eventTags.length > 0 || gameTags.length > 0) ? (
  <View style={styles.badgesContainer}>...</View>
) : (
  <Text style={styles.emptyStateText}>
    Aucun tag n'a été associé à cet événement.
  </Text>
)}
```

### Aucun participant

```typescript
{participants.length > 0 ? (
  participants.map(...)
) : (
  <Text style={styles.emptyStateText}>
    Aucun participant pour le moment. Soyez le premier à vous inscrire !
  </Text>
)}
```

## 🔧 Fonctions utilitaires

### formatDate

```typescript
const formatDate = (dateTime: string) => {
  if (!dateTime) return 'Date non définie'
  
  const d = new Date(dateTime)
  if (isNaN(d.getTime())) return 'Date invalide'
  
  const dayOfWeek = d.toLocaleString('fr-FR', { weekday: 'long' })
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleString('fr-FR', { month: 'long' })
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${dayOfWeek} ${day} ${month}, ${hours}:${minutes}`
}
// Exemple : "samedi 16 novembre, 19:30"
```

### getInitials

```typescript
const getInitials = (name: string) => {
  if (!name) return '??'
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
// Exemples : "Jean Dupont" → "JD", "Alice" → "AL"
```

### extractGameTagsFromData

```typescript
function extractGameTagsFromData(games: GameWithData[]): GameDataTag[] {
  const tags: GameDataTag[] = []
  const seenTags = new Set<string>()

  for (const game of games) {
    // Extraire le type (string)
    if (game.data.type && typeof game.data.type === 'string') {
      const typeKey = `type-${game.data.type.toLowerCase()}`
      if (!seenTags.has(typeKey)) {
        tags.push({
          id: `type-${game.id}-${game.data.type}`,
          name: game.data.type,
          source: 'type',
          gameId: game.id
        })
        seenTags.add(typeKey)
      }
    }

    // Extraire les mécaniques (array)
    if (Array.isArray(game.data.mechanisms)) {
      for (const mechanism of game.data.mechanisms) {
        const mechanismKey = `mechanism-${mechanism.toLowerCase()}`
        if (!seenTags.has(mechanismKey)) {
          tags.push({
            id: `mechanism-${game.id}-${mechanism}`,
            name: mechanism,
            source: 'mechanism',
            gameId: game.id
          })
          seenTags.add(mechanismKey)
        }
      }
    }
  }

  return tags
}
```

## 🎯 Points d'attention

### Performance

- ✅ Utilisation de `useMemo` pour les calculs coûteux (pas encore implémenté mais recommandé)
- ✅ Utilisation de `useCallback` pour les handlers (à implémenter)
- ✅ Liste virtualisée pour les participants si > 50 (à implémenter si nécessaire)

### Accessibilité

- ✅ Zones de touche suffisamment grandes (44x44 points minimum)
- ✅ Labels d'accessibilité sur les boutons
- ⚠️ Contraste de couleurs à vérifier (certains tags)
- ⚠️ Support du lecteur d'écran à tester

### Sécurité

- ✅ Vérification côté serveur avec RLS Supabase
- ✅ Fonction RPC `soft_delete_event` avec vérification du créateur
- ✅ Pas d'exposition de données sensibles

## 📚 Références

- [Interface Event](/apps/mobile/app/(tabs)/events/[id].tsx#L20-L31)
- [Interface GameDataTag](/apps/mobile/app/(tabs)/events/[id].tsx#L33-L38)
- [Styles complets](/apps/mobile/app/(tabs)/events/[id].tsx#L924-L1326)


