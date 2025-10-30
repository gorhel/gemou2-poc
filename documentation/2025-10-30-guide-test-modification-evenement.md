# Guide de Test : Modification d'Événement

**Date** : 30 octobre 2025  
**Objectif** : Vérifier que les modifications d'événements sont bien enregistrées en base de données

## 🎯 Scénario de Test

### Étape 1 : Créer un Événement de Test

1. Connectez-vous à l'application mobile
2. Allez dans l'onglet "Créer"
3. Créez un événement avec ces informations :
   ```
   Titre: Test Modification
   Description: Ceci est un test
   Date: [Date future de votre choix]
   Lieu: Paris
   Max participants: 6
   ```
4. **Notez l'ID de l'événement** créé (visible dans l'URL ou les détails)

### Étape 2 : Vérifier l'État Initial dans la Base

Dans Supabase Studio (ou via SQL) :

```sql
SELECT 
  id,
  title,
  description,
  location,
  max_participants,
  updated_at,
  created_at
FROM events
WHERE title = 'Test Modification'
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu** :
- Titre = "Test Modification"
- Description = "Ceci est un test"
- Lieu = "Paris"
- Max participants = 6
- `updated_at` ≈ `created_at` (événement vient d'être créé)

### Étape 3 : Modifier l'Événement via l'App

1. Allez dans les détails de l'événement créé
2. En tant que créateur, vous devriez voir le bouton **"Modifier le Gémou"**
3. Cliquez dessus
4. **Modifiez les champs suivants** :
   ```
   Titre: Test Modification ÉDITÉ
   Description: La description a été modifiée
   Lieu: Lyon
   Max participants: 8
   ```
5. Cliquez sur **"Enregistrer les modifications"**
6. Vérifiez que le message "Succès ! Votre événement a été modifié" s'affiche
7. Vous devriez être redirigé vers la page de détails

### Étape 4 : Vérifier que l'UI Affiche les Modifications

Sur la page de détails de l'événement :

✅ **À vérifier** :
- [ ] Le titre affiché est "Test Modification ÉDITÉ"
- [ ] La description est "La description a été modifiée"
- [ ] Le lieu est "Lyon"
- [ ] Le nombre max de participants est 8/8 (ou X/8)

### Étape 5 : Vérifier la Base de Données

Réexécutez la même requête SQL :

```sql
SELECT 
  id,
  title,
  description,
  location,
  max_participants,
  updated_at,
  created_at
FROM events
WHERE title LIKE '%Test Modification%'
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu** :
- ✅ Titre = "Test Modification ÉDITÉ"
- ✅ Description = "La description a été modifiée"
- ✅ Lieu = "Lyon"
- ✅ Max participants = 8
- ✅ `updated_at` > `created_at` (preuve de la modification)

### Étape 6 : Tests de Sécurité (Optionnel mais Recommandé)

#### Test 6.1 : Utilisateur Non-Créateur

1. Connectez-vous avec un **autre utilisateur**
2. Allez sur l'événement créé précédemment
3. **Résultat attendu** : Vous ne devriez PAS voir le bouton "Modifier le Gémou"
4. Vous devriez voir "Participer" ou "Quitter le gémou" selon votre statut

#### Test 6.2 : Tentative de Modification par URL (Sécurité Avancée)

Si quelqu'un essaie de forcer l'accès à la page d'édition :

```
/(tabs)/create-event?eventId=ID_DE_L_EVENEMENT
```

**Résultat attendu** :
- Si l'utilisateur n'est PAS le créateur → Message d'erreur "Vous n'êtes pas autorisé"
- Redirection automatique

## 🔍 Vérifications Techniques Approfondies

### Requête pour Voir l'Historique des Modifications

```sql
SELECT 
  id,
  title,
  updated_at,
  created_at,
  updated_at - created_at AS temps_depuis_creation,
  CASE 
    WHEN updated_at > created_at + INTERVAL '1 second' THEN '✅ Modifié'
    ELSE '❌ Jamais modifié'
  END as a_ete_modifie
FROM events
WHERE id = 'VOTRE_EVENT_ID'
ORDER BY updated_at DESC;
```

### Vérifier que Seuls les Bons Champs Sont Modifiés

```sql
-- Les champs qui NE doivent PAS changer lors d'une modification :
SELECT 
  id,              -- Ne change jamais
  creator_id,      -- Ne doit pas changer
  created_at,      -- Ne doit pas changer
  current_participants, -- Ne change pas lors de l'édition (seulement lors d'inscriptions)
  status           -- Ne change pas lors de l'édition basique
FROM events
WHERE id = 'VOTRE_EVENT_ID';
```

## ✅ Checklist de Validation

### Fonctionnement de Base
- [ ] L'événement est bien créé
- [ ] Le bouton "Modifier le Gémou" apparaît pour le créateur
- [ ] Le formulaire se charge avec les bonnes données
- [ ] Les modifications sont sauvegardées
- [ ] L'UI affiche les modifications immédiatement
- [ ] La base de données contient les nouvelles valeurs

### Sécurité
- [ ] Seul le créateur peut modifier
- [ ] Les non-créateurs voient "Participer" ou "Quitter"
- [ ] Tentative de modification par un non-créateur → refusée
- [ ] Le `creator_id` ne change pas après modification
- [ ] Le `created_at` ne change pas après modification

### Cohérence des Données
- [ ] `updated_at` est postérieur à `created_at` après modification
- [ ] Tous les champs modifiés sont bien mis à jour
- [ ] Les champs non modifiés restent inchangés
- [ ] Pas de perte de données lors de la modification

## 🐛 Problèmes Potentiels et Solutions

### Problème 1 : Les modifications ne s'affichent pas

**Symptôme** : Vous sauvegardez mais l'ancien contenu reste affiché

**Causes possibles** :
1. Cache navigateur/app
2. La fonction `loadEvent()` n'est pas appelée après modification

**Solution** :
- Vérifiez que le code redirige bien vers la page de détails après sauvegarde
- Rafraîchissez manuellement la page (pull-to-refresh)

### Problème 2 : Message d'erreur lors de la sauvegarde

**Symptôme** : Alert "Erreur" lors du clic sur "Enregistrer"

**Causes possibles** :
1. Problème de connexion réseau
2. Problème de permissions Supabase (RLS)
3. Champs invalides

**Solution** :
```sql
-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'events';

-- S'assurer que la politique UPDATE autorise le créateur
```

### Problème 3 : Modification réussie mais compteur incorrect

**Symptôme** : Le nombre de participants est erroné après modification

**Explication** : Normal ! Le compteur `current_participants` ne doit PAS être modifié lors de l'édition de l'événement. Il ne change que lors des inscriptions/désinscriptions.

## 📊 Logs de Debug (Si Nécessaire)

Si vous rencontrez des problèmes, ajoutez des logs temporaires :

```typescript
// Dans handleSubmit(), après le UPDATE
console.log('✅ UPDATE réussi pour eventId:', eventId)
console.log('📝 Données mises à jour:', formData)

// Dans loadEventData()
console.log('📥 Données chargées:', event)
```

## 🎉 Validation Finale

Si tous les tests passent :
- ✅ La base de données est bien mise à jour
- ✅ Les modifications sont visibles immédiatement
- ✅ La sécurité fonctionne correctement
- ✅ Aucune perte de données

**Votre fonctionnalité de modification d'événement fonctionne parfaitement !** 🚀

---

## 📞 Support

En cas de problème persistant :
1. Vérifiez les logs de la console (développeur)
2. Consultez les logs Supabase
3. Vérifiez les politiques RLS (Row Level Security)


