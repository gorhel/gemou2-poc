# 🎯 ACTIONS À FAIRE - Marketplace Trade

## 📋 RÉSUMÉ GLOBAL

Vous devez implémenter **2 routes principales** pour la fonctionnalité de vente/échange de jeux :
- **`/create-trade`** : Formulaire de création d'annonce
- **`/trade/:id`** : Page de consultation d'une annonce

---

## 🚀 ÉTAPE 1 : Appliquer la Migration Base de Données

### ✅ Action immédiate (Supabase Cloud)

**Option 1 : Via le Dashboard Supabase (Recommandé)**

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (menu de gauche)
4. Cliquez sur **New Query**
5. Copiez/collez le contenu du fichier :
   ```
   supabase/migrations/20251009120000_add_marketplace_trade_features.sql
   ```
6. Cliquez sur **Run** (ou Ctrl+Enter)
7. Vérifiez qu'il n'y a pas d'erreurs

**Option 2 : Via CLI (si configuré avec votre projet cloud)**

```bash
cd /Users/essykouame/Downloads/gemou2-poc
supabase db push
```

### 📊 Ce que fait la migration
- Ajoute 6 colonnes à `marketplace_items`
- Ajoute 1 colonne à `conversations`
- Crée 8 index de performance
- Crée 5 RLS policies de sécurité
- Crée 1 vue enrichie
- Crée 1 fonction SQL
- Crée 1 trigger de notification

---

## 🛠️ ÉTAPE 2 : Créer la Route `/create-trade`

### 📁 Structure à créer

```bash
mkdir -p apps/web/app/create-trade
touch apps/web/app/create-trade/page.tsx
```

### 🎨 Composants du Formulaire

#### 1. **Toggle Type de Transaction**
```typescript
<Switch> Vente ⟷ Échange </Switch>
```

#### 2. **Champs Communs** (toujours affichés)
- ✏️ **Titre de l'annonce** (input texte, obligatoire)
- 🎮 **Identification du jeu** (select avec recherche dans table `games`)
  - Option finale : "Mon jeu n'est pas dans la liste"
  - Si sélectionnée → affiche input texte libre (`custom_game_name`)
- 📦 **État du jeu** (select)
  - Neuf / Très bon état / Bon état / État correct / Usé
- 📝 **Description** (textarea)
- 📍 **Localisation** (autocomplete limité à La Réunion)
  - Format : Quartier, Ville
  - Utiliser `getLocationOptions()` de `types/marketplace.ts`
- 📸 **Photos** (upload multiple + drag & drop)
  - Stocker dans Supabase Storage
  - Array d'URLs dans `images`

#### 3. **Champs Conditionnels**

**Si type = "Vente" :**
- 💰 **Prix** (input number, obligatoire)

**Si type = "Échange" :**
- 🔄 **Jeu recherché** (input texte, obligatoire)

**Pour les deux :**
- 🚚 **Livraison possible** (toggle boolean)

#### 4. **Boutons d'action**
- **"Enregistrer et quitter"** → `status: 'draft'`
- **"Publier"** (primaire) → `status: 'available'`

### 💻 Code de base

```typescript
import { CreateMarketplaceItemForm, validateMarketplaceForm } from '@/types/marketplace';

const handleSubmit = async (isDraft: boolean) => {
  const formData: CreateMarketplaceItemForm = {
    title,
    description,
    condition,
    type, // 'sale' ou 'exchange'
    game_id: selectedGameId || null,
    custom_game_name: customGameName || null,
    price: type === 'sale' ? price : null,
    wanted_game: type === 'exchange' ? wantedGame : null,
    location_quarter: quarter,
    location_city: city,
    delivery_available: deliveryAvailable,
    images: uploadedImages,
    status: isDraft ? 'draft' : 'available'
  };

  // Valider
  const { valid, errors } = validateMarketplaceForm(formData);
  
  if (!valid) {
    // Afficher les erreurs
    return;
  }

  // Sauvegarder
  const { data, error } = await supabase
    .from('marketplace_items')
    .insert({ ...formData, seller_id: user.id });
};
```

---

## 🛠️ ÉTAPE 3 : Créer la Route `/trade/:id`

### 📁 Structure à créer

```bash
mkdir -p apps/web/app/trade/[id]
touch apps/web/app/trade/[id]/page.tsx
```

### 🎨 Composants de la Page

#### 1. **Récupération des données**
```typescript
const { data: item } = await supabase
  .from('marketplace_items_enriched')
  .select('*')
  .eq('id', params.id)
  .single();
```

#### 2. **Affichage**

**Galerie Photos :**
- Carousel ou grille des images
- `item.images` (array)

**Informations principales :**
- 📌 **Titre** : `item.title`
- 📝 **Description** : `item.description`
- 📦 **État** : `CONDITION_LABELS[item.condition]`
- 🎮 **Jeu** : `item.game_name` (depuis la vue enrichie)
- 📍 **Localisation** : `formatLocation(item)` (helper fourni)

**Si Vente :**
- 💰 **Prix** : `formatPrice(item.price)`

**Si Échange :**
- 🔄 **Jeu recherché** : `item.wanted_game`

**Options :**
- 🚚 **Livraison** : Si `item.delivery_available === true`

#### 3. **Vendeur**
```typescript
<div>
  <img src={item.seller_avatar} />
  <Link href={`/profile/${item.seller_username}`}>
    {item.seller_username}
  </Link>
  <p>{item.seller_city}</p>
</div>
```

#### 4. **Boutons d'action**

**Bouton "Contacter le vendeur"** :
```typescript
const handleContact = async () => {
  const { data: conversationId } = await supabase.rpc(
    'create_marketplace_conversation',
    {
      p_marketplace_item_id: item.id,
      p_buyer_id: user.id
    }
  );
  
  // Rediriger vers la conversation
  router.push(`/messages/${conversationId}`);
};
```

**Bouton "Voir la fiche du jeu"** :
```typescript
<Link href={`/games/${item.game_id}`}>
  Voir la fiche du jeu
</Link>
```

---

## 🎨 ÉTAPE 4 : Fonctionnalités Techniques

### 1. **Upload d'images vers Supabase Storage**

```typescript
const uploadImages = async (files: File[]) => {
  const urls: string[] = [];
  
  for (const file of files) {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('marketplace-images')
      .upload(fileName, file);
    
    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(fileName);
      
      urls.push(publicUrl);
    }
  }
  
  return urls;
};
```

**⚠️ Action requise :** Créer le bucket `marketplace-images` dans Supabase Storage

### 2. **Autocomplete Localisation La Réunion**

```typescript
import { getLocationOptions } from '@/types/marketplace';

const [search, setSearch] = useState('');
const options = getLocationOptions(search);

// Afficher les options
options.map(opt => (
  <option key={opt.label} value={opt.label}>
    {opt.label} {/* Format: "Quartier, Ville" */}
  </option>
))
```

### 3. **Select avec recherche pour les jeux**

```typescript
const [gameSearch, setGameSearch] = useState('');

const { data: games } = await supabase
  .from('games')
  .select('id, name, photo_url')
  .ilike('name', `%${gameSearch}%`)
  .limit(10);

// Ajouter l'option "Mon jeu n'est pas dans la liste"
```

---

## ✅ CHECKLIST COMPLÈTE

### Backend (Supabase Cloud)
- [ ] Appliquer la migration via SQL Editor Supabase Dashboard
- [ ] Vérifier qu'il n'y a pas d'erreurs dans l'exécution
- [ ] Vérifier que les contraintes fonctionnent (faire un test d'insertion)
- [ ] Tester les RLS policies
- [ ] Créer le bucket Storage `marketplace-images` via Dashboard

### Frontend - Route `/create-trade`
- [ ] Créer le dossier et le fichier `page.tsx`
- [ ] Implémenter le toggle Vente/Échange
- [ ] Champ titre
- [ ] Select jeu avec recherche + option personnalisée
- [ ] Select état du jeu
- [ ] Textarea description
- [ ] Autocomplete localisation (quartier, ville)
- [ ] Upload photos (drag & drop)
- [ ] Input prix (conditionnel si vente)
- [ ] Input jeu recherché (conditionnel si échange)
- [ ] Toggle livraison
- [ ] Bouton "Enregistrer et quitter" (draft)
- [ ] Bouton "Publier" (available)
- [ ] Validation du formulaire
- [ ] Gestion des erreurs

### Frontend - Route `/trade/:id`
- [ ] Créer le dossier et le fichier `page.tsx`
- [ ] Galerie photos
- [ ] Affichage informations annonce
- [ ] Affichage vendeur avec lien vers profil
- [ ] Bouton "Contacter le vendeur"
- [ ] Bouton "Voir la fiche du jeu"
- [ ] Gestion des cas : annonce inexistante, accès refusé

### Intégrations
- [ ] Fonction de création de conversation
- [ ] Redirection vers les messages
- [ ] Notifications en temps réel (optionnel)

---

## 📚 RESSOURCES DISPONIBLES

| Besoin | Fichier à consulter |
|--------|---------------------|
| **Exemples de code** | `MARKETPLACE_MIGRATION_GUIDE.md` |
| **Types TypeScript** | `apps/web/types/marketplace.ts` |
| **Helpers (validation, formatage)** | `apps/web/types/marketplace.ts` |
| **Schéma SQL** | `supabase/migrations/20251009120000_add_marketplace_trade_features.sql` |
| **Guide rapide** | `QUICK_START_MARKETPLACE.md` |

---

## 🧪 TESTS À EFFECTUER

### Scénarios de test
1. ✅ Créer une annonce de vente avec jeu de la base
2. ✅ Créer une annonce de vente avec jeu personnalisé
3. ✅ Créer une annonce d'échange
4. ✅ Sauvegarder en brouillon
5. ✅ Publier une annonce
6. ✅ Consulter une annonce
7. ✅ Contacter un vendeur
8. ✅ Recevoir une notification (vendeur)
9. ❌ Tenter de publier une vente sans prix (doit échouer)
10. ❌ Tenter de publier un échange sans jeu recherché (doit échouer)

---

## 🎯 PRIORITÉS

### 🔴 URGENT (Backend Cloud)
1. Appliquer la migration SQL via Supabase Dashboard
2. Créer le bucket Storage via Supabase Dashboard

### 🟡 IMPORTANT (Frontend Core)
1. Créer `/create-trade` avec formulaire basique
2. Créer `/trade/:id` avec affichage
3. Implémenter "Contacter le vendeur"

### 🟢 BONUS (UX)
1. Drag & drop photos
2. Autocomplete avancé localisation
3. Preview images avant upload
4. Notifications en temps réel

---

## 🚀 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

```
1. 🗄️ Migration DB                    (5 min)
2. 🗂️ Storage bucket                  (2 min)
3. 📝 Formulaire basique /create-trade (2-3h)
4. 🔍 Page consultation /trade/:id    (1-2h)
5. 💬 Fonction contact vendeur        (30 min)
6. ✨ Améliorations UX                (selon temps)
```

---

## ❓ EN CAS DE PROBLÈME

### Erreurs de contraintes
→ Vérifier que la validation côté frontend correspond aux contraintes SQL

### RLS bloque l'accès
→ Vérifier que `seller_id = auth.uid()` lors de la création

### Images non uploadées
→ Vérifier que le bucket existe et est public (ou policies configurées)

### Conversation non créée
→ Vérifier que l'utilisateur n'est pas le vendeur

---

**🎉 Tout est prêt pour l'implémentation !**

**Commencez par :** `supabase db reset` 🚀

