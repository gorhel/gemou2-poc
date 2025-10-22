#!/usr/bin/env node

/**
 * Script de vérification de la configuration du Marketplace
 * 
 * Usage: node scripts/check-marketplace-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration du Marketplace...\n');

let allGood = true;

// Vérifier que les fichiers existent
const requiredFiles = [
  'apps/web/app/create-trade/page.tsx',
  'apps/web/app/trade/[id]/page.tsx',
  'apps/web/components/marketplace/GameSelect.tsx',
  'apps/web/components/marketplace/ImageUpload.tsx',
  'apps/web/components/marketplace/LocationAutocomplete.tsx',
  'apps/web/types/marketplace.ts',
  'supabase/migrations/20251009120000_add_marketplace_trade_features.sql',
];

console.log('📁 Vérification des fichiers...\n');

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MANQUANT`);
    allGood = false;
  }
});

// Vérifier que le composant GameSelect utilise bien Supabase
console.log('\n🔍 Vérification du code...\n');

const gameSelectPath = path.join(process.cwd(), 'apps/web/components/marketplace/GameSelect.tsx');
if (fs.existsSync(gameSelectPath)) {
  const gameSelectContent = fs.readFileSync(gameSelectPath, 'utf8');
  
  if (gameSelectContent.includes('createClientSupabaseClient')) {
    console.log('  ✅ GameSelect utilise Supabase');
  } else {
    console.log('  ⚠️  GameSelect pourrait ne pas utiliser Supabase correctement');
  }
  
  if (gameSelectContent.includes('.from(\'games\')')) {
    console.log('  ✅ GameSelect interroge la table games');
  } else {
    console.log('  ❌ GameSelect ne semble pas interroger la table games');
    allGood = false;
  }
}

// Vérifier que ImageUpload utilise le bon bucket
const imageUploadPath = path.join(process.cwd(), 'apps/web/components/marketplace/ImageUpload.tsx');
if (fs.existsSync(imageUploadPath)) {
  const imageUploadContent = fs.readFileSync(imageUploadPath, 'utf8');
  
  if (imageUploadContent.includes('marketplace-images')) {
    console.log('  ✅ ImageUpload utilise le bucket marketplace-images');
  } else {
    console.log('  ❌ ImageUpload n\'utilise pas le bon bucket');
    allGood = false;
  }
}

// Vérifier que les types sont correctement importés
const createTradePath = path.join(process.cwd(), 'apps/web/app/create-trade/page.tsx');
if (fs.existsSync(createTradePath)) {
  const createTradeContent = fs.readFileSync(createTradePath, 'utf8');
  
  if (createTradeContent.includes('validateMarketplaceForm')) {
    console.log('  ✅ create-trade utilise validateMarketplaceForm');
  } else {
    console.log('  ⚠️  create-trade pourrait manquer la validation');
  }
  
  if (createTradeContent.includes('\'use client\'')) {
    console.log('  ✅ create-trade est un composant client (correct)');
  } else {
    console.log('  ❌ create-trade devrait être un composant client');
    allGood = false;
  }
}

// Vérifier la migration SQL
console.log('\n🗄️  Vérification de la migration SQL...\n');

const migrationPath = path.join(process.cwd(), 'supabase/migrations/20251009120000_add_marketplace_trade_features.sql');
if (fs.existsSync(migrationPath)) {
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  
  const requiredElements = [
    { name: 'game_id', pattern: /ADD COLUMN.*game_id/i },
    { name: 'custom_game_name', pattern: /ADD COLUMN.*custom_game_name/i },
    { name: 'wanted_game', pattern: /ADD COLUMN.*wanted_game/i },
    { name: 'delivery_available', pattern: /ADD COLUMN.*delivery_available/i },
    { name: 'location_quarter', pattern: /ADD COLUMN.*location_quarter/i },
    { name: 'location_city', pattern: /ADD COLUMN.*location_city/i },
    { name: 'vue enrichie', pattern: /CREATE OR REPLACE VIEW marketplace_items_enriched/i },
    { name: 'fonction conversation', pattern: /CREATE OR REPLACE FUNCTION create_marketplace_conversation/i },
  ];
  
  requiredElements.forEach(({ name, pattern }) => {
    if (pattern.test(migrationContent)) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name} - MANQUANT`);
      allGood = false;
    }
  });
}

// Résumé final
console.log('\n' + '='.repeat(60) + '\n');

if (allGood) {
  console.log('🎉 TOUT EST OK !\n');
  console.log('Prochaines étapes :');
  console.log('1. ⚠️  CRÉER le bucket Supabase Storage "marketplace-images"');
  console.log('2. 🧪 Tester sur /create-trade');
  console.log('3. ✅ Tout devrait fonctionner !');
  console.log('\nVoir MARKETPLACE_PRET.md pour les instructions complètes.');
} else {
  console.log('❌ PROBLÈMES DÉTECTÉS\n');
  console.log('Certains fichiers ou éléments manquent.');
  console.log('Vérifiez les erreurs ci-dessus et corrigez-les.');
}

console.log('\n' + '='.repeat(60) + '\n');

process.exit(allGood ? 0 : 1);

