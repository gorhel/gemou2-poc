#!/bin/bash

# Script pour appliquer la migration de la table event_games
echo "🎮 Application de la migration event_games..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si le projet est lié
if ! supabase status &> /dev/null; then
    echo "❌ Le projet n'est pas lié à Supabase. Veuillez exécuter 'supabase link' d'abord."
    exit 1
fi

# Appliquer la migration
echo "📦 Application de la migration event_games..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration event_games appliquée avec succès !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. Vérifiez que la table 'event_games' est créée dans Supabase"
    echo "2. Testez la recherche de jeux dans le formulaire de création d'événement"
    echo "3. Testez l'ajout de jeux personnalisés"
    echo "4. Vérifiez que les jeux sont bien liés aux événements"
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi
