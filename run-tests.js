#!/usr/bin/env node

/**
 * Script principal pour exécuter tous les tests automatisés
 * 
 * Usage: node run-tests.js [options]
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  verbose: process.argv.includes('--verbose'),
  components: !process.argv.includes('--skip-components'),
  permissions: !process.argv.includes('--skip-permissions'),
  parallel: !process.argv.includes('--sequential'),
  generateReport: !process.argv.includes('--no-report'),
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
  components: { passed: 0, failed: 0, total: 0 },
  permissions: { passed: 0, failed: 0, total: 0 },
  overall: { passed: 0, failed: 0, total: 0 }
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Exécuter un script de test
 */
function runTestScript(scriptPath, scriptName) {
  return new Promise((resolve) => {
    log(`\n${colors.bright}${colors.blue}🧪 EXÉCUTION: ${scriptName}${colors.reset}`);
    log(`${'='.repeat(50)}`, 'cyan');
    
    const startTime = Date.now();
    
    const args = CONFIG.verbose ? ['--verbose'] : [];
    const child = spawn('node', [scriptPath, ...args], {
      stdio: CONFIG.verbose ? 'inherit' : 'pipe',
      cwd: __dirname
    });
    
    let output = '';
    let errorOutput = '';
    
    if (!CONFIG.verbose) {
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
    }
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      const result = {
        script: scriptName,
        code: code,
        duration: duration,
        success: code === 0,
        output: output,
        error: errorOutput
      };
      
      if (result.success) {
        log(`✅ ${scriptName} terminé avec succès (${duration}ms)`, 'green');
      } else {
        log(`❌ ${scriptName} échoué avec le code ${code} (${duration}ms)`, 'red');
        if (!CONFIG.verbose && errorOutput) {
          log(`Erreur: ${errorOutput}`, 'yellow');
        }
      }
      
      resolve(result);
    });
  });
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  log(`${colors.bright}${colors.blue}🚀 DÉMARRAGE DES TESTS AUTOMATISÉS GÉMOU2${colors.reset}`);
  log(`${'='.repeat(60)}`, 'cyan');
  
  const startTime = Date.now();
  const testResults = [];
  
  // Tests des composants
  if (CONFIG.components) {
    const componentsResult = await runTestScript('./test-components.js', 'Tests des Composants');
    testResults.push(componentsResult);
    results.components.passed = componentsResult.success ? 1 : 0;
    results.components.failed = componentsResult.success ? 0 : 1;
    results.components.total = 1;
  }
  
  // Tests des permissions
  if (CONFIG.permissions) {
    const permissionsResult = await runTestScript('./test-permissions.js', 'Tests des Permissions');
    testResults.push(permissionsResult);
    results.permissions.passed = permissionsResult.success ? 1 : 0;
    results.permissions.failed = permissionsResult.success ? 0 : 1;
    results.permissions.total = 1;
  }
  
  const totalDuration = Date.now() - startTime;
  
  // Calculer les résultats globaux
  results.overall.passed = testResults.filter(r => r.success).length;
  results.overall.failed = testResults.filter(r => !r.success).length;
  results.overall.total = testResults.length;
  
  // Afficher le résumé
  displaySummary(totalDuration, testResults);
  
  // Générer le rapport global
  if (CONFIG.generateReport) {
    generateGlobalReport(totalDuration, testResults);
  }
  
  // Code de sortie
  process.exit(results.overall.failed > 0 ? 1 : 0);
}

/**
 * Afficher le résumé des résultats
 */
function displaySummary(totalDuration, testResults) {
  log(`\n${colors.bright}${colors.blue}📊 RÉSUMÉ GLOBAL DES TESTS${colors.reset}`);
  log(`${'='.repeat(50)}`, 'cyan');
  
  const successRate = ((results.overall.passed / results.overall.total) * 100).toFixed(1);
  
  log(`⏱️  Durée totale: ${totalDuration}ms`);
  log(`📊 Tests exécutés: ${results.overall.total}`);
  log(`✅ Succès: ${results.overall.passed}/${results.overall.total} (${successRate}%)`, 
      results.overall.passed === results.overall.total ? 'green' : 'yellow');
  log(`❌ Échecs: ${results.overall.failed}/${results.overall.total}`, 
      results.overall.failed > 0 ? 'red' : 'green');
  
  if (CONFIG.components) {
    log(`\n🧩 Tests des Composants: ${results.components.passed > 0 ? '✅ Réussi' : '❌ Échoué'}`, 
        results.components.passed > 0 ? 'green' : 'red');
  }
  
  if (CONFIG.permissions) {
    log(`🔒 Tests des Permissions: ${results.permissions.passed > 0 ? '✅ Réussi' : '❌ Échoué'}`, 
        results.permissions.passed > 0 ? 'green' : 'red');
  }
  
  if (results.overall.failed > 0) {
    log(`\n${colors.red}${colors.bright}🚨 ÉCHECS DÉTECTÉS:${colors.reset}`);
    testResults
      .filter(result => !result.success)
      .forEach(result => {
        log(`- ${result.script} (${result.duration}ms)`, 'red');
      });
  }
}

/**
 * Générer le rapport global
 */
function generateGlobalReport(totalDuration, testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    type: 'global',
    summary: {
      total: results.overall.total,
      passed: results.overall.passed,
      failed: results.overall.failed,
      successRate: ((results.overall.passed / results.overall.total) * 100).toFixed(1),
      duration: totalDuration,
      configuration: CONFIG
    },
    components: results.components,
    permissions: results.permissions,
    testResults: testResults.map(result => ({
      script: result.script,
      success: result.success,
      duration: result.duration,
      code: result.code
    }))
  };
  
  const reportPath = path.join(__dirname, 'test-global-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📄 Rapport global généré: ${reportPath}`, 'cyan');
  
  // Lister les rapports détaillés disponibles
  const reports = [
    'test-report.json',
    'test-permissions-report.json'
  ].filter(reportFile => fs.existsSync(path.join(__dirname, reportFile)));
  
  if (reports.length > 0) {
    log(`📋 Rapports détaillés disponibles:`, 'cyan');
    reports.forEach(reportFile => {
      log(`   - ${reportFile}`, 'cyan');
    });
  }
}

/**
 * Afficher l'aide
 */
function showHelp() {
  console.log(`
${colors.bright}${colors.blue}🚀 TESTS AUTOMATISÉS GÉMOU2${colors.reset}

${colors.bright}Usage:${colors.reset}
  node run-tests.js [options]

${colors.bright}Options:${colors.reset}
  --verbose              Mode verbeux (affiche tous les détails)
  --skip-components      Ignorer les tests des composants
  --skip-permissions     Ignorer les tests des permissions
  --sequential           Exécuter les tests séquentiellement
  --no-report            Ne pas générer de rapport
  --help                 Afficher cette aide

${colors.bright}Description:${colors.reset}
  Script principal pour exécuter tous les tests automatisés de l'application Gémou2.
  
  Ce script lance automatiquement :
  - Tests des composants (présence, imports, usage)
  - Tests des permissions (authentification, amitié, RLS, propriétaire)
  
  Les tests sont optimisés pour s'exécuter rapidement et détecter les régressions.

${colors.bright}Exemples:${colors.reset}
  node run-tests.js                      # Tous les tests
  node run-tests.js --verbose            # Mode verbeux
  node run-tests.js --skip-permissions   # Tests des composants uniquement
  node run-tests.js --sequential         # Tests séquentiels

${colors.bright}Fichiers générés:${colors.reset}
  - test-global-report.json      Rapport global
  - test-report.json             Rapport des composants
  - test-permissions-report.json Rapport des permissions

${colors.bright}Scripts disponibles:${colors.reset}
  - test-components.js           Tests des composants
  - test-permissions.js          Tests des permissions
  - add-test.js                  Ajouter de nouveaux tests
`);
}

/**
 * Vérifier que les scripts de test existent
 */
function checkTestScripts() {
  const requiredScripts = [];
  
  if (CONFIG.components) {
    requiredScripts.push('./test-components.js');
  }
  
  if (CONFIG.permissions) {
    requiredScripts.push('./test-permissions.js');
  }
  
  const missingScripts = requiredScripts.filter(script => !fs.existsSync(script));
  
  if (missingScripts.length > 0) {
    log(`❌ Scripts manquants: ${missingScripts.join(', ')}`, 'red');
    log(`Assurez-vous que tous les scripts de test sont présents.`, 'yellow');
    process.exit(1);
  }
}

// Point d'entrée principal
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Vérifier les prérequis
checkTestScripts();

// Lancer tous les tests
runAllTests().catch(error => {
  log(`\n${colors.red}${colors.bright}💥 ERREUR CRITIQUE:${colors.reset}`, 'red');
  log(error.message, 'red');
  process.exit(1);
});
