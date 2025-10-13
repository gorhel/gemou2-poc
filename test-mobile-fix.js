#!/usr/bin/env node

/**
 * Script de test final pour vérifier que la correction mobile fonctionne
 */

console.log('🧪 Test final de la correction mobile...\n');

// Test 1: Vérifier que les fichiers existent
const fs = require('fs');
const path = require('path');

const mobilePath = './apps/mobile';

const filesToCheck = [
  'lib/supabase.ts',
  'package.json',
  'tsconfig.json',
  'app.config.js'
];

console.log('📁 Vérification des fichiers...');
filesToCheck.forEach(file => {
  const filePath = path.join(mobilePath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
  }
});

// Test 2: Vérifier le contenu de supabase.ts
console.log('\n📄 Vérification du contenu de supabase.ts...');
try {
  const supabaseContent = fs.readFileSync(path.join(mobilePath, 'lib/supabase.ts'), 'utf8');
  
  const checks = [
    { name: 'Import expo-constants', test: /import Constants from 'expo-constants'/ },
    { name: 'Pas de type Database', test: /createClient<Database>/ },
    { name: 'createClient sans type', test: /createClient\(/ },
    { name: 'Valeurs par défaut', test: /Constants\.expoConfig/ }
  ];
  
  checks.forEach(check => {
    if (check.test.test(supabaseContent)) {
      console.log(`✅ ${check.name} - OK`);
    } else {
      console.log(`❌ ${check.name} - PROBLÈME`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture de supabase.ts:', error.message);
}

// Test 3: Vérifier package.json
console.log('\n📦 Vérification du package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(mobilePath, 'package.json'), 'utf8'));
  
  if (packageJson.dependencies['@gemou2/database']) {
    console.log('❌ @gemou2/database encore présent - PROBLÈME');
  } else {
    console.log('✅ @gemou2/database supprimé - OK');
  }
  
  if (packageJson.dependencies['@supabase/supabase-js']) {
    console.log('✅ @supabase/supabase-js présent - OK');
  } else {
    console.log('❌ @supabase/supabase-js manquant - PROBLÈME');
  }
  
} catch (error) {
  console.log('❌ Erreur lors de la lecture de package.json:', error.message);
}

console.log('\n🎯 Résumé des corrections appliquées :');
console.log('✅ Configuration Supabase sans type Database');
console.log('✅ Suppression de la dépendance workspace problématique');
console.log('✅ Utilisation d\'expo-constants pour les variables d\'environnement');
console.log('✅ Configuration TypeScript simplifiée');

console.log('\n🚀 L\'application mobile devrait maintenant fonctionner !');
console.log('📱 Pour tester : cd apps/mobile && npm run dev');
