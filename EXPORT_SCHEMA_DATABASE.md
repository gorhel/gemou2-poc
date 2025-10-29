# 📊 Exporter le Schéma de la Base de Données

## 🎯 Pourquoi c'est important

Avoir le schéma de la base de données permet de :
- ✅ Comprendre rapidement la structure
- ✅ Éviter les erreurs de colonnes (comme `profile_id` vs `user_id`)
- ✅ Développer plus rapidement
- ✅ Documenter l'architecture

---

## ⚡ Méthode rapide (3 étapes)

### 1️⃣ Ouvrir Supabase SQL Editor

👉 https://app.supabase.com → Votre projet → **SQL Editor**

### 2️⃣ Exécuter un des deux scripts

#### Option A : Schéma lisible (RECOMMANDÉ)
```bash
cat get-database-schema-detailed.sql
```
Copier et exécuter dans SQL Editor.

**Résultat :** Affichage formaté dans les logs (onglet "Results")

#### Option B : Export SQL complet
```bash
cat get-database-schema.sql
```

**Résultat :** Liste complète de toutes les tables, colonnes, contraintes, etc.

### 3️⃣ Copier le résultat

1. Copier TOUT le texte des logs/résultats
2. Créer un fichier dans `documentation/` :
   ```bash
   # Exemple de nom
   documentation/2025-10-29_database-schema.md
   ```
3. Coller le contenu

---

## 📝 Exemple de structure attendue

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLE: events
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  id                          | uuid                      | NOT NULL DEFAULT uuid_generate_v4()
  title                       | text                      | NOT NULL
  description                 | text                      | NULL
  date_time                   | timestamptz               | NOT NULL
  location                    | text                      | NOT NULL
  max_participants            | integer                   | NULL
  current_participants        | integer                   | NULL DEFAULT 0
  creator_id                  | uuid                      | NULL
  status                      | text                      | NULL DEFAULT 'active'
  created_at                  | timestamptz               | NOT NULL DEFAULT now()
  updated_at                  | timestamptz               | NOT NULL DEFAULT now()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLE: event_participants
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  id                          | uuid                      | NOT NULL DEFAULT uuid_generate_v4()
  event_id                    | uuid                      | NULL
  user_id                     | uuid                      | NULL  ⚠️ user_id, PAS profile_id !
  status                      | text                      | NULL DEFAULT 'registered'
  joined_at                   | timestamptz               | NOT NULL DEFAULT now()
```

---

## 🔄 Méthode alternative : Via Supabase CLI

Si vous avez Supabase CLI installé :

```bash
# Se connecter au projet
supabase link --project-ref VOTRE_PROJECT_REF

# Exporter le schéma
supabase db dump --schema public > documentation/database-schema.sql

# Voir le résultat
cat documentation/database-schema.sql
```

**Avantage :** Export SQL complet, prêt à recréer la DB

---

## 📂 Où sauvegarder le schéma

### Structure recommandée :

```
documentation/
├── 2025-10-29_database-schema.md       ← Schéma formaté (lisible)
├── database-schema.sql                  ← Export SQL brut
└── database-erd.png                     ← Diagramme (optionnel)
```

### Mettre à jour régulièrement

- ✅ Après chaque nouvelle migration
- ✅ Après ajout/modification de tables
- ✅ Une fois par semaine minimum

---

## 🎨 Bonus : Créer un diagramme ERD

### Option 1 : Via Supabase Dashboard

1. Aller dans **Database** → **Database**
2. Cliquer sur l'onglet **Relationships**
3. Voir le diagramme généré automatiquement
4. Screenshot → Sauvegarder dans `documentation/`

### Option 2 : Via dbdiagram.io

1. Exporter le schéma avec `get-database-schema.sql`
2. Convertir en format DBML sur https://dbdiagram.io
3. Exporter le diagramme

### Option 3 : Via DBeaver / TablePlus

Si vous utilisez un client SQL graphique, il peut générer le ERD automatiquement.

---

## ✅ Checklist

Après avoir exporté le schéma :

- [ ] Vérifier que TOUTES les tables sont présentes
- [ ] Vérifier les colonnes critiques (`user_id` vs `profile_id`)
- [ ] Vérifier les contraintes FOREIGN KEY
- [ ] Vérifier les triggers actifs
- [ ] Vérifier les fonctions existantes
- [ ] Sauvegarder dans `documentation/`
- [ ] Committer dans Git

---

## 🆘 Problèmes courants

### "Permission denied"

**Solution :** Vous n'avez pas les droits. Demandez à un admin du projet Supabase.

### "Too many results"

**Solution :** Exécutez les scripts section par section au lieu de tout d'un coup.

### "Function does not exist"

**Solution :** Normal, certaines requêtes échouent si des objets n'existent pas. Continuez.

---

## 📚 Ce qu'on devrait voir dans le schéma

### Tables principales attendues :

- ✅ `profiles` (utilisateurs)
- ✅ `events` (événements)
- ✅ `event_participants` (participations)
- ✅ `games` (jeux)
- ✅ `user_games` (collection de jeux)
- ✅ `marketplace_items` (annonces)
- ✅ `messages` (conversations)

### Triggers attendus :

- ✅ `trigger_update_participants_count_insert`
- ✅ `trigger_update_participants_count_update`
- ✅ `trigger_update_participants_count_delete`

### Fonctions attendues :

- ✅ `update_event_participants_count()`
- ✅ `sync_all_event_participants_count()`
- ✅ `check_participants_consistency()`

---

## 💡 Prochaine étape

Une fois le schéma exporté et sauvegardé, **partagez-le moi** ! 

Je pourrai :
- ✅ Mieux comprendre votre structure
- ✅ Éviter les erreurs de colonnes
- ✅ Proposer des optimisations
- ✅ Générer du code plus précis

---

**Fichiers créés :**
- `get-database-schema.sql` - Export complet
- `get-database-schema-detailed.sql` - Format lisible avec logs

