const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase Cloud
const supabaseUrl = 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUsersWithAvatars() {
  console.log('🧪 Création d\'utilisateurs de test avec avatars...');
  
  const testUsers = [
    {
      email: `avatar-test-1-${Date.now()}@gmail.com`,
      password: 'password123',
      user_metadata: {
        full_name: 'Jean Dupont',
        first_name: 'Jean',
        last_name: 'Dupont',
        username: `jean_dupont_${Date.now()}`
      },
      avatar_url: 'https://via.placeholder.com/150/3b82f6/ffffff?text=JD'
    },
    {
      email: `avatar-test-2-${Date.now()}@gmail.com`,
      password: 'password123',
      user_metadata: {
        full_name: 'Marie Martin',
        first_name: 'Marie',
        last_name: 'Martin',
        username: `marie_martin_${Date.now()}`
      },
      avatar_url: 'https://via.placeholder.com/150/10b981/ffffff?text=MM'
    },
    {
      email: `avatar-test-3-${Date.now()}@gmail.com`,
      password: 'password123',
      user_metadata: {
        full_name: 'Pierre Durand',
        first_name: 'Pierre',
        last_name: 'Durand',
        username: `pierre_durand_${Date.now()}`
      },
      avatar_url: null // Pas d'avatar pour tester le fallback
    }
  ];

  const createdUsers = [];

  for (const userData of testUsers) {
    try {
      console.log(`📝 Création de ${userData.email}...`);
      
      // Créer l'utilisateur via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: userData.user_metadata
        }
      });

      if (error) {
        console.error(`❌ Erreur pour ${userData.email}:`, error.message);
        continue;
      }

      console.log(`✅ Utilisateur créé: ${userData.email} (ID: ${data.user.id})`);

      // Mettre à jour le profil avec l'avatar
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: userData.user_metadata.username,
          full_name: userData.user_metadata.full_name,
          avatar_url: userData.avatar_url
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error(`⚠️ Erreur profil pour ${userData.email}:`, profileError.message);
      } else {
        console.log(`✅ Profil mis à jour pour ${userData.email} avec avatar: ${userData.avatar_url || 'Fallback (initiales)'}`);
      }

      createdUsers.push({
        id: data.user.id,
        email: userData.email,
        username: userData.user_metadata.username,
        full_name: userData.user_metadata.full_name,
        avatar_url: userData.avatar_url
      });

    } catch (error) {
      console.error(`❌ Erreur générale pour ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Création des utilisateurs terminée !');
  console.log('\n📊 Utilisateurs créés :');
  createdUsers.forEach(user => {
    console.log(`- ${user.full_name} (@${user.username}) - Avatar: ${user.avatar_url || 'Fallback'}`);
  });

  return createdUsers;
}

// Créer un événement de test avec ces utilisateurs
async function createTestEvent(creatorId) {
  console.log('\n🎮 Création d\'un événement de test...');
  
  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: 'Test Affichage Avatars 🖼️',
        description: 'Événement de test pour vérifier l\'affichage des avatars des organisateurs et participants.',
        date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
        location: 'Paris, France',
        max_participants: 10,
        current_participants: 0,
        creator_id: creatorId,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la création de l\'événement:', error);
      return null;
    }

    console.log(`✅ Événement créé: ${data.title} (ID: ${data.id})`);
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'événement:', error);
    return null;
  }
}

// Exécuter le script
async function runTest() {
  try {
    const users = await createTestUsersWithAvatars();
    
    if (users.length > 0) {
      // Créer un événement avec le premier utilisateur comme organisateur
      const event = await createTestEvent(users[0].id);
      
      if (event) {
        console.log('\n🎯 Instructions pour tester :');
        console.log('1. Ouvrir l\'application mobile');
        console.log('2. Aller dans l\'onglet "Événements"');
        console.log('3. Chercher l\'événement "Test Affichage Avatars 🖼️"');
        console.log('4. Cliquer sur l\'événement pour voir les avatars');
        console.log('\n📱 URL de l\'événement (si accessible) :');
        console.log(`/events/${event.id}`);
      }
    }
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

runTest();
