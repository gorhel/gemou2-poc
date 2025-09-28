#!/bin/bash

# Script pour démarrer l'application en mode développement uniquement
echo "🚀 Démarrage de l'application en mode développement..."

# Arrêter tous les processus existants
echo "1. Arrêt des processus existants..."
pkill -f "next-server" 2>/dev/null || true
pkill -f "turbo" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Attendre un peu
sleep 2

# Nettoyer le cache
echo "2. Nettoyage du cache..."
rm -rf apps/web/.next 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Démarrer uniquement l'application web
echo "3. Démarrage de l'application web..."
cd apps/web

# Démarrer en mode développement
echo "   Démarrage de Next.js en mode développement..."
npm run dev &

# Attendre que l'application démarre
echo "   Attente du démarrage..."
sleep 10

# Vérifier que l'application fonctionne
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application démarrée avec succès sur http://localhost:3000"
    echo ""
    echo "🎯 L'application est maintenant accessible sur :"
    echo "   - http://localhost:3000"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. Testez l'application dans votre navigateur"
    echo "2. Vérifiez que les fonctionnalités marchent"
    echo "3. Si des erreurs persistent, vérifiez la console"
    echo ""
    echo "🔧 Pour arrêter l'application :"
    echo "   pkill -f 'next-server'"
else
    echo "❌ Erreur lors du démarrage de l'application"
    echo "   Vérifiez les logs ci-dessus"
    echo ""
    echo "🔧 Solutions possibles :"
    echo "1. Vérifiez que le port 3000 est libre"
    echo "2. Vérifiez les variables d'environnement"
    echo "3. Redémarrez avec: npm run dev"
fi
