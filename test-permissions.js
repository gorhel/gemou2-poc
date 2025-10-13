#!/usr/bin/env node

/**
 * Script de tests pour vérifier les rôles et permissions
 * selon les différentes situations d'utilisateur
 */

const fs = require('fs');
const path = require('path');

// Configuration des tests de permissions
const PERMISSIONS_CONFIG = {
  verbose: process.argv.includes('--verbose'),
  timeout: 3000,
  parallel: true,
};

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

const results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function log(message, color = 'reset') {
  if (PERMISSIONS_CONFIG.verbose || color !== 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }
}

/**
 * Vérifier la présence de contrôles d'authentification dans un fichier
 */
function checkAuthenticationControls(filePath, description) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasAuthCheck = content.includes('supabase.auth.getUser()') ||
                      content.includes('useAuth') ||
                      content.includes('router.push(\'/login\')') ||
                      content.includes('if (!user)') ||
                      content.includes('if (!currentUser)');
  
  const hasRedirect = content.includes('router.push(\'/login\')') ||
                     content.includes('window.location.href') ||
                     content.includes('redirect');
  
  return {
    success: hasAuthCheck && hasRedirect,
    message: hasAuthCheck && hasRedirect 
      ? `✓ Contrôles d'authentification présents`
      : `✗ Contrôles d'authentification manquants (auth: ${hasAuthCheck}, redirect: ${hasRedirect})`,
    file: filePath,
    description,
    hasAuthCheck,
    hasRedirect
  };
}

/**
 * Vérifier la présence de contrôles d'amitié dans un fichier
 */
function checkFriendshipControls(filePath, description) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasFriendshipCheck = content.includes('friends') ||
                            content.includes('friendship_status') ||
                            content.includes('isFriend') ||
                            content.includes('accepted');
  
  const hasConditionalDisplay = content.includes('!isFriend') ||
                               content.includes('isFriend ?') ||
                               content.includes('{!isFriend') ||
                               content.includes('condition');
  
  return {
    success: hasFriendshipCheck && hasConditionalDisplay,
    message: hasFriendshipCheck && hasConditionalDisplay
      ? `✓ Contrôles d'amitié présents`
      : `✗ Contrôles d'amitié manquants (friendship: ${hasFriendshipCheck}, conditional: ${hasConditionalDisplay})`,
    file: filePath,
    description,
    hasFriendshipCheck,
    hasConditionalDisplay
  };
}

/**
 * Vérifier la présence de RLS (Row Level Security) dans les requêtes
 */
function checkRLSControls(filePath, description) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasAuthUID = content.includes('auth.uid()') ||
                    content.includes('currentUser.user.id') ||
                    content.includes('user.id');
  
  const hasWhereClause = content.includes('.eq(') ||
                        content.includes('.neq(') ||
                        content.includes('.in(') ||
                        content.includes('.or(');
  
  const hasSecurityCheck = content.includes('friendship_status') ||
                          content.includes('accepted') ||
                          content.includes('user_id');
  
  return {
    success: hasAuthUID && (hasWhereClause || hasSecurityCheck),
    message: hasAuthUID && (hasWhereClause || hasSecurityCheck)
      ? `✓ Contrôles RLS présents`
      : `✗ Contrôles RLS manquants (auth: ${hasAuthUID}, where: ${hasWhereClause}, security: ${hasSecurityCheck})`,
    file: filePath,
    description,
    hasAuthUID,
    hasWhereClause,
    hasSecurityCheck
  };
}

/**
 * Vérifier la présence de contrôles de propriétaire (creator_id, user_id)
 */
function checkOwnershipControls(filePath, description) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasCreatorCheck = content.includes('creator_id') ||
                         content.includes('user_id') ||
                         content.includes('currentUser');
  
  const hasOwnershipLogic = content.includes('event.creator_id ===') ||
                           content.includes('user.id ===') ||
                           content.includes('profileData.id') ||
                           content.includes('currentUser.user.id');
  
  return {
    success: hasCreatorCheck && hasOwnershipLogic,
    message: hasCreatorCheck && hasOwnershipLogic
      ? `✓ Contrôles de propriétaire présents`
      : `✗ Contrôles de propriétaire manquants (creator: ${hasCreatorCheck}, logic: ${hasOwnershipLogic})`,
    file: filePath,
    description,
    hasCreatorCheck,
    hasOwnershipLogic
  };
}

/**
 * Vérifier la présence de messages d'erreur appropriés
 */
function checkErrorHandling(filePath, description) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hasTryCatch = content.includes('try {') && content.includes('} catch');
  const hasErrorState = content.includes('setError') ||
                       content.includes('error, setError') ||
                       content.includes('catch (error)');
  
  const hasUserFriendlyMessages = content.includes('Utilisateur non trouvé') ||
                                 content.includes('Vous devez être ami') ||
                                 content.includes('Erreur lors du chargement') ||
                                 content.includes('Accès refusé');
  
  return {
    success: hasTryCatch && hasErrorState && hasUserFriendlyMessages,
    message: hasTryCatch && hasErrorState && hasUserFriendlyMessages
      ? `✓ Gestion d'erreur appropriée`
      : `✗ Gestion d'erreur incomplète (try/catch: ${hasTryCatch}, error state: ${hasErrorState}, messages: ${hasUserFriendlyMessages})`,
    file: filePath,
    description,
    hasTryCatch,
    hasErrorState,
    hasUserFriendlyMessages
  };
}

/**
 * Définir tous les tests de permissions
 */
function definePermissionTests() {
  const tests = [];
  
  // Tests d'authentification sur les pages protégées
  const protectedPages = [
    { file: 'apps/web/app/dashboard/page.tsx', description: 'Dashboard - Contrôles d\'authentification' },
    { file: 'apps/web/app/profile/page.tsx', description: 'Profil - Contrôles d\'authentification' },
    { file: 'apps/web/app/events/[id]/page.tsx', description: 'Détail événement - Contrôles d\'authentification' },
    { file: 'apps/web/app/create-event/page.tsx', description: 'Création événement - Contrôles d\'authentification' },
    { file: 'apps/web/app/community/page.tsx', description: 'Communauté - Contrôles d\'authentification' },
  ];
  
  protectedPages.forEach(({ file, description }) => {
    if (fs.existsSync(file)) {
      tests.push(() => checkAuthenticationControls(file, description));
    }
  });
  
  // Tests de contrôles d'amitié
  const friendshipPages = [
    { file: 'apps/web/app/profile/[username]/page.tsx', description: 'Profil utilisateur - Contrôles d\'amitié' },
    { file: 'apps/web/components/users/FriendsSlider.tsx', description: 'FriendsSlider - Contrôles d\'amitié' },
  ];
  
  friendshipPages.forEach(({ file, description }) => {
    if (fs.existsSync(file)) {
      tests.push(() => checkFriendshipControls(file, description));
    }
  });
  
  // Tests de RLS sur les requêtes Supabase
  const dataAccessFiles = [
    { file: 'apps/web/app/profile/page.tsx', description: 'Profil - Contrôles RLS' },
    { file: 'apps/web/app/profile/[username]/page.tsx', description: 'Profil utilisateur - Contrôles RLS' },
    { file: 'apps/web/components/users/FriendsSlider.tsx', description: 'FriendsSlider - Contrôles RLS' },
    { file: 'apps/web/app/dashboard/page.tsx', description: 'Dashboard - Contrôles RLS' },
  ];
  
  dataAccessFiles.forEach(({ file, description }) => {
    if (fs.existsSync(file)) {
      tests.push(() => checkRLSControls(file, description));
    }
  });
  
  // Tests de contrôles de propriétaire
  const ownershipFiles = [
    { file: 'apps/web/app/profile/page.tsx', description: 'Profil - Contrôles de propriétaire' },
    { file: 'apps/web/app/profile/[username]/page.tsx', description: 'Profil utilisateur - Contrôles de propriétaire' },
    { file: 'apps/web/app/events/[id]/page.tsx', description: 'Détail événement - Contrôles de propriétaire' },
  ];
  
  ownershipFiles.forEach(({ file, description }) => {
    if (fs.existsSync(file)) {
      tests.push(() => checkOwnershipControls(file, description));
    }
  });
  
  // Tests de gestion d'erreur
  const errorHandlingFiles = [
    { file: 'apps/web/app/profile/[username]/page.tsx', description: 'Profil utilisateur - Gestion d\'erreur' },
    { file: 'apps/web/components/users/FriendsSlider.tsx', description: 'FriendsSlider - Gestion d\'erreur' },
    { file: 'apps/web/app/events/[id]/page.tsx', description: 'Détail événement - Gestion d\'erreur' },
  ];
  
  errorHandlingFiles.forEach(({ file, description }) => {
    if (fs.existsSync(file)) {
      tests.push(() => checkErrorHandling(file, description));
    }
  });
  
  return tests;
}

/**
 * Exécuter un test
 */
async function runTest(testFunction) {
  try {
    const startTime = Date.now();
    const result = await Promise.race([
      testFunction(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), PERMISSIONS_CONFIG.timeout)
      )
    ]);
    const duration = Date.now() - startTime;
    
    return {
      ...result,
      duration,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      message: `✗ Erreur: ${error.message}`,
      error: error.message,
      duration: PERMISSIONS_CONFIG.timeout,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Exécuter tous les tests de permissions
 */
async function runAllPermissionTests() {
  log(`\n${colors.bright}${colors.blue}🔒 TESTS DE PERMISSIONS ET RÔLES${colors.reset}\n`);
  
  const tests = definePermissionTests();
  results.total = tests.length;
  
  log(`📊 ${tests.length} tests de permissions définis`);
  log(`⚡ Mode: ${PERMISSIONS_CONFIG.parallel ? 'parallèle' : 'séquentiel'}\n`);
  
  const startTime = Date.now();
  
  if (PERMISSIONS_CONFIG.parallel) {
    const testPromises = tests.map((test, index) => 
      runTest(test).then(result => ({ ...result, index }))
    );
    
    const testResults = await Promise.all(testPromises);
    testResults.forEach(result => processTestResult(result));
  } else {
    for (let i = 0; i < tests.length; i++) {
      const result = await runTest(tests[i]);
      processTestResult({ ...result, index: i });
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  const totalDuration = Date.now() - startTime;
  displayResults(totalDuration);
}

/**
 * Traiter le résultat d'un test
 */
function processTestResult(result) {
  if (result.success) {
    results.passed++;
    log(`✅ ${result.message} (${result.duration}ms)`, 'green');
  } else {
    results.failed++;
    log(`❌ ${result.message} (${result.duration}ms)`, 'red');
    
    if (PERMISSIONS_CONFIG.verbose && result.error) {
      log(`   Erreur: ${result.error}`, 'yellow');
    }
  }
  
  results.details.push(result);
}

/**
 * Afficher les résultats finaux
 */
function displayResults(totalDuration) {
  log(`\n${colors.bright}${colors.blue}📊 RÉSULTATS DES TESTS DE PERMISSIONS${colors.reset}\n`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  
  log(`✅ Tests réussis: ${results.passed}/${results.total} (${successRate}%)`, results.passed === results.total ? 'green' : 'yellow');
  log(`❌ Tests échoués: ${results.failed}/${results.total}`, results.failed > 0 ? 'red' : 'green');
  log(`⏱️  Durée totale: ${totalDuration}ms`);
  log(`⚡ Durée moyenne: ${(totalDuration / results.total).toFixed(1)}ms par test`);

  if (results.failed > 0) {
    log(`\n${colors.red}${colors.bright}🚨 PROBLÈMES DE SÉCURITÉ DÉTECTÉS:${colors.reset}\n`);
    
    results.details
      .filter(result => !result.success)
      .forEach((result, index) => {
        log(`${index + 1}. ${result.message}`, 'red');
        if (result.file) {
          log(`   Fichier: ${result.file}`, 'yellow');
        }
        if (result.description) {
          log(`   Description: ${result.description}`, 'cyan');
        }
        log('');
      });
  }

  // Générer le rapport
  generatePermissionReport(totalDuration);
  
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Générer un rapport de permissions
 */
function generatePermissionReport(totalDuration) {
  const report = {
    timestamp: new Date().toISOString(),
    type: 'permissions',
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: ((results.passed / results.total) * 100).toFixed(1),
      duration: totalDuration,
      averageDuration: (totalDuration / results.total).toFixed(1)
    },
    securityIssues: results.details.filter(result => !result.success),
    configuration: PERMISSIONS_CONFIG,
    details: results.details
  };

  const reportPath = path.join(__dirname, 'test-permissions-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`📄 Rapport de permissions généré: ${reportPath}`, 'cyan');
}

/**
 * Afficher l'aide
 */
function showHelp() {
  console.log(`
${colors.bright}${colors.blue}🔒 TESTS DE PERMISSIONS ET RÔLES${colors.reset}

${colors.bright}Usage:${colors.reset}
  node test-permissions.js [options]

${colors.bright}Options:${colors.reset}
  --verbose          Mode verbeux (affiche tous les détails)
  --help             Afficher cette aide

${colors.bright}Description:${colors.reset}
  Ce script vérifie la présence des contrôles de sécurité appropriés
  dans l'application, notamment :
  
  - Contrôles d'authentification sur les pages protégées
  - Contrôles d'amitié pour l'accès aux données privées
  - Contrôles RLS (Row Level Security) dans les requêtes
  - Contrôles de propriétaire (creator_id, user_id)
  - Gestion d'erreur appropriée avec messages utilisateur

${colors.bright}Fichiers générés:${colors.reset}
  - test-permissions-report.json Rapport détaillé des problèmes de sécurité
`);
}

// Point d'entrée principal
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Lancer les tests de permissions
runAllPermissionTests().catch(error => {
  log(`\n${colors.red}${colors.bright}💥 ERREUR CRITIQUE:${colors.reset}`, 'red');
  log(error.message, 'red');
  process.exit(1);
});
