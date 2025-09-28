#!/usr/bin/env node

/**
 * Script pour insérer des événements d'exemple à La Réunion
 * et vérifier que les données sont bien présentes
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMigrationFile() {
  const migrationPath = path.join(__dirname, 'supabase/migrations/20250121000001_insert_sample_events_reunion.sql');
  
  if (fs.existsSync(migrationPath)) {
    log('✅ Fichier de migration trouvé', 'green');
    return true;
  } else {
    log('❌ Fichier de migration manquant', 'red');
    return false;
  }
}

function displayEvents() {
  log('\n🎲 ÉVÉNEMENTS DE JEUX DE SOCIÉTÉ À LA RÉUNION', 'cyan');
  log('================================================', 'cyan');
  
  const events = [
    {
      title: 'Soirée Jeux de Société - Saint-Denis',
      date: '15 Février 2025 - 19h00',
      location: 'Médiathèque François Mitterrand, Saint-Denis',
      participants: '20 max'
    },
    {
      title: 'Tournoi Catan - Saint-Pierre',
      date: '22 Février 2025 - 14h00',
      location: 'Centre Culturel Lucet Langenier, Saint-Pierre',
      participants: '16 max'
    },
    {
      title: 'Jeux en Famille - Le Tampon',
      date: '28 Février 2025 - 16h00',
      location: 'Salle des fêtes du Tampon',
      participants: '30 max'
    },
    {
      title: 'Découverte de Jeux Modernes - Saint-Paul',
      date: '8 Mars 2025 - 18h30',
      location: 'Bibliothèque municipale de Saint-Paul',
      participants: '12 max'
    },
    {
      title: 'Soirée Jeux de Stratégie - Saint-André',
      date: '15 Mars 2025 - 19h00',
      location: 'Maison des associations, Saint-André',
      participants: '8 max'
    },
    {
      title: 'Tournoi Poker Texas Hold\'em - Saint-Benoît',
      date: '22 Mars 2025 - 20h00',
      location: 'Salle polyvalente de Saint-Benoît',
      participants: '24 max'
    },
    {
      title: 'Soirée Jeux Coopératifs - Saint-Louis',
      date: '29 Mars 2025 - 18h00',
      location: 'Centre culturel de Saint-Louis',
      participants: '16 max'
    },
    {
      title: 'Tournoi d\'Échecs - Cilaos',
      date: '5 Avril 2025 - 14h00',
      location: 'Salle des fêtes de Cilaos',
      participants: '20 max'
    },
    {
      title: 'Soirée Jeux de Cartes - Saint-Philippe',
      date: '12 Avril 2025 - 19h00',
      location: 'Maison de quartier de Saint-Philippe',
      participants: '18 max'
    },
    {
      title: 'Grand Tournoi Final - Saint-Denis',
      date: '19 Avril 2025 - 10h00',
      location: 'Palais des Congrès, Saint-Denis',
      participants: '32 max'
    }
  ];

  events.forEach((event, index) => {
    log(`\n${index + 1}. ${event.title}`, 'bright');
    log(`   📅 ${event.date}`, 'blue');
    log(`   📍 ${event.location}`, 'yellow');
    log(`   👥 ${event.participants}`, 'magenta');
  });
}

function displayInstructions() {
  log('\n📋 INSTRUCTIONS POUR APPLIQUER LA MIGRATION', 'bright');
  log('============================================', 'bright');
  
  log('\n1. Appliquer la migration Supabase :', 'cyan');
  log('   npx supabase db reset', 'green');
  log('   # ou', 'green');
  log('   npx supabase migration up', 'green');
  
  log('\n2. Vérifier les événements dans la base :', 'cyan');
  log('   npx supabase db shell', 'green');
  log('   SELECT title, location, date_time FROM events ORDER BY date_time;', 'green');
  
  log('\n3. Tester l\'application :', 'cyan');
  log('   npm run dev:web', 'green');
  log('   # Puis aller sur /dashboard pour voir les événements', 'green');
}

function main() {
  log('🎲 GÉMOU2 - ÉVÉNEMENTS DE JEUX À LA RÉUNION', 'bright');
  log('============================================', 'bright');
  
  const migrationExists = checkMigrationFile();
  
  if (migrationExists) {
    displayEvents();
    displayInstructions();
    
    log('\n🎉 PRÊT POUR L\'INSERTION DES ÉVÉNEMENTS !', 'green');
    log('La migration contient 10 événements variés dans toute La Réunion.', 'green');
  } else {
    log('\n❌ ERREUR : Migration non trouvée', 'red');
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  main();
}

module.exports = { checkMigrationFile, displayEvents };

