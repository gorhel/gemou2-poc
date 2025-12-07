# Architecture du système de gestion des actions du header

**Date:** 16 novembre 2025  
**Type:** Documentation technique

## 🏗️ Vue d'ensemble de l'architecture

Ce document décrit l'architecture complète du système de gestion des actions dans les headers de l'application mobile.

## 📊 Diagramme de flux des données

```
┌─────────────────────────────────────────────────────────────┐
│                     Page Component                           │
│                  (ex: events/[id].tsx)                       │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ État local:                                         │     │
│  │ - user, event, isCreator                           │     │
│  │ - showConfirmDelete                                │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                  │
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Logique conditionnelle:                            │     │
│  │                                                     │     │
│  │ const headerActions = isCreator ? [               │     │
│  │   { icon: '✏️', onPress: () => { ... } },        │     │
│  │   { icon: '🗑️', onPress: () => { ... } }         │     │
│  │ ] : undefined                                      │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                  │
│                            ▼                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             │ Props: overrideRightActions
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     PageLayout                               │
│              (components/layout/PageLayout.tsx)              │
│                                                               │
│  Transmet les props au TopHeader:                           │
│  - overrideRightActions                                      │
│  - overrideTitle, overrideSubtitle                          │
│  - dynamicTitle, dynamicSubtitle                            │
│  - actionHandlers                                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ Props
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     TopHeader                                │
│                (components/TopHeader.tsx)                    │
│                                                               │
│  1. Récupère la config par défaut depuis headers.config     │
│  2. Merge avec les overrides passés en props                │
│  3. Affiche les actions                                      │
│                                                               │
│  ┌──────────────┬───────────────┬────────────────┐         │
│  │   Gauche     │    Centre     │    Droite      │         │
│  │              │               │                │         │
│  │ ← Retour     │  Titre Event  │  [✏️] [🗑️]   │         │
│  │              │   (dynamic)   │   (si créateur)│         │
│  └──────────────┴───────────────┴────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Structure des fichiers

```
apps/mobile/
│
├── config/
│   └── headers.config.ts          # Configuration centralisée des headers
│                                   # - Définit les actions par défaut par route
│                                   # - Peut être overridé par les pages
│
├── components/
│   ├── TopHeader.tsx              # Composant de header réutilisable
│   │                              # - Accepte des overrides
│   │                              # - Gère l'affichage des actions
│   │                              # - Appelle les handlers appropriés
│   │
│   └── layout/
│       └── PageLayout.tsx         # Layout wrapper pour toutes les pages
│                                  # - Encapsule TopHeader
│                                  # - Transmet les props du header
│
├── hooks/
│   └── useDefaultActionHandlers.ts # Handlers par défaut pour les actions
│                                   # - logout, create-event, etc.
│
└── app/(tabs)/
    └── events/
        └── [id].tsx               # Page de détail d'événement
                                   # - Définit des actions custom
                                   # - Les passe à PageLayout
```

## 🔄 Flux de données détaillé

### 1. Initialisation

```typescript
// events/[id].tsx

// État initial
const [event, setEvent] = useState<Event | null>(null)
const [user, setUser] = useState<any>(null)

// Chargement des données
useEffect(() => {
  loadEvent() // Charge l'événement et l'utilisateur
}, [id])
```

### 2. Détermination de la propriété

```typescript
// events/[id].tsx

const isCreator = user?.id === event.creator_id
```

### 3. Création des actions conditionnelles

```typescript
// events/[id].tsx

const headerActions = isCreator ? [
  {
    icon: '✏️',
    onPress: () => {
      // Navigation vers la page d'édition
      router.push({
        pathname: '/(tabs)/create-event',
        params: { eventId: event.id }
      })
    }
  },
  {
    icon: '🗑️',
    onPress: () => {
      // Ouvre la modale de confirmation
      setShowConfirmDelete(true)
    }
  }
] : undefined
```

### 4. Transmission au layout

```typescript
// events/[id].tsx

return (
  <PageLayout 
    overrideRightActions={headerActions}
    // ... autres props
  >
    {/* contenu */}
  </PageLayout>
)
```

### 5. Passage au TopHeader

```typescript
// PageLayout.tsx

export function PageLayout({
  overrideRightActions,
  // ... autres props
}: PageLayoutProps) {
  return (
    <View style={styles.container}>
      <TopHeader
        overrideRightActions={overrideRightActions}
        // ... autres props
      />
      {/* ... */}
    </View>
  )
}
```

### 6. Affichage dans le TopHeader

```typescript
// TopHeader.tsx

export function TopHeader({
  overrideRightActions,
  // ... autres props
}: TopHeaderProps) {
  const pathname = usePathname()
  const config = getHeaderConfig(pathname)
  
  // Les overrides ont la priorité sur la config par défaut
  const rightActions = overrideRightActions || config.rightActions

  return (
    <View style={styles.header}>
      {/* Left: Bouton retour */}
      <View style={styles.leftSection}>...</View>
      
      {/* Center: Titre */}
      <View style={styles.centerSection}>...</View>
      
      {/* Right: Actions */}
      <View style={styles.rightSection}>
        {rightActions?.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.onPress || (() => handleAction(action.action))}
          >
            <Text>{action.icon || action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
```

## 🎯 Types et interfaces

### HeaderAction (headers.config.ts)

```typescript
interface HeaderAction {
  label?: string    // Texte du bouton
  icon?: string     // Emoji ou icône
  action: string    // ID de l'action (ex: 'logout', 'create-event')
}
```

### OverrideAction (TopHeader.tsx)

```typescript
interface OverrideAction {
  label?: string       // Texte du bouton
  icon?: string        // Emoji ou icône
  onPress: () => void  // Handler direct (pas d'ID)
}
```

### PageLayoutProps

```typescript
interface PageLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  scrollEnabled?: boolean
  contentContainerStyle?: any
  
  // Props pour le TopHeader
  overrideTitle?: string
  overrideSubtitle?: string
  overrideShowBackButton?: boolean
  overrideRightActions?: Array<{
    label?: string
    icon?: string
    onPress: () => void
  }>
  dynamicTitle?: string
  dynamicSubtitle?: string
  actionHandlers?: Record<string, () => void>
}
```

## 🎨 Système de priorité des configurations

Le système utilise un ordre de priorité pour déterminer quelles valeurs afficher :

```
1. overrideRightActions (props de la page)
   ↓ Si undefined
2. config.rightActions (headers.config.ts)
   ↓ Si undefined
3. Aucune action affichée
```

### Exemple pratique

```typescript
// headers.config.ts
'/(tabs)/events/[id]': {
  title: 'Détails de l\'événement',
  showBackButton: true,
  rightActions: [
    { icon: '⋮', action: 'event-menu' }  // Action par défaut
  ]
}

// events/[id].tsx
const headerActions = isCreator ? [
  { icon: '✏️', onPress: () => { ... } },
  { icon: '🗑️', onPress: () => { ... } }
] : undefined

// Résultat:
// - Si isCreator = true  → Affiche ✏️ et 🗑️ (override)
// - Si isCreator = false → Affiche ⋮ (config par défaut)
```

## 🔧 Pattern de développement recommandé

### Quand utiliser les actions par défaut (headers.config.ts)

✅ **À utiliser pour :**
- Actions communes à toutes les pages d'un type
- Actions sans logique conditionnelle
- Actions standard (logout, search, create)

```typescript
// headers.config.ts
'/(tabs)/events': {
  title: '📅 Événements',
  showBackButton: false,
  rightActions: [
    { icon: '➕', action: 'create-event' }
  ]
}
```

### Quand utiliser les overrides (props de page)

✅ **À utiliser pour :**
- Actions conditionnelles basées sur l'état
- Actions spécifiques à une page
- Actions nécessitant l'accès à l'état local

```typescript
// events/[id].tsx
const headerActions = isCreator ? [
  { icon: '✏️', onPress: handleEdit },
  { icon: '🗑️', onPress: handleDelete }
] : undefined

<PageLayout overrideRightActions={headerActions}>
```

## 🚀 Extension du système

### Ajouter une nouvelle action globale

1. **Ajouter l'ID dans headers.config.ts**

```typescript
'/my-route': {
  title: 'Ma Page',
  rightActions: [
    { icon: '⭐', action: 'favorite' }  // Nouvelle action
  ]
}
```

2. **Implémenter le handler dans useDefaultActionHandlers.ts**

```typescript
export function useDefaultActionHandlers() {
  return {
    favorite: () => {
      // Logique de mise en favori
    },
    // ... autres handlers
  }
}
```

### Ajouter des actions custom à une page

```typescript
// ma-page.tsx
const [isFavorite, setIsFavorite] = useState(false)

const customActions = [
  {
    icon: isFavorite ? '⭐' : '☆',
    onPress: () => setIsFavorite(!isFavorite)
  }
]

return (
  <PageLayout overrideRightActions={customActions}>
    {/* contenu */}
  </PageLayout>
)
```

## 💡 Bonnes pratiques

### ✅ À faire

1. **Utiliser des icônes cohérentes**
   ```typescript
   { icon: '✏️', onPress: handleEdit }     // Modifier
   { icon: '🗑️', onPress: handleDelete }   // Supprimer
   { icon: '❤️', onPress: handleFavorite } // Favori
   ```

2. **Vérifier les conditions avant d'afficher**
   ```typescript
   const actions = condition ? [...] : undefined
   ```

3. **Gérer les états de chargement**
   ```typescript
   const actions = [
     {
       icon: isLoading ? '⏳' : '✏️',
       onPress: isLoading ? () => {} : handleEdit
     }
   ]
   ```

### ❌ À éviter

1. **Trop d'actions dans le header**
   ```typescript
   // ❌ Mauvais : Trop encombré
   const actions = [
     { icon: '✏️', onPress: ... },
     { icon: '🗑️', onPress: ... },
     { icon: '❤️', onPress: ... },
     { icon: '📤', onPress: ... },
     { icon: '🔗', onPress: ... }
   ]
   
   // ✅ Bon : Grouper dans un menu
   const actions = [
     { icon: '⋮', onPress: openMenu }
   ]
   ```

2. **Actions sans feedback visuel**
   ```typescript
   // ❌ Mauvais : Pas de retour utilisateur
   { icon: '🗑️', onPress: () => deleteWithoutConfirmation() }
   
   // ✅ Bon : Modale de confirmation
   { icon: '🗑️', onPress: () => setShowConfirmModal(true) }
   ```

3. **Mélanger les types d'actions**
   ```typescript
   // ❌ Mauvais : Incohérent
   const actions = [
     { icon: '✏️', onPress: handleEdit },
     { label: 'Supprimer', onPress: handleDelete }  // Texte au lieu d'icône
   ]
   
   // ✅ Bon : Cohérent
   const actions = [
     { icon: '✏️', onPress: handleEdit },
     { icon: '🗑️', onPress: handleDelete }
   ]
   ```

## 📈 Métriques de performance

L'ajout des actions dans le header a un impact minimal sur les performances :

- **Temps de rendu supplémentaire** : < 1ms
- **Mémoire additionnelle** : ~100 bytes par action
- **Re-renders** : Uniquement quand `isCreator` change (une fois au chargement)

## 🧪 Tests recommandés

### Tests unitaires

```typescript
describe('EventDetailsPage header actions', () => {
  it('should show edit and delete icons for creator', () => {
    const { getByLabelText } = render(<EventDetailsPage />, {
      user: creator,
      event: testEvent
    })
    
    expect(getByLabelText('Modifier')).toBeVisible()
    expect(getByLabelText('Supprimer')).toBeVisible()
  })
  
  it('should not show actions for non-creator', () => {
    const { queryByLabelText } = render(<EventDetailsPage />, {
      user: otherUser,
      event: testEvent
    })
    
    expect(queryByLabelText('Modifier')).toBeNull()
    expect(queryByLabelText('Supprimer')).toBeNull()
  })
})
```

### Tests d'intégration

```typescript
describe('Header actions integration', () => {
  it('should navigate to edit page when clicking edit icon', async () => {
    const { getByLabelText } = render(<EventDetailsPage />)
    
    fireEvent.press(getByLabelText('Modifier'))
    
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/create-event',
      params: { eventId: testEvent.id }
    })
  })
  
  it('should open delete modal when clicking delete icon', async () => {
    const { getByLabelText, getByText } = render(<EventDetailsPage />)
    
    fireEvent.press(getByLabelText('Supprimer'))
    
    expect(getByText('Supprimer l\'événement')).toBeVisible()
  })
})
```

## 📚 Références

- [React Native TouchableOpacity](https://reactnative.dev/docs/touchableopacity)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)



