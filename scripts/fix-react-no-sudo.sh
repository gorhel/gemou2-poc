#!/bin/bash

echo "🧹 Nettoyage et réinstallation sans sudo..."
echo ""
echo "⚠️  Note : Si vous rencontrez des erreurs de permissions,"
echo "   exécutez d'abord : sudo chown -R $(id -u):$(id -g) ~/.npm"
echo ""

cd "$(dirname "$0")/.."

# Arrêter les processus Expo/Metro
echo "⏹️  Arrêt des processus Expo/Metro..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# Nettoyer avec les permissions actuelles
echo "🗑️  Nettoyage des dossiers accessibles..."
find . -name "node_modules" -type d -maxdepth 3 -exec rm -rf {} + 2>/dev/null || true
find . -name "package-lock.json" -type f -maxdepth 2 -delete 2>/dev/null || true

# Nettoyer les caches accessibles
echo "🗑️  Nettoyage des caches..."
rm -rf ~/.npm/_cacache 2>/dev/null || npm cache verify
rm -rf $TMPDIR/metro-* $TMPDIR/react-* $TMPDIR/haste-* 2>/dev/null || true

# Nettoyer Watchman si disponible
if command -v watchman &> /dev/null; then
    echo "🗑️  Nettoyage de Watchman..."
    watchman watch-del-all 2>/dev/null || true
fi

# Réinstaller
echo ""
echo "📦 Installation des dépendances..."
npm install --legacy-peer-deps

echo ""
echo "✅ Installation terminée !"
echo ""
echo "🚀 Pour démarrer l'application :"
echo "   cd apps/mobile && npm run dev:web"
echo ""





