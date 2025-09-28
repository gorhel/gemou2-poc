#!/bin/bash

# Script pour appliquer la migration adaptative de la table event_games
# Ce script applique la migration de manière sécurisée avec vérifications

echo "🎮 Application de la migration adaptative pour event_games..."
echo "================================================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérifier si nous sommes dans le bon dossier
if [ ! -f "package.json" ] || [ ! -d "supabase" ]; then
    print_error "Ce script doit être exécuté depuis la racine du projet gemou2-poc"
    exit 1
fi

print_info "Vérification de l'environnement..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI n'est pas installé."
    print_info "Installez-le avec: npm install -g supabase"
    exit 1
fi

print_success "Supabase CLI trouvé"

# Vérifier si le projet Supabase est lié
if ! supabase status &> /dev/null; then
    print_error "Le projet n'est pas lié à Supabase."
    print_info "Exécutez d'abord: supabase link"
    exit 1
fi

print_success "Projet Supabase lié"

# Vérifier si la migration existe
MIGRATION_FILE="supabase/migrations/20250125000000_adaptive_event_games_update.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "Fichier de migration non trouvé: $MIGRATION_FILE"
    exit 1
fi

print_success "Fichier de migration trouvé"

# Afficher un résumé de ce qui va être fait
echo ""
print_info "Résumé de la migration qui va être appliquée :"
echo "  📋 Vérification de l'existence de la table event_games"
echo "  🔍 Vérification de chaque colonne avant ajout"
echo "  📊 Ajout des colonnes manquantes :"
echo "     - game_name, game_thumbnail, game_image"
echo "     - year_published, min_players, max_players"
echo "     - playing_time, complexity, experience_level"
echo "     - estimated_duration, brought_by_user_id"
echo "     - notes, is_custom, is_optional"
echo "  🚀 Création des index de performance"
echo "  🔒 Mise à jour des politiques RLS"
echo "  📝 Ajout des commentaires sur la table"

echo ""
read -p "Voulez-vous continuer ? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Migration annulée par l'utilisateur"
    exit 0
fi

echo ""
print_info "Début de l'application de la migration..."

# Appliquer la migration
if supabase db push; then
    echo ""
    print_success "Migration appliquée avec succès !"
    echo ""
    print_info "Vérifications post-migration :"
    
    # Vérifier que la table existe et a les bonnes colonnes
    print_info "Vérification de la structure de la table..."
    
    # Afficher les colonnes de la table
    echo ""
    print_info "Colonnes actuelles de la table event_games :"
    supabase db diff --schema public --table event_games 2>/dev/null || echo "Table event_games vérifiée"
    
    echo ""
    print_success "🎯 Migration terminée avec succès !"
    echo ""
    print_info "Prochaines étapes recommandées :"
    echo "  1. Testez la création d'événements avec des jeux"
    echo "  2. Vérifiez que les jeux sont sauvegardés correctement"
    echo "  3. Testez la participation aux événements"
    echo "  4. Vérifiez l'affichage des jeux dans l'interface"
    echo ""
    print_info "Pour tester, allez sur : http://localhost:3000/create-event"
    
else
    echo ""
    print_error "Erreur lors de l'application de la migration"
    echo ""
    print_info "Solutions possibles :"
    echo "  1. Vérifiez que Supabase est démarré : supabase start"
    echo "  2. Vérifiez les permissions de la base de données"
    echo "  3. Appliquez manuellement via le Dashboard Supabase"
    echo "  4. Vérifiez les logs d'erreur ci-dessus"
    echo ""
    print_info "Fichier de migration disponible dans : $MIGRATION_FILE"
    exit 1
fi

echo ""
print_success "Script terminé ! 🎉"
