# ✅ Phase 3 & 4 - Composants universels et NativeWind

## 📚 PHASE 3 - Composants universels (TERMINÉE)

### 🎯 Objectif
Créer des composants qui fonctionnent **identiquement** sur web, iOS et Android.

### ✅ Ce qui a été créé

#### 1. Package `/packages/shared` - Code métier pur

**Structure** :
```
packages/shared/
├── hooks/
│   └── useOnboarding.ts    ← Logique onboarding cross-platform
├── utils/
│   └── validation.ts       ← Validation email/password/username
├── package.json
├── tsconfig.json
└── README.md
```

**Hooks créés** :
- `useOnboardingLogic(storage)` - Gestion onboarding avec abstraction storage
  - `checkOnboardingCompleted()` - Vérifier si vu
  - `markOnboardingCompleted()` - Marquer comme vu
  - `resetOnboarding()` - Reset

**Utils créées** :
- `validateEmail(email)` → boolean
- `validatePassword(password)` → { valid, errors }
- `validateUsername(username)` → { valid, error }

**Pourquoi c'est important ?** :
- ✅ Code testé une seule fois
- ✅ Réutilisable partout (web, mobile, tests)
- ✅ Pas de dépendance UI (portable)
- ✅ Type-safe TypeScript

#### 2. Composants UI universels

**Button** (`/apps/mobile/components/ui/Button.tsx`)

Features :
- ✅ 4 variants : primary, secondary, danger, ghost
- ✅ 3 tailles : sm, md, lg
- ✅ État loading avec ActivityIndicator
- ✅ FullWidth option
- ✅ Disabled state
- ✅ Platform-aware (cursor pointer sur web)

Exemple :
```typescript
<Button 
  variant="primary" 
  size="lg" 
  loading={isSubmitting}
  onPress={handleSubmit}
>
  Soumettre
</Button>
```

**Card** (`/apps/mobile/components/ui/Card.tsx`)

Features :
- ✅ Shadow cross-platform
- ✅ Border radius responsive
- ✅ Padding adaptatif

Exemple :
```typescript
<Card>
  <Text>Mon contenu</Text>
</Card>
```

#### 3. Pattern Platform.select()

Utilisé partout pour adapter le style :

```typescript
const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.select({
      ios: 60,      // Status bar iOS
      android: 20,  // Status bar Android
      web: 20       // Pas de status bar web
    }),
    maxWidth: Platform.select({
      web: 1200,    // Limiter largeur desktop
      default: '100%'
    })
  }
});
```

#### 4. Storage cross-platform

**Problème** : `SecureStore` ne marche pas sur web  
**Solution** : Helper functions

```typescript
// Dans onboarding.tsx
const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);  // Web
  } else {
    await SecureStore.setItemAsync(key, value);  // Mobile
  }
};

const getStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);  // Web
  } else {
    return await SecureStore.getItemAsync(key);  // Mobile
  }
};
```

---

## 🎨 PHASE 4 - NativeWind (Tailwind CSS)

### 🎯 Objectif
Utiliser **Tailwind CSS** sur React Native pour un développement ultra-rapide.

### ✅ Ce qui a été installé et configuré

#### 1. Packages installés
```bash
✅ nativewind              # Tailwind pour React Native
✅ tailwindcss             # Tailwind CSS
```

#### 2. Fichiers configurés

**`tailwind.config.js`** :
```javascript
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: { 50-900 },    // Bleu
        secondary: { 50-900 },  // Violet
      },
    },
  },
}
```

**`babel.config.js`** :
```javascript
plugins: [
  'nativewind/babel',  // ← Ajouté
]
```

**`global.css`** :
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`nativewind-env.d.ts`** :
```typescript
/// <reference types="nativewind/types" />
```

**`app/_layout.tsx`** :
```typescript
import '../global.css';  // ← Import du CSS
```

#### 3. Composants exemples avec Tailwind

**ButtonNative** - Bouton avec classes Tailwind :
```typescript
<ButtonNative variant="primary" size="lg">
  Mon bouton
</ButtonNative>

// Génère :
<TouchableOpacity className="bg-blue-600 py-4 px-6 rounded-lg">
  <Text className="text-white font-bold">Mon bouton</Text>
</TouchableOpacity>
```

**CardNative** - Card avec Tailwind :
```typescript
<CardNative>
  <CardHeader>
    <Text className="text-xl font-bold">Titre</Text>
  </CardHeader>
  <CardContent>
    <Text className="text-gray-600">Contenu</Text>
  </CardContent>
</CardNative>
```

### 🚀 Avantages de NativeWind

#### Avant (StyleSheet) :
```typescript
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});

<View style={styles.container}>...</View>
```

#### Après (NativeWind) :
```typescript
<View className="p-4 bg-white rounded-xl shadow-md">
  ...
</View>
```

**Gain** : 10 lignes → 1 ligne ! 🎉

### 📊 Comparaison

| Critère | StyleSheet | NativeWind |
|---------|------------|------------|
| **Lignes de code** | ~15 par style | ~1 ligne |
| **Vitesse dev** | ⭐⭐⭐ Moyen | ⭐⭐⭐⭐⭐ Ultra rapide |
| **Lisibilité** | ⭐⭐⭐ OK | ⭐⭐⭐⭐⭐ Excellent |
| **Responsive** | Complexe | Facile |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Type-safe** | ✅ | ✅ |
| **Courbe apprentissage** | Facile | Nulle (si connaît Tailwind) |

### 🎯 Ce que vous pouvez faire maintenant

#### Option 1 : Garder StyleSheet (sécurisé)
Les composants existants continuent de fonctionner.

#### Option 2 : Utiliser NativeWind (recommandé)
Pour tous les **nouveaux composants**, utilisez Tailwind :

```typescript
// Au lieu de :
const styles = StyleSheet.create({...});

// Faites :
<View className="p-4 bg-white rounded-xl">
```

#### Option 3 : Migrer progressivement
Remplacez les StyleSheet par NativeWind au fur et à mesure.

### 📝 Classes Tailwind les plus utiles

**Layout** :
- `flex flex-row items-center justify-between`
- `p-4 px-6 py-3` (padding)
- `m-4 mx-auto my-2` (margin)
- `gap-4` (espacement)

**Colors** :
- `bg-blue-600 text-white` (couleurs)
- `bg-primary-500 text-primary-900` (custom)

**Typography** :
- `text-xl font-bold text-gray-900`
- `text-sm text-gray-600`

**Borders & Radius** :
- `rounded-lg rounded-xl rounded-full`
- `border border-gray-300`

**Shadow** (cross-platform automatique!) :
- `shadow-sm shadow-md shadow-lg`

---

## 🚀 PHASE 4 - En cours de démarrage...

Le serveur Expo redémarre avec NativeWind activé.

**Dans 15 secondes**, vous pourrez tester :
- http://localhost:8082/onboarding
- http://localhost:8082/register
- http://localhost:8082/(tabs)/dashboard

Toutes les routes sont maintenant disponibles ! 🎉

---

**Prochaine étape** : Tester l'app et voir NativeWind en action !

