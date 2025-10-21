# 📤 Publier le projet sur GitHub

## Étapes à suivre :

### 1️⃣ Créer un repository sur GitHub

1. Allez sur **https://github.com/new**
2. Nom suggéré : `gemou2-poc` ou `gemou2-app`
3. Description : "Application universelle de jeux de société (Web, iOS, Android)"
4. Choisissez : **Private** ou **Public**
5. ❌ **NE PAS** cocher "Initialize with README" (vous en avez déjà un)
6. Cliquez sur **"Create repository"**

---

### 2️⃣ Configurer le remote Git

GitHub vous donnera une URL du type :
```
https://github.com/VOTRE_USERNAME/gemou2-poc.git
```

**Copiez cette URL**, puis dans votre terminal :

```bash
cd /Users/essykouame/Downloads/gemou2-poc

# Ajouter le remote
git remote add origin https://github.com/VOTRE_USERNAME/gemou2-poc.git

# Vérifier
git remote -v
```

---

### 3️⃣ Pousser le code

```bash
# Pousser la branche develop (branche actuelle)
git push -u origin develop

# Optionnel : Pousser aussi sur main si elle existe
git push -u origin main
```

---

### 4️⃣ Vérifier

Retournez sur GitHub, vous devriez voir :
- ✅ Tous vos fichiers
- ✅ Les 3 commits
- ✅ La branche `develop`

---

## 🔐 Authentification GitHub

Si GitHub demande un mot de passe :

### Option A : Token (recommandé)
1. Allez sur : https://github.com/settings/tokens
2. Générez un **Personal Access Token**
3. Permissions : `repo` (full control)
4. Utilisez le token comme mot de passe

### Option B : SSH
```bash
# Générer une clé SSH
ssh-keygen -t ed25519 -C "votre@email.com"

# Copier la clé publique
cat ~/.ssh/id_ed25519.pub

# L'ajouter sur GitHub : https://github.com/settings/keys

# Utiliser l'URL SSH
git remote set-url origin git@github.com:VOTRE_USERNAME/gemou2-poc.git
```

---

## 📋 Commandes rapides

```bash
# 1. Créer repo sur GitHub puis :
git remote add origin https://github.com/VOTRE_USERNAME/gemou2-poc.git

# 2. Pousser
git push -u origin develop

# 3. Vérifier
git remote -v
git branch -a
```

---

## ✨ Une fois publié

Votre projet sera accessible à :
```
https://github.com/VOTRE_USERNAME/gemou2-poc
```

Vous pourrez :
- ✅ Partager le code
- ✅ Collaborer avec d'autres
- ✅ Déployer sur Vercel/Netlify
- ✅ Configurer CI/CD

---

**Prêt ? Créez le repo sur GitHub et lancez les commandes !** 🚀

