#!/bin/bash

# Script pour appliquer la migration du storage des images d'événements
echo "🚀 Application de la migration du storage des images d'événements..."

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
echo "📦 Application de la migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration appliquée avec succès !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. Vérifiez que le bucket 'event-images' est créé dans Supabase Storage"
    echo "2. Testez la création d'événements avec upload d'images"
    echo "3. Vérifiez que les images sont accessibles publiquement"
else
    echo "❌ Erreur lors de l'application de la migration"
    exit 1
fi
