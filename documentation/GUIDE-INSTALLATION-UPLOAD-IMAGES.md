# 📸 Guide rapide : Installation upload d'images

## 🎯 Ce qui a été fait

L'upload d'images est maintenant **entièrement implémenté** dans le create-trade mobile :
- ✅ Sélection depuis la galerie (multiple)
- ✅ Prise de photo avec la caméra
- ✅ Preview des images
- ✅ Suppression d'images
- ✅ Upload vers Supabase Storage
- ✅ Limite de 5 images max

## 🚀 Installation en 3 étapes

### Étape 1 : Installer la dépendance (2 min)

```bash
cd apps/mobile
npm install expo-image-picker
```

ou

```bash
npx expo install expo-image-picker
```

### Étape 2 : Configurer Supabase Storage (5 min)

#### A. Créer le bucket

1. Ouvrir **Supabase Dashboard**
2. Aller dans **Storage**
3. Cliquer sur **New Bucket**
4. Nom : `marketplace-images`
5. Public : **✓ Coché**
6. Créer

#### B. Configurer les permissions (RLS)

Aller dans **Storage** > **Policies** > **New Policy** et exécuter :

```sql
-- Lecture publique
CREATE POLICY "Public can view marketplace images"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-images');

-- Upload pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload marketplace images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Suppression de ses propres images
CREATE POLICY "Users can delete their own marketplace images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'marketplace-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Étape 3 : Tester (2 min)

```bash
# Relancer l'app
cd apps/mobile
npm start
```

1. Ouvrir l'app mobile
2. Aller sur `/create-trade`
3. Cliquer sur "📷 Galerie" ou "📸 Photo"
4. Sélectionner/Prendre des photos
5. Vérifier le preview
6. Publier l'annonce
7. Vérifier l'affichage sur `/marketplace`

## ✅ Checklist de vérification

- [ ] `expo-image-picker` installé
- [ ] Bucket `marketplace-images` créé
- [ ] Bucket configuré en public
- [ ] 3 policies RLS ajoutées
- [ ] App relancée avec `npm start`
- [ ] Boutons 📷 et 📸 visibles
- [ ] Sélection galerie fonctionne
- [ ] Prise de photo fonctionne
- [ ] Preview affiche les images
- [ ] Bouton ✕ supprime les images
- [ ] Limite 5 images respectée
- [ ] Upload vers Supabase réussi
- [ ] Images visibles sur marketplace

## 🎨 À quoi ça ressemble

```
┌─────────────────────────────────────────┐
│ Photos (2/5)                            │
│                                         │
│ ┌────┐ ┌────┐                           │
│ │IMG1│ │IMG2│  ← Scroll horizontal     │
│ │ ✕ │ │ ✕ │                           │
│ └────┘ └────┘                           │
│                                         │
│ ┌──────────────┐ ┌──────────────┐      │
│ │📷  Galerie   │ │📸  Photo     │      │
│ └──────────────┘ └──────────────┘      │
│                                         │
│ Ajoutez jusqu'à 5 photos...            │
└─────────────────────────────────────────┘
```

## 🐛 En cas de problème

### Problème 1 : "expo-image-picker not found"
```bash
# Réinstaller
npm install
# ou
npm install expo-image-picker
```

### Problème 2 : "Permission denied" lors de l'upload
- Vérifier que le bucket existe
- Vérifier que les 3 policies sont créées
- Vérifier que l'utilisateur est authentifié

### Problème 3 : Images ne s'affichent pas
- Vérifier que le bucket est **public**
- Vérifier la policy "Public can view"
- Vérifier l'URL dans la BDD

### Problème 4 : Permissions caméra/galerie
- Sur iOS/Android: Accepter les permissions quand demandées
- Si refusé : Aller dans Paramètres > App > Permissions

## 📚 Documentation complète

Pour plus de détails, voir :
- `2025-10-27-upload-images-mobile-implementation.md`

## 💡 Notes

- Les images sont compressées à 80% automatiquement
- Maximum 5 images par annonce
- Format supporté : tous les formats image
- Taille recommandée : < 5 MB par image
- Les images sont stockées dans : `{userId}/{timestamp}_{random}.{ext}`

---

**Installation estimée** : 10 minutes  
**Prêt à tester !** 🚀

