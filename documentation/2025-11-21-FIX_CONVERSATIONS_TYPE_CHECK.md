# Correction de la contrainte conversations_type_check

**Date**: 2025-01-28  
**Problème**: Impossible de créer des conversations marketplace  
**Erreur**: `new row for relation "conversations" violates check constraint "conversations_type_check"`

## 🔍 Problème identifié

Lors de la création d'une conversation marketplace via la fonction RPC `create_marketplace_conversation`, une erreur de contrainte CHECK se produisait :

```
Error creating conversation: {
  code: '23514', 
  details: 'Failing row contains (...)', 
  message: 'new row for relation "conversations" violates check constraint "conversations_type_check"'
}
```

### Cause racine

La fonction `create_marketplace_conversation` (définie dans `20251009120000_add_marketplace_trade_features.sql`) insère des conversations avec le type `'marketplace'` :

```sql
INSERT INTO conversations (type, marketplace_item_id, created_by)
VALUES ('marketplace', p_marketplace_item_id, p_buyer_id)
```

Cependant, la contrainte CHECK sur la table `conversations` n'autorisait que les types suivants :
- `'direct'`
- `'group'`
- `'event'`

Le type `'marketplace'` n'était pas inclus dans la contrainte, ce qui provoquait l'erreur lors de l'insertion.

## ✅ Solution

### Migration créée

**Fichier**: `supabase/migrations/20250128000000_fix_conversations_type_check.sql`

Cette migration :
1. Supprime l'ancienne contrainte CHECK (quel que soit son nom)
2. Recrée la contrainte en incluant le type `'marketplace'`

### Script SQL standalone

**Fichier**: `FIX_CONVERSATIONS_TYPE_CHECK.sql`

Script à exécuter directement dans Supabase SQL Editor si la migration n'a pas été appliquée automatiquement.

## 🚀 Application de la correction

### Option 1: Via la migration (recommandé)

Si vous utilisez Supabase CLI ou un système de migration automatique, la migration sera appliquée automatiquement lors du prochain déploiement.

### Option 2: Via le script SQL standalone

1. Ouvrir le Supabase Dashboard
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `FIX_CONVERSATIONS_TYPE_CHECK.sql`
4. Exécuter le script

## ✅ Vérification

Après avoir appliqué la correction, vérifiez que :

1. **La contrainte est correcte** :
```sql
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'conversations' 
  AND constraint_name LIKE '%type%';
```

Résultat attendu : `type IN ('direct', 'group', 'event', 'marketplace')`

2. **La création de conversation marketplace fonctionne** :
   - Tester depuis l'application mobile : cliquer sur "Contacter le vendeur" sur une annonce
   - Vérifier qu'aucune erreur de contrainte n'apparaît
   - Vérifier que la conversation est créée avec succès

## 📋 Types de conversations supportés

Après cette correction, les types suivants sont autorisés :

| Type | Description | Utilisation |
|------|-------------|-------------|
| `direct` | Conversation privée entre deux utilisateurs | Messages directs |
| `group` | Conversation de groupe | Groupes de discussion |
| `event` | Conversation liée à un événement | Discussions d'événements |
| `marketplace` | Conversation liée à une annonce marketplace | Contact vendeur/acheteur |

## 🔗 Fichiers modifiés

- ✅ `supabase/migrations/20250128000000_fix_conversations_type_check.sql` (nouveau)
- ✅ `FIX_CONVERSATIONS_TYPE_CHECK.sql` (nouveau)
- ✅ `documentation/2025-01-28-FIX_CONVERSATIONS_TYPE_CHECK.md` (ce fichier)

## 📝 Notes techniques

- La migration utilise un bloc `DO $$` pour supprimer dynamiquement toutes les contraintes CHECK existantes sur la colonne `type`, quel que soit leur nom
- La nouvelle contrainte est nommée explicitement `conversations_type_check` pour faciliter la maintenance
- Cette correction est rétrocompatible : les conversations existantes ne sont pas affectées

## 🐛 Dépannage

### Si l'erreur persiste après application

1. Vérifier que la migration a bien été exécutée :
```sql
SELECT * FROM supabase_migrations.schema_migrations 
WHERE name = '20250128000000_fix_conversations_type_check';
```

2. Vérifier manuellement la contrainte :
```sql
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'conversations'::regclass
  AND contype = 'c'
  AND conname LIKE '%type%';
```

3. Si la contrainte n'est pas correcte, exécuter manuellement le script `FIX_CONVERSATIONS_TYPE_CHECK.sql`

### Si d'autres erreurs apparaissent

- Vérifier les politiques RLS : voir `FIX_CONVERSATIONS_RLS.sql`
- Vérifier que la fonction `create_marketplace_conversation` existe et est correcte
- Vérifier les logs Supabase pour d'autres erreurs potentielles

## ✅ Checklist de validation

- [ ] Migration appliquée ou script SQL exécuté
- [ ] Contrainte vérifiée dans la base de données
- [ ] Test de création de conversation marketplace depuis mobile
- [ ] Aucune erreur dans les logs
- [ ] Conversation créée avec succès
- [ ] Redirection vers la page de conversation fonctionne

