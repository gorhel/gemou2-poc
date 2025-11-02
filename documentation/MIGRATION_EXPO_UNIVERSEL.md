# Migration vers Expo Router Universel

## 🎯 Objectif
Consolider `/apps/web` et `/apps/mobile` en une seule application universelle qui fonctionne sur web, iOS et Android.

## ✅ Avantages

### Code
- **Une seule codebase** pour toutes les plateformes
- **Routing unifié** : Même système de navigation
- **Components partagés** automatiquement
- **Business logic** centralisée

### Développement
- **Développement plus rapide** : Un changement = toutes les plateformes
- **Moins de bugs** : Moins de duplication
- **Maintenance simplifiée** : Un seul endroit à maintenir
- **Hot reload** sur toutes les plateformes

### Performance
- **Web optimisé** : React Native Web est très performant
- **Bundle size** : Tree-shaking efficace
- **SEO** : Support avec `expo-router` + Meta tags

## 📋 Plan de migration

### Phase 1 : Préparation (1-2h)
1. ✅ Vérifier que toutes les dépendances Expo sont à jour
2. ✅ Configurer Expo Router pour le web
3. ✅ Tester le build web actuel

### Phase 2 : Migration des routes (2-4h)
1. Migrer les routes de Next.js vers Expo Router
   - `/apps/web/app/*` → `/apps/mobile/app/*`
2. Adapter les composants Next.js
   - `<Link>` → `<Link>` (expo-router)
   - `useRouter` (next) → `useRouter` (expo-router)
   - `Image` (next) → `Image` (expo-image)

### Phase 3 : Composants universels (3-5h)
1. Créer des composants adaptatifs avec `Platform.OS`
2. Organiser en :
   - `components/shared/` - Universels
   - `components/web/` - Spécifiques web
   - `components/native/` - Spécifiques mobile

### Phase 4 : Styling (2-3h)
1. Migrer de Tailwind vers :
   - NativeWind (Tailwind pour React Native)
   - OU StyleSheet + thème partagé

### Phase 5 : Tests et optimisation (2-4h)
1. Tester sur web, iOS, Android
2. Optimiser les bundles
3. Configurer le SEO web

## 🔧 Configuration Expo Router pour le web

### 1. Installation
```bash
cd apps/mobile
npx expo install expo-router react-native-web react-dom
```

### 2. Configuration `app.config.js`
```javascript
export default {
  expo: {
    name: "Gémou2",
    slug: "gemou2",
    platforms: ["ios", "android", "web"],
    web: {
      bundler: "metro",
      output: "static", // Pour export statique
      favicon: "./assets/favicon.png"
    },
    // ...
  }
}
```

### 3. Scripts `package.json`
```json
{
  "scripts": {
    "start": "expo start",
    "web": "expo start --web",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "build:web": "expo export --platform web",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android"
  }
}
```

## 📱 Composants adaptatifs

### Exemple de composant universel
```typescript
import { Platform, View, Text } from 'react-native';

export function ResponsiveHeader() {
  return (
    <View style={Platform.select({
      web: { padding: 20, maxWidth: 1200 },
      default: { padding: 16 }
    })}>
      <Text>Header universel</Text>
    </View>
  );
}
```

### Utiliser des composants spécifiques
```typescript
// Button.web.tsx (utilisé sur web)
export function Button() {
  return <button>Click me</button>;
}

// Button.native.tsx (utilisé sur iOS/Android)
export function Button() {
  return <TouchableOpacity><Text>Click me</Text></TouchableOpacity>;
}

// Expo Router choisit automatiquement le bon fichier !
```

## 🎨 Styling unifié

### Option 1 : NativeWind (Tailwind pour RN)
```bash
npm install nativewind
npm install --save-dev tailwindcss
```

```tsx
import { Text } from 'react-native';

function Title() {
  return <Text className="text-2xl font-bold text-gray-900">Titre</Text>;
}
```

### Option 2 : StyleSheet + tokens partagés
```typescript
// theme.ts
export const theme = {
  colors: {
    primary: '#3b82f6',
    // ...
  },
  spacing: {
    sm: 8,
    md: 16,
    // ...
  }
};

// Component
import { StyleSheet } from 'react-native';
import { theme } from './theme';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary
  }
});
```

## 🚀 Déploiement

### Web
```bash
# Build statique
expo export --platform web

# Déployer sur Vercel
npx vercel --prod
```

### Mobile
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 📊 Comparaison

| Aspect | Avant (2 apps) | Après (Expo universel) |
|--------|----------------|------------------------|
| **Codebase** | 2 apps séparées | 1 app universelle |
| **Routes** | Dupliquées | Partagées |
| **Components** | Dupliqués | Partagés |
| **Maintenance** | 2x effort | 1x effort |
| **Développement** | Lent | Rapide |
| **Bugs** | 2x risque | 1x risque |

## 🎯 Estimation totale

- **Temps** : 10-18 heures
- **Difficulté** : Moyenne
- **Bénéfices** : Très élevés

## 📝 Prochaines étapes

1. Décider si on migre ou on optimise le monorepo actuel
2. Si migration : Commencer par Phase 1
3. Migrer route par route progressivement
4. Tester continuellement

## 🔗 Ressources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [NativeWind](https://www.nativewind.dev/)
- [Platform-specific code](https://reactnative.dev/docs/platform-specific-code)

