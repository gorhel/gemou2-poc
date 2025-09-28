#!/bin/bash

# Script pour configurer le projet avec Supabase Cloud existant
echo "☁️  Configuration avec Supabase Cloud existant..."

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

echo "📋 Configuration de Supabase Cloud..."
echo ""
echo "Vous devez récupérer les informations suivantes depuis votre projet Supabase :"
echo "1. Allez sur https://supabase.com"
echo "2. Sélectionnez votre projet"
echo "3. Allez dans Settings > API"
echo "4. Copiez les valeurs suivantes :"
echo ""

# Demander les informations
read -p "URL de votre projet Supabase (ex: https://xxx.supabase.co): " SUPABASE_URL
read -p "Clé publique (anon key): " SUPABASE_ANON_KEY
read -p "Clé de service (service role key): " SUPABASE_SERVICE_ROLE_KEY

# Valider les entrées
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Toutes les informations sont requises."
    exit 1
fi

# Créer le fichier .env.local
echo "📝 Création du fichier .env.local..."

cat > .env.local << EOF
# Supabase Cloud Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Database URL for direct access (optionnel)
DATABASE_URL=$SUPABASE_URL
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
echo "3. Testez la connexion à Supabase cloud"
echo "4. Vérifiez que les migrations sont appliquées"

echo ""
echo "🚀 Pour démarrer l'application :"
echo "   cd apps/web && npm run dev"

echo ""
echo "🧪 Pour tester la connexion :"
echo "   node test-supabase-cloud.js"
