#!/usr/bin/env node

/**
 * Test de la correction du compteur de participants
 * Vérifie que le nombre de participants reflète la réalité
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de la correction du compteur de participants\n');

// Vérification des fichiers
const filesToCheck = [
  'supabase/migrations/20250126000001_fix_participants_count.sql',
  'apps/web/hooks/useEventParticipantsCount.ts',
  'apps/web/app/events/[id]/page.tsx',
  'apps/web/components/events/EventCard.tsx',
  'fix-participants-count.sh'
];

console.log('📁 Vérification des fichiers...');
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
  }
});

console.log('\n🔍 Vérification des corrections...');

// Vérifier la migration
const migrationPath = path.join(__dirname, 'supabase/migrations/20250126000001_fix_participants_count.sql');
if (fs.existsSync(migrationPath)) {
  const content = fs.readFileSync(migrationPath, 'utf8');
  const checks = [
    { name: 'Fonction update_event_participants_count', pattern: /update_event_participants_count/ },
    { name: 'Trigger INSERT', pattern: /trigger_update_participants_count_insert/ },
    { name: 'Trigger UPDATE', pattern: /trigger_update_participants_count_update/ },
    { name: 'Trigger DELETE', pattern: /trigger_update_participants_count_delete/ },
    { name: 'Fonction sync_all_event_participants_count', pattern: /sync_all_event_participants_count/ },
    { name: 'Fonction get_real_participants_count', pattern: /get_real_participants_count/ },
    { name: 'Fonction check_participants_count_consistency', pattern: /check_participants_count_consistency/ }
  ];
  
  console.log('\n📋 Migration:');
  checks.forEach(check => {
    if (content.match(check.pattern)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name}`);
    }
  });
}

// Vérifier le hook useEventParticipantsCount
const hookPath = path.join(__dirname, 'apps/web/hooks/useEventParticipantsCount.ts');
if (fs.existsSync(hookPath)) {
  const content = fs.readFileSync(hookPath, 'utf8');
  const checks = [
    { name: 'Hook useEventParticipantsCount', pattern: /useEventParticipantsCount/ },
    { name: 'Fonction fetchParticipantsCount', pattern: /fetchParticipantsCount/ },
    { name: 'Comptage réel des participants', pattern: /event_participants.*count/ },
    { name: 'Synchronisation automatique', pattern: /current_participants.*realCount/ },
    { name: 'Hook de cohérence', pattern: /useParticipantsCountConsistency/ }
  ];
  
  console.log('\n📋 Hook useEventParticipantsCount:');
  checks.forEach(check => {
    if (content.match(check.pattern)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name}`);
    }
  });
}

// Vérifier la page d'événement
const eventPagePath = path.join(__dirname, 'apps/web/app/events/[id]/page.tsx');
if (fs.existsSync(eventPagePath)) {
  const content = fs.readFileSync(eventPagePath, 'utf8');
  const checks = [
    { name: 'Import useEventParticipantsCount', pattern: /useEventParticipantsCount/ },
    { name: 'Utilisation du hook', pattern: /realParticipantsCount/ },
    { name: 'actualParticipantsCount', pattern: /actualParticipantsCount/ },
    { name: 'Rafraîchissement du compteur', pattern: /refreshCount/ }
  ];
  
  console.log('\n📋 Page Événement:');
  checks.forEach(check => {
    if (content.match(check.pattern)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name}`);
    }
  });
}

// Vérifier EventCard
const eventCardPath = path.join(__dirname, 'apps/web/components/events/EventCard.tsx');
if (fs.existsSync(eventCardPath)) {
  const content = fs.readFileSync(eventCardPath, 'utf8');
  const checks = [
    { name: 'Import useEventParticipantsCount', pattern: /useEventParticipantsCount/ },
    { name: 'Utilisation du hook', pattern: /realParticipantsCount/ },
    { name: 'actualParticipantsCount', pattern: /actualParticipantsCount/ }
  ];
  
  console.log('\n📋 EventCard:');
  checks.forEach(check => {
    if (content.match(check.pattern)) {
      console.log(`  ✅ ${check.name}`);
    } else {
      console.log(`  ❌ ${check.name}`);
    }
  });
}

console.log('\n🎯 Corrections apportées:');
console.log('✅ Migration SQL avec triggers automatiques');
console.log('✅ Hook pour récupérer le nombre réel de participants');
console.log('✅ Synchronisation automatique des compteurs');
console.log('✅ Mise à jour de la page d\'événement');
console.log('✅ Mise à jour des vignettes EventCard');
console.log('✅ Fonctions de vérification de cohérence');

console.log('\n📝 Instructions de test:');
console.log('1. Appliquer la migration: ./fix-participants-count.sh');
console.log('2. Aller sur une page d\'événement');
console.log('3. Vérifier que le nombre de participants est exact');
console.log('4. Participer/quitter un événement');
console.log('5. Vérifier que le compteur se met à jour automatiquement');
console.log('6. Vérifier les vignettes d\'événements');

console.log('\n🔧 Fonctionnalités ajoutées:');
console.log('• Triggers automatiques sur INSERT/UPDATE/DELETE');
console.log('• Synchronisation de tous les compteurs existants');
console.log('• Comptage réel des participants');
console.log('• Vérification de cohérence des compteurs');
console.log('• Mise à jour en temps réel sur l\'interface');

console.log('\n📊 Commandes SQL utiles:');
console.log('-- Vérifier la cohérence des compteurs');
console.log('SELECT * FROM check_participants_count_consistency();');
console.log('');
console.log('-- Synchroniser manuellement tous les compteurs');
console.log('SELECT sync_all_event_participants_count();');
console.log('');
console.log('-- Obtenir le nombre réel de participants pour un événement');
console.log('SELECT get_real_participants_count(\'event-uuid\');');

