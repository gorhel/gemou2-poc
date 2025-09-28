#!/bin/bash

# Script pour mettre à jour la table event_games existante
echo "🎮 Mise à jour de la table event_games..."

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

# Appliquer la migration de mise à jour
echo "📦 Application de la migration de mise à jour..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Table event_games mise à jour avec succès !"
    echo ""
    echo "📋 Modifications appliquées :"
    echo "   - Colonnes manquantes ajoutées (experience_level, estimated_duration, etc.)"
    echo "   - Index de performance créés"
    echo "   - Politiques RLS mises à jour"
    echo "   - Contraintes de sécurité appliquées"
    echo ""
    echo "🎯 Prochaines étapes :"
    echo "1. Testez la création d'événements avec des jeux"
    echo "2. Vérifiez que les jeux sont bien sauvegardés"
    echo "3. Testez la participation aux événements"
    echo "4. Vérifiez que les jeux s'affichent correctement"
else
    echo "❌ Erreur lors de la mise à jour de la table"
    echo ""
    echo "🔧 Solutions possibles :"
    echo "1. Vérifiez que Supabase est démarré (supabase start)"
    echo "2. Vérifiez les permissions de la base de données"
    echo "3. Appliquez manuellement via le Dashboard Supabase"
    exit 1
fi
