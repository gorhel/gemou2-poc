# 🚨 ACTION IMMÉDIATE - Fix Marketplace

## ❌ Erreur Actuelle

```
Error creating trade: violates check constraint "marketplace_items_condition_check"
```

---

## ✅ SOLUTION (1 minute)

### Ouvrez Supabase & Exécutez Ce Script

1. **Allez sur** : https://supabase.com/dashboard
2. **Projet** : Gemou2
3. **SQL Editor** → **New Query**
4. **Copiez-collez** ce script complet :

```sql
-- =====================================================
-- FIX COMPLET MARKETPLACE - Version Finale
-- =====================================================

-- PARTIE 1 : STORAGE (Upload Images)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own marketplace images" ON storage.objects;

CREATE POLICY "Authenticated users can upload marketplace images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'marketplace-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view marketplace images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'marketplace-images');

CREATE POLICY "Users can update own marketplace images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own marketplace images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'marketplace-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- PARTIE 2 : DATABASE (Création Annonces)
-- =====================================================

-- Fix seller_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' AND column_name = 'seller_id'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'marketplace_items' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE marketplace_items RENAME COLUMN user_id TO seller_id;
        ELSE
            ALTER TABLE marketplace_items ADD COLUMN seller_id UUID REFERENCES auth.users(id);
        END IF;
    END IF;
END $$;

-- Nettoyer les anciennes politiques
DO $$
DECLARE policy_record RECORD;
BEGIN
    FOR policy_record IN (SELECT policyname FROM pg_policies WHERE tablename = 'marketplace_items') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON marketplace_items', policy_record.policyname);
    END LOOP;
END $$;

-- Créer les politiques RLS
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

-- FIX CONTRAINTES CHECK (IMPORTANT !)
-- =====================================================

ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_condition_check;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_condition_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_status_check;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_status_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_type_check;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_type_values;

-- Accepter TOUTES les valeurs possibles
ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_condition_check 
CHECK (condition IN ('new', 'like_new', 'excellent', 'good', 'fair', 'worn', 'poor'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_status_check 
CHECK (status IN ('draft', 'available', 'sold', 'exchanged', 'closed', 'reserved'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_type_check 
CHECK (type IN ('sale', 'exchange', 'donation'));

-- VÉRIFICATION
-- =====================================================

DO $$
DECLARE
    storage_bucket_exists BOOLEAN;
    storage_policies_count INTEGER;
    db_seller_id_exists BOOLEAN;
    db_policies_count INTEGER;
    check_constraints_count INTEGER;
BEGIN
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'marketplace-images') INTO storage_bucket_exists;
    SELECT COUNT(*) INTO storage_policies_count FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%marketplace images%';
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketplace_items' AND column_name = 'seller_id') INTO db_seller_id_exists;
    SELECT COUNT(*) INTO db_policies_count FROM pg_policies WHERE tablename = 'marketplace_items';
    SELECT COUNT(*) INTO check_constraints_count FROM pg_constraint con JOIN pg_class rel ON rel.oid = con.conrelid WHERE rel.relname = 'marketplace_items' AND con.contype = 'c' AND con.conname LIKE 'marketplace_items_%_check';
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✅ FIX COMPLET MARKETPLACE - TERMINÉ';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'STORAGE:';
    RAISE NOTICE '  Bucket créé: %', storage_bucket_exists;
    RAISE NOTICE '  Politiques RLS: %/4', storage_policies_count;
    RAISE NOTICE '';
    RAISE NOTICE 'DATABASE:';
    RAISE NOTICE '  Colonne seller_id: %', db_seller_id_exists;
    RAISE NOTICE '  Politiques RLS: %/5', db_policies_count;
    RAISE NOTICE '  Contraintes CHECK: %/3', check_constraints_count;
    RAISE NOTICE '';
    
    IF storage_bucket_exists AND storage_policies_count = 4 AND db_seller_id_exists AND db_policies_count >= 5 AND check_constraints_count = 3 THEN
        RAISE NOTICE '🎉 SUCCESS! Tout est configuré correctement.';
        RAISE NOTICE '';
        RAISE NOTICE '📝 Testez maintenant:';
        RAISE NOTICE '  1. Allez sur /create-trade';
        RAISE NOTICE '  2. Remplissez le formulaire';
        RAISE NOTICE '  3. Uploadez une image';
        RAISE NOTICE '  4. Publiez l''annonce';
        RAISE NOTICE '  ✅ Ça doit fonctionner !';
    ELSE
        RAISE WARNING '⚠️ Configuration incomplète:';
        IF NOT storage_bucket_exists THEN RAISE WARNING '  - Bucket Storage manquant'; END IF;
        IF storage_policies_count <> 4 THEN RAISE WARNING '  - Politiques Storage: % au lieu de 4', storage_policies_count; END IF;
        IF NOT db_seller_id_exists THEN RAISE WARNING '  - Colonne seller_id manquante'; END IF;
        IF db_policies_count < 5 THEN RAISE WARNING '  - Politiques RLS: % au lieu de 5+', db_policies_count; END IF;
        IF check_constraints_count <> 3 THEN RAISE WARNING '  - Contraintes CHECK: % au lieu de 3', check_constraints_count; END IF;
    END IF;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
END $$;
```

5. **Exécutez** (Run / Ctrl+Enter)

---

## ✅ Résultat Attendu

Vous devriez voir :

```
✅ FIX COMPLET MARKETPLACE - TERMINÉ
===========================================

STORAGE:
  Bucket créé: true
  Politiques RLS: 4/4

DATABASE:
  Colonne seller_id: true
  Politiques RLS: 5/5
  Contraintes CHECK: 3/3

🎉 SUCCESS! Tout est configuré correctement.

📝 Testez maintenant:
  1. Allez sur /create-trade
  2. Remplissez le formulaire
  3. Uploadez une image
  4. Publiez l'annonce
  ✅ Ça doit fonctionner !
```

---

## ✅ Test Immédiat

1. **Ouvrez** : `/create-trade`
2. **Remplissez** :
   - Type : Vente
   - Titre : "Test Final"
   - Jeu : (sélectionnez un jeu)
   - État : "Bon état"
   - Prix : 15
3. **Uploadez** une image
4. **Cliquez** "Publier"

**Résultat** : ✅ Annonce créée et affichée avec l'image !

---

## 📋 Ce Qui a Été Corrigé

### 1. Upload Images ✅
- Bucket `marketplace-images` créé
- 4 politiques RLS Storage configurées
- Organisation par userId

### 2. Création Annonces ✅
- Colonne `seller_id` vérifiée/créée
- 5 politiques RLS configurées
- **Contraintes CHECK corrigées** (c'était l'erreur !)

### 3. Contraintes CHECK ✅

| Champ | Valeurs Acceptées |
|-------|-------------------|
| `condition` | new, like_new, excellent, good, fair, worn, poor |
| `status` | draft, available, sold, exchanged, closed, reserved |
| `type` | sale, exchange, donation |

---

## 🆘 Si Ça Ne Fonctionne Toujours Pas

1. **Ouvrez** la console navigateur (F12)
2. **Reproduisez** l'erreur
3. **Copiez** le message d'erreur **complet**
4. **Vérifiez** que le script s'est exécuté sans erreur dans Supabase

---

## 📚 Documentation Complète

Pour plus de détails :

| Fichier | Description |
|---------|-------------|
| [ACTION_IMMEDIATE.md](ACTION_IMMEDIATE.md) | Ce fichier - Fix rapide |
| [FIX_CONDITION_CHECK_ERROR.md](FIX_CONDITION_CHECK_ERROR.md) | Fix spécifique contrainte CHECK |
| [START_HERE_MARKETPLACE_FIX.md](START_HERE_MARKETPLACE_FIX.md) | Guide complet 3 étapes |
| [FIX_INSERT_MARKETPLACE.md](FIX_INSERT_MARKETPLACE.md) | Diagnostic + Fix insertion |

---

**Temps total : 1 minute ⏱️**

**Après ce script, TOUT devrait fonctionner ! 🎉**





