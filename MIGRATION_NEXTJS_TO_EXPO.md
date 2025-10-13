# Migration Next.js → Expo Router - Guide Pratique

## 🎯 Objectif
Migrer progressivement les routes de `/apps/web` vers `/apps/mobile` (qui devient l'app universelle)

## 📊 État actuel

### Routes Web (Next.js)
```
apps/web/app/
├── page.tsx                 → Landing page
├── onboarding/page.tsx      → ✅ EXISTE déjà dans mobile
├── login/page.tsx           → ✅ EXISTE déjà dans mobile  
├── register/page.tsx        → ❌ À migrer
├── dashboard/page.tsx       → ✅ EXISTE déjà dans mobile
├── events/
│   ├── page.tsx            → ❌ À migrer
│   └── [id]/page.tsx       → ❌ À migrer
├── profile/
│   ├── page.tsx            → ❌ À migrer
│   └── [username]/page.tsx → ❌ À migrer
├── community/page.tsx       → ❌ À migrer
├── search/page.tsx          → ❌ À migrer
└── ...
```

### Routes Mobile (Expo Router) - ACTUELLES
```
apps/mobile/app/
├── index.tsx               → Landing page
├── onboarding.tsx          → ✅ Onboarding
├── login.tsx               → ✅ Login
├── dashboard.tsx           → ✅ Dashboard
└── _layout.tsx            → Layout racine
```

## 🔄 Correspondance Next.js ↔ Expo Router

| Next.js | Expo Router | Notes |
|---------|-------------|-------|
| `app/page.tsx` | `app/index.tsx` | Route racine |
| `app/about/page.tsx` | `app/about.tsx` | Route simple |
| `app/users/[id]/page.tsx` | `app/users/[id].tsx` | Route dynamique |
| `app/users/page.tsx` + `app/users/[id]/page.tsx` | `app/users/index.tsx` + `app/users/[id].tsx` | Route avec index |
| `app/layout.tsx` | `app/_layout.tsx` | Layout (avec _) |
| `app/(group)/page.tsx` | `app/(group)/index.tsx` | Route groupée |

## 📝 Checklist de migration par route

### ✅ Déjà migrées
- [x] `/` - Landing page (index.tsx)
- [x] `/onboarding` - Onboarding
- [x] `/login` - Login
- [x] `/dashboard` - Dashboard

### 🔄 À migrer (priorité haute)
- [ ] `/register` - Inscription
- [ ] `/events` - Liste des événements
- [ ] `/events/[id]` - Détail d'un événement
- [ ] `/profile` - Profil utilisateur
- [ ] `/profile/[username]` - Profil public

### 📅 À migrer (priorité moyenne)
- [ ] `/community` - Page communauté
- [ ] `/search` - Recherche
- [ ] `/create-event` - Créer un événement
- [ ] `/trade/[id]` - Détail d'un échange

### 🎨 À migrer (priorité basse)
- [ ] `/style-guide` - Guide de style (dev only)
- [ ] `/components-demo` - Démo composants (dev only)

## 🛠️ Patterns de migration

### Pattern 1 : Route simple

**Next.js (`app/about/page.tsx`)**
```typescript
export default function AboutPage() {
  return <div>About</div>;
}
```

**Expo Router (`app/about.tsx`)**
```typescript
import { View, Text } from 'react-native';

export default function AboutPage() {
  return (
    <View>
      <Text>About</Text>
    </View>
  );
}
```

### Pattern 2 : Navigation

**Next.js**
```typescript
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function MyComponent() {
  const router = useRouter();
  
  return (
    <>
      <Link href="/about">About</Link>
      <button onClick={() => router.push('/about')}>Go</button>
    </>
  );
}
```

**Expo Router**
```typescript
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';

function MyComponent() {
  const router = useRouter();
  
  return (
    <>
      <Link href="/about">About</Link>
      <Pressable onPress={() => router.push('/about')}>
        <Text>Go</Text>
      </Pressable>
    </>
  );
}
```

### Pattern 3 : Paramètres de route

**Next.js (`app/users/[id]/page.tsx`)**
```typescript
interface Props {
  params: { id: string };
}

export default function UserPage({ params }: Props) {
  return <div>User {params.id}</div>;
}
```

**Expo Router (`app/users/[id].tsx`)**
```typescript
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function UserPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return (
    <View>
      <Text>User {id}</Text>
    </View>
  );
}
```

### Pattern 4 : Composants adaptatifs (web vs mobile)

**Créer des versions spécifiques**
```
components/
├── Button.web.tsx      → Utilisé sur web
├── Button.native.tsx   → Utilisé sur iOS/Android
└── Button.tsx          → Fallback (optionnel)
```

**Button.web.tsx**
```typescript
export function Button({ onPress, children }) {
  return <button onClick={onPress}>{children}</button>;
}
```

**Button.native.tsx**
```typescript
import { TouchableOpacity, Text } from 'react-native';

export function Button({ onPress, children }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}
```

**Usage (Expo Router choisit automatiquement)**
```typescript
import { Button } from '@/components/Button';

// Sur web → utilise Button.web.tsx
// Sur iOS/Android → utilise Button.native.tsx
```

### Pattern 5 : Styling cross-platform

**Option A : Platform.select**
```typescript
import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: Platform.select({
      web: 40,
      default: 16
    }),
    maxWidth: Platform.select({
      web: 1200,
      default: '100%'
    })
  }
});
```

**Option B : Fichiers séparés**
```typescript
// styles.web.ts
export const styles = StyleSheet.create({
  container: { padding: 40, maxWidth: 1200 }
});

// styles.native.ts
export const styles = StyleSheet.create({
  container: { padding: 16 }
});

// Component
import { styles } from './styles';
```

## 🚀 Plan de migration progressif

### Semaine 1 : Routes critiques
1. ✅ Finaliser `/onboarding`, `/login`, `/dashboard`
2. 🔄 Migrer `/register`
3. 🔄 Migrer `/events` (liste)
4. 🔄 Tester sur web, iOS, Android

### Semaine 2 : Routes secondaires
1. Migrer `/events/[id]` (détail)
2. Migrer `/profile` et `/profile/[username]`
3. Migrer `/community`
4. Tester et corriger les bugs

### Semaine 3 : Finitions
1. Migrer routes restantes
2. Optimiser les performances
3. Tests finaux
4. Déploiement web

### Semaine 4 : Nettoyage
1. Supprimer `/apps/web`
2. Mettre à jour la documentation
3. Former l'équipe

## 📦 Dépendances à ajouter (si nécessaire)

```bash
# NativeWind (Tailwind pour React Native) - OPTIONNEL
npx expo install nativewind
npm install --save-dev tailwindcss

# Expo Image (meilleure alternative à Image)
npx expo install expo-image

# React Native SVG
npx expo install react-native-svg
```

## ✅ Tests à faire après chaque migration

- [ ] La route fonctionne sur **web** (http://localhost:8082)
- [ ] La route fonctionne sur **iOS** (simulateur ou Expo Go)
- [ ] La route fonctionne sur **Android** (émulateur ou Expo Go)
- [ ] La navigation fonctionne (aller/retour)
- [ ] Les données se chargent correctement
- [ ] Le style est correct sur toutes les plateformes

## 🐛 Problèmes courants et solutions

### Problème : "Module not found"
**Solution** : Vérifier les imports relatifs (`../lib` vs `../../lib`)

### Problème : Style différent web vs mobile
**Solution** : Utiliser `Platform.select()` ou fichiers `.web.tsx` / `.native.tsx`

### Problème : Hook non compatible
**Solution** : Créer un wrapper cross-platform dans `/packages/shared`

### Problème : Performance web lente
**Solution** : Activer `output: "static"` dans app.config.js

## 📚 Ressources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Migration from Next.js](https://docs.expo.dev/router/migrate/from-nextjs/)
- [Platform-specific code](https://reactnative.dev/docs/platform-specific-code)

---

**Prochaine étape** : Migrer `/register` 🚀

