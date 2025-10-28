# 🚨 FIX - Erreur Création Annonce Marketplace

## ❌ Erreur Rencontrée

```
Console Error
Error creating trade: {}
```

## 🔍 Cause Probable

L'erreur vide `{}` indique généralement un problème avec :
1. Les politiques RLS qui bloquent l'insertion
2. Une contrainte de la base de données qui n'est pas respectée
3. Une colonne manquante ou mal nommée

---

## ⚡ SOLUTION RAPIDE (5 minutes)

### Étape 1 : Diagnostic (2 min)

1. **Ouvrez** Supabase Dashboard : https://supabase.com/dashboard
2. **Projet** : Gemou2
3. **Menu** : SQL Editor → New Query
4. **Copiez-collez** le contenu de :
   ```
   DEBUG_MARKETPLACE_INSERT.sql
   ```
5. **Exécutez** (Run)

**Attendez les résultats** et lisez attentivement les messages.

---

### Étape 2 : Fix Selon le Diagnostic

#### Cas A : "❌ URGENT: Exécutez FIX_SELLER_ID.sql"

La colonne `seller_id` est manquante ou mal nommée.

**Solution** :
1. Dans SQL Editor → New Query
2. Copiez-collez le contenu de `FIX_SELLER_ID.sql`
3. Exécutez

**Résultat attendu** :
```
✅ SUCCÈS ! La colonne seller_id existe.
```

---

#### Cas B : "⚠️ Nombre de politiques RLS insuffisant"

Les politiques RLS ne sont pas correctes.

**Solution** :
1. Dans SQL Editor → New Query
2. Copiez-collez le code ci-dessous :

```sql
-- Nettoyer les anciennes politiques
DROP POLICY IF EXISTS "Marketplace items are viewable by everyone." ON marketplace_items;
DROP POLICY IF EXISTS "Authenticated users can create marketplace items." ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can update their own items." ON marketplace_items;
DROP POLICY IF EXISTS "Public can view published items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can view own items" ON marketplace_items;
DROP POLICY IF EXISTS "Authenticated users can create items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can update own items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can delete own items" ON marketplace_items;

-- Créer les nouvelles politiques
CREATE POLICY "Public can view published items" 
ON marketplace_items FOR SELECT 
USING (status = 'available');

CREATE POLICY "Sellers can view own items" 
ON marketplace_items FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create items" 
ON marketplace_items FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own items" 
ON marketplace_items FOR UPDATE 
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own items" 
ON marketplace_items FOR DELETE 
USING (auth.uid() = seller_id);
```

3. Exécutez

---

#### Cas C : Contraintes CHECK invalides

Les valeurs envoyées ne correspondent pas aux contraintes CHECK.

**Vérifiez dans le code** :

Le fichier `apps/web/app/create-trade/page.tsx` envoie :
- `status`: `'draft'` ou `'available'`
- `condition`: `'good'`, `'excellent'`, etc.
- `type`: `'sale'` ou `'exchange'`

**Problème possible** : Les valeurs `condition` ont changé entre les migrations.

**Solution** :

```sql
-- Mettre à jour les contraintes CHECK
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_condition_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_status_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_type_values;

-- Recréer avec les bonnes valeurs
ALTER TABLE marketplace_items 
ADD CONSTRAINT check_condition_values 
CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'worn'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT check_status_values 
CHECK (status IN ('draft', 'available', 'sold', 'exchanged', 'closed', 'reserved'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT check_type_values 
CHECK (type IN ('sale', 'exchange', 'donation'));
```

---

### Étape 3 : Test (1 min)

1. **Retournez** sur `/create-trade`
2. **Rechargez** la page (F5)
3. **Remplissez** le formulaire :
   - Type : Vente
   - Titre : "Test Debug"
   - Jeu : (sélectionnez un jeu)
   - État : "Bon état"
   - Prix : 10
4. **Cliquez** "Publier"

**Résultat attendu** :
- ✅ Pas d'erreur console
- ✅ Redirection vers `/trade/:id`
- ✅ Annonce créée

---

## 🔍 Vérification Manuelle

Si le problème persiste, testez une insertion manuelle :

```sql
-- Remplacez YOUR_USER_ID par votre ID utilisateur
-- Récupérez-le avec : SELECT id FROM auth.users LIMIT 1;

INSERT INTO marketplace_items (
  seller_id,
  title,
  description,
  type,
  condition,
  status,
  price
) VALUES (
  'YOUR_USER_ID',  -- ← Remplacez ici
  'Test Manuel',
  'Annonce de test',
  'sale',
  'good',
  'available',
  25.00
) RETURNING *;
```

**Si ça fonctionne** : Le problème vient du code frontend
**Si ça échoue** : Le problème vient de la BDD (contraintes/RLS)

---

## 🐛 Debug Console

Pour voir l'erreur exacte, modifiez temporairement le code :

**Fichier** : `apps/web/app/create-trade/page.tsx`

**Ligne 129**, remplacez :
```typescript
console.error('Error creating trade:', error);
```

Par :
```typescript
console.error('Error creating trade:', JSON.stringify(error, null, 2));
console.error('Full error object:', error);
```

Puis testez à nouveau et partagez l'erreur complète.

---

## 📋 Checklist

Après avoir appliqué les fixes :

- [ ] ✅ Script `DEBUG_MARKETPLACE_INSERT.sql` exécuté
- [ ] ✅ Diagnostic lu et compris
- [ ] ✅ Fix approprié appliqué (A, B ou C)
- [ ] ✅ Politiques RLS configurées (4 ou 5 politiques)
- [ ] ✅ Colonne `seller_id` existe
- [ ] ✅ Contraintes CHECK à jour
- [ ] ✅ Test d'insertion manuel réussi
- [ ] ✅ Test depuis l'app réussi

---

## 🎯 Fix Complet (Si Tout le Reste Échoue)

Si aucune solution ci-dessus ne fonctionne, exécutez ce script complet :

```sql
-- =====================================================
-- FIX COMPLET MARKETPLACE_ITEMS
-- =====================================================

-- 1. Vérifier/Créer seller_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'seller_id'
    ) THEN
        -- Si user_id existe, le renommer
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'marketplace_items' 
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE marketplace_items RENAME COLUMN user_id TO seller_id;
        ELSE
            -- Sinon, créer la colonne
            ALTER TABLE marketplace_items 
            ADD COLUMN seller_id UUID REFERENCES auth.users(id);
        END IF;
    END IF;
END $$;

-- 2. Nettoyer TOUTES les anciennes politiques
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'marketplace_items'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON marketplace_items', policy_record.policyname);
    END LOOP;
END $$;

-- 3. Créer les nouvelles politiques
CREATE POLICY "Public can view published items" 
ON marketplace_items FOR SELECT 
USING (status IN ('available', 'sold', 'exchanged', 'reserved'));

CREATE POLICY "Sellers can view own items" 
ON marketplace_items FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create items" 
ON marketplace_items FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own items" 
ON marketplace_items FOR UPDATE 
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own items" 
ON marketplace_items FOR DELETE 
USING (auth.uid() = seller_id);

-- 4. Mettre à jour les contraintes
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_condition_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_status_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_type_values;

ALTER TABLE marketplace_items 
ADD CONSTRAINT check_condition_values 
CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'worn'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT check_status_values 
CHECK (status IN ('draft', 'available', 'sold', 'exchanged', 'closed', 'reserved'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT check_type_values 
CHECK (type IN ('sale', 'exchange', 'donation'));

-- 5. Vérification finale
SELECT 
    'seller_id exists' as check_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'seller_id'
    ) as status
UNION ALL
SELECT 
    'RLS policies count' as check_name,
    (SELECT COUNT(*)::boolean FROM pg_policies WHERE tablename = 'marketplace_items') as status;

RAISE NOTICE '✅ Fix complet terminé !';
```

---

## 💬 Besoin d'Aide ?

Si le problème persiste après tous ces fixes :

1. **Exécutez** `DEBUG_MARKETPLACE_INSERT.sql`
2. **Copiez** tous les résultats
3. **Modifiez** le code pour afficher l'erreur complète
4. **Partagez** :
   - Les résultats du diagnostic
   - L'erreur console complète
   - Les logs Supabase (Dashboard → Logs → Postgres)

---

**Temps total estimé** : 5 minutes ⏱️


