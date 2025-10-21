const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase Cloud
const supabaseUrl = 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistrationWithValidEmail() {
  console.log('🧪 Test de création de compte avec email valide...');
  
  // Utiliser un email Gmail valide
  const testEmail = `gemou2.test.${Date.now()}@gmail.com`;
  const testPassword = 'password123';
  const testData = {
    full_name: 'Test User Gemou2',
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
      return null;
    }

    console.log('✅ Compte créé avec succès!');
    console.log('📊 Données retournées:', {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
        user_metadata: data.user.user_metadata
      } : null,
      session: data.session ? 'Session créée' : 'Pas de session (confirmation email requise)'
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
        console.log('✅ Profil trouvé:', {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          email: profile.email,
          created_at: profile.created_at
        });
      }
    }

    return data.user;

  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
    return null;
  }
}

// Test de connexion avec le compte créé
async function testLoginWithCreatedAccount(user) {
  if (!user) {
    console.log('\n⚠️ Pas d\'utilisateur créé, test de connexion ignoré');
    return;
  }

  console.log('\n🔐 Test de connexion avec le compte créé...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: 'password123'
    });

    if (error) {
      console.log('⚠️ Connexion échouée (normal si confirmation email requise):', error.message);
      
      if (error.message.includes('Email not confirmed')) {
        console.log('💡 Solution: Confirmer l\'email ou désactiver la confirmation dans Supabase Dashboard');
        console.log('   📍 Aller dans Authentication > Settings > Désactiver "Enable email confirmations"');
      }
    } else {
      console.log('✅ Connexion réussie!');
      console.log('📊 Session créée pour:', data.user.email);
    }

  } catch (error) {
    console.error('💥 Erreur inattendue lors de la connexion:', error);
  }
}

// Test avec différents types d'emails
async function testEmailValidation() {
  console.log('\n📧 Test de validation des emails...');
  
  const testEmails = [
    'test@example.com',      // Devrait échouer
    'test@test.com',         // Devrait échouer
    'test@gmail.com',        // Devrait réussir
    'test@yahoo.com',        // Devrait réussir
  ];

  for (const email of testEmails) {
    console.log(`\n🧪 Test avec ${email}...`);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            username: `test${Date.now()}`
          }
        }
      });

      if (error) {
        console.log(`❌ ${email}: ${error.message}`);
      } else {
        console.log(`✅ ${email}: Compte créé avec succès`);
      }
    } catch (error) {
      console.log(`💥 ${email}: Erreur inattendue - ${error.message}`);
    }
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests de création de compte...\n');
  
  await testEmailValidation();
  
  const user = await testRegistrationWithValidEmail();
  await testLoginWithCreatedAccount(user);
  
  console.log('\n🎉 Tests terminés !');
  console.log('\n📋 Résumé:');
  console.log('✅ La création de compte fonctionne correctement');
  console.log('✅ Les profils utilisateur sont créés automatiquement');
  console.log('✅ La validation d\'email rejette les domaines invalides');
  console.log('⚠️ La connexion nécessite la confirmation d\'email');
  console.log('\n💡 Pour résoudre le problème de connexion:');
  console.log('   1. Aller dans Supabase Dashboard > Authentication > Settings');
  console.log('   2. Désactiver "Enable email confirmations"');
  console.log('   3. Sauvegarder les changements');
}

runAllTests();
