// Test du système de participation via l'API web
const https = require('https');
const http = require('http');

async function testParticipationWeb() {
  console.log('🌐 Test du système de participation via l\'API web...\n');

  try {
    // Test 1: Vérifier que l'application web fonctionne
    console.log('1️⃣ Test de l\'application web...');
    
    const testUrl = 'http://localhost:3000';
    const response = await fetch(testUrl);
    
    if (response.ok) {
      console.log('✅ Application web accessible');
    } else {
      console.log(`❌ Application web non accessible: ${response.status}`);
      return;
    }

    // Test 2: Tester l'URL spécifique de l'événement
    console.log('\n2️⃣ Test de l\'URL de l\'événement...');
    
    const eventUrl = 'http://localhost:3000/events/3c5c2259-cec4-4315-ad32-3922dbfe94a3';
    const eventResponse = await fetch(eventUrl);
    
    if (eventResponse.ok) {
      console.log('✅ Page de l\'événement accessible');
      
      const html = await eventResponse.text();
      
      // Vérifier la présence d'éléments clés
      if (html.includes('current_participants')) {
        console.log('✅ Données de participation présentes dans la page');
      } else {
        console.log('⚠️ Données de participation manquantes dans la page');
      }
      
      if (html.includes('Rejoindre l\'événement') || html.includes('Quitter l\'événement')) {
        console.log('✅ Boutons de participation présents');
      } else {
        console.log('⚠️ Boutons de participation manquants');
      }
      
    } else {
      console.log(`❌ Page de l'événement non accessible: ${eventResponse.status}`);
    }

    // Test 3: Vérifier les erreurs dans la console
    console.log('\n3️⃣ Instructions pour le test manuel:');
    console.log('   1. Ouvrez http://localhost:3000/events/3c5c2259-cec4-4315-ad32-3922dbfe94a3');
    console.log('   2. Ouvrez les outils de développement (F12)');
    console.log('   3. Allez dans l\'onglet Console');
    console.log('   4. Vérifiez s\'il y a des erreurs JavaScript');
    console.log('   5. Testez le bouton de participation');
    console.log('   6. Rechargez la page et vérifiez la persistance');

    console.log('\n🎯 Problèmes potentiels à vérifier:');
    console.log('   - Double gestion des états (hook + page)');
    console.log('   - Conflits entre useEventParticipation et logique locale');
    console.log('   - Problèmes de synchronisation des données');
    console.log('   - Erreurs dans les requêtes Supabase');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Utiliser fetch si disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('⚠️ fetch non disponible, installation de node-fetch...');
  try {
    const { default: fetch } = require('node-fetch');
    global.fetch = fetch;
  } catch (e) {
    console.log('❌ Impossible d\'installer node-fetch. Test manuel requis.');
    console.log('   Veuillez ouvrir http://localhost:3000/events/3c5c2259-cec4-4315-ad32-3922dbfe94a3');
    console.log('   et vérifier manuellement le comportement de participation.');
    return;
  }
}

testParticipationWeb();

