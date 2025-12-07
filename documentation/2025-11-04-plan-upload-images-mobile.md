# Plan d'implémentation : Upload d'images sur mobile

**Date** : 4 novembre 2025  
**Objectif** : Ajouter la fonctionnalité d'upload d'images sur mobile pour les événements (1 image) et les annonces (plusieurs images)

---

## 🎯 Objectifs

1. **Événements** : Upload d'1 image lors de la création/édition
2. **Annonces** : Upload de plusieurs images (max 5) lors de la création/édition
3. **Stabilité** : Éviter tout conflit de dépendances React

---

## ✅ Prérequis vérifiés

- ✅ Buckets Supabase Storage configurés :
  - `event-images` (5MB max, migration 20250124000000)
  - `marketplace-images` (10MB max, migration 20251021120000)
- ✅ Politiques RLS configurées pour les deux buckets
- ✅ expo-image-picker NON installé (pas de conflit)
- ✅ React 19.2.0 partout (mobile + web)
- ✅ Expo SDK 54

---

## 📋 Étapes d'implémentation

### Phase 1 : Installation et configuration (Sécurisée)

#### 1.1 Installer expo-image-picker
```bash
cd apps/mobile
npm install expo-image-picker@~16.0.11
```

**Version** : `~16.0.11` (compatible Expo SDK 54)
**Risque conflit** : Aucun (version testée compatible React 19.2.0)

#### 1.2 Configurer app.config.js
Ajouter le plugin avec permissions :
```javascript
plugins: [
  "expo-router",
  [
    "expo-image-picker",
    {
      "photosPermission": "L'application accède à vos photos pour vous permettre de les ajouter à vos événements et annonces.",
      "cameraPermission": "L'application accède à votre caméra pour prendre des photos."
    }
  ]
]
```

#### 1.3 Vérifier l'installation
```bash
npm list expo-image-picker
npm list react react-dom
```

---

### Phase 2 : Implémentation pour les Événements (1 image)

#### 2.1 Modifier `apps/mobile/app/(tabs)/create-event.tsx`

**Ajouts nécessaires** :
- Import de `expo-image-picker` et `Image` de React Native
- État pour l'image : `const [imageUri, setImageUri] = useState<string | null>(null)`
- État pour l'upload : `const [uploadingImage, setUploadingImage] = useState(false)`
- Fonction `requestPermissions()`
- Fonction `pickImage()` (galerie)
- Fonction `takePhoto()` (caméra)
- Fonction `uploadImageToStorage()` (upload vers Supabase)
- Section UI pour sélectionner/afficher l'image
- Intégration dans `handleSubmit()`

**Structure UI** :
```
┌─────────────────────────────────────────┐
│ Photo de l'événement (optionnelle)      │
│                                         │
│ [Preview si image]                      │
│                                         │
│ [📷 Galerie] [📸 Photo] [✕ Supprimer]  │
└─────────────────────────────────────────┘
```

#### 2.2 Logique d'upload

```typescript
// Upload AVANT la création de l'événement
let imageUrl: string | null = null
if (imageUri) {
  imageUrl = await uploadImageToStorage(imageUri)
}

// Inclure dans l'insert
const { data, error } = await supabase
  .from('events')
  .insert({
    ...formData,
    image_url: imageUrl,
    creator_id: user.id
  })
```

---

### Phase 3 : Implémentation pour les Annonces (plusieurs images)

#### 3.1 Modifier `apps/mobile/app/(tabs)/create-trade.tsx`

**Ajouts nécessaires** :
- État pour les images : `const [images, setImages] = useState<string[]>([])`
- État pour l'upload : `const [uploadingImages, setUploadingImages] = useState(false)`
- Fonction `pickImages()` (sélection multiple)
- Fonction `takePhoto()` (caméra, ajout à la liste)
- Fonction `removeImage(index)` (supprimer une image)
- Fonction `uploadImagesToStorage()` (upload séquentiel)
- Section UI pour gérer plusieurs images
- Intégration dans `handleSubmit()`

**Structure UI** :
```
┌─────────────────────────────────────────┐
│ Photos (2/5)                            │
│                                         │
│ [IMG1] [IMG2]  ← Scroll horizontal     │
│  (✕)   (✕)                              │
│                                         │
│ [📷 Galerie] [📸 Photo]                │
│                                         │
│ Ajoutez jusqu'à 5 photos...            │
└─────────────────────────────────────────┘
```

#### 3.2 Logique d'upload

```typescript
// Upload AVANT la création de l'annonce
let uploadedImageUrls: string[] = []
if (images.length > 0) {
  uploadedImageUrls = await uploadImagesToStorage()
}

// Inclure dans l'insert
const { data, error } = await supabase
  .from('marketplace_items')
  .insert({
    ...itemData,
    images: uploadedImageUrls,
    seller_id: user.id
  })
```

---

### Phase 4 : Tests et vérifications

#### 4.1 Tests événements
- [ ] Sélection image depuis galerie
- [ ] Prise de photo avec caméra
- [ ] Suppression de l'image
- [ ] Upload vers `event-images`
- [ ] Création événement avec image
- [ ] Création événement sans image (optionnel)
- [ ] Édition événement : conserver/changer image

#### 4.2 Tests annonces
- [ ] Sélection multiple (jusqu'à 5 images)
- [ ] Prise de photo (ajout à la liste)
- [ ] Suppression d'une image spécifique
- [ ] Limite de 5 images respectée
- [ ] Upload vers `marketplace-images`
- [ ] Création annonce avec images
- [ ] Création annonce sans images
- [ ] Édition annonce : conserver/modifier images

#### 4.3 Tests permissions
- [ ] Demande permission galerie (iOS/Android)
- [ ] Demande permission caméra (iOS/Android)
- [ ] Message clair si permission refusée

#### 4.4 Tests erreurs
- [ ] Erreur upload → message utilisateur
- [ ] Image trop lourde → compression ou message
- [ ] Réseau lent → loading state

---

## 🔧 Fonctions utilitaires communes

### `requestPermissions()` (galerie)
```typescript
const requestPermissions = async () => {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à vos photos.'
      )
      return false
    }
  }
  return true
}
```

### `uploadToStorage()` (générique)
```typescript
const uploadToStorage = async (
  imageUri: string,
  bucket: 'event-images' | 'marketplace-images',
  userId: string
): Promise<string> => {
  const fileExt = imageUri.split('.').pop()
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  
  const response = await fetch(imageUri)
  const blob = await response.blob()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, blob, {
      contentType: `image/${fileExt}`,
      upsert: false
    })
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)
  
  return publicUrl
}
```

---

## 📊 Estimation

- **Installation** : 5 min
- **Événements** : 30 min
- **Annonces** : 45 min
- **Tests** : 30 min
- **Documentation** : 15 min

**Total** : ~2h15

---

## ⚠️ Points d'attention

1. **Conflits React** : Utiliser `~16.0.11` (testé avec React 19)
2. **Compression** : Qualité 0.8 pour réduire la taille
3. **Upload séquentiel** : Éviter surcharge réseau (annonces)
4. **Gestion erreurs** : Toujours proposer continuer sans images
5. **Loading states** : Feedback visuel pendant uploads

---

## 📝 Documentation à créer

Après implémentation, créer :
- `2025-11-04-upload-images-evenements-mobile.md`
- `2025-11-04-upload-images-annonces-mobile.md`
- Mettre à jour `MOBILE_IMPLEMENTATION_SUMMARY.md`

---

## 🎨 Composants UI

### Styles communs (à ajouter)

```typescript
// Preview image
imagePreview: {
  width: 100,
  height: 100,
  borderRadius: 8,
  backgroundColor: '#f3f4f6',
},

// Boutons d'action
imageButton: {
  flex: 1,
  backgroundColor: '#f9fafb',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 8,
  padding: 14,
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
},

// Bouton suppression
imageRemoveButton: {
  position: 'absolute',
  top: -8,
  right: -8,
  backgroundColor: '#ef4444',
  borderRadius: 12,
  width: 24,
  height: 24,
  justifyContent: 'center',
  alignItems: 'center',
}
```

---

**Statut** : 📝 Plan validé - Prêt pour implémentation  
**Approche** : Incrémentale (Phase par phase)  
**Risque conflit** : Minimal (version testée)







