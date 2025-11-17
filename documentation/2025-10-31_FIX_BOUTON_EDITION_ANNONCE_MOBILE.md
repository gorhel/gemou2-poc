# Fix : Bouton d'édition d'annonce invisible sur mobile (Trade)

**Date** : 31 octobre 2025  
**Ticket** : OUT-222  
**Environnement** : Mobile (React Native / Expo)  
**Fichier concerné** : `apps/mobile/app/trade/[id].tsx`

---

## 🎯 Problème identifié

Sur la page de détails d'une annonce (`/trade/[id]`) en version mobile, le bouton **"✏️ Modifier l'annonce"** n'apparaissait pas pour le propriétaire de l'annonce.

### Symptômes
- ❌ Le bouton d'édition était invisible même pour le propriétaire
- ✅ Le badge "⭐ Votre annonce" était également invisible
- ✅ La condition `isOwner` retournait systématiquement `false`

---

## 🔍 Diagnostic

### Cause racine
Une **migration de base de données** effectuée le 21 octobre 2025 a renommé la colonne `user_id` en `seller_id` dans la table `marketplace_items`.

**Migration concernée** : `20251021_fix_marketplace_seller_id.sql`

```sql
-- Migration qui a causé le problème
ALTER TABLE marketplace_items RENAME COLUMN user_id TO seller_id;
```

### Code problématique (avant fix)
```typescript
// Ligne 117 - Version originale
const isOwner = user?.id === item.user_id; // ❌ item.user_id est maintenant undefined
```

### Logs de débogage
```javascript
🔍 DEBUG - User ID: 08ef5d82-52c9-41d1-8d6d-b2dc1772a153
🔍 DEBUG - Item data: {
  id: '7df98ad3-7b65-4dd3-8a51-8e2ea7e455d5',
  title: 'testbis',
  user_id: undefined,              // ❌ Colonne n'existe plus
  seller_id: '08ef5d82-52c9-41d1-8d6d-b2dc1772a153', // ✅ Nouvelle colonne
  all_fields: Array(19)
}
🔍 DEBUG - isOwner check: {
  userId: '08ef5d82-52c9-41d1-8d6d-b2dc1772a153',
  itemUserId: undefined,           // ❌ Ancien nom
  itemSellerId: '08ef5d82-52c9-41d1-8d6d-b2dc1772a153', // ✅ Nouveau nom
  sellerId: '08ef5d82-52c9-41d1-8d6d-b2dc1772a153',
  isOwner: true                    // ✅ Fonctionne avec le fix
}
```

---

## ✅ Solution appliquée

### Modification du code
**Fichier** : `apps/mobile/app/trade/[id].tsx`

#### 1. Mise à jour de la fonction `loadTrade` (ligne 45-46)
```typescript
// Support pour les deux noms de colonnes (migration en cours)
const sellerId = itemData.seller_id || itemData.user_id;

const { data: sellerData } = await supabase
  .from('profiles')
  .select('id, username, full_name, avatar_url, city')
  .eq('id', sellerId)  // ✅ Utilise le bon ID
  .single();
```

#### 2. Mise à jour de la vérification `isOwner` (ligne 120-122)
```typescript
// Support pour les deux noms de colonnes (migration en cours)
const sellerId = item?.seller_id || item?.user_id;
const isOwner = user?.id === sellerId;  // ✅ Compare correctement
```

### Avantages de cette approche
- ✅ **Rétrocompatibilité** : Supporte les deux noms de colonnes
- ✅ **Migration progressive** : Fonctionne pendant la transition
- ✅ **Pas de breaking change** : Les anciennes données fonctionnent toujours
- ✅ **Fallback gracieux** : `itemData.seller_id || itemData.user_id`

---

## 🧪 Validation

### Tests effectués
1. ✅ **Affichage du bouton d'édition** : Le bouton apparaît bien pour le propriétaire
2. ✅ **Badge propriétaire** : Le badge "⭐ Votre annonce" s'affiche
3. ✅ **Navigation vers l'édition** : Le clic redirige vers `/(tabs)/create-trade?id=${id}`
4. ✅ **Non-propriétaire** : Le bouton "Contacter le vendeur" s'affiche pour les autres utilisateurs

### Logs de confirmation
```javascript
isOwner: true  // ✅ Détection correcte du propriétaire
sellerId: '08ef5d82-52c9-41d1-8d6d-b2dc1772a153'  // ✅ ID correct
```

---

## 📊 Impact et structure de la page

### Arborescence des composants - Page `/trade/[id]` (Mobile)

```
TradeDetailsPage
├── ScrollView (container principal avec RefreshControl)
│   ├── View (header)
│   │   └── TopHeader (composant de navigation)
│   │
│   └── View (content)
│       ├── View (typeContainer)
│       │   ├── Text (typeEmoji) - 💰/🔄/🎁
│       │   └── View (typeBadge)
│       │       └── Text (typeBadgeText) - "Vente"/"Échange"/"Don"
│       │
│       ├── Text (title) - Titre de l'annonce
│       ├── Text (price) - Prix si vente
│       │
│       ├── View (metaContainer) - Carte d'informations
│       │   ├── View (metaItem) - État du jeu
│       │   ├── View (metaItem) - Localisation
│       │   └── View (metaItem) - Vendeur (lien cliquable)
│       │
│       ├── View (descriptionContainer)
│       │   ├── Text (descriptionTitle)
│       │   └── Text (description)
│       │
│       ├── View (wantedContainer) - Si échange
│       │   ├── Text (wantedTitle)
│       │   └── Text (wantedText)
│       │
│       ├── [Conditionnel: !isOwner]
│       │   └── TouchableOpacity (contactButton)
│       │       └── Text - "💬 Contacter le vendeur"
│       │
│       └── [Conditionnel: isOwner] ✅ FIX APPLIQUÉ ICI
│           ├── TouchableOpacity (editButton) ✅
│           │   └── Text - "✏️ Modifier l'annonce"
│           └── View (ownerBadge) ✅
│               └── Text - "⭐ Votre annonce"
```

### États de la page
```typescript
const [item, setItem] = useState<any>(null)           // Données de l'annonce
const [seller, setSeller] = useState<any>(null)       // Données du vendeur
const [loading, setLoading] = useState(true)          // État de chargement
const [refreshing, setRefreshing] = useState(false)   // État pull-to-refresh
const [user, setUser] = useState<any>(null)           // Utilisateur connecté
```

### Variables dérivées
```typescript
const sellerId = item?.seller_id || item?.user_id  // ✅ Support migration
const isOwner = user?.id === sellerId              // ✅ Détection propriétaire
```

---

## 🔄 Flux de données

```
1. Chargement de la page (/trade/[id])
   │
   ├─→ loadTrade()
   │   ├─→ supabase.auth.getUser()
   │   │   └─→ setUser(user) ✅
   │   │
   │   ├─→ supabase.from('marketplace_items').select('*')
   │   │   └─→ setItem(itemData)
   │   │   └─→ Extraction: sellerId = itemData.seller_id || itemData.user_id ✅
   │   │
   │   └─→ supabase.from('profiles').select(...)
   │       └─→ setSeller(sellerData)
   │
   └─→ Calcul: isOwner = user?.id === sellerId ✅
       │
       ├─→ Si isOwner = true:
       │   ├─→ Affiche: TouchableOpacity (editButton) ✅
       │   └─→ Affiche: View (ownerBadge) ✅
       │
       └─→ Si isOwner = false:
           └─→ Affiche: TouchableOpacity (contactButton)
```

---

## 📝 Points de vigilance

### Migration de base de données
La colonne `user_id` a été remplacée par `seller_id` dans :
- ✅ Table `marketplace_items`
- ✅ Politiques RLS (Row Level Security)
- ✅ Index de base de données
- ✅ Vue enrichie `marketplace_items_enriched`
- ✅ Fonction `create_marketplace_conversation()`

### Cohérence du code
- ✅ **Mobile** : Corrigé dans `apps/mobile/app/trade/[id].tsx`
- ⚠️ **Web** : À vérifier dans `apps/web/app/trade/[id]/page.tsx` si nécessaire

---

## 🚀 Recommandations

### Court terme
1. ✅ **Vérifier la version web** : Appliquer le même fix si nécessaire
2. ✅ **Tests E2E** : Valider le flux complet d'édition d'annonce
3. ✅ **Documentation** : Informer l'équipe de la migration de colonne

### Long terme
1. **Uniformisation** : Une fois la migration terminée, retirer le fallback `|| item?.user_id`
2. **Types TypeScript** : Créer une interface `MarketplaceItem` avec `seller_id`
3. **Tests unitaires** : Ajouter des tests pour la condition `isOwner`

---

## 📦 Fichiers modifiés

```
apps/mobile/app/trade/[id].tsx
├── loadTrade() - Ligne 45-46
└── isOwner calculation - Ligne 120-122
```

---

## 🔗 Références

- **Migration SQL** : `supabase/migrations/20251021_fix_marketplace_seller_id.sql`
- **Documentation Supabase** : [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- **Ticket Linear** : OUT-222

---

## ✨ Résultat final

- ✅ Le bouton "✏️ Modifier l'annonce" s'affiche correctement
- ✅ Le badge "⭐ Votre annonce" est visible
- ✅ La navigation vers l'édition fonctionne
- ✅ Le code supporte la migration progressive de la base de données
- ✅ Aucun breaking change pour les utilisateurs

**Status** : ✅ **RÉSOLU**






