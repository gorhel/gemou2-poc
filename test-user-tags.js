// Script de test pour vérifier la table user_tags
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase Cloud
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserTagsTable() {
  console.log('🔍 Test de la table user_tags...\n');

  try {
    // 1. Vérifier si la table user_tags existe
    console.log('1. Vérification de l\'existence de la table user_tags...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_tags')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Erreur lors de l\'accès à user_tags:', tableError.message);
      
      // Vérifier si c'est une erreur de table inexistante
      if (tableError.message.includes('relation "public.user_tags" does not exist')) {
        console.log('📋 La table user_tags n\'existe pas encore.');
        console.log('💡 Solution: Exécuter la migration 20250103000001_create_user_tags.sql');
        return;
      }
    } else {
      console.log('✅ Table user_tags accessible');
    }

    // 2. Vérifier la structure de la table
    console.log('\n2. Vérification de la structure...');
    const { data: structure, error: structureError } = await supabase
      .from('user_tags')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Erreur structure:', structureError.message);
    } else {
      console.log('✅ Structure accessible');
      if (structure && structure.length > 0) {
        console.log('📊 Exemple de données:', structure[0]);
      } else {
        console.log('📊 Table vide (pas de données)');
      }
    }

    // 3. Vérifier la table tags
    console.log('\n3. Vérification de la table tags...');
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .limit(5);

    if (tagsError) {
      console.log('❌ Erreur tags:', tagsError.message);
    } else {
      console.log('✅ Table tags accessible');
      if (tags && tags.length > 0) {
        console.log('🏷️ Tags disponibles:', tags.map(t => t.name).join(', '));
      } else {
        console.log('📊 Table tags vide');
      }
    }

    // 4. Vérifier la table profiles
    console.log('\n4. Vérification de la table profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .limit(3);

    if (profilesError) {
      console.log('❌ Erreur profiles:', profilesError.message);
    } else {
      console.log('✅ Table profiles accessible');
      if (profiles && profiles.length > 0) {
        console.log('👤 Profils disponibles:', profiles.map(p => p.username).join(', '));
      } else {
        console.log('📊 Table profiles vide');
      }
    }

  } catch (error) {
    console.error('💥 Erreur inattendue:', error.message);
  }
}

// Lire les variables d'environnement depuis .env.local
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, 'apps/web/.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
  
  console.log('📁 Variables d\'environnement chargées depuis .env.local');
} catch (error) {
  console.log('⚠️ Impossible de charger .env.local, utilisation des valeurs par défaut');
}

testUserTagsTable();


