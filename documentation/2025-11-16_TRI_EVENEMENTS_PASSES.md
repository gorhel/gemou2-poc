# Tri des événements passés - Du plus récent au plus ancien

**Date**: 16 novembre 2025  
**Fichier modifié**: `apps/mobile/app/(tabs)/events/index.tsx`  
**Type**: Amélioration fonctionnelle

---

## 📋 Contexte

Les événements affichés dans l'application mobile sont triés par défaut par ordre chronologique croissant (du plus ancien au plus récent) pour tous les onglets. Cette logique est appropriée pour les événements à venir, mais pour les événements passés, il est plus intuitif d'afficher les événements les plus récents en premier.

## 🎯 Objectif

Modifier l'ordre de tri **uniquement pour l'onglet "Passés"** afin d'afficher les événements du plus récent au plus ancien, tout en conservant le tri par défaut pour les autres onglets.

## 🔧 Implémentation

### Modification apportée

**Fichier**: `apps/mobile/app/(tabs)/events/index.tsx`  
**Fonction**: `filterEvents()`  
**Ligne**: 290-293

```typescript
case 'past':
  // "Passés" : événements dont la date est avant maintenant
  filtered = filtered.filter(event => 
    new Date(event.date_time) < now
  );
  // Tri spécifique pour les événements passés : du plus récent au plus ancien
  filtered.sort((a, b) => 
    new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
  );
  break;
```

### Explication technique

1. **Filtrage**: Les événements sont d'abord filtrés pour ne garder que ceux dont la date est antérieure à maintenant (`< now`)

2. **Tri décroissant**: Un tri est appliqué sur le tableau filtré :
   - `new Date(b.date_time).getTime()` : Convertit la date de l'événement B en timestamp
   - `new Date(a.date_time).getTime()` : Convertit la date de l'événement A en timestamp
   - La soustraction `b - a` donne un ordre décroissant (du plus grand au plus petit)

3. **Résultat**: Les événements passés s'affichent maintenant du plus récent au plus ancien

## 📊 Flux de données

```
Événements bruts (triés par défaut: croissant)
         ↓
   Switch (activeTab)
         ↓
   case 'past':
         ↓
   Filtre: date < now
         ↓
   Tri: décroissant
         ↓
   Affichage: plus récent → plus ancien
```

## 🎨 Impact utilisateur

### Avant la modification
```
Onglet "Passés":
├── Événement du 1 janvier 2024
├── Événement du 15 mars 2024
├── Événement du 10 juin 2024
└── Événement du 20 octobre 2024
```

### Après la modification
```
Onglet "Passés":
├── Événement du 20 octobre 2024  ← Plus récent
├── Événement du 10 juin 2024
├── Événement du 15 mars 2024
└── Événement du 1 janvier 2024   ← Plus ancien
```

## 🔍 Autres onglets non affectés

Les autres onglets conservent leur comportement par défaut :

- **A venir** : Tri croissant (événements futurs du plus proche au plus lointain)
- **Je participe** : Tri croissant (par date d'événement)
- **J'organise** : Tri croissant (par date d'événement)
- **Brouillon** : Tri croissant (par date de création)

## 📱 Plateformes concernées

- ✅ **Mobile** : Modification appliquée
- ⚠️ **Web** : À vérifier si le même comportement est souhaité

## ⚡ Performance

- **Impact minimal** : Le tri s'effectue uniquement sur les événements déjà filtrés
- **Complexité** : O(n log n) où n est le nombre d'événements passés
- **Optimisation** : Le tri se fait en mémoire sur un tableau déjà filtré (généralement petit)

## ✅ Tests recommandés

1. **Test fonctionnel** :
   - Naviguer vers l'onglet "Passés"
   - Vérifier que l'événement le plus récent apparaît en premier
   - Vérifier que l'ordre décroît en scrollant vers le bas

2. **Test de régression** :
   - Vérifier que les autres onglets conservent leur tri par défaut
   - Tester avec des événements ayant la même date
   - Tester avec aucun événement passé

3. **Test de performance** :
   - Tester avec un grand nombre d'événements passés (>100)
   - Vérifier qu'il n'y a pas de lag lors du changement d'onglet

## 🔄 Considérations futures

### Améliorations possibles

1. **Groupement inversé** : Adapter également l'ordre des groupes de dates pour l'onglet "Passés"
   - Actuellement : "Cette semaine" → "La semaine dernière" → "Le mois dernier" → "Plus loin"
   - Potentiellement : "Plus loin" → "Le mois dernier" → "La semaine dernière" → "Cette semaine"

2. **Préférence utilisateur** : Permettre à l'utilisateur de choisir l'ordre de tri via un bouton toggle

3. **Harmonisation web/mobile** : Appliquer le même comportement sur la version web si elle existe

## 📝 Notes techniques

### Pourquoi `sort()` et non pas un nouveau fetch avec `order` ?

- **Efficacité** : Évite une nouvelle requête à la base de données
- **Cohérence** : Tous les filtres sont appliqués côté client après le chargement initial
- **Flexibilité** : Facilite l'ajout de filtres et tris supplémentaires sans modifier les requêtes

### Alternative considérée

```typescript
// Alternative non retenue : Tri au niveau de la requête Supabase
const { data, error } = await supabase
  .from('events')
  .select('*')
  .lt('date_time', now)
  .order('date_time', { ascending: false }) // Tri dans la requête
```

**Raison du rejet** : Nécessiterait de gérer plusieurs requêtes différentes selon l'onglet actif, ce qui compliquerait la logique de chargement et de mise en cache.

## 🏗️ Structure des composants concernés

```
EventsPage (apps/mobile/app/(tabs)/events/index.tsx)
├── useState
│   ├── events (tous les événements chargés)
│   ├── filteredEvents (événements après filtres)
│   └── activeTab (onglet actif)
├── useEffect
│   └── filterEvents() ← Modification appliquée ici
└── Render
    ├── Tabs (A venir, Je participe, J'organise, Passés, Brouillon)
    ├── Filters (Date, Lieu, Type, Joueurs)
    └── EventsList (groupés par section temporelle)
```

## 🔐 Sécurité et validation

- ✅ Aucun impact sur la sécurité
- ✅ Aucune modification des données en base
- ✅ Aucun risque de fuite de données
- ✅ Logique purement côté client

## 📚 Références

- **Fichier source**: `apps/mobile/app/(tabs)/events/index.tsx`
- **Ligne modifiée**: 290-293
- **Documentation associée**: 
  - `2025-11-16_IMPLEMENTATION_FILTRES_TAGS_RECHERCHE.md` (système de filtres)
  - Structure de la base de données : table `events`

---

## ✨ Résumé

Cette modification améliore l'expérience utilisateur en affichant les événements passés dans un ordre plus intuitif (du plus récent au plus ancien), tout en conservant l'ordre chronologique croissant pour les événements à venir dans les autres onglets.

**Impact** : Minime sur les performances, amélioration significative de l'UX.  
**Compatibilité** : Totale avec le code existant.  
**Maintenance** : Aucune action requise.



