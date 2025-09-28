#!/usr/bin/env node

/**
 * Script de test pour vérifier que Supabase local fonctionne correctement
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseLocal() {
  console.log('🧪 Test de Supabase local...\n');

  try {
    // 1. Test de connexion
    console.log('1. Test de connexion à Supabase local...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Erreur de connexion: ${error.message}`);
      return;
    }
    console.log('✅ Connexion à Supabase local réussie\n');

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

    // 3. Test de création d'un profil
    console.log('3. Test de création d\'un profil...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          username: 'test_user',
          full_name: 'Test User',
          email: 'test@example.com'
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log('✅ Profil de test existe déjà (normal)');
        } else {
          console.log(`❌ Erreur lors de la création du profil: ${error.message}`);
        }
      } else {
        console.log('✅ Profil de test créé avec succès');
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la création du profil: ${err.message}`);
    }
    console.log('');

    // 4. Test de création d'un événement
    console.log('4. Test de création d\'un événement...');
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          title: 'Test Event',
          description: 'Event de test',
          date_time: new Date().toISOString(),
          location: 'Test Location',
          max_participants: 4,
          current_participants: 0,
          status: 'active',
          creator_id: '00000000-0000-0000-0000-000000000001'
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log('✅ Événement de test existe déjà (normal)');
        } else {
          console.log(`❌ Erreur lors de la création de l'événement: ${error.message}`);
        }
      } else {
        console.log('✅ Événement de test créé avec succès');
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la création de l'événement: ${err.message}`);
    }
    console.log('');

    // 5. Test de la table event_games
    console.log('5. Test de la table event_games...');
    try {
      const { data, error } = await supabase
        .from('event_games')
        .insert({
          event_id: '00000000-0000-0000-0000-000000000001',
          game_name: 'Test Game',
          is_custom: true,
          is_optional: false,
          experience_level: 'beginner'
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log('✅ Jeu de test existe déjà (normal)');
        } else {
          console.log(`❌ Erreur lors de la création du jeu: ${error.message}`);
        }
      } else {
        console.log('✅ Jeu de test créé avec succès');
      }
    } catch (err) {
      console.log(`❌ Erreur lors de la création du jeu: ${err.message}`);
    }
    console.log('');

    console.log('🎉 Tests terminés !');
    console.log('');
    console.log('📋 Prochaines étapes :');
    console.log('1. Démarrez votre application Next.js');
    console.log('2. Testez la création d\'événements');
    console.log('3. Testez la participation aux événements');
    console.log('4. Testez la gestion des jeux');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.log('');
    console.log('🔧 Solutions possibles :');
    console.log('1. Vérifiez que Supabase local est démarré (supabase start)');
    console.log('2. Vérifiez les variables d\'environnement');
    console.log('3. Vérifiez que les migrations ont été appliquées');
    console.log('4. Redémarrez Supabase local (supabase restart)');
  }
}

// Exécuter les tests
testSupabaseLocal();
