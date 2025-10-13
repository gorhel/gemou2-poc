# 📊 Résumé des Implications Base de Données - Fonctionnalité Trade/Marketplace

## 🎯 Vue d'ensemble

Cette analyse couvre toutes les implications de base de données pour la fonctionnalité de création d'annonces de vente et d'échange de jeux de société.

---

## ✅ Tables Existantes Utilisées

### 1. **`marketplace_items`** ✓ (Existe déjà)
**Utilisation** : Table principale pour stocker les annonces

**Modifications requises** : 
- ➕ 6 nouvelles colonnes
- ➕ 4 contraintes de validation
- ➕ 7 index de performance

### 2. **`games`** ✓ (Existe déjà)
**Utilisation** : Source pour le select de jeux avec recherche

**Modifications requises** : Aucune

### 3. **`profiles`** ✓ (Existe déjà)
**Utilisation** : Informations sur le vendeur (username, avatar, etc.)

**Modifications requises** : Aucune

### 4. **`conversations`** ✓ (Existe déjà)
**Utilisation** : Gérer les conversations entre acheteur et vendeur

**Modifications requises** : 
- ➕ 1 nouvelle colonne (`marketplace_item_id`)
- ➕ 1 index

### 5. **`conversation_members`** ✓ (Existe déjà)
**Utilisation** : Membres des conversations marketplace

**Modifications requises** : Aucune

### 6. **`messages_v2`** ✓ (Existe déjà)
**Utilisation** : Messages entre acheteur et vendeur

**Modifications requises** : Aucune

### 7. **`notifications`** ✓ (Existe déjà)
**Utilisation** : Notifier le vendeur quand on le contacte

**Modifications requises** : Aucune (nouveau type: `'marketplace_contact'`)

---

## 🆕 Nouvelles Colonnes Ajoutées

### Table `marketplace_items`

| Colonne | Type | Nullable | Default | Contrainte |
|---------|------|----------|---------|------------|
| `game_id` | UUID | Oui | NULL | FK → `games(id)` |
| `custom_game_name` | TEXT | Oui | NULL | - |
| `wanted_game` | TEXT | Oui | NULL | Obligatoire si type='exchange' |
| `delivery_available` | BOOLEAN | Non | false | - |
| `location_quarter` | TEXT | Oui | NULL | - |
| `location_city` | TEXT | Oui | NULL | - |

### Table `conversations`

| Colonne | Type | Nullable | Default | Contrainte |
|---------|------|----------|---------|------------|
| `marketplace_item_id` | UUID | Oui | NULL | FK → `marketplace_items(id)` CASCADE |

---

## 🔒 Contraintes de Validation

### Contraintes Métier

1. **`check_game_specification`**
   ```sql
   CHECK (game_id IS NOT NULL OR custom_game_name IS NOT NULL)
   ```
   → Au moins un jeu doit être spécifié

2. **`check_sale_has_price`**
   ```sql
   CHECK (type != 'sale' OR price IS NOT NULL)
   ```
   → Une vente DOIT avoir un prix

3. **`check_exchange_has_wanted_game`**
   ```sql
   CHECK (type != 'exchange' OR wanted_game IS NOT NULL)
   ```
   → Un échange DOIT spécifier le jeu recherché

### Contraintes de Valeurs

4. **`check_condition_values`**
   ```sql
   CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'worn'))
   ```

5. **`check_type_values`**
   ```sql
   CHECK (type IN ('sale', 'exchange'))
   ```

6. **`check_status_values`**
   ```sql
   CHECK (status IN ('draft', 'available', 'sold', 'exchanged', 'closed'))
   ```

---

## 🚀 Index de Performance

| Index | Colonnes | Utilité |
|-------|----------|---------|
| `idx_marketplace_items_seller_id` | seller_id | Mes annonces |
| `idx_marketplace_items_game_id` | game_id | Filtrer par jeu |
| `idx_marketplace_items_type` | type | Ventes vs Échanges |
| `idx_marketplace_items_status` | status | Annonces actives |
| `idx_marketplace_items_location_city` | location_city | Recherche locale |
| `idx_marketplace_items_created_at` | created_at DESC | Tri chronologique |
| `idx_marketplace_items_status_type` | status, type | Filtres combinés |
| `idx_conversations_marketplace_item` | marketplace_item_id | Conversations liées |

---

## 🛡️ Sécurité (RLS Policies)

| Policy | Action | Condition |
|--------|--------|-----------|
| **Public can view published items** | SELECT | `status = 'available'` |
| **Sellers can view own items** | SELECT | `auth.uid() = seller_id` |
| **Authenticated users can create items** | INSERT | `auth.uid() = seller_id` |
| **Sellers can update own items** | UPDATE | `auth.uid() = seller_id` |
| **Sellers can delete own items** | DELETE | `auth.uid() = seller_id` |

---

## 📊 Vue Enrichie

### `marketplace_items_enriched`

**Colonnes supplémentaires** (via JOIN) :
- `seller_username`, `seller_full_name`, `seller_avatar`, `seller_city` ← `profiles`
- `game_name`, `game_photo`, `game_bgg_id`, `game_min_players`, `game_max_players` ← `games`

**Avantage** : Une seule requête pour avoir toutes les infos

---

## ⚙️ Fonction Personnalisée

### `create_marketplace_conversation(p_marketplace_item_id, p_buyer_id)`

**Rôle** : Crée ou récupère une conversation entre acheteur et vendeur

**Logique** :
1. Vérifie que l'acheteur ≠ vendeur
2. Cherche une conversation existante
3. Si n'existe pas → crée conversation + ajoute les 2 membres
4. Retourne `conversation_id`

**Usage TypeScript** :
```typescript
const { data: conversationId } = await supabase.rpc(
  'create_marketplace_conversation',
  {
    p_marketplace_item_id: itemId,
    p_buyer_id: userId
  }
);
```

---

## 🔔 Trigger Automatique

### `on_marketplace_conversation_created`

**Déclencheur** : Après création d'une conversation avec `marketplace_item_id`

**Action** : Crée une notification pour le vendeur

**Payload de notification** :
```json
{
  "conversation_id": "...",
  "marketplace_item_id": "...",
  "item_title": "...",
  "buyer_id": "..."
}
```

---

## 🔄 Flux de Données

### 1️⃣ **Création d'annonce**
```
Formulaire → marketplace_items (INSERT)
         → Contraintes validées
         → RLS vérifie auth.uid() = seller_id
         → Annonce créée ✓
```

### 2️⃣ **Consultation d'annonce**
```
Page /trade/:id → marketplace_items_enriched (SELECT)
              → Récupère infos annonce + vendeur + jeu
              → Affiche tout ✓
```

### 3️⃣ **Contacter le vendeur**
```
Clic "Contacter" → create_marketplace_conversation()
                → Vérifications
                → Crée/récupère conversation
                → Trigger notification
                → Vendeur notifié ✓
                → Redirection vers conversation ✓
```

### 4️⃣ **Recherche d'annonces**
```
Filtres → marketplace_items_enriched (SELECT avec WHERE)
       → Index utilisés
       → Résultats rapides ✓
```

---

## 📋 Checklist de Migration

### Avant la migration
- [x] Analyser le schéma existant
- [x] Identifier les tables impactées
- [x] Concevoir les nouvelles colonnes
- [x] Définir les contraintes
- [x] Planifier les index
- [x] Rédiger les policies RLS

### Migration
- [ ] Sauvegarder la base de données
- [ ] Appliquer la migration SQL
- [ ] Vérifier les contraintes
- [ ] Tester les policies RLS
- [ ] Valider les index

### Après la migration
- [ ] Tester la création d'annonces
- [ ] Tester les conversations
- [ ] Tester les notifications
- [ ] Vérifier les performances
- [ ] Documenter les changements

---

## 🧪 Scénarios de Test

### ✅ Tests à valider

1. **Création annonce vente avec jeu en base**
   - `type='sale'`, `game_id` rempli, `price` rempli
   - ✓ Doit réussir

2. **Création annonce vente sans prix**
   - `type='sale'`, `price=NULL`
   - ✗ Doit échouer (contrainte)

3. **Création annonce échange sans wanted_game**
   - `type='exchange'`, `wanted_game=NULL`
   - ✗ Doit échouer (contrainte)

4. **Création annonce avec jeu personnalisé**
   - `game_id=NULL`, `custom_game_name='Mon jeu'`
   - ✓ Doit réussir

5. **Création annonce sans jeu**
   - `game_id=NULL`, `custom_game_name=NULL`
   - ✗ Doit échouer (contrainte)

6. **Consultation annonce publique**
   - Utilisateur non connecté
   - ✓ Peut voir annonces `status='available'`

7. **Consultation annonce brouillon**
   - Utilisateur non propriétaire
   - ✗ Ne peut pas voir (RLS)

8. **Consultation mes brouillons**
   - Utilisateur propriétaire
   - ✓ Peut voir (RLS)

9. **Modifier annonce d'un autre**
   - `seller_id != auth.uid()`
   - ✗ Refusé (RLS)

10. **Contacter le vendeur**
    - Acheteur ≠ vendeur
    - ✓ Conversation créée + notification envoyée

11. **Se contacter soi-même**
    - Acheteur = vendeur
    - ✗ Exception levée

12. **Contacter 2 fois**
    - Même acheteur + même annonce
    - ✓ Retourne la conversation existante

---

## 📁 Fichiers Générés

| Fichier | Description |
|---------|-------------|
| `supabase/migrations/20251009120000_add_marketplace_trade_features.sql` | Migration SQL complète |
| `MARKETPLACE_MIGRATION_GUIDE.md` | Guide d'utilisation avec exemples |
| `apps/web/types/marketplace.ts` | Types TypeScript + helpers |
| `DATABASE_IMPLICATIONS_RESUME.md` | Ce document récapitulatif |

---

## 🎯 Prochaines Étapes

### Côté Backend (Supabase)
1. ✅ Appliquer la migration
2. ✅ Tester en local avec `supabase db reset`
3. ✅ Valider avec les scénarios de test
4. ⏳ Déployer en production

### Côté Frontend (Next.js)
1. ⏳ Créer le formulaire `/create-trade`
2. ⏳ Créer la page `/trade/:id`
3. ⏳ Intégrer l'autocomplete localisation
4. ⏳ Gérer l'upload d'images
5. ⏳ Implémenter "Contacter le vendeur"
6. ⏳ Afficher les notifications

### API / Intégrations
1. ⏳ API autocomplete géographique (La Réunion)
2. ⏳ Upload images vers Supabase Storage
3. ⏳ Notifications en temps réel

---

## 💡 Recommandations

### Performance
- ✅ Les index créés couvrent les cas d'usage principaux
- ✅ La vue enrichie évite les multiples requêtes
- 💡 Envisager une pagination (LIMIT/OFFSET) pour les listes

### Sécurité
- ✅ RLS activé et configuré
- ✅ Contraintes de validation en place
- 💡 Valider aussi côté frontend pour meilleure UX

### UX
- 💡 Précharger la liste des villes de La Réunion
- 💡 Autocomplete intelligent (quartier + ville)
- 💡 Preview des images avant upload
- 💡 Sauvegarde automatique en draft

### Monitoring
- 💡 Logger les erreurs de contraintes
- 💡 Tracker les conversations créées
- 💡 Analyser les recherches populaires

---

## 📞 Support

Pour toute question technique :
1. Consulter `MARKETPLACE_MIGRATION_GUIDE.md` pour les exemples
2. Consulter `apps/web/types/marketplace.ts` pour les types
3. Consulter la migration SQL pour les détails techniques

---

**✅ Tous les impacts base de données ont été identifiés et documentés !**

**🚀 Prêt pour l'implémentation !**

