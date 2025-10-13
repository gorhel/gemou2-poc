#!/usr/bin/env node

/**
 * Test d'import de Supabase pour diagnostiquer le problème
 */

console.log('🧪 Test d\'import de Supabase...\n');

try {
  console.log('1. Test d\'import du module supabase...');
  const { supabase } = require('./lib/supabase');
  console.log('✅ Import réussi !');
  
  console.log('\n2. Test des propriétés...');
  console.log('URL:', supabase.supabaseUrl);
  console.log('Clé:', supabase.supabaseKey ? supabase.supabaseKey.substring(0, 20) + '...' : 'undefined');
  
  console.log('\n3. Test de connexion...');
  supabase
    .from('profiles')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Erreur de connexion:', error.message);
      } else {
        console.log('✅ Connexion réussie !');
      }
    })
    .catch(err => {
      console.log('❌ Erreur:', err.message);
    });
    
} catch (error) {
  console.log('❌ Erreur d\'import:', error.message);
  console.log('Stack:', error.stack);
}
