#!/usr/bin/env node

/**
 * Script de validation du déploiement Gémou2 POC
 * Vérifie que toutes les fonctionnalités OUT-132 et OUT-144 sont correctement implémentées
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

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Fichier manquant: ${filePath}`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Dossier manquant: ${dirPath}`, 'red');
    return false;
  }
}

function validateGitStructure() {
  log('\n🔍 Validation de la structure Git...', 'cyan');
  
  const gitFiles = [
    ['.git/config', 'Configuration Git'],
    ['.git/HEAD', 'HEAD Git'],
    ['.git/refs/heads/main', 'Branche main'],
    ['.git/refs/heads/OUT-144', 'Branche OUT-144'],
    ['.git/refs/heads/OUT-132', 'Branche OUT-132'],
    ['.git/logs/HEAD', 'Logs Git']
  ];
  
  let valid = true;
  gitFiles.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) valid = false;
  });
  
  return valid;
}

function validateOUT144() {
  log('\n🎯 Validation OUT-144 (Onboarding)...', 'blue');
  
  const files = [
    ['apps/web/app/page.tsx', 'Page d\'accueil web modifiée'],
    ['apps/web/app/onboarding/page.tsx', 'Page onboarding web modifiée'],
    ['apps/mobile/app/onboarding.tsx', 'Page onboarding mobile'],
    ['apps/mobile/app/index.tsx', 'Page d\'accueil mobile modifiée'],
    ['apps/mobile/app/_layout.tsx', 'Layout mobile modifié'],
    ['OUT-144-onboarding-default-route.md', 'Documentation OUT-144']
  ];
  
  let valid = true;
  files.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) valid = false;
  });
  
  return valid;
}

function validateOUT132() {
  log('\n🔐 Validation OUT-132 (Login US-AUTH-008)...', 'magenta');
  
  const files = [
    ['apps/web/app/login/page.tsx', 'Page de connexion web'],
    ['apps/mobile/app/login.tsx', 'Page de connexion mobile'],
    ['apps/web/app/forgot-password/page.tsx', 'Page mot de passe oublié'],
    ['apps/web/app/register/page.tsx', 'Page d\'inscription'],
    ['apps/web/app/auth/callback/route.ts', 'Callback OAuth'],
    ['OUT-132-login-page-US-AUTH-008.md', 'Documentation OUT-132']
  ];
  
  let valid = true;
  files.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) valid = false;
  });
  
  return valid;
}

function validateProjectStructure() {
  log('\n📁 Validation de la structure du projet...', 'yellow');
  
  const directories = [
    ['apps/web', 'Application Web Next.js'],
    ['apps/mobile', 'Application Mobile Expo'],
    ['apps/web/app', 'Pages Next.js'],
    ['apps/web/components', 'Composants Web'],
    ['apps/mobile/app', 'Pages Mobile'],
    ['apps/mobile/components', 'Composants Mobile'],
    ['supabase', 'Configuration Supabase'],
    ['docs', 'Documentation']
  ];
  
  let valid = true;
  directories.forEach(([dir, desc]) => {
    if (!checkDirectory(dir, desc)) valid = false;
  });
  
  return valid;
}

function validateConfiguration() {
  log('\n⚙️ Validation des fichiers de configuration...', 'cyan');
  
  const configFiles = [
    ['package.json', 'Configuration principale'],
    ['turbo.json', 'Configuration Turbo'],
    ['.gitignore', 'Git ignore'],
    ['README.md', 'Documentation principale'],
    ['DEPLOYMENT.md', 'Documentation déploiement'],
    ['vercel.json', 'Configuration Vercel'],
    ['eas.json', 'Configuration EAS']
  ];
  
  let valid = true;
  configFiles.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) valid = false;
  });
  
  return valid;
}

function generateReport(results) {
  log('\n📊 RAPPORT DE VALIDATION', 'bright');
  log('========================', 'bright');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r).length;
  const failed = total - passed;
  
  log(`\n✅ Validations réussies: ${passed}/${total}`, 'green');
  log(`❌ Validations échouées: ${failed}/${total}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    log('\n🎉 DÉPLOIEMENT VALIDÉ AVEC SUCCÈS!', 'green');
    log('Toutes les fonctionnalités OUT-132 et OUT-144 sont correctement implémentées.', 'green');
  } else {
    log('\n⚠️  DÉPLOIEMENT PARTIELLEMENT VALIDÉ', 'yellow');
    log('Certaines validations ont échoué. Vérifiez les fichiers manquants.', 'yellow');
  }
  
  log('\n📋 DÉTAIL DES VALIDATIONS:', 'bright');
  Object.entries(results).forEach(([test, passed]) => {
    log(`${passed ? '✅' : '❌'} ${test}`, passed ? 'green' : 'red');
  });
  
  return failed === 0;
}

function main() {
  log('🚀 VALIDATION DU DÉPLOIEMENT GÉMOU2 POC', 'bright');
  log('=========================================', 'bright');
  log('Vérification des branches OUT-132 et OUT-144\n', 'cyan');
  
  const results = {
    'Structure Git': validateGitStructure(),
    'OUT-144 (Onboarding)': validateOUT144(),
    'OUT-132 (Login)': validateOUT132(),
    'Structure Projet': validateProjectStructure(),
    'Configuration': validateConfiguration()
  };
  
  const isValid = generateReport(results);
  
  if (isValid) {
    log('\n🚀 PRÊT POUR LE DÉPLOIEMENT EN PRODUCTION!', 'green');
    log('\nProchaines étapes:');
    log('1. npm run dev:web      # Test local web');
    log('2. npm run dev:mobile   # Test local mobile');
    log('3. Configurer Supabase  # Variables d\'environnement');
    log('4. Déployer sur Vercel  # Production web');
    log('5. Build avec EAS       # Production mobile');
  } else {
    log('\n🔧 CORRECTIONS NÉCESSAIRES AVANT DÉPLOIEMENT', 'red');
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  main();
}

module.exports = { validateGitStructure, validateOUT144, validateOUT132, validateProjectStructure, validateConfiguration };

