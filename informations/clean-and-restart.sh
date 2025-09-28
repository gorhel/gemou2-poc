#!/bin/bash

# Script de nettoyage complet et redémarrage
echo "🧹 Nettoyage complet de l'application..."

# 1. Arrêter tous les processus
echo "1. Arrêt des processus..."
pkill -f "next" 2>/dev/null || true
pkill -f "turbo" 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# Attendre un peu
sleep 3

# 2. Nettoyer tous les caches
echo "2. Nettoyage des caches..."
rm -rf apps/web/.next 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf apps/web/node_modules/.cache 2>/dev/null || true
rm -rf apps/mobile/.expo 2>/dev/null || true
rm -rf apps/mobile/node_modules/.cache 2>/dev/null || true

# 3. Nettoyer les logs npm
echo "3. Nettoyage des logs..."
rm -rf ~/.npm/_logs/* 2>/dev/null || true

# 4. Redémarrer uniquement l'application web
echo "4. Redémarrage de l'application web..."
cd apps/web

# Démarrer en arrière-plan
echo "   Démarrage de Next.js..."
npm run dev &

# Attendre que l'application démarre
echo "   Attente du démarrage..."
sleep 10

# 5. Vérifier que l'application fonctionne
echo "5. Vérification de l'application..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application démarrée avec succès !"
    echo ""
    echo "🎯 L'application est accessible sur :"
    echo "   - http://localhost:3000"
    echo ""
    echo "📋 Fonctionnalités disponibles :"
    echo "   - Page d'accueil"
    echo "   - Dashboard"
    echo "   - Événements"
    echo "   - Profils utilisateurs"
    echo ""
    echo "🔧 Pour arrêter l'application :"
    echo "   pkill -f 'next'"
else
    echo "❌ Erreur lors du démarrage"
    echo "   Vérifiez les logs ci-dessus"
fi

echo ""
echo "🎉 Nettoyage et redémarrage terminés !"
