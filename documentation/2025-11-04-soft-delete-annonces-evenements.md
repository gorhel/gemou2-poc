# Fonctionnalité de Suppression Logique (Soft Delete) - Annonces et Événements

**Date**: 4 novembre 2025  
**Auteur**: Assistant AI  
**Type**: Feature Implementation

## 📋 Vue d'ensemble

Implémentation complète de la fonctionnalité de suppression logique (soft delete) pour les annonces du marketplace et les événements. Cette fonctionnalité permet aux utilisateurs de supprimer définitivement leurs publications via une interface intuitive avec confirmation.

## 🎯 Objectifs

1. Permettre aux propriétaires d'annonces de supprimer leurs publications
2. Permettre aux créateurs d'événements de supprimer leurs événements
3. Implémenter un système de suppression sécurisé avec confirmation
4. Garantir que les éléments supprimés ne sont plus visibles dans l'application
5. Fournir des retours visuels clairs à l'utilisateur

## 🗂️ Architecture de la Solution

### 1. Base de Données

#### 1.1 Migration - Ajout du champ `deleted_at`

**Fichier**: `supabase/migrations/20251104000001_add_soft_delete.sql`

- Ajout du champ `deleted_at` (timestamptz, nullable) aux tables :
  - `marketplace_items`
  - `events`
- Création d'index pour optimiser les performances
- Création de vues actives :
  - `marketplace_items_active` : annonces non supprimées
  - `events_active` : événements non supprimés

#### 1.2 Fonctions SQL Sécurisées

**Fonction `soft_delete_marketplace_item`**
```sql
CREATE OR REPLACE FUNCTION public.soft_delete_marketplace_item(item_id uuid)
RETURNS BOOLEAN
```
- Vérifie que l'utilisateur est le propriétaire
- Met à jour `deleted_at` avec la date/heure actuelle
- Retourne TRUE en cas de succès

**Fonction `soft_delete_event`**
```sql
CREATE OR REPLACE FUNCTION public.soft_delete_event(event_id uuid)
RETURNS BOOLEAN
```
- Vérifie que l'utilisateur est le créateur
- Met à jour `deleted_at` avec la date/heure actuelle
- Retourne TRUE en cas de succès

#### 1.3 Mises à Jour des Vues

**Fichier**: `supabase/migrations/20251104000002_update_views_for_soft_delete.sql`

- Mise à jour de `marketplace_items_enriched` pour filtrer automatiquement les éléments supprimés
- Ajout de la clause `WHERE deleted_at IS NULL`

#### 1.4 Politiques RLS (Row Level Security)

**Fichier**: `supabase/migrations/20251104000003_add_rls_for_soft_delete.sql`

**Marketplace Items**:
- `marketplace_items_hide_deleted` : empêche la lecture des annonces supprimées
- `marketplace_items_owners_see_deleted` : les propriétaires peuvent voir leurs propres annonces supprimées

**Events**:
- `events_hide_deleted` : empêche la lecture des événements supprimés
- `events_creators_see_deleted` : les créateurs peuvent voir leurs propres événements supprimés

### 2. Composants UI

#### 2.1 Modales de Confirmation et Succès

**Web** (`apps/web/components/ui/`):
- `SuccessModal.tsx` : Modale de confirmation de succès
- `ConfirmModal` : Déjà existante, utilisée pour la confirmation

**Mobile** (`apps/mobile/components/ui/`):
- `SuccessModal.tsx` : Modale de confirmation de succès (React Native)
- `ConfirmModal` : Déjà existante, utilisée pour la confirmation

**Exports**:
```typescript
// Ajouté aux index.ts de chaque plateforme
export { SuccessModal } from './SuccessModal';
export type { SuccessModalProps } from './SuccessModal';
```

### 3. Pages de Détail Mises à Jour

#### 3.1 Annonces Marketplace

**Web**: `apps/web/app/trade/[id]/page.tsx`
- Import des modales et hooks nécessaires
- Ajout des états : `isDeleting`, `confirmDeleteModal`, `successModal`
- Fonction `handleDeleteItem` :
  - Appelle la fonction RPC `soft_delete_marketplace_item`
  - Gère les erreurs
  - Affiche la modale de succès
  - Redirige vers le marketplace après 2 secondes
- Bouton "Supprimer l'annonce" (visible uniquement pour le propriétaire)
- Modales de confirmation et succès

**Mobile**: `apps/mobile/app/trade/[id].tsx`
- Import des modales nécessaires
- Ajout des états : `isDeleting`, `showConfirmDelete`, `showSuccess`
- Fonction `handleDeleteItem` (identique à la version web)
- Bouton "Supprimer l'annonce" avec styles React Native
- Modales de confirmation et succès

#### 3.2 Événements

**Web**: `apps/web/app/events/[id]/page.tsx`
- Import des modales et hooks nécessaires
- Ajout des états : `isDeleting`, `confirmDeleteModal`, `successModal`
- Fonction `handleDeleteEvent` :
  - Appelle la fonction RPC `soft_delete_event`
  - Gère les erreurs
  - Affiche la modale de succès
  - Redirige vers la liste des événements après 2 secondes
- Modification de la section Actions :
  - Si l'utilisateur est le créateur : affiche "Modifier" et "Supprimer"
  - Sinon : affiche "Rejoindre/Quitter"
- Modales de confirmation et succès

**Mobile**: `apps/mobile/app/(tabs)/events/[id].tsx`
- Import des modales nécessaires
- Ajout des états : `isDeleting`, `showConfirmDelete`, `showSuccess`
- Fonction `handleDeleteEvent` (identique à la version web)
- Bouton "Supprimer le Gémou" dans la section créateur
- Styles React Native pour le bouton de suppression
- Modales de confirmation et succès

## 🎨 Expérience Utilisateur (UX)

### Flux de Suppression

1. **Consultation** : L'utilisateur consulte une annonce/événement qu'il a créé(e)
2. **Action** : Il clique sur le bouton "Supprimer l'annonce" ou "Supprimer l'événement"
3. **Confirmation** : Une modale s'affiche demandant confirmation
   - Titre : "Supprimer [l'annonce/l'événement]"
   - Description : Avertissement sur l'irréversibilité
   - Boutons : "Annuler" (gris) et "Supprimer" (rouge)
4. **Traitement** : Si confirmé :
   - Indicateur de chargement sur le bouton
   - Appel à la fonction de suppression
5. **Succès** : Modale de succès s'affiche
   - Icône ✓ verte
   - Message de confirmation
   - Bouton "OK"
   - Redirection automatique après 2 secondes
6. **Redirection** : 
   - Annonces → `/marketplace` (web) ou `/(tabs)/marketplace` (mobile)
   - Événements → `/events` (web) ou `/(tabs)/events` (mobile)

### Messages d'Erreur

En cas d'erreur :
- **Erreur de permission** : "Non autorisé: vous devez être le propriétaire/créateur"
- **Erreur générique** : "Erreur lors de la suppression" avec alert/modale

## 🔒 Sécurité

### Contrôles d'Accès

1. **Vérification au niveau SQL** :
   - Les fonctions RPC vérifient que `auth.uid()` correspond au propriétaire/créateur
   - Exception levée si non autorisé

2. **Vérification au niveau UI** :
   - Le bouton de suppression n'est visible que si `user.id === seller_id/creator_id`
   - Protection côté client

3. **Politiques RLS** :
   - Empêchent la lecture des éléments supprimés par d'autres utilisateurs
   - Les propriétaires/créateurs peuvent toujours voir leurs propres éléments supprimés

## 🧪 Tests et Validation

### Points de Validation

- [ ] Un propriétaire peut supprimer son annonce
- [ ] Un créateur peut supprimer son événement
- [ ] Un utilisateur ne peut pas supprimer l'annonce/événement d'un autre
- [ ] Les annonces/événements supprimés n'apparaissent plus dans les listes
- [ ] Les modales s'affichent correctement
- [ ] La redirection fonctionne après suppression
- [ ] Les messages d'erreur s'affichent correctement
- [ ] Le propriétaire peut toujours accéder à ses éléments supprimés (via lien direct)
- [ ] Les autres utilisateurs reçoivent une erreur 404 pour les éléments supprimés

## 📊 Arborescence des Composants

### Page de Détail d'Annonce (Web)
```
TradePage
├── ResponsiveLayout
│   ├── PageHeader
│   ├── Card (Galerie photos)
│   ├── Card (Informations principales)
│   ├── Card (Vendeur et actions)
│   │   ├── Avatar/Info vendeur
│   │   ├── Button "Contacter" (si pas propriétaire)
│   │   └── Actions propriétaire
│   │       ├── Button "Modifier" (outline)
│   │       └── Button "Supprimer" (destructive) ← NOUVEAU
│   ├── Card (Fiche du jeu)
│   ├── Card (Informations)
│   ├── PageFooter
│   ├── ConfirmModal ← NOUVEAU
│   └── SuccessModal ← NOUVEAU
```

### Page de Détail d'Annonce (Mobile)
```
TradeDetailsPage
└── ScrollView
    ├── TopHeader
    ├── TypeContainer
    ├── Title & Price
    ├── MetaContainer
    ├── DescriptionContainer
    ├── WantedContainer (si échange)
    ├── ContactButton (si pas propriétaire)
    └── Actions propriétaire
        ├── TouchableOpacity "Modifier"
        ├── TouchableOpacity "Supprimer" ← NOUVEAU
        ├── OwnerBadge
        ├── ConfirmModal ← NOUVEAU
        └── SuccessModal ← NOUVEAU
```

### Page de Détail d'Événement (Web)
```
EventPageOptimized
├── ResponsiveLayout
│   ├── PageHeader
│   ├── Card (Image & Infos)
│   ├── Card (Description)
│   ├── Card (Participants)
│   ├── Actions
│   │   ├── Button "Se connecter" (si non connecté)
│   │   ├── Actions Créateur (si user === creator)
│   │   │   ├── Button "Modifier" ← NOUVEAU
│   │   │   └── Button "Supprimer" (destructive) ← NOUVEAU
│   │   └── Button "Rejoindre/Quitter" (si non créateur)
│   ├── Button "Retour"
│   ├── PageFooter
│   ├── ConfirmModal ← NOUVEAU
│   └── SuccessModal ← NOUVEAU
```

### Page de Détail d'Événement (Mobile)
```
EventDetailsPage
└── PageLayout
    ├── Image
    ├── Title & Status
    ├── InfoCards
    ├── Description
    ├── Participants List
    ├── Actions Container
    │   ├── Actions Créateur (si isCreator)
    │   │   ├── TouchableOpacity "Contacter participants"
    │   │   ├── TouchableOpacity "Modifier"
    │   │   └── TouchableOpacity "Supprimer" ← NOUVEAU
    │   └── Actions Participant (si non créateur)
    │       ├── TouchableOpacity "Contacter l'hôte"
    │       └── TouchableOpacity "Participer/Quitter"
    ├── ConfirmationModal (existante)
    ├── ConfirmModal ← NOUVEAU
    └── SuccessModal ← NOUVEAU
```

## 📝 Fichiers Modifiés/Créés

### Migrations SQL
1. `supabase/migrations/20251104000001_add_soft_delete.sql` - Ajout champs et fonctions
2. `supabase/migrations/20251104000002_update_views_for_soft_delete.sql` - Mise à jour vues
3. `supabase/migrations/20251104000003_add_rls_for_soft_delete.sql` - Politiques RLS

### Composants UI
1. `apps/web/components/ui/SuccessModal.tsx` - Nouveau
2. `apps/mobile/components/ui/SuccessModal.tsx` - Nouveau
3. `apps/web/components/ui/index.ts` - Export ajouté
4. `apps/mobile/components/ui/index.ts` - Export ajouté

### Pages Web
1. `apps/web/app/trade/[id]/page.tsx` - Modifié
2. `apps/web/app/events/[id]/page.tsx` - Modifié

### Pages Mobile
1. `apps/mobile/app/trade/[id].tsx` - Modifié
2. `apps/mobile/app/(tabs)/events/[id].tsx` - Modifié

### Documentation
1. `documentation/2025-11-04-soft-delete-annonces-evenements.md` - Ce document

## 🚀 Déploiement

### Étapes de Déploiement

1. **Appliquer les migrations** :
   ```bash
   supabase db push
   ```

2. **Vérifier les politiques RLS** :
   - Se connecter au dashboard Supabase
   - Vérifier que les politiques sont actives sur les tables

3. **Tester en environnement de dev** :
   - Créer une annonce/événement
   - Tenter de la/le supprimer
   - Vérifier qu'elle/il n'apparaît plus dans les listes

4. **Déployer les applications** :
   - Web : `npm run build && npm run deploy`
   - Mobile : Suivre le processus Expo EAS

## 🔧 Maintenance

### Récupération d'Éléments Supprimés

Si nécessaire, un admin peut récupérer un élément supprimé :

```sql
-- Récupérer une annonce
UPDATE marketplace_items 
SET deleted_at = NULL 
WHERE id = 'uuid-de-lannonce';

-- Récupérer un événement
UPDATE events 
SET deleted_at = NULL 
WHERE id = 'uuid-de-levenement';
```

### Suppression Définitive (Hard Delete)

Pour nettoyer la base de données :

```sql
-- Supprimer définitivement les annonces de plus de 30 jours
DELETE FROM marketplace_items 
WHERE deleted_at < NOW() - INTERVAL '30 days';

-- Supprimer définitivement les événements de plus de 30 jours
DELETE FROM events 
WHERE deleted_at < NOW() - INTERVAL '30 days';
```

## 📈 Améliorations Futures

1. **Restauration** : Ajouter une fonction de restauration pour les propriétaires/créateurs
2. **Archivage** : Interface admin pour voir et gérer les éléments supprimés
3. **Notifications** : Notifier les participants d'événements lors d'une suppression
4. **Analytics** : Tracker le nombre de suppressions pour identifier des problèmes UX
5. **Période de grâce** : Permettre une annulation de suppression pendant X heures

## ✅ Conclusion

La fonctionnalité de soft delete est maintenant complètement implémentée pour les annonces et événements sur les deux plateformes (web et mobile). Elle offre une expérience utilisateur fluide avec des confirmations appropriées et garantit la sécurité des données grâce aux politiques RLS.






