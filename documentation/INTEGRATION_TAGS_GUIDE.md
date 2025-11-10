# Guide d'intégration des tags dans les formulaires de création d'événements

Ce guide explique comment intégrer le composant TagSelector dans les formulaires existants.

## Fichiers créés

- `apps/web/components/events/TagSelector.tsx` - Composant de sélection de tags pour web
- `apps/mobile/components/events/TagSelector.tsx` - Composant de sélection de tags pour mobile
- `supabase/migrations/20250110000000_create_tags_tables.sql` - Migration de base de données

## Modifications à faire manuellement

Les fichiers CreateEventForm.tsx et create-event.tsx existent déjà dans le projet. 
Vous devez les modifier pour intégrer le TagSelector selon les instructions ci-dessous.

## Affichage des tags dans les pages de détails

### Pour la page web (apps/web/app/events/[id]/page.tsx)

Le code charge déjà les tags (lignes 88-96). Il faut :

1. **Ajouter l'import du composant EventTags** :
```typescript
import EventTags from '../../../components/events/EventTags';
```

2. **Transformer les données des tags** pour les passer au composant :
```typescript
const eventTagsList = eventTags
  .filter(et => et.tags)
  .map(et => ({
    id: et.tag_id,
    name: et.tags.name
  }));
```

3. **Ajouter l'affichage des tags** après la description (ligne ~586) :
```typescript
{/* Tags */}
{eventTagsList.length > 0 && (
  <EventTags tags={eventTagsList} className="mt-6" />
)}
```

### Pour la page mobile (apps/mobile/app/(tabs)/events/[id].tsx)

1. **Charger les tags de l'événement** dans la fonction de chargement :
```typescript
const { data: tagsData } = await supabase
  .from('event_tags')
  .select(`
    tag_id,
    tags (
      id,
      name
    )
  `)
  .eq('event_id', id)
```

2. **Ajouter l'état pour les tags** :
```typescript
const [eventTags, setEventTags] = useState<any[]>([])
```

3. **Transformer et stocker les tags** :
```typescript
if (tagsData) {
  const tagsList = tagsData
    .filter(et => et.tags)
    .map(et => ({
      id: et.tag_id,
      name: et.tags.name
    }));
  setEventTags(tagsList)
}
```

4. **Ajouter l'import et l'affichage** :
```typescript
import EventTags from '../../components/events/EventTags'

// Dans le JSX, après la description :
{eventTags.length > 0 && (
  <EventTags tags={eventTags} />
)}
```
