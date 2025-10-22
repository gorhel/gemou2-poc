# ✅ Checklist Post-Migration Marketplace

## 📊 État d'avancement

### ✅ COMPLÉTÉ
- [x] Migration de base de données appliquée
- [x] Route `/create-trade` - Formulaire de création d'annonce
- [x] Route `/trade/:id` - Page de consultation d'annonce
- [x] Composant `GameSelect` - Sélection de jeu avec recherche
- [x] Composant `ImageUpload` - Upload d'images avec drag & drop
- [x] Composant `LocationAutocomplete` - Autocomplete pour La Réunion
- [x] Types TypeScript complets dans `types/marketplace.ts`
- [x] Helpers et validateurs (formatPrice, formatLocation, etc.)
- [x] Aucune erreur de linter

---

## 🔴 ACTIONS REQUISES (VOUS)

### 1. Créer le bucket Supabase Storage

Le composant `ImageUpload` utilise le bucket `marketplace-images` qui doit être créé manuellement.

**Étapes :**

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **Gemou2**
3. Dans le menu latéral, cliquez sur **Storage**
4. Cliquez sur **New bucket**
5. Remplissez les informations :
   - **Name** : `marketplace-images`
   - **Public bucket** : ✅ OUI (cochez la case)
   - **Allowed MIME types** : image/png, image/jpeg, image/gif, image/webp
   - **Max file size** : 10MB (10485760 bytes)
6. Cliquez sur **Create bucket**

**Policies RLS à configurer :**

```sql
-- Permettre à tous de lire les images (bucket public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'marketplace-images' );

-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'marketplace-images' );

-- Permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'marketplace-images' AND auth.uid()::text = owner );
```

---

### 2. Vérifier que la migration SQL est bien appliquée

Connectez-vous à votre projet Supabase et exécutez cette requête pour vérifier :

```sql
-- Vérifier que les nouvelles colonnes existent
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'marketplace_items' 
AND column_name IN ('game_id', 'custom_game_name', 'wanted_game', 'delivery_available', 'location_quarter', 'location_city');

-- Vérifier que la vue enrichie existe
SELECT * FROM marketplace_items_enriched LIMIT 1;

-- Vérifier que la fonction existe
SELECT proname FROM pg_proc WHERE proname = 'create_marketplace_conversation';
```

**Résultat attendu :**
- 6 colonnes retournées pour la première requête
- La vue enrichie fonctionne
- La fonction existe

---

### 3. Tester les fonctionnalités

#### 🧪 Scénario 1 : Créer une annonce de VENTE

1. Connectez-vous à votre application
2. Allez sur `/create-trade`
3. Sélectionnez **"Vente"**
4. Remplissez :
   - Titre : "Catan - Extension Marins"
   - Jeu : Recherchez "Catan" dans la liste
   - État : "Bon état"
   - Description : "Extension peu jouée, comme neuve"
   - Localisation : Tapez "Saint-Denis" ou "Moufia, Saint-Denis"
   - Photos : Uploadez 1-2 images
   - Prix : 25.00
   - Livraison : Activez le toggle
5. Cliquez sur **"Publier"**
6. Vérifiez que vous êtes redirigé vers `/trade/:id`
7. Vérifiez que toutes les informations s'affichent correctement

**✅ Critères de succès :**
- L'annonce est créée sans erreur
- Les images s'affichent dans la galerie
- Le prix est formaté correctement (25.00 €)
- La localisation s'affiche
- Le bouton "Contacter le vendeur" n'apparaît PAS (c'est votre annonce)

---

#### 🧪 Scénario 2 : Créer une annonce d'ÉCHANGE

1. Allez sur `/create-trade`
2. Sélectionnez **"Échange"**
3. Remplissez :
   - Titre : "7 Wonders Duel"
   - Jeu : Recherchez dans la liste
   - État : "Excellent"
   - Jeu recherché : "Wingspan ou Terraforming Mars"
4. Cliquez sur **"Publier"**

**✅ Critères de succès :**
- L'annonce est créée
- Le champ "Jeu recherché" s'affiche au lieu du prix
- Le badge affiche "🔄 Échange"

---

#### 🧪 Scénario 3 : Jeu personnalisé

1. Allez sur `/create-trade`
2. Dans le champ "Jeu", tapez quelque chose
3. Cliquez sur **"Mon jeu n'est pas dans la liste"**
4. Entrez : "Jeu personnalisé rare"
5. Complétez le formulaire
6. Publiez

**✅ Critères de succès :**
- L'annonce est créée avec `custom_game_name`
- Le nom s'affiche correctement sur `/trade/:id`
- Le bouton "Voir la fiche du jeu" n'apparaît PAS

---

#### 🧪 Scénario 4 : Sauvegarder en brouillon

1. Créez une annonce
2. Ne remplissez QUE le titre
3. Cliquez sur **"Enregistrer et quitter"**

**✅ Critères de succès :**
- L'annonce est créée avec `status: 'draft'`
- Pas d'erreur de validation (car c'est un brouillon)

---

#### 🧪 Scénario 5 : Validation du formulaire

1. Créez une annonce de VENTE
2. Ne remplissez PAS le prix
3. Cliquez sur **"Publier"**

**✅ Critères de succès :**
- Le formulaire affiche une erreur : "Le prix est obligatoire pour une vente"
- L'annonce n'est PAS créée

---

#### 🧪 Scénario 6 : Contacter le vendeur

**Prérequis :** Créez une annonce avec un compte A, puis connectez-vous avec un compte B

1. Avec le compte B, allez sur une annonce du compte A
2. Cliquez sur **"Contacter le vendeur"**

**✅ Critères de succès :**
- Une conversation est créée via la fonction `create_marketplace_conversation`
- Vous êtes redirigé vers `/messages?conversation=:id`
- Le vendeur (compte A) reçoit une notification (vérifier dans la table `notifications`)

---

### 4. Vérifier les RLS Policies

Testez la sécurité :

```sql
-- En tant qu'utilisateur connecté, créer une annonce
-- Devrait fonctionner

-- En tant qu'utilisateur anonyme, lire les annonces disponibles
-- Devrait fonctionner

-- En tant qu'utilisateur B, modifier une annonce de l'utilisateur A
-- Devrait ÉCHOUER
```

---

## 📝 Structure des Composants

### Page `/create-trade`

```
CreateTradePage
├── ResponsiveLayout
│   └── Card
│       └── Form
│           ├── Toggle (Vente/Échange)
│           ├── Input (Titre)
│           ├── GameSelect
│           │   ├── Search input
│           │   ├── Dropdown with games
│           │   └── "Mon jeu n'est pas dans la liste"
│           ├── Select (État)
│           ├── Textarea (Description)
│           ├── LocationAutocomplete
│           │   ├── Input with autocomplete
│           │   └── Dropdown with locations (Réunion)
│           ├── ImageUpload
│           │   ├── Drag & drop zone
│           │   └── Image previews
│           ├── Input (Prix) - Si vente
│           ├── Input (Jeu recherché) - Si échange
│           ├── Toggle (Livraison)
│           └── Actions
│               ├── Button "Enregistrer et quitter"
│               └── Button "Publier"
```

### Page `/trade/[id]`

```
TradePage
├── ResponsiveLayout
│   └── Grid (2 colonnes sur desktop)
│       ├── Colonne gauche
│       │   ├── Card (Galerie photos)
│       │   │   ├── Image principale
│       │   │   └── Miniatures
│       │   └── Card (Informations)
│       │       ├── Badges (Type, Status)
│       │       ├── Titre
│       │       ├── Prix OU Jeu recherché
│       │       ├── Détails (Jeu, État, Localisation, Livraison)
│       │       └── Description
│       └── Colonne droite
│           ├── Card (Vendeur)
│           │   ├── Avatar
│           │   ├── Username (lien vers profil)
│           │   ├── Ville
│           │   └── Button "Contacter"
│           ├── Card (Fiche du jeu) - Si game_id
│           │   ├── Photo du jeu
│           │   ├── Nom
│           │   ├── Joueurs
│           │   └── Link "Voir la fiche"
│           └── Card (Informations sécurité)
```

---

## 🎯 Prochaines Étapes

### Intégrations à venir
- [ ] Ajouter un lien "Créer une annonce" dans le header/navigation
- [ ] Créer une page `/marketplace` pour lister toutes les annonces
- [ ] Implémenter les filtres (type, localisation, prix, etc.)
- [ ] Ajouter la gestion des brouillons (page "Mes annonces")
- [ ] Permettre l'édition/suppression des annonces

### Améliorations UX (optionnel)
- [ ] Preview des images avant upload
- [ ] Compresser les images avant upload
- [ ] Crop/rotation d'images
- [ ] Autocomplete avancé avec détection GPS
- [ ] Notifications push en temps réel
- [ ] Système de "favoris" pour les annonces

---

## 🚨 Troubleshooting

### Erreur : "Failed to upload image"

**Cause :** Le bucket `marketplace-images` n'existe pas ou n'est pas public

**Solution :** Voir étape 1 ci-dessus

---

### Erreur : "marketplace_items_enriched does not exist"

**Cause :** La migration SQL n'a pas été appliquée correctement

**Solution :** Réappliquer la migration dans Supabase SQL Editor

---

### Erreur : "function create_marketplace_conversation does not exist"

**Cause :** La fonction SQL n'a pas été créée

**Solution :** Vérifier que la migration complète a été exécutée

---

### Les RLS bloquent l'accès

**Cause :** Les policies ne sont pas configurées correctement

**Solution :** Vérifier dans Supabase Dashboard > Authentication > Policies que les 5 policies existent pour `marketplace_items`

---

## 📚 Ressources

- **Types TypeScript** : `apps/web/types/marketplace.ts`
- **Migration SQL** : `supabase/migrations/20251009120000_add_marketplace_trade_features.sql`
- **Documentation complète** : `ACTIONS_A_FAIRE.md`

---

**✅ Une fois ces actions effectuées, votre marketplace sera 100% fonctionnel !**



