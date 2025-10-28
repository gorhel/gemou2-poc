# ⚡ FIX RAPIDE - Erreur Contrainte CHECK

## ❌ Erreur Rencontrée

```
Error creating trade: {
  code: '23514',
  message: 'new row for relation "marketplace_items" violates check constraint "marketplace_items_condition_check"'
}
```

## 🔍 Cause

La contrainte `CHECK` sur la colonne `condition` rejette la valeur envoyée par le frontend.

**Problème** : Décalage entre les valeurs que le frontend envoie et celles que la base de données accepte.

---

## ✅ SOLUTION (30 secondes)

### Dans Supabase SQL Editor

1. **Ouvrez** : https://supabase.com/dashboard → Projet Gemou2
2. **Menu** : SQL Editor → New Query
3. **Copiez-collez** ce script :

```sql
-- Supprimer les anciennes contraintes
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_condition_check;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_condition_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_status_check;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_status_values;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_type_check;
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS check_type_values;

-- Créer les nouvelles contraintes avec TOUTES les valeurs possibles
ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_condition_check 
CHECK (condition IN ('new', 'like_new', 'excellent', 'good', 'fair', 'worn', 'poor'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_status_check 
CHECK (status IN ('draft', 'available', 'sold', 'exchanged', 'closed', 'reserved'));

ALTER TABLE marketplace_items 
ADD CONSTRAINT marketplace_items_type_check 
CHECK (type IN ('sale', 'exchange', 'donation'));

-- Message de confirmation
SELECT 'Contraintes CHECK mises à jour !' as message;
```

4. **Exécutez** (Run / Ctrl+Enter)

---

## ✅ Test Immédiat

1. **Retournez** sur `/create-trade`
2. **Rechargez** la page (F5)
3. **Remplissez** le formulaire
4. **Cliquez** "Publier"

**Résultat attendu** : ✅ Annonce créée sans erreur !

---

## 📋 Ce Qui a Été Corrigé

### Contrainte `condition`

**Avant** : Probablement seulement `('new', 'like_new', 'good', 'fair')`

**Après** : `('new', 'like_new', 'excellent', 'good', 'fair', 'worn', 'poor')`

### Contrainte `status`

**Après** : `('draft', 'available', 'sold', 'exchanged', 'closed', 'reserved')`

### Contrainte `type`

**Après** : `('sale', 'exchange', 'donation')`

---

## 🔍 Vérification

Pour vérifier les contraintes actives :

```sql
SELECT
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'marketplace_items'
AND con.contype = 'c'
ORDER BY con.conname;
```

**Résultat attendu** : 3 contraintes CHECK visibles

---

## 💡 Pourquoi Cette Erreur ?

Les contraintes CHECK de PostgreSQL rejettent les valeurs qui ne sont pas dans la liste autorisée.

**Exemple** :
- Frontend envoie : `condition: 'excellent'`
- BDD accepte seulement : `'new', 'like_new', 'good', 'fair'`
- Résultat : ❌ Erreur 23514

**Solution** : Ajouter toutes les valeurs possibles dans la contrainte.

---

## 🆘 Si le Problème Persiste

### 1. Vérifiez quelle valeur est envoyée

Dans le code, ajoutez temporairement :

**Fichier** : `apps/web/app/create-trade/page.tsx`

**Ligne 118**, avant l'insertion :

```typescript
console.log('FormData being sent:', formData);
```

Puis testez et regardez la console.

### 2. Vérifiez les contraintes actuelles

```sql
SELECT
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'marketplace_items'
AND con.conname = 'marketplace_items_condition_check';
```

### 3. Testez manuellement

```sql
-- Remplacez YOUR_USER_ID par votre ID
INSERT INTO marketplace_items (
  seller_id,
  title,
  type,
  condition,
  status
) VALUES (
  'YOUR_USER_ID',
  'Test',
  'sale',
  'good',  -- ← Testez différentes valeurs
  'available'
);
```

Si l'insertion échoue, la valeur n'est pas acceptée.

---

## 📝 Notes

### Valeurs Recommandées par Type

**condition** (État du jeu) :
- `new` : Neuf
- `like_new` : Comme neuf
- `excellent` : Excellent état
- `good` : Bon état
- `fair` : État correct
- `worn` : Usé
- `poor` : Mauvais état

**status** (Statut de l'annonce) :
- `draft` : Brouillon
- `available` : Disponible
- `sold` : Vendu
- `exchanged` : Échangé
- `closed` : Fermée
- `reserved` : Réservé

**type** (Type de transaction) :
- `sale` : Vente
- `exchange` : Échange
- `donation` : Don

---

**Temps total** : 30 secondes ⏱️

**Après ce fix, la création d'annonces fonctionnera ! ✅**


