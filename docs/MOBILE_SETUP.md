# 📱 Configuration Mobile - Gémou2

## 🎯 Vue d'ensemble

Ce document décrit la configuration et le setup de l'application mobile Gémou2 utilisant React Native + Expo.

## 🏗️ Architecture

- **Framework** : React Native avec Expo Router
- **Version Expo** : SDK 54
- **React Native** : 0.76.0
- **TypeScript** : Support complet

## 📦 Dépendances critiques

### Dépendances principales
```json
{
  "expo": "~54.0.0",
  "react": "18.3.1",
  "react-native": "0.76.0",
  "expo-router": "~4.0.0"
}
```

### Dépendances web (requises)
```json
{
  "react-native-web": "~0.19.6",
  "react-dom": "18.2.0"
}
```

### Configuration Babel
```json
{
  "babel-preset-expo": "^54.0.1"
}
```

## ⚙️ Configuration

### babel.config.js
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [],
  };
};
```

### Scripts disponibles
```bash
npm run dev:mobile    # Démarrage développement
npm run build:mobile  # Build production
```

## 🚀 Démarrage rapide

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Démarrage de l'app**
   ```bash
   npm run dev:mobile
   ```

3. **Test sur différentes plateformes**
   - **Mobile** : Scanner le QR code avec Expo Go
   - **Web** : Ouvrir http://localhost:8081
   - **Simulateur** : Appuyer sur `i` (iOS) ou `a` (Android)

## 🔧 Résolution de problèmes

### Erreur "Cannot find module 'babel-preset-expo'"
```bash
npm install babel-preset-expo --save-dev
```

### Erreur "react-native-web not found"
```bash
npx expo install react-native-web@~0.19.6 react-dom@18.2.0
```

### Page blanche
- Vérifier que `babel-preset-expo` est installé
- Vérifier la configuration `babel.config.js`
- Redémarrer avec `expo start --clear`

## 📝 Notes de maintenance

- **Dernière mise à jour** : Issue OUT-99 (14/09/2025)
- **Problème résolu** : Erreur de page blanche sur mobile
- **Dépendances mises à jour** : Expo SDK 54, React Native 0.76.0

## 🔗 Liens utiles

- [Documentation Expo](https://docs.expo.dev/)
- [Expo Router](https://expo.github.io/router/)
- [React Native Web](https://necolas.github.io/react-native-web/)
