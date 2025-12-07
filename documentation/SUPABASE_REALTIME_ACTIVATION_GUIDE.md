# 🔴 Guide d'Activation Realtime - Instructions Détaillées

## 🎯 Objectif

Activer Supabase Realtime pour recevoir des mises à jour en temps réel dans votre application.

## 📍 Où trouver Realtime dans Supabase ?

### Méthode 1 : Via Database > Replication (RECOMMANDÉ)

1. **Connectez-vous** à [supabase.com](https://supabase.com)
2. **Sélectionnez** votre projet
3. **Menu latéral gauche** → Cliquez sur **`Database`**
4. **Dans le sous-menu Database**, cliquez sur **`Replication`**

   ```
   Dashboard
   ├── Table Editor
   ├── Replication  ← ICI !
   ├── Migrations
   └── ...
   ```

5. **Vous verrez** une liste de toutes vos tables avec des toggles à côté
6. **Activez le toggle** pour chaque table que vous voulez écouter

### Méthode 2 : Via l'éditeur de table

1. **Menu latéral** → `Database` → `Table Editor`
2. **Cliquez sur une table** (ex: `profiles`)
3. **Cherchez** un onglet ou un bouton "Realtime" en haut de la page
4. **Activez** le toggle "Enable Realtime"

### Méthode 3 : Via SQL (si l'interface ne fonctionne pas)

Si vous ne trouvez pas l'option dans l'interface, vous pouvez activer Realtime via SQL :

1. **Allez dans** `SQL Editor` dans le menu latéral
2. **Exécutez** cette requête pour activer Realtime sur la table `profiles` :

```sql
-- Activer Realtime pour la table profiles
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Activer Realtime pour la table events
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Activer Realtime pour la table friends
ALTER PUBLICATION supabase_realtime ADD TABLE friends;

-- Activer Realtime pour la table event_participants
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
```

3. **Vérifiez** que les tables sont bien ajoutées :

```sql
-- Vérifier les tables avec Realtime activé
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

## 🔍 Si vous ne voyez toujours pas l'option

### Vérifications à faire :

1. **Vérifiez votre plan Supabase** :
   - Realtime est disponible sur tous les plans (Free, Pro, Team)
   - Si vous êtes sur un plan très ancien, contactez le support

2. **Vérifiez les permissions** :
   - Assurez-vous d'être connecté en tant qu'**owner** ou **admin** du projet
   - Les utilisateurs avec des permissions limitées ne peuvent pas activer Realtime

3. **Essayez un autre navigateur** :
   - Parfois l'interface peut avoir des problèmes de cache
   - Essayez en navigation privée ou un autre navigateur

4. **Vérifiez la version de l'interface** :
   - L'interface Supabase est régulièrement mise à jour
   - Essayez de rafraîchir la page (Ctrl+F5 ou Cmd+Shift+R)

## ✅ Checklist d'activation

- [ ] J'ai trouvé la section `Database > Replication`
- [ ] J'ai activé Realtime pour la table `profiles`
- [ ] J'ai activé Realtime pour la table `events` (si nécessaire)
- [ ] J'ai activé Realtime pour la table `friends` (si nécessaire)
- [ ] J'ai testé la connexion dans l'application

## 🧪 Tester que Realtime fonctionne

Une fois activé, testez dans votre application :

1. **Ouvrez** votre application mobile
2. **Allez sur** la page de profil
3. **Ouvrez la console** (logs React Native)
4. **Vous devriez voir** :
   ```
   [useRealtime] Abonné à profiles
   ```

5. **Modifiez le profil** depuis Supabase Studio ou une autre session
6. **Vous devriez voir** dans les logs :
   ```
   [ProfilePage] Changement Realtime détecté: { eventType: 'UPDATE', ... }
   ```

## 🆘 Besoin d'aide ?

Si vous ne trouvez toujours pas l'option :

1. **Prenez une capture d'écran** de votre interface Supabase
2. **Vérifiez** que vous êtes bien sur le bon projet
3. **Contactez le support Supabase** ou utilisez la méthode SQL ci-dessus

## 📸 À quoi ressemble l'interface ?

L'interface Replication devrait ressembler à ceci :

```
┌─────────────────────────────────────┐
│  Database > Replication            │
├─────────────────────────────────────┤
│                                     │
│  Table Name          │ Realtime    │
│  ─────────────────────────────────  │
│  profiles            │ [●] ON      │
│  events              │ [○] OFF    │
│  friends             │ [○] OFF    │
│  event_participants  │ [○] OFF    │
│                                     │
└─────────────────────────────────────┘
```

Les toggles peuvent être des switches, des boutons, ou des cases à cocher selon la version de l'interface.


