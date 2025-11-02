# 🔍 Page Marketplace vide - Que faire ?

## Situation actuelle

Vous consultez la page `/marketplace` sur mobile et **aucune annonce n'apparaît**.

## ✅ Ce qui a été fait

1. **Mode debug activé** : Des logs ont été ajoutés dans le code pour diagnostiquer le problème
2. **Status corrigé** : Changé de `'active'` à `'available'`
3. **Documentation créée** : Guide complet de diagnostic et script SQL de test

## 🚀 Marche à suivre (3 étapes)

### Étape 1 : Vérifier les logs dans la console

1. Ouvrez l'application mobile sur `/marketplace`
2. Ouvrez la console/terminal de votre environnement de développement
3. Recherchez les lignes commençant par `🔍 DEBUG`

**Ce que vous devriez voir** :
```
🔍 DEBUG - All marketplace items: [...]
🔍 DEBUG - Error: null/error message
✅ Marketplace items loaded: X
```

### Étape 2 : Identifier le problème

| Ce que vous voyez | Problème | Solution |
|-------------------|----------|----------|
| `Error: relation "marketplace_items" does not exist` | ❌ Table absente | Créer la table (voir étape 3, option A) |
| `All marketplace items: []` | ⚠️ Table vide | Ajouter des données (voir étape 3, option B) |
| `loaded: 0` mais des items existent | ⚠️ Mauvais status | Vérifier le status des données |
| `loaded: 5` mais rien à l'écran | ⚠️ Problème d'affichage | Vérifier le code UI |

### Étape 3 : Appliquer la solution

#### Option A : Créer la table (si elle n'existe pas)

Ouvrez **Supabase Dashboard** > **SQL Editor** et exécutez :

```sql
CREATE TABLE marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sale', 'exchange', 'donation')),
  condition TEXT,
  price NUMERIC(10, 2),
  location_city TEXT,
  images TEXT[],
  status TEXT NOT NULL DEFAULT 'available',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Option B : Ajouter des données de test

**Méthode rapide** : Utilisez le script SQL fourni

1. Ouvrez le fichier : `documentation/seed-marketplace-data.sql`
2. **IMPORTANT** : Remplacez `'YOUR_USER_ID_HERE'` par votre vrai user_id
   
   Pour trouver votre user_id, exécutez d'abord dans Supabase :
   ```sql
   SELECT id, email FROM auth.users LIMIT 5;
   ```

3. Copiez le script modifié dans **Supabase Dashboard** > **SQL Editor**
4. Exécutez-le

Vous aurez alors **10 annonces de test** :
- 5 ventes (Monopoly, Risk, Scrabble, etc.)
- 3 échanges (Catan, Dixit, Codenames)
- 2 dons (7 Familles, Uno)

## 🧹 Une fois le problème résolu

### 1. Retirer le mode debug

Dans `apps/mobile/app/(tabs)/marketplace.tsx`, **supprimez** ces lignes :

```typescript
// SUPPRIMER TOUT CE BLOC :
const { data: allData, error: testError } = await supabase
  .from('marketplace_items')
  .select('*')
  .limit(5);

console.log('🔍 DEBUG - All marketplace items:', allData);
console.log('🔍 DEBUG - Error:', testError);
```

Et les autres `console.log` de debug.

### 2. Réactiver le filtre de status

**Décommentez** cette ligne :

```typescript
let query = supabase
  .from('marketplace_items')
  .select('*')
  .eq('status', 'available') // ← Décommenter cette ligne
  .order('created_at', { ascending: false });
```

## 📚 Documentation complète

Pour plus de détails, consultez :

- **`2025-10-27-marketplace-diagnostic-debug.md`** : Guide de diagnostic complet
- **`seed-marketplace-data.sql`** : Script SQL avec 10 annonces de test
- **`2025-10-27-marketplace-refonte-affichage.md`** : Documentation de la refonte mobile
- **`2025-10-27-marketplace-web-implementation.md`** : Documentation version web

## 🆘 Aide rapide

### Vérifier si la table existe

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'marketplace_items'
);
```

### Voir toutes les annonces (avec leur status)

```sql
SELECT id, title, type, status, created_at 
FROM marketplace_items 
ORDER BY created_at DESC;
```

### Changer le status d'une annonce

```sql
UPDATE marketplace_items 
SET status = 'available' 
WHERE status = 'draft'; -- ou 'active'
```

## ✅ Checklist de vérification

Avant de nous contacter :

- [ ] J'ai vérifié les logs dans la console
- [ ] J'ai vérifié que la table `marketplace_items` existe
- [ ] J'ai vérifié qu'il y a des données avec `status = 'available'`
- [ ] J'ai essayé d'insérer au moins une annonce de test
- [ ] J'ai vérifié les permissions RLS dans Supabase

## 🎯 Résultat attendu

Après avoir suivi ces étapes, vous devriez voir :

```
┌─────────────────────────────────────────┐
│ [Rechercher un jeu...]                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [Tout] [💰 Vente] [🔄 Échange] [🎁 Don]│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 💰 Monopoly Edition 2024      [IMAGE]  │
│                                         │
│ Jeu en excellent état...                │
│                                         │
│ 45€               📍 Saint-Denis        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🔄 Catan - Édition Voyageurs  [IMAGE]  │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

**Besoin d'aide ?** Partagez les logs de votre console avec l'équipe de développement.

