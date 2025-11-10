# Implémentation du système de tags pour événements

Date de création : 10 janvier 2025

## Résumé

Système de tags permettant de catégoriser les événements avec sélection multiple (maximum 3 tags) lors de la création et affichage sous forme de badges roses dans les pages de détails.

## Fichiers créés

### Base de données
- `supabase/migrations/20250110000000_create_tags_tables.sql`
  - Crée les tables `tags` et `event_tags`
  - Configure les politiques RLS
  - Ajoute un trigger pour limiter à 3 tags par événement
  - Insère 10 tags prédéfinis

### Composants Web
- `apps/web/components/events/TagSelector.tsx`
  - Composant de sélection multiple de tags avec validation (max 3)
  - Chargement automatique des tags depuis Supabase
  - Interface avec badges cliquables

- `apps/web/components/events/EventTags.tsx`
  - Composant d'affichage des tags sous forme de badges roses
  - Utilisé dans les pages de détails

### Composants Mobile
- `apps/mobile/components/events/TagSelector.tsx`
  - Version React Native du sélecteur de tags
  - Même fonctionnalité que la version web

- `apps/mobile/components/events/EventTags.tsx`
  - Version React Native de l'affichage des tags

### Documentation
- `documentation/INTEGRATION_TAGS_GUIDE.md`
  - Guide détaillé pour intégrer les tags dans les formulaires existants

## Structure de la base de données

### Table `tags`
- `id` (uuid) - Identifiant unique
- `name` (text) - Nom du tag (unique)
- `color` (text) - Couleur optionnelle pour personnalisation future
- `created_at` (timestamptz) - Date de création

### Table `event_tags`
- `event_id` (uuid) - Référence vers events
- `tag_id` (uuid) - Référence vers tags
- `created_at` (timestamptz) - Date de création
- Contrainte : maximum 3 tags par événement (enforced par trigger)

## Tags prédéfinis

Les tags suivants sont créés automatiquement :
- Compétitif
- Décontracté
- Famille
- Expert
- Débutant
- Soirée
- Journée
- Tournoi
- Découverte
- Rapide

## Sécurité (RLS)

- **Tags** : Lecture publique, écriture pour utilisateurs authentifiés (peut être restreint aux admins)
- **Event_tags** : Lecture publique, écriture uniquement pour les créateurs d'événements

## Utilisation

### Dans un formulaire de création

```typescript
import TagSelector from './components/events/TagSelector'

const [selectedTags, setSelectedTags] = useState<string[]>([])

// Dans le JSX
<TagSelector
  selectedTags={selectedTags}
  onTagsChange={setSelectedTags}
  maxTags={3}
/>

// Lors de la soumission
if (selectedTags.length > 0) {
  const tagsToInsert = selectedTags.map(tagId => ({
    event_id: eventData.id,
    tag_id: tagId
  }))
  await supabase.from('event_tags').insert(tagsToInsert)
}
```

### Dans une page de détails

```typescript
import EventTags from './components/events/EventTags'

// Charger les tags
const { data: tagsData } = await supabase
  .from('event_tags')
  .select(`
    tag_id,
    tags (id, name)
  `)
  .eq('event_id', eventId)

// Transformer les données
const eventTagsList = tagsData
  .filter(et => et.tags)
  .map(et => ({
    id: et.tag_id,
    name: et.tags.name
  }))

// Afficher
<EventTags tags={eventTagsList} />
```

## Prochaines étapes

1. Appliquer la migration SQL dans Supabase
2. Intégrer TagSelector dans CreateEventForm.tsx (voir guide)
3. Intégrer TagSelector dans create-event.tsx mobile (voir guide)
4. Ajouter l'affichage des tags dans les pages de détails (voir guide)
5. Tester la fonctionnalité complète

## Notes importantes

- Le système supporte à la fois les tags prédéfinis et la création dynamique
- Pour l'instant, seuls les tags prédéfinis sont utilisés
- La création dynamique de tags nécessitera une interface admin (à implémenter)
- Les badges utilisent la couleur `bg-pink-100` comme spécifié
