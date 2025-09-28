#!/bin/bash

# Script pour optimiser les performances de l'application
echo "🚀 Optimisation des performances de l'application..."

# 1. Arrêter les processus en cours
echo "1. Arrêt des processus en cours..."
pkill -f "next-server" 2>/dev/null || true
pkill -f "turbo" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Attendre un peu
sleep 2

# 2. Nettoyer le cache
echo "2. Nettoyage du cache..."
cd /Users/essykouame/Downloads/gemou2-poc

# Nettoyer le cache Next.js
rm -rf apps/web/.next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true

# 3. Vérifier l'utilisation mémoire
echo "3. Vérification de l'utilisation mémoire..."
echo "   Mémoire utilisée par Node.js:"
ps aux | grep node | grep -v grep | awk '{sum+=$6} END {print "   Total: " sum/1024 " MB"}'

# 4. Vérifier les ports
echo "4. Vérification des ports..."
echo "   Ports utilisés:"
lsof -i :3000 2>/dev/null || echo "   Port 3000: Libre"
lsof -i :3001 2>/dev/null || echo "   Port 3001: Libre"

# 5. Redémarrer l'application
echo "5. Redémarrage de l'application..."
echo "   Démarrage en arrière-plan..."

# Démarrer en arrière-plan
cd apps/web
npm run dev > /dev/null 2>&1 &
APP_PID=$!

# Attendre que l'application démarre
echo "   Attente du démarrage..."
sleep 10

# Vérifier que l'application fonctionne
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application démarrée avec succès sur http://localhost:3000"
    echo "   PID: $APP_PID"
else
    echo "❌ Erreur lors du démarrage de l'application"
    echo "   Vérifiez les logs: npm run dev"
fi

echo ""
echo "🎯 Prochaines étapes :"
echo "1. Testez l'application sur http://localhost:3000"
echo "2. Vérifiez les performances avec: node diagnose-performance.js"
echo "3. Si toujours lent, vérifiez votre connexion internet"
echo "4. Considérez l'utilisation de Supabase local pour le développement"

echo ""
echo "🔧 Commandes utiles :"
echo "   - Voir les logs: tail -f apps/web/.next/server.log"
echo "   - Arrêter l'app: kill $APP_PID"
echo "   - Redémarrer: ./optimize-performance.sh"
