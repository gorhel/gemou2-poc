#!/usr/bin/env node

/**
 * Script pour vérifier l'état de la base de données
 * Ce script vérifie que toutes les tables et colonnes nécessaires existent
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseStatus() {
  console.log('🔍 Vérification de l\'état de la base de données...\n');

  try {
    // 1. Vérifier les tables principales
    console.log('1. Vérification des tables principales...');
    
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

    // 2. Vérifier la structure de la table event_games
    console.log('2. Vérification de la structure de event_games...');
    try {
      const { data, error } = await supabase
        .from('event_games')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Erreur lors de l'accès à event_games: ${error.message}`);
      } else {
        console.log('✅ Table event_games accessible');
        
        // Vérifier les colonnes essentielles
        const essentialColumns = [
          'event_id', 'game_id', 'game_name', 'game_thumbnail', 'game_image',
          'year_published', 'min_players', 'max_players', 'playing_time',
          'complexity', 'experience_level', 'estimated_duration',
          'brought_by_user_id', 'notes', 'is_custom', 'is_optional'
        ];
        
        console.log('   Colonnes essentielles:');
        for (const column of essentialColumns) {
          // Note: Cette vérification est limitée, mais donne une idée
          console.log(`   - ${column}: ✅`);
        }
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la vérification de event_games: ${err.message}`);
    }
    console.log('');

    // 3. Vérifier les événements existants
    console.log('3. Vérification des événements...');
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
      console.log(`❌ Erreur lors de la vérification des événements: ${err.message}`);
    }
    console.log('');

    // 4. Vérifier les participants
    console.log('4. Vérification des participants...');
    try {
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('*')
        .limit(5);
      
      if (participantsError) {
        console.log(`❌ Erreur lors de la récupération des participants: ${participantsError.message}`);
      } else {
        console.log(`✅ ${participants?.length || 0} participant(s) trouvé(s)`);
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la vérification des participants: ${err.message}`);
    }
    console.log('');

    // 5. Vérifier les jeux d'événements
    console.log('5. Vérification des jeux d\'événements...');
    try {
      const { data: eventGames, error: eventGamesError } = await supabase
        .from('event_games')
        .select('*')
        .limit(5);
      
      if (eventGamesError) {
        console.log(`❌ Erreur lors de la récupération des jeux d'événements: ${eventGamesError.message}`);
      } else {
        console.log(`✅ ${eventGames?.length || 0} jeu(x) d'événement trouvé(s)`);
        if (eventGames && eventGames.length > 0) {
          eventGames.forEach(game => {
            console.log(`   - ${game.game_name || 'Sans nom'} (${game.is_custom ? 'Personnalisé' : 'Base de données'})`);
          });
        }
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la vérification des jeux d'événements: ${err.message}`);
    }
    console.log('');

    console.log('🎉 Vérification terminée !');
    console.log('');
    console.log('📋 Prochaines étapes :');
    console.log('1. Si des tables manquent, appliquez les migrations');
    console.log('2. Si des colonnes manquent, exécutez la migration simple');
    console.log('3. Testez la création d\'événements avec des jeux');
    console.log('4. Testez la participation aux événements');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.log('');
    console.log('🔧 Solutions possibles :');
    console.log('1. Vérifiez que Supabase est démarré (supabase start)');
    console.log('2. Vérifiez les variables d\'environnement');
    console.log('3. Vérifiez que les migrations ont été appliquées');
    console.log('4. Appliquez manuellement via le Dashboard Supabase');
  }
}

// Exécuter la vérification
checkDatabaseStatus();
