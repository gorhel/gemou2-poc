# 🏗️ Architecture - Storage Marketplace

## 📐 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Page: /create-trade                            │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │    Composant: ImageUpload                        │  │ │
│  │  │                                                   │  │ │
│  │  │  1. Vérifie auth (supabase.auth.getUser())       │  │ │
│  │  │  2. Upload image (userId/filename.ext)           │  │ │
│  │  │  3. Récupère URL publique                        │  │ │
│  │  │  4. Sauvegarde dans state                        │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE BACKEND                            │
│                                                              │
│  ┌───────────────────────┐      ┌────────────────────────┐  │
│  │    AUTH               │      │    STORAGE             │  │
│  │                       │      │                        │  │
│  │  • Vérifie user       │─────▶│  Bucket:              │  │
│  │  • Retourne user.id   │      │  marketplace-images   │  │
│  │  • auth.role()        │      │                        │  │
│  └───────────────────────┘      │  Public: true          │  │
│                                  │  Max: 10MB             │  │
│  ┌───────────────────────┐      │  Formats: images       │  │
│  │    RLS POLICIES       │      │                        │  │
│  │                       │      │  Structure:            │  │
│  │  INSERT:              │◀─────│  userId/               │  │
│  │  ✅ auth = authenticated     │    └─ file.jpg         │  │
│  │                       │      └────────────────────────┘  │
│  │  SELECT:              │                                  │
│  │  ✅ Public (all)      │      ┌────────────────────────┐  │
│  │                       │      │    DATABASE            │  │
│  │  UPDATE/DELETE:       │      │                        │  │
│  │  ✅ Owner only        │      │  marketplace_items     │  │
│  │    (check userId)     │      │  ├─ id                 │  │
│  └───────────────────────┘      │  ├─ seller_id          │  │
│                                  │  ├─ images: string[]   │  │
│                                  │  └─ ...                │  │
│                                  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux d'Upload d'Image

### 1. Séquence Complète

```
UTILISATEUR                    COMPOSANT                  SUPABASE
    │                              │                          │
    │ Sélectionne image            │                          │
    ├─────────────────────────────▶│                          │
    │                              │                          │
    │                              │ getUser()                │
    │                              ├─────────────────────────▶│
    │                              │                          │
    │                              │◀─────────────────────────┤
    │                              │ { user: { id: "..." } }  │
    │                              │                          │
    │                              │ Prépare fichier          │
    │                              │ userId/timestamp.ext     │
    │                              │                          │
    │                              │ upload(fileName, file)   │
    │                              ├─────────────────────────▶│
    │                              │                          │
    │                              │                          │ Vérifie RLS INSERT
    │                              │                          │ ✅ auth = authenticated
    │                              │                          │
    │                              │◀─────────────────────────┤
    │                              │ { data: { path } }       │
    │                              │                          │
    │                              │ getPublicUrl(fileName)   │
    │                              ├─────────────────────────▶│
    │                              │                          │
    │                              │◀─────────────────────────┤
    │                              │ { publicUrl: "..." }     │
    │                              │                          │
    │◀─────────────────────────────┤                          │
    │ Prévisualisation             │                          │
    │                              │                          │
```

---

## 🔐 Sécurité RLS en Détail

### Structure des Politiques

```
storage.objects (table Supabase interne)
│
├─ POLICY: "Authenticated users can upload marketplace images"
│  │
│  ├─ Opération: INSERT
│  ├─ Condition: bucket_id = 'marketplace-images'
│  └─ Check: auth.role() = 'authenticated'
│     │
│     └─▶ SI OUI ✅: Upload autorisé
│         SI NON ❌: Erreur RLS
│
├─ POLICY: "Anyone can view marketplace images"
│  │
│  ├─ Opération: SELECT
│  ├─ Condition: bucket_id = 'marketplace-images'
│  └─ Check: (aucune condition)
│     │
│     └─▶ TOUJOURS ✅: Lecture autorisée pour tous
│
├─ POLICY: "Users can update own marketplace images"
│  │
│  ├─ Opération: UPDATE
│  ├─ Condition: bucket_id = 'marketplace-images'
│  └─ Check: auth.uid()::text = (storage.foldername(name))[1]
│     │
│     └─▶ SI userId = dossier ✅: Modification autorisée
│         SINON ❌: Erreur RLS
│
└─ POLICY: "Users can delete own marketplace images"
   │
   ├─ Opération: DELETE
   ├─ Condition: bucket_id = 'marketplace-images'
   └─ Check: auth.uid()::text = (storage.foldername(name))[1]
      │
      └─▶ SI userId = dossier ✅: Suppression autorisée
          SINON ❌: Erreur RLS
```

---

## 📂 Organisation des Fichiers

### Structure du Bucket

```
storage.buckets
│
└─ marketplace-images/  (bucket)
   │
   ├─ Settings:
   │  ├─ public: true
   │  ├─ file_size_limit: 10485760 (10MB)
   │  └─ allowed_mime_types: 
   │     ├─ image/jpeg
   │     ├─ image/jpg
   │     ├─ image/png
   │     ├─ image/gif
   │     └─ image/webp
   │
   └─ Files:
      │
      ├─ {user_id_1}/
      │  ├─ 1729500000000_abc123.jpg
      │  ├─ 1729500100000_def456.png
      │  └─ 1729500200000_ghi789.gif
      │
      ├─ {user_id_2}/
      │  ├─ 1729510000000_jkl012.jpg
      │  └─ 1729510100000_mno345.png
      │
      └─ {user_id_3}/
         └─ 1729520000000_pqr678.webp
```

### Exemple Concret

```bash
# Utilisateur: John Doe
# user_id: 123e4567-e89b-12d3-a456-426614174000

# Fichiers uploadés:
marketplace-images/
└── 123e4567-e89b-12d3-a456-426614174000/
    ├── 1729500000000_a1b2c3.jpg  ← Photo 1 annonce
    ├── 1729500001000_d4e5f6.jpg  ← Photo 2 annonce
    └── 1729510000000_g7h8i9.png  ← Photo autre annonce
```

---

## 🔍 Vérification de la Propriété

### Comment RLS Identifie le Propriétaire

```sql
-- Fonction utilisée par RLS:
storage.foldername(name)

-- Exemple:
-- Fichier: "123e4567-e89b-12d3-a456-426614174000/1729500000000_abc.jpg"
-- 
-- storage.foldername(name) retourne:
-- ["123e4567-e89b-12d3-a456-426614174000"]
--
-- (storage.foldername(name))[1] retourne:
-- "123e4567-e89b-12d3-a456-426614174000"

-- Comparaison avec l'utilisateur actuel:
auth.uid()::text = (storage.foldername(name))[1]
```

### Flux de Vérification

```
Utilisateur essaie de SUPPRIMER une image
│
├─ Récupère auth.uid() → "user-123"
├─ Récupère le path → "user-456/file.jpg"
├─ Extrait foldername → "user-456"
│
└─ Compare:
   │
   ├─ "user-123" = "user-456" ?
   │
   ├─▶ NON ❌
   │   └─ Erreur: "new row violates row-level security policy"
   │
   └─▶ OUI ✅
       └─ Suppression autorisée
```

---

## 🎯 Composants React

### Structure du Composant ImageUpload

```typescript
ImageUpload
│
├─ Props:
│  ├─ images: string[]          // URLs des images
│  ├─ onChange: (images) => void
│  ├─ maxImages?: number        // Défaut: 5
│  └─ bucketName?: string       // Défaut: 'marketplace-images'
│
├─ State:
│  ├─ isDragging: boolean
│  ├─ uploading: boolean
│  └─ error: string | null
│
├─ Fonctions:
│  │
│  ├─ uploadImage(file: File): Promise<string | null>
│  │  │
│  │  ├─ 1. getUser() → user.id
│  │  ├─ 2. Créer fileName = `${user.id}/${timestamp}_${random}.${ext}`
│  │  ├─ 3. upload(fileName, file)
│  │  ├─ 4. getPublicUrl(fileName)
│  │  └─ 5. Retourner publicUrl
│  │
│  ├─ handleFiles(files: FileList)
│  │  │
│  │  ├─ 1. Vérifier slots disponibles
│  │  ├─ 2. uploadImage() pour chaque fichier
│  │  ├─ 3. Filtrer les URLs valides
│  │  └─ 4. onChange([...images, ...newUrls])
│  │
│  ├─ handleDragOver(e)
│  ├─ handleDragLeave(e)
│  ├─ handleDrop(e)
│  ├─ handleFileInput(e)
│  └─ removeImage(index)
│
└─ UI:
   │
   ├─ Zone Drag & Drop
   │  ├─ Input file (hidden)
   │  ├─ Icône upload
   │  └─ Texte instructions
   │
   ├─ Grille de prévisualisation
   │  └─ Pour chaque image:
   │     ├─ <img> prévisualisation
   │     └─ Bouton suppression
   │
   └─ Message d'erreur
```

---

## 🗄️ Base de Données

### Table marketplace_items

```sql
marketplace_items
│
├─ id: UUID (PK)
├─ seller_id: UUID (FK → profiles.id)
├─ title: TEXT
├─ description: TEXT
├─ images: TEXT[] ← URLs Supabase Storage
├─ price: NUMERIC
├─ game_id: UUID (FK → games.id)
├─ custom_game_name: TEXT
├─ condition: TEXT
├─ type: TEXT ('sale' | 'exchange')
├─ wanted_game: TEXT
├─ delivery_available: BOOLEAN
├─ location_quarter: TEXT
├─ location_city: TEXT
├─ status: TEXT ('draft' | 'available' | 'sold' | 'exchanged' | 'closed')
├─ created_at: TIMESTAMP
└─ updated_at: TIMESTAMP
```

### Relation avec Storage

```
marketplace_items.images
│
├─ Contient: 
│  [
│    "https://abc.supabase.co/storage/v1/object/public/marketplace-images/user-123/file1.jpg",
│    "https://abc.supabase.co/storage/v1/object/public/marketplace-images/user-123/file2.jpg"
│  ]
│
└─ Chaque URL pointe vers:
   storage.objects
   └─ bucket_id: 'marketplace-images'
      name: 'user-123/file1.jpg'
```

---

## 📊 Cycle de Vie Complet

### Création d'une Annonce avec Images

```
1. PRÉPARATION
   ├─ Utilisateur ouvre /create-trade
   └─ Composant ImageUpload monté

2. UPLOAD IMAGES
   ├─ Utilisateur sélectionne 3 images
   ├─ Pour chaque image:
   │  ├─ Vérification auth
   │  ├─ Upload vers userId/timestamp_random.ext
   │  ├─ Récupération URL publique
   │  └─ Ajout au state local
   └─ Prévisualisation affichée

3. CRÉATION ANNONCE
   ├─ Utilisateur remplit formulaire
   ├─ Clique "Publier"
   ├─ INSERT INTO marketplace_items:
   │  {
   │    seller_id: "user-123",
   │    title: "Catan",
   │    images: [
   │      "https://.../user-123/1729500000000_abc.jpg",
   │      "https://.../user-123/1729500001000_def.jpg",
   │      "https://.../user-123/1729500002000_ghi.jpg"
   │    ],
   │    ...
   │  }
   └─ Redirection vers /trade/:id

4. AFFICHAGE
   ├─ Page /trade/:id
   ├─ Récupération marketplace_item
   ├─ Boucle sur images[]
   ├─ <img src={url} /> pour chaque image
   └─ Images chargées depuis Storage (public)

5. SUPPRESSION (si besoin)
   ├─ Propriétaire supprime l'annonce
   ├─ DELETE FROM marketplace_items
   ├─ Optionnel: Cleanup des images
   │  └─ DELETE FROM storage.objects
   │     WHERE name LIKE 'user-123/%'
   └─ RLS vérifie: auth.uid() = user-123 ✅
```

---

## 🧪 Tests de Sécurité

### Scénarios de Test

```
TEST 1: Upload Authentifié
├─ Utilisateur connecté: ✅ user-123
├─ Action: Upload image
└─ Résultat: ✅ SUCCESS

TEST 2: Upload Non Authentifié
├─ Utilisateur: ❌ Anonyme
├─ Action: Upload image
└─ Résultat: ❌ RLS Error "not authenticated"

TEST 3: Lecture Publique
├─ Utilisateur: ❌ Anonyme
├─ Action: Afficher image via URL publique
└─ Résultat: ✅ SUCCESS (lecture autorisée)

TEST 4: Suppression Propriétaire
├─ Utilisateur connecté: ✅ user-123
├─ Action: Supprimer image de user-123/file.jpg
└─ Résultat: ✅ SUCCESS

TEST 5: Suppression Non Propriétaire
├─ Utilisateur connecté: ✅ user-456
├─ Action: Supprimer image de user-123/file.jpg
└─ Résultat: ❌ RLS Error "violates policy"

TEST 6: Modification Propriétaire
├─ Utilisateur connecté: ✅ user-123
├─ Action: Modifier image de user-123/file.jpg
└─ Résultat: ✅ SUCCESS

TEST 7: Modification Non Propriétaire
├─ Utilisateur connecté: ✅ user-456
├─ Action: Modifier image de user-123/file.jpg
└─ Résultat: ❌ RLS Error "violates policy"
```

---

## 🔧 Configuration Technique

### Variables d'Environnement

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Utilisées dans:
apps/web/lib/supabase-client.ts
```

### Client Supabase

```typescript
// apps/web/lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClientSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Bucket Configuration

```sql
-- supabase/migrations/20251021120000_setup_marketplace_images_storage.sql

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true,                    -- PUBLIC: OUI
  10485760,                -- 10MB
  ARRAY[                   -- Formats autorisés
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
);
```

---

## 📋 Checklist Architecture

### Backend (Supabase)

- [x] Bucket `marketplace-images` créé
- [x] Configuration publique activée
- [x] Limite de taille définie (10MB)
- [x] Formats d'images restreints
- [x] Politique INSERT (auth only)
- [x] Politique SELECT (public)
- [x] Politique UPDATE (owner only)
- [x] Politique DELETE (owner only)

### Frontend (Next.js)

- [x] Composant `ImageUpload` créé
- [x] Vérification auth avant upload
- [x] Organisation par userId
- [x] Gestion des erreurs
- [x] Prévisualisation d'images
- [x] Drag & Drop support
- [x] Limite de nombre d'images (5)

### Sécurité

- [x] RLS activé sur storage.objects
- [x] Authentification obligatoire pour upload
- [x] Vérification de propriété pour update/delete
- [x] Lecture publique seulement
- [x] Validation des types MIME
- [x] Limite de taille fichier

---

**L'architecture du Storage Marketplace est complète et sécurisée ! 🎉**


