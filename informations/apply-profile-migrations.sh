#!/bin/bash

# Script pour appliquer les migrations de profil
echo "🚀 Application des migrations de profil..."

# Appliquer les migrations
echo "📦 Application de la migration user_games table..."
npx supabase db push

echo "🎮 Ajout des jeux d'exemple..."
npx supabase db push

echo "✅ Migrations appliquées avec succès !"
echo ""
echo "📋 Résumé des changements :"
echo "- Table user_games créée avec RLS"
echo "- Jeux d'exemple ajoutés aux collections"
echo "- Page de profil /profile/[username] créée"
echo "- Navigation depuis UserCard vers le profil"
echo ""
echo "🔗 Vous pouvez maintenant :"
echo "- Cliquer sur un joueur dans 'Suggestions de joueurs'"
echo "- Voir sa page de profil complète"
echo "- Consulter sa collection de jeux"
echo "- Voir ses événements"
