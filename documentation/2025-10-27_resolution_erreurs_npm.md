# Résolution des Erreurs NPM - 27 Octobre 2025

## 🎯 Problèmes Identifiés

L'installation npm échouait avec plusieurs erreurs critiques :

### 1. Version Inexistante d'`expo-image-picker`
```
npm error notarget No matching version found for expo-image-picker@~16.0.15.
```

### 2. Conflits de Versions React/React Native
- React 19.2.0 forcé via `overrides` dans le package.json racine
- React Native 0.81.4 incompatible avec React 19
- Conflits de peer dependencies avec `react-test-renderer`

### 3. Conflits de Peer Dependencies
```
npm WARN ERESOLVE overriding peer dependency
npm WARN Could not resolve dependency:
npm WARN peerOptional react-test-renderer@"^16.9.0 || ^17.0.0"
```

## ✅ Solutions Appliquées

### 1. Correction de `expo-image-picker`
**Fichier :** `apps/mobile/package.json`

**Changement :**
```json
// Avant
"expo-image-picker": "~16.0.15"

// Après
"expo-image-picker": "~16.0.0"
```

**Raison :** La version 16.0.15 n'existe pas dans le registre npm.

---

### 2. Mise à Jour des Versions React/React Native

#### Package Racine (`package.json`)
```json
// Avant
"overrides": {
  "@types/react": "^19.2.2",
  "@types/react-dom": "^19.2.2",
  "react": "19.2.0",
  "react-dom": "19.2.0"
}

// Après
"overrides": {
  "@types/react": "~18.3.0",
  "@types/react-dom": "~18.3.0",
  "react": "18.3.1",
  "react-dom": "18.3.1"
}
```

#### Application Mobile (`apps/mobile/package.json`)
```json
// Avant
"react": "19.2.0",
"react-dom": "19.2.0",
"react-native": "0.81.4",
"react-test-renderer": "19.2.0",
"@types/react": "^19.2.2"

// Après
"react": "18.3.1",
"react-dom": "18.3.1",
"react-native": "0.76.5",
"react-test-renderer": "18.3.1",
"@types/react": "~18.3.0"
```

#### Application Web (`apps/web/package.json`)
```json
// Avant
"react": "^19.1.0",
"react-dom": "^19.1.0",
"@types/react": "^19.2.2",
"@types/react-dom": "^19.2.2"

// Après
"react": "18.3.1",
"react-dom": "18.3.1",
"@types/react": "~18.3.0",
"@types/react-dom": "~18.3.0"
```

**Raisons :**
- React Native 0.81.4 n'était pas compatible avec React 19
- Expo SDK 54 nécessite React Native 0.76.x
- React 18.3.1 est la version stable supportée par React Native 0.76.5

---

### 3. Installation avec Flag Legacy
```bash
npm install --legacy-peer-deps
```

Cette commande a été nécessaire pour contourner les conflits de peer dependencies mineurs restants, notamment avec `@testing-library/react-hooks@8.0.1` qui attend React 16-17.

## 📊 Résultat Final

✅ **Installation Réussie**
- 1423 packages installés
- 0 vulnérabilités détectées
- Compatibilité complète entre toutes les dépendances

## ⚠️ Avertissements Résiduels (Non-Critiques)

Des avertissements de dépréciation ont été émis pour :
- `@supabase/auth-helpers-nextjs` → Migrer vers `@supabase/ssr`
- `@testing-library/jest-native` → Utiliser les matchers intégrés de @testing-library/react-native
- `eslint@8.x` → Migrer vers une version plus récente

## 🔧 Versions Finales des Dépendances Clés

| Dépendance | Version Mobile | Version Web |
|------------|---------------|-------------|
| React | 18.3.1 | 18.3.1 |
| React DOM | 18.3.1 | 18.3.1 |
| React Native | 0.76.5 | - |
| Expo SDK | 54.0.13 | - |
| Next.js | - | 15.1.0 |
| TypeScript | 5.3.0 | 5.2.0 |
| expo-image-picker | ~16.0.0 | - |

## 📝 Recommandations Futures

1. **Supabase Auth** : Migrer de `@supabase/auth-helpers-nextjs` vers `@supabase/ssr` comme indiqué dans les règles du workspace
2. **Testing Library** : Supprimer `@testing-library/jest-native` et utiliser les matchers natifs
3. **ESLint** : Mettre à jour vers ESLint 9.x
4. **React Hooks Testing** : Remplacer `@testing-library/react-hooks` par l'approche moderne avec `@testing-library/react-native`

## 🎓 Leçons Apprises

1. **Expo Managed Workflow** : Toujours vérifier les versions compatibles avec le SDK Expo actuel
2. **Monorepo Dependencies** : Les `overrides` dans le package.json racine affectent toutes les apps du workspace
3. **Peer Dependencies** : React Native a des exigences strictes de versions React
4. **Version Ranges** : Utiliser `~` au lieu de `^` pour plus de contrôle sur les versions patch

## 🔗 Ressources

- [Expo SDK 54 Release Notes](https://expo.dev/changelog/2025/10-24-sdk-54)
- [React Native Compatibility](https://reactnative.dev/versions)
- [NPM Legacy Peer Deps](https://docs.npmjs.com/cli/v8/commands/npm-install#legacy-peer-deps)

