# 🧪 Guide de test rapide - App universelle

## ✅ Serveur actif
- **Port** : 8082
- **URL Web** : http://localhost:8082
- **Status** : ✅ En ligne

## 📱 Tests à effectuer

### 1. Test Web (5 min)

Ouvrez dans votre navigateur et testez les routes suivantes :

#### ✅ Routes publiques
```
http://localhost:8082/onboarding
http://localhost:8082/login  
http://localhost:8082/register
```

**Actions à tester** :
- [ ] L'onboarding s'affiche avec les images SVG
- [ ] Les boutons "Commencer" et "Passer" fonctionnent
- [ ] Le formulaire de register fonctionne
- [ ] La validation du username en temps réel fonctionne

#### ✅ Routes protégées (après login)
```
http://localhost:8082/(tabs)/dashboard
http://localhost:8082/(tabs)/events
http://localhost:8082/(tabs)/community
http://localhost:8082/(tabs)/search
http://localhost:8082/(tabs)/profile
```

**Actions à tester** :
- [ ] Les tabs en bas sont visibles et cliquables
- [ ] Navigation entre les tabs fonctionne
- [ ] La liste des événements se charge
- [ ] La recherche fonctionne
- [ ] Le profil affiche les bonnes infos

### 2. Test Mobile avec Expo Go (10 min)

#### Installation Expo Go
- **iOS** : [App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android** : [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### Lancer pour mobile
```bash
cd apps/mobile
npx expo start --port 8082

# Dans le terminal, vous verrez :
# - Un QR code
# - L'URL : exp://192.168.x.x:8082
```

#### Scanner le QR code
- **iOS** : Utilisez l'appareil photo natif
- **Android** : Ouvrez Expo Go puis scannez

#### Tests
- [ ] L'app se charge sur le téléphone
- [ ] L'onboarding s'affiche
- [ ] Les animations de swipe fonctionnent
- [ ] Vous pouvez vous inscrire/connecter
- [ ] Les tabs en bas fonctionnent
- [ ] Toutes les routes sont accessibles

### 3. Test avec simulateur iOS (si Xcode installé)

```bash
cd apps/mobile
npx expo start --port 8082

# Dans le terminal Expo, appuyez sur 'i'
# Le simulateur iOS va se lancer
```

- [ ] L'app se lance sur le simulateur
- [ ] Navigation fluide
- [ ] Gestes iOS natifs fonctionnent

## 🔍 Checklist de validation

### Fonctionnalités critiques
- [ ] **Inscription** : Créer un compte fonctionne
- [ ] **Connexion** : Se connecter fonctionne
- [ ] **Navigation** : Tous les tabs sont accessibles
- [ ] **Événements** : Liste visible et détails accessibles
- [ ] **Recherche** : Recherche d'events et users fonctionne
- [ ] **Profil** : Profil s'affiche avec statistiques
- [ ] **Déconnexion** : Se déconnecter fonctionne

### Cross-platform
- [ ] **Web** : Toutes les fonctionnalités marchent sur desktop
- [ ] **iOS** : Toutes les fonctionnalités marchent sur iPhone/iPad
- [ ] **Android** : Toutes les fonctionnalités marchent sur Android
- [ ] **Responsive** : L'UI s'adapte à toutes les tailles d'écran

### Performance
- [ ] **Chargement rapide** : < 3 secondes
- [ ] **Navigation fluide** : Pas de lag
- [ ] **Pas d'erreurs** : Console sans erreurs critiques

## 🐛 En cas de problème

### Erreur "Module not found"
```bash
cd apps/mobile
rm -rf node_modules .expo
npm install --legacy-peer-deps
npx expo start --clear --port 8082
```

### Erreur "Port already in use"
```bash
# Changer de port
npx expo start --clear --port 8083

# OU tuer le processus
lsof -ti:8082 | xargs kill -9
```

### L'app plante au clic
```bash
# Nettoyer les caches
rm -rf .expo node_modules/.cache
npx expo start --clear --port 8082

# Sur le téléphone :
# Secouer le téléphone → Reload
```

### Navigation ne fonctionne pas
```bash
# Vérifier les logs dans le terminal Expo
# Chercher les erreurs de type :
# - "Unable to resolve..."
# - "Cannot find module..."
```

## 📞 Support

### Logs
Les logs apparaissent dans :
- **Terminal Expo** : Pour les erreurs serveur
- **Console navigateur** : Pour erreurs web (F12)
- **Expo Go** : Secouer le téléphone → Debug

### Commandes debug
```bash
# Voir tous les logs
npx expo start --port 8082

# Dans le terminal Expo :
j - Ouvrir DevTools
c - Afficher les logs
r - Reload l'app
```

## ✅ Validation finale

Une fois tous les tests passés :
- [ ] Web fonctionne parfaitement
- [ ] Mobile fonctionne parfaitement  
- [ ] Toutes les routes sont accessibles
- [ ] Pas d'erreurs dans les consoles

→ **Migration réussie !** 🎉

## 🎯 Étapes suivantes

1. **Tester l'app** selon ce guide
2. **Signaler les bugs** s'il y en a
3. **Décider** : Supprimer `/apps/web` ou le garder ?
4. **Optimiser** : NativeWind, images, performance
5. **Déployer** : Web sur Vercel, mobile sur stores

---

**Bonne chance !** 🚀

