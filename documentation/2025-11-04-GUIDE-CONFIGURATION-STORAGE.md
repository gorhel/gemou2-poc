# 🚀 Guide de configuration des buckets Storage Supabase

**Date** : 4 novembre 2025  
**Temps estimé** : 2 minutes

---

## 📋 Ce que vous allez créer

Deux buckets de stockage pour les images :
- **event-images** : Images d'événements (max 5MB)
- **marketplace-images** : Images d'annonces (max 10MB)

---

## ✅ Instructions étape par étape

### 1. Ouvrir le Supabase Dashboard

👉 Allez sur : https://supabase.com/dashboard

### 2. Sélectionner votre projet

- Connectez-vous avec votre compte
- Sélectionnez le projet : **Gemou2** (ou votre projet)

### 3. Ouvrir le SQL Editor

Dans le menu de gauche :
- Cliquez sur **"SQL Editor"** (icône 📝)
- Cliquez sur **"New Query"** (en haut à droite)

### 4. Copier-coller le script

1. Ouvrez le fichier : `documentation/2025-11-04-setup-storage-buckets.sql`
2. Copiez **TOUT le contenu** du fichier (Ctrl+A, Ctrl+C)
3. Collez dans l'éditeur SQL de Supabase (Ctrl+V)

### 5. Exécuter le script

- Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)
- Attendez quelques secondes...

### 6. Vérifier le résultat

Vous devriez voir dans les logs (en bas) :

```
===========================================
✅ Configuration des Buckets Storage
===========================================

📦 EVENT-IMAGES:
   Bucket créé: true
   Politiques RLS: 3 (attendu: 3)

📦 MARKETPLACE-IMAGES:
   Bucket créé: true
   Politiques RLS: 4 (attendu: 4)

🎉 SUCCESS! Les deux buckets sont configurés correctement.

📋 Résumé de la configuration:

1️⃣  EVENT-IMAGES:
   - Taille max: 5MB
   - Formats: JPEG, PNG, GIF, WebP
   - Public: Oui (lecture seule)
   - Upload: Authentifiés uniquement
   - Organisation: {userId}/filename.ext

2️⃣  MARKETPLACE-IMAGES:
   - Taille max: 10MB
   - Formats: JPEG, JPG, PNG, GIF, WebP
   - Public: Oui (lecture seule)
   - Upload: Authentifiés uniquement
   - Organisation: {userId}/filename.ext

✅ Vous pouvez maintenant uploader des images!
===========================================
```

### 7. Vérifier dans l'interface (optionnel)

1. Dans le menu de gauche, cliquez sur **"Storage"**
2. Vous devriez voir les deux buckets :
   - ✅ **event-images**
   - ✅ **marketplace-images**

---

## ❓ En cas de problème

### Erreur : "bucket already exists"

✅ **C'est normal !** Le script utilise `ON CONFLICT DO NOTHING`, donc il ne créera pas de doublon.

### Erreur : "policy already exists"

✅ **C'est normal !** Le script supprime d'abord les anciennes politiques avant de les recréer.

### Erreur : "permission denied"

❌ **Vérifiez** que vous êtes bien connecté en tant qu'administrateur du projet.

### Les buckets ne s'affichent pas

1. Actualisez la page (F5)
2. Cliquez sur "Storage" dans le menu
3. Si toujours rien, relancez le script SQL

---

## 🧪 Tester la configuration

### Test 1 : Vérifier les buckets

```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('event-images', 'marketplace-images');
```

**Résultat attendu** : 2 lignes

### Test 2 : Vérifier les politiques

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname LIKE '%event images%' OR policyname LIKE '%marketplace images%')
ORDER BY policyname;
```

**Résultat attendu** : 7 lignes (3 pour event-images, 4 pour marketplace-images)

---

## ✅ Prochaines étapes

Une fois les buckets créés, vous pouvez :

1. **Tester l'app mobile** : Créer un événement avec photo
2. **Tester l'app mobile** : Créer une annonce avec plusieurs photos
3. **Vérifier dans Storage** : Les images uploadées apparaissent dans les buckets

---

## 📊 Récapitulatif de la sécurité

### Politiques RLS configurées

**Pour tous les buckets** :
- ✅ **Lecture** : Public (tout le monde peut voir les images)
- ✅ **Upload** : Authentifié uniquement
- ✅ **Suppression** : Propriétaire uniquement (organisation par userId)

**Organisation des fichiers** :
```
event-images/
  └── {user_id}/
      └── 1699123456_abc123.jpg

marketplace-images/
  └── {user_id}/
      └── 1699123456_def456.png
      └── 1699123457_ghi789.jpg
```

**Sécurité RLS** :
- Chaque utilisateur peut uniquement supprimer ses propres images
- La vérification se fait via : `auth.uid()::text = (storage.foldername(name))[1]`

---

## 🎉 Félicitations !

Vos buckets Storage sont maintenant configurés et prêts à l'emploi !

**Ce qui fonctionne maintenant** :
- ✅ Upload d'images d'événements (max 5MB)
- ✅ Upload d'images d'annonces (max 10MB)
- ✅ Politiques RLS sécurisées
- ✅ Organisation par utilisateur
- ✅ Lecture publique des images

---

**Besoin d'aide ?** Consultez :
- `documentation/2025-11-04-upload-images-mobile-implementation.md` : Documentation complète
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)






