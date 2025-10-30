# 🔧 FIX: Base de données non mise à jour

## ⚡ Solution rapide (2 étapes) - UTILISEZ CELUI-CI !

### 1️⃣ Ouvrir Supabase SQL Editor

👉 https://app.supabase.com → Votre projet → **SQL Editor**

### 2️⃣ Copier et exécuter ce script

```bash
# Ouvrir le fichier de correction rapide
cat fix-participants-NOW.sql
```

**Copier TOUT le contenu** et le coller dans SQL Editor, puis cliquer sur **Run**.

Ce script :
- ✅ Supprime tous les anciens triggers/fonctions
- ✅ Crée les nouveaux triggers
- ✅ Corrige tous les compteurs existants
- ✅ Vérifie automatiquement le résultat

### 3️⃣ Vérifier que ça fonctionne

```sql
-- Exécuter dans SQL Editor
SELECT * FROM check_participants_consistency();
```

✅ Si tous les événements ont `is_consistent = true` → **C'EST RÉGLÉ !**

---

## 📚 Documentation complète

Consultez le guide détaillé :
```
documentation/2025-10-29_fix-database-triggers.md
```

---

## 🆘 Besoin d'aide ?

### Problème: Les triggers ne s'installent pas

**Solution :** Exécutez le script de correction manuelle :
```sql
-- Copier le contenu de fix-participants-manual.sql
-- Et l'exécuter dans SQL Editor
```

### Problème: Des incohérences persistent

**Solution :** Resynchronisez manuellement :
```sql
SELECT * FROM sync_all_event_participants_count();
```

---

## 📂 Fichiers utiles

| Fichier | Usage |
|---------|-------|
| `supabase/migrations/20251029000001_force_fix_participants_triggers.sql` | Migration complète ✅ |
| `check-participants-db.sql` | Diagnostic 🔍 |
| `fix-participants-manual.sql` | Correction manuelle 🛠️ |
| `documentation/2025-10-29_fix-database-triggers.md` | Guide détaillé 📖 |

