#!/usr/bin/env node

/**
 * Test simple pour vérifier que l'import de supabase fonctionne
 */

console.log('🧪 Test d\'import de Supabase...\n');

try {
  // Test d'import du client Supabase
  const { supabase } = require('./lib/supabase');
  
  console.log('✅ Import de supabase réussi !');
  console.log('📊 URL Supabase:', supabase.supabaseUrl);
  console.log('🔑 Clé anonyme:', supabase.supabaseKey.substring(0, 20) + '...');
  
  // Test de connexion simple
  console.log('\n🔌 Test de connexion...');
  
  supabase
    .from('profiles')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Erreur de connexion:', error.message);
      } else {
        console.log('✅ Connexion à Supabase réussie !');
      }
    })
    .catch(err => {
      console.log('❌ Erreur:', err.message);
    });
    
} catch (error) {
  console.log('❌ Erreur d\'import:', error.message);
  console.log('💡 Vérifiez que les dépendances sont installées');
}
