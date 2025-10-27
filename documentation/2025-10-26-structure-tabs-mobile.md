# Structure des Tabs dans l'Application Mobile

**Date de création:** 26 Octobre 2025  
**Sujet:** Architecture de navigation avec tabs dans l'application mobile React Native

## 📋 Résumé

Ce document explique comment fonctionne la navigation avec tabs dans l'application mobile et comment ajouter de nouvelles pages qui possèdent les tabs.

## 🎯 Objectif

Toutes les pages mobiles doivent posséder la barre de navigation (tabs) en bas de l'écran pour une expérience utilisateur cohérente et intuitive.

## 📁 Structure des Fichiers

### Architecture Expo Router

L'application utilise **Expo Router** avec une structure basée sur le système de fichiers. Le dossier `(tabs)` est un **groupe de layout** qui applique automatiquement la barre de navigation à toutes les pages qu'il contient.

```
apps/mobile/app/
├── _layout.tsx                    # Layout racine de l'application
├── (tabs)/                        # ✅ GROUPE DE LAYOUT AVEC TABS
│   ├── _layout.tsx                # Configuration des tabs
│   ├── dashboard.tsx              # 🏠 Accueil (visible dans tabs)
│   ├── events/
│   │   ├── index.tsx              # 📅 Liste des événements (visible dans tabs)
│   │   └── [id].tsx               # Détail événement (tabs visibles, masqué du menu)
│   ├── marketplace.tsx            # 🛒 Market (visible dans tabs)
│   ├── community.tsx              # 💬 Communauté (visible dans tabs)
│   ├── profile/
│   │   └── index.tsx              # 👤 Profil (visible dans tabs)
│   ├── search.tsx                 # Recherche (tabs visibles, masqué du menu)
│   ├── create-event.tsx           # Créer événement (tabs visibles, masqué du menu)
│   └── create-trade.tsx           # Créer annonce (tabs visibles, masqué du menu)
├── login.tsx                      # ❌ Pas de tabs (en dehors de (tabs))
├── register.tsx                   # ❌ Pas de tabs (en dehors de (tabs))
├── onboarding.tsx                 # ❌ Pas de tabs (en dehors de (tabs))
└── profile/
    └── [username].tsx             # ❌ Pas de tabs (en dehors de (tabs))
```

## 🔧 Configuration des Tabs

### Fichier: `(tabs)/_layout.tsx`

Ce fichier configure tous les écrans qui auront les tabs :

```typescript
import { Tabs } from 'expo-router'
import { Platform } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'red',
        tabBarInactiveTintColor: '#61758A',
        tabBarStyle: {
          backgroundColor: 'white',
          height: Platform.select({ ios: 85, android: 85, web: 85 }),
          paddingBottom: Platform.select({ ios: 25, default: 10 }),
        },
        headerShown: false,
      }}
    >
      {/* Tabs visibles dans le menu */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <span style={{ fontSize: size }}>🏠</span>
          ),
        }}
      />
      
      {/* ... autres tabs ... */}

      {/* Routes avec tabs mais masquées du menu */}
      <Tabs.Screen
        name="create-event"
        options={{
          href: null, // ⚠️ Important: masque du menu mais garde les tabs
          title: 'Créer un événement',
        }}
      />
    </Tabs>
  )
}
```

### Types de pages dans `(tabs)/`

1. **Pages visibles dans le menu des tabs**
   - Configurées avec `title` et `tabBarIcon`
   - Exemple: `dashboard`, `marketplace`, `community`

2. **Pages avec tabs mais masquées du menu**
   - Utilisent `href: null` pour être cachées du menu
   - Gardent la barre de navigation visible
   - Exemple: `create-event`, `events/[id]`, `search`

## 📐 Structure des Composants des Pages

### Exemple de page avec tabs

Voici l'architecture type d'une page avec tabs :

```
Page Community (apps/mobile/app/(tabs)/community.tsx)
│
├── Header Section
│   ├── Title
│   └── Subtitle
│
├── Search Section
│   └── Search Input
│
├── Content Section (ScrollView)
│   ├── Users List
│   │   ├── User Card 1
│   │   │   ├── Avatar
│   │   │   ├── Info (name, username, city)
│   │   │   └── Arrow
│   │   ├── User Card 2
│   │   └── ...
│   │
│   └── Empty State (if no users)
│       ├── Emoji
│       ├── Title
│       └── Message
│
└── Tab Bar (automatique via layout)
    ├── 🏠 Accueil
    ├── 📅 Events
    ├── 🛒 Market
    ├── 💬 Comm.
    └── 👤 Profil
```

## 🚀 Comment Ajouter une Nouvelle Page avec Tabs

### Étape 1: Créer le fichier dans `(tabs)/`

Créez votre nouveau fichier **directement dans le dossier `(tabs)/`** :

```bash
# Exemple
touch apps/mobile/app/(tabs)/ma-nouvelle-page.tsx
```

### Étape 2: Déclarer la route dans `_layout.tsx`

Ajoutez la configuration dans `(tabs)/_layout.tsx` :

```typescript
<Tabs.Screen
  name="ma-nouvelle-page"
  options={{
    title: 'Ma Page',
    tabBarIcon: ({ color, size }) => (
      <span style={{ fontSize: size }}>🆕</span>
    ),
  }}
/>
```

**Ou si vous voulez masquer du menu mais garder les tabs :**

```typescript
<Tabs.Screen
  name="ma-nouvelle-page"
  options={{
    href: null,  // Masqué du menu
    title: 'Ma Page',
  }}
/>
```

### Étape 3: Créer le composant de la page

```typescript
'use client'

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function MaNouvellePage() {
  return (
    <View style={styles.container}>
      <Text>Ma Nouvelle Page avec Tabs !</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
})
```

## ⚠️ Points d'Attention

### 1. Imports relatifs

Les fichiers dans `(tabs)/` doivent ajuster leurs imports pour remonter d'un niveau supplémentaire :

```typescript
// ❌ Mauvais (si en dehors de (tabs))
import { supabase } from '../lib'

// ✅ Correct (dans (tabs))
import { supabase } from '../../lib'
```

### 2. Pages sans tabs

Les pages suivantes ne doivent **PAS** avoir de tabs et restent en dehors de `(tabs)/` :

- Pages d'authentification (`login.tsx`, `register.tsx`)
- Onboarding (`onboarding.tsx`)
- Pages publiques (profils d'autres utilisateurs)
- Pages de détail hors du flux principal

### 3. Routes imbriquées

Pour les routes imbriquées avec tabs :

```
(tabs)/
  events/
    index.tsx      # Liste (visible dans tabs)
    [id].tsx       # Détail (tabs visibles, masqué du menu)
```

Dans `_layout.tsx` :

```typescript
<Tabs.Screen
  name="events/index"
  options={{
    title: 'Events',
    tabBarIcon: ({ color, size }) => <span>📅</span>,
  }}
/>
<Tabs.Screen
  name="events/[id]"
  options={{
    href: null,
    title: 'Détails événement',
  }}
/>
```

## 🎨 Styles des Tabs

### Configuration actuelle

```typescript
tabBarStyle: {
  backgroundColor: 'white',
  borderTopWidth: 2,
  borderTopColor: '#e5e7eb',
  height: Platform.select({ ios: 85, android: 85, web: 85 }),
  paddingBottom: Platform.select({ ios: 25, default: 10 }),
  paddingTop: 10,
}
```

### Couleurs

- **Active:** `#ff0000` (rouge)
- **Inactive:** `#61758A` (gris-bleu)
- **Background:** `white`

## 📱 Navigation entre Pages

### Depuis une page avec tabs vers une autre page avec tabs

```typescript
import { router } from 'expo-router'

// Navigation simple
router.push('/dashboard')

// Navigation avec paramètres
router.push(`/events/${eventId}`)

// Retour arrière
router.back()
```

## 🔄 Flux de Navigation Type

```
Login (sans tabs)
  ↓
Dashboard (avec tabs)
  ↓
Create Event (avec tabs, masqué du menu)
  ↓
Event Details (avec tabs, masqué du menu)
  ↓
Back to Dashboard
```

## 📊 Récapitulatif

| Type de Page | Emplacement | Tabs Visibles | Dans le Menu |
|--------------|-------------|---------------|--------------|
| Page principale | `(tabs)/dashboard.tsx` | ✅ Oui | ✅ Oui |
| Page secondaire | `(tabs)/create-event.tsx` | ✅ Oui | ❌ Non |
| Auth/Onboarding | `app/login.tsx` | ❌ Non | ❌ Non |

## 🛠️ Dépannage

### Les tabs n'apparaissent pas

1. Vérifiez que le fichier est dans `(tabs)/`
2. Vérifiez que la route est déclarée dans `_layout.tsx`
3. Redémarrez le serveur de développement

### Une page apparaît en double

Si une page existe à la fois dans `app/` et dans `(tabs)/`, supprimez celle dans `app/`.

### Import errors

Ajustez les imports relatifs pour remonter d'un niveau supplémentaire (`../../` au lieu de `../`).

## 📚 Ressources

- [Expo Router Tabs](https://docs.expo.dev/router/advanced/tabs/)
- [Expo Router Groups](https://docs.expo.dev/router/advanced/groups/)
- [React Navigation Tab Navigator](https://reactnavigation.org/docs/tab-based-navigation/)

---

**Dernière mise à jour:** 26 Octobre 2025  
**Auteur:** AI Assistant  
**Version:** 1.0.0

