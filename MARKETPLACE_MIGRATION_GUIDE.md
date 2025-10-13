# 📋 Guide de Migration Marketplace - Ventes & Échanges

## 📅 Date de migration
**2025-10-09** - Ajout des fonctionnalités de trade/marketplace

---

## 🎯 Objectif
Permettre aux utilisateurs de créer des annonces pour **vendre** ou **échanger** des jeux de société à La Réunion.

---

## ✅ Modifications apportées

### 1. **Nouvelles colonnes dans `marketplace_items`**

| Colonne | Type | Description |
|---------|------|-------------|
| `game_id` | UUID | Référence vers la table `games` (nullable) |
| `custom_game_name` | TEXT | Nom personnalisé si jeu non trouvé en base |
| `wanted_game` | TEXT | Jeu recherché en échange (obligatoire si type='exchange') |
| `delivery_available` | BOOLEAN | Livraison disponible ? |
| `location_quarter` | TEXT | Quartier à La Réunion |
| `location_city` | TEXT | Ville à La Réunion |

### 2. **Nouvelle colonne dans `conversations`**

| Colonne | Type | Description |
|---------|------|-------------|
| `marketplace_item_id` | UUID | Lien vers l'annonce marketplace |

### 3. **Contraintes de validation**

- ✅ Au moins `game_id` OU `custom_game_name` doit être rempli
- ✅ Si `type='sale'` → `price` obligatoire
- ✅ Si `type='exchange'` → `wanted_game` obligatoire
- ✅ `condition` doit être: `'new' | 'excellent' | 'good' | 'fair' | 'worn'`
- ✅ `type` doit être: `'sale' | 'exchange'`
- ✅ `status` doit être: `'draft' | 'available' | 'sold' | 'exchanged' | 'closed'`

### 4. **Index créés** (pour les performances)

```sql
idx_marketplace_items_seller_id
idx_marketplace_items_game_id
idx_marketplace_items_type
idx_marketplace_items_status
idx_marketplace_items_location_city
idx_marketplace_items_created_at
idx_marketplace_items_status_type
idx_conversations_marketplace_item
```

### 5. **RLS Policies**

- 🔓 Tout le monde peut voir les annonces `status='available'`
- 🔒 Les vendeurs peuvent voir leurs propres annonces (même en draft)
- ✏️ Les utilisateurs authentifiés peuvent créer des annonces
- 🔧 Les vendeurs peuvent modifier/supprimer leurs annonces

### 6. **Vue enrichie : `marketplace_items_enriched`**

Combine automatiquement les données de :
- `marketplace_items`
- `profiles` (vendeur)
- `games` (jeu)

### 7. **Fonction : `create_marketplace_conversation()`**

Crée ou récupère une conversation entre acheteur et vendeur.

### 8. **Trigger de notification**

Notifie automatiquement le vendeur quand quelqu'un le contacte.

---

## 🚀 Exemples d'utilisation

### **1. Créer une annonce de VENTE**

```typescript
const { data, error } = await supabase
  .from('marketplace_items')
  .insert({
    title: "Catan - Extension Marins",
    description: "Extension complète, excellent état",
    game_id: "uuid-du-jeu-en-base", // OU custom_game_name si pas en base
    condition: "excellent",
    type: "sale",
    price: 25.00,
    location_quarter: "Le Moufia",
    location_city: "Saint-Denis",
    delivery_available: true,
    seller_id: userId,
    images: ["url1.jpg", "url2.jpg"],
    status: "available" // ou "draft"
  });
```

### **2. Créer une annonce d'ÉCHANGE**

```typescript
const { data, error } = await supabase
  .from('marketplace_items')
  .insert({
    title: "7 Wonders Duel",
    description: "Jeu en bon état, toutes les pièces présentes",
    game_id: "uuid-du-jeu",
    condition: "good",
    type: "exchange",
    wanted_game: "Wingspan ou Terraforming Mars",
    location_quarter: "Terre Sainte",
    location_city: "Saint-Pierre",
    delivery_available: false,
    seller_id: userId,
    images: ["url1.jpg"],
    status: "available"
  });
```

### **3. Jeu personnalisé (non en base)**

```typescript
const { data, error } = await supabase
  .from('marketplace_items')
  .insert({
    title: "Jeu artisanal créole",
    custom_game_name: "Dominos Créoles Edition Limitée",
    description: "Jeu fait main, pièces en bois",
    condition: "new",
    type: "sale",
    price: 40.00,
    location_city: "Saint-Paul",
    seller_id: userId,
    status: "available"
  });
```

### **4. Récupérer les annonces (avec infos enrichies)**

```typescript
// Toutes les annonces de vente disponibles
const { data, error } = await supabase
  .from('marketplace_items_enriched')
  .select('*')
  .eq('type', 'sale')
  .eq('status', 'available')
  .order('created_at', { ascending: false });

// Résultat inclut automatiquement:
// - seller_username, seller_avatar, seller_city
// - game_name, game_photo, game_bgg_id
```

### **5. Filtrer par ville**

```typescript
const { data, error } = await supabase
  .from('marketplace_items_enriched')
  .select('*')
  .eq('status', 'available')
  .eq('location_city', 'Saint-Denis');
```

### **6. Rechercher des échanges**

```typescript
const { data, error } = await supabase
  .from('marketplace_items_enriched')
  .select('*')
  .eq('type', 'exchange')
  .eq('status', 'available')
  .ilike('wanted_game', '%wingspan%');
```

### **7. Contacter le vendeur**

```typescript
// Créer une conversation
const { data: conversationId, error } = await supabase
  .rpc('create_marketplace_conversation', {
    p_marketplace_item_id: 'uuid-annonce',
    p_buyer_id: userId
  });

// Envoyer un message
const { data: message, error: msgError } = await supabase
  .from('messages_v2')
  .insert({
    conversation_id: conversationId,
    sender_id: userId,
    content: "Bonjour, je suis intéressé par votre annonce !"
  });
```

### **8. Obtenir une annonce avec le vendeur**

```typescript
const { data, error } = await supabase
  .from('marketplace_items_enriched')
  .select('*')
  .eq('id', itemId)
  .single();

// Accès direct à:
// data.seller_username → pour afficher
// data.seller_id → pour créer lien vers /profile/:username
```

### **9. Mes annonces (vendeur)**

```typescript
const { data, error } = await supabase
  .from('marketplace_items')
  .select('*')
  .eq('seller_id', userId)
  .order('created_at', { ascending: false });
```

### **10. Sauvegarder en brouillon**

```typescript
const { data, error } = await supabase
  .from('marketplace_items')
  .insert({
    title: "Mon annonce",
    custom_game_name: "Un jeu",
    condition: "good",
    type: "sale",
    price: 20,
    seller_id: userId,
    status: "draft" // 🔑 Pas visible publiquement
  });
```

### **11. Publier une annonce**

```typescript
const { data, error } = await supabase
  .from('marketplace_items')
  .update({ status: 'available' })
  .eq('id', itemId)
  .eq('seller_id', userId); // RLS vérifie automatiquement
```

### **12. Marquer comme vendu/échangé**

```typescript
// Vendu
await supabase
  .from('marketplace_items')
  .update({ status: 'sold' })
  .eq('id', itemId)
  .eq('seller_id', userId);

// Échangé
await supabase
  .from('marketplace_items')
  .update({ status: 'exchanged' })
  .eq('id', itemId)
  .eq('seller_id', userId);
```

---

## 🔔 Notifications

Lorsqu'un acheteur contacte un vendeur, une notification est automatiquement créée :

```typescript
// Récupérer les notifications marketplace
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('type', 'marketplace_contact')
  .is('read_at', null);

// Payload contient:
// {
//   conversation_id: "...",
//   marketplace_item_id: "...",
//   item_title: "...",
//   buyer_id: "..."
// }
```

---

## 🎨 Mapping des valeurs pour l'UI

### **Condition du jeu**

```typescript
const conditionLabels = {
  new: "Neuf",
  excellent: "Très bon état",
  good: "Bon état",
  fair: "État correct",
  worn: "Usé"
};
```

### **Status de l'annonce**

```typescript
const statusLabels = {
  draft: "Brouillon",
  available: "Disponible",
  sold: "Vendu",
  exchanged: "Échangé",
  closed: "Fermé"
};
```

### **Type de transaction**

```typescript
const typeLabels = {
  sale: "Vente",
  exchange: "Échange"
};
```

---

## 🛣️ Routes suggérées

- `/create-trade` → Formulaire de création d'annonce
- `/trade/:id` → Page de détail d'une annonce
- `/marketplace` → Liste des annonces
- `/profile/:username` → Profil du vendeur

---

## ⚠️ Points d'attention

1. **Images** : Le champ `images` est un ARRAY. Gérer l'upload vers Supabase Storage
2. **Validation** : Les contraintes SQL rejettent les données invalides - gérer les erreurs côté frontend
3. **RLS** : Un utilisateur ne peut modifier que ses propres annonces
4. **Conversations** : Utiliser la fonction `create_marketplace_conversation()` pour éviter les doublons

---

## 🧪 Tests à effectuer

- ✅ Créer une vente avec jeu de la base
- ✅ Créer une vente avec jeu personnalisé
- ✅ Créer un échange
- ✅ Tenter de publier une vente sans prix (doit échouer)
- ✅ Tenter de publier un échange sans wanted_game (doit échouer)
- ✅ Sauvegarder en brouillon
- ✅ Publier un brouillon
- ✅ Contacter un vendeur
- ✅ Vérifier les notifications
- ✅ Modifier sa propre annonce
- ✅ Tenter de modifier l'annonce d'un autre (doit échouer)

---

## 📞 Support

Pour toute question sur cette migration, consultez les fichiers :
- Migration SQL : `/supabase/migrations/20251009120000_add_marketplace_trade_features.sql`
- Ce guide : `/MARKETPLACE_MIGRATION_GUIDE.md`

---

**🎉 La migration est prête à être appliquée !**

Pour l'appliquer :
```bash
supabase db reset  # En local
# OU
supabase db push   # En production (après tests)
```

