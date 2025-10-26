# 📱 Guide : Navigation Tabs dans Expo Router (Gémou2)

**Date de création** : 25 octobre 2025  
**Plateforme** : Mobile (Expo Router)

---

## 🎯 Vue d'ensemble

L'application Gémou2 utilise **Expo Router** avec une architecture de navigation à 2 niveaux :

1. **Layout Racine** (`app/_layout.tsx`) : Navigation Stack globale
2. **Layout Tabs** (`app/(tabs)/_layout.tsx`) : Navigation avec TabBar en bas

---

## 📂 Structure de Navigation

```
app/
├── _layout.tsx                    ← Navigation Stack (niveau 1)
│
├── (tabs)/                        ← Routes avec TabBar
│   ├── _layout.tsx                ← Configuration TabBar ⭐
│   ├── dashboard.tsx              ✅ Onglet visible (🏠 Accueil)
│   ├── events/
│   │   ├── index.tsx              ✅ Onglet visible (📅 Events)
│   │   └── [id].tsx               ❌ Masqué (avec TabBar)
│   ├── marketplace.tsx            ✅ Onglet visible (🛒 Market)
│   ├── community.tsx              ✅ Onglet visible (💬 Comm.)
│   ├── profile/
│   │   └── index.tsx              ✅ Onglet visible (👤 Profil)
│   ├── search.tsx                 ❌ Masqué (avec TabBar)
│   └── create-event.tsx           ❌ Masqué (avec TabBar)
│
├── create-event.tsx               🚫 Sans TabBar (Stack)
├── trade/[id].tsx                 🚫 Sans TabBar (Stack)
├── login.tsx                      🚫 Sans TabBar (Stack)
└── register.tsx                   🚫 Sans TabBar (Stack)
```

---

## 🛠️ Comment Modifier les Tabs

### 1️⃣ Ajouter un Nouvel Onglet VISIBLE

**Objectif** : Ajouter un onglet "Favoris" (⭐) dans la TabBar

**Étapes** :

#### A. Créer le fichier de la page

```bash
# Créer le fichier
touch app/(tabs)/favorites.tsx
```

```typescript
// app/(tabs)/favorites.tsx
'use client';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FavoritesPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Favoris</Text>
      <Text style={styles.subtitle}>Vos jeux et événements préférés</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
});
```

#### B. Ajouter dans `app/(tabs)/_layout.tsx`

```typescript
// Ajouter après l'onglet "community"
<Tabs.Screen
  name="favorites"
  options={{
    title: 'Favoris',
    tabBarIcon: ({ color, size }) => (
      <span style={{ fontSize: size }}>⭐</span>
    ),
  }}
/>
```

**Résultat** : L'onglet apparaîtra dans la TabBar entre "Comm." et "Profil"

---

### 2️⃣ Modifier un Onglet Existant

**Exemple** : Changer l'icône et le titre de "Market"

```typescript
<Tabs.Screen
  name="marketplace"
  options={{
    title: 'Boutique',  // ← Ancien : 'Market'
    tabBarIcon: ({ color, size }) => (
      <span style={{ fontSize: size }}>🎲</span>  // ← Ancien : 🛒
    ),
  }}
/>
```

---

### 3️⃣ Réorganiser l'Ordre des Onglets

**L'ordre des `<Tabs.Screen>` = ordre dans la TabBar**

**Exemple** : Mettre "Profil" en premier

```typescript
<Tabs>
  {/* Profil en premier */}
  <Tabs.Screen
    name="profile/index"
    options={{
      title: 'Profil',
      tabBarIcon: ({ color, size }) => (
        <span style={{ fontSize: size }}>👤</span>
      ),
    }}
  />
  
  <Tabs.Screen
    name="dashboard"
    options={{
      title: 'Accueil',
      tabBarIcon: ({ color, size }) => (
        <span style={{ fontSize: size }}>🏠</span>
      ),
    }}
  />
  
  {/* ... autres onglets ... */}
</Tabs>
```

---

### 4️⃣ Masquer un Onglet de la TabBar

**Cas d'usage** : La page doit avoir la TabBar visible, mais pas d'icône dans le menu

**Exemple** : Page de détails d'événement

```typescript
<Tabs.Screen
  name="events/[id]"
  options={{
    href: null,  // ← Masque l'onglet du menu
    title: 'Détails événement',
  }}
/>
```

✅ L'utilisateur voit la TabBar en bas  
❌ Pas d'icône dans la TabBar pour cette page

---

### 5️⃣ Créer une Page SANS TabBar

**Cas d'usage** : Page plein écran (login, onboarding, etc.)

**Ne PAS mettre dans `(tabs)/`** ⚠️

#### A. Créer dans `app/`

```bash
touch app/settings.tsx
```

#### B. Déclarer dans `app/_layout.tsx`

```typescript
// Dans app/_layout.tsx
<Stack.Screen 
  name="settings" 
  options={{ 
    title: 'Paramètres', 
    headerShown: false 
  }} 
/>
```

**Résultat** : La page n'a pas de TabBar en bas

---

## 🎨 Personnaliser le Style de la TabBar

### Modifier les Couleurs

Dans `app/(tabs)/_layout.tsx` :

```typescript
<Tabs
  screenOptions={{
    // Couleur de l'onglet actif
    tabBarActiveTintColor: '#10b981',  // Vert
    
    // Couleur des onglets inactifs
    tabBarInactiveTintColor: '#9ca3af',  // Gris
    
    tabBarStyle: {
      backgroundColor: '#1f2937',  // Fond noir
      borderTopWidth: 1,
      borderTopColor: '#374151',
    },
  }}
>
```

### Modifier la Hauteur

```typescript
tabBarStyle: {
  height: Platform.select({ 
    ios: 90,      // iPhone avec notch
    android: 70,  // Android
    web: 70       // Web
  }),
  paddingBottom: Platform.select({ 
    ios: 30,      // Espace pour le notch
    default: 15 
  }),
}
```

### Changer la Police

```typescript
tabBarLabelStyle: {
  fontSize: 12,
  fontWeight: '600',
  fontFamily: 'System',  // Ou une police custom
}
```

---

## 🔄 Navigation Programmatique

### Depuis un Composant

```typescript
import { router } from 'expo-router';

// Naviguer vers un onglet
router.push('/(tabs)/dashboard');

// Naviguer vers une page masquée (avec TabBar)
router.push('/(tabs)/events/123');

// Naviguer vers une page sans TabBar
router.push('/settings');

// Retour arrière
router.back();
```

---

## 📋 Checklist : Ajouter un Nouvel Onglet

- [ ] 1. Créer le fichier dans `app/(tabs)/nom-page.tsx`
- [ ] 2. Ajouter `<Tabs.Screen>` dans `app/(tabs)/_layout.tsx`
- [ ] 3. Définir `name` (correspond au nom du fichier)
- [ ] 4. Définir `title` (texte sous l'icône)
- [ ] 5. Définir `tabBarIcon` (icône emoji ou composant)
- [ ] 6. (Optionnel) Ajouter `href: null` pour masquer du menu
- [ ] 7. Tester sur iOS, Android et Web

---

## ❌ Erreurs Courantes

### Erreur 1 : TabBar ne s'affiche pas

**Cause** : Le fichier est dans `app/` au lieu de `app/(tabs)/`

**Solution** : Déplacer le fichier dans `app/(tabs)/`

---

### Erreur 2 : "Cannot find route"

**Cause** : Le `name` dans `<Tabs.Screen>` ne correspond pas au nom du fichier

```typescript
// ❌ Mauvais
<Tabs.Screen name="my-page" />  // Fichier : mypage.tsx

// ✅ Correct
<Tabs.Screen name="mypage" />   // Fichier : mypage.tsx
```

---

### Erreur 3 : L'ordre des onglets ne change pas

**Cause** : Cache Metro

**Solution** :
```bash
npx expo start -c  # Redémarrer avec cache clear
```

---

## 🔑 Points Clés à Retenir

1. **2 fichiers `_layout.tsx`** :
   - `app/_layout.tsx` → Navigation Stack globale
   - `app/(tabs)/_layout.tsx` → TabBar

2. **Fichiers dans `(tabs)/`** = avec TabBar visible

3. **`href: null`** = masquer l'onglet du menu (mais TabBar visible)

4. **Fichiers dans `app/`** (hors `(tabs)/`) = SANS TabBar

5. **L'ordre des `<Tabs.Screen>`** = ordre dans la TabBar

---

## 📚 Ressources

- [Documentation Expo Router](https://docs.expo.dev/router/introduction/)
- [Tabs Layouts](https://docs.expo.dev/router/advanced/tabs/)
- [Navigation](https://docs.expo.dev/router/navigating-pages/)

---

## 📝 Exemples Complets

### Exemple : Onglet avec Badge de Notification

```typescript
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function NotificationIcon({ color, size }: { color: string; size: number }) {
  const unreadCount = 3; // TODO: récupérer depuis le store
  
  return (
    <View>
      <span style={{ fontSize: size, color }}>🔔</span>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifs',
          tabBarIcon: (props) => <NotificationIcon {...props} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
```

---

### Exemple : TabBar Conditionnelle (cacher sur certaines pages)

```typescript
import { usePathname } from 'expo-router';

export default function TabLayout() {
  const pathname = usePathname();
  
  // Masquer la TabBar sur la page de paiement
  const hideTabBar = pathname.includes('/payment');
  
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: hideTabBar ? { display: 'none' } : {
          backgroundColor: 'white',
          height: 65,
        },
      }}
    >
      {/* ... onglets ... */}
    </Tabs>
  );
}
```

---

**Maintenu par** : Équipe Gémou2  
**Dernière mise à jour** : 25 octobre 2025


