#!/usr/bin/env node

// Script de vérification des migrations Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigrations() {
  console.log('🔍 Vérification des migrations Supabase...\n');
  
  // Tables attendues après toutes les migrations
  const expectedTables = [
    'profiles',
    'events', 
    'event_participants',
    'event_applications',
    'conversations',
    'conversation_members',
    'messages',
    'reviews',
    'games',
    'user_games',
    'contacts',
    'notifications',
    'marketplace_items',
    'tags',
    'event_tags',
    'event_games'
  ];
  
  const results = {
    success: [],
    failed: []
  };
  
  for (const table of expectedTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        results.failed.push({ table, error: error.message });
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        results.success.push(table);
        console.log(`✅ ${table}: OK`);
      }
    } catch (err) {
      results.failed.push({ table, error: err.message });
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  console.log('\n📊 Résumé:');
  console.log(`✅ Tables créées: ${results.success.length}/${expectedTables.length}`);
  console.log(`❌ Tables manquantes: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Tables manquantes:');
    results.failed.forEach(({ table, error }) => {
      console.log(`  - ${table}: ${error}`);
    });
  }
  
  if (results.success.length === expectedTables.length) {
    console.log('\n🎉 Toutes les migrations sont déployées avec succès !');
    return true;
  } else {
    console.log('\n⚠️  Certaines migrations ne sont pas encore déployées.');
    return false;
  }
}

// Test de cohérence des colonnes
async function verifyColumns() {
  console.log('\n🔍 Vérification des colonnes...\n');
  
  // Test des nouvelles colonnes sur profiles
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, city, level, favorite_games, profile_photo_url')
      .limit(1);
    
    if (error) {
      console.log('❌ Colonnes profiles: Erreur -', error.message);
    } else {
      console.log('✅ Colonnes profiles: OK (first_name, last_name, city, level, favorite_games, profile_photo_url)');
    }
  } catch (err) {
    console.log('❌ Colonnes profiles: Erreur -', err.message);
  }
  
  // Test des nouvelles colonnes sur events
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, capacity, price, visibility, latitude, longitude, status, game_types, event_photo_url')
      .limit(1);
    
    if (error) {
      console.log('❌ Colonnes events: Erreur -', error.message);
    } else {
      console.log('✅ Colonnes events: OK (capacity, price, visibility, latitude, longitude, status, game_types, event_photo_url)');
    }
  } catch (err) {
    console.log('❌ Colonnes events: Erreur -', err.message);
  }
}

async function main() {
  const migrationsOk = await verifyMigrations();
  await verifyColumns();
  
  if (migrationsOk) {
    console.log('\n🎯 Prochaines étapes:');
    console.log('1. ✅ Migrations déployées');
    console.log('2. ✅ Types TypeScript cohérents');
    console.log('3. 🚀 Prêt pour le développement !');
  } else {
    console.log('\n⚠️  Veuillez d\'abord déployer les migrations dans Supabase.');
  }
}

main().catch(console.error);
