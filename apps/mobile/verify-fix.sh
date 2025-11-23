#!/bin/bash

echo "🔍 Vérification des corrections appliquées..."
echo ""

# Vérifier les versions React
echo "📊 Versions React installées :"
npm list react react-dom react-native 2>/dev/null | grep -E "(react@|react-dom@|react-native@)" | head -3
echo ""

# Vérifier que le fichier index.tsx a été modifié
if grep -q "setTimeout(() => {" app/index.tsx; then
    echo "✅ Navigation corrigée dans index.tsx"
else
    echo "❌ Navigation non corrigée dans index.tsx"
fi
echo ""

# Vérifier la structure de base
if [ -d "node_modules" ]; then
    echo "✅ node_modules présent"
else
    echo "❌ node_modules manquant"
fi
echo ""

echo "🚀 Prêt à démarrer l'application avec :"
echo "   npm run dev"
echo "   ou"
echo "   expo start --clear"
echo ""
echo "📝 Pour plus de détails, voir :"
echo "   documentation/2025-11-17-correction-crash-expo.md"
