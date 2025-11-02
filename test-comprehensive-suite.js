#!/usr/bin/env node

/**
 * 🧪 SUITE DE TESTS COMPLÈTE - GÉMOU2
 * 
 * Cette suite de tests analyse toutes les routes de l'application
 * et génère un rapport détaillé sur les composants et fonctionnalités.
 * 
 * Structure du rapport :
 * - Présence des composants attendus
 * - Présence des fonctionnalités
 * - Fonctionnement des fonctionnalités
 * - Synthèse actionnable
 */

const fs = require('fs');
const path = require('path');

// Configuration des tests
const CONFIG = {
  projectRoot: '/Users/essykouame/.cursor/worktrees/gemou2-poc/1760588725147-e7f735/',
  webAppPath: 'apps/web/app',
  mobileAppPath: 'apps/mobile/app',
  componentsPath: 'apps/web/components',
  outputDir: 'test-results',
  outputFile: null // Sera généré avec la date
};

// Routes à analyser
const ROUTES_TO_TEST = {
  // Routes publiques
  public: [
    { path: '/', name: 'Landing Page', file: 'page.tsx' },
    { path: '/onboarding', name: 'Onboarding', file: 'onboarding/page.tsx' },
    { path: '/login', name: 'Connexion', file: 'login/page.tsx' },
    { path: '/register', name: 'Inscription', file: 'register/page.tsx' },
    { path: '/forgot-password', name: 'Mot de passe oublié', file: 'forgot-password/page.tsx' }
  ],
  
  // Routes protégées avec tabs
  protected: [
    { path: '/(tabs)/dashboard', name: 'Dashboard', file: 'dashboard/page.tsx' },
    { path: '/(tabs)/events', name: 'Événements', file: 'events/page.tsx' },
    { path: '/(tabs)/events/[id]', name: 'Détail Événement', file: 'events/[id]/page.tsx' },
    { path: '/(tabs)/marketplace', name: 'Marketplace', file: 'marketplace/page.tsx' },
    { path: '/(tabs)/community', name: 'Communauté', file: 'community/page.tsx' },
    { path: '/(tabs)/profile', name: 'Profil', file: 'profile/page.tsx' }
  ],
  
  // Routes d'actions
  actions: [
    { path: '/create-event', name: 'Créer Événement', file: 'create-event/page.tsx' },
    { path: '/create-trade', name: 'Créer Annonce', file: 'create-trade/page.tsx' },
    { path: '/trade/[id]', name: 'Détail Annonce', file: 'trade/[id]/page.tsx' },
    { path: '/profile/[username]', name: 'Profil Public', file: 'profile/[username]/page.tsx' }
  ],
  
  // Routes admin
  admin: [
    { path: '/admin/create-event', name: 'Admin - Créer Événement', file: 'admin/create-event/page.tsx' }
  ]
};

// Composants UI attendus
const EXPECTED_COMPONENTS = {
  // Composants de base
  basic: [
    'Button', 'Card', 'Input', 'LoadingSpinner', 'Modal', 'Table'
  ],
  
  // Composants de navigation
  navigation: [
    'Header', 'Sidebar', 'Breadcrumb', 'UserMenu'
  ],
  
  // Composants spécialisés
  specialized: [
    'AuthForm', 'EventsList', 'EventsSlider', 'CreateEventForm',
    'MarketplaceListings', 'UsersRecommendations', 'GamesRecommendations'
  ]
};

// Fonctionnalités attendues par route
const EXPECTED_FEATURES = {
  '/': {
    components: ['Header', 'Card', 'Button', 'AuthForm'],
    features: ['Landing page', 'Authentification', 'Navigation', 'Redirection']
  },
  '/onboarding': {
    components: ['OnboardingCarousel'],
    features: ['Carousel 4 slides', 'Navigation', 'Storage cross-platform']
  },
  '/login': {
    components: ['Input', 'Button', 'Card', 'LoadingSpinner'],
    features: ['Formulaire connexion', 'Validation email', 'Gestion erreurs', 'Redirection']
  },
  '/register': {
    components: ['Input', 'Button', 'Card', 'LoadingSpinner'],
    features: ['Formulaire inscription', 'Validation username', 'Validation email', 'Création compte']
  },
  '/forgot-password': {
    components: ['Input', 'Button', 'Card'],
    features: ['Reset password', 'Envoi email', 'Validation']
  },
  '/(tabs)/dashboard': {
    components: ['ResponsiveLayout', 'EventsSlider', 'UsersRecommendations', 'MarketplaceListings', 'GamesRecommendations'],
    features: ['Tableau de bord', 'Statistiques', 'Recommandations', 'Navigation']
  },
  '/(tabs)/events': {
    components: ['EventsList', 'Button', 'Card'],
    features: ['Liste événements', 'Filtres', 'Recherche', 'Participation']
  },
  '/(tabs)/events/[id]': {
    components: ['Card', 'Button', 'LoadingSpinner'],
    features: ['Détail événement', 'Participation', 'Liste participants', 'Informations créateur']
  },
  '/(tabs)/marketplace': {
    components: ['MarketplaceListings', 'Card', 'Button'],
    features: ['Liste annonces', 'Filtres par type', 'Recherche', 'Navigation']
  },
  '/(tabs)/community': {
    components: ['Card'],
    features: ['Espace communautaire', 'Placeholder fonctionnalité']
  },
  '/(tabs)/profile': {
    components: ['Card', 'Button'],
    features: ['Profil utilisateur', 'Statistiques', 'Actions']
  },
  '/create-event': {
    components: ['CreateEventForm', 'ResponsiveLayout'],
    features: ['Formulaire création', 'Validation', 'Upload images', 'Géolocalisation']
  },
  '/create-trade': {
    components: ['Input', 'Button', 'Card', 'ImageUpload', 'LocationAutocomplete', 'GameSelect'],
    features: ['Formulaire annonce', 'Sélection jeu', 'Upload images', 'Géolocalisation', 'Validation']
  },
  '/trade/[id]': {
    components: ['Card', 'Button'],
    features: ['Détail annonce', 'Contact vendeur', 'Informations jeu']
  },
  '/profile/[username]': {
    components: ['Card'],
    features: ['Profil public', 'Statistiques', 'Actions']
  }
};

// Classe principale de test
class ComprehensiveTestSuite {
  constructor() {
    this.results = {
      routes: {},
      components: {},
      features: {},
      summary: {
        totalRoutes: 0,
        workingRoutes: 0,
        missingComponents: [],
        missingFeatures: [],
        issues: []
      }
    };
    
    // Générer le nom de fichier avec la date
    this.generateOutputFileName();
  }

  // Générer le nom de fichier avec la date
  generateOutputFileName() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // Format HH-MM-SS
    
    CONFIG.outputFile = `${dateStr}_${timeStr}_rapport-tests-complet.md`;
  }

  // Analyser une route spécifique
  async analyzeRoute(route) {
    const routeResults = {
      path: route.path,
      name: route.name,
      file: route.file,
      components: {
        present: [],
        missing: [],
        working: []
      },
      features: {
        present: [],
        missing: [],
        working: []
      },
      issues: [],
      status: 'unknown'
    };

    try {
      // Vérifier l'existence du fichier
      const filePath = path.join(CONFIG.projectRoot, CONFIG.webAppPath, route.file);
      const fileExists = fs.existsSync(filePath);
      
      if (!fileExists) {
        routeResults.issues.push(`Fichier manquant: ${route.file}`);
        routeResults.status = 'missing';
        return routeResults;
      }

      // Lire le contenu du fichier
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Analyser les composants
      const expectedComponents = EXPECTED_FEATURES[route.path]?.components || [];
      for (const component of expectedComponents) {
        if (this.checkComponentInFile(fileContent, component)) {
          routeResults.components.present.push(component);
          routeResults.components.working.push(component);
        } else {
          routeResults.components.missing.push(component);
        }
      }

      // Analyser les fonctionnalités
      const expectedFeatures = EXPECTED_FEATURES[route.path]?.features || [];
      for (const feature of expectedFeatures) {
        if (this.checkFeatureInFile(fileContent, feature)) {
          routeResults.features.present.push(feature);
          routeResults.features.working.push(feature);
        } else {
          routeResults.features.missing.push(feature);
        }
      }

      // Déterminer le statut
      if (routeResults.components.missing.length === 0 && routeResults.features.missing.length === 0) {
        routeResults.status = 'working';
      } else if (routeResults.components.missing.length > 0 || routeResults.features.missing.length > 0) {
        routeResults.status = 'partial';
      }

    } catch (error) {
      routeResults.issues.push(`Erreur lors de l'analyse: ${error.message}`);
      routeResults.status = 'error';
    }

    return routeResults;
  }

  // Vérifier la présence d'un composant dans le fichier
  checkComponentInFile(content, component) {
    // Rechercher l'import du composant
    const importPatterns = [
      new RegExp(`import.*${component}.*from`, 'g'),
      new RegExp(`from.*${component}`, 'g'),
      new RegExp(`<${component}`, 'g'),
      new RegExp(`${component}\\.`, 'g')
    ];

    return importPatterns.some(pattern => pattern.test(content));
  }

  // Vérifier la présence d'une fonctionnalité dans le fichier
  checkFeatureInFile(content, feature) {
    const featurePatterns = {
      'Landing page': ['LandingPage', 'Bienvenue', 'Hero'],
      'Authentification': ['auth', 'login', 'signIn', 'signUp'],
      'Navigation': ['router', 'navigation', 'href'],
      'Redirection': ['redirect', 'push', 'replace'],
      'Carousel 4 slides': ['OnboardingCarousel', 'slides'],
      'Storage cross-platform': ['localStorage', 'storage'],
      'Formulaire connexion': ['signInWithPassword', 'email', 'password'],
      'Validation email': ['validateEmail', 'emailRegex'],
      'Gestion erreurs': ['error', 'catch', 'try'],
      'Formulaire inscription': ['signUp', 'register', 'firstName', 'lastName'],
      'Validation username': ['username', 'useUsernameValidation'],
      'Création compte': ['signUp', 'register'],
      'Reset password': ['resetPassword', 'forgot'],
      'Envoi email': ['sendPasswordResetEmail'],
      'Tableau de bord': ['dashboard', 'stats', 'statistics'],
      'Statistiques': ['stats', 'count', 'number'],
      'Recommandations': ['recommendations', 'suggestions'],
      'Liste événements': ['EventsList', 'events'],
      'Filtres': ['filter', 'search'],
      'Recherche': ['search', 'query'],
      'Participation': ['participate', 'join', 'event_participants'],
      'Détail événement': ['event', 'details', 'EventPage'],
      'Liste participants': ['participants', 'users'],
      'Informations créateur': ['creator', 'organizer'],
      'Liste annonces': ['MarketplaceListings', 'marketplace'],
      'Filtres par type': ['type', 'filter', 'sale', 'exchange'],
      'Espace communautaire': ['community', 'users'],
      'Placeholder fonctionnalité': ['à venir', 'placeholder', 'coming soon'],
      'Profil utilisateur': ['profile', 'user'],
      'Actions': ['actions', 'buttons'],
      'Formulaire création': ['CreateEventForm', 'form'],
      'Upload images': ['upload', 'image', 'file'],
      'Géolocalisation': ['location', 'address', 'coordinates'],
      'Formulaire annonce': ['CreateTradeForm', 'marketplace'],
      'Sélection jeu': ['GameSelect', 'game'],
      'Contact vendeur': ['seller', 'contact'],
      'Informations jeu': ['game', 'details']
    };

    const patterns = featurePatterns[feature] || [feature.toLowerCase()];
    return patterns.some(pattern => 
      content.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Exécuter tous les tests
  async runAllTests() {
    console.log('🧪 Démarrage de la suite de tests complète...\n');

    // Tester toutes les routes
    const allRoutes = [
      ...ROUTES_TO_TEST.public,
      ...ROUTES_TO_TEST.protected,
      ...ROUTES_TO_TEST.actions,
      ...ROUTES_TO_TEST.admin
    ];

    this.results.summary.totalRoutes = allRoutes.length;

    for (const route of allRoutes) {
      console.log(`📋 Analyse de ${route.name} (${route.path})...`);
      const routeResult = await this.analyzeRoute(route);
      this.results.routes[route.path] = routeResult;
      
      if (routeResult.status === 'working') {
        this.results.summary.workingRoutes++;
      }
      
      // Collecter les composants et fonctionnalités manquants
      this.results.summary.missingComponents.push(...routeResult.components.missing);
      this.results.summary.missingFeatures.push(...routeResult.features.missing);
      this.results.summary.issues.push(...routeResult.issues);
    }

    // Analyser les composants globaux
    await this.analyzeGlobalComponents();
    
    // Générer le rapport
    await this.generateReport();
  }

  // Analyser les composants globaux
  async analyzeGlobalComponents() {
    console.log('🔍 Analyse des composants globaux...');
    
    const componentsPath = path.join(CONFIG.projectRoot, CONFIG.componentsPath);
    
    // Vérifier l'existence des composants UI
    const uiComponents = [
      'Button', 'Card', 'Input', 'Loading', 'Modal', 'Navigation', 'Table'
    ];
    
    for (const component of uiComponents) {
      const componentFile = path.join(componentsPath, 'ui', `${component}.tsx`);
      const exists = fs.existsSync(componentFile);
      
      this.results.components[component] = {
        exists,
        path: componentFile,
        status: exists ? 'present' : 'missing'
      };
    }
  }

  // Générer le rapport final
  async generateReport() {
    console.log('📊 Génération du rapport final...');
    
    // Créer le dossier test-results s'il n'existe pas
    const outputDir = path.join(CONFIG.projectRoot, CONFIG.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Dossier créé: ${outputDir}`);
    }
    
    const report = this.generateMarkdownReport();
    
    const outputPath = path.join(outputDir, CONFIG.outputFile);
    fs.writeFileSync(outputPath, report, 'utf8');
    
    console.log(`✅ Rapport généré: ${outputPath}`);
    console.log(`📈 Résumé: ${this.results.summary.workingRoutes}/${this.results.summary.totalRoutes} routes fonctionnelles`);
  }

  // Générer le rapport Markdown
  generateMarkdownReport() {
    const { routes, components, summary } = this.results;
    const now = new Date();
    const dateStr = now.toLocaleString('fr-FR');
    
    let report = `# 🧪 RAPPORT DE TESTS COMPLET - GÉMOU2

*Généré le ${dateStr}*
*Fichier: ${CONFIG.outputFile}*

## 📊 SYNTHÈSE GÉNÉRALE

- **Routes analysées** : ${summary.totalRoutes}
- **Routes fonctionnelles** : ${summary.workingRoutes}
- **Taux de réussite** : ${Math.round((summary.workingRoutes / summary.totalRoutes) * 100)}%
- **Composants manquants** : ${summary.missingComponents.length}
- **Fonctionnalités manquantes** : ${summary.missingFeatures.length}

---

## 📋 DÉTAIL PAR ROUTE

`;

    // Routes publiques
    report += `### 🌐 Routes Publiques\n\n`;
    for (const route of ROUTES_TO_TEST.public) {
      const result = routes[route.path];
      if (result) {
        report += this.generateRouteReport(route, result);
      }
    }

    // Routes protégées
    report += `### 🔐 Routes Protégées (Tabs)\n\n`;
    for (const route of ROUTES_TO_TEST.protected) {
      const result = routes[route.path];
      if (result) {
        report += this.generateRouteReport(route, result);
      }
    }

    // Routes d'actions
    report += `### ⚡ Routes d'Actions\n\n`;
    for (const route of ROUTES_TO_TEST.actions) {
      const result = routes[route.path];
      if (result) {
        report += this.generateRouteReport(route, result);
      }
    }

    // Routes admin
    report += `### 👑 Routes Admin\n\n`;
    for (const route of ROUTES_TO_TEST.admin) {
      const result = routes[route.path];
      if (result) {
        report += this.generateRouteReport(route, result);
      }
    }

    // Analyse des composants
    report += `## 🧩 ANALYSE DES COMPOSANTS

`;

    for (const [component, info] of Object.entries(components)) {
      const status = info.status === 'present' ? '✅' : '❌';
      report += `- ${status} **${component}** : ${info.status}\n`;
    }

    // Recommandations
    report += `## 🎯 RECOMMANDATIONS

### Composants à implémenter
`;

    const uniqueMissingComponents = [...new Set(summary.missingComponents)];
    for (const component of uniqueMissingComponents) {
      report += `- [ ] Implémenter le composant **${component}**\n`;
    }

    report += `\n### Fonctionnalités à développer
`;

    const uniqueMissingFeatures = [...new Set(summary.missingFeatures)];
    for (const feature of uniqueMissingFeatures) {
      report += `- [ ] Développer la fonctionnalité **${feature}**\n`;
    }

    report += `\n### Problèmes identifiés
`;

    const uniqueIssues = [...new Set(summary.issues)];
    for (const issue of uniqueIssues) {
      report += `- ⚠️ ${issue}\n`;
    }

    report += `\n---

*Rapport généré automatiquement par la suite de tests Gémou2*
`;

    return report;
  }

  // Générer le rapport pour une route spécifique
  generateRouteReport(route, result) {
    const status = this.getStatusEmoji(result.status);
    
    let routeReport = `#### ${status} ${route.name} (\`${route.path}\`)

**Statut** : ${result.status}
**Fichier** : \`${route.file}\`

`;

    // Composants
    if (result.components.present.length > 0) {
      routeReport += `**Composants présents** :\n`;
      for (const component of result.components.present) {
        routeReport += `- ✅ ${component}\n`;
      }
      routeReport += `\n`;
    }

    if (result.components.missing.length > 0) {
      routeReport += `**Composants manquants** :\n`;
      for (const component of result.components.missing) {
        routeReport += `- ❌ ${component}\n`;
      }
      routeReport += `\n`;
    }

    // Fonctionnalités
    if (result.features.present.length > 0) {
      routeReport += `**Fonctionnalités présentes** :\n`;
      for (const feature of result.features.present) {
        routeReport += `- ✅ ${feature}\n`;
      }
      routeReport += `\n`;
    }

    if (result.features.missing.length > 0) {
      routeReport += `**Fonctionnalités manquantes** :\n`;
      for (const feature of result.features.missing) {
        routeReport += `- ❌ ${feature}\n`;
      }
      routeReport += `\n`;
    }

    // Problèmes
    if (result.issues.length > 0) {
      routeReport += `**Problèmes identifiés** :\n`;
      for (const issue of result.issues) {
        routeReport += `- ⚠️ ${issue}\n`;
      }
      routeReport += `\n`;
    }

    routeReport += `---\n\n`;
    return routeReport;
  }

  // Obtenir l'emoji de statut
  getStatusEmoji(status) {
    const statusEmojis = {
      'working': '✅',
      'partial': '⚠️',
      'missing': '❌',
      'error': '💥',
      'unknown': '❓'
    };
    return statusEmojis[status] || '❓';
  }
}

// Exécution de la suite de tests
async function main() {
  console.log('🚀 SUITE DE TESTS COMPLÈTE - GÉMOU2');
  console.log('=====================================\n');
  
  const testSuite = new ComprehensiveTestSuite();
  await testSuite.runAllTests();
  
  console.log('\n🎉 Tests terminés !');
  console.log(`📄 Rapport disponible: ${CONFIG.outputDir}/${CONFIG.outputFile}`);
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComprehensiveTestSuite;
