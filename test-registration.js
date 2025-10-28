const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase Cloud
const supabaseUrl = 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistration() {
  console.log('🧪 Test de création de compte...');
  
  const testEmail = `test-${Date.now()}@gmail.com`;
  const testPassword = 'password123';
  const testData = {
    full_name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
    username: `testuser${Date.now()}`
  };

  try {
    console.log('📧 Email de test:', testEmail);
    console.log('👤 Données utilisateur:', testData);

    // Test de création de compte
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: testData
      }
    });

    if (error) {
      console.error('❌ Erreur lors de la création:', error);
      return;
    }

    console.log('✅ Compte créé avec succès!');
    console.log('📊 Données retournées:', {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
        user_metadata: data.user.user_metadata
      } : null,
      session: data.session ? 'Session créée' : 'Pas de session'
    });

    // Vérifier si le profil a été créé
    if (data.user) {
      console.log('\n🔍 Vérification du profil...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Erreur lors de la récupération du profil:', profileError);
      } else {
        console.log('✅ Profil trouvé:', profile);
      }
    }

  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
  }
}

// Test de connexion avec un compte existant
async function testLogin() {
  console.log('\n🔐 Test de connexion...');
  
  // Utiliser un email de test connu (vous pouvez le modifier)
  const testEmail = 'test-user@gmail.com';
  const testPassword = 'password123';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return;
    }

    console.log('✅ Connexion réussie!');
    console.log('📊 Utilisateur connecté:', {
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata
    });

  } catch (error) {
    console.error('💥 Erreur inattendue lors de la connexion:', error);
  }
}

// Exécuter les tests
async function runTests() {
  await testRegistration();
  await testLogin();
}

runTests();
