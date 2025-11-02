#!/usr/bin/env node

/**
 * Test spécifique pour Metro bundler
 */

console.log('🧪 Test Metro bundler...\n');

// Simuler l'environnement React Native
global.require = require;

try {
  console.log('1. Test d\'import du polyfill...');
  require('react-native-url-polyfill/auto');
  console.log('✅ Polyfill chargé');
  
  console.log('\n2. Test d\'import de Supabase...');
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ Supabase importé');
  
  console.log('\n3. Test de création du client...');
  const supabase = createClient(
    'https://qpnofwgxjgvmpwdrhzid.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0'
  );
  console.log('✅ Client Supabase créé');
  
  console.log('\n4. Test d\'export...');
  module.exports = { supabase };
  console.log('✅ Export réussi');
  
} catch (error) {
  console.log('❌ Erreur:', error.message);
  console.log('Stack:', error.stack);
}
