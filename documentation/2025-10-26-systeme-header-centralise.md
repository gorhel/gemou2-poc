# Système de Header Centralisé - Application Mobile

**Date de création:** 26 Octobre 2025  
**Objectif:** Documentation du système de header unifié et configurable

## 📋 Vue d'Ensemble

L'application mobile utilise désormais un système de **header centralisé** qui permet de gérer tous les headers de toutes les pages depuis un seul fichier de configuration.

### 🎯 Avantages

✅ **Cohérence visuelle** : Tous les headers ont le même style  
✅ **Maintenance facile** : Modifier un titre sans toucher au code de la page  
✅ **Configuration centralisée** : Tous les headers définis dans `headers.config.ts`  
✅ **Flexibilité** : Override possible au niveau de la page si nécessaire  
✅ **DRY** : Aucune duplication de code  
✅ **Type-safe** : Validation TypeScript des configurations  

---

## 📂 Architecture

```
apps/mobile/
├── config/
│   └── headers.config.ts        # ← Configuration de tous les headers
├── components/
│   └── TopHeader.tsx             # ← Composant de header réutilisable
└── app/
    └── (tabs)/
        ├── dashboard.tsx         # Usage: <TopHeader />
        ├── events/
        │   ├── index.tsx         
        │   └── [id].tsx          
        ├── community.tsx
        └── ...
```

---

## 🔧 Fichier de Configuration

### Emplacement
`apps/mobile/config/headers.config.ts`

### Structure de Base

```typescript
export const HEADER_CONFIGS: Record<string, HeaderConfig> = {
  '/dashboard': {
    title: 'Tableau de bord',
    subtitle: 'dynamic',              // Valeur dynamique
    showBackButton: false,
    rightActions: [
      { label: 'Déconnexion', action: 'logout' }
    ]
  },
  
  '/create-event': {
    title: 'Créer un événement',
    showBackButton: true,
  },
  
  '/events/[id]': {
    title: 'Détails de l\'événement',
    showBackButton: true,
    rightActions: [
      { icon: '⋮', action: 'event-menu' }
    ]
  }
}
```

### Interface TypeScript

```typescript
interface HeaderAction {
  label?: string      // Texte du bouton
  icon?: string       // Emoji ou icône
  action: string      // Identifiant de l'action
}

interface HeaderConfig {
  title: string | 'dynamic'
  subtitle?: string | 'dynamic'
  showBackButton: boolean
  rightActions?: HeaderAction[]
}
```

---

## 🎨 Composant TopHeader

### Emplacement
`apps/mobile/components/TopHeader.tsx`

### Fonctionnalités

1. **Auto-détection de la route** : Utilise `usePathname()` pour récupérer la config
2. **Safe Area** : Gestion automatique du notch iOS
3. **Bouton retour intelligent** : Retour ou redirection vers dashboard
4. **Actions flexibles** : Support de multiples boutons d'action

### Structure Visuelle

```
┌─────────────────────────────────────────────┐
│  [← Retour]  Titre Page       [Action] [⋮] │
│              Sous-titre (opt)               │
└─────────────────────────────────────────────┘
   ↑            ↑                  ↑
   Left         Center            Right
   Section      Section           Section
```

---

## 💻 Utilisation dans les Pages

### Usage Simple (Auto-configuration)

```typescript
import { TopHeader } from '../../components/TopHeader'

export default function MyPage() {
  return (
    <View style={{ flex: 1 }}>
      <TopHeader />  {/* ← Configuration automatique */}
      
      <ScrollView>
        {/* Contenu de la page */}
      </ScrollView>
    </View>
  )
}
```

### Usage avec Valeurs Dynamiques

```typescript
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }
  
  return (
    <View style={{ flex: 1 }}>
      <TopHeader 
        dynamicSubtitle={`Bienvenue, ${user.email}`}
        actionHandlers={{
          'logout': handleLogout
        }}
      />
      
      <ScrollView>
        {/* Contenu */}
      </ScrollView>
    </View>
  )
}
```

### Usage avec Override

```typescript
export default function SpecialPage() {
  return (
    <View style={{ flex: 1 }}>
      <TopHeader 
        overrideTitle="Titre personnalisé"
        overrideShowBackButton={true}
        overrideRightActions={[
          {
            label: 'Action',
            onPress: () => console.log('Action custom')
          }
        ]}
      />
      
      <ScrollView>
        {/* Contenu */}
      </ScrollView>
    </View>
  )
}
```

---

## 📝 Props du Composant TopHeader

### Props d'Override

| Prop | Type | Description |
|------|------|-------------|
| `overrideTitle` | `string` | Remplace le titre de la config |
| `overrideSubtitle` | `string` | Remplace le sous-titre |
| `overrideShowBackButton` | `boolean` | Force l'affichage du bouton retour |
| `overrideRightActions` | `Array` | Remplace les actions à droite |

### Props Dynamiques

| Prop | Type | Description |
|------|------|-------------|
| `dynamicTitle` | `string` | Valeur si `title: 'dynamic'` dans config |
| `dynamicSubtitle` | `string` | Valeur si `subtitle: 'dynamic'` dans config |

### Props de Gestion

| Prop | Type | Description |
|------|------|-------------|
| `actionHandlers` | `Record<string, () => void>` | Handlers pour les actions |

---

## 🔄 Gestion des Actions

### 1. Définir l'action dans la config

```typescript
// headers.config.ts
'/dashboard': {
  title: 'Tableau de bord',
  rightActions: [
    { label: 'Déconnexion', action: 'logout' }
    //                      ↑ Identifiant
  ]
}
```

### 2. Implémenter le handler dans la page

```typescript
// dashboard.tsx
<TopHeader 
  actionHandlers={{
    'logout': handleLogout,
    'edit': handleEdit,
    'share': handleShare,
  }}
/>
```

### 3. Handlers par défaut

Le bouton retour a un handler par défaut :
- Si `router.canGoBack()` → `router.back()`
- Sinon → `router.push('/dashboard')`

---

## 📋 Configuration des Pages Existantes

### Pages Principales (Tabs visibles)

```typescript
'/dashboard': {
  title: 'Tableau de bord',
  subtitle: 'dynamic',
  showBackButton: false,
  rightActions: [{ label: 'Déconnexion', action: 'logout' }]
}

'/events': {
  title: '📅 Événements',
  showBackButton: false,
  rightActions: [{ icon: '🔍', action: 'search' }]
}

'/marketplace': {
  title: '🛒 Marketplace',
  showBackButton: false,
  rightActions: [{ icon: '➕', action: 'create-trade' }]
}

'/community': {
  title: '💬 Communauté',
  showBackButton: false,
  rightActions: [{ icon: '🔍', action: 'search' }]
}

'/profile': {
  title: '👤 Profil',
  showBackButton: false,
  rightActions: [{ icon: '⚙️', action: 'settings' }]
}
```

### Pages Secondaires (Masquées du menu)

```typescript
'/create-event': {
  title: 'Créer un événement',
  showBackButton: true,
}

'/create-trade': {
  title: 'Créer une annonce',
  showBackButton: true,
}

'/search': {
  title: '🔍 Recherche',
  showBackButton: true,
}
```

### Pages Dynamiques

```typescript
'/events/[id]': {
  title: 'Détails de l\'événement',
  showBackButton: true,
  rightActions: [{ icon: '⋮', action: 'event-menu' }]
}

'/profile/[username]': {
  title: 'dynamic',  // Sera remplacé par le nom de l'utilisateur
  showBackButton: true,
}
```

---

## 🎯 Types de Titres

### Titre Statique
```typescript
title: 'Mon Titre'
```

### Titre Dynamique
```typescript
// Dans la config
title: 'dynamic'

// Dans la page
<TopHeader dynamicTitle={userName} />
```

### Titre avec Emoji
```typescript
title: '📅 Événements'
```

---

## 🔍 Fonctionnement Interne

### 1. Détection de la Route

```typescript
// TopHeader.tsx
const pathname = usePathname()  // Ex: "/events/123"
const config = getHeaderConfig(pathname)
```

### 2. Résolution de la Configuration

```typescript
// headers.config.ts
export function getHeaderConfig(pathname: string): HeaderConfig {
  // 1. Essayer route exacte
  if (HEADER_CONFIGS[pathname]) return HEADER_CONFIGS[pathname]
  
  // 2. Essayer avec préfixe (tabs)
  const tabsPath = `/(tabs)${pathname}`
  if (HEADER_CONFIGS[tabsPath]) return HEADER_CONFIGS[tabsPath]
  
  // 3. Essayer routes dynamiques (regex)
  for (const [route, config] of Object.entries(HEADER_CONFIGS)) {
    if (route.includes('[')) {
      const pattern = route.replace(/\[.*?\]/g, '.*')
      const regex = new RegExp(`^${pattern}$`)
      if (regex.test(pathname)) return config
    }
  }
  
  // 4. Config par défaut
  return DEFAULT_HEADER_CONFIG
}
```

### 3. Rendu Final

```typescript
const title = overrideTitle 
  || (config.title === 'dynamic' ? dynamicTitle : config.title)
  || 'Gémou2'
```

---

## 📐 Styles

### Dimensionnement

```typescript
minHeight: 60          // Hauteur minimale du header
paddingHorizontal: 16  // Espacement horizontal
paddingVertical: 12    // Espacement vertical
```

### Sections

```
Left Section   : flex: 1 (bouton retour)
Center Section : flex: 2 (titre/sous-titre)
Right Section  : flex: 1 (actions)
```

### Couleurs

```typescript
Background: 'white'
Border: '#e5e7eb'
Title: '#1f2937'
Subtitle: '#6b7280'
Back Button: '#3b82f6'
Action Button: '#6b7280'
```

---

## 🚀 Ajouter une Nouvelle Page

### Étape 1 : Ajouter la config

```typescript
// headers.config.ts
'/ma-nouvelle-page': {
  title: 'Ma Page',
  showBackButton: true,
  rightActions: [
    { icon: '⋮', action: 'menu' }
  ]
}
```

### Étape 2 : Utiliser dans la page

```typescript
// ma-nouvelle-page.tsx
import { TopHeader } from '../../components/TopHeader'

export default function MaNouvellePage() {
  const handleMenu = () => {
    // Action du menu
  }
  
  return (
    <View style={{ flex: 1 }}>
      <TopHeader 
        actionHandlers={{
          'menu': handleMenu
        }}
      />
      
      <ScrollView>
        {/* Contenu */}
      </ScrollView>
    </View>
  )
}
```

### Étape 3 : C'est tout ! ✅

---

## 🔧 Maintenance

### Modifier un Titre

```typescript
// Avant : Modifier dans chaque page
// Après : Modifier uniquement dans headers.config.ts

'/events': {
  title: '📅 Mes Événements',  // ← Changement ici uniquement
  showBackButton: false,
}
```

### Ajouter une Action Globale

```typescript
// headers.config.ts
'/dashboard': {
  title: 'Tableau de bord',
  rightActions: [
    { label: 'Déconnexion', action: 'logout' },
    { icon: '🔔', action: 'notifications' }  // ← Nouvelle action
  ]
}

// dashboard.tsx
actionHandlers={{
  'logout': handleLogout,
  'notifications': handleNotifications  // ← Nouveau handler
}}
```

---

## ⚠️ Points d'Attention

### 1. Routes avec (tabs)

Le système gère automatiquement les routes avec et sans `(tabs)` :

```typescript
'/dashboard'        → Fonctionne
'/(tabs)/dashboard' → Fonctionne aussi
```

### 2. Routes Dynamiques

Utilisez `[param]` dans la config :

```typescript
'/events/[id]'   // ← Matche /events/123, /events/456, etc.
'/user/[slug]'   // ← Matche n'importe quel slug
```

### 3. Actions Sans Handler

Si une action n'a pas de handler, un warning s'affiche :

```
⚠️ No handler found for action: mon-action
```

---

## 📊 Comparaison Avant/Après

### ❌ Avant (Code dupliqué dans chaque page)

```typescript
// dashboard.tsx
<View style={styles.header}>
  <View>
    <Text style={styles.headerTitle}>Tableau de bord</Text>
    <Text style={styles.headerSubtitle}>Bienvenue, {user.email}</Text>
  </View>
  <TouchableOpacity onPress={handleLogout}>
    <Text>Déconnexion</Text>
  </TouchableOpacity>
</View>

// events.tsx
<View style={styles.header}>
  <View>
    <Text style={styles.headerTitle}>📅 Événements</Text>
  </View>
  <TouchableOpacity onPress={handleSearch}>
    <Text>🔍</Text>
  </TouchableOpacity>
</View>

// + 50 lignes de styles dans chaque fichier
```

### ✅ Après (Configuration centralisée)

```typescript
// headers.config.ts (Un seul endroit pour tout)
'/dashboard': { 
  title: 'Tableau de bord', 
  subtitle: 'dynamic',
  rightActions: [{ label: 'Déconnexion', action: 'logout' }]
}

'/events': { 
  title: '📅 Événements',
  rightActions: [{ icon: '🔍', action: 'search' }]
}

// dashboard.tsx (Code minimal)
<TopHeader 
  dynamicSubtitle={`Bienvenue, ${user.email}`}
  actionHandlers={{ 'logout': handleLogout }}
/>

// events.tsx (Code minimal)
<TopHeader 
  actionHandlers={{ 'search': handleSearch }}
/>
```

---

## 🎓 Exemples Pratiques

### Exemple 1 : Page Simple

```typescript
// Page sans action, juste un titre
<TopHeader />  // Lit automatiquement la config
```

### Exemple 2 : Page avec Retour

```typescript
// Config
'/details': {
  title: 'Détails',
  showBackButton: true,
}

// Usage
<TopHeader />  // Bouton retour automatique
```

### Exemple 3 : Page avec Actions Multiples

```typescript
// Config
'/profile': {
  title: 'Profil',
  rightActions: [
    { icon: '✏️', action: 'edit' },
    { icon: '⚙️', action: 'settings' },
    { icon: '⋮', action: 'menu' }
  ]
}

// Usage
<TopHeader 
  actionHandlers={{
    'edit': handleEdit,
    'settings': handleSettings,
    'menu': handleMenu
  }}
/>
```

### Exemple 4 : Titre Dynamique (Profil Utilisateur)

```typescript
// Config
'/profile/[username]': {
  title: 'dynamic',
  showBackButton: true,
}

// Usage
<TopHeader 
  dynamicTitle={`@${username}`}
/>
```

---

## 📚 Ressources

- Fichier de config : `config/headers.config.ts`
- Composant : `components/TopHeader.tsx`
- Exemple d'utilisation : `app/(tabs)/dashboard.tsx`

---

**Dernière mise à jour:** 26 Octobre 2025  
**Version:** 1.0.0  
**Type:** Documentation Technique

