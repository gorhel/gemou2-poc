#!/bin/bash

# Script de commit automatique pour Cursor
# Usage: ./auto-commit.sh "Message de commit"

# Vérifier si on est sur la branche main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Vous n'êtes pas sur la branche main. Branche actuelle: $CURRENT_BRANCH"
    read -p "Voulez-vous basculer sur main? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    else
        echo "❌ Annulé"
        exit 1
    fi
fi

# Message de commit par défaut si aucun n'est fourni
COMMIT_MESSAGE=${1:-"Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"}

# Ajouter tous les fichiers modifiés
echo "📝 Ajout des fichiers modifiés..."
git add .

# Vérifier s'il y a des changements à commiter
if git diff --staged --quiet; then
    echo "ℹ️  Aucun changement à commiter"
    exit 0
fi

# Afficher les changements
echo "📋 Changements à commiter:"
git diff --staged --name-only

# Commiter
echo "💾 Commit en cours..."
git commit -m "$COMMIT_MESSAGE"

# Pousser vers la branche distante
echo "🚀 Push vers la branche distante..."
git push origin main

echo "✅ Commit automatique terminé!"
echo "📝 Message: $COMMIT_MESSAGE"
echo "🌿 Branche: main"
