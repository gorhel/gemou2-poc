#!/bin/bash

# Script de déploiement pour Gémou2 POC
# Crée les branches OUT-132 et OUT-144, puis déploie sur main

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement Gémou2 POC - OUT-132 & OUT-144"
echo "=============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si Git est initialisé
if [ ! -d ".git" ]; then
    log_info "Initialisation du dépôt Git..."
    git init
    log_success "Dépôt Git initialisé"
fi

# Configuration Git si nécessaire
log_info "Configuration Git..."
git config user.name "Gémou2 Developer" || true
git config user.email "dev@gemou2.com" || true

# Ajouter tous les fichiers
log_info "Ajout des fichiers au staging..."
git add .

# Commit initial si nécessaire
if [ -z "$(git log --oneline 2>/dev/null)" ]; then
    log_info "Création du commit initial..."
    git commit -m "feat: initial commit - Gémou2 POC setup

- Structure de base du projet
- Configuration Next.js et Expo
- Composants UI de base
- Configuration Supabase"
    log_success "Commit initial créé"
fi

# Créer la branche OUT-144 (Onboarding)
log_info "Création de la branche OUT-144 (Onboarding)..."
if git show-ref --verify --quiet refs/heads/OUT-144; then
    log_warning "Branche OUT-144 existe déjà, passage à OUT-144"
    git checkout OUT-144
else
    git checkout -b OUT-144
    log_success "Branche OUT-144 créée"
fi

# Commiter les modifications OUT-144
log_info "Commit des modifications OUT-144..."
git add .
git commit -m "feat(OUT-144): onboarding comme route par défaut

- Redirection automatique vers /onboarding au premier lancement
- Interface d'onboarding pour web et mobile
- Stockage persistant de l'état onboarding
- Modification des redirections post-onboarding
- Documentation complète des modifications

Fixes: Route /onboarding comme point d'entrée principal"

log_success "Modifications OUT-144 commitées"

# Créer la branche OUT-132 (Login)
log_info "Création de la branche OUT-132 (Login)..."
if git show-ref --verify --quiet refs/heads/OUT-132; then
    log_warning "Branche OUT-132 existe déjà, passage à OUT-132"
    git checkout OUT-132
else
    git checkout -b OUT-132
    log_success "Branche OUT-132 créée"
fi

# Commiter les modifications OUT-132
log_info "Commit des modifications OUT-132..."
git add .
git commit -m "feat(OUT-132): page de connexion US-AUTH-008

- Page de connexion dédiée avec validation complète
- Connexion sociale (Google, Facebook) avec OAuth
- Page de réinitialisation mot de passe
- Page d'inscription utilisateur
- Case 'Se souvenir de moi' pour session persistante
- Messages d'erreur spécifiques et sécurisés
- Protection contre les attaques par force brute
- Redirection vers page d'origine après connexion
- Option 'Continuer en tant qu'invité'
- Interface responsive et accessible
- Callback OAuth pour gestion des retours

User Story: US-AUTH-008 - Se connecter
Tous les critères d'acceptation implémentés ✅"

log_success "Modifications OUT-132 commitées"

# Retourner sur main et fusionner
log_info "Retour sur la branche main..."
git checkout -b main 2>/dev/null || git checkout main

log_info "Fusion des branches vers main..."

# Fusionner OUT-144
log_info "Fusion de OUT-144..."
git merge OUT-144 --no-ff -m "merge(OUT-144): intégration onboarding par défaut

- Route /onboarding comme point d'entrée
- Interface d'introduction interactive
- Support multi-plateforme (web/mobile)"

# Fusionner OUT-132
log_info "Fusion de OUT-132..."
git merge OUT-132 --no-ff -m "merge(OUT-132): intégration page de connexion

- Page de connexion complète US-AUTH-008
- Authentification sociale et email
- Gestion des sessions et sécurité
- Interface utilisateur moderne"

log_success "Branches fusionnées avec succès"

# Créer un tag de version
VERSION="v0.2.0"
log_info "Création du tag $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION: Onboarding + Login

- OUT-144: Route onboarding par défaut
- OUT-132: Page de connexion US-AUTH-008
- Interface moderne et responsive
- Authentification complète
- Support multi-plateforme"

log_success "Tag $VERSION créé"

# Afficher le statut final
log_info "Statut final du dépôt:"
echo ""
git log --oneline -5
echo ""
git branch -v
echo ""
git tag --list

# Instructions de déploiement
echo ""
log_success "🎉 Déploiement terminé avec succès!"
echo ""
log_info "Prochaines étapes:"
echo "1. Tester l'application:"
echo "   npm run dev:web      # Test web sur localhost:3000"
echo "   npm run dev:mobile   # Test mobile avec Expo"
echo ""
echo "2. Déployer en production:"
echo "   - Web: Vercel ou Netlify"
echo "   - Mobile: EAS Build"
echo ""
echo "3. Configurer Supabase:"
echo "   - Variables d'environnement"
echo "   - OAuth providers (Google, Facebook)"
echo "   - Base de données"
echo ""
log_warning "N'oubliez pas de configurer les variables d'environnement pour la production!"

echo ""
log_success "Déploiement Gémou2 POC terminé! 🎲"

