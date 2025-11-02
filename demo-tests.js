#!/usr/bin/env node

/**
 * Script de démonstration du système de tests automatisés
 * 
 * Usage: node demo-tests.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Afficher le header de démonstration
 */
function showHeader() {
  log(`${colors.bright}${colors.blue}🎭 DÉMONSTRATION DU SYSTÈME DE TESTS AUTOMATISÉS${colors.reset}`);
  log(`${'='.repeat(60)}`, 'cyan');
  log('');
  log(`${colors.bright}${colors.yellow}🎯 Objectif:${colors.reset} Vérifier que les fonctionnalités existantes ne sont pas cassées`);
  log(`${colors.bright}${colors.yellow}⚡ Performance:${colors.reset} Tests parallèles optimisés (< 5 secondes)`);
  log(`${colors.bright}${colors.yellow}🔍 Couverture:${colors.reset} Composants, permissions, routes, hooks`);
  log(`${colors.bright}${colors.yellow}📊 Rapports:${colors.reset} JSON détaillés avec métriques`);
  log('');
}

/**
 * Attendre un délai
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exécuter une commande avec animation
 */
async function runCommand(command, description, duration = 2000) {
  log(`${colors.cyan}▶️  ${description}...${colors.reset}`);
  
  // Animation de progression
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIndex = 0;
  
  const animation = setInterval(() => {
    process.stdout.write(`\r${colors.yellow}${frames[frameIndex]} ${description}...${colors.reset}`);
    frameIndex = (frameIndex + 1) % frames.length;
  }, 100);
  
  await delay(duration);
  clearInterval(animation);
  
  log(`\r✅ ${description} terminé${colors.reset}`);
}

/**
 * Afficher les statistiques du projet
 */
function showProjectStats() {
  log(`\n${colors.bright}${colors.blue}📊 STATISTIQUES DU PROJET GÉMOU2${colors.reset}`);
  log(`${'='.repeat(40)}`, 'cyan');
  
  const webAppPath = path.join(__dirname, 'apps', 'web');
  
  // Compter les fichiers
  const countFiles = (dir, extension) => {
    try {
      const files = fs.readdirSync(dir, { recursive: true });
      return files.filter(file => file.endsWith(extension)).length;
    } catch {
      return 0;
    }
  };
  
  const tsxFiles = countFiles(webAppPath, '.tsx');
  const tsFiles = countFiles(webAppPath, '.ts');
  const jsFiles = countFiles(webAppPath, '.js');
  const cssFiles = countFiles(webAppPath, '.css');
  
  log(`📄 Fichiers React (TSX): ${tsxFiles}`, 'green');
  log(`📄 Fichiers TypeScript (TS): ${tsFiles}`, 'green');
  log(`📄 Fichiers JavaScript (JS): ${jsFiles}`, 'green');
  log(`🎨 Fichiers CSS: ${cssFiles}`, 'green');
  log(`📦 Total fichiers: ${tsxFiles + tsFiles + jsFiles + cssFiles}`, 'bright');
  
  // Compter les composants
  const componentsPath = path.join(webAppPath, 'components');
  const componentsCount = countFiles(componentsPath, '.tsx');
  log(`🧩 Composants: ${componentsCount}`, 'cyan');
  
  // Compter les routes
  const appPath = path.join(webAppPath, 'app');
  const routesCount = countFiles(appPath, 'page.tsx');
  log(`🛣️  Routes: ${routesCount}`, 'cyan');
  
  // Compter les hooks
  const hooksPath = path.join(webAppPath, 'hooks');
  const hooksCount = countFiles(hooksPath, '.ts');
  log(`🎣 Hooks: ${hooksCount}`, 'cyan');
}

/**
 * Afficher les tests disponibles
 */
function showAvailableTests() {
  log(`\n${colors.bright}${colors.blue}🧪 TESTS DISPONIBLES${colors.reset}`);
  log(`${'='.repeat(30)}`, 'cyan');
  
  const tests = [
    { name: 'Tests des Composants', file: 'test-components.js', count: '45+ tests' },
    { name: 'Tests des Permissions', file: 'test-permissions.js', count: '15+ tests' },
    { name: 'Script Principal', file: 'run-tests.js', count: 'Tous les tests' },
    { name: 'Ajout de Tests', file: 'add-test.js', count: 'Menu interactif' }
  ];
  
  tests.forEach(test => {
    const exists = fs.existsSync(test.file);
    const status = exists ? '✅' : '❌';
    log(`${status} ${test.name} (${test.count})`, exists ? 'green' : 'red');
  });
}

/**
 * Simuler l'exécution des tests
 */
async function simulateTests() {
  log(`\n${colors.bright}${colors.blue}🚀 SIMULATION D'EXÉCUTION DES TESTS${colors.reset}`);
  log(`${'='.repeat(45)}`, 'cyan');
  
  const testSteps = [
    { name: 'Vérification des routes principales', duration: 800 },
    { name: 'Contrôle des composants UI', duration: 600 },
    { name: 'Validation des composants métier', duration: 700 },
    { name: 'Tests des hooks personnalisés', duration: 400 },
    { name: 'Vérification des permissions', duration: 500 },
    { name: 'Contrôles d\'authentification', duration: 450 },
    { name: 'Tests de sécurité RLS', duration: 350 },
    { name: 'Génération des rapports', duration: 300 }
  ];
  
  for (const step of testSteps) {
    await runCommand(null, step.name, step.duration);
  }
  
  // Afficher les résultats simulés
  log(`\n${colors.bright}${colors.green}✅ TESTS TERMINÉS AVEC SUCCÈS${colors.reset}`);
  log(`${'='.repeat(35)}`, 'green');
  log(`📊 Tests exécutés: 60`, 'green');
  log(`✅ Succès: 58 (96.7%)`, 'green');
  log(`❌ Échecs: 2 (3.3%)`, 'yellow');
  log(`⏱️  Durée totale: 4.1s`, 'green');
  log(`⚡ Durée moyenne: 68ms par test`, 'green');
}

/**
 * Afficher les exemples d'utilisation
 */
function showUsageExamples() {
  log(`\n${colors.bright}${colors.blue}💡 EXEMPLES D'UTILISATION${colors.reset}`);
  log(`${'='.repeat(30)}`, 'cyan');
  
  const examples = [
    {
      command: 'node run-tests.js',
      description: 'Exécuter tous les tests'
    },
    {
      command: 'node run-tests.js --verbose',
      description: 'Mode verbeux avec détails'
    },
    {
      command: 'node test-components.js --route=dashboard',
      description: 'Tester seulement le dashboard'
    },
    {
      command: 'node test-permissions.js',
      description: 'Vérifier la sécurité uniquement'
    },
    {
      command: 'node add-test.js',
      description: 'Ajouter de nouveaux tests'
    }
  ];
  
  examples.forEach(example => {
    log(`\n${colors.yellow}${example.command}${colors.reset}`);
    log(`   ${example.description}`, 'cyan');
  });
}

/**
 * Afficher les rapports générés
 */
function showGeneratedReports() {
  log(`\n${colors.bright}${colors.blue}📄 RAPPORTS GÉNÉRÉS${colors.reset}`);
  log(`${'='.repeat(25)}`, 'cyan');
  
  const reports = [
    'test-global-report.json',
    'test-report.json',
    'test-permissions-report.json'
  ];
  
  reports.forEach(report => {
    const exists = fs.existsSync(report);
    const status = exists ? '✅' : '⏳';
    log(`${status} ${report}`, exists ? 'green' : 'yellow');
  });
  
  if (reports.every(report => !fs.existsSync(report))) {
    log(`\n${colors.yellow}💡 Les rapports seront générés lors de l'exécution des tests${colors.reset}`);
  }
}

/**
 * Afficher les avantages du système
 */
function showBenefits() {
  log(`\n${colors.bright}${colors.blue}🎯 AVANTAGES DU SYSTÈME${colors.reset}`);
  log(`${'='.repeat(35)}`, 'cyan');
  
  const benefits = [
    { icon: '🚀', text: 'Détection rapide des régressions' },
    { icon: '🔍', text: 'Vérification automatique des composants' },
    { icon: '🔒', text: 'Contrôle de la sécurité et des permissions' },
    { icon: '⚡', text: 'Tests parallèles optimisés' },
    { icon: '📊', text: 'Rapports détaillés avec métriques' },
    { icon: '🔧', text: 'Extension facile avec nouveaux tests' },
    { icon: '🎯', text: 'Tests ciblés par route ou composant' },
    { icon: '🛡️', text: 'Protection contre les régressions' }
  ];
  
  benefits.forEach(benefit => {
    log(`${benefit.icon} ${benefit.text}`, 'green');
  });
}

/**
 * Fonction principale de démonstration
 */
async function runDemo() {
  showHeader();
  await delay(1000);
  
  showProjectStats();
  await delay(1500);
  
  showAvailableTests();
  await delay(1000);
  
  await simulateTests();
  await delay(2000);
  
  showGeneratedReports();
  await delay(1000);
  
  showUsageExamples();
  await delay(1500);
  
  showBenefits();
  await delay(1000);
  
  log(`\n${colors.bright}${colors.green}🎉 DÉMONSTRATION TERMINÉE${colors.reset}`);
  log(`${'='.repeat(35)}`, 'green');
  log(`\n${colors.yellow}💡 Pour lancer les vrais tests:${colors.reset}`);
  log(`${colors.cyan}   node run-tests.js${colors.reset}`);
  log(`\n${colors.yellow}📚 Pour plus d'informations:${colors.reset}`);
  log(`${colors.cyan}   cat TESTS_DOCUMENTATION.md${colors.reset}`);
}

// Point d'entrée
runDemo().catch(error => {
  log(`\n${colors.red}💥 Erreur lors de la démonstration: ${error.message}${colors.reset}`, 'red');
  process.exit(1);
});
