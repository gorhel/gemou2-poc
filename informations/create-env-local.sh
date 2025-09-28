#!/bin/bash

# Script pour créer le fichier .env.local avec votre configuration Supabase cloud
echo "☁️  Création du fichier .env.local avec votre configuration Supabase cloud..."

# Vérifier si le fichier .env.local existe déjà
if [ -f ".env.local" ]; then
    echo "⚠️  Le fichier .env.local existe déjà."
    read -p "Voulez-vous le remplacer ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuration annulée."
        exit 1
    fi
fi

# Créer le fichier .env.local avec votre configuration
cat > .env.local << 'EOF'
# Supabase Cloud Configuration (par défaut)
NEXT_PUBLIC_SUPABASE_URL=https://qpnofwgxjgvmpwdrhzid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ2OTk2MywiZXhwIjoyMDY5MDQ1OTYzfQ.bIXUwndp8BDm6-q49J05hq4tt-V57v1GKxzLBG8TTvI

# Configuration Supabase Local (optionnel)
# Décommentez et configurez si vous voulez utiliser Supabase local
# NEXT_PUBLIC_USE_SUPABASE_LOCAL=true
# NEXT_PUBLIC_SUPABASE_URL_LOCAL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL=your-local-anon-key

# Database URL for direct access
DATABASE_URL=https://qpnofwgxjgvmpwdrhzid.supabase.co
EOF

echo "✅ Fichier .env.local créé avec succès !"

# Vérifier que le fichier existe
if [ -f ".env.local" ]; then
    echo "📋 Contenu du fichier .env.local :"
    echo "----------------------------------------"
    cat .env.local
    echo "----------------------------------------"
else
    echo "❌ Erreur lors de la création du fichier .env.local"
    exit 1
fi

echo ""
echo "🎯 Configuration terminée !"
echo ""
echo "📋 Mode de fonctionnement :"
echo "   - Par défaut : Utilise Supabase Cloud"
echo "   - Pour utiliser Supabase Local : Décommentez les lignes LOCAL"
echo ""
echo "🚀 Pour démarrer l'application :"
echo "   cd apps/web && npm run dev"
echo ""
echo "🧪 Pour tester la connexion :"
echo "   node test-supabase-cloud.js"
