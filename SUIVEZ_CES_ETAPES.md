# 🔧 ÉTAPES À SUIVRE - Correction React Hooks

## ✅ Les Corrections Automatiques Déjà Appliquées

J'ai déjà corrigé les fichiers suivants :

1. ✅ **`apps/mobile/components/auth/AuthProvider.tsx`**
   - Import React corrigé pour React 19
   - Tous les hooks utilisent maintenant `React.*`

2. ✅ **`apps/mobile/package.json`**
   - React et React-DOM mis à jour vers 19.2.0

3. ✅ **`package.json` (racine)**
   - Overrides corrigés pour forcer React 19.2.0

## 🚨 Action Manuelle Requise

Il reste un problème de permissions npm à corriger. Suivez ces étapes **dans l'ordre** :

### Étape 1 : Corriger les Permissions npm

Ouvrez un terminal et exécutez :

```bash
sudo chown -R $(id -u):$(id -g) ~/.npm
```

💡 Cette commande corrige les permissions du cache npm.

### Étape 2 : Nettoyer Complètement

```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735

# Nettoyer le cache npm
npm cache clean --force

# Supprimer tous les node_modules
rm -rf node_modules
rm -rf apps/mobile/node_modules
rm -rf apps/web/node_modules
rm -rf packages/database/node_modules
rm -rf packages/shared/node_modules

# Supprimer les lock files
rm -f package-lock.json
rm -f apps/mobile/package-lock.json
rm -f apps/web/package-lock.json
```

### Étape 3 : Réinstaller les Dépendances

```bash
npm install
```

### Étape 4 : Démarrer l'Application

```bash
cd apps/mobile
npm run dev:web
```

## 🎯 Résultat Attendu

Après ces étapes, vous devriez voir :
- ✅ Aucune erreur "Invalid hook call"
- ✅ L'application démarre normalement
- ✅ L'AuthProvider fonctionne correctement

## 🔍 Vérification

Pour vérifier que tout est correct :

```bash
# Vérifier qu'il n'y a qu'une seule version de React
npm list react

# Résultat attendu : Toutes les instances doivent être à 19.2.0
```

## 📝 Résumé des Changements

### AuthProvider.tsx (avant)
```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ...
  }, []);

  const context = useContext(AuthContext);
  // ...
}
```

### AuthProvider.tsx (après)
```tsx
import * as React from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // ...
  }, []);

  const context = React.useContext(AuthContext);
  // ...
}
```

### Versions React (avant)
```json
{
  "react": "19.1.0",
  "react-dom": "19.1.0"
}
```

### Versions React (après)
```json
{
  "react": "19.2.0",
  "react-dom": "19.2.0"
}
```

## 📚 Documentation Complète

Pour plus d'informations, consultez :
- `documentation/FIX_REACT_HOOKS_ERROR.md` - Documentation détaillée
- `FIX_REACT_IMMEDIATE.md` - Guide de correction immédiate

## 🆘 En Cas de Problème

Si après ces étapes le problème persiste :

1. **Redémarrer complètement l'ordinateur** (vide les caches système)

2. **Vérifier les processus en cours** :
   ```bash
   ps aux | grep -E 'metro|expo|node'
   # Tuer tous les processus suspects
   ```

3. **Nettoyer Watchman** (si installé) :
   ```bash
   watchman watch-del-all
   ```

4. **Vérifier qu'aucun autre projet n'utilise le même cache** :
   ```bash
   lsof | grep metro
   ```

## ✨ Pourquoi Ces Changements ?

### Problème 1 : Conflit de Versions React
Le projet utilisait à la fois React 19.1.0 et React 19.2.0, causant des conflits internes.

### Problème 2 : Import React 19
Avec React 19, l'import namespace (`import * as React`) est plus stable que les imports nommés.

### Problème 3 : Cache npm Corrompu
Un bug dans les anciennes versions de npm a créé des fichiers appartenant à root dans le cache.

---

**Date** : 22 Octobre 2025  
**Statut** : ⚠️ Action manuelle requise  
**Temps estimé** : 5-10 minutes





