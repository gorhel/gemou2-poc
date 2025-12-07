# Guide de résolution : Décalage entre base de données locale et en ligne

**Date** : 21 novembre 2025  
**Problème** : Décalage entre les migrations locales et l'état de la base de données en ligne

---

## 🎯 Objectif

Identifier et résoudre les différences entre :
- Les migrations SQL dans le projet local
- L'état actuel de la base de données Supabase en ligne

---

## 📋 Étapes de diagnostic

### Étape 1 : Exécuter le script de diagnostic

1. Connectez-vous à votre base de données Supabase en ligne
2. Ouvrez l'éditeur SQL dans le dashboard Supabase
3. Exécutez le script : `documentation/2025-11-21-DIAGNOSTIC_RLS_CONVERSATIONS.sql`

Ce script va vérifier :
- ✅ La contrainte CHECK sur `conversations.type` (doit inclure 'marketplace')
- ✅ La politique RLS INSERT sur `conversations` (doit permettre SECURITY DEFINER)
- ✅ La politique RLS INSERT sur `conversation_members` (doit permettre SECURITY DEFINER)
- ✅ La politique RLS SELECT sur `marketplace_items` (doit permettre aux membres de conversations de voir les annonces)
- ✅ L'existence et la configuration de la fonction RPC `create_marketplace_conversation`

### Étape 2 : Analyser les résultats

Le script affichera un résumé avec :
- ✅ **OK** : La configuration est correcte
- ❌ **PROBLÈME** : La configuration est incorrecte et doit être corrigée
- ⚠️ **À vérifier** : Nécessite une vérification manuelle

### Étape 3 : Consulter la comparaison des migrations

Lisez le document : `documentation/2025-11-21-COMPARAISON_MIGRATIONS_CONVERSATIONS.md`

Ce document explique :
- La chronologie des migrations
- Les conflits entre migrations
- Les régressions identifiées

---

## 🔧 Solutions selon les cas

### Cas 1 : La migration `20251116000000` n'a PAS été appliquée en ligne

**Solution** : Supprimer cette migration problématique et appliquer la migration consolidée

```bash
# 1. Supprimer ou renommer la migration problématique
cd supabase/migrations
mv 20251116000000_fix_conversation_rls.sql 20251116000000_fix_conversation_rls.sql.backup

# 2. Appliquer la migration consolidée
supabase db push
```

### Cas 2 : La migration `20251116000000` a DÉJÀ été appliquée en ligne

**Solution** : Appliquer la migration consolidée qui corrigera les problèmes

```bash
# Appliquer la migration consolidée (elle corrigera les politiques existantes)
supabase db push
```

La migration `20251121000000_fix_conversations_marketplace_complete.sql` utilise `DROP POLICY IF EXISTS` et `CREATE POLICY`, donc elle remplacera les politiques incorrectes.

### Cas 3 : Les migrations de janvier 2025 n'ont PAS été appliquées

**Solution** : Appliquer toutes les migrations manquantes

```bash
# Vérifier l'état des migrations
supabase migration list

# Appliquer toutes les migrations
supabase db push
```

---

## 📊 Tableau de décision

| État de la BDD en ligne | Action requise |
|-------------------------|----------------|
| Migration `20251116000000` non appliquée | Supprimer cette migration, appliquer `20251121000000` |
| Migration `20251116000000` appliquée | Appliquer `20251121000000` (corrigera les politiques) |
| Migrations de janvier 2025 non appliquées | Appliquer toutes les migrations manquantes |
| Toutes les migrations appliquées mais problèmes détectés | Appliquer `20251121000000` pour corriger |

---

## ✅ Vérification après correction

Après avoir appliqué les corrections, réexécutez le script de diagnostic pour vérifier que tout est correct :

```sql
-- Exécuter à nouveau le script de diagnostic
-- Tous les statuts doivent être "✅ OK"
```

---

## 🚨 Problèmes connus identifiés

### Problème 1 : Régression dans `20251116000000`

**Description** : Cette migration a écrasé la correction de janvier 2025 qui permettait SECURITY DEFINER.

**Impact** : Les conversations marketplace ne peuvent pas être créées.

**Solution** : Appliquer `20251121000000_fix_conversations_marketplace_complete.sql`

### Problème 2 : Conflits entre migrations

**Description** : Plusieurs migrations modifient les mêmes politiques RLS.

**Impact** : L'ordre d'application des migrations détermine l'état final de la base de données.

**Solution** : Utiliser la migration consolidée qui regroupe toutes les corrections.

---

## 📝 Checklist de résolution

- [ ] Exécuter le script de diagnostic sur la base de données en ligne
- [ ] Identifier les problèmes détectés
- [ ] Consulter la comparaison des migrations
- [ ] Déterminer quelles migrations ont été appliquées en ligne
- [ ] Appliquer la solution appropriée selon le cas
- [ ] Réexécuter le script de diagnostic pour vérifier
- [ ] Tester la création d'une conversation marketplace

---

## 🔗 Fichiers de référence

1. **Script de diagnostic** : `documentation/2025-11-21-DIAGNOSTIC_RLS_CONVERSATIONS.sql`
2. **Comparaison des migrations** : `documentation/2025-11-21-COMPARAISON_MIGRATIONS_CONVERSATIONS.md`
3. **Migration consolidée** : `supabase/migrations/20251121000000_fix_conversations_marketplace_complete.sql`
4. **Documentation de résolution** : `documentation/2025-11-21-RESOLUTION_CONVERSATIONS_MARKETPLACE.md`

---

## 💡 Bonnes pratiques pour éviter ce problème à l'avenir

1. **Vérifier avant de créer une migration** : Chercher les migrations existantes qui modifient les mêmes objets
2. **Documenter les dépendances** : Indiquer clairement quelles migrations sont remplacées
3. **Utiliser des migrations consolidées** : Regrouper les corrections liées dans une seule migration
4. **Tester en local** : Toujours tester les migrations en local avant de les pousser en production
5. **Versionner les migrations** : Utiliser des timestamps cohérents pour l'ordre d'application

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs Supabase pour les erreurs de migration
2. Consultez le script de diagnostic pour identifier les problèmes spécifiques
3. Vérifiez que toutes les migrations nécessaires ont été appliquées dans le bon ordre


