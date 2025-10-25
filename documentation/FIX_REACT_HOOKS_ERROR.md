# 🔧 Correction : Erreur "Invalid Hook Call"

## 📋 Problème

Erreur rencontrée :
```
Invalid hook call. Hooks can only be called inside of the body of a function component.
TypeError: Cannot read properties of null (reading 'useState')
```

## 🔍 Cause

Le problème était causé par :

1. **Conflit de versions React** : Le projet utilisait à la fois React 19.1.0 et React 19.2.0
2. **Import incorrect** : L'import de React dans `AuthProvider` n'était pas compatible avec React 19
3. **Multiples instances de React** : Le monorepo avait plusieurs copies de React installées

## ✅ Solutions Appliquées

### 1. Correction de l'import React dans AuthProvider

**Avant** :
```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
```

**Après** :
```tsx
import * as React from 'react';
```

Et tous les hooks utilisent maintenant le namespace `React.*` :
- `React.useState()` au lieu de `useState()`
- `React.useEffect()` au lieu de `useEffect()`
- `React.useContext()` au lieu de `useContext()`
- `React.createContext()` au lieu de `createContext()`

### 2. Uniformisation des versions React

**`apps/mobile/package.json`** :
```json
{
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0"
  },
  "devDependencies": {
    "react-test-renderer": "19.2.0"
  }
}
```

**`package.json` (racine)** :
```json
{
  "overrides": {
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

### 3. Script de nettoyage

Un script `scripts/fix-react-hooks.sh` a été créé pour :
- Arrêter le serveur Expo
- Nettoyer tous les caches (Expo, Metro, npm, Watchman)
- Supprimer tous les `node_modules`
- Réinstaller les dépendances avec les bonnes versions

## 🚀 Étapes pour Appliquer la Correction

### Option 1 : Exécution Automatique (Recommandé)

```bash
# Depuis la racine du projet
./scripts/fix-react-hooks.sh
```

### Option 2 : Exécution Manuelle

Si le script ne fonctionne pas, exécutez manuellement :

```bash
# 1. Arrêter tous les processus Expo/Metro
pkill -f "expo start"
pkill -f "metro"

# 2. Nettoyer les node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# 3. Nettoyer les caches
npm cache clean --force
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*

# 4. (Optionnel) Si Watchman est installé
watchman watch-del-all

# 5. Réinstaller les dépendances
npm install

# 6. Démarrer l'application
cd apps/mobile
npm run dev:web
```

## 📝 Fichiers Modifiés

1. ✅ `apps/mobile/components/auth/AuthProvider.tsx` - Import React corrigé
2. ✅ `apps/mobile/package.json` - Version React mise à jour
3. ✅ `package.json` - Overrides corrigés
4. ✅ `scripts/fix-react-hooks.sh` - Script de nettoyage créé

## ✨ Vérification

Après avoir appliqué les corrections et redémarré l'application :

1. ✅ Plus d'erreur "Invalid hook call"
2. ✅ Une seule version de React (19.2.0) dans tout le projet
3. ✅ L'AuthProvider se charge correctement
4. ✅ Les hooks fonctionnent normalement

## 🔗 Références

- [React 19 Documentation](https://react.dev/)
- [React Hooks Rules](https://react.dev/warnings/invalid-hook-call-warning)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## 🆘 En cas de Problème Persistant

Si l'erreur persiste après avoir appliqué toutes les corrections :

1. **Vérifier les versions** :
   ```bash
   npm list react react-dom
   ```
   Toutes les instances doivent être à `19.2.0`

2. **Nettoyer complètement** :
   ```bash
   # Supprimer TOUS les fichiers générés
   rm -rf node_modules apps/*/node_modules packages/*/node_modules
   rm -f package-lock.json apps/*/package-lock.json
   
   # Nettoyer le cache global
   npm cache clean --force
   
   # Réinstaller depuis zéro
   npm install
   ```

3. **Redémarrer l'ordinateur** : Parfois nécessaire pour vider complètement les caches système

4. **Vérifier les imports** : S'assurer qu'aucun autre fichier n'importe React avec des imports nommés
   ```bash
   # Rechercher les imports problématiques
   grep -r "import React, {" apps/mobile/
   ```

## 📊 Arborescence des Composants

L'application utilise maintenant correctement le contexte d'authentification :

```
App
└── ErrorOverlay
    └── ExpoRoot
        └── ContextNavigator
            └── Content
                └── SceneView
                    └── Route
                        └── RootLayout (_layout.tsx)
                            └── AuthProvider ✅ (Corrigé)
                                └── Stack
                                    ├── index
                                    ├── onboarding
                                    ├── login
                                    ├── register
                                    └── (tabs)
```

## 💡 Bonnes Pratiques pour React 19

Avec React 19, il est recommandé de :

1. **Utiliser l'import namespace** :
   ```tsx
   import * as React from 'react';
   ```

2. **Préfixer tous les hooks** :
   ```tsx
   const [state, setState] = React.useState();
   React.useEffect(() => {}, []);
   ```

3. **Assurer une version unique** : Utiliser `overrides` dans package.json pour forcer une version unique

4. **Nettoyer régulièrement les caches** : Surtout après des changements de versions

---

**Date de création** : 22 Octobre 2025  
**Statut** : ✅ Résolu



