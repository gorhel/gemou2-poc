# 📝 Fonctionnalité d'Édition d'Annonces Marketplace

**Date de création :** 30 octobre 2025  
**Version :** 1.0  
**Statut :** ✅ Implémenté

---

## 🎯 Vue d'ensemble

Cette fonctionnalité permet aux créateurs d'annonces de modifier leurs annonces de marketplace directement depuis l'application. Les modifications sont enregistrées en base de données et immédiatement visibles sur l'application.

### Fonctionnement

1. **Depuis la page de détail** `/trade/[id]` : Si l'utilisateur est le créateur de l'annonce, il voit un bouton **"✏️ Modifier l'annonce"**
2. **Redirection vers le formulaire** : En cliquant sur ce bouton, l'utilisateur est redirigé vers `/create-trade?id={annonce_id}`
3. **Chargement automatique** : Les informations de l'annonce sont automatiquement chargées dans le formulaire
4. **Modification et sauvegarde** : L'utilisateur peut modifier les champs et sauvegarder
5. **Mise à jour en base** : Les changements sont enregistrés via une opération `UPDATE` en base de données
6. **Redirection** : L'utilisateur est redirigé vers la page de détail mise à jour

---

## 🏗️ Architecture Technique

### Composants Modifiés

#### 1. **Page de détail d'annonce** (Web)
**Fichier :** `apps/web/app/trade/[id]/page.tsx`

**Changements :**
```typescript
// Ajout du bouton "Modifier l'annonce" pour le propriétaire
{item.seller_id === user?.id && (
  <div className="space-y-3">
    <Button
      onClick={() => router.push(`/create-trade?id=${item.id}`)}
      variant="outline"
      className="w-full"
    >
      ✏️ Modifier l'annonce
    </Button>
    <div className="text-center py-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">C'est votre annonce</p>
    </div>
  </div>
)}
```

#### 2. **Page de création/édition d'annonce** (Web)
**Fichier :** `apps/web/app/create-trade/page.tsx`

**Changements clés :**

```typescript
// 1. Récupération du paramètre d'URL
const searchParams = useSearchParams();
const editId = searchParams.get('id');

// 2. Nouvel état pour gérer le mode édition
const [isEditMode, setIsEditMode] = useState(false);

// 3. Fonction de chargement des données
const loadTradeData = async (tradeId: string, userId: string) => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select('*')
    .eq('id', tradeId)
    .single();

  // Vérification de propriété
  if (data.seller_id !== userId) {
    setErrors({ general: 'Non autorisé' });
    return;
  }

  // Pré-remplissage du formulaire
  setIsEditMode(true);
  setTitle(data.title);
  setPrice(data.price);
  // ... autres champs
};

// 4. Gestion du submit avec UPDATE ou INSERT
if (isEditMode && editId) {
  // UPDATE
  await supabase
    .from('marketplace_items')
    .update({ ...formData })
    .eq('id', editId)
    .eq('seller_id', user.id);
} else {
  // INSERT
  await supabase
    .from('marketplace_items')
    .insert({ ...formData });
}
```

#### 3. **Page de détail d'annonce** (Mobile)
**Fichier :** `apps/mobile/app/trade/[id].tsx`

**Changements :**
```typescript
// Ajout du bouton d'édition
{isOwner && (
  <>
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => router.push(`/(tabs)/create-trade?id=${id}`)}
    >
      <Text style={styles.editButtonText}>✏️ Modifier l'annonce</Text>
    </TouchableOpacity>
    
    <View style={styles.ownerBadge}>
      <Text style={styles.ownerBadgeText}>⭐ Votre annonce</Text>
    </View>
  </>
)}
```

#### 4. **Page de création/édition d'annonce** (Mobile)
**Fichier :** `apps/mobile/app/(tabs)/create-trade.tsx`

**Changements similaires à la version web :**
- Utilisation de `useLocalSearchParams` pour récupérer l'ID
- Fonction `loadTradeData` pour charger les données
- Logique conditionnelle UPDATE/INSERT dans `handleSubmit`

---

## 🔐 Sécurité

### Vérifications de propriété

**Côté client :**
```typescript
// Vérification avant de charger les données
if (data.seller_id !== userId) {
  setErrors({ general: 'Non autorisé' });
  return;
}
```

**Côté base de données :**
```typescript
// Clause WHERE pour sécuriser l'UPDATE
.update({ ...formData })
.eq('id', editId)
.eq('seller_id', user.id) // ⚠️ Sécurité : vérifier la propriété
```

**Row Level Security (RLS) Supabase :**
Les politiques RLS existantes sur `marketplace_items` garantissent que :
- Seul le propriétaire peut modifier son annonce
- Les autres utilisateurs ne peuvent que lire les annonces disponibles

---

## 📊 Flux de Données

### Diagramme de flux

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Page de détail /trade/[id]                               │
│    - Affichage de l'annonce                                 │
│    - Vérification : user.id === item.seller_id ?            │
│    - Si OUI → Afficher bouton "Modifier l'annonce"          │
└────────────────────────┬────────────────────────────────────┘
                         │ Clic sur "Modifier"
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Redirection vers /create-trade?id={annonce_id}           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Page /create-trade                                        │
│    - Détection du paramètre ?id                             │
│    - Appel loadTradeData(id, user.id)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Chargement depuis Supabase                                │
│    SELECT * FROM marketplace_items WHERE id = ?              │
│    - Vérification propriété                                 │
│    - Pré-remplissage du formulaire                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Modification par l'utilisateur                            │
│    - Changement de titre, prix, description, etc.           │
│    - Validation des champs                                  │
└────────────────────────┬────────────────────────────────────┘
                         │ Clic sur "Mettre à jour"
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Sauvegarde en base de données                             │
│    UPDATE marketplace_items                                  │
│    SET title=?, price=?, updated_at=NOW()                   │
│    WHERE id=? AND seller_id=?                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Redirection vers /trade/[id]                              │
│    - Affichage de l'annonce mise à jour                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌳 Structure des Composants

### Page Web `/trade/[id]`

```
Page: /trade/[id]
│
├── ResponsiveLayout
│   ├── PageHeader (titre de l'annonce)
│   │
│   └── Contenu principal
│       ├── [Colonne gauche] Informations de l'annonce
│       │   ├── Galerie photos
│       │   └── Card détails
│       │
│       └── [Colonne droite] Sidebar
│           ├── Card Vendeur
│           │   ├── Avatar + Nom
│           │   ├── [Si non propriétaire] → Bouton "Contacter"
│           │   └── [Si propriétaire] → 
│           │       ├── Bouton "✏️ Modifier l'annonce"
│           │       └── Badge "C'est votre annonce"
│           │
│           ├── Card Fiche du jeu (si applicable)
│           └── Card Informations de sécurité
```

### Page Web `/create-trade`

```
Page: /create-trade (Mode Édition)
│
├── Header
│   ├── Bouton "Retour"
│   ├── Titre : "Modifier l'annonce" (si isEditMode)
│   └── Sous-titre : "Modifiez les informations..."
│
└── Card Formulaire
    ├── [Erreur générale si échec de chargement]
    │
    ├── Type de transaction (Vente/Échange)
    ├── Titre *
    ├── Identification du jeu *
    ├── État du jeu *
    ├── Description
    ├── Localisation
    ├── Photos
    ├── [Si Vente] Prix (€) *
    ├── [Si Échange] Jeu recherché *
    ├── Livraison possible (Toggle)
    │
    └── Boutons d'action
        ├── "Enregistrer et quitter" (brouillon)
        └── "Mettre à jour" (publication)
```

### Page Mobile `/trade/[id]`

```
Page Mobile: /trade/[id]
│
├── TopHeader (Auto-configuré)
│
├── ScrollView avec RefreshControl
│   │
│   ├── Informations principales
│   │   ├── Badge type (💰/🔄/🎁)
│   │   ├── Titre
│   │   ├── Prix (si vente)
│   │   └── Meta (État, Lieu, Vendeur)
│   │
│   ├── Card Description
│   ├── Card Jeu recherché (si échange)
│   │
│   └── Actions
│       ├── [Si non propriétaire] → Bouton "💬 Contacter"
│       └── [Si propriétaire] →
│           ├── Bouton "✏️ Modifier l'annonce"
│           └── Badge "⭐ Votre annonce"
```

### Page Mobile `/(tabs)/create-trade`

```
Page Mobile: /(tabs)/create-trade (Mode Édition)
│
├── Header
│   ├── Bouton "← Retour"
│   └── Titre : "Modifier l'annonce"
│
├── Card Formulaire
│   ├── Titre : "Modification 🛒"
│   ├── Type d'annonce (3 boutons)
│   ├── Champs de formulaire
│   └── Boutons
│       ├── "Annuler"
│       └── "Mettre à jour"
```

---

## 🗄️ Opérations Base de Données

### Schéma de table

```sql
CREATE TABLE marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id),
  type TEXT CHECK (type IN ('sale', 'exchange', 'donation')),
  title TEXT NOT NULL,
  description TEXT,
  condition TEXT,
  price NUMERIC,
  wanted_game TEXT,
  location_quarter TEXT,
  location_city TEXT,
  delivery_available BOOLEAN DEFAULT false,
  game_id UUID REFERENCES games(id),
  custom_game_name TEXT,
  images TEXT[],
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Requêtes SQL

**Chargement de l'annonce :**
```sql
SELECT * 
FROM marketplace_items 
WHERE id = $1 
LIMIT 1;
```

**Mise à jour de l'annonce :**
```sql
UPDATE marketplace_items
SET 
  title = $1,
  description = $2,
  type = $3,
  price = $4,
  condition = $5,
  location_city = $6,
  location_quarter = $7,
  wanted_game = $8,
  delivery_available = $9,
  game_id = $10,
  custom_game_name = $11,
  images = $12,
  updated_at = NOW()
WHERE id = $13 
  AND seller_id = $14
RETURNING *;
```

---

## ✅ Validation & Gestion d'Erreurs

### Validations côté client

```typescript
// 1. Vérification de propriété
if (data.seller_id !== userId) {
  setErrors({ general: 'Non autorisé' });
  return;
}

// 2. Validation du formulaire
const { valid, errors } = validateMarketplaceForm(formData);
if (!valid) {
  setErrors(errors);
  return;
}
```

### Cas d'erreurs gérés

| Erreur | Message utilisateur | Action |
|--------|---------------------|--------|
| Annonce introuvable | "Impossible de charger l'annonce" | Affichage d'une erreur |
| Non propriétaire | "Vous n'êtes pas autorisé à modifier cette annonce" | Redirection ou blocage |
| Échec de l'UPDATE | "Erreur lors de la mise à jour de l'annonce" | Affichage d'une erreur |
| Champs manquants | Messages spécifiques par champ | Mise en surbrillance des champs |

---

## 🎨 Interface Utilisateur

### États visuels

**Bouton "Modifier l'annonce" (Web) :**
- Variant : `outline`
- Icône : ✏️
- Couleur : Bordure bleue (#3b82f6)
- Position : Dans la card "Vendeur", en dessous de l'avatar

**Bouton "Modifier l'annonce" (Mobile) :**
- Background : Blanc
- Bordure : 2px bleu (#3b82f6)
- Texte : Bleu (#3b82f6), gras
- Icône : ✏️

**Titre de la page en mode édition :**
- Web : "Modifier l'annonce"
- Mobile : "Modifier l'annonce"

**Bouton de soumission en mode édition :**
- Web : "Mettre à jour" (au lieu de "Publier")
- Mobile : "Mettre à jour" (au lieu de "Publier")

---

## 🔄 Processus de Test

### Tests recommandés

**1. Test du flux complet (Scénario heureux) :**
```
✅ Créer une annonce
✅ Consulter l'annonce (vérifier affichage du bouton "Modifier")
✅ Cliquer sur "Modifier l'annonce"
✅ Vérifier que le formulaire est pré-rempli
✅ Modifier le titre et le prix
✅ Cliquer sur "Mettre à jour"
✅ Vérifier la redirection vers la page de détail
✅ Vérifier que les modifications sont visibles
```

**2. Test de sécurité :**
```
✅ Tenter d'accéder à /create-trade?id={annonce_autre_utilisateur}
✅ Vérifier que l'accès est refusé
✅ Vérifier le message d'erreur "Non autorisé"
```

**3. Test de validation :**
```
✅ Vider le champ titre et tenter de sauvegarder
✅ Vérifier que l'erreur "Le titre est obligatoire" s'affiche
✅ Mettre un prix négatif (si vente)
✅ Vérifier la validation du prix
```

**4. Test de navigation :**
```
✅ Cliquer sur "Retour" depuis le formulaire d'édition
✅ Vérifier le retour à la page précédente
```

**5. Test d'état de chargement :**
```
✅ Ralentir la connexion réseau
✅ Vérifier l'affichage du spinner pendant le chargement
```

---

## 📱 Compatibilité

### Environnements supportés

| Plateforme | Navigateur / OS | Statut |
|------------|-----------------|--------|
| **Web** | Chrome, Firefox, Safari, Edge | ✅ Supporté |
| **Mobile (iOS)** | iOS 13+ | ✅ Supporté |
| **Mobile (Android)** | Android 8+ | ✅ Supporté |

---

## 🚀 Améliorations Futures

### Fonctionnalités potentielles

1. **Historique des modifications**
   - Garder une trace des changements (audit log)
   - Afficher "Dernière modification le XX/XX/XXXX"

2. **Aperçu avant sauvegarde**
   - Bouton "Aperçu" dans le formulaire
   - Affichage d'une preview de l'annonce

3. **Brouillons automatiques**
   - Sauvegarde automatique toutes les 30 secondes
   - Récupération en cas de fermeture accidentelle

4. **Notifications**
   - Notifier les utilisateurs intéressés quand une annonce est modifiée
   - Email automatique en cas de changement de prix

5. **Suppression d'annonce**
   - Ajouter un bouton "Supprimer l'annonce"
   - Confirmation avant suppression
   - Archivage au lieu de suppression définitive

---

## 📖 Références

### Fichiers modifiés

- `apps/web/app/trade/[id]/page.tsx`
- `apps/web/app/create-trade/page.tsx`
- `apps/mobile/app/trade/[id].tsx`
- `apps/mobile/app/(tabs)/create-trade.tsx`

### Technologies utilisées

- **Next.js 14** (App Router)
- **React Native / Expo**
- **Supabase** (Base de données + Auth)
- **TypeScript**
- **Tailwind CSS** (Web)
- **React Native StyleSheet** (Mobile)

---

## ✍️ Auteur

**AI Assistant** - Implémentation complète de la fonctionnalité d'édition d'annonces  
Date : 30 octobre 2025







