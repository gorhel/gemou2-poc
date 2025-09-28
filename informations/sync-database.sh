#!/bin/bash

# Script pour synchroniser la base de données avec les dernières modifications
echo "🔄 Synchronisation de la base de données..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé."
    echo "   Installez-le avec: npm install -g supabase"
    exit 1
fi

# Vérifier si le projet est lié
if ! supabase status &> /dev/null; then
    echo "❌ Le projet n'est pas lié à Supabase."
    echo "   Exécutez: supabase link"
    exit 1
fi

echo "📋 Vérification de l'état actuel..."

# Vérifier les migrations en attente
echo "🔍 Vérification des migrations en attente..."
supabase migration list

echo ""
echo "📦 Application des migrations en attente..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Base de données synchronisée avec succès !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. Vérifiez que toutes les tables existent"
    echo "2. Testez la création d'événements avec des jeux"
    echo "3. Testez la participation aux événements"
    echo "4. Vérifiez que les données sont persistantes"
else
    echo "❌ Erreur lors de la synchronisation"
    echo ""
    echo "🔧 Solutions possibles :"
    echo "1. Vérifiez votre connexion à Supabase"
    echo "2. Vérifiez les permissions de votre projet"
    echo "3. Appliquez manuellement via le Dashboard Supabase"
    exit 1
fi
