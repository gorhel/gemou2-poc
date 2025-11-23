#!/usr/bin/env node

/**
 * Script pour générer les assets PNG depuis les SVG
 * 
 * Prérequis :
 * - ImageMagick installé (brew install imagemagick sur Mac)
 * - Ou utiliser un convertisseur en ligne
 * 
 * Usage :
 * node generate-assets.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const assetsDir = __dirname;
const logoIcon = path.join(assetsDir, 'logo-icon.svg');

console.log('🎨 Génération des assets PNG pour Machi...\n');

// Vérifier si ImageMagick est disponible
try {
  execSync('which convert', { stdio: 'ignore' });
  console.log('✅ ImageMagick détecté\n');
  
  // Générer icon.png (1024x1024)
  console.log('📱 Génération de icon.png (1024x1024)...');
  execSync(`convert -background none -resize 1024x1024 "${logoIcon}" "${path.join(assetsDir, 'icon.png')}"`);
  console.log('✅ icon.png créé\n');
  
  // Copier pour adaptive-icon.png
  console.log('📱 Génération de adaptive-icon.png (1024x1024)...');
  execSync(`cp "${path.join(assetsDir, 'icon.png')}" "${path.join(assetsDir, 'adaptive-icon.png')}"`);
  console.log('✅ adaptive-icon.png créé\n');
  
  // Générer favicon.png (48x48)
  console.log('🌐 Génération de favicon.png (48x48)...');
  execSync(`convert -background none -resize 48x48 "${logoIcon}" "${path.join(assetsDir, 'favicon.png')}"`);
  console.log('✅ favicon.png créé\n');
  
  // Générer splash.png (1284x2778 avec fond)
  console.log('🚀 Génération de splash.png (1284x2778 avec fond #6366F1)...');
  execSync(`convert -size 1284x2778 xc:#6366F1 -gravity center "${logoIcon}" -resize 400x400 -composite "${path.join(assetsDir, 'splash.png')}"`);
  console.log('✅ splash.png créé\n');
  
  console.log('🎉 Tous les assets ont été générés avec succès!');
  console.log('\n📋 Fichiers créés :');
  console.log('  - icon.png (1024x1024)');
  console.log('  - adaptive-icon.png (1024x1024)');
  console.log('  - favicon.png (48x48)');
  console.log('  - splash.png (1284x2778)');
  console.log('\n💡 N\'oubliez pas de copier favicon.png vers apps/web/public/favicon.ico');
  
} catch (error) {
  console.log('❌ ImageMagick n\'est pas installé ou non disponible\n');
  console.log('📝 Alternatives :');
  console.log('  1. Installer ImageMagick : brew install imagemagick (Mac)');
  console.log('  2. Utiliser un convertisseur en ligne (voir generate-png-assets.md)');
  console.log('  3. Utiliser un éditeur graphique (Figma, Sketch, Illustrator)');
  console.log('\n📖 Voir generate-png-assets.md pour plus de détails');
  process.exit(1);
}

