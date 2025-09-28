#!/bin/bash

# Script pour configurer les variables d'environnement pour Supabase local
echo "🔧 Configuration des variables d'environnement pour Supabase local..."

# Vérifier si Supabase local est démarré
if ! supabase status &> /dev/null; then
    echo "❌ Supabase local n'est pas démarré."
    echo "   Démarrez-le d'abord avec: supabase start"
    exit 1
fi

# Récupérer les informations de connexion
echo "📋 Récupération des informations de connexion..."

API_URL=$(supabase status | grep "API URL" | awk '{print $3}')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
SERVICE_ROLE_KEY=$(supabase status | grep "service_role key" | awk '{print $3}')

if [ -z "$API_URL" ] || [ -z "$ANON_KEY" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Impossible de récupérer les informations de connexion."
    echo "   Vérifiez que Supabase local est démarré correctement."
    exit 1
fi

echo "✅ Informations de connexion récupérées :"
echo "   - API URL: $API_URL"
echo "   - Anon Key: ${ANON_KEY:0:20}..."
echo "   - Service Role Key: ${SERVICE_ROLE_KEY:0:20}..."

# Créer le fichier .env.local
echo "📝 Création du fichier .env.local..."

cat > .env.local << EOF
# Supabase Local Configuration
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# Database URL for direct access
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
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
echo "🎯 Prochaines étapes :"
echo "1. Vérifiez que les variables sont correctes"
echo "2. Redémarrez votre application Next.js"
echo "3. Testez la connexion à Supabase local"
echo "4. Vérifiez que les migrations sont appliquées"

echo ""
echo "🚀 Pour démarrer l'application :"
echo "   cd apps/web && npm run dev"
