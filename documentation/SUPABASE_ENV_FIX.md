# 🔧 Correction des Variables d'Environnement Supabase

## ❌ Problème Initial
```
Error: either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!
```

## ✅ Solution Appliquée

### 1. **Récupération des Clés Supabase**
```bash
supabase projects api-keys --project-ref qpnofwgxjgvmpwdrhzid
```

### 2. **Création du fichier `.env` principal**
```env
NEXT_PUBLIC_SUPABASE_URL=https://qpnofwgxjgvmpwdrhzid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_SUPABASE_URL=https://qpnofwgxjgvmpwdrhzid.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
```

### 3. **Création du fichier `.env.local` pour Next.js**
```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://qpnofwgxjgvmpwdrhzid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. **Mise à jour de la configuration Supabase Web**
```typescript
// apps/web/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## 🎯 Résultat
- ✅ **Application Web** : Fonctionne sur http://localhost:3000
- ✅ **Application Mobile** : Fonctionne avec Expo
- ✅ **Variables d'environnement** : Correctement configurées
- ✅ **Connexion Supabase** : Établie et fonctionnelle

## 📝 Notes
- Les fichiers `.env` et `.env.local` sont dans `.gitignore`
- Les clés sont spécifiques au projet `qpnofwgxjgvmpwdrhzid`
- Configuration compatible avec Next.js et Expo


