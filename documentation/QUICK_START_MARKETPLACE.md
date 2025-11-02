# 🚀 Quick Start - Marketplace Trade

## 📦 Ce qui a été généré

```
✅ Migration SQL complète
   → supabase/migrations/20251009120000_add_marketplace_trade_features.sql

✅ Guide détaillé avec exemples
   → MARKETPLACE_MIGRATION_GUIDE.md

✅ Types TypeScript + Helpers
   → apps/web/types/marketplace.ts

✅ Résumé des implications DB
   → DATABASE_IMPLICATIONS_RESUME.md
```

---

## ⚡ Démarrage Rapide

### 1. Appliquer la migration

```bash
# En local
cd /Users/essykouame/Downloads/gemou2-poc
supabase db reset

# OU en production (après tests)
supabase db push
```

### 2. Importer les types dans votre code

```typescript
import {
  MarketplaceItemEnriched,
  CreateMarketplaceItemForm,
  validateMarketplaceForm,
  CONDITION_LABELS,
  TYPE_LABELS,
  getLocationOptions
} from '@/types/marketplace';
```

### 3. Créer une annonce (exemple minimal)

```typescript
const form: CreateMarketplaceItemForm = {
  title: "Catan",
  condition: "excellent",
  type: "sale",
  price: 25,
  game_id: "uuid-du-jeu",
  location_city: "Saint-Denis",
  delivery_available: false,
  status: "available"
};

const { valid, errors } = validateMarketplaceForm(form);

if (valid) {
  const { data, error } = await supabase
    .from('marketplace_items')
    .insert({ ...form, seller_id: userId });
}
```

### 4. Récupérer les annonces

```typescript
const { data, error } = await supabase
  .from('marketplace_items_enriched')
  .select('*')
  .eq('status', 'available')
  .order('created_at', { ascending: false });

// data contient automatiquement:
// - Infos annonce
// - Infos vendeur (username, avatar, city)
// - Infos jeu (name, photo, bgg_id)
```

### 5. Contacter le vendeur

```typescript
const { data: conversationId } = await supabase.rpc(
  'create_marketplace_conversation',
  {
    p_marketplace_item_id: itemId,
    p_buyer_id: userId
  }
);

// Redirige vers la conversation
router.push(`/messages/${conversationId}`);
```

---

## 📊 Structure de la Base

### Colonnes ajoutées à `marketplace_items`
- `game_id` - Lien vers `games` table
- `custom_game_name` - Jeu personnalisé
- `wanted_game` - Pour les échanges
- `delivery_available` - Boolean
- `location_quarter` - Quartier
- `location_city` - Ville

### Contraintes automatiques
- ✅ Si vente → prix obligatoire
- ✅ Si échange → wanted_game obligatoire
- ✅ Au moins game_id OU custom_game_name

### Sécurité (RLS)
- 🔓 Public voit `status='available'`
- 🔒 Vendeur voit ses drafts
- ✏️ Seul le vendeur peut modifier/supprimer

---

## 🎨 Mapping des Valeurs

```typescript
// États du jeu
'new' → 'Neuf'
'excellent' → 'Très bon état'
'good' → 'Bon état'
'fair' → 'État correct'
'worn' → 'Usé'

// Types
'sale' → 'Vente'
'exchange' → 'Échange'

// Status
'draft' → 'Brouillon'
'available' → 'Disponible'
'sold' → 'Vendu'
'exchanged' → 'Échangé'
'closed' → 'Fermé'
```

---

## 🔔 Notifications

Quand un acheteur contacte un vendeur :
- ✅ Notification automatique créée
- ✅ Type: `'marketplace_contact'`
- ✅ Payload contient: `conversation_id`, `item_title`, `buyer_id`

---

## 🧪 Test Rapide

```sql
-- Insérer une annonce de test
INSERT INTO marketplace_items (
  title, 
  custom_game_name,
  condition,
  type,
  price,
  location_city,
  delivery_available,
  seller_id,
  status
) VALUES (
  'Test Annonce',
  'Jeu Test',
  'good',
  'sale',
  20.00,
  'Saint-Denis',
  true,
  auth.uid(),
  'available'
);

-- Voir les annonces enrichies
SELECT * FROM marketplace_items_enriched;
```

---

## 📖 Documentation Complète

| Fichier | Contenu |
|---------|---------|
| `MARKETPLACE_MIGRATION_GUIDE.md` | 12 exemples d'utilisation détaillés |
| `apps/web/types/marketplace.ts` | Types, helpers, validators |
| `DATABASE_IMPLICATIONS_RESUME.md` | Analyse complète des impacts |

---

## ✅ Checklist Implémentation Frontend

### Page `/create-trade` (Formulaire)
- [ ] Toggle Vente ⟷ Échange
- [ ] Input titre
- [ ] Select jeu (avec option "Mon jeu n'est pas dans la liste")
- [ ] Select état
- [ ] Textarea description
- [ ] Autocomplete localisation (quartier, ville)
- [ ] Upload photos (drag & drop)
- [ ] Input prix (si vente)
- [ ] Input jeu recherché (si échange)
- [ ] Toggle livraison
- [ ] Bouton "Enregistrer et quitter" (status='draft')
- [ ] Bouton "Publier" (status='available')

### Page `/trade/:id` (Consultation)
- [ ] Galerie photos
- [ ] Titre + description
- [ ] État du jeu
- [ ] Prix OU jeu recherché
- [ ] Localisation
- [ ] Livraison disponible
- [ ] Infos vendeur (username → lien `/profile/:username`)
- [ ] Bouton "Contacter le vendeur"
- [ ] Bouton "Voir la fiche du jeu"

---

## 🎯 Prochaine Étape

**Appliquer la migration** :
```bash
supabase db reset
```

Puis implémenter le formulaire `/create-trade` ! 🚀

---

Bonne implémentation ! 🎮

