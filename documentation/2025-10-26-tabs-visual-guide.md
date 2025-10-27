# Guide Visuel des Tabs Mobile

**Date:** 26 Octobre 2025  
**Objectif:** Comprendre visuellement la structure des tabs

## 🎨 Vue d'Ensemble de l'Architecture

```
┌─────────────────────────────────────────────┐
│  Application Mobile                         │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  app/                                  │ │
│  │                                        │ │
│  │  ├── _layout.tsx (Root Layout)        │ │
│  │  │                                     │ │
│  │  ├── (tabs)/ ✅ AVEC TABS             │ │
│  │  │   ├── _layout.tsx                  │ │
│  │  │   ├── dashboard.tsx                │ │
│  │  │   ├── events/                      │ │
│  │  │   ├── marketplace.tsx              │ │
│  │  │   ├── community.tsx                │ │
│  │  │   ├── profile/                     │ │
│  │  │   ├── create-event.tsx             │ │
│  │  │   └── create-trade.tsx             │ │
│  │  │                                     │ │
│  │  └── ❌ SANS TABS                     │ │
│  │      ├── login.tsx                    │ │
│  │      ├── register.tsx                 │ │
│  │      └── onboarding.tsx               │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 📱 Anatomie d'une Page avec Tabs

```
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════════╗  │
│  ║  📱 Header / Status Bar           ║  │
│  ╚═══════════════════════════════════╝  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │   Page Content                    │  │
│  │   (ScrollView, Components, etc.)  │  │
│  │                                   │  │
│  │                                   │  │
│  │                                   │  │
│  │                                   │  │
│  │                                   │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ╔═══════════════════════════════════╗  │
│  ║  🏠 📅 🛒 💬 👤                    ║  │ ⬅️ TAB BAR
│  ║  Tab Navigation Bar               ║  │    (automatique)
│  ╚═══════════════════════════════════╝  │
└─────────────────────────────────────────┘
```

## 🔄 Flux de Navigation avec Tabs

### Scénario 1: Navigation entre pages principales

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Dashboard   │  Click  │   Events     │  Click  │  Community   │
│  🏠 Accueil  │───────> │  📅 Events   │───────> │  💬 Comm.    │
│              │         │              │         │              │
│ [🏠][📅][🛒] │         │ [🏠][📅][🛒] │         │ [🏠][📅][🛒] │
└──────────────┘         └──────────────┘         └──────────────┘
     ↑ Tabs visibles         ↑ Tabs visibles         ↑ Tabs visibles
```

### Scénario 2: Navigation vers page secondaire

```
┌──────────────┐  Create  ┌──────────────┐  Submit  ┌──────────────┐
│  Dashboard   │  Event   │ Create Event │  Event   │ Event Detail │
│  🏠 Accueil  │────────> │  ✏️ Form     │────────> │  📄 Details  │
│              │          │              │          │              │
│ [🏠][📅][🛒] │          │ [🏠][📅][🛒] │          │ [🏠][📅][🛒] │
└──────────────┘          └──────────────┘          └──────────────┘
     ↑ Tabs                   ↑ Tabs                    ↑ Tabs
     ↑ Visible                ↑ Visible                 ↑ Visible
```

### Scénario 3: Pages sans tabs (Auth)

```
┌──────────────┐  Login   ┌──────────────┐  Success ┌──────────────┐
│   Login      │  Submit  │  Redirect    │────────> │  Dashboard   │
│  🔐 Connexion│────────> │              │          │  🏠 Accueil  │
│              │          │              │          │              │
│   (no tabs)  │          │   (no tabs)  │          │ [🏠][📅][🛒] │
└──────────────┘          └──────────────┘          └──────────────┘
  ❌ Pas de tabs           ❌ Pas de tabs            ✅ Tabs actifs
```

## 🗂️ Organisation des Fichiers

### Vue Hiérarchique Détaillée

```
apps/mobile/app/
│
├── (tabs)/                           ✅ GROUPE AVEC TABS
│   │
│   ├── _layout.tsx                   🎛️ Configuration tabs
│   │    └── Définit:
│   │        - Style des tabs
│   │        - Icônes
│   │        - Pages incluses
│   │
│   ├── dashboard.tsx                 🏠 Tab 1 (visible)
│   │    └── Route: /dashboard
│   │
│   ├── events/
│   │   ├── index.tsx                 📅 Tab 2 (visible)
│   │   │    └── Route: /events
│   │   │
│   │   └── [id].tsx                  📄 Détail (masqué menu)
│   │        └── Route: /events/123
│   │
│   ├── marketplace.tsx               🛒 Tab 3 (visible)
│   │    └── Route: /marketplace
│   │
│   ├── community.tsx                 💬 Tab 4 (visible)
│   │    └── Route: /community
│   │
│   ├── profile/
│   │   └── index.tsx                 👤 Tab 5 (visible)
│   │        └── Route: /profile
│   │
│   ├── search.tsx                    🔍 Secondaire (masqué menu)
│   │    └── Route: /search
│   │
│   ├── create-event.tsx              ✏️ Secondaire (masqué menu)
│   │    └── Route: /create-event
│   │
│   └── create-trade.tsx              ➕ Secondaire (masqué menu)
│        └── Route: /create-trade
│
├── login.tsx                         ❌ SANS TABS
├── register.tsx                      ❌ SANS TABS
├── onboarding.tsx                    ❌ SANS TABS
└── profile/
    └── [username].tsx                ❌ SANS TABS
```

## 🎯 Configuration dans _layout.tsx

### Vue Annotée

```typescript
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // 🎨 Style général
        tabBarActiveTintColor: 'red',      // Couleur icône active
        tabBarInactiveTintColor: '#61758A', // Couleur icône inactive
        tabBarStyle: {
          backgroundColor: 'white',
          height: 85,
        },
        headerShown: false,                 // Pas de header
      }}
    >
      {/* ═══════════════════════════════════════ */}
      {/* 📍 SECTION 1: Tabs Visibles dans Menu   */}
      {/* ═══════════════════════════════════════ */}
      
      <Tabs.Screen
        name="dashboard"                    // 📂 Nom du fichier
        options={{
          title: 'Accueil',                 // 📝 Texte affiché
          tabBarIcon: ({ color, size }) => (// 🎨 Icône
            <span style={{ fontSize: size }}>🏠</span>
          ),
        }}
      />
      
      <Tabs.Screen name="events/index" ... />
      <Tabs.Screen name="marketplace" ... />
      <Tabs.Screen name="community" ... />
      <Tabs.Screen name="profile/index" ... />

      {/* ═══════════════════════════════════════ */}
      {/* 👁️ SECTION 2: Pages avec Tabs, Masquées */}
      {/* ═══════════════════════════════════════ */}
      
      <Tabs.Screen
        name="events/[id]"                  // 📂 Route dynamique
        options={{
          href: null,                       // ⚠️ Masque du menu
          title: 'Détails événement',      // 📝 Titre page
        }}
      />
      
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="create-event" options={{ href: null }} />
      <Tabs.Screen name="create-trade" options={{ href: null }} />
      
    </Tabs>
  )
}
```

## 🔀 Matrice de Navigation

| Page Origine | Action | Page Destination | Tabs Visibles ? |
|--------------|--------|------------------|-----------------|
| Login ❌ | Submit | Dashboard ✅ | ✅ Oui |
| Dashboard ✅ | Click Events | Events List ✅ | ✅ Oui |
| Events List ✅ | Click Event | Event Detail ✅ | ✅ Oui |
| Event Detail ✅ | Back | Events List ✅ | ✅ Oui |
| Dashboard ✅ | Click Create | Create Event ✅ | ✅ Oui |
| Profile ✅ | View Other | User Profile ❌ | ❌ Non |

## 📊 Diagramme de Décision

```
                    Nouvelle Page à Créer
                            │
                            ▼
                   ┌────────────────────┐
                   │  La page nécessite │
                   │  une navigation ?  │
                   └────────┬───────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
         ┌─────────┐              ┌─────────────┐
         │   OUI   │              │     NON     │
         └────┬────┘              └──────┬──────┘
              │                          │
              ▼                          ▼
    ┌────────────────────┐      ┌───────────────┐
    │  Page dans (tabs)/ │      │ Page hors de  │
    │  ✅ Avec tabs      │      │   (tabs)/     │
    └────────┬───────────┘      │ ❌ Sans tabs  │
             │                  └───────────────┘
             │                  Exemples:
             │                  - login.tsx
             │                  - register.tsx
             ▼                  - onboarding.tsx
    ┌──────────────────┐
    │ Visible dans le  │
    │    menu tabs ?   │
    └────────┬─────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌─────────────┐
│   OUI   │      │     NON     │
└────┬────┘      └──────┬──────┘
     │                  │
     ▼                  ▼
With tabBarIcon    With href: null
- dashboard        - create-event
- events/index     - events/[id]
- marketplace      - search
- community        - create-trade
- profile/index
```

## 🎨 Vue UI des Composants

### Page Dashboard avec Tabs

```
╔═══════════════════════════════════════════╗
║  📱 Status Bar (iOS/Android)              ║
╠═══════════════════════════════════════════╣
║                                           ║
║  🏠 Tableau de Bord                       ║
║  ────────────────────────────────────     ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │  📅 Mes Événements                  │ ║
║  │  ─────────────────────────────────  │ ║
║  │                                     │ ║
║  │  [Event Card]                       │ ║
║  │  [Event Card]                       │ ║
║  │                                     │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │  🛒 Marketplace                     │ ║
║  │  ─────────────────────────────────  │ ║
║  │                                     │ ║
║  │  [Trade Card]                       │ ║
║  │                                     │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
╠═══════════════════════════════════════════╣
║  [🏠]  [📅]  [🛒]  [💬]  [👤]           ║ ⬅️ Tab Bar
║  Home Events Market Comm  Profile        ║    (Active: Home)
╚═══════════════════════════════════════════╝
```

### Page Create Event avec Tabs (masquée du menu)

```
╔═══════════════════════════════════════════╗
║  📱 Status Bar                            ║
╠═══════════════════════════════════════════╣
║  ← Retour                                 ║
║  ✏️ Créer un événement                    ║
║  ────────────────────────────────────     ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │  Titre *                            │ ║
║  │  [___________________________]      │ ║
║  │                                     │ ║
║  │  Description *                      │ ║
║  │  [___________________________]      │ ║
║  │  [___________________________]      │ ║
║  │                                     │ ║
║  │  Date et heure *                    │ ║
║  │  [___________________________]      │ ║
║  │                                     │ ║
║  │  [Annuler]  [Créer l'événement]    │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
╠═══════════════════════════════════════════╣
║  [🏠]  [📅]  [🛒]  [💬]  [👤]           ║ ⬅️ Tab Bar
║  Home Events Market Comm  Profile        ║    (Toujours visible)
╚═══════════════════════════════════════════╝
    ↑                                      ↑
    Cette page n'est pas dans le menu      Mais les tabs
    des tabs, mais elle garde les tabs     restent visibles
```

## 🔧 Imports: Avant vs Après Migration

### Exemple Visuel

```typescript
// ════════════════════════════════════════════════
// 📁 AVANT: Fichier dans app/community.tsx
// ════════════════════════════════════════════════

app/
├── community.tsx          ⬅️ Vous êtes ici
├── lib/
│   └── supabase.ts       ⬅️ Import avec '../lib'
└── components/
    └── UserCard.tsx      ⬅️ Import avec '../components/UserCard'

import { supabase } from '../lib'
import { UserCard } from '../components/UserCard'


// ════════════════════════════════════════════════
// 📁 APRÈS: Fichier dans app/(tabs)/community.tsx
// ════════════════════════════════════════════════

app/
├── (tabs)/
│   └── community.tsx      ⬅️ Vous êtes ici (plus profond!)
├── lib/
│   └── supabase.ts       ⬅️ Import avec '../../lib' (un niveau de plus)
└── components/
    └── UserCard.tsx      ⬅️ Import avec '../../components/UserCard'

import { supabase } from '../../lib'
import { UserCard } from '../../components/UserCard'
```

## 📋 Checklist Visuelle de Migration

```
┌─────────────────────────────────────────────────┐
│  ✅ CHECKLIST DE MIGRATION                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  [ ] 1. Déplacer le fichier                    │
│      app/ma-page.tsx                            │
│        └─> app/(tabs)/ma-page.tsx              │
│                                                 │
│  [ ] 2. Corriger les imports                   │
│      '../lib' └─> '../../lib'                  │
│                                                 │
│  [ ] 3. Ajouter dans _layout.tsx               │
│      <Tabs.Screen name="ma-page" ... />        │
│                                                 │
│  [ ] 4. Choisir la visibilité                  │
│      ○ Visible: avec tabBarIcon                │
│      ○ Masqué: avec href: null                 │
│                                                 │
│  [ ] 5. Supprimer l'ancien fichier             │
│      rm app/ma-page.tsx                         │
│                                                 │
│  [ ] 6. Redémarrer le serveur                  │
│      npm run dev                                │
│                                                 │
│  [ ] 7. Tester                                 │
│      ✓ Navigation fonctionne                   │
│      ✓ Tabs visibles                           │
│      ✓ Pas d'erreurs console                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🎓 Cas d'Usage Courants

### Cas 1: Page principale du menu

```
Besoin: Une nouvelle section "Paramètres"
Visible dans le menu: ✅ OUI

📁 apps/mobile/app/(tabs)/settings.tsx

🎛️ Configuration:
<Tabs.Screen
  name="settings"
  options={{
    title: 'Paramètres',
    tabBarIcon: ({ color, size }) => <span>⚙️</span>
  }}
/>

Résultat:
┌────────────────────────────┐
│ [🏠] [📅] [🛒] [💬] [⚙️]  │ ⬅️ Nouveau tab visible
└────────────────────────────┘
```

### Cas 2: Page de formulaire (masquée)

```
Besoin: Formulaire d'édition de profil
Visible dans le menu: ❌ NON (mais avec tabs)

📁 apps/mobile/app/(tabs)/profile/edit.tsx

🎛️ Configuration:
<Tabs.Screen
  name="profile/edit"
  options={{
    href: null,
    title: 'Éditer le profil'
  }}
/>

Résultat:
┌────────────────────────────┐
│ [🏠] [📅] [🛒] [💬] [👤]  │ ⬅️ Tabs visibles
└────────────────────────────┘
Mais "edit" n'est pas dans le menu principal
```

### Cas 3: Page publique (sans tabs)

```
Besoin: Page de réinitialisation de mot de passe
Tabs nécessaires: ❌ NON

📁 apps/mobile/app/reset-password.tsx
   (Reste en dehors de (tabs))

Configuration: Aucune dans _layout.tsx

Résultat:
Page sans barre de navigation
Utilisateur non authentifié
```

## 📚 Légende des Symboles

| Symbole | Signification |
|---------|---------------|
| ✅ | Avec tabs |
| ❌ | Sans tabs |
| 🏠 | Page d'accueil/Dashboard |
| 📅 | Événements |
| 🛒 | Marketplace |
| 💬 | Communauté |
| 👤 | Profil |
| 🔍 | Recherche |
| ✏️ | Création/Édition |
| 🎛️ | Configuration |
| 📂 | Fichier/Dossier |
| 🔐 | Authentification |

---

**Dernière mise à jour:** 26 Octobre 2025  
**Version:** 1.0.0  
**Type:** Guide Visuel

