# Fonctionnalité : Mes préférences de jeu

**Date de création** : 2 décembre 2025

## Description

Ajout d'une nouvelle section "Mes préférences de jeu" sur la page `/profile` permettant aux utilisateurs de sélectionner leurs préférences de jeu (tags) jusqu'à une limite de 5.

## Tables Supabase utilisées

- **`tags`** : Table contenant les tags disponibles (ex: Compétitif, Décontracté, Famille, Expert, etc.)
- **`user_tags`** : Table de liaison entre les utilisateurs et leurs tags préférés

### Structure de la table `user_tags`
```sql
CREATE TABLE user_tags (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid REFERENCES profiles(id),
  tag_id uuid REFERENCES tags(id)
);
```

## Composants créés/modifiés

### Web (apps/web)

#### Nouveau composant : `GamePreferencesEditor`
**Chemin** : `apps/web/components/users/GamePreferencesEditor.tsx`

Fonctionnalités :
- Affiche tous les tags disponibles depuis la table `tags`
- Permet de sélectionner/désélectionner des tags (max 5)
- Affiche une légende explicative
- Barre de progression indiquant le nombre de tags sélectionnés
- Boutons Annuler/Enregistrer avec détection des changements
- Messages de succès/erreur

#### Page modifiée : `profile/page.tsx`
**Chemin** : `apps/web/app/profile/page.tsx`

Modifications :
- Ajout de la section `preferences_jeu` dans le type `ProfileSection`
- Ajout de l'entrée dans la liste des sections avec icône 🎯
- Rendu du composant `GamePreferencesEditor` dans la modale

### Mobile (apps/mobile)

#### Nouveau composant : `GamePreferencesEditor`
**Chemin** : `apps/mobile/components/users/GamePreferencesEditor.tsx`

Fonctionnalités (identiques à la version web) :
- Affiche tous les tags disponibles depuis la table `tags`
- Permet de sélectionner/désélectionner des tags (max 5)
- Affiche une légende explicative
- Barre de progression
- Boutons Annuler/Enregistrer
- Messages de succès/erreur avec Alert natif

#### Page modifiée : `profile/index.tsx`
**Chemin** : `apps/mobile/app/(tabs)/profile/index.tsx`

Modifications :
- Ajout de `preferences_jeu` dans le type `TabType`
- Ajout de l'entrée dans la liste des sections
- Ajout du titre dans `getSectionTitle`
- Rendu du composant `GamePreferencesEditor` dans la modale

## Arborescence des composants

### Web
```
apps/web/
├── app/
│   └── profile/
│       └── page.tsx (modifié)
└── components/
    └── users/
        ├── index.ts (modifié - export ajouté)
        └── GamePreferencesEditor.tsx (nouveau)
```

### Mobile
```
apps/mobile/
├── app/
│   └── (tabs)/
│       └── profile/
│           └── index.tsx (modifié)
└── components/
    └── users/
        ├── index.ts (modifié - export ajouté)
        └── GamePreferencesEditor.tsx (nouveau)
```

## Flux de données

1. **Chargement** :
   - Récupération de tous les tags depuis `tags`
   - Récupération des tags de l'utilisateur depuis `user_tags`

2. **Sélection** :
   - L'utilisateur peut cliquer sur un tag pour le sélectionner/désélectionner
   - Maximum 5 tags sélectionnables
   - Message d'erreur si tentative de dépasser la limite

3. **Sauvegarde** :
   - Suppression des anciennes préférences (`DELETE FROM user_tags WHERE user_id = ?`)
   - Insertion des nouvelles préférences (`INSERT INTO user_tags`)
   - Affichage d'un message de succès

## Notes de sécurité

Les politiques RLS (Row Level Security) existantes sur la table `user_tags` doivent permettre :
- La lecture des tags pour les utilisateurs authentifiés
- L'insertion/suppression des tags pour l'utilisateur propriétaire

## Tests manuels suggérés

1. Se connecter et accéder à `/profile`
2. Cliquer sur "Mes préférences de jeu"
3. Vérifier que les tags disponibles s'affichent
4. Sélectionner jusqu'à 5 tags
5. Vérifier le message d'erreur au-delà de 5
6. Enregistrer et vérifier la persistance
7. Rouvrir la modale et vérifier que les tags sont bien chargés


