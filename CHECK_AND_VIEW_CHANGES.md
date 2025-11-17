# ✅ Vérifications pour Voir les Modifications d'Édition d'Annonces

**Date :** 30 octobre 2025

---

## 🔧 Corrections Appliquées

✅ **Erreur de compilation corrigée**  
- Ligne 153 de `apps/web/app/trade/[id]/page.tsx`
- Fonction `formatPrice` appelée avec le bon nombre d'arguments

---

## 📋 Étapes pour Voir les Modifications

### **Option 1 : Application Web (Next.js)**

#### 1️⃣ Vérifier que le serveur de développement tourne

```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/web
npm run dev
```

**Si le serveur était déjà lancé**, vous devriez voir :
```
✓ Ready in Xms
○ Local: http://localhost:3000
```

#### 2️⃣ Forcer le rechargement de la page

Dans votre navigateur :
- **Mac :** `Cmd + Shift + R`
- **Windows/Linux :** `Ctrl + Shift + R`

Ou vider le cache :
- Chrome : `Cmd/Ctrl + Shift + Delete` → Effacer les données

#### 3️⃣ Tester le flux complet

**A. Créer une annonce test (si pas déjà fait) :**
1. Allez sur http://localhost:3000/create-trade
2. Créez une annonce de vente
3. Publiez-la

**B. Vérifier le bouton "Modifier l'annonce" :**
1. Après publication, vous êtes redirigé vers `/trade/[id]`
2. **Vérifiez que vous voyez** :
   - Un bouton **"✏️ Modifier l'annonce"** (avec bordure bleue)
   - Un badge "C'est votre annonce"

**C. Tester l'édition :**
1. Cliquez sur **"✏️ Modifier l'annonce"**
2. Vous devriez être redirigé vers `/create-trade?id=xxx`
3. **Le formulaire doit être pré-rempli** avec les données de l'annonce
4. Le titre de la page doit afficher **"Modifier l'annonce"**
5. Modifiez le titre ou le prix
6. Cliquez sur **"Mettre à jour"** (au lieu de "Publier")
7. Vous êtes redirigé vers la page de détail
8. **Les modifications doivent être visibles**

---

### **Option 2 : Application Mobile (Expo)**

#### 1️⃣ Vérifier que Expo tourne

```bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/mobile
npx expo start
```

#### 2️⃣ Recharger l'application

Sur votre téléphone ou émulateur :
- **iOS :** `Cmd + R` (ou secouer le téléphone)
- **Android :** `R + R` (double appui rapide sur R)

#### 3️⃣ Tester le flux

1. Ouvrir une annonce que vous avez créée
2. Vérifier le bouton **"✏️ Modifier l'annonce"**
3. Cliquer dessus
4. Le formulaire doit se pré-remplir
5. Modifier et sauvegarder

---

## 🐛 Diagnostics si ça ne fonctionne pas

### Problème 1 : Le bouton "Modifier" n'apparaît pas

**Causes possibles :**
```typescript
// Vérifier que vous êtes bien le propriétaire
item.seller_id === user?.id  // Doit être TRUE
```

**Solutions :**
1. Ouvrir la console du navigateur (F12)
2. Aller dans l'onglet **Console**
3. Taper : 
   ```javascript
   console.log('User ID:', user?.id)
   console.log('Seller ID:', item?.seller_id)
   ```
4. Ces deux valeurs **doivent être identiques**

**Si les IDs sont différents** :
- Vous n'êtes pas connecté avec le bon compte
- Ou l'annonce a été créée par un autre utilisateur

---

### Problème 2 : Erreur "seller_id" ou "user_id"

**Symptôme :** Erreur type `column "seller_id" does not exist`

**Cause :** Incohérence dans la base de données

**Solution :** Exécuter cette requête SQL dans Supabase :

```sql
-- Vérifier la colonne
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'marketplace_items' 
AND column_name IN ('user_id', 'seller_id');
```

Si vous voyez `user_id` au lieu de `seller_id`, renommez :

```sql
ALTER TABLE marketplace_items 
RENAME COLUMN user_id TO seller_id;
```

---

### Problème 3 : Le formulaire ne se pré-remplit pas

**Causes possibles :**
- L'ID de l'annonce n'est pas dans l'URL
- Erreur de chargement des données

**Vérifier :**
1. L'URL doit être : `/create-trade?id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
2. Ouvrir la console (F12) → onglet **Console**
3. Chercher les messages d'erreur

**Si vous voyez une erreur :**
```
Error loading trade: [erreur]
```

**Solutions :**
- Vérifier que l'annonce existe vraiment en base
- Vérifier les permissions RLS sur Supabase

---

### Problème 4 : "Cannot read property of undefined"

**Cause :** Le code essaie d'accéder à une propriété qui n'existe pas

**Vérifier dans la console :**
```javascript
// Vérifier la structure de l'objet
console.log('Item:', item)
```

**Si `seller_id` est `undefined` :**
- Votre base de données utilise peut-être `user_id`
- Il faut synchroniser le schéma

---

## 🔍 Vérifications Additionnelles

### Vérifier la base de données

```sql
-- Dans Supabase SQL Editor
SELECT 
  id, 
  title, 
  seller_id,
  created_at,
  updated_at
FROM marketplace_items 
WHERE seller_id = (SELECT auth.uid())
ORDER BY updated_at DESC
LIMIT 5;
```

**Cette requête doit retourner vos annonces.**

Si `seller_id` est NULL, il y a un problème.

---

### Vérifier les politiques RLS

```sql
-- Vérifier les politiques sur marketplace_items
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'marketplace_items';
```

**Politique nécessaire pour UPDATE :**
```sql
CREATE POLICY "Sellers can update own items" 
ON marketplace_items FOR UPDATE 
USING (auth.uid() = seller_id);
```

---

## ✅ Test de Validation Complet

### Checklist

- [ ] Serveur de développement lancé (web ou mobile)
- [ ] Cache du navigateur vidé
- [ ] Connecté avec le bon compte utilisateur
- [ ] Une annonce créée par moi-même existe
- [ ] Je suis sur la page de détail de cette annonce `/trade/[id]`
- [ ] Je vois le bouton **"✏️ Modifier l'annonce"**
- [ ] En cliquant, je suis redirigé vers `/create-trade?id=xxx`
- [ ] Le formulaire se pré-remplit automatiquement
- [ ] Le titre de la page dit "Modifier l'annonce"
- [ ] Je peux modifier les champs
- [ ] Le bouton dit "Mettre à jour" au lieu de "Publier"
- [ ] En sauvegardant, je retourne sur `/trade/[id]`
- [ ] Les modifications sont visibles

---

## 🆘 Si Rien ne Fonctionne

### Redémarrer complètement l'application

**Web :**
```bash
# Tuer le serveur (Ctrl+C)
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/web
rm -rf .next
npm run dev
```

**Mobile :**
```bash
# Tuer Expo (Ctrl+C)
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/mobile
npx expo start --clear
```

### Vérifier les logs

**Web (terminal) :**
```
○ Compiling /trade/[id] ...
✓ Compiled in XXXms
```

**Mobile (terminal) :**
```
› Opening exp://192.168.x.x:8081 on iPhone
› Press ? │ show all commands
```

---

## 📞 Support

Si après toutes ces vérifications, ça ne fonctionne toujours pas, fournissez :

1. **La version de l'application** : Web ou Mobile ?
2. **Le message d'erreur exact** (capture d'écran de la console)
3. **L'URL actuelle** dans la barre d'adresse
4. **Le résultat de** : 
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'marketplace_items' 
   AND column_name IN ('user_id', 'seller_id');
   ```

---

**Dernière mise à jour :** 30 octobre 2025






