# 🧪 Guide de Test - Marketplace Gemou2

## ⏱️ Temps estimé : 15 minutes

---

## 🎯 Objectif

Tester les 2 nouvelles routes du marketplace pour s'assurer que tout fonctionne correctement.

---

## ⚠️ PRÉREQUIS OBLIGATOIRE

### Créer le bucket Supabase Storage (5 minutes)

**VOUS DEVEZ faire ceci AVANT de tester :**

1. 🌐 Allez sur https://supabase.com/dashboard
2. 📁 Sélectionnez votre projet **Gemou2**
3. 🗄️ Menu latéral → **Storage**
4. ➕ Cliquez sur **New bucket**
5. Remplissez :
   ```
   Name: marketplace-images
   Public: ✅ OUI (cochez)
   File size limit: 10 MB
   ```
6. ✅ Cliquez sur **Create bucket**
7. 🔐 Allez dans l'onglet **Policies** du bucket
8. ➕ Cliquez sur **New Policy**
9. Sélectionnez **Allow public access for SELECT**
10. ✅ Validez

**Sans ce bucket, l'upload d'images ne fonctionnera PAS.**

---

## 📝 Tests à effectuer

### ✅ Test 1 : Créer une annonce de VENTE (5 min)

1. 🔐 **Connectez-vous** à votre application web
2. 🌐 Allez sur `/create-trade` (dans votre navigateur)
3. 💰 Sélectionnez **"Vente"**
4. 📝 Remplissez le formulaire :
   - **Titre** : "Catan - Edition de base"
   - **Jeu** : Tapez "Catan" → Sélectionnez dans la liste
   - **État** : "Bon état"
   - **Description** : "Jeu en très bon état, peu utilisé"
   - **Localisation** : Tapez "Saint-Denis" → Sélectionnez
   - **Photos** : Glissez 1-2 images **OU** cliquez pour sélectionner
   - **Prix** : 25.00
   - **Livraison** : ✅ Activez
5. 🚀 Cliquez sur **"Publier"**

**✅ Résultat attendu :**
- Vous êtes redirigé vers `/trade/:id`
- Toutes les infos s'affichent correctement
- Les images apparaissent dans la galerie
- Le prix est "25.00 €"
- Le badge "💰 Vente" est affiché

**❌ Si ça ne marche pas :**
- Vérifiez que le bucket Storage existe
- Ouvrez la console du navigateur (F12) pour voir les erreurs

---

### ✅ Test 2 : Créer une annonce d'ÉCHANGE (3 min)

1. 🌐 Retournez sur `/create-trade`
2. 🔄 Sélectionnez **"Échange"**
3. 📝 Remplissez :
   - **Titre** : "7 Wonders Duel"
   - **Jeu** : Recherchez dans la liste
   - **État** : "Excellent"
   - **Jeu recherché** : "Wingspan"
4. 🚀 Cliquez sur **"Publier"**

**✅ Résultat attendu :**
- Pas de champ "Prix" dans le formulaire
- Un champ "Jeu recherché" apparaît
- L'annonce affiche "🔄 Échange"
- La mention "Jeu recherché : Wingspan" s'affiche

---

### ✅ Test 3 : Jeu personnalisé (2 min)

1. 🌐 Retournez sur `/create-trade`
2. 🎮 Dans le champ "Jeu", tapez n'importe quoi
3. ➕ Cliquez sur **"Mon jeu n'est pas dans la liste"**
4. 📝 Entrez : "Jeu de société fait maison"
5. ✅ Complétez le reste du formulaire
6. 🚀 Publiez

**✅ Résultat attendu :**
- L'annonce est créée
- Le nom "Jeu de société fait maison" s'affiche
- **AUCUN** bouton "Voir la fiche du jeu" (car jeu personnalisé)

---

### ✅ Test 4 : Validation du formulaire (1 min)

1. 🌐 Allez sur `/create-trade`
2. 💰 Sélectionnez **"Vente"**
3. 📝 Remplissez UNIQUEMENT le titre
4. ❌ **NE REMPLISSEZ PAS** le prix
5. 🚀 Cliquez sur **"Publier"**

**✅ Résultat attendu :**
- ❌ Le formulaire affiche des erreurs en rouge
- ❌ L'annonce n'est PAS créée
- Messages d'erreur :
  - "Le prix est obligatoire pour une vente"
  - "Vous devez sélectionner un jeu ou entrer un nom personnalisé"
  - etc.

---

### ✅ Test 5 : Brouillon (1 min)

1. 🌐 Allez sur `/create-trade`
2. 📝 Remplissez UNIQUEMENT :
   - **Titre** : "Test brouillon"
3. 💾 Cliquez sur **"Enregistrer et quitter"**

**✅ Résultat attendu :**
- ✅ L'annonce est créée
- Le status est "Brouillon"
- Pas d'erreur de validation

---

### ✅ Test 6 : Contacter le vendeur (3 min)

**⚠️ Nécessite 2 comptes utilisateurs**

1. 👤 Avec le **compte A**, créez une annonce
2. 🚪 Déconnectez-vous
3. 👤 Connectez-vous avec le **compte B**
4. 🔍 Allez sur l'annonce du compte A (`/trade/:id`)
5. 💬 Cliquez sur **"Contacter le vendeur"**

**✅ Résultat attendu :**
- Vous êtes redirigé vers `/messages?conversation=:id`
- Une conversation est créée
- (Optionnel) Le compte A reçoit une notification

**❌ Si vous voyez "C'est votre annonce" :**
- Normal, vous ne pouvez pas contacter votre propre annonce

---

## 🐛 Problèmes courants

### "Failed to upload image"

**Cause :** Le bucket Storage n'existe pas

**Solution :** 
1. Allez sur Supabase Dashboard
2. Storage → marketplace-images
3. Si le bucket n'existe pas, créez-le (voir PRÉREQUIS)

---

### "marketplace_items_enriched does not exist"

**Cause :** La migration SQL n'est pas appliquée

**Solution :**
1. Allez sur Supabase Dashboard
2. SQL Editor
3. Collez le contenu de `supabase/migrations/20251009120000_add_marketplace_trade_features.sql`
4. Exécutez

---

### "Unauthorized" lors de la création

**Cause :** RLS policies mal configurées

**Solution :**
1. Vérifiez que vous êtes connecté
2. Vérifiez les policies dans Supabase Dashboard

---

## ✅ Checklist finale

Après tous les tests :

- [ ] ✅ Création d'annonce de vente fonctionne
- [ ] ✅ Création d'annonce d'échange fonctionne
- [ ] ✅ Upload d'images fonctionne
- [ ] ✅ Jeu personnalisé fonctionne
- [ ] ✅ Validation du formulaire fonctionne
- [ ] ✅ Brouillon fonctionne
- [ ] ✅ Contact du vendeur fonctionne
- [ ] ✅ Les infos s'affichent correctement sur `/trade/:id`

---

## 📸 Captures d'écran

Prenez des captures d'écran de :
1. Le formulaire `/create-trade` rempli
2. Une annonce publiée sur `/trade/:id`
3. La galerie d'images
4. Une erreur de validation

---

## 🎉 C'est tout !

Si tous les tests passent, votre marketplace est **100% fonctionnel** ! 🚀

**Prochaines étapes** :
1. Créer une page `/marketplace` pour lister toutes les annonces
2. Ajouter des filtres (prix, localisation, type)
3. Permettre l'édition/suppression d'annonces

---

**Questions ?** Consultez `MARKETPLACE_POST_MIGRATION_CHECKLIST.md` pour plus de détails.





