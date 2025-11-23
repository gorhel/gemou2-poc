# Guide Complet : Simuler Expo sur macOS

**Date** : 17 Novembre 2025  
**Plateforme** : macOS  
**Application** : Gémou2 Mobile (Expo)

---

## 🎯 Vue d'Ensemble des Options

| Option | Temps Installation | Espace Disque | Fidélité Mobile | Recommandation |
|--------|-------------------|---------------|-----------------|----------------|
| **🌐 Web Browser** | ✅ 0 min (disponible maintenant) | 0 MB | ⭐⭐⭐ | 👍 Démarrage rapide |
| **📱 iOS Simulator** | ⏱️ 30-60 min | ~15 GB | ⭐⭐⭐⭐⭐ | 👍👍 Test iOS complet |
| **🤖 Android Emulator** | ⏱️ 45-90 min | ~10 GB | ⭐⭐⭐⭐⭐ | 👍👍 Test Android complet |

---

## 🌐 OPTION 1 : Navigateur Web (RECOMMANDÉ POUR DÉMARRER)

### ✅ Disponible IMMÉDIATEMENT

Le serveur Expo est déjà actif ! Vous avez 3 méthodes :

#### Méthode A : Depuis le Terminal Expo (Le Plus Simple)
1. Trouvez le terminal où Expo est lancé
2. Appuyez sur la touche **`w`**
3. Votre navigateur s'ouvrira automatiquement

#### Méthode B : URL Directe
Ouvrez dans votre navigateur :
\`\`\`
http://localhost:8081
\`\`\`

#### Méthode C : Commande
\`\`\`bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/mobile
npx expo start --web
\`\`\`

### 🎨 Simuler un Mobile dans le Navigateur

**Dans Chrome/Firefox** :
1. Appuyez sur **F12** (ou Cmd+Option+I)
2. Cliquez sur l'icône 📱 "Toggle Device Toolbar"
3. Sélectionnez un appareil : iPhone 14, Pixel 7, etc.
4. Testez en mode portrait/paysage

**Raccourcis Chrome DevTools** :
- \`Cmd+Shift+M\` : Toggle device mode
- \`Cmd+Shift+C\` : Inspecter élément
- \`Cmd+Option+J\` : Console

### ✅ Avantages
- ⚡ Instantané (0 installation)
- 🔄 Hot reload très rapide
- 🛠️ DevTools puissants
- 💻 Léger en ressources

### ⚠️ Limitations
- ❌ Pas de caméra native
- ❌ Pas de GPS réel
- ❌ Comportement peut différer du natif
- ❌ Pas d'accès aux API iOS/Android spécifiques

---

## 📱 OPTION 2 : iOS Simulator (NATIF MACOS)

### 📥 Installation de Xcode (Requis)

#### Étape 1 : Installer Xcode
\`\`\`bash
# Option A : Via App Store (Recommandé)
# 1. Ouvrir App Store
# 2. Rechercher "Xcode"
# 3. Cliquer "Obtenir" (gratuit, ~15GB, 30-60 min)

# Option B : Via Terminal (plus rapide pour les devs)
xcode-select --install
\`\`\`

**Temps d'installation** : 30-60 minutes  
**Espace requis** : ~15 GB  
**Gratuit** : ✅ Oui

#### Étape 2 : Accepter la Licence
\`\`\`bash
sudo xcodebuild -license accept
\`\`\`

#### Étape 3 : Installer les Command Line Tools
\`\`\`bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
\`\`\`

#### Étape 4 : Vérifier l'Installation
\`\`\`bash
xcodebuild -version
# Devrait afficher : Xcode 15.x.x
\`\`\`

### 🚀 Lancer le Simulateur iOS

#### Méthode A : Depuis Expo
\`\`\`bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/mobile

# Démarrer Expo
npx expo start

# Dans le terminal Expo, appuyer sur 'i'
# Le simulateur iOS se lancera automatiquement
\`\`\`

#### Méthode B : Commande Directe
\`\`\`bash
npx expo run:ios
\`\`\`

#### Méthode C : Choisir un Appareil Spécifique
\`\`\`bash
# Lister les simulateurs disponibles
xcrun simctl list devices

# Lancer un simulateur spécifique
xcrun simctl boot "iPhone 15 Pro"
open -a Simulator

# Puis lancer Expo
npx expo start
# Appuyer sur 'i'
\`\`\`

### 📱 Simulateurs iOS Recommandés
- **iPhone 15 Pro** : Dernier modèle, A17 chip
- **iPhone 14** : Populaire, bon compromis
- **iPhone SE (3rd gen)** : Petit écran, tests de layout
- **iPad Pro 12.9"** : Test tablette

### 🎮 Raccourcis Simulator iOS
- \`Cmd+K\` : Toggle clavier
- \`Cmd+Shift+H\` : Home button
- \`Cmd+Shift+H+H\` : App switcher
- \`Cmd+R\` : Rotate device
- \`Cmd+→\` / \`Cmd+←\` : Rotate

### ✅ Avantages
- ✅ Comportement 100% identique à un vrai iPhone
- ✅ Toutes les API iOS disponibles
- ✅ Performance excellente
- ✅ Debug avec Safari Web Inspector

### ⚠️ Limitations
- ❌ Nécessite macOS (pas Windows/Linux)
- ❌ Installation volumineuse (~15GB)
- ❌ Ressources CPU/RAM importantes

---

## 🤖 OPTION 3 : Émulateur Android

### 📥 Installation d'Android Studio

#### Étape 1 : Télécharger Android Studio
\`\`\`bash
# Option A : Site officiel
# https://developer.android.com/studio

# Option B : Homebrew (recommandé)
brew install --cask android-studio
\`\`\`

**Temps d'installation** : 45-90 minutes  
**Espace requis** : ~10 GB  
**Gratuit** : ✅ Oui

#### Étape 2 : Configuration Initiale
1. Lancer Android Studio
2. Suivre le Setup Wizard
3. **Important** : Installer "Android SDK", "Android SDK Platform", "Android Virtual Device"

#### Étape 3 : Configurer les Variables d'Environnement
\`\`\`bash
# Ajouter dans ~/.zshrc (ou ~/.bash_profile)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Recharger le shell
source ~/.zshrc
\`\`\`

#### Étape 4 : Vérifier l'Installation
\`\`\`bash
adb --version
# Devrait afficher : Android Debug Bridge version x.x.x

emulator -list-avds
# Liste les émulateurs disponibles
\`\`\`

### 🎨 Créer un Émulateur Android (AVD)

#### Via Android Studio (Interface Graphique)
1. Ouvrir **Android Studio**
2. Cliquer sur **More Actions** → **Virtual Device Manager**
3. Cliquer **Create Device**
4. Choisir un appareil (ex: Pixel 7)
5. Choisir une image système :
   - **Recommandé** : Android 13 (API 33) ou Android 14 (API 34)
   - Télécharger si nécessaire (~1-2 GB)
6. Cliquer **Finish**

#### Via Terminal (Avancé)
\`\`\`bash
# Lister les images disponibles
sdkmanager --list | grep system-images

# Installer une image (Android 13)
sdkmanager "system-images;android-33;google_apis_playstore;arm64-v8a"

# Créer l'AVD
avdmanager create avd -n Pixel_7_API_33 -k "system-images;android-33;google_apis_playstore;arm64-v8a" -d pixel_7
\`\`\`

### 🚀 Lancer l'Émulateur Android

#### Méthode A : Depuis Expo
\`\`\`bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/mobile

# Démarrer Expo
npx expo start

# Dans le terminal Expo, appuyer sur 'a'
# L'émulateur Android se lancera automatiquement
\`\`\`

#### Méthode B : Lancer l'Émulateur Manuellement
\`\`\`bash
# Lister les AVD
emulator -list-avds

# Lancer un émulateur
emulator -avd Pixel_7_API_33 &

# Puis lancer Expo
npx expo start
# Appuyer sur 'a'
\`\`\`

#### Méthode C : Commande Directe
\`\`\`bash
npx expo run:android
\`\`\`

### 📱 Émulateurs Android Recommandés
- **Pixel 7** : Moderne, Android 13/14
- **Pixel 5** : Bon compromis performance
- **Nexus 5X** : Petit écran, tests de layout
- **Pixel Tablet** : Test tablette Android

### 🎮 Raccourcis Émulateur Android
- \`Cmd+M\` : Developer menu
- \`Cmd+R\` : Reload
- \`Cmd+D\` : Debug menu
- \`Cmd+Shift+Z\` : Shake gesture
- Side buttons : Volume, Power, Rotate

### ✅ Avantages
- ✅ Comportement identique à un vrai Android
- ✅ Toutes les API Android disponibles
- ✅ Play Store disponible
- ✅ Fonctionne sur macOS/Windows/Linux

### ⚠️ Limitations
- ❌ Installation volumineuse (~10GB)
- ❌ Performance peut être lente (dépend du Mac)
- ❌ Consomme beaucoup de RAM

---

## 🏆 RECOMMANDATION PAR CAS D'USAGE

### Pour Démarrer Rapidement
**→ 🌐 Version Web** (disponible maintenant)
\`\`\`bash
# Dans le terminal Expo, appuyer sur 'w'
# Ou ouvrir : http://localhost:8081
\`\`\`

### Pour Tester l'UX Mobile Complète
**→ 📱 iOS Simulator** (si vous avez un Mac)
\`\`\`bash
# Installer Xcode via App Store (une fois)
# Puis : npx expo start → appuyer sur 'i'
\`\`\`

### Pour Tester Android
**→ 🤖 Émulateur Android** (toutes plateformes)
\`\`\`bash
# Installer Android Studio (une fois)
# Puis : npx expo start → appuyer sur 'a'
\`\`\`

### Pour Tests Complets
**→ Les 3 Options** (Web + iOS + Android)

---

## 🚀 WORKFLOW RECOMMANDÉ

### Phase 1 : Développement Initial (Web)
\`\`\`bash
npx expo start --web
# Développement rapide avec hot reload
\`\`\`

### Phase 2 : Tests iOS
\`\`\`bash
npx expo start
# Appuyer sur 'i' pour iOS Simulator
# Tester les features spécifiques iOS
\`\`\`

### Phase 3 : Tests Android
\`\`\`bash
npx expo start
# Appuyer sur 'a' pour Android Emulator
# Tester les features spécifiques Android
\`\`\`

### Phase 4 : Tests sur Vraie Device (Optionnel)
\`\`\`bash
npx expo start
# Scanner le QR code avec Expo Go sur votre téléphone
\`\`\`

---

## 🛠️ COMMANDES UTILES

### Relancer Proprement
\`\`\`bash
cd /Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/apps/mobile

# Nettoyer le cache
npx expo start --clear

# Ou tout nettoyer
rm -rf .expo node_modules/.cache
npx expo start --clear
\`\`\`

### Changer de Plateforme
\`\`\`bash
# Web
npx expo start --web

# iOS uniquement
npx expo start --ios

# Android uniquement
npx expo start --android
\`\`\`

### Debug
\`\`\`bash
# Activer le remote debugging
# Dans l'app : Secouer l'appareil → Debug Remote JS

# Voir les logs
npx react-native log-ios     # iOS
npx react-native log-android # Android
\`\`\`

---

## 🎯 RÉSUMÉ RAPIDE

**Pour tester MAINTENANT** :
\`\`\`bash
# Méthode 1 : Depuis Expo running → appuyer sur 'w'
# Méthode 2 : Ouvrir http://localhost:8081
\`\`\`

**Pour iOS Simulator** :
\`\`\`bash
# 1. Installer Xcode depuis App Store (une fois)
# 2. npx expo start → appuyer sur 'i'
\`\`\`

**Pour Android Emulator** :
\`\`\`bash
# 1. Installer Android Studio (une fois)
# 2. Créer un AVD
# 3. npx expo start → appuyer sur 'a'
\`\`\`

---

## 📚 Ressources

- [Expo Dev Docs](https://docs.expo.dev/)
- [iOS Simulator Guide](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)
- [Android Emulator Guide](https://developer.android.com/studio/run/emulator)
- [React Native Debugging](https://reactnative.dev/docs/debugging)

---

**Créé le** : 17 Novembre 2025  
**Pour** : Gémou2 Mobile App
