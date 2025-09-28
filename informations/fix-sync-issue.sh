#!/bin/bash

# Script pour résoudre les problèmes de synchronisation cloud/local
echo "🔧 Résolution des problèmes de synchronisation..."
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_info "Résolution des problèmes de synchronisation..."

# Option 1: Reset complet (ATTENTION: supprime toutes les données locales)
echo ""
print_warning "ATTENTION: Cette option va supprimer toutes vos données locales !"
read -p "Voulez-vous faire un reset complet ? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Reset complet en cours..."
    
    # Arrêter Supabase
    supabase stop 2>/dev/null || true
    
    # Supprimer le dossier supabase local
    rm -rf supabase/.branches
    rm -rf supabase/.temp
    
    # Redémarrer Supabase
    supabase start
    
    # Appliquer toutes les migrations
    supabase db reset --linked
    
    print_success "Reset complet terminé !"
    print_info "Vos données locales ont été synchronisées avec le cloud"
    
else
    print_info "Option alternative: Synchronisation manuelle..."
    
    # Option 2: Synchronisation manuelle
    echo ""
    print_info "Étapes pour synchroniser manuellement :"
    echo ""
    echo "1. 📋 Allez sur votre Dashboard Supabase"
    echo "2. 🔧 Ouvrez l'éditeur SQL"
    echo "3. 📝 Copiez et exécutez le contenu de :"
    echo "   supabase/migrations/20250125000001_sync_cloud_to_local.sql"
    echo ""
    echo "4. 🔍 Ou exécutez cette commande pour voir les différences :"
    echo "   supabase db diff --schema public"
    echo ""
    echo "5. 📊 Pour vérifier la structure de vos tables :"
    echo "   Exécutez le contenu de check-tables.sql dans l'éditeur SQL"
    echo ""
    
    read -p "Voulez-vous essayer la commande diff maintenant ? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Exécution de supabase db diff..."
        supabase db diff --schema public
    fi
fi

echo ""
print_info "Solutions alternatives si le problème persiste :"
echo ""
echo "🔧 Solution 1: Ignorer les erreurs et continuer"
echo "   - Les tables existantes ne seront pas recréées"
echo "   - Seules les nouvelles tables seront créées"
echo ""
echo "🔧 Solution 2: Supprimer manuellement les tables problématiques"
echo "   - Via Dashboard Supabase > Table Editor"
echo "   - Supprimez les tables qui causent des erreurs"
echo "   - Relancez les migrations"
echo ""
echo "🔧 Solution 3: Créer une nouvelle branche de migration"
echo "   - Copiez vos données importantes"
echo "   - Créez un nouveau projet Supabase"
echo "   - Appliquez les migrations depuis le début"
echo ""

print_success "Script terminé ! 🎉"
