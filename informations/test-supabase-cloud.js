#!/usr/bin/env node

/**
 * Script de test pour vérifier la connexion à Supabase Cloud
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase Cloud
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseCloud() {
  console.log('☁️  Test de connexion à Supabase Cloud...\n');

  try {
    // 1. Test de connexion
    console.log('1. Test de connexion à Supabase Cloud...');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Mode: ${supabaseUrl.includes('localhost') ? 'LOCAL' : 'CLOUD'}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Erreur de connexion: ${error.message}`);
      return;
    }
    console.log('✅ Connexion à Supabase Cloud réussie\n');

    // 2. Test des tables principales
    console.log('2. Test des tables principales...');
    
    const tables = ['profiles', 'events', 'event_participants', 'event_games'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    console.log('');

    // 3. Test de récupération des événements
    console.log('3. Test de récupération des événements...');
    try {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, status, current_participants, max_participants')
        .limit(5);
      
      if (eventsError) {
        console.log(`❌ Erreur lors de la récupération des événements: ${eventsError.message}`);
      } else {
        console.log(`✅ ${events?.length || 0} événement(s) trouvé(s)`);
        if (events && events.length > 0) {
          events.forEach(event => {
            console.log(`   - ${event.title} (${event.current_participants}/${event.max_participants} participants)`);
          });
        }
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la récupération des événements: ${err.message}`);
    }
    console.log('');

    // 4. Test de la table event_games
    console.log('4. Test de la table event_games...');
    try {
      const { data: eventGames, error: eventGamesError } = await supabase
        .from('event_games')
        .select('*')
        .limit(5);
      
      if (eventGamesError) {
        console.log(`❌ Erreur lors de la récupération des jeux d'événements: ${eventGamesError.message}`);
        console.log('   💡 Cette table peut ne pas exister encore. Appliquez les migrations.');
      } else {
        console.log(`✅ ${eventGames?.length || 0} jeu(x) d'événement trouvé(s)`);
        if (eventGames && eventGames.length > 0) {
          eventGames.forEach(game => {
            console.log(`   - ${game.game_name || 'Sans nom'} (${game.is_custom ? 'Personnalisé' : 'Base de données'})`);
          });
        }
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la récupération des jeux d'événements: ${err.message}`);
    }
    console.log('');

    console.log('🎉 Tests terminés !');
    console.log('');
    console.log('📋 Prochaines étapes :');
    console.log('1. Si des tables manquent, appliquez les migrations');
    console.log('2. Démarrez votre application Next.js');
    console.log('3. Testez la création d\'événements');
    console.log('4. Testez la participation aux événements');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('');
    console.log('🔧 Solutions possibles :');
    console.log('1. Vérifiez que votre projet Supabase est actif');
    console.log('2. Vérifiez les clés API dans .env.local');
    console.log('3. Vérifiez que les migrations ont été appliquées');
    console.log('4. Vérifiez votre connexion internet');
  }
}

// Exécuter les tests
testSupabaseCloud();
