# 🔧 Correction des Problèmes Marketplace

## 🐛 Problèmes identifiés

1. ❌ Erreur `user_id` column not found
2. ❌ Composant d'upload d'images non visible

---

## ✅ Solution 1 : Corriger la colonne seller_id

### Problème

La table `marketplace_items` utilise probablement `user_id` au lieu de `seller_id`.

### Solution

**Étape 1 : Aller sur Supabase Dashboard**

1. https://supabase.com/dashboard
2. Sélectionnez votre projet **Gemou2**
3. Menu → **SQL Editor**
4. Cliquez **New Query**

**Étape 2 : Exécuter cette migration**

```sql
-- Vérifier la structure actuelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'marketplace_items' 
AND column_name IN ('user_id', 'seller_id');
```

**Étape 3a : Si vous voyez `user_id` (renommer)**

```sql
-- Renommer user_id en seller_id
ALTER TABLE marketplace_items RENAME COLUMN user_id TO seller_id;

-- Recréer l'index
DROP INDEX IF EXISTS idx_marketplace_items_seller_id;
CREATE INDEX idx_marketplace_items_seller_id ON marketplace_items(seller_id);
```

**Étape 3b : Si vous ne voyez ni user_id ni seller_id (créer)**

```sql
-- Créer la colonne seller_id
ALTER TABLE marketplace_items 
ADD COLUMN seller_id UUID REFERENCES auth.users(id);

-- Créer l'index
CREATE INDEX idx_marketplace_items_seller_id ON marketplace_items(seller_id);
```

**Étape 4 : Vérifier**

```sql
-- Cette requête doit retourner 'seller_id'
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'marketplace_items' 
AND column_name = 'seller_id';
```

---

## ✅ Solution 2 : Vérifier l'upload d'images

### Diagnostic

Le composant `ImageUpload` est dans le code mais ne s'affiche pas.

### Vérifications

**1. Ouvrir la console du navigateur (F12)**

- Y a-t-il des erreurs JavaScript ?
- Cherchez les erreurs liées à "ImageUpload" ou "Storage"

**2. Vérifier que le bucket existe**

1. Supabase Dashboard → **Storage**
2. Le bucket `marketplace-images` existe-t-il ?
3. Est-il **public** ?

Si NON, créez-le :
```
Name: marketplace-images
Public: ✅ OUI
```

**3. Vérifier l'affichage**

Le composant ImageUpload devrait apparaître entre :
- ✅ Le champ "Localisation"
- ✅ Le champ "Prix" (si Vente) ou "Jeu recherché" (si Échange)

### Si le composant ne s'affiche toujours pas

Ajoutez un console.log pour débugger :

```typescript
// Dans apps/web/app/create-trade/page.tsx
// Ligne ~279, avant ImageUpload

console.log('Images array:', images);

<ImageUpload
  images={images}
  onChange={(newImages) => {
    console.log('New images:', newImages);
    setImages(newImages);
  }}
  maxImages={5}
/>
```

Puis regardez la console lors du chargement de la page.

---

## 🧪 Test après correction

**1. Tester la création d'annonce**

```bash
1. Allez sur /create-trade
2. Remplissez le formulaire minimal :
   - Type : Vente
   - Titre : "Test"
   - Jeu : (sélectionnez un jeu)
   - État : "Bon état"
   - Prix : 10
3. Cliquez "Publier"
```

**Résultat attendu :**
- ✅ Pas d'erreur `user_id`
- ✅ Redirection vers `/trade/:id`
- ✅ Annonce créée

**2. Tester l'upload d'images**

```bash
1. Retournez sur /create-trade
2. Le composant d'upload doit être visible avec :
   - Zone de drag & drop
   - Texte "Glissez-déposez vos images..."
   - Possibilité de cliquer pour sélectionner
```

---

## 📸 Captures d'écran attendues

### Composant d'upload visible

```
┌─────────────────────────────────┐
│  Photos (0/5)                   │
│                                 │
│  ┌───────────────────────────┐ │
│  │       📷                  │ │
│  │  Glissez-déposez vos      │ │
│  │  images ici ou cliquez    │ │
│  │  pour sélectionner        │ │
│  │                           │ │
│  │  PNG, JPG, GIF jusqu'à    │ │
│  │  10MB                     │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 🆘 Si ça ne marche toujours pas

### Erreur `user_id` persiste

**Cause possible** : Le schéma cache de Supabase n'est pas rafraîchi

**Solution** :
1. Supabase Dashboard
2. Settings → Database
3. Cliquez **"Restart database"** (attention, cela prend 1-2 min)

### Upload d'images invisible

**Cause possible** : Problème d'import ou de rendu

**Solution** : Vérifiez dans la console :

```javascript
// Dans apps/web/components/marketplace/ImageUpload.tsx
// Au début du composant

console.log('ImageUpload rendered', { images, bucketName });
```

Si vous ne voyez PAS ce log, le composant n'est pas rendu.

**Causes :**
- Erreur dans le composant parent
- Erreur d'import
- Condition qui empêche le rendu

---

## 📋 Checklist

Après avoir appliqué les corrections :

- [ ] ✅ Colonne `seller_id` existe dans `marketplace_items`
- [ ] ✅ Migration SQL exécutée sans erreur
- [ ] ✅ Bucket `marketplace-images` créé et public
- [ ] ✅ Composant ImageUpload visible sur `/create-trade`
- [ ] ✅ Création d'annonce sans erreur `user_id`
- [ ] ✅ Upload d'image fonctionne

---

## 💡 Logs utiles pour le diagnostic

Ajoutez ces logs temporaires :

```typescript
// apps/web/app/create-trade/page.tsx

// Ligne ~44 (après les useState)
console.log('Create Trade - State:', { 
  type, title, gameId, customGameName, images, price, wantedGame 
});

// Ligne ~119 (dans handleSubmit, avant l'insert)
console.log('FormData to insert:', { ...formData, seller_id: user.id });

// Ligne ~128 (après l'erreur)
console.error('Supabase error details:', JSON.stringify(error, null, 2));
```

Regardez la console et partagez les logs si le problème persiste.

---

**Questions ?** N'hésitez pas à partager les messages d'erreur exacts !


