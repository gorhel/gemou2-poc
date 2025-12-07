# Ajout des icônes de modification et suppression dans le header des événements

**Date:** 16 novembre 2025  
**Type:** Feature - Amélioration UX  
**Plateforme:** Mobile uniquement

## 📋 Contexte

L'utilisateur créateur d'un événement doit pouvoir facilement accéder aux actions de modification et de suppression directement depuis le header de la page de détail de l'événement, sans avoir à défiler jusqu'en bas de la page.

## 🎯 Objectif

Ajouter deux icônes dans le header de la page de détail d'un événement (`/events/[id]`) qui ne sont visibles **que pour le créateur** de l'événement :
- **✏️ Modifier** : Navigue vers la page d'édition de l'événement
- **🗑️ Supprimer** : Ouvre la modale de confirmation de suppression

## 🔧 Modifications techniques

### 1. Mise à jour du composant `PageLayout`

**Fichier:** `/apps/mobile/components/layout/PageLayout.tsx`

**Changements:**
- Ajout de nouvelles props pour permettre la transmission des configurations du header au composant `TopHeader`
- Props ajoutées :
  - `overrideTitle?: string`
  - `overrideSubtitle?: string`
  - `overrideShowBackButton?: boolean`
  - `overrideRightActions?: Array<{ label?: string; icon?: string; onPress: () => void }>`
  - `dynamicTitle?: string`
  - `dynamicSubtitle?: string`
  - `actionHandlers?: Record<string, () => void>`

**Pourquoi:** 
Le composant `PageLayout` encapsule le `TopHeader` mais ne lui transmettait pas de props. Pour permettre aux pages d'utiliser pleinement les capacités du `TopHeader`, nous devons maintenant passer ces props.

```typescript
export function PageLayout({
  children,
  showHeader = true,
  showFooter = true,
  refreshing = false,
  onRefresh,
  scrollEnabled = true,
  contentContainerStyle,
  // Nouvelles props pour le TopHeader
  overrideTitle,
  overrideSubtitle,
  overrideShowBackButton,
  overrideRightActions,
  dynamicTitle,
  dynamicSubtitle,
  actionHandlers
}: PageLayoutProps) {
  return (
    <View style={styles.container}>
      {showHeader && (
        <TopHeader
          overrideTitle={overrideTitle}
          overrideSubtitle={overrideSubtitle}
          overrideShowBackButton={overrideShowBackButton}
          overrideRightActions={overrideRightActions}
          dynamicTitle={dynamicTitle}
          dynamicSubtitle={dynamicSubtitle}
          actionHandlers={actionHandlers}
        />
      )}
      {/* ... reste du code ... */}
    </View>
  )
}
```

### 2. Modification de la page de détail d'événement

**Fichier:** `/apps/mobile/app/(tabs)/events/[id].tsx`

**Changements:**

#### a) Ajout des actions conditionnelles dans le header

Après la détermination de `isCreator`, nous créons un tableau d'actions qui n'est défini que si l'utilisateur est le créateur :

```typescript
const isCreator = user?.id === event.creator_id;

// Actions du header pour le créateur
const headerActions = isCreator ? [
  {
    icon: '✏️',
    onPress: () => {
      router.push({
        pathname: '/(tabs)/create-event',
        params: { eventId: event.id }
      });
    }
  },
  {
    icon: '🗑️',
    onPress: () => setShowConfirmDelete(true)
  }
] : undefined;
```

#### b) Transmission des actions au PageLayout

```typescript
return (
  <PageLayout 
    showHeader={true} 
    refreshing={refreshing} 
    onRefresh={onRefresh}
    overrideRightActions={headerActions}
  >
    {/* contenu de la page */}
  </PageLayout>
)
```

#### c) Suppression des boutons redondants

Pour éviter la duplication et améliorer l'UX, nous avons supprimé :
- Le bouton de suppression à côté de l'avatar de l'hôte (lignes ~600-610)
- Le bouton "🗑️ Supprimer le Gémou" dans la section des actions en bas de page (lignes ~875-882)

Le bouton "Modifier" reste disponible dans le corps de la page car il fait partie de la section des actions principales.

## 🎨 Comportement visuel

### Pour un utilisateur NON créateur
- Le header affiche uniquement le bouton "← Retour"
- Aucune icône d'action dans le coin supérieur droit

### Pour le créateur de l'événement
- Le header affiche le bouton "← Retour" à gauche
- Deux icônes apparaissent dans le coin supérieur droit :
  - **✏️** (Modifier) - bordure et fond blanc
  - **🗑️** (Supprimer) - bordure et fond blanc
  
Les icônes utilisent le style défini dans `TopHeader` :
```typescript
actionButton: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 8,
  backgroundColor: 'white',
}
```

## 🔄 Flux utilisateur

### Scénario 1 : Modification d'un événement
1. Le créateur consulte son événement
2. Il voit les icônes ✏️ et 🗑️ dans le header
3. Il clique sur ✏️
4. Il est redirigé vers `/create-event` avec le paramètre `eventId`
5. La page de création charge l'événement en mode édition

### Scénario 2 : Suppression d'un événement
1. Le créateur consulte son événement
2. Il voit les icônes ✏️ et 🗑️ dans le header
3. Il clique sur 🗑️
4. La modale `ConfirmModal` s'affiche
5. Il confirme la suppression
6. L'événement est supprimé (soft delete via `soft_delete_event`)
7. La modale `SuccessModal` s'affiche
8. Il est redirigé vers `/events`

## 📱 Structure des composants

```
EventDetailsPage
└── PageLayout (avec overrideRightActions)
    ├── TopHeader
    │   ├── Bouton Retour (gauche)
    │   ├── Titre (centre)
    │   └── Actions (droite)
    │       └── [✏️] [🗑️] (si isCreator)
    └── ScrollView
        ├── Image de l'événement
        ├── Titre et métadonnées
        ├── Description
        ├── Liste des jeux
        ├── Tags
        ├── Participants
        └── Actions (Contacter, Modifier/Participer)
```

## ✅ Avantages de cette approche

1. **Accessibilité rapide** : Les actions importantes sont immédiatement visibles
2. **Cohérence UX** : Les actions de gestion sont dans le header, comme dans de nombreuses applications modernes
3. **Moins de scroll** : L'utilisateur n'a pas besoin de défiler jusqu'en bas pour supprimer un événement
4. **Visibilité conditionnelle** : Les icônes n'apparaissent que pour le créateur
5. **Réutilisabilité** : Le pattern peut être appliqué à d'autres pages (marketplace, profils, etc.)

## 🔮 Évolutions futures possibles

1. **Badge de notification** : Ajouter un badge sur l'icône de modification si des participants ont des demandes spéciales
2. **Menu contextuel** : Transformer les deux icônes en un menu "⋮" avec plus d'options
3. **Partage** : Ajouter une icône de partage pour tous les utilisateurs
4. **Favoris** : Permettre aux utilisateurs de marquer un événement comme favori

## 🧪 Tests suggérés

### Tests unitaires
- Vérifier que `overrideRightActions` est `undefined` quand `isCreator === false`
- Vérifier que `overrideRightActions` contient 2 actions quand `isCreator === true`

### Tests d'intégration
- Un utilisateur non créateur ne voit pas les icônes
- Un créateur voit les icônes ✏️ et 🗑️
- Cliquer sur ✏️ navigue vers la page d'édition avec le bon `eventId`
- Cliquer sur 🗑️ ouvre la modale de confirmation

### Tests manuels
- Tester sur iOS et Android
- Vérifier l'alignement des icônes
- Vérifier le comportement tactile (zones de touche)
- Tester avec un long titre d'événement (ellipsis)

## 📝 Notes techniques

### Performance
- Aucun impact sur les performances : les actions sont calculées une seule fois après le chargement de l'événement
- La condition `isCreator` est déjà utilisée ailleurs dans la page

### Compatibilité
- Compatible avec la version actuelle de React Native et Expo Router
- Pas de dépendances externes ajoutées

### Sécurité
- La vérification `isCreator` est effectuée côté client pour l'UI
- ⚠️ **Important** : Les vérifications de sécurité côté serveur restent en place dans :
  - La fonction `soft_delete_event` (RPC Supabase)
  - Les policies RLS sur la table `events`

## 🐛 Problèmes potentiels et solutions

### Problème 1 : Les icônes ne s'affichent pas
**Solution** : Vérifier que :
- `user` est bien chargé avant le render
- `event.creator_id` correspond bien à `user.id`
- Le composant `TopHeader` reçoit bien les props

### Problème 2 : L'icône de suppression ne fait rien
**Solution** : Vérifier que :
- L'état `showConfirmDelete` existe et fonctionne
- La modale `ConfirmModal` est bien montée dans le JSX
- Le handler `handleDeleteEvent` fonctionne correctement

## 🔗 Fichiers modifiés

1. `/apps/mobile/components/layout/PageLayout.tsx`
2. `/apps/mobile/app/(tabs)/events/[id].tsx`

## 📚 Références

- [Documentation TopHeader](../apps/mobile/components/TopHeader.tsx)
- [Configuration des headers](../apps/mobile/config/headers.config.ts)
- [Hook useDefaultActionHandlers](../apps/mobile/hooks/useDefaultActionHandlers.ts)



