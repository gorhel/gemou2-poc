# 🚨 FIX URGENT - Marketplace

## 🐛 Problèmes

1. ❌ **Erreur** : "Could not find the 'user_id' column"
2. ❌ **Upload d'images** non visible

---

## ⚡ SOLUTION RAPIDE (5 minutes)

### Étape 1 : Corriger seller_id (2 min) 🔴 PRIORITÉ

1. **Allez sur** : https://supabase.com/dashboard
2. **Sélectionnez** votre projet **Gemou2**
3. **Menu** → **SQL Editor**
4. **New Query**
5. **Copiez-collez** TOUT le contenu du fichier :
   ```
   FIX_SELLER_ID.sql
   ```
6. **Exécutez** (bouton Run ou Ctrl+Enter)

**Résultat attendu** :
```
✅ SUCCÈS ! La colonne seller_id existe.
```

---

### Étape 2 : Créer le bucket images (1 min)

1. **Supabase Dashboard** → **Storage**
2. **New bucket**
3. Remplissez :
   ```
   Name: marketplace-images
   Public: ✅ OUI (important !)
   ```
4. **Create bucket**

---

### Étape 3 : Tester (2 min)

1. **Allez sur** : `/create-trade`
2. **Vérifiez** :
   - ✅ Le composant d'upload d'images est visible (zone avec texte "Glissez-déposez...")
   - ✅ Vous pouvez remplir le formulaire
3. **Créez une annonce de test** :
   - Type : Vente
   - Titre : "Test"
   - Jeu : (sélectionnez un jeu quelconque)
   - État : "Bon état"
   - Prix : 10
4. **Cliquez** "Publier"

**Résultat attendu** :
- ✅ Pas d'erreur
- ✅ Redirection vers `/trade/:id`
- ✅ Annonce affichée

---

## 🔍 Si le problème persiste

### L'upload d'images n'est toujours pas visible

**Ouvrez la console** (F12 dans le navigateur) et cherchez les erreurs.

Partagez le message d'erreur exact si présent.

### L'erreur seller_id persiste

**Vérifiez** que le script SQL a bien été exécuté :

```sql
-- Exécutez ceci dans Supabase SQL Editor
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'marketplace_items' 
AND column_name = 'seller_id';
```

**Résultat attendu** :
```
seller_id
```

Si vide, la colonne n'existe pas. Réexécutez `FIX_SELLER_ID.sql`.

---

## 📋 Checklist

- [ ] ✅ Script SQL `FIX_SELLER_ID.sql` exécuté
- [ ] ✅ Bucket `marketplace-images` créé et public
- [ ] ✅ Composant d'upload visible sur `/create-trade`
- [ ] ✅ Annonce de test créée avec succès

---

## 💬 Questions ?

Si ça ne marche toujours pas :

1. **Ouvrez** la console du navigateur (F12)
2. **Copiez** le message d'erreur exact
3. **Partagez**-le

---

**Temps total estimé** : 5 minutes ⏱️


