# Guide de Migration vers TopHeader

**Date:** 26 Octobre 2025  
**Objectif:** Migrer les pages existantes vers le système de header centralisé

## 🎯 Checklist de Migration

Pour chaque page à migrer :

- [ ] 1. Vérifier/ajouter la config dans `headers.config.ts`
- [ ] 2. Importer `TopHeader` dans la page
- [ ] 3. Remplacer l'ancien header par `<TopHeader />`
- [ ] 4. Ajuster la structure (View container)
- [ ] 5. Ajouter les `actionHandlers` si nécessaire
- [ ] 6. Supprimer les anciens styles de header
- [ ] 7. Tester la page

---

## 🔄 Migration en 5 Étapes

### Étape 1 : Vérifier la Configuration

Ouvrir `config/headers.config.ts` et vérifier que la route existe :

```typescript
export const HEADER_CONFIGS = {
  '/ma-page': {
    title: 'Mon Titre',
    showBackButton: true,
    // ...
  }
}
```

Si elle n'existe pas, l'ajouter.

### Étape 2 : Importer TopHeader

```typescript
import { TopHeader } from '../../components/TopHeader'
```

### Étape 3 : Remplacer l'Ancien Header

**Avant :**
```typescript
return (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Mon Titre</Text>
      <TouchableOpacity onPress={handleAction}>
        <Text>Action</Text>
      </TouchableOpacity>
    </View>
    
    {/* Contenu */}
  </ScrollView>
)
```

**Après :**
```typescript
return (
  <View style={styles.container}>
    <TopHeader 
      actionHandlers={{
        'action': handleAction
      }}
    />
    
    <ScrollView style={styles.scrollContainer}>
      {/* Contenu */}
    </ScrollView>
  </View>
)
```

### Étape 4 : Ajuster les Styles

**Modifier :**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContainer: {  // ← Nouveau
    flex: 1,
  },
  // Supprimer header, headerTitle, headerSubtitle, etc.
})
```

### Étape 5 : Tester

Lancer l'app et vérifier :
- ✅ Le header s'affiche correctement
- ✅ Les actions fonctionnent
- ✅ Le bouton retour fonctionne (si présent)
- ✅ Pas d'erreurs console

---

## 📋 Exemples de Migration

### Exemple 1 : Community Page

**Avant :**
```typescript
export default function CommunityPage() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Communauté</Text>
        <Text style={styles.headerSubtitle}>
          Découvrez les joueurs près de chez vous
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput ... />
      </View>

      {/* Users List */}
      <ScrollView>
        ...
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: Platform.select({ ios: 60, android: 20 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  // ... autres styles
})
```

**Après :**
```typescript
import { TopHeader } from '../../components/TopHeader'

export default function CommunityPage() {
  const handleSearch = () => router.push('/search')
  
  return (
    <View style={styles.container}>
      <TopHeader 
        dynamicSubtitle="Découvrez les joueurs près de chez vous"
        actionHandlers={{
          'search': handleSearch
        }}
      />

      <ScrollView style={styles.scrollContainer}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput ... />
        </View>

        {/* Users List */}
        ...
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scrollContainer: { flex: 1 },
  // header, headerTitle, headerSubtitle supprimés ✅
  // ... autres styles conservés
})
```

### Exemple 2 : Create Event Page

**Avant :**
```typescript
export default function CreateEventPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un événement</Text>
      </View>

      <View style={styles.card}>
        {/* Form */}
      </View>
    </ScrollView>
  )
}
```

**Après :**
```typescript
import { TopHeader } from '../../components/TopHeader'

export default function CreateEventPage() {
  return (
    <View style={styles.container}>
      <TopHeader />  {/* Configuration automatique ! */}

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Form */}
        </View>
      </ScrollView>
    </View>
  )
}
```

### Exemple 3 : Event Detail Page (avec titre dynamique)

**Avant :**
```typescript
export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null)
  
  return (
    <ScrollView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{event?.title || 'Chargement...'}</Text>
        <TouchableOpacity onPress={handleMenu}>
          <Text>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
    </ScrollView>
  )
}
```

**Après :**
```typescript
import { TopHeader } from '../../components/TopHeader'

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null)
  
  const handleEventMenu = () => {
    // Menu actions
  }
  
  return (
    <View style={styles.container}>
      <TopHeader 
        dynamicTitle={event?.title || 'Chargement...'}
        actionHandlers={{
          'event-menu': handleEventMenu
        }}
      />

      <ScrollView style={styles.scrollContainer}>
        {/* Content */}
      </ScrollView>
    </View>
  )
}
```

---

## 🔧 Cas Particuliers

### Cas 1 : Sous-titre Dynamique (Dashboard)

```typescript
<TopHeader 
  dynamicSubtitle={`Bienvenue, ${user.email}`}
  actionHandlers={{ 'logout': handleLogout }}
/>
```

### Cas 2 : Override Complet

Si vous avez besoin de comportement unique pour une page spécifique :

```typescript
<TopHeader 
  overrideTitle="Titre Spécial"
  overrideShowBackButton={false}
  overrideRightActions={[
    {
      label: 'Custom',
      onPress: handleCustomAction
    }
  ]}
/>
```

### Cas 3 : Page Sans Header

Si une page ne doit pas avoir de header (ex: loading, splash) :

```typescript
// Ne pas importer ni utiliser TopHeader
return (
  <View style={styles.container}>
    {/* Contenu sans header */}
  </View>
)
```

### Cas 4 : Titre Conditionnel

```typescript
const [mode, setMode] = useState<'edit' | 'view'>('view')

<TopHeader 
  dynamicTitle={mode === 'edit' ? 'Édition' : 'Visualisation'}
/>
```

---

## 🎨 Ajustements de Style

### Avant

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: Platform.select({ ios: 60, android: 20, web: 20 }),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  // ... autres styles de contenu
})
```

### Après

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContainer: {
    flex: 1,
  },
  // Tous les styles header* supprimés ✅
  // ... autres styles de contenu conservés
})
```

---

## ⚡ Script de Migration Rapide

Pour migrer rapidement plusieurs pages, suivez ce pattern :

```bash
#!/bin/bash
# migrate-page.sh <page-name>

PAGE=$1
FILE="apps/mobile/app/(tabs)/${PAGE}.tsx"

echo "Migration de ${PAGE}..."

# 1. Ajouter l'import (à faire manuellement car position varie)
echo "✅ Ajoutez : import { TopHeader } from '../../components/TopHeader'"

# 2. Remplacer la structure (à adapter selon la page)
echo "✅ Remplacez la structure ScrollView/Header par View/TopHeader/ScrollView"

# 3. Supprimer les styles
echo "✅ Supprimez les styles : header, headerTitle, headerSubtitle, backButton, etc."

echo "Migration terminée ! Testez la page."
```

---

## 📊 État de Migration

### ✅ Pages Migrées

- [x] `/dashboard` (Dashboard)

### 🔄 Pages à Migrer

- [ ] `/events` (Events List)
- [ ] `/events/[id]` (Event Detail)
- [ ] `/marketplace` (Marketplace)
- [ ] `/community` (Community)
- [ ] `/profile` (Profile)
- [ ] `/profile/[username]` (User Profile)
- [ ] `/create-event` (Create Event)
- [ ] `/create-trade` (Create Trade)
- [ ] `/search` (Search)
- [ ] `/games/[id]` (Game Detail)
- [ ] `/trade/[id]` (Trade Detail)

---

## 🧪 Tests Après Migration

Pour chaque page migrée, tester :

### Tests Visuels
- [ ] Le header s'affiche correctement
- [ ] Le titre est correct
- [ ] Le sous-titre s'affiche si présent
- [ ] Le bouton retour s'affiche si nécessaire
- [ ] Les actions à droite sont visibles
- [ ] Pas de décalage ou chevauchement

### Tests Fonctionnels
- [ ] Le bouton retour fonctionne
- [ ] Les actions (boutons) fonctionnent
- [ ] La navigation est fluide
- [ ] Pas d'erreurs console
- [ ] Le Safe Area fonctionne sur iOS

### Tests Responsive
- [ ] Fonctionne sur iPhone (différentes tailles)
- [ ] Fonctionne sur Android
- [ ] Fonctionne sur Web (si applicable)

---

## 🚨 Erreurs Courantes

### Erreur 1 : Header ne s'affiche pas

**Cause :** Route non configurée dans `headers.config.ts`

**Solution :**
```typescript
// Ajouter dans headers.config.ts
'/ma-route': {
  title: 'Mon Titre',
  showBackButton: true,
}
```

### Erreur 2 : "No handler found for action"

**Cause :** Action définie dans config mais pas de handler

**Solution :**
```typescript
<TopHeader 
  actionHandlers={{
    'mon-action': handleMonAction  // ← Ajouter le handler
  }}
/>
```

### Erreur 3 : Contenu caché sous le header

**Cause :** Structure View/ScrollView incorrecte

**Solution :**
```typescript
// ✅ Correct
<View style={{ flex: 1 }}>
  <TopHeader />
  <ScrollView style={{ flex: 1 }}>
    {/* Contenu */}
  </ScrollView>
</View>

// ❌ Incorrect
<ScrollView>
  <TopHeader />  {/* Header scrolle avec le contenu */}
  {/* Contenu */}
</ScrollView>
```

### Erreur 4 : Titre dynamique ne s'affiche pas

**Cause :** Oubli de passer `dynamicTitle` ou `dynamicSubtitle`

**Solution :**
```typescript
// Config
title: 'dynamic'

// Usage
<TopHeader dynamicTitle={myDynamicValue} />
```

---

## 📚 Ressources

- Configuration : `config/headers.config.ts`
- Composant : `components/TopHeader.tsx`
- Documentation complète : `2025-10-26-systeme-header-centralise.md`
- Exemple complet : `app/(tabs)/dashboard.tsx`

---

**Prochaine étape :** Migrer toutes les pages restantes vers TopHeader

**Dernière mise à jour:** 26 Octobre 2025  
**Version:** 1.0.0

