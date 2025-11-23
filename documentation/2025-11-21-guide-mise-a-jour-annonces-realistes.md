# 📝 Guide de Mise à Jour des Annonces Marketplace - Versions Réalistes

**Date**: 27 janvier 2025  
**Objectif**: Rendre les annonces existantes dans la base de données plus réalistes et naturelles

---

## 🎯 Objectif

Ce script SQL met à jour les annonces existantes dans la table `marketplace_items` pour les rendre plus réalistes avec :

- ✅ Des descriptions détaillées et naturelles
- ✅ Des prix cohérents avec le marché des jeux d'occasion
- ✅ Des localisations précises (vrais quartiers de La Réunion)
- ✅ Des conditions variées (new, excellent, good, fair, worn)
- ✅ Des dates de création variées pour un aspect plus naturel
- ✅ Des options de livraison variées selon les annonces

---

## 📋 Prérequis

1. **Accès à Supabase Dashboard**
   - Ouvrir votre projet Supabase
   - Aller dans **SQL Editor**

2. **Vérifier que la table existe**
   ```sql
   SELECT COUNT(*) FROM marketplace_items;
   ```

3. **Vérifier qu'il y a des annonces à mettre à jour**
   ```sql
   SELECT id, title, type, status 
   FROM marketplace_items 
   WHERE status = 'available'
   ORDER BY created_at DESC;
   ```

---

## 🚀 Utilisation

### Étape 1 : Ouvrir le script SQL

Le fichier se trouve dans :
```
documentation/2025-01-27-update-marketplace-items-realistic.sql
```

### Étape 2 : Exécuter le script

1. Copier tout le contenu du fichier SQL
2. Coller dans Supabase SQL Editor
3. Cliquer sur **Run** ou appuyer sur `Ctrl+Enter`

### Étape 3 : Vérifier les résultats

Le script affiche automatiquement :
- Toutes les annonces mises à jour
- Statistiques par type (vente/échange)
- Statistiques par condition
- Statistiques par ville

---

## 📊 Modifications Apportées

### Annonces de Vente

| Jeu | Prix | Condition | Localisation | Livraison |
|-----|------|-----------|---------------|-----------|
| Monopoly | 42€ | Excellent | Saint-Denis, Bellepierre | ✅ Oui |
| Risk | 28€ | Bon | Le Tampon, Trois-Mares | ✅ Oui |
| Scrabble | 38€ | Excellent | Saint-André | ❌ Non |
| Blanc Manger Coco | 45€ | Neuf | Saint-Gilles-les-Bains | ✅ Oui |
| Les Aventuriers du Rail | 35€ | Bon | La Possession | ❌ Non |

### Annonces d'Échange

| Jeu | Condition | Jeu Recherché | Localisation | Livraison |
|-----|-----------|---------------|--------------|-----------|
| Catan | Bon | Azul, Splendor, 7 Wonders | Saint-Pierre, Terre Sainte | ❌ Non |
| Dixit + Extension | Neuf | Wingspan, Évolution, Mysterium | Saint-Louis | ✅ Oui |
| Codenames (2 jeux) | Excellent | Mysterium, Déception | Le Port | ✅ Oui |

### Annonces à Prix Symbolique (ex-dons)

| Jeu | Prix | Condition | Localisation | Livraison |
|-----|------|-----------|---------------|-----------|
| 7 Familles | 2€ | Correct | Saint-Paul | ❌ Non |
| Uno | 3€ | Usé | Saint-Benoît | ❌ Non |

---

## 🗺️ Localisations Utilisées

Le script utilise de **vrais quartiers de La Réunion** :

- **Saint-Denis** : Bellepierre, Sainte-Clotilde, Le Chaudron
- **Saint-Pierre** : Terre Sainte, Ravine des Cabris
- **Le Tampon** : Trois-Mares
- **Saint-Paul** : La Saline-les-Bains, L'Hermitage
- **Saint-Louis** : (centre-ville)
- **Le Port** : (centre-ville)
- **La Possession** : (centre-ville)
- **Saint-André** : (centre-ville)
- **Saint-Gilles-les-Bains** : (centre-ville)
- **Saint-Benoît** : (centre-ville)

---

## ⚠️ Notes Importantes

### 1. Type 'donation' n'existe pas

La contrainte de la table n'autorise que `'sale'` et `'exchange'`.  
Les anciennes annonces de type `'donation'` sont converties en `'sale'` avec un prix symbolique (2-3€).

### 2. Colonne seller_id

Le script utilise `seller_id` (et non `user_id`) qui est la colonne correcte selon les migrations.

### 3. LIMIT 1

Chaque UPDATE utilise `LIMIT 1` pour ne mettre à jour qu'une seule annonce par type de jeu, même s'il y en a plusieurs.

### 4. Dates de création variées

Les dates sont variées entre 3 et 30 jours pour un aspect plus naturel :
- Annonces récentes : 3-7 jours
- Annonces moyennes : 8-15 jours  
- Annonces anciennes : 20-30 jours

---

## 🔍 Vérification Post-Exécution

### Vérifier les descriptions

```sql
SELECT 
  title,
  LENGTH(description) as longueur_description,
  condition,
  price,
  location_city,
  location_quarter
FROM marketplace_items
WHERE status = 'available'
ORDER BY created_at DESC;
```

### Vérifier les prix

```sql
SELECT 
  type,
  COUNT(*) as nombre,
  ROUND(AVG(price), 2) as prix_moyen,
  MIN(price) as prix_min,
  MAX(price) as prix_max
FROM marketplace_items
WHERE status = 'available' AND type = 'sale'
GROUP BY type;
```

### Vérifier les localisations

```sql
SELECT 
  location_city,
  location_quarter,
  COUNT(*) as nombre_annonces
FROM marketplace_items
WHERE status = 'available'
GROUP BY location_city, location_quarter
ORDER BY nombre_annonces DESC;
```

---

## 🆕 Annonces Supplémentaires (Optionnel)

Le script contient une section commentée avec des INSERT pour ajouter des annonces supplémentaires :

- Wingspan (Vente - 55€)
- Azul (Échange)
- Splendor (Vente - 32€)
- Mysterium (Échange)
- 7 Wonders (Vente - 40€)

Pour les utiliser :
1. Décommenter la section "ÉTAPE 4"
2. Remplacer `(SELECT id FROM auth.users LIMIT 1)` par un vrai UUID d'utilisateur
3. Exécuter les INSERT

---

## 📈 Résultats Attendus

Après exécution, vous devriez avoir :

- ✅ Des descriptions de 200-400 caractères (au lieu de 50-100)
- ✅ Des prix cohérents entre 2€ et 55€
- ✅ Des localisations précises avec quartiers
- ✅ Des conditions variées (pas seulement 'excellent')
- ✅ Des dates de création variées
- ✅ Des options de livraison variées

---

## 🐛 Dépannage

### Erreur : "column seller_id does not exist"

Exécutez d'abord la migration de correction :
```sql
-- Voir: supabase/migrations/20251021_fix_marketplace_seller_id.sql
```

### Erreur : "check_type_values constraint"

Vérifiez que vos annonces utilisent bien `'sale'` ou `'exchange'` :
```sql
SELECT DISTINCT type FROM marketplace_items;
```

### Aucune annonce mise à jour

Vérifiez que des annonces existent avec les titres recherchés :
```sql
SELECT title, type FROM marketplace_items WHERE status = 'available';
```

---

## 📝 Structure des Composants

```
documentation/
├── 2025-01-27-update-marketplace-items-realistic.sql  (Script SQL principal)
└── 2025-01-27-guide-mise-a-jour-annonces-realistes.md (Ce guide)
```

---

## ✅ Checklist Post-Exécution

- [ ] Script exécuté sans erreur
- [ ] Descriptions mises à jour (vérifier longueur)
- [ ] Prix cohérents (vérifier moyenne)
- [ ] Localisations précises (vérifier quartiers)
- [ ] Conditions variées (vérifier distribution)
- [ ] Dates variées (vérifier created_at)
- [ ] Options de livraison variées (vérifier delivery_available)

---

**Créé le**: 27 janvier 2025  
**Dernière mise à jour**: 27 janvier 2025

