# Guide de diagnostic : Marketplace vide

**Date**: 27 octobre 2025  
**Problème**: Aucune annonce n'apparaît sur la route `/marketplace`  
**Statut**: En diagnostic

## 🔍 Changements effectués pour le diagnostic

### 1. Modification du mode debug

Le fichier `apps/mobile/app/(tabs)/marketplace.tsx` a été modifié temporairement pour inclure des logs de diagnostic :

```typescript
// Test 1 : Charger TOUTES les données sans filtre
const { data: allData, error: testError } = await supabase
  .from('marketplace_items')
  .select('*')
  .limit(5);

console.log('🔍 DEBUG - All marketplace items:', allData);
console.log('🔍 DEBUG - Error:', testError);

// Test 2 : Charger avec les filtres (sans status pour l'instant)
let query = supabase
  .from('marketplace_items')
  .select('*')
  .order('created_at', { ascending: false });

// Le filtre de status est commenté temporairement
// .eq('status', 'available')
```

### 2. Correction du status

Le status a été changé de `'active'` à `'available'` pour correspondre au schéma de la base de données.

## 📋 Étapes de diagnostic

### Étape 1 : Vérifier les logs de la console

Après le rechargement de la page `/marketplace`, vérifiez la console :

#### **Cas 1 : Erreur de table**
```
❌ Error: relation "marketplace_items" does not exist
```

**Solution** : La table n'existe pas. Vous devez créer la table ou utiliser une vue enrichie.

#### **Cas 2 : Table vide**
```
🔍 DEBUG - All marketplace items: []
🔍 DEBUG - Error: null
✅ Marketplace items loaded: 0
```

**Solution** : La table existe mais est vide. Vous devez créer des données de test (voir section suivante).

#### **Cas 3 : Données avec mauvais status**
```
🔍 DEBUG - All marketplace items: [
  { id: '...', title: '...', status: 'draft', ... },
  { id: '...', title: '...', status: 'sold', ... }
]
✅ Marketplace items loaded: 0
```

**Solution** : Les données existent mais ont un status différent. Mettez à jour le filtre ou changez le status des données.

#### **Cas 4 : Données OK mais pas affichées**
```
🔍 DEBUG - All marketplace items: [...]
✅ Marketplace items loaded: 5
📦 Items: [array of 5 items]
```

**Solution** : Problème d'affichage dans l'UI. Vérifiez le rendu des composants.

## 🗄️ Structure de la base de données

### Table attendue : `marketplace_items`

```sql
CREATE TABLE marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sale', 'exchange', 'donation')),
  condition TEXT,
  price NUMERIC,
  location_city TEXT,
  location_quarter TEXT,
  images TEXT[],
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('draft', 'available', 'sold', 'exchanged', 'closed')),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Valeurs attendues pour `status`

| Status | Description | Affiché ? |
|--------|-------------|-----------|
| `draft` | Brouillon | ❌ Non |
| `available` | Disponible | ✅ Oui |
| `sold` | Vendu | ❌ Non |
| `exchanged` | Échangé | ❌ Non |
| `closed` | Fermé | ❌ Non |

### Valeurs attendues pour `type`

| Type | Emoji | Description |
|------|-------|-------------|
| `sale` | 💰 | Vente |
| `exchange` | 🔄 | Échange |
| `donation` | 🎁 | Don |

## 🧪 Création de données de test

### Option 1 : Via l'interface Supabase (SQL Editor)

```sql
-- Insérer des annonces de test
INSERT INTO marketplace_items (title, description, type, condition, price, location_city, status, user_id, images)
VALUES
  -- Annonce de vente
  (
    'Monopoly Edition 2024',
    'Jeu de société en excellent état, complet avec toutes les pièces',
    'sale',
    'excellent',
    45.00,
    'Saint-Denis',
    'available',
    (SELECT id FROM auth.users LIMIT 1), -- Remplacez par votre user_id
    ARRAY['https://picsum.photos/400/300?random=1']
  ),
  
  -- Annonce d'échange
  (
    'Catan - Édition Voyageurs',
    'Cherche à échanger contre Azul ou Splendor',
    'exchange',
    'good',
    NULL,
    'Saint-Pierre',
    'available',
    (SELECT id FROM auth.users LIMIT 1),
    ARRAY['https://picsum.photos/400/300?random=2']
  ),
  
  -- Annonce de don
  (
    'Jeu de 7 Familles',
    'Je donne ce jeu de cartes pour enfants',
    'donation',
    'fair',
    NULL,
    'Saint-Paul',
    'available',
    (SELECT id FROM auth.users LIMIT 1),
    NULL
  ),
  
  -- Annonce de vente avec image
  (
    'Risk - Version Classique',
    'Jeu de stratégie complet, quelques pièces usées',
    'sale',
    'good',
    30.00,
    'Le Tampon',
    'available',
    (SELECT id FROM auth.users LIMIT 1),
    ARRAY['https://picsum.photos/400/300?random=3']
  );
```

### Option 2 : Via l'application (Route /create-trade)

1. Aller sur la route `/create-trade`
2. Remplir le formulaire de création d'annonce
3. Publier l'annonce avec le status `'available'`

### Option 3 : Via un script de seed

Créer un fichier `scripts/seed-marketplace.ts` :

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Clé service pour bypass RLS
)

async function seedMarketplace() {
  const { data: users } = await supabase.auth.admin.listUsers()
  const userId = users.users[0]?.id

  if (!userId) {
    console.error('No users found. Please create a user first.')
    return
  }

  const testItems = [
    {
      title: 'Monopoly Edition 2024',
      description: 'Jeu de société en excellent état',
      type: 'sale',
      condition: 'excellent',
      price: 45.00,
      location_city: 'Saint-Denis',
      status: 'available',
      user_id: userId,
      images: ['https://picsum.photos/400/300?random=1']
    },
    // ... autres items
  ]

  const { data, error } = await supabase
    .from('marketplace_items')
    .insert(testItems)

  if (error) {
    console.error('Error seeding:', error)
  } else {
    console.log('✅ Seeded', data?.length, 'items')
  }
}

seedMarketplace()
```

## 🔧 Solutions selon le diagnostic

### Solution 1 : La table n'existe pas

**Créer la table** :

```sql
-- Voir la structure complète dans la section "Structure de la base de données"
CREATE TABLE marketplace_items (...);

-- Ajouter les indexes pour les performances
CREATE INDEX idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX idx_marketplace_items_type ON marketplace_items(type);
CREATE INDEX idx_marketplace_items_created_at ON marketplace_items(created_at DESC);
```

### Solution 2 : Problème de permissions (RLS)

Si vous avez des erreurs de permissions, vérifiez les Row Level Security policies :

```sql
-- Voir toutes les annonces disponibles (lecture publique)
CREATE POLICY "Public can view available items"
  ON marketplace_items
  FOR SELECT
  USING (status = 'available');

-- L'utilisateur peut créer ses propres annonces
CREATE POLICY "Users can create their own items"
  ON marketplace_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- L'utilisateur peut modifier ses propres annonces
CREATE POLICY "Users can update their own items"
  ON marketplace_items
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### Solution 3 : Utiliser la vue enrichie

Si vous préférez utiliser la vue enrichie (comme sur le web) :

**Modifier la requête dans le code** :

```typescript
const { data: itemsData, error: itemsError } = await supabase
  .from('marketplace_items_enriched') // Au lieu de marketplace_items
  .select('*')
  .eq('status', 'available')
  .order('created_at', { ascending: false })
  .limit(20);
```

**Créer la vue si elle n'existe pas** :

```sql
CREATE OR REPLACE VIEW marketplace_items_enriched AS
SELECT 
  mi.*,
  p.username as seller_username,
  p.full_name as seller_full_name,
  p.avatar_url as seller_avatar,
  g.name as game_name,
  g.photo as game_photo
FROM marketplace_items mi
LEFT JOIN profiles p ON mi.user_id = p.id
LEFT JOIN games g ON mi.game_id = g.id;
```

## 🧹 Nettoyage après diagnostic

Une fois le problème identifié et résolu, **supprimez les logs de debug** :

```typescript
// Supprimer ces lignes :
const { data: allData, error: testError } = await supabase
  .from('marketplace_items')
  .select('*')
  .limit(5);

console.log('🔍 DEBUG - All marketplace items:', allData);
console.log('🔍 DEBUG - Error:', testError);

// ... autres console.log de debug
```

Et **réactiver le filtre de status** :

```typescript
let query = supabase
  .from('marketplace_items')
  .select('*')
  .eq('status', 'available') // Décommenter cette ligne
  .order('created_at', { ascending: false });
```

## 📊 Vérification finale

Après avoir appliqué la solution, vérifiez que :

- [ ] La table existe et contient des données
- [ ] Les données ont le status `'available'`
- [ ] Les images s'affichent correctement
- [ ] Les filtres fonctionnent
- [ ] La recherche fonctionne
- [ ] La navigation vers le détail fonctionne

## 🆘 Si le problème persiste

1. **Vérifier les logs Supabase** : Dashboard > Logs > API
2. **Vérifier les politiques RLS** : Dashboard > Authentication > Policies
3. **Vérifier la connexion Supabase** : Test sur une autre table (events, profiles)
4. **Consulter la documentation** : Voir les autres fichiers .md dans `/documentation/`

## 📝 Checklist de diagnostic

```
□ Logs de la console vérifiés
□ Table marketplace_items existe
□ Données présentes dans la table
□ Status des données = 'available'
□ Permissions RLS configurées
□ Images accessibles (URLs valides)
□ Authentification fonctionnelle
□ Autres pages fonctionnent (events, profile)
```

---

**Note** : Ce mode debug est temporaire. Une fois le problème résolu, n'oubliez pas de nettoyer le code et de supprimer les console.log.

