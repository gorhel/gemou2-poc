# ✅ Checklist Post-Migration event_games

**Date:** 15 novembre 2025  
**Migration:** Fix event_games UUID → TEXT

---

## 🎯 Étapes à Suivre

### 1. ✅ Vérifier la Structure de la Table (2 min)

#### Via Dashboard Supabase
1. Allez dans **Table Editor**
2. Sélectionnez la table `event_games`
3. Vérifiez que vous voyez ces colonnes :
   - `id` (uuid)
   - `event_id` (uuid)
   - `game_id` (text) ← **Doit être TEXT, pas UUID**
   - `game_name` (text)
   - `game_thumbnail` (text)
   - ... (19 colonnes au total)

#### Via SQL Editor
```sql
-- Vérifier le type de game_id
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'event_games'
ORDER BY ordinal_position;
```

**Résultat attendu pour game_id:**
```
column_name | data_type | is_nullable
game_id     | text      | YES
```

✅ Si `data_type = text` : **Parfait, continuez !**  
❌ Si `data_type = uuid` : La migration n'a pas fonctionné, réessayez

---

### 2. ✅ Vérifier les Politiques RLS (1 min)

```sql
-- Vérifier que les politiques RLS sont actives
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'event_games';
```

**Résultat attendu:**
```
rowsecurity | t (true)
```

```sql
-- Lister les politiques
u
```

**Politiques attendues:**
- `Event games are viewable by everyone` (SELECT)
- `Event organizers can add games` (INSERT)
- `Event organizers can update games` (UPDATE)
- `Event organizers can delete games` (DELETE)

---

### 3. 🔄 Redémarrer les Applications (1 min)

#### Application Web
```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/web
# Arrêter (Ctrl+C si déjà lancé)
# Relancer
npm run dev
```

#### Application Mobile
```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/mobile
# Arrêter (Ctrl+C si déjà lancé)
# Relancer
npm start
```

**Pourquoi ?** Pour s'assurer que les types TypeScript mis à jour sont chargés.

---

### 4. 🧪 Tests Fonctionnels - Application Web (5 min)

#### Test 1: Ajouter un Jeu BoardGameGeek
1. **Ouvrir** l'application web : http://localhost:3000
2. **Se connecter** (si pas déjà connecté)
3. **Créer un événement** ou éditer un événement existant
4. Dans la section **"Jeux"** :
   - Rechercher un jeu (ex: "Catan" ou "7 Wonders")
   - Attendre les résultats de recherche
   - Cliquer sur **"Ajouter"**

**✅ Résultat attendu:**
- Le jeu est ajouté à la liste sans erreur
- Aucune erreur dans la console (F12)
- Pas d'erreur "Invalid input syntax for type uuid"

**❌ Si erreur:**
- Vérifier que game_id est bien TEXT dans la DB
- Vérifier la console pour les détails de l'erreur
- Vérifier que les types TypeScript sont à jour (`packages/database/types.ts`)

#### Test 2: Ajouter un Jeu Personnalisé
1. Dans la création d'événement
2. Cliquer sur **"Ajouter un jeu personnalisé"**
3. Saisir un nom (ex: "Mon jeu maison")
4. Valider

**✅ Résultat attendu:**
- Le jeu personnalisé est ajouté
- Marqué comme "Personnalisé"
- `game_id` est NULL dans la base

#### Test 3: Configurer les Propriétés d'un Jeu
1. Sur un jeu ajouté
2. Modifier :
   - Niveau d'expérience (Débutant/Intermédiaire/Avancé/Expert)
   - Jeu optionnel (checkbox)
   - Durée estimée
   - Qui l'apporte

**✅ Résultat attendu:**
- Toutes les modifications sont sauvegardées
- Pas d'erreur

#### Test 4: Créer l'Événement Complet
1. Remplir tous les champs de l'événement
2. Ajouter 2-3 jeux
3. Cliquer sur **"Créer l'événement"**

**✅ Résultat attendu:**
- Événement créé avec succès
- Redirection vers la page de l'événement
- Les jeux apparaissent sur la page de l'événement

---

### 5. 🧪 Tests Fonctionnels - Application Mobile (5 min)

#### Test 1: Créer un Événement avec Jeux
1. **Ouvrir** l'app mobile (Expo)
2. **Se connecter**
3. **Aller sur l'onglet "Créer"** ou équivalent
4. Créer un événement
5. Ajouter des jeux (BGG et personnalisés)
6. Valider

**✅ Résultat attendu:**
- Même comportement que sur web
- Pas d'erreurs

#### Test 2: Voir un Événement avec Jeux
1. **Naviguer** vers un événement existant
2. Vérifier que les jeux s'affichent correctement

**✅ Résultat attendu:**
- Les jeux de l'événement sont visibles
- Les détails sont corrects

---

### 6. 🔍 Vérifier les Données dans la Base (2 min)

```sql
-- Voir quelques jeux ajoutés
SELECT 
  id,
  event_id,
  game_id,        -- Doit être TEXT ou NULL
  game_name,
  is_custom,
  created_at
FROM event_games
ORDER BY created_at DESC
LIMIT 10;
```

**Exemples de résultats corrects:**
```
game_id  | game_name           | is_custom
---------|---------------------|----------
68448    | 7 Wonders           | false     ← ID BGG (TEXT)
174430   | Gloomhaven          | false     ← ID BGG (TEXT)
NULL     | Mon jeu maison      | true      ← Jeu personnalisé
13       | Catan               | false     ← ID BGG (TEXT)
```

**✅ Bon signe:** `game_id` contient des nombres comme strings ou NULL

**❌ Problème:** Si vous voyez des UUIDs dans game_id, la migration n'a pas fonctionné

---

### 7. 🐛 Tests d'Erreurs (2 min)

#### Test 1: Jeu en Double
1. Essayer d'ajouter le **même jeu deux fois** au même événement

**✅ Résultat attendu:**
- Erreur de contrainte unique (c'est normal)
- Message d'erreur clair à l'utilisateur

#### Test 2: Événement Sans Jeux
1. Créer un événement **sans jeux**

**✅ Résultat attendu:**
- Événement créé normalement
- Aucune erreur

---

### 8. 📊 Tests de Performance (Optionnel, 3 min)

#### Test 1: Recherche de Jeux
```sql
-- La recherche par game_id doit être rapide (index existe)
EXPLAIN ANALYZE
SELECT * FROM event_games 
WHERE game_id = '68448';
```

**✅ Résultat attendu:**
- Utilise l'index `idx_event_games_game_id`
- Temps < 1ms pour petites tables

#### Test 2: Jointure avec Events
```sql
EXPLAIN ANALYZE
SELECT e.title, eg.game_name
FROM events e
JOIN event_games eg ON eg.event_id = e.id
WHERE e.id = 'votre-event-id';
```

**✅ Résultat attendu:**
- Utilise l'index `idx_event_games_event_id`
- Temps < 10ms

---

## 🎉 Validation Finale

### Checklist Complète

- [ ] Structure de table vérifiée (`game_id` = TEXT)
- [ ] Politiques RLS actives
- [ ] Applications redémarrées
- [ ] Test web - Jeu BGG ajouté
- [ ] Test web - Jeu personnalisé ajouté
- [ ] Test web - Propriétés modifiées
- [ ] Test web - Événement créé
- [ ] Test mobile - Événement créé avec jeux
- [ ] Test mobile - Événement consulté
- [ ] Données vérifiées dans la DB
- [ ] Tests d'erreurs passés
- [ ] (Optionnel) Tests de performance OK

---

## 🐛 En Cas de Problème

### Problème 1: Erreur UUID Persiste

**Symptôme:** Toujours l'erreur "Invalid input syntax for type uuid"

**Solutions:**
```sql
-- 1. Vérifier le vrai type de game_id
\d event_games

-- 2. Si encore UUID, forcer la migration
DROP TABLE IF EXISTS public.event_games CASCADE;
-- Puis réexécuter le script de migration complet
```

### Problème 2: Données Perdues

**Symptôme:** Les jeux précédemment ajoutés ont disparu

**Explication:** C'est normal, la migration utilise `DROP TABLE`. Les anciennes données sont perdues.

**Solution:** Recréer les associations jeux-événements via l'interface.

### Problème 3: Erreur de Types TypeScript

**Symptôme:** Erreurs TypeScript dans l'IDE

**Solutions:**
```bash
# 1. Vérifier que les types sont à jour
cat packages/database/types.ts | grep -A 20 "event_games:"

# 2. Redémarrer le serveur TypeScript (VSCode)
# Cmd+Shift+P > "TypeScript: Restart TS Server"

# 3. Rebuild
cd apps/web && npm run build
cd apps/mobile && npm run type-check
```

### Problème 4: RLS Bloque les Requêtes

**Symptôme:** Impossible d'ajouter/voir des jeux

**Solution:**
```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'event_games';

-- Si manquantes, les recréer (voir migration SQL)
```

---

## 📞 Support & Logs

### Logs Utiles

#### Web (Console Navigateur)
```javascript
// Ouvrir la console (F12)
// Chercher des erreurs rouges
// Screenshot si problème
```

#### Mobile (Terminal)
```bash
# Les logs Expo montrent les erreurs
# Chercher "[ERROR]" ou "Invalid input"
```

#### Supabase (Logs)
```
Dashboard > Logs > API Logs
Filtrer par: event_games
Chercher les erreurs 400/500
```

---

## 🎯 Prochaines Étapes Recommandées

### 1. Synchroniser la Migration Localement (Optionnel)
```bash
# Marquer la migration comme appliquée localement
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735
npx supabase migration repair --status applied 20251115000001
```

### 2. Commit les Changements
```bash
git add .
git commit -m "fix(database): Correction game_id UUID → TEXT pour event_games

- Migration SQL pour recréer event_games avec game_id TEXT
- Mise à jour types TypeScript complets
- Documentation complète du changement
- Résout l'erreur 'Invalid input syntax for type uuid: 68448'"
```

### 3. Documenter dans l'Équipe
- Partager `QUICK_FIX_EVENT_GAMES.md` avec l'équipe
- Expliquer pourquoi TEXT est le bon choix
- Documenter les tests effectués

---

## 📚 Documentation Créée

Référez-vous à ces fichiers pour plus de détails :

1. **QUICK_FIX_EVENT_GAMES.md** - Guide rapide
2. **informations/2025-11-15_CORRECTION_EVENT_GAMES_UUID_ERROR.md** - Doc complète
3. **informations/2025-11-15_ANALYSE_IMPACTS_EVENT_GAMES.md** - Analyse impacts
4. **informations/2025-11-15_POURQUOI_TEXT_AU_LIEU_UUID.md** - Justification technique
5. **informations/2025-11-15_RESUME_CORRECTIONS.md** - Résumé des corrections
6. **APRES_MIGRATION_CHECKLIST.md** - Ce fichier

---

**🎉 Félicitations ! Si tous les tests passent, votre problème est résolu !**



