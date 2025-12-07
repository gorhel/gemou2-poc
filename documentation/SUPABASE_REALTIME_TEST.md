# 🧪 Test de la Configuration Realtime

## ✅ Vérification que Realtime est activé

### Étape 1 : Vérifier dans SQL Editor

Exécutez cette requête dans SQL Editor pour confirmer :

```sql
SELECT 
  schemaname,
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Résultat attendu** : Vous devriez voir au moins la table `profiles` dans les résultats.

### Étape 2 : Activer Realtime pour les autres tables (optionnel mais recommandé)

Si vous voulez aussi écouter les changements sur d'autres tables, exécutez :

```sql
-- Activer Realtime pour events
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Activer Realtime pour friends
ALTER PUBLICATION supabase_realtime ADD TABLE friends;

-- Activer Realtime pour event_participants
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
```

Puis vérifiez à nouveau :

```sql
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

## 🧪 Test dans l'application

### Étape 1 : Démarrer l'application

```bash
cd apps/mobile
npm run dev
```

### Étape 2 : Ouvrir la page de profil

1. Connectez-vous à l'application
2. Allez sur la page de profil
3. Ouvrez la console/logs de votre application

### Étape 3 : Vérifier les logs

Vous devriez voir dans les logs :

```
[useRealtime] Abonné à profiles
```

Si vous voyez ce message, **Realtime est connecté !** ✅

### Étape 4 : Tester une mise à jour en temps réel

**Option A : Depuis Supabase Studio**

1. Allez dans `Database > Table Editor`
2. Sélectionnez la table `profiles`
3. Modifiez un champ (ex: `bio` ou `city`)
4. Sauvegardez

**Option B : Depuis une autre session de l'application**

1. Ouvrez l'application dans un autre onglet/appareil
2. Modifiez votre profil
3. Sauvegardez

### Étape 5 : Vérifier que l'événement est reçu

Dans les logs de votre première session, vous devriez voir :

```
[ProfilePage] Changement Realtime détecté: {
  eventType: 'UPDATE',
  new: { ... },
  old: { ... }
}
[ProfilePage] Mise à jour du profil détectée, rechargement...
```

Si vous voyez ces messages, **ça fonctionne parfaitement !** 🎉

## ❌ Si ça ne fonctionne pas

### Problème : Pas de message "[useRealtime] Abonné à profiles"

**Solutions** :
1. Vérifiez que vous êtes bien connecté (user?.id existe)
2. Vérifiez les logs d'erreur dans la console
3. Vérifiez que Realtime est bien activé avec la requête SQL ci-dessus

### Problème : Message d'erreur de connexion

**Solutions** :
1. Vérifiez votre connexion Internet
2. Vérifiez que WebSocket n'est pas bloqué
3. Vérifiez les politiques RLS de la table `profiles`

### Problème : Les événements ne sont pas reçus

**Solutions** :
1. Vérifiez que vous modifiez bien le profil de l'utilisateur connecté
2. Vérifiez que les modifications sont bien sauvegardées en base
3. Vérifiez les logs pour voir s'il y a des erreurs

## 📊 Checklist de test

- [ ] Realtime activé sur la table `profiles` (vérifié avec SQL)
- [ ] Application démarrée
- [ ] Page de profil ouverte
- [ ] Message "[useRealtime] Abonné à profiles" visible dans les logs
- [ ] Modification effectuée sur le profil
- [ ] Message "[ProfilePage] Changement Realtime détecté" visible dans les logs
- [ ] Le profil se met à jour automatiquement dans l'interface

## 🎯 Prochaines étapes

Une fois que Realtime fonctionne :

1. **Activer Realtime pour d'autres tables** si nécessaire
2. **Ajouter des notifications visuelles** lors des mises à jour
3. **Optimiser les abonnements** pour éviter les rechargements inutiles
4. **Implémenter Realtime pour les événements** (events, friends, etc.)



