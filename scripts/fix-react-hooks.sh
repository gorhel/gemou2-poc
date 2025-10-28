#!/bin/bash

echo "🧹 Nettoyage du cache et des dépendances..."
echo ""

# Arrêter le serveur Expo s'il est en cours d'exécution
echo "⏹️  Arrêt du serveur Expo..."
pkill -f "expo start" || true
pkill -f "metro" || true

# Nettoyer le cache Expo
echo "🗑️  Nettoyage du cache Expo..."
cd "$(dirname "$0")/.."
npx expo start --clear &>/dev/null || true

# Supprimer les node_modules
echo "🗑️  Suppression des node_modules..."
rm -rf node_modules
rm -rf apps/mobile/node_modules
rm -rf apps/web/node_modules
rm -rf packages/*/node_modules

# Supprimer les lock files
echo "🗑️  Suppression des fichiers de lock..."
rm -f package-lock.json
rm -f apps/mobile/package-lock.json
rm -f apps/web/package-lock.json

# Nettoyer le cache npm
echo "🗑️  Nettoyage du cache npm..."
npm cache clean --force

# Nettoyer le cache Watchman (si installé)
if command -v watchman &> /dev/null; then
    echo "🗑️  Nettoyage du cache Watchman..."
    watchman watch-del-all
fi

# Nettoyer le cache Metro
echo "🗑️  Nettoyage du cache Metro..."
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/haste-*

# Réinstaller les dépendances
echo ""
echo "📦 Réinstallation des dépendances..."
npm install

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "🚀 Pour démarrer l'application mobile :"
echo "   cd apps/mobile && npm run dev:web"
echo ""





