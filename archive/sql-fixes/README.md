# Archive des scripts SQL de correction

Ce dossier contient les scripts SQL temporaires qui ont été utilisés pour corriger les problèmes de conversations marketplace.

## Date d'archivage : 2025-11-21

## Fichiers archivés

Ces fichiers ont été consolidés dans la migration :
`supabase/migrations/20251121000000_fix_conversations_marketplace_complete.sql`

### Fichiers

1. **FIX_CONVERSATIONS_TYPE_CHECK.sql**
   - Ajoute le type 'marketplace' à la contrainte CHECK
   - Consolidé dans la migration : Étape 1

2. **FIX_CONVERSATIONS_INSERT_RLS.sql**
   - Corrige la politique RLS INSERT pour permettre les fonctions SECURITY DEFINER
   - Consolidé dans la migration : Étape 2

3. **FIX_CONVERSATION_MEMBERS_INSERT_RLS.sql**
   - Corrige la politique RLS INSERT pour conversation_members
   - Consolidé dans la migration : Étape 3

4. **FIX_MARKETPLACE_ITEMS_RLS_FOR_CONVERSATIONS.sql**
   - Ajoute la politique RLS SELECT pour marketplace_items
   - Consolidé dans la migration : Étape 4

## Note

Ces fichiers sont conservés à des fins de référence historique uniquement.
Pour appliquer les corrections, utilisez la migration consolidée mentionnée ci-dessus.

