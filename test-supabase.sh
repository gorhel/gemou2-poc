#!/bin/bash

# 🧪 Test Configuration Supabase

echo "🔍 Test de la configuration Supabase..."

# Vérifier que les variables d'environnement existent
if [ ! -f ".env.local" ]; then
    echo "❌ Fichier .env.local non trouvé"
    echo "💡 Copiez .env.example vers .env.local et remplissez vos clés Supabase"
    exit 1
fi

# Vérifier le format des URLs
if grep -q "your_supabase" .env.local; then
    echo "⚠️  Les variables d'environnement ne sont pas configurées"
    echo "💡 Éditez .env.local avec vos vraies clés Supabase"
    exit 1
fi

echo "✅ Fichier .env.local configuré"

# Tester les dépendances
echo "🔍 Vérification des dépendances..."
if ! npm list @supabase/supabase-js > /dev/null 2>&1; then
    echo "❌ @supabase/supabase-js non installé"
    echo "💡 Exécutez: npm install"
    exit 1
fi

echo "✅ Dépendances Supabase installées"

# Tester la compilation TypeScript
echo "🔍 Vérification TypeScript..."
if ! npm run type-check > /dev/null 2>&1; then
    echo "⚠️  Erreurs TypeScript détectées"
    echo "💡 Exécutez: npm run type-check pour voir les détails"
else
    echo "✅ Types TypeScript valides"
fi

echo ""
echo "🎯 Configuration Supabase prête !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. 🌐 Tester l'app web: npm run dev:web"
echo "2. 📱 Tester l'app mobile: npm run dev:mobile"  
echo "3. 🔐 Implémenter l'authentification"
echo "4. 🗄️ Créer les premières données de test"