# 🚀 COMMENCEZ ICI - Fix Complet Marketplace

## 🎯 Vue d'Ensemble

Vous avez **2 problèmes** à résoudre pour le marketplace :

| # | Problème | Statut | Temps |
|---|----------|--------|-------|
| 1 | Upload d'images (RLS Storage) | 🔧 À corriger | 3 min |
| 2 | Création d'annonces (RLS Database) | 🔧 À corriger | 5 min |

**Temps total** : ~8 minutes

---

## 📋 Plan d'Action

### ✅ Étape 1 : Fix Upload Images (3 min)

**Problème** :
```
StorageApiError: new row violates row-level security policy
```

**Solution** :

1. **Ouvrez** : https://supabase.com/dashboard → Projet Gemou2
2. **Menu** : SQL Editor → New Query
3. **Copiez-collez** le contenu ENTIER de :
   ```
   supabase/migrations/20251021120000_setup_marketplace_images_storage.sql
   ```
4. **Exécutez** (Run)

**Résultat attendu** :
```
✅ Configuration du Storage Marketplace
🎉 SUCCESS! Le storage marketplace est prêt.
```

**📖 Guide détaillé** : [`QUICK_FIX_UPLOAD.md`](QUICK_FIX_UPLOAD.md)

---

### ✅ Étape 2 : Fix Création d'Annonces (5 min)

**Problème** :
```
Error creating trade: {}
```

#### A. Diagnostic (2 min)

1. Dans SQL Editor → New Query
2. **Copiez-collez** le contenu de :
   ```
   DEBUG_MARKETPLACE_INSERT.sql
   ```
3. **Exécutez** et **lisez** attentivement les résultats

#### B. Application du Fix (3 min)

Selon les résultats du diagnostic, appliquez le fix approprié :

**Option 1 : Fix Complet (Recommandé)**

Si vous voulez tout corriger en une fois :

1. SQL Editor → New Query
2. Copiez le script du fichier [`FIX_INSERT_MARKETPLACE.md`](FIX_INSERT_MARKETPLACE.md) (section "Fix Complet")
3. Exécutez

**Option 2 : Fix Ciblé**

Suivez les instructions dans [`FIX_INSERT_MARKETPLACE.md`](FIX_INSERT_MARKETPLACE.md) selon votre diagnostic.

---

### ✅ Étape 3 : Test Final (2 min)

1. **Ouvrez** : `/create-trade`
2. **Remplissez** le formulaire :
   - Type : Vente
   - Titre : "Test Final"
   - Jeu : (sélectionnez un jeu)
   - État : "Bon état"
   - Description : "Test de fonctionnement"
   - Prix : 15
3. **Uploadez** une image (pour tester le Storage)
4. **Cliquez** "Publier"

**Résultat attendu** :
- ✅ Image uploadée sans erreur
- ✅ Pas d'erreur console
- ✅ Redirection vers `/trade/:id`
- ✅ Annonce affichée avec l'image

---

## 🗺️ Navigation Rapide

### 📚 Documentation Créée

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **[START_HERE_MARKETPLACE_FIX.md](START_HERE_MARKETPLACE_FIX.md)** | 🎯 **Ce fichier** - Point d'entrée | Commencez ici ! |
| [QUICK_FIX_UPLOAD.md](QUICK_FIX_UPLOAD.md) | ⚡ Fix rapide upload images | Erreur Storage RLS |
| [FIX_INSERT_MARKETPLACE.md](FIX_INSERT_MARKETPLACE.md) | 🔧 Fix création annonces | Erreur insertion BDD |
| [DEBUG_MARKETPLACE_INSERT.sql](DEBUG_MARKETPLACE_INSERT.sql) | 🔍 Script de diagnostic | Pour identifier le problème |
| [README_FIX_STORAGE.md](README_FIX_STORAGE.md) | 📖 Guide complet Storage | Comprendre le Storage |
| [FAQ_STORAGE.md](FAQ_STORAGE.md) | ❓ Questions fréquentes | Questions spécifiques |
| [INDEX_DOCUMENTATION_STORAGE.md](INDEX_DOCUMENTATION_STORAGE.md) | 📚 Index complet | Navigation |

---

## 🎬 Script Complet (Copy-Paste)

Si vous voulez tout corriger en **UNE SEULE FOIS**, voici le script complet :

### Dans Supabase SQL Editor → New Query

```sql
-- =====================================================
-- FIX COMPLET MARKETPLACE - Storage + Database
-- =====================================================
-- Temps d'exécution : ~30 secondes
-- =====================================================

-- =====================================================
-- PARTIE 1 : FIX STORAGE (Upload Images)
-- =====================================================

-- Créer le bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Nettoyer les anciennes politiques Storage
DROP POLICY IF EXISTS "Authenticated users can upload marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own marketplace images" ON storage.objects;

-- Créer les politiques Storage
CREATE POLICY "Authenticated users can upload marketplace images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'marketplace-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view marketplace images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'marketplace-images');

CREATE POLICY "Users can update own marketplace images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own marketplace images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- PARTIE 2 : FIX DATABASE (Création Annonces)
-- =====================================================

-- Vérifier/Créer seller_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'seller_id'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'marketplace_items' 
            AND column_name = 'user_id'
        ) THEN
            ALTER TABLE marketplace_items RENAME COLUMN user_id TO seller_id;
        ELSE
            ALTER TABLE marketplace_items 
            ADD COLUMN seller_id UUID REFERENCES auth.users(id);
        END IF;
    END IF;
END $$;

-- Nettoyer TOUTES les anciennes politiques marketplace_items
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

-- Créer les nouvelles politiques marketplace_items
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

-- Mettre à jour les contraintes CHECK
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_condition_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_status_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_type_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_condition_check;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_status_check;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_type_check;

-- IMPORTANT : Inclure TOUTES les valeurs possibles pour éviter les erreurs
ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_condition_check 
CHECK (condition IN ('new', 'like_new', 'excellent', 'good', 'fair', 'worn', 'poor'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_status_check 
CHECK (status IN ('draft', 'available', 'sold', 'exchanged', 'closed', 'reserved'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_type_check 
CHECK (type IN ('sale', 'exchange', 'donation'));

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================

DO $$
DECLARE
    storage_bucket_exists BOOLEAN;
    storage_policies_count INTEGER;
    db_seller_id_exists BOOLEAN;
    db_policies_count INTEGER;
BEGIN
    -- Vérifier Storage
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'marketplace-images'
    ) INTO storage_bucket_exists;
    
    SELECT COUNT(*) INTO storage_policies_count
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname LIKE '%marketplace images%';
    
    -- Vérifier Database
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'seller_id'
    ) INTO db_seller_id_exists;
    
    SELECT COUNT(*) INTO db_policies_count
    FROM pg_policies
    WHERE tablename = 'marketplace_items';
    
    -- Afficher les résultats
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✅ FIX COMPLET MARKETPLACE';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'STORAGE:';
    RAISE NOTICE '  Bucket créé: %', storage_bucket_exists;
    RAISE NOTICE '  Politiques RLS: %/4', storage_policies_count;
    RAISE NOTICE '';
    RAISE NOTICE 'DATABASE:';
    RAISE NOTICE '  Colonne seller_id: %', db_seller_id_exists;
    RAISE NOTICE '  Politiques RLS: %/5', db_policies_count;
    RAISE NOTICE '';
    
    IF storage_bucket_exists AND storage_policies_count = 4 
       AND db_seller_id_exists AND db_policies_count >= 5 THEN
        RAISE NOTICE '🎉 SUCCESS! Tout est configuré correctement.';
        RAISE NOTICE '';
        RAISE NOTICE '📝 Prochaines étapes:';
        RAISE NOTICE '  1. Testez l''upload d''images sur /create-trade';
        RAISE NOTICE '  2. Créez une annonce de test';
        RAISE NOTICE '  3. Vérifiez que tout fonctionne';
    ELSE
        RAISE WARNING '⚠️ Configuration incomplète. Vérifiez les logs ci-dessus.';
    END IF;
    
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
END $$;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
```

**Copiez-collez ce script complet → Exécutez → Testez !**

---

## 📊 Checklist Complète

### Configuration Supabase

- [ ] ✅ Bucket `marketplace-images` créé
- [ ] ✅ 4 politiques RLS Storage actives
- [ ] ✅ Colonne `seller_id` existe
- [ ] ✅ 5 politiques RLS marketplace_items actives
- [ ] ✅ Contraintes CHECK à jour

### Tests

- [ ] ✅ Upload d'image fonctionne
- [ ] ✅ Prévisualisation d'image affichée
- [ ] ✅ Création d'annonce fonctionne
- [ ] ✅ Pas d'erreur console
- [ ] ✅ Redirection vers annonce créée
- [ ] ✅ Annonce visible avec image

---

## 🆘 En Cas de Problème

### Si le Storage ne fonctionne toujours pas

➡️ Consultez : [`QUICK_FIX_UPLOAD.md`](QUICK_FIX_UPLOAD.md)

### Si la création d'annonce échoue toujours

➡️ Consultez : [`FIX_INSERT_MARKETPLACE.md`](FIX_INSERT_MARKETPLACE.md)

### Pour diagnostiquer

1. Exécutez `DEBUG_MARKETPLACE_INSERT.sql`
2. Lisez les résultats
3. Suivez les recommandations

---

## 🎯 Résultat Final Attendu

Après avoir suivi ce guide :

- ✅ Vous pouvez créer une annonce
- ✅ Vous pouvez uploader des images
- ✅ Les images sont visibles
- ✅ Les annonces apparaissent sur le marketplace
- ✅ Pas d'erreur dans la console

**Temps total** : 8-10 minutes ⏱️

---

**Commencez maintenant ! Suivez les étapes dans l'ordre. Bonne chance ! 🚀**

