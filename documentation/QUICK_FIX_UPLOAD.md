# ⚡ FIX RAPIDE - Upload Images Marketplace

## 🎯 Action Immédiate (2 minutes)

### 1. Ouvrez Supabase Dashboard

👉 https://supabase.com/dashboard → Projet **Gemou2**

### 2. SQL Editor

1. Cliquez sur **SQL Editor** dans le menu
2. Cliquez sur **New Query**
3. Copiez-collez le code ci-dessous :

```sql
-- Créer le bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Politique INSERT (Upload)
CREATE POLICY "Authenticated users can upload marketplace images" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'marketplace-images' 
  AND auth.role() = 'authenticated'
);

-- Politique SELECT (Lecture)
CREATE POLICY "Anyone can view marketplace images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'marketplace-images');

-- Politique UPDATE
CREATE POLICY "Users can update own marketplace images" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique DELETE
CREATE POLICY "Users can delete own marketplace images" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

4. Cliquez sur **Run** (ou `Ctrl+Enter`)

### 3. Testez !

1. Ouvrez `/create-trade` dans votre app
2. Uploadez une image
3. ✅ Ça fonctionne !

---

## ✅ Résultat

- ✅ Bucket `marketplace-images` créé
- ✅ 4 politiques RLS configurées
- ✅ Upload d'images fonctionnel

---

## 🔍 Vérification Rapide

### Bucket Créé ?

```sql
SELECT * FROM storage.buckets WHERE id = 'marketplace-images';
```

Résultat attendu : 1 ligne

### Politiques Créées ?

```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%marketplace images%';
```

Résultat attendu : 4 lignes

---

## 💬 Toujours Bloqué ?

Consultez : `FIX_STORAGE_RLS.md` pour plus de détails


