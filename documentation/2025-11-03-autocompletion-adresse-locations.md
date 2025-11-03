# 📍 Implémentation de l'Autocomplétion d'Adresse basée sur la Table Locations

**Date :** 3 novembre 2025  
**Auteur :** Assistant IA  
**Type :** Feature Implementation

---

## 📋 Résumé

Ajout d'une fonctionnalité d'autocomplétion pour les champs d'adresse dans les formulaires de création d'événements (`/create-event`) et d'annonces de trading (`/create-trade`). L'autocomplétion est basée sur une nouvelle table `locations` contenant les quartiers (districts) et villes de La Réunion.

---

## 🎯 Objectifs

1. ✅ Faciliter la saisie des adresses pour les utilisateurs
2. ✅ Standardiser les localisations dans l'application
3. ✅ Améliorer l'expérience utilisateur avec des suggestions pertinentes
4. ✅ Permettre la recherche par quartier (district) ou par ville
5. ✅ Fonctionner sur les versions web et mobile

---

## 🗄️ Structure de la Base de Données

### Table `locations`

```sql
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  district text NOT NULL,           -- Nom du quartier/district
  city text NOT NULL,                -- Nom de la ville/commune
  postal_code text,                  -- Code postal
  latitude decimal(10, 8),           -- Latitude (optionnel)
  longitude decimal(11, 8),          -- Longitude (optionnel)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Index et Contraintes

- **Contrainte unique** : `unique_district_city` pour éviter les doublons
- **Index de recherche** :
  - `idx_locations_district` sur `district`
  - `idx_locations_city` sur `city`
  - `idx_locations_district_city` sur `(district, city)`
  - `idx_locations_district_search` (GIN) pour recherche full-text

### RLS (Row Level Security)

- ✅ Lecture publique : Tout le monde peut consulter les localisations
- ⚠️ Modification : Réservée aux administrateurs

### Données Initiales

La migration inclut **100+ localisations** pour La Réunion :
- Saint-Denis (11 quartiers)
- Saint-Paul (12 quartiers)
- Saint-Pierre (10 quartiers)
- Le Tampon (7 quartiers)
- Et 20 autres communes

---

## 🏗️ Architecture Technique

### 1. Hook `useLocations`

**Localisation :**
- Web : `apps/web/hooks/useLocations.ts`
- Mobile : `apps/mobile/hooks/useLocations.ts`

**Interface :**

```typescript
interface UseLocationsReturn {
  locations: LocationOption[]
  loading: boolean
  error: string | null
  searchLocations: (query: string) => Promise<void>
}

interface LocationOption {
  id: string
  district: string
  city: string
  label: string // Format: "District, City"
  postal_code: string | null
}
```

**Fonctionnalités :**
- ✅ Recherche avec debounce (300ms)
- ✅ Recherche sur `district` OU `city` (requête `ilike`)
- ✅ Limite de 10 résultats
- ✅ Gestion des erreurs

**Hooks auxiliaires :**
- `useCities()` : Récupère toutes les villes uniques
- `useDistrictsByCity(city)` : Récupère les districts d'une ville

---

### 2. Composant `LocationAutocomplete`

#### Version Web

**Localisation :** `apps/web/components/marketplace/LocationAutocomplete.tsx`

**Props :**

```typescript
interface LocationAutocompleteProps {
  value: string
  onChange: (value: string, quarter?: string, city?: string) => void
  label?: string
  error?: string
  required?: boolean
}
```

**Caractéristiques :**
- ✅ Dropdown avec liste de suggestions
- ✅ Indicateur de chargement
- ✅ Message "Aucun résultat trouvé"
- ✅ Affichage du code postal (si disponible)
- ✅ Icône de localisation
- ✅ Fermeture au clic en dehors
- ✅ Activation à partir de 2 caractères

#### Version Mobile

**Localisation :** `apps/mobile/components/ui/LocationAutocomplete.tsx`

**Caractéristiques :**
- ✅ Dropdown positionné en absolu sous le champ (similaire au web)
- ✅ Design React Native natif
- ✅ Scroll dans la liste
- ✅ Gestion tactile optimisée
- ✅ Se ferme au blur avec délai pour permettre la sélection
- ✅ Fermeture du clavier après sélection
- ✅ Mêmes fonctionnalités que la version web

---

## 📱 Intégrations

### 1. Page `/create-trade` (Web)

**Fichier :** `apps/web/app/create-trade/page.tsx`

✅ Déjà intégré avec le composant `LocationAutocomplete`
- Le composant est utilisé pour les champs `location_quarter` et `location_city`
- Les données sont enregistrées dans la table `marketplace_items`

### 2. Page `/create-event` (Web)

**Fichier :** `apps/web/components/events/CreateEventForm.tsx`

**Modifications :**
```tsx
// Avant
<input
  type="text"
  value={formData.location}
  onChange={(e) => handleInputChange('location', e.target.value)}
  placeholder="Ex: 123 Rue de la Paix, Paris"
/>

// Après
<LocationAutocomplete
  label="Lieu"
  value={formData.location}
  onChange={(value) => handleInputChange('location', value)}
  required
  error={errors.location}
/>
```

### 3. Page `/create-event` (Mobile)

**Fichier :** `apps/mobile/app/(tabs)/create-event.tsx`

**Modifications :**
```tsx
// Avant
<TextInput
  value={formData.location}
  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
  placeholder="Adresse de l'événement"
/>

// Après
<LocationAutocomplete
  label="Lieu"
  value={formData.location}
  onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
  required
  error={errors.location}
  placeholder="Ex: Le Moufia, Saint-Denis"
/>
```

### 4. Page `/create-trade` (Mobile) ⭐ NOUVEAU

**Fichier :** `apps/mobile/app/(tabs)/create-trade.tsx`

**Modifications :**
```tsx
// Avant
<View style={styles.inputContainer}>
  <Text style={styles.label}>Ville *</Text>
  <TextInput
    value={formData.location_city}
    onChangeText={(text) => setFormData(prev => ({ ...prev, location_city: text }))}
    placeholder="Paris"
  />
</View>

// Après
<LocationAutocomplete
  label="Localisation"
  value={formData.location_quarter 
    ? `${formData.location_quarter}, ${formData.location_city}` 
    : formData.location_city}
  onChange={(value, district, city) => {
    if (district && city) {
      setFormData(prev => ({ 
        ...prev, 
        location_quarter: district, 
        location_city: city 
      }))
    } else {
      setFormData(prev => ({ 
        ...prev, 
        location_quarter: '',
        location_city: value 
      }))
    }
  }}
  required
  error={errors.location_city}
  placeholder="Ex: Le Moufia, Saint-Denis"
/>
```

---

## 🎨 Arborescence des Composants

### Page `/create-event` (Web)

```
CreateEventPage (page.tsx)
  └─ ResponsiveLayout
      └─ CreateEventForm
          ├─ Input (Titre)
          ├─ Textarea (Description)
          ├─ Input (Date et heure)
          ├─ LocationAutocomplete ⭐ NOUVEAU
          │   └─ useLocations hook
          │       └─ Supabase locations table
          ├─ Input (Max participants)
          ├─ Radio (Visibilité)
          ├─ ImageUpload
          ├─ GameSelector
          └─ Buttons (Annuler, Aperçu, Créer)
```

### Page `/create-event` (Mobile)

```
CreateEventPage (create-event.tsx)
  └─ ScrollView
      ├─ Header (avec bouton retour)
      ├─ Card
      │   ├─ TextInput (Titre)
      │   ├─ TextInput (Description)
      │   ├─ TextInput (Date et heure)
      │   ├─ LocationAutocomplete ⭐ NOUVEAU
      │   │   ├─ TextInput
      │   │   └─ Modal (Dropdown)
      │   │       └─ FlatList (LocationOption[])
      │   │           └─ useLocations hook
      │   │               └─ Supabase locations table
      │   ├─ TextInput (Max participants)
      │   ├─ VisibilityButtons
      │   └─ ActionButtons
      └─ ConfirmationModal
```

### Page `/create-trade` (Web)

```
CreateTradePage (page.tsx)
  └─ ResponsiveLayout
      └─ Card
          ├─ ToggleType (Vente/Échange)
          ├─ Input (Titre)
          ├─ GameSelect
          ├─ Select (État)
          ├─ Textarea (Description)
          ├─ LocationAutocomplete ⭐ EXISTANT (mis à jour)
          │   └─ useLocations hook
          │       └─ Supabase locations table
          ├─ ImageUpload
          ├─ Input (Prix) [si vente]
          ├─ Input (Jeu recherché) [si échange]
          ├─ Toggle (Livraison)
          └─ Buttons (Enregistrer, Publier)
```

### Page `/create-trade` (Mobile) ⭐ NOUVEAU

```
CreateTradePage (create-trade.tsx)
  └─ ScrollView
      ├─ Header (avec bouton retour)
      ├─ Card
      │   ├─ TypeButtons (Vente/Échange/Don)
      │   ├─ TextInput (Titre)
      │   ├─ TextInput (Description)
      │   ├─ TextInput (Prix) [si vente]
      │   ├─ TextInput (Jeu souhaité) [si échange]
      │   ├─ LocationAutocomplete ⭐ NOUVEAU
      │   │   ├─ TextInput
      │   │   └─ Modal (Dropdown)
      │   │       └─ FlatList (LocationOption[])
      │   │           └─ useLocations hook
      │   │               └─ Supabase locations table
      │   ├─ ConditionButtons
      │   └─ ActionButtons (Annuler, Publier)
```

---

## 🔄 Flux de Données

### Recherche d'une Localisation

```
1. Utilisateur tape dans le champ
   ↓
2. Debounce (300ms)
   ↓
3. Hook useLocations.searchLocations()
   ↓
4. Requête Supabase
   SELECT * FROM locations
   WHERE district ILIKE '%query%' OR city ILIKE '%query%'
   LIMIT 10
   ↓
5. Transformation en LocationOption[]
   ↓
6. Affichage dans le dropdown/modal
   ↓
7. Utilisateur sélectionne une option
   ↓
8. onChange(label, district, city)
   ↓
9. Mise à jour du formulaire
```

---

## 🚀 Migration de la Base de Données

**Fichier :** `supabase/migrations/20251103000000_create_locations_table.sql`

### Commandes pour appliquer la migration

#### Environnement Local

```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735
supabase db reset
# ou
supabase migration up
```

#### Environnement de Production

```bash
# Via Supabase Dashboard
# 1. Aller dans Database > Migrations
# 2. Créer une nouvelle migration
# 3. Copier le contenu du fichier SQL
# 4. Exécuter la migration

# OU via CLI
supabase db push
```

---

## 🧪 Tests et Validation

### Tests à Effectuer

#### Fonctionnels

- [ ] **Recherche par quartier** : Taper "Moufia" → affiche "Le Moufia, Saint-Denis"
- [ ] **Recherche par ville** : Taper "Saint-Denis" → affiche tous les quartiers de Saint-Denis
- [ ] **Recherche partielle** : Taper "bell" → affiche "Bellepierre, Saint-Denis"
- [ ] **Pas de résultats** : Taper "xyz123" → affiche "Aucun résultat trouvé"
- [ ] **Sélection** : Cliquer sur une suggestion → remplit le champ
- [ ] **Fermeture** : Cliquer en dehors → ferme le dropdown
- [ ] **Mobile** : Modal s'ouvre et ferme correctement

#### Performance

- [ ] La recherche s'active après 2 caractères minimum
- [ ] Le debounce fonctionne (pas de requête à chaque touche)
- [ ] Affichage du loader pendant le chargement
- [ ] Maximum 10 résultats affichés

#### Intégration

- [ ] `/create-event` (web) : Sauvegarde correcte dans `events.location`
- [ ] `/create-event` (mobile) : Sauvegarde correcte dans `events.location`
- [ ] `/create-trade` (web) : Sauvegarde correcte dans `marketplace_items.location_quarter` et `location_city`
- [ ] `/create-trade` (mobile) : Sauvegarde correcte dans `marketplace_items.location_quarter` et `location_city` ⭐ NOUVEAU

---

## 📊 Impact sur l'Infrastructure

### Base de Données

- ✅ **Nouvelle table** : `locations` (~100 lignes initialement)
- ✅ **4 nouveaux index** pour optimiser les recherches
- ✅ **RLS activé** pour la sécurité

### Taille Estimée

- Table : ~10 KB
- Index : ~5 KB par index = 20 KB
- **Total** : ~30 KB

### Migrations Requises

- ✅ Une seule migration : `20251103000000_create_locations_table.sql`
- ⚠️ Pas de migration destructive
- ✅ Compatible avec les données existantes

---

## 🔒 Sécurité

### RLS Policies

```sql
-- Lecture publique
CREATE POLICY "Les localisations sont publiques en lecture"
  ON public.locations FOR SELECT
  USING (true);

-- Modification réservée aux admins
CREATE POLICY "Seuls les admins peuvent modifier"
  ON public.locations FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Validation des Entrées

- ✅ Recherche limitée à 10 résultats
- ✅ Query paramétrée (protection contre SQL injection)
- ✅ Longueur minimale de 2 caractères

---

## 🌍 Localisation (i18n)

### Textes Français

Tous les textes sont en français :
- "Localisation à La Réunion"
- "Aucun résultat trouvé"
- "Recherche..."
- Labels et placeholders

### Extension Future

Structure prête pour l'internationalisation :
- Fichiers de traduction à ajouter
- Clés de traduction à définir
- Support multi-langues possible

---

## 📈 Évolutions Futures Possibles

### Court Terme

- [ ] Ajouter plus de quartiers/districts
- [ ] Géolocalisation automatique (utiliser latitude/longitude)
- [ ] Tri par popularité des localisations

### Moyen Terme

- [ ] Suggérer la localisation la plus proche (GPS)
- [ ] Afficher une carte avec les localisations
- [ ] Statistiques sur les localisations les plus utilisées

### Long Terme

- [ ] Étendre à d'autres régions (Martinique, Guadeloupe, etc.)
- [ ] API publique de géocodage
- [ ] Calcul de distance entre utilisateurs

---

## 🐛 Dépannage

### Problème : "Aucun résultat trouvé"

**Cause possible :**
- La migration n'a pas été exécutée
- La table `locations` est vide

**Solution :**
```bash
# Vérifier la table
supabase db connect
SELECT COUNT(*) FROM locations;

# Si vide, relancer la migration
supabase migration up
```

### Problème : Dropdown ne s'affiche pas

**Cause possible :**
- Le hook `useLocations` ne charge pas les données
- Erreur RLS

**Solution :**
1. Vérifier la console du navigateur
2. Vérifier les policies RLS dans Supabase Dashboard
3. Tester la requête SQL directement

### Problème : Recherche lente

**Cause possible :**
- Index manquants
- Trop de résultats

**Solution :**
```sql
-- Vérifier les index
SELECT indexname FROM pg_indexes WHERE tablename = 'locations';

-- Ajouter un index si nécessaire
CREATE INDEX idx_locations_district ON locations (district);
```

### Problème : Sur mobile, je ne peux pas cliquer sur les suggestions

**Cause possible :**
- Le dropdown se ferme trop vite au blur du champ

**Solution :**
Le composant utilise un délai de 200ms au blur pour permettre le clic sur les suggestions.
Si le problème persiste, augmenter le délai dans `LocationAutocomplete.tsx` :

```tsx
const handleBlur = () => {
  setTimeout(() => {
    setShowDropdown(false)
  }, 300) // Augmenter à 300ms ou plus
}
```

---

## 📝 Notes Techniques

### Différences Web vs Mobile

| Aspect | Web | Mobile |
|--------|-----|--------|
| **Dropdown** | `<div>` absolu | `<View>` absolu |
| **Liste** | Divs cliquables | `<ScrollView>` avec mapping |
| **Fermeture** | Click outside | Blur avec délai (200ms) |
| **Styles** | CSS Tailwind | StyleSheet |
| **Z-index** | CSS z-index | elevation + zIndex |

### Performance

- **Debounce** : 300ms pour éviter trop de requêtes
- **Limite** : 10 résultats maximum
- **Index** : Recherche optimisée avec GIN

---

## ✅ Checklist de Déploiement

### Avant le déploiement

- [x] Migration SQL créée et testée
- [x] Hook `useLocations` créé (web et mobile)
- [x] Composant `LocationAutocomplete` créé (web et mobile)
- [x] Intégration dans `/create-event` (web et mobile)
- [x] Intégration dans `/create-trade` (web)
- [x] Documentation créée

### Lors du déploiement

- [ ] Exécuter la migration sur la DB de production
- [ ] Vérifier que les données initiales sont insérées
- [ ] Tester les policies RLS
- [ ] Vérifier les index

### Après le déploiement

- [ ] Tester l'autocomplétion sur chaque page
- [ ] Monitorer les performances (temps de réponse)
- [ ] Vérifier les logs d'erreurs
- [ ] Recueillir les retours utilisateurs

---

## 📚 Ressources

### Fichiers Modifiés

```
supabase/migrations/
  └─ 20251103000000_create_locations_table.sql  ⭐ NOUVEAU

apps/web/
  ├─ hooks/
  │   └─ useLocations.ts                         ⭐ NOUVEAU
  ├─ components/
  │   ├─ marketplace/
  │   │   └─ LocationAutocomplete.tsx            ✏️ MODIFIÉ
  │   └─ events/
  │       └─ CreateEventForm.tsx                 ✏️ MODIFIÉ

apps/mobile/
  ├─ hooks/
  │   └─ useLocations.ts                         ⭐ NOUVEAU
  ├─ components/
  │   └─ ui/
  │       ├─ LocationAutocomplete.tsx            ⭐ NOUVEAU
  │       └─ index.ts                            ✏️ MODIFIÉ
  └─ app/
      └─ (tabs)/
          ├─ create-event.tsx                    ✏️ MODIFIÉ
          └─ create-trade.tsx                    ✏️ MODIFIÉ ⭐ NOUVEAU

documentation/
  └─ 2025-11-03-autocompletion-adresse-locations.md  ⭐ NOUVEAU
```

### Références

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [React Native Modal](https://reactnative.dev/docs/modal)

---

## 🎉 Conclusion

L'implémentation de l'autocomplétion d'adresse améliore significativement l'expérience utilisateur en :
- ✅ Facilitant la saisie des localisations
- ✅ Standardisant les données
- ✅ Réduisant les erreurs de saisie
- ✅ Offrant une UX moderne et intuitive

La solution est **scalable**, **performante** et **maintenable**, avec un impact minimal sur l'infrastructure existante.

### Pages Implémentées

- ✅ `/create-event` (Web)
- ✅ `/create-event` (Mobile)
- ✅ `/create-trade` (Web)
- ✅ `/create-trade` (Mobile) ⭐ NOUVEAU

Toutes les pages utilisent le même composant `LocationAutocomplete` connecté à la table `locations` de Supabase, garantissant une expérience cohérente sur toutes les plateformes.

---

**Auteur :** Assistant IA  
**Date de création :** 3 novembre 2025  
**Dernière mise à jour :** 3 novembre 2025  
**Version :** 1.2 (Fix comportement mobile : dropdown absolu au lieu de modal)

