# Fonctionnalité de Recommandation de Jeux

## Vue d'ensemble

Cette fonctionnalité permet d'afficher des recommandations de jeux aléatoires sur le tableau de bord et de naviguer vers une page de détails pour chaque jeu.

## Architecture et Flux de Données

### 1. Page Dashboard (`/dashboard`)

**Composant principal :** `/apps/web/app/dashboard/page.tsx`

La page dashboard affiche la section "Recommandations de jeux" qui utilise le composant `GamesRecommendations`.

```
Dashboard
  └── GamesRecommendations
      └── GameCard (x8)
```

### 2. Composant GamesRecommendations

**Fichier :** `/apps/web/components/games/GamesRecommendations.tsx`

#### Fonctionnalités :
- **Récupération aléatoire** : Récupère jusqu'à 50 jeux de la table `games` et en sélectionne 8 aléatoirement
- **Conversion des données** : Convertit les données de la base de données au format `BoardGame` pour compatibilité
- **Navigation** : Lors du clic sur un jeu, navigue vers `/games/[id]`
- **États gérés** :
  - `loading` : État de chargement
  - `error` : Gestion des erreurs
  - `games` : Liste des jeux affichés

#### Flux de données :
```
Supabase DB (table: games)
  ↓
fetchRandomGames()
  ↓
Mélange aléatoire (Math.random())
  ↓
8 jeux sélectionnés
  ↓
Conversion vers BoardGame
  ↓
Affichage dans GameCard
```

### 3. Composant GameCard

**Fichier :** `/apps/web/components/games/GameCard.tsx`

Affiche un jeu sous forme de carte avec :
- Image du jeu
- Nom du jeu
- Catégorie principale
- Nombre de joueurs
- Durée de jeu
- Complexité (si disponible)

Au clic, appelle `onViewDetails()` qui déclenche la navigation vers `/games/[id]`.

### 4. Page de Détails du Jeu

**Fichier :** `/apps/web/app/games/[id]/page.tsx`

#### Structure de la page :

```
ResponsiveLayout
  ├── Header (avec bouton retour)
  └── Grid Layout (responsive)
      ├── Colonne 1 (Image + Infos rapides)
      │   ├── Image du jeu
      │   ├── Nombre de joueurs
      │   ├── Durée
      │   ├── Âge minimum
      │   ├── Complexité
      │   └── Note moyenne
      └── Colonne 2 (Détails complets)
          ├── Titre et année
          ├── Description
          ├── Catégories (badges bleus)
          ├── Mécaniques (badges violets)
          ├── Concepteurs
          ├── Artistes
          ├── Éditeurs
          └── Lien BoardGameGeek (si disponible)
```

#### Fonctionnalités :
- **Récupération des données** : Utilise l'ID du jeu pour récupérer les détails depuis la table `games`
- **Gestion d'erreurs** : Affiche un message d'erreur si le jeu n'existe pas
- **Navigation** : Bouton retour vers le dashboard
- **Lien externe** : Lien vers BoardGameGeek si `bgg_id` est disponible

## Structure de la Base de Données

### Table `games`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique (clé primaire) |
| `bgg_id` | text | Identifiant BoardGameGeek (optionnel) |
| `name` | text | Nom du jeu |
| `description` | text | Description du jeu |
| `min_players` | integer | Nombre minimum de joueurs |
| `max_players` | integer | Nombre maximum de joueurs |
| `duration_min` | integer | Durée en minutes |
| `photo_url` | text | URL de l'image du jeu |
| `data` | jsonb | Données supplémentaires (catégories, mécaniques, etc.) |

### Format du champ `data` (JSONB)

```json
{
  "yearPublished": "2020",
  "minAge": 10,
  "complexity": 3.5,
  "averageRating": 7.8,
  "usersRated": 5000,
  "rank": 42,
  "categories": ["Stratégie", "Fantastique"],
  "mechanics": ["Placement d'ouvriers", "Gestion de ressources"],
  "designers": ["John Doe"],
  "artists": ["Jane Smith"],
  "publishers": ["Editeur ABC"]
}
```

## États et Gestion d'Erreurs

### États de chargement

1. **Loading** : Affiche un spinner avec message "Chargement..."
2. **Error** : Affiche une icône d'avertissement avec message d'erreur
3. **Empty** : Affiche un message "Aucun jeu trouvé" avec bouton d'actualisation
4. **Success** : Affiche la grille de jeux

### États offline

La fonctionnalité nécessite une connexion à Supabase. En cas d'erreur réseau :
- Message d'erreur explicite
- Bouton "Actualiser" pour réessayer

## Responsiveness

### Points de rupture (Breakpoints)

- **Mobile** (< 768px) : 2 colonnes de jeux
- **Tablet** (768px - 1024px) : 3 colonnes de jeux
- **Desktop** (> 1024px) : 4 colonnes de jeux

### Page de détails

- **Mobile** : Layout en 1 colonne (image puis détails)
- **Desktop** : Layout en 2 colonnes (1/3 image, 2/3 détails)

## Accessibilité

- ✅ Navigation au clavier
- ✅ Focus management (boutons et cartes cliquables)
- ✅ Messages d'erreur descriptifs
- ✅ Contraste des couleurs respecté
- ✅ Images avec texte alternatif

## Performance

### Optimisations implémentées

1. **Limite de requête** : Maximum 50 jeux récupérés de la DB
2. **Affichage limité** : Seulement 8 jeux affichés à la fois
3. **Lazy loading** : Les images sont chargées à la demande
4. **Single query** : Une seule requête pour récupérer les détails d'un jeu

### Considérations futures

- Implémenter un cache pour les jeux récemment consultés
- Ajouter une pagination pour explorer plus de jeux
- Implémenter un système de favoris
- Ajouter des filtres (catégories, nombre de joueurs, durée)

## Tests recommandés

### Tests d'intégration

1. **Test de navigation** :
   - Vérifier que le clic sur un jeu navigue vers `/games/[id]`
   - Vérifier que le bouton retour revient au dashboard

2. **Test de chargement** :
   - Vérifier l'affichage du spinner pendant le chargement
   - Vérifier l'affichage correct des jeux après chargement

3. **Test d'erreur** :
   - Simuler une erreur Supabase
   - Vérifier l'affichage du message d'erreur
   - Vérifier que le bouton "Actualiser" fonctionne

4. **Test de cas limite** :
   - Base de données vide (0 jeux)
   - Jeu avec données manquantes
   - ID de jeu invalide

## Sécurité

### Mesures de sécurité

- ✅ Validation de l'ID du jeu (UUID)
- ✅ Gestion des erreurs Supabase
- ✅ Protection contre les injections SQL (via Supabase client)
- ✅ Row Level Security (RLS) à activer sur la table `games`

### Recommandations

- Activer RLS sur la table `games` avec une politique de lecture publique
- Valider les données avant l'affichage
- Implémenter un rate limiting pour les requêtes

## Migration et Base de Données

### Vérification de la migration

Assurez-vous que la table `games` existe :

```sql
SELECT * FROM games LIMIT 5;
```

### Insertion de données de test

```sql
INSERT INTO games (name, description, min_players, max_players, duration_min, photo_url, data)
VALUES 
  ('Catan', 'Jeu de stratégie et de commerce', 3, 4, 90, 'https://example.com/catan.jpg', 
   '{"yearPublished": "1995", "categories": ["Stratégie"], "complexity": 2.3}'),
  ('Azul', 'Jeu de placement de tuiles', 2, 4, 45, 'https://example.com/azul.jpg',
   '{"yearPublished": "2017", "categories": ["Abstrait"], "complexity": 1.8}');
```

## Dépendances

### Packages utilisés

- `@supabase/auth-helpers-nextjs` : Client Supabase pour Next.js
- `next/navigation` : Navigation côté client
- Composants UI personnalisés : `Button`, `Card`, `LoadingSpinner`
- Layout personnalisé : `ResponsiveLayout`

### Types

- `Database` : Types générés depuis le schéma Supabase (@gemou2/database)
- `Game` : Type pour les jeux de la base de données
- `BoardGame` : Type pour les jeux affichés (compatibilité avec GameCard)

## Changelog

### Version 1.0.0 (Actuelle)

- ✅ Affichage aléatoire de 8 jeux depuis la table `games`
- ✅ Navigation vers `/games/[id]` au clic
- ✅ Page de détails complète avec toutes les informations
- ✅ Gestion des états de chargement et d'erreur
- ✅ Design responsive et accessible

### Améliorations futures

- [ ] Système de filtres et de recherche
- [ ] Pagination pour explorer plus de jeux
- [ ] Système de favoris et de wishlist
- [ ] Intégration avec l'API BoardGameGeek
- [ ] Recommandations personnalisées basées sur les préférences
- [ ] Système de notation et de commentaires

## Support et Maintenance

Pour toute question ou problème, consultez :
- Documentation Supabase : https://supabase.com/docs
- Documentation Next.js : https://nextjs.org/docs
- Schéma de la base de données : `/supabase/migrations/`



