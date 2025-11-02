# 🌐 Guide Migration - Supabase Cloud

## 📋 ÉTAPES POUR APPLIQUER LA MIGRATION

### ✅ **ÉTAPE 1 : Appliquer le SQL**

#### Option A : Via le Dashboard (Recommandé ✨)

1. **Ouvrez votre Dashboard Supabase**
   - URL : https://supabase.com/dashboard
   - Connectez-vous
   - Sélectionnez votre projet

2. **Allez dans SQL Editor**
   - Menu de gauche → **SQL Editor**
   - Cliquez sur **New Query**

3. **Copiez le fichier SQL**
   - Ouvrez : `supabase/migrations/20251009120000_add_marketplace_trade_features.sql`
   - Sélectionnez tout le contenu (Cmd+A)
   - Copiez (Cmd+C)

4. **Collez et exécutez**
   - Collez dans l'éditeur SQL (Cmd+V)
   - Cliquez sur **Run** (ou appuyez sur Ctrl+Enter / Cmd+Enter)

5. **Vérifiez le résultat**
   - ✅ Devrait afficher "Success" en vert
   - ❌ Si erreur, lisez le message et corrigez

#### Option B : Via CLI Supabase (si configuré)

```bash
# Vérifiez que vous êtes lié à votre projet cloud
supabase link

# Appliquez la migration
supabase db push
```

---

### ✅ **ÉTAPE 2 : Créer le Bucket Storage**

1. **Allez dans Storage**
   - Menu de gauche → **Storage**

2. **Créez un nouveau bucket**
   - Cliquez sur **New bucket**
   - Nom : `marketplace-images`
   - Public : ✅ **Coché** (pour que les images soient accessibles publiquement)
   - Cliquez sur **Create bucket**

3. **Configurez les policies (si bucket privé)**
   
   Si vous préférez un bucket privé avec policies :
   
   ```sql
   -- Policy pour upload (utilisateurs authentifiés)
   CREATE POLICY "Authenticated users can upload marketplace images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'marketplace-images');

   -- Policy pour lecture publique
   CREATE POLICY "Anyone can view marketplace images"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'marketplace-images');

   -- Policy pour suppression (propriétaires)
   CREATE POLICY "Users can delete own marketplace images"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

---

### ✅ **ÉTAPE 3 : Vérifier la Migration**

#### Test 1 : Vérifier les colonnes

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'marketplace_items'
ORDER BY ordinal_position;
```

Vous devriez voir les nouvelles colonnes :
- `game_id`
- `custom_game_name`
- `wanted_game`
- `delivery_available`
- `location_quarter`
- `location_city`

#### Test 2 : Vérifier la vue

```sql
SELECT * FROM marketplace_items_enriched LIMIT 1;
```

#### Test 3 : Vérifier la fonction

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'create_marketplace_conversation';
```

#### Test 4 : Tester une insertion

```sql
-- Test insertion vente (devrait réussir)
INSERT INTO marketplace_items (
  title,
  custom_game_name,
  condition,
  type,
  price,
  location_city,
  delivery_available,
  seller_id,
  status
) VALUES (
  'Test Annonce',
  'Jeu Test',
  'good',
  'sale',
  20.00,
  'Saint-Denis',
  true,
  auth.uid(),
  'draft'
);

-- Test insertion vente sans prix (devrait ÉCHOUER)
INSERT INTO marketplace_items (
  title,
  custom_game_name,
  condition,
  type,
  location_city,
  seller_id,
  status
) VALUES (
  'Test Sans Prix',
  'Jeu Test',
  'good',
  'sale', -- Type vente
  'Saint-Denis',
  auth.uid(),
  'draft'
);
-- ❌ Erreur attendue: "check_sale_has_price"

-- Nettoyer le test
DELETE FROM marketplace_items WHERE title LIKE 'Test%';
```

---

### ✅ **ÉTAPE 4 : Vérifier les RLS Policies**

```sql
-- Lister toutes les policies sur marketplace_items
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'marketplace_items';
```

Vous devriez voir 5 policies :
1. ✅ `Public can view published items`
2. ✅ `Sellers can view own items`
3. ✅ `Authenticated users can create items`
4. ✅ `Sellers can update own items`
5. ✅ `Sellers can delete own items`

---

## ⚠️ EN CAS D'ERREUR

### Erreur : "relation marketplace_items already has..."

**Cause** : Une colonne existe déjà

**Solution** : La migration utilise `ADD COLUMN IF NOT EXISTS`, donc cette erreur ne devrait pas arriver. Si elle arrive, vérifiez que vous n'avez pas déjà appliqué la migration.

### Erreur : "constraint already exists"

**Cause** : Une contrainte existe déjà

**Solution** : La migration supprime les anciennes contraintes avant d'en créer de nouvelles. Si erreur, vérifiez les `DROP CONSTRAINT IF EXISTS`.

### Erreur : "permission denied"

**Cause** : Votre utilisateur n'a pas les droits

**Solution** : Utilisez un compte avec les droits d'administration sur Supabase Dashboard.

### Erreur lors du test d'insertion

**Cause** : Les contraintes fonctionnent !

**Solution** : C'est normal. Les contraintes empêchent les données invalides.

---

## 📊 TABLEAU DE BORD POST-MIGRATION

### Tables modifiées
- ✅ `marketplace_items` → 6 nouvelles colonnes
- ✅ `conversations` → 1 nouvelle colonne

### Objets créés
- ✅ Vue : `marketplace_items_enriched`
- ✅ Fonction : `create_marketplace_conversation()`
- ✅ Trigger : `on_marketplace_conversation_created`
- ✅ 8 index de performance
- ✅ 5 RLS policies

### Storage
- ✅ Bucket : `marketplace-images`

---

## 🔄 ROLLBACK (Annuler la Migration)

Si vous devez annuler la migration :

```sql
-- ATTENTION : Ceci supprimera toutes les données marketplace créées !

-- Supprimer les colonnes
ALTER TABLE marketplace_items 
  DROP COLUMN IF EXISTS game_id,
  DROP COLUMN IF EXISTS custom_game_name,
  DROP COLUMN IF EXISTS wanted_game,
  DROP COLUMN IF EXISTS delivery_available,
  DROP COLUMN IF EXISTS location_quarter,
  DROP COLUMN IF EXISTS location_city;

ALTER TABLE conversations 
  DROP COLUMN IF EXISTS marketplace_item_id;

-- Supprimer la vue
DROP VIEW IF EXISTS marketplace_items_enriched;

-- Supprimer la fonction et le trigger
DROP TRIGGER IF EXISTS on_marketplace_conversation_created ON conversations;
DROP FUNCTION IF EXISTS notify_seller_on_contact();
DROP FUNCTION IF EXISTS create_marketplace_conversation(UUID, UUID);

-- Supprimer les policies
DROP POLICY IF EXISTS "Public can view published items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can view own items" ON marketplace_items;
DROP POLICY IF EXISTS "Authenticated users can create items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can update own items" ON marketplace_items;
DROP POLICY IF EXISTS "Sellers can delete own items" ON marketplace_items;

-- Supprimer les index
DROP INDEX IF EXISTS idx_marketplace_items_seller_id;
DROP INDEX IF EXISTS idx_marketplace_items_game_id;
DROP INDEX IF EXISTS idx_marketplace_items_type;
DROP INDEX IF EXISTS idx_marketplace_items_status;
DROP INDEX IF EXISTS idx_marketplace_items_location_city;
DROP INDEX IF EXISTS idx_marketplace_items_created_at;
DROP INDEX IF EXISTS idx_marketplace_items_status_type;
DROP INDEX IF EXISTS idx_conversations_marketplace_item;
```

---

## ✅ CHECKLIST FINALE

- [ ] Migration SQL exécutée avec succès
- [ ] Aucune erreur dans l'exécution
- [ ] Nouvelles colonnes visibles dans `marketplace_items`
- [ ] Nouvelle colonne visible dans `conversations`
- [ ] Vue `marketplace_items_enriched` créée
- [ ] Fonction `create_marketplace_conversation` créée
- [ ] Trigger créé
- [ ] RLS policies actives (5 policies)
- [ ] Bucket `marketplace-images` créé
- [ ] Tests d'insertion validés
- [ ] Contraintes fonctionnelles

---

## 🎉 MIGRATION TERMINÉE !

Vous pouvez maintenant :
1. ✅ Créer la page `/create-trade`
2. ✅ Créer la page `/trade/:id`
3. ✅ Tester la création d'annonces

---

**Besoin d'aide ?** Consultez :
- `ACTIONS_A_FAIRE.md` - Guide d'implémentation
- `MARKETPLACE_MIGRATION_GUIDE.md` - Exemples de code
- `apps/web/types/marketplace.ts` - Types TypeScript

