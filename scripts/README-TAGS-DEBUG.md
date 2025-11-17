# Guide de Dépannage des Tags

## Problème : Les tags ne sont plus visibles

### Causes possibles

1. **Tags supprimés lors de la migration** - La conversion de type uuid → int a tronqué les données
2. **Problème de type** - Incompatibilité entre le type attendu et le type réel
3. **Erreur de chargement** - Le composant TagSelector ne charge pas correctement les tags

### Solutions

#### Solution 1 : Vérifier et réinsérer les tags

```bash
# Depuis le dossier du projet
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735

# Exécuter le script de diagnostic
supabase db query --file scripts/check-and-fix-tags.sql

# OU exécuter la nouvelle migration
supabase migration up
```

#### Solution 2 : Réinsertion manuelle des tags

Si les migrations ne fonctionnent pas, vous pouvez réinsérer manuellement :

```sql
INSERT INTO public.tags (name) VALUES
  ('Compétitif'),
  ('Décontracté'),
  ('Famille'),
  ('Expert'),
  ('Débutant'),
  ('Soirée'),
  ('Journée'),
  ('Tournoi'),
  ('Découverte'),
  ('Rapide'),
  ('Stratégie'),
  ('Ambiance'),
  ('Coopératif'),
  ('Party Game'),
  ('Narratif')
ON CONFLICT (name) DO NOTHING;
```

#### Solution 3 : Vérifier dans l'application mobile

1. **Ouvrir les DevTools de l'app mobile**
2. **Aller sur la page de création d'événement**
3. **Vérifier les logs console** pour voir si des erreurs apparaissent lors du chargement des tags

Chercher dans les logs :
```
🏷️ Tags chargés: [...]
Erreur lors du chargement des tags: ...
```

#### Solution 4 : Vérification directe dans Supabase

1. Ouvrir le dashboard Supabase
2. Aller dans **Table Editor**
3. Sélectionner la table `tags`
4. Vérifier que des tags existent

Si la table est vide :
- Exécuter la migration `20250111000003_ensure_tags_exist.sql`
- OU insérer manuellement les tags via le dashboard

### Commandes de vérification rapide

```bash
# Vérifier le nombre de tags
echo "SELECT COUNT(*) FROM tags;" | supabase db query

# Lister tous les tags
echo "SELECT id, name FROM tags ORDER BY id;" | supabase db query

# Vérifier le type de tags.id
echo "SELECT data_type FROM information_schema.columns WHERE table_name='tags' AND column_name='id';" | supabase db query
```

### Checklist de diagnostic

- [ ] La table `tags` existe dans la base de données
- [ ] Le type de `tags.id` est `integer` ou `serial`
- [ ] Des tags sont présents dans la table `tags`
- [ ] Le composant `TagSelector` se charge sans erreur
- [ ] Les logs montrent "🏷️ Tags chargés: [...]" avec des données
- [ ] La requête Supabase ne retourne pas d'erreur

### Si rien ne fonctionne

1. **Supprimer et recréer la table tags**

```sql
-- ATTENTION : Cela supprimera toutes les données liées !
DROP TABLE IF EXISTS public.event_tags CASCADE;
DROP TABLE IF EXISTS public.game_tags CASCADE;
DROP TABLE IF EXISTS public.user_tags CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;

-- Recréer la table
CREATE TABLE public.tags (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  color text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Réinsérer les tags
INSERT INTO public.tags (name) VALUES
  ('Compétitif'), ('Décontracté'), ('Famille'),
  ('Expert'), ('Débutant'), ('Soirée'),
  ('Journée'), ('Tournoi'), ('Découverte'),
  ('Rapide'), ('Stratégie'), ('Ambiance'),
  ('Coopératif'), ('Party Game'), ('Narratif');

-- Recréer les tables de liaison
CREATE TABLE public.event_tags (
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  tag_id int REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (event_id, tag_id)
);

CREATE TABLE public.game_tags (
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE,
  tag_id int REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (game_id, tag_id)
);
```

2. **Contacter le support** avec les informations suivantes :
   - Logs de la console
   - Résultat de `SELECT * FROM tags;`
   - Résultat de `SELECT data_type FROM information_schema.columns WHERE table_name='tags' AND column_name='id';`



