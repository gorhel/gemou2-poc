#!/usr/bin/env node

/**
 * Script de diagnostic des performances de l'application
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnosePerformance() {
  console.log('🔍 Diagnostic des performances de l\'application...\n');

  const results = {
    supabaseConnection: false,
    tableAccess: {},
    queryPerformance: {},
    recommendations: []
  };

  try {
    // 1. Test de connexion Supabase
    console.log('1. Test de connexion Supabase...');
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    const connectionTime = Date.now() - startTime;
    
    if (error) {
      console.log(`❌ Erreur de connexion: ${error.message}`);
      results.recommendations.push('Vérifiez votre connexion internet et les clés Supabase');
    } else {
      console.log(`✅ Connexion réussie en ${connectionTime}ms`);
      results.supabaseConnection = true;
      
      if (connectionTime > 1000) {
        results.recommendations.push('Connexion Supabase lente (>1s). Vérifiez votre réseau');
      }
    }
    console.log('');

    // 2. Test des tables principales
    console.log('2. Test des performances des tables...');
    
    const tables = ['profiles', 'events', 'event_participants', 'event_games'];
    
    for (const table of tables) {
      try {
        const startTime = Date.now();
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(10);
        
        const queryTime = Date.now() - startTime;
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
          results.tableAccess[table] = { success: false, time: queryTime, error: error.message };
        } else {
          console.log(`✅ Table ${table}: ${queryTime}ms (${data?.length || 0} enregistrements)`);
          results.tableAccess[table] = { success: true, time: queryTime, count: data?.length || 0 };
          
          if (queryTime > 500) {
            results.recommendations.push(`Table ${table} lente (${queryTime}ms). Vérifiez les index`);
          }
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
        results.tableAccess[table] = { success: false, time: 0, error: err.message };
      }
    }
    console.log('');

    // 3. Test de requêtes complexes
    console.log('3. Test de requêtes complexes...');
    
    try {
      const startTime = Date.now();
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`
          id, title, description, date_time, location, 
          max_participants, current_participants, status,
          profiles!events_creator_id_fkey(username, full_name)
        `)
        .limit(5);
      
      const complexQueryTime = Date.now() - startTime;
      
      if (eventsError) {
        console.log(`❌ Requête complexe: ${eventsError.message}`);
        results.queryPerformance.complexQuery = { success: false, time: complexQueryTime, error: eventsError.message };
      } else {
        console.log(`✅ Requête complexe: ${complexQueryTime}ms (${events?.length || 0} événements)`);
        results.queryPerformance.complexQuery = { success: true, time: complexQueryTime, count: events?.length || 0 };
        
        if (complexQueryTime > 1000) {
          results.recommendations.push('Requêtes complexes lentes. Vérifiez les jointures et index');
        }
      }
    } catch (err) {
      console.log(`❌ Requête complexe: ${err.message}`);
      results.queryPerformance.complexQuery = { success: false, time: 0, error: err.message };
    }
    console.log('');

    // 4. Test de la table event_games (si elle existe)
    console.log('4. Test de la table event_games...');
    try {
      const startTime = Date.now();
      const { data: eventGames, error: eventGamesError } = await supabase
        .from('event_games')
        .select('*')
        .limit(5);
      
      const eventGamesTime = Date.now() - startTime;
      
      if (eventGamesError) {
        console.log(`❌ Table event_games: ${eventGamesError.message}`);
        results.queryPerformance.eventGames = { success: false, time: eventGamesTime, error: eventGamesError.message };
        results.recommendations.push('Table event_games manquante. Appliquez les migrations');
      } else {
        console.log(`✅ Table event_games: ${eventGamesTime}ms (${eventGames?.length || 0} jeux)`);
        results.queryPerformance.eventGames = { success: true, time: eventGamesTime, count: eventGames?.length || 0 };
      }
    } catch (err) {
      console.log(`❌ Table event_games: ${err.message}`);
      results.queryPerformance.eventGames = { success: false, time: 0, error: err.message };
    }
    console.log('');

    // 5. Analyse des performances
    console.log('5. Analyse des performances...');
    
    const allTimes = Object.values(results.tableAccess)
      .filter(t => t.success)
      .map(t => t.time);
    
    const avgTime = allTimes.length > 0 ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length : 0;
    const maxTime = Math.max(...allTimes, 0);
    
    console.log(`📊 Statistiques:`);
    console.log(`   - Temps moyen: ${avgTime.toFixed(2)}ms`);
    console.log(`   - Temps maximum: ${maxTime}ms`);
    console.log(`   - Tables accessibles: ${Object.values(results.tableAccess).filter(t => t.success).length}/${tables.length}`);
    console.log('');

    // 6. Recommandations
    console.log('6. Recommandations:');
    if (results.recommendations.length === 0) {
      console.log('✅ Aucun problème de performance détecté');
    } else {
      results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    console.log('');

    // 7. Solutions suggérées
    console.log('7. Solutions suggérées:');
    console.log('   - Redémarrez l\'application: npm run dev');
    console.log('   - Vérifiez votre connexion internet');
    console.log('   - Appliquez les migrations manquantes');
    console.log('   - Vérifiez les index de la base de données');
    console.log('   - Utilisez Supabase local pour le développement');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
    results.recommendations.push('Erreur générale. Vérifiez la configuration');
  }

  return results;
}

// Exécuter le diagnostic
diagnosePerformance();
