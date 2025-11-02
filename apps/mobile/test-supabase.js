#!/usr/bin/env node

/**
 * Script de test simple pour vérifier la configuration Supabase
 */

console.log('🧪 Test de la configuration Supabase...\n');

// Test de la configuration
const supabaseUrl = 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0';

console.log('✅ URL Supabase:', supabaseUrl);
console.log('✅ Clé anonyme:', supabaseAnonKey.substring(0, 20) + '...');

// Test de connexion simple
async function testSupabaseConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('\n🔌 Test de connexion à Supabase...');
    
    // Test simple de connexion
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion à Supabase réussie !');
    return true;
    
  } catch (err) {
    console.log('❌ Erreur:', err.message);
    return false;
  }
}

// Exécuter le test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n🎉 Configuration Supabase OK !');
    console.log('📱 L\'application mobile devrait fonctionner maintenant.');
  } else {
    console.log('\n💥 Problème de configuration Supabase');
    console.log('🔧 Vérifiez vos clés et votre connexion internet.');
  }
});
