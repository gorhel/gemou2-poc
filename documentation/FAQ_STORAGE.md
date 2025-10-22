# ❓ FAQ - Storage Marketplace

## Questions Fréquentes

---

### 📌 Général

#### Q1 : Pourquoi cette erreur "violates row-level security policy" ?

**R** : Par défaut, Supabase active RLS (Row-Level Security) sur toutes les tables et le Storage. **Toutes les opérations sont bloquées** jusqu'à ce que vous définissiez des politiques explicites.

C'est une **bonne pratique de sécurité**, mais cela nécessite une configuration.

**Solution** : Exécutez la migration SQL pour créer les politiques.

---

#### Q2 : Dois-je créer le bucket manuellement ?

**R** : **Non**. La migration SQL crée automatiquement le bucket `marketplace-images`.

Si vous l'avez déjà créé manuellement, ce n'est pas grave. La migration utilise `ON CONFLICT DO NOTHING`.

---

#### Q3 : Les images sont-elles publiques ?

**R** : 
- ✅ **Lecture** : OUI (tout le monde peut voir les images)
- ❌ **Upload** : NON (authentification requise)
- ❌ **Modification/Suppression** : NON (propriétaire uniquement)

C'est nécessaire pour que les annonces soient visibles par tous.

---

### 🔐 Sécurité

#### Q4 : Comment Supabase sait-il qui est le propriétaire d'une image ?

**R** : Grâce au **nom du dossier** dans le path.

```
marketplace-images/
  └── {user_id}/        ← Le dossier = ID utilisateur
      └── file.jpg
```

Les politiques RLS utilisent :
```sql
auth.uid()::text = (storage.foldername(name))[1]
```

Pour vérifier que `user_id du dossier` = `user_id connecté`.

---

#### Q5 : Quelqu'un peut-il supprimer mes images ?

**R** : **Non**. Les politiques RLS empêchent la suppression par d'autres utilisateurs.

Seul **vous** (le propriétaire) pouvez supprimer vos propres images.

---

#### Q6 : Peut-on uploader autre chose que des images ?

**R** : **Non**. Le bucket est configuré avec :

```sql
allowed_mime_types: ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
```

Tout autre type de fichier sera **rejeté**.

---

### ⚙️ Configuration

#### Q7 : Quelle est la limite de taille par image ?

**R** : **10 MB** par fichier.

Configuré dans la migration :
```sql
file_size_limit: 10485760  -- 10 * 1024 * 1024 = 10MB
```

Si vous avez besoin d'augmenter, modifiez ce paramètre.

---

#### Q8 : Combien d'images par annonce ?

**R** : **5 images maximum**.

Configuré dans le composant :
```typescript
maxImages = 5
```

Vous pouvez le modifier dans `ImageUpload.tsx`.

---

#### Q9 : Comment changer la limite d'images ?

**R** : Dans le composant qui utilise `ImageUpload` :

```typescript
<ImageUpload
  images={images}
  onChange={setImages}
  maxImages={10}  // ← Changez ici
/>
```

---

### 🛠️ Dépannage

#### Q10 : L'erreur persiste après avoir exécuté la migration

**Vérifications** :

1. **Le bucket existe-t-il ?**
```sql
SELECT * FROM storage.buckets WHERE id = 'marketplace-images';
```
Résultat attendu : 1 ligne

2. **Les politiques sont-elles actives ?**
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%marketplace images%';
```
Résultat attendu : 4 lignes

3. **L'utilisateur est-il connecté ?**
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log(user); // Devrait afficher un objet
```

---

#### Q11 : "User not authenticated" dans la console

**Cause** : L'utilisateur n'est pas connecté.

**Solution** :
1. Vérifiez que l'utilisateur est bien **connecté** dans votre app
2. Testez avec :
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

---

#### Q12 : Les images n'apparaissent pas après upload

**Causes possibles** :

1. **URL incorrecte**
```typescript
// Vérifiez dans la console
console.log('Image URL:', publicUrl);
```

2. **Bucket pas public**
```sql
UPDATE storage.buckets SET public = true WHERE id = 'marketplace-images';
```

3. **CORS bloqué** (rare)
   - Vérifiez la console navigateur
   - Contactez support Supabase si nécessaire

---

#### Q13 : "Failed to fetch" lors de l'upload

**Causes possibles** :

1. **Connexion internet**
2. **Clés Supabase incorrectes**
   - Vérifiez `.env.local`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Quota Supabase dépassé**
   - Vérifiez dans le dashboard Supabase

---

### 📂 Organisation

#### Q14 : Pourquoi organiser par userId ?

**Avantages** :

1. **Sécurité** : RLS peut vérifier la propriété
2. **Organisation** : Facile de retrouver les images d'un utilisateur
3. **Nettoyage** : Suppression facile de toutes les images d'un utilisateur
4. **Traçabilité** : On sait qui a uploadé quoi

---

#### Q15 : Que se passe-t-il si je supprime une annonce ?

**Par défaut** : Les images restent dans le Storage.

**Recommandation** : Ajouter une fonction pour nettoyer :

```typescript
// Fonction de nettoyage (à implémenter)
async function deleteMarketplaceItem(itemId: string) {
  // 1. Récupérer l'annonce
  const { data: item } = await supabase
    .from('marketplace_items')
    .select('images')
    .eq('id', itemId)
    .single();
  
  // 2. Supprimer les images du Storage
  if (item?.images && item.images.length > 0) {
    const filePaths = item.images.map(url => {
      // Extraire le path de l'URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      return `${userId}/${fileName}`;
    });
    
    await supabase.storage
      .from('marketplace-images')
      .remove(filePaths);
  }
  
  // 3. Supprimer l'annonce
  await supabase
    .from('marketplace_items')
    .delete()
    .eq('id', itemId);
}
```

---

#### Q16 : Comment voir toutes mes images ?

**Dans Supabase Dashboard** :
1. Menu → Storage
2. Cliquez sur `marketplace-images`
3. Naviguez vers votre dossier `{your_user_id}/`

**Programmatiquement** :
```typescript
const { data: { user } } = await supabase.auth.getUser();

const { data: files } = await supabase.storage
  .from('marketplace-images')
  .list(user.id); // Liste les fichiers dans votre dossier

console.log('Mes images:', files);
```

---

### 🧪 Tests

#### Q17 : Comment tester les politiques RLS ?

**Test 1 : Upload (Authentifié)**
```typescript
// 1. Connectez-vous
await supabase.auth.signInWithPassword({ email, password });

// 2. Uploadez une image
const { data, error } = await supabase.storage
  .from('marketplace-images')
  .upload(`${user.id}/test.jpg`, file);

// Résultat attendu: success (pas d'erreur)
```

**Test 2 : Lecture (Public)**
```typescript
// 1. Déconnectez-vous
await supabase.auth.signOut();

// 2. Accédez à une URL d'image
const imageUrl = "https://.../marketplace-images/user-123/file.jpg";

// Résultat attendu: Image visible dans le navigateur
```

**Test 3 : Suppression (Propriétaire)**
```typescript
// 1. Connectez-vous en tant que user-123
await supabase.auth.signInWithPassword({ email, password });

// 2. Supprimez votre image
const { error } = await supabase.storage
  .from('marketplace-images')
  .remove([`${user.id}/file.jpg`]);

// Résultat attendu: success
```

**Test 4 : Suppression (Non Propriétaire)**
```typescript
// 1. Connectez-vous en tant que user-456
await supabase.auth.signInWithPassword({ email, password });

// 2. Tentez de supprimer l'image de user-123
const { error } = await supabase.storage
  .from('marketplace-images')
  .remove(['user-123/file.jpg']);

// Résultat attendu: RLS error
```

---

### 💡 Optimisation

#### Q18 : Comment optimiser les images uploadées ?

**Solution 1 : Compression côté client**

```typescript
// Installez une librairie de compression
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };
  
  return await imageCompression(file, options);
};

// Utilisez dans uploadImage()
const compressedFile = await compressImage(file);
await supabase.storage.from('marketplace-images').upload(fileName, compressedFile);
```

**Solution 2 : Redimensionnement avec Supabase Transform** (si disponible)

---

#### Q19 : Les uploads sont lents. Comment améliorer ?

**Causes possibles** :

1. **Images trop lourdes**
   - Solution : Compressez les images (voir Q18)

2. **Connexion lente**
   - Solution : Affichez une progress bar

```typescript
const { data, error } = await supabase.storage
  .from('marketplace-images')
  .upload(fileName, file, {
    onUploadProgress: (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      console.log(`Upload: ${percent}%`);
      // Mettez à jour une barre de progression
    }
  });
```

3. **Uploads séquentiels**
   - Solution : Déjà optimisé avec `Promise.all()` dans le composant

---

#### Q20 : Peut-on prévisualiser l'image avant upload ?

**R** : Oui ! Utilisez `FileReader` :

```typescript
const previewImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
};

// Utilisation
const preview = await previewImage(file);
// preview = "data:image/jpeg;base64,..."
```

**Déjà implémenté** dans le composant `ImageUpload` avec la grille de prévisualisation.

---

### 🚀 Avancé

#### Q21 : Comment implémenter un crop d'image ?

**Suggestion** : Utilisez `react-image-crop`

```bash
npm install react-image-crop
```

```typescript
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Implémentez le crop avant l'upload
```

---

#### Q22 : Comment générer des thumbnails ?

**Option 1 : Côté client avec Canvas**

```typescript
const generateThumbnail = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Redimensionner à 200x200
        canvas.width = 200;
        canvas.height = 200;
        ctx.drawImage(img, 0, 0, 200, 200);
        
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
```

**Option 2 : Supabase Image Transformation** (si activé)

---

#### Q23 : Comment implémenter le drag & drop de réorganisation ?

**Suggestion** : Utilisez `react-beautiful-dnd`

```bash
npm install react-beautiful-dnd
```

Permettrait de réorganiser l'ordre des images dans la grille.

---

### 📊 Monitoring

#### Q24 : Comment surveiller l'utilisation du Storage ?

**Dans Supabase Dashboard** :
1. Menu → Settings → Usage
2. Vérifiez "Storage"
3. Consultez :
   - Espace utilisé
   - Nombre de fichiers
   - Bande passante

**Programmatiquement** :
```typescript
// Liste tous les fichiers d'un utilisateur
const { data: files } = await supabase.storage
  .from('marketplace-images')
  .list(user.id);

const totalSize = files.reduce((sum, file) => sum + file.metadata.size, 0);
console.log(`Espace utilisé: ${totalSize / 1024 / 1024} MB`);
```

---

#### Q25 : Y a-t-il une limite au nombre d'images total ?

**R** : Dépend de votre **plan Supabase** :

- **Free** : 1 GB storage
- **Pro** : 8 GB storage
- **Team** : 100 GB storage

Consultez : https://supabase.com/pricing

---

## 🎓 Bonnes Pratiques

### ✅ À Faire

1. ✅ Toujours vérifier l'authentification avant upload
2. ✅ Organiser les fichiers par utilisateur
3. ✅ Limiter la taille des fichiers
4. ✅ Restreindre les types de fichiers
5. ✅ Implémenter un nettoyage lors de la suppression d'annonces
6. ✅ Compresser les images avant upload
7. ✅ Afficher une progress bar pour les uploads longs
8. ✅ Gérer les erreurs avec des messages clairs

### ❌ À Éviter

1. ❌ Uploader sans vérifier l'auth
2. ❌ Stocker des fichiers en vrac (sans organisation)
3. ❌ Accepter tous les types de fichiers
4. ❌ Pas de limite de taille
5. ❌ Laisser les images orphelines dans le Storage
6. ❌ Exposer les clés d'API dans le code client
7. ❌ Oublier de nettoyer les fichiers inutilisés

---

## 🔗 Ressources

### Documentation Officielle

- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage Best Practices](https://supabase.com/docs/guides/storage/best-practices)

### Tutoriels

- [Upload Images with Supabase](https://supabase.com/docs/guides/storage/uploads)
- [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)

### Outils

- [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)
- [react-image-crop](https://www.npmjs.com/package/react-image-crop)
- [react-beautiful-dnd](https://www.npmjs.com/package/react-beautiful-dnd)

---

## 💬 Besoin d'Aide ?

Si votre question n'est pas dans cette FAQ :

1. Consultez les autres documents :
   - `QUICK_FIX_UPLOAD.md`
   - `FIX_STORAGE_RLS.md`
   - `ARCHITECTURE_STORAGE.md`

2. Vérifiez la documentation Supabase

3. Ouvrez un ticket avec :
   - Message d'erreur complet
   - Console logs
   - Étapes de reproduction

---

**Cette FAQ sera mise à jour régulièrement avec de nouvelles questions ! 📝**


