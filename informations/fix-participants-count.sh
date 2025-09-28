#!/bin/bash

echo "🔧 Correction du compteur de participants des événements"
echo "=================================================="

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "Installez-le avec: npm install -g supabase"
    exit 1
fi

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Fichier supabase/config.toml non trouvé"
    echo "Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
fi

echo "📋 Migration à appliquer: fix_participants_count"
echo ""

# Appliquer la migration
echo "🚀 Application de la migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration appliquée avec succès!"
    echo ""
    echo "🎯 Fonctionnalités ajoutées:"
    echo "  • Mise à jour automatique du compteur de participants"
    echo "  • Triggers sur INSERT/UPDATE/DELETE des participations"
    echo "  • Synchronisation de tous les compteurs existants"
    echo "  • Fonctions de vérification de cohérence"
    echo ""
    echo "📊 Pour vérifier la cohérence des compteurs:"
    echo "  SELECT * FROM check_participants_count_consistency();"
    echo ""
    echo "🔄 Pour synchroniser manuellement tous les compteurs:"
    echo "  SELECT sync_all_event_participants_count();"
    echo ""
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi

