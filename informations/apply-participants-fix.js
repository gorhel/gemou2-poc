#!/usr/bin/env node

/**
 * Script alternatif pour appliquer la correction du compteur de participants
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Correction du compteur de participants des événements');
console.log('==================================================\n');

// Vérifier si Supabase CLI est installé
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI détecté');
} catch (error) {
  console.log('❌ Supabase CLI n\'est pas installé');
  console.log('Installez-le avec: npm install -g supabase');
  process.exit(1);
}

// Vérifier si nous sommes dans le bon répertoire
const configPath = path.join(__dirname, 'supabase', 'config.toml');
if (!fs.existsSync(configPath)) {
  console.log('❌ Fichier supabase/config.toml non trouvé');
  console.log('Assurez-vous d\'être dans le répertoire racine du projet');
  process.exit(1);
}

console.log('✅ Répertoire de projet détecté');

// Vérifier que la migration existe
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250126000001_fix_participants_count.sql');
if (!fs.existsSync(migrationPath)) {
  console.log('❌ Migration 20250126000001_fix_participants_count.sql non trouvée');
  process.exit(1);
}

console.log('✅ Migration trouvée');
console.log('\n📋 Migration à appliquer: fix_participants_count');
console.log('');

try {
  // Appliquer la migration
  console.log('🚀 Application de la migration...');
  execSync('supabase db push', { stdio: 'inherit' });
  
  console.log('\n✅ Migration appliquée avec succès!');
  console.log('\n🎯 Fonctionnalités ajoutées:');
  console.log('  • Mise à jour automatique du compteur de participants');
  console.log('  • Triggers sur INSERT/UPDATE/DELETE des participations');
  console.log('  • Synchronisation de tous les compteurs existants');
  console.log('  • Fonctions de vérification de cohérence');
  console.log('\n📊 Pour vérifier la cohérence des compteurs:');
  console.log('  SELECT * FROM check_participants_count_consistency();');
  console.log('\n🔄 Pour synchroniser manuellement tous les compteurs:');
  console.log('  SELECT sync_all_event_participants_count();');
  console.log('');
  
} catch (error) {
  console.log('\n❌ Erreur lors de l\'application de la migration');
  console.log('Détails de l\'erreur:', error.message);
  process.exit(1);
}

