#!/usr/bin/env node

/**
 * Script pour ajouter facilement de nouveaux tests au système de tests automatisés
 * 
 * Usage: node add-test.js [options]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG_PATH = path.join(__dirname, 'test-config.json');
const MAIN_TEST_PATH = path.join(__dirname, 'test-components.js');

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Charger la configuration actuelle
 */
function loadConfig() {
  try {
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    log('Erreur lors du chargement de la configuration', 'red');
    return null;
  }
}

/**
 * Sauvegarder la configuration
 */
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    log('✅ Configuration sauvegardée', 'green');
    return true;
  } catch (error) {
    log('❌ Erreur lors de la sauvegarde', 'red');
    return false;
  }
}

/**
 * Interface de ligne de commande
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Poser une question à l'utilisateur
 */
function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Ajouter un test de composant
 */
async function addComponentTest() {
  const rl = createInterface();
  
  log('\n🔧 AJOUT D\'UN TEST DE COMPOSANT\n', 'blue');
  
  const filePath = await askQuestion(rl, '📁 Chemin du fichier (ex: apps/web/components/ui/NewComponent.tsx): ');
  const componentName = await askQuestion(rl, '🧩 Nom du composant (ex: NewComponent): ');
  const description = await askQuestion(rl, '📝 Description: ');
  const isCritical = await askQuestion(rl, '⚠️  Composant critique ? (y/N): ');
  
  const critical = isCritical.toLowerCase() === 'y' || isCritical.toLowerCase() === 'yes';
  
  rl.close();
  
  return {
    type: 'component',
    file: filePath,
    component: componentName,
    description,
    critical
  };
}

/**
 * Ajouter un test de fonction
 */
async function addFunctionTest() {
  const rl = createInterface();
  
  log('\n⚙️  AJOUT D\'UN TEST DE FONCTION\n', 'blue');
  
  const filePath = await askQuestion(rl, '📁 Chemin du fichier: ');
  const functionName = await askQuestion(rl, '🔧 Nom de la fonction: ');
  const description = await askQuestion(rl, '📝 Description: ');
  
  rl.close();
  
  return {
    type: 'function',
    file: filePath,
    function: functionName,
    description
  };
}

/**
 * Ajouter un test de hook
 */
async function addHookTest() {
  const rl = createInterface();
  
  log('\n🎣 AJOUT D\'UN TEST DE HOOK\n', 'blue');
  
  const filePath = await askQuestion(rl, '📁 Chemin du fichier: ');
  const hookName = await askQuestion(rl, '🎣 Nom du hook (sans "use"): ');
  const description = await askQuestion(rl, '📝 Description: ');
  
  rl.close();
  
  return {
    type: 'hook',
    file: filePath,
    hook: hookName,
    description
  };
}

/**
 * Ajouter un test de route
 */
async function addRouteTest() {
  const rl = createInterface();
  
  log('\n🛣️  AJOUT D\'UN TEST DE ROUTE\n', 'blue');
  
  const routePath = await askQuestion(rl, '🛣️  Chemin de la route (ex: new-feature): ');
  const routeName = await askQuestion(rl, '📝 Nom de la route: ');
  const isRequired = await askQuestion(rl, '⚠️  Route obligatoire ? (y/N): ');
  
  const required = isRequired.toLowerCase() === 'y' || isRequired.toLowerCase() === 'yes';
  
  rl.close();
  
  return {
    type: 'route',
    path: routePath,
    name: routeName,
    required
  };
}

/**
 * Ajouter un test spécifique à une route
 */
async function addRouteSpecificTest() {
  const rl = createInterface();
  
  log('\n🎯 AJOUT D\'UN TEST SPÉCIFIQUE À UNE ROUTE\n', 'blue');
  
  const routePath = await askQuestion(rl, '🛣️  Route concernée (ex: dashboard, profile, events): ');
  const testType = await askQuestion(rl, '🧪 Type de test (component/function/hook): ');
  
  let testData;
  
  switch (testType) {
    case 'component':
      const componentName = await askQuestion(rl, '🧩 Nom du composant: ');
      const componentDesc = await askQuestion(rl, '📝 Description: ');
      testData = {
        type: 'component',
        component: componentName,
        description: componentDesc
      };
      break;
      
    case 'function':
      const functionName = await askQuestion(rl, '🔧 Nom de la fonction: ');
      const functionDesc = await askQuestion(rl, '📝 Description: ');
      testData = {
        type: 'function',
        function: functionName,
        description: functionDesc
      };
      break;
      
    case 'hook':
      const hookName = await askQuestion(rl, '🎣 Nom du hook: ');
      const hookDesc = await askQuestion(rl, '📝 Description: ');
      testData = {
        type: 'hook',
        hook: hookName,
        description: hookDesc
      };
      break;
      
    default:
      log('❌ Type de test non reconnu', 'red');
      rl.close();
      return null;
  }
  
  rl.close();
  
  return {
    type: 'routeSpecific',
    route: routePath,
    test: testData
  };
}

/**
 * Appliquer les modifications à la configuration
 */
function applyTestToConfig(config, testData) {
  switch (testData.type) {
    case 'component':
      // Ajouter aux composants UI ou business selon le chemin
      const isBusinessComponent = testData.file.includes('/events/') || testData.file.includes('/users/');
      const category = isBusinessComponent ? 'business' : 'ui';
      
      if (!config.testSuites.components.categories[category]) {
        config.testSuites.components.categories[category] = [];
      }
      
      config.testSuites.components.categories[category].push({
        file: testData.file,
        component: testData.component,
        critical: testData.critical
      });
      break;
      
    case 'function':
      config.testSuites.functions.functions.push({
        file: testData.file,
        function: testData.function,
        description: testData.description
      });
      break;
      
    case 'hook':
      config.testSuites.hooks.hooks.push({
        file: testData.file,
        hook: testData.hook,
        critical: true
      });
      break;
      
    case 'route':
      config.testSuites.routes.routes.push({
        path: testData.path,
        name: testData.name,
        required: testData.required
      });
      break;
      
    case 'routeSpecific':
      if (!config.routeSpecificTests[testData.route]) {
        config.routeSpecificTests[testData.route] = {
          components: [],
          functions: [],
          hooks: []
        };
      }
      
      const routeConfig = config.routeSpecificTests[testData.route];
      const testType = testData.test.type + 's';
      
      if (routeConfig[testType]) {
        routeConfig[testType].push(testData.test);
      }
      break;
  }
}

/**
 * Mettre à jour le script principal avec les nouveaux tests
 */
function updateMainScript(config) {
  // Cette fonction pourrait être étendue pour automatiquement
  // mettre à jour le script test-components.js avec les nouveaux tests
  log('📝 Le script principal devra être mis à jour manuellement', 'yellow');
  log('   ou vous pouvez relancer le script de génération automatique', 'yellow');
}

/**
 * Menu principal
 */
async function showMenu() {
  const rl = createInterface();
  
  while (true) {
    log('\n' + '='.repeat(50), 'cyan');
    log('🧪 AJOUT DE NOUVEAUX TESTS', 'bright');
    log('='.repeat(50), 'cyan');
    log('1. Ajouter un test de composant');
    log('2. Ajouter un test de fonction');
    log('3. Ajouter un test de hook');
    log('4. Ajouter un test de route');
    log('5. Ajouter un test spécifique à une route');
    log('6. Afficher la configuration actuelle');
    log('7. Quitter');
    
    const choice = await askQuestion(rl, '\n👉 Votre choix (1-7): ');
    
    switch (choice) {
      case '1':
        const componentTest = await addComponentTest();
        if (componentTest) {
          const config = loadConfig();
          if (config) {
            applyTestToConfig(config, componentTest);
            saveConfig(config);
          }
        }
        break;
        
      case '2':
        const functionTest = await addFunctionTest();
        if (functionTest) {
          const config = loadConfig();
          if (config) {
            applyTestToConfig(config, functionTest);
            saveConfig(config);
          }
        }
        break;
        
      case '3':
        const hookTest = await addHookTest();
        if (hookTest) {
          const config = loadConfig();
          if (config) {
            applyTestToConfig(config, hookTest);
            saveConfig(config);
          }
        }
        break;
        
      case '4':
        const routeTest = await addRouteTest();
        if (routeTest) {
          const config = loadConfig();
          if (config) {
            applyTestToConfig(config, routeTest);
            saveConfig(config);
          }
        }
        break;
        
      case '5':
        const routeSpecificTest = await addRouteSpecificTest();
        if (routeSpecificTest) {
          const config = loadConfig();
          if (config) {
            applyTestToConfig(config, routeSpecificTest);
            saveConfig(config);
          }
        }
        break;
        
      case '6':
        const config = loadConfig();
        if (config) {
          log('\n📋 CONFIGURATION ACTUELLE:', 'blue');
          console.log(JSON.stringify(config, null, 2));
        }
        break;
        
      case '7':
        log('\n👋 Au revoir !', 'green');
        rl.close();
        return;
        
      default:
        log('❌ Choix invalide', 'red');
    }
  }
}

/**
 * Afficher l'aide
 */
function showHelp() {
  console.log(`
${colors.bright}${colors.blue}🧪 AJOUT DE NOUVEAUX TESTS${colors.reset}

${colors.bright}Usage:${colors.reset}
  node add-test.js [options]

${colors.bright}Options:${colors.reset}
  --help             Afficher cette aide
  --menu             Lancer le menu interactif (par défaut)

${colors.bright}Description:${colors.reset}
  Ce script permet d'ajouter facilement de nouveaux tests au système
  de tests automatisés. Il met à jour la configuration JSON et peut
  être étendu pour mettre à jour automatiquement le script principal.

${colors.bright}Types de tests supportés:${colors.reset}
  - Composants UI et métier
  - Fonctions critiques
  - Hooks personnalisés
  - Routes principales
  - Tests spécifiques par route

${colors.bright}Exemple d'utilisation:${colors.reset}
  node add-test.js
  # Lance le menu interactif pour ajouter des tests
`);
}

// Point d'entrée principal
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Lancer le menu interactif
showMenu().catch(error => {
  log(`\n${colors.red}💥 ERREUR:${colors.reset} ${error.message}`, 'red');
  process.exit(1);
});
