# 🔧 Résolution du problème de bundling mobile

## 🚨 Problèmes identifiés

### 1. Erreur de bundling initial
```
Web Bundling failed 5050ms node_modules/expo-router/entry.js (849 modules)
mobile:dev: Unable to resolve "../../lib/supabase" from "apps/mobile/app/login.tsx"
```

### 2. Erreur de protocole workspace
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```

Cette erreur indique que npm ne reconnaît pas la syntaxe `workspace:*` dans certaines versions ou contextes.

## ✅ Solutions appliquées

### 1. Configuration Supabase corrigée

Le fichier `apps/mobile/lib/supabase.ts` a été mis à jour pour :
- ✅ Utiliser `expo-constants` au lieu de `process.env`
- ✅ Inclure des valeurs par défaut pour les variables d'environnement
- ✅ Supprimer la dépendance au type `Database` (cause de l'erreur workspace)

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Configuration Supabase Cloud avec valeurs par défaut
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 2. Dépendances corrigées

- ✅ Suppression de `@gemou2/database: "workspace:*"` (cause de l'erreur EUNSUPPORTEDPROTOCOL)
- ✅ `dotenv` ajouté aux devDependencies pour le chargement des variables d'environnement

### 3. Configuration TypeScript mise à jour

Le fichier `tsconfig.json` du mobile inclut maintenant :
```json
{
  "paths": {
    "@/*": ["./app/*"],
    "@/components/*": ["./components/*"],
    "@/lib/*": ["./lib/*"]
  }
}
```

### 4. Configuration Expo mise à jour

Le fichier `app.config.js` a été créé pour :
- ✅ Charger les variables d'environnement avec dotenv
- ✅ Exposer les clés Supabase via `extra` pour expo-constants
- ✅ Maintenir la compatibilité avec la configuration existante

## 🚀 Étapes pour résoudre le problème

### 1. Installer les dépendances
```bash
cd apps/mobile
npm install
```

### 2. Créer le fichier .env (si nécessaire)
```bash
# Créer un fichier .env avec les variables d'environnement
echo 'EXPO_PUBLIC_SUPABASE_URL=https://qpnofwgxjgvmpwdrhzid.supabase.co' > .env
echo 'EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' >> .env
```

### 3. Redémarrer le serveur de développement
```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis redémarrer
npm run dev
```

### 4. Tester la connexion
```bash
# Tester la configuration Supabase
node test-supabase.js
```

## 🔍 Vérifications

### ✅ Fichiers modifiés
- `apps/mobile/lib/supabase.ts` - Configuration Supabase corrigée
- `apps/mobile/package.json` - Dépendances ajoutées
- `apps/mobile/tsconfig.json` - Résolution des packages workspace
- `apps/mobile/app.config.js` - Configuration Expo avec variables d'environnement

### ✅ Fichiers créés
- `apps/mobile/env.local` - Variables d'environnement
- `apps/mobile/.env.example` - Exemple de configuration
- `apps/mobile/test-supabase.js` - Script de test
- `apps/mobile/MOBILE_SETUP_FIX.md` - Cette documentation

## 🎯 Résultat attendu

Après ces modifications, l'application mobile devrait :
- ✅ Se compiler sans erreur de bundling
- ✅ Pouvoir importer `../../lib/supabase` depuis `login.tsx`
- ✅ Se connecter à Supabase Cloud correctement
- ✅ Fonctionner avec les mêmes fonctionnalités que l'application web

## 🔧 Dépannage supplémentaire

Si le problème persiste :

1. **Vérifier les dépendances** :
   ```bash
   cd apps/mobile
   npm ls @supabase/supabase-js
   npm ls @gemou2/database
   ```

2. **Nettoyer le cache** :
   ```bash
   npm run dev -- --clear
   ```

3. **Vérifier la configuration workspace** :
   ```bash
   # Depuis la racine du projet
   npm run dev:mobile
   ```

4. **Tester la connexion Supabase** :
   ```bash
   cd apps/mobile
   node test-supabase.js
   ```

---

*Configuration appliquée le $(date)*
