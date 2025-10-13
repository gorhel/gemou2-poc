#!/usr/bin/env node

/**
 * Script de tests automatisés pour vérifier la présence des composants
 * sur chaque route selon les rôles et profils.
 * 
 * Usage: node test-components.js [--verbose] [--route=ROUTE_NAME]
 */

const fs = require('fs');
const path = require('path');

// Configuration des tests
const CONFIG = {
  verbose: process.argv.includes('--verbose'),
  specificRoute: process.argv.find(arg => arg.startsWith('--route='))?.split('=')[1],
  timeout: 5000, // 5 secondes max par test
  parallel: true, // Tests en parallèle pour optimiser
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

// Résultats des tests
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  details: []
};

/**
 * Log avec couleurs
 */
function log(message, color = 'reset') {
  if (CONFIG.verbose || color !== 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }
}

/**
 * Vérifier si un fichier existe
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Lire le contenu d'un fichier
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * Vérifier la présence d'un composant dans un fichier
 */
function checkComponentInFile(filePath, componentName, description) {
  const content = readFile(filePath);
  if (!content) {
    return {
      success: false,
      message: `Fichier non trouvé: ${filePath}`,
      component: componentName,
      description
    };
  }

  // Vérifier l'import du composant
  const hasImport = content.includes(`import ${componentName}`) || 
                   content.includes(`from '${componentName}'`) ||
                   content.includes(`<${componentName}`);

  // Vérifier l'utilisation du composant
  const hasUsage = content.includes(`<${componentName}`) ||
                  content.includes(`${componentName}(`);

  return {
    success: hasImport && hasUsage,
    message: hasImport && hasUsage 
      ? `✓ Composant ${componentName} trouvé`
      : `✗ Composant ${componentName} manquant (import: ${hasImport}, usage: ${hasUsage})`,
    component: componentName,
    description,
    file: filePath
  };
}

/**
 * Vérifier la présence d'une fonction dans un fichier
 */
function checkFunctionInFile(filePath, functionName, description) {
  const content = readFile(filePath);
  if (!content) {
    return {
      success: false,
      message: `Fichier non trouvé: ${filePath}`,
      function: functionName,
      description
    };
  }

  const hasFunction = content.includes(`function ${functionName}`) ||
                     content.includes(`const ${functionName} =`) ||
                     content.includes(`${functionName}(`);

  return {
    success: hasFunction,
    message: hasFunction 
      ? `✓ Fonction ${functionName} trouvée`
      : `✗ Fonction ${functionName} manquante`,
    function: functionName,
    description,
    file: filePath
  };
}

/**
 * Vérifier la présence d'un hook dans un fichier
 */
function checkHookInFile(filePath, hookName, description) {
  const content = readFile(filePath);
  if (!content) {
    return {
      success: false,
      message: `Fichier non trouvé: ${filePath}`,
      hook: hookName,
      description
    };
  }

  const hasHook = content.includes(`use${hookName}`) ||
                 content.includes(`${hookName}`);

  return {
    success: hasHook,
    message: hasHook 
      ? `✓ Hook ${hookName} trouvé`
      : `✗ Hook ${hookName} manquant`,
    hook: hookName,
    description,
    file: filePath
  };
}

/**
 * Vérifier la présence d'une route dans le système de routing
 */
function checkRouteExists(routePath, description) {
  const webAppPath = path.join(__dirname, 'apps', 'web', 'app');
  const routeFile = path.join(webAppPath, routePath, 'page.tsx');
  const routeFileIndex = path.join(webAppPath, routePath, 'index.tsx');

  const exists = fileExists(routeFile) || fileExists(routeFileIndex);

  return {
    success: exists,
    message: exists 
      ? `✓ Route ${routePath} existe`
      : `✗ Route ${routePath} manquante`,
    route: routePath,
    description,
    file: exists ? (fileExists(routeFile) ? routeFile : routeFileIndex) : null
  };
}

/**
 * Définir tous les tests à exécuter
 */
function defineTests() {
  const tests = [];

  // Tests des routes principales
  const routes = [
    { path: '', description: 'Page d\'accueil (Landing)' },
    { path: 'login', description: 'Page de connexion' },
    { path: 'register', description: 'Page d\'inscription' },
    { path: 'dashboard', description: 'Tableau de bord' },
    { path: 'profile', description: 'Profil utilisateur' },
    { path: 'events', description: 'Liste des événements' },
    { path: 'community', description: 'Communauté' },
    { path: 'create-event', description: 'Création d\'événement' },
    { path: 'search', description: 'Recherche' },
  ];

  // Tests de présence des routes
  routes.forEach(route => {
    if (!CONFIG.specificRoute || route.path.includes(CONFIG.specificRoute)) {
      tests.push(() => checkRouteExists(route.path, route.description));
    }
  });

  // Tests spécifiques par route
  const routeTests = {
    // Page d'accueil
    '': [
      () => checkComponentInFile(
        'apps/web/app/page.tsx',
        'AuthForm',
        'Formulaire d\'authentification sur la page d\'accueil'
      ),
      () => checkComponentInFile(
        'apps/web/app/page.tsx',
        'Header',
        'Header sur la page d\'accueil'
      ),
    ],

    // Dashboard
    'dashboard': [
      () => checkComponentInFile(
        'apps/web/app/dashboard/page.tsx',
        'EventsSlider',
        'Slider d\'événements sur le dashboard'
      ),
      () => checkComponentInFile(
        'apps/web/app/dashboard/page.tsx',
        'UsersRecommendations',
        'Recommandations d\'utilisateurs sur le dashboard'
      ),
      () => checkComponentInFile(
        'apps/web/app/dashboard/page.tsx',
        'ResponsiveLayout',
        'Layout responsive sur le dashboard'
      ),
    ],

    // Profil utilisateur
    'profile': [
      () => checkComponentInFile(
        'apps/web/app/profile/page.tsx',
        'FriendsSlider',
        'Slider d\'amis sur le profil'
      ),
      () => checkComponentInFile(
        'apps/web/app/profile/page.tsx',
        'Card',
        'Composant Card sur le profil'
      ),
      () => checkFunctionInFile(
        'apps/web/app/profile/page.tsx',
        'fetchUserEvents',
        'Fonction de récupération des événements utilisateur'
      ),
    ],

    // Profil utilisateur spécifique
    'profile/[username]': [
      () => checkComponentInFile(
        'apps/web/app/profile/[username]/page.tsx',
        'FriendsSlider',
        'Slider d\'amis sur le profil utilisateur'
      ),
      () => checkComponentInFile(
        'apps/web/app/profile/[username]/page.tsx',
        'SmallPill',
        'Composant SmallPill pour les préférences'
      ),
      () => checkFunctionInFile(
        'apps/web/app/profile/[username]/page.tsx',
        'fetchUserProfile',
        'Fonction de récupération du profil utilisateur'
      ),
    ],

    // Événements
    'events': [
      () => checkComponentInFile(
        'apps/web/app/events/page.tsx',
        'EventCard',
        'Carte d\'événement sur la liste'
      ),
      () => checkComponentInFile(
        'apps/web/app/events/page.tsx',
        'ResponsiveLayout',
        'Layout responsive sur les événements'
      ),
    ],

    // Détail événement
    'events/[id]': [
      () => checkComponentInFile(
        'apps/web/app/events/[id]/page.tsx',
        'ParticipantCard',
        'Carte de participant sur le détail événement'
      ),
      () => checkHookInFile(
        'apps/web/app/events/[id]/page.tsx',
        'EventParticipantsCount',
        'Hook de comptage des participants'
      ),
    ],

    // Création d'événement
    'create-event': [
      () => checkComponentInFile(
        'apps/web/app/create-event/page.tsx',
        'CreateEventForm',
        'Formulaire de création d\'événement'
      ),
      () => checkComponentInFile(
        'apps/web/app/create-event/page.tsx',
        'ResponsiveLayout',
        'Layout responsive sur la création d\'événement'
      ),
    ],

    // Communauté
    'community': [
      () => checkComponentInFile(
        'apps/web/app/community/page.tsx',
        'UserCard',
        'Carte d\'utilisateur sur la communauté'
      ),
      () => checkComponentInFile(
        'apps/web/app/community/page.tsx',
        'ResponsiveLayout',
        'Layout responsive sur la communauté'
      ),
    ],
  };

  // Ajouter les tests spécifiques par route
  Object.entries(routeTests).forEach(([route, routeTestList]) => {
    if (!CONFIG.specificRoute || route.includes(CONFIG.specificRoute)) {
      routeTestList.forEach(test => tests.push(test));
    }
  });

  // Tests de composants UI globaux
  const uiComponents = [
    { file: 'apps/web/components/ui/Button.tsx', component: 'Button', description: 'Composant Button' },
    { file: 'apps/web/components/ui/Card.tsx', component: 'Card', description: 'Composant Card' },
    { file: 'apps/web/components/ui/LoadingSpinner.tsx', component: 'LoadingSpinner', description: 'Composant LoadingSpinner' },
    { file: 'apps/web/components/ui/SmallPill.tsx', component: 'SmallPill', description: 'Composant SmallPill' },
    { file: 'apps/web/components/ui/ResponsiveHeader.tsx', component: 'ResponsiveHeader', description: 'Composant ResponsiveHeader' },
  ];

  uiComponents.forEach(({ file, component, description }) => {
    tests.push(() => checkComponentInFile(file, component, description));
  });

  // Tests de composants métier
  const businessComponents = [
    { file: 'apps/web/components/events/EventsSlider.tsx', component: 'EventsSlider', description: 'Slider d\'événements' },
    { file: 'apps/web/components/events/EventCard.tsx', component: 'EventCard', description: 'Carte d\'événement' },
    { file: 'apps/web/components/events/CreateEventForm.tsx', component: 'CreateEventForm', description: 'Formulaire de création d\'événement' },
    { file: 'apps/web/components/users/FriendsSlider.tsx', component: 'FriendsSlider', description: 'Slider d\'amis' },
    { file: 'apps/web/components/users/FriendCard.tsx', component: 'FriendCard', description: 'Carte d\'ami' },
    { file: 'apps/web/components/users/UserCard.tsx', component: 'UserCard', description: 'Carte d\'utilisateur' },
  ];

  businessComponents.forEach(({ file, component, description }) => {
    tests.push(() => checkComponentInFile(file, component, description));
  });

  // Tests de hooks personnalisés
  const customHooks = [
    { file: 'apps/web/hooks/useEventParticipantsCount.ts', hook: 'EventParticipantsCount', description: 'Hook de comptage des participants' },
    { file: 'apps/web/hooks/useUsernameValidation.ts', hook: 'UsernameValidation', description: 'Hook de validation d\'username' },
  ];

  customHooks.forEach(({ file, hook, description }) => {
    tests.push(() => checkHookInFile(file, hook, description));
  });

  // Tests de configuration
  const configFiles = [
    { file: 'apps/web/package.json', description: 'Configuration package.json web' },
    { file: 'apps/web/next.config.js', description: 'Configuration Next.js' },
    { file: 'apps/web/tailwind.config.js', description: 'Configuration Tailwind' },
    { file: '.env.local', description: 'Variables d\'environnement' },
  ];

  configFiles.forEach(({ file, description }) => {
    tests.push(() => {
      const exists = fileExists(file);
      return {
        success: exists,
        message: exists ? `✓ ${description} existe` : `✗ ${description} manquant`,
        file: file,
        description
      };
    });
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
        setTimeout(() => reject(new Error('Timeout')), CONFIG.timeout)
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
      duration: CONFIG.timeout,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  log(`\n${colors.bright}${colors.blue}🧪 DÉMARRAGE DES TESTS AUTOMATISÉS${colors.reset}\n`);
  
  const tests = defineTests();
  results.total = tests.length;

  log(`📊 ${tests.length} tests définis`);
  if (CONFIG.specificRoute) {
    log(`🎯 Test spécifique sur la route: ${CONFIG.specificRoute}`);
  }
  log(`⚡ Mode: ${CONFIG.parallel ? 'parallèle' : 'séquentiel'}\n`);

  const startTime = Date.now();

  if (CONFIG.parallel) {
    // Tests en parallèle
    const testPromises = tests.map((test, index) => 
      runTest(test).then(result => ({ ...result, index }))
    );
    
    const testResults = await Promise.all(testPromises);
    testResults.forEach(result => processTestResult(result));
  } else {
    // Tests séquentiels
    for (let i = 0; i < tests.length; i++) {
      const result = await runTest(tests[i]);
      processTestResult({ ...result, index: i });
      
      // Petite pause entre les tests
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
    
    if (CONFIG.verbose && result.error) {
      log(`   Erreur: ${result.error}`, 'yellow');
    }
  }

  results.details.push(result);
}

/**
 * Afficher les résultats finaux
 */
function displayResults(totalDuration) {
  log(`\n${colors.bright}${colors.blue}📊 RÉSULTATS DES TESTS${colors.reset}\n`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  
  log(`✅ Tests réussis: ${results.passed}/${results.total} (${successRate}%)`, results.passed === results.total ? 'green' : 'yellow');
  log(`❌ Tests échoués: ${results.failed}/${results.total}`, results.failed > 0 ? 'red' : 'green');
  log(`⏱️  Durée totale: ${totalDuration}ms`);
  log(`⚡ Durée moyenne: ${(totalDuration / results.total).toFixed(1)}ms par test`);

  if (results.failed > 0) {
    log(`\n${colors.red}${colors.bright}🚨 ÉCHECS DÉTECTÉS:${colors.reset}\n`);
    
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

  // Générer le rapport JSON
  generateReport(totalDuration);

  // Code de sortie
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * Générer un rapport JSON
 */
function generateReport(totalDuration) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: ((results.passed / results.total) * 100).toFixed(1),
      duration: totalDuration,
      averageDuration: (totalDuration / results.total).toFixed(1)
    },
    configuration: CONFIG,
    details: results.details
  };

  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`📄 Rapport détaillé généré: ${reportPath}`, 'cyan');
}

/**
 * Afficher l'aide
 */
function showHelp() {
  console.log(`
${colors.bright}${colors.blue}🧪 SCRIPT DE TESTS AUTOMATISÉS${colors.reset}

${colors.bright}Usage:${colors.reset}
  node test-components.js [options]

${colors.bright}Options:${colors.reset}
  --verbose          Mode verbeux (affiche tous les détails)
  --route=ROUTE      Tester seulement une route spécifique
  --help             Afficher cette aide

${colors.bright}Exemples:${colors.reset}
  node test-components.js                    # Tous les tests
  node test-components.js --verbose          # Mode verbeux
  node test-components.js --route=dashboard  # Test du dashboard uniquement
  node test-components.js --route=profile    # Test des profils uniquement

${colors.bright}Routes disponibles:${colors.reset}
  - dashboard        Tableau de bord
  - profile          Profil utilisateur
  - events           Événements
  - community        Communauté
  - create-event     Création d'événement
  - search           Recherche

${colors.bright}Fichiers générés:${colors.reset}
  - test-report.json Rapport détaillé en JSON
`);
}

// Point d'entrée principal
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Lancer les tests
runAllTests().catch(error => {
  log(`\n${colors.red}${colors.bright}💥 ERREUR CRITIQUE:${colors.reset}`, 'red');
  log(error.message, 'red');
  process.exit(1);
});
