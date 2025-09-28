#!/bin/bash

# Script pour configurer Supabase local
echo "🚀 Configuration de Supabase local pour le projet..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé."
    echo "   Installez Docker Desktop depuis: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Vérifier si Docker est démarré
if ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas démarré."
    echo "   Démarrez Docker Desktop et réessayez."
    exit 1
fi

echo "✅ Docker est installé et démarré"

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "📦 Installation de Supabase CLI..."
    
    # Installation selon l'OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            echo "❌ Homebrew n'est pas installé. Installez-le d'abord."
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://supabase.com/install.sh | sh
    else
        echo "❌ OS non supporté. Installez Supabase CLI manuellement."
        exit 1
    fi
else
    echo "✅ Supabase CLI est déjà installé"
fi

# Vérifier la version de Supabase CLI
echo "📋 Version de Supabase CLI:"
supabase --version

# Initialiser Supabase local si ce n'est pas déjà fait
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Initialisation de Supabase local..."
    supabase init
else
    echo "✅ Supabase est déjà initialisé"
fi

# Démarrer Supabase local
echo "🚀 Démarrage de Supabase local..."
supabase start

if [ $? -eq 0 ]; then
    echo "✅ Supabase local démarré avec succès !"
    echo ""
    echo "📋 Informations de connexion :"
    echo "   - URL: http://localhost:54321"
    echo "   - API Key: $(supabase status | grep 'API URL' | cut -d' ' -f3)"
    echo "   - DB URL: postgresql://postgres:postgres@localhost:54322/postgres"
    echo ""
    echo "🎯 Prochaines étapes :"
    echo "1. Vérifiez que les migrations sont appliquées"
    echo "2. Testez la connexion à la base de données"
    echo "3. Démarrez votre application Next.js"
    echo "4. Testez les fonctionnalités"
else
    echo "❌ Erreur lors du démarrage de Supabase local"
    echo ""
    echo "🔧 Solutions possibles :"
    echo "1. Vérifiez que Docker est démarré"
    echo "2. Vérifiez que les ports 54321 et 54322 sont libres"
    echo "3. Arrêtez d'autres instances de Supabase: supabase stop"
    echo "4. Redémarrez Docker Desktop"
    exit 1
fi
