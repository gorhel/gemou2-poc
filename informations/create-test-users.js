// Script pour créer des utilisateurs de test via Supabase Auth
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Données des utilisateurs de test
const testUsers = [
  // Personnes physiques
  {
    email: 'marie.dupont@example.com',
    password: 'password123',
    user_metadata: {
      full_name: 'Marie Dupont',
      username: 'marie_dupont',
      bio: 'Passionnée de jeux de stratégie et de coopération. J\'adore organiser des soirées jeux entre amis !',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    email: 'pierre.martin@example.com',
    password: 'password123',
    user_metadata: {
      full_name: 'Pierre Martin',
      username: 'pierre_martin',
      bio: 'Collectionneur de jeux de société depuis 10 ans. Spécialiste des jeux allemands et des wargames.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    email: 'sophie.bernard@example.com',
    password: 'password123',
    user_metadata: {
      full_name: 'Sophie Bernard',
      username: 'sophie_bernard',
      bio: 'Maman de 2 enfants, je cherche des jeux familiaux et éducatifs. Toujours partante pour découvrir de nouveaux jeux !',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    email: 'alex.roux@example.com',
    password: 'password123',
    user_metadata: {
      full_name: 'Alex Roux',
      username: 'alex_roux',
      bio: 'Développeur de jeux vidéo le jour, joueur de jeux de plateau le soir. Fan de jeux narratifs et d\'escape games.',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    email: 'lisa.moreau@example.com',
    password: 'password123',
    user_metadata: {
      full_name: 'Lisa Moreau',
      username: 'lisa_moreau',
      bio: 'Étudiante en psychologie, je m\'intéresse aux jeux qui développent la créativité et la logique. Nouvelle sur l\'île !',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    email: 'thomas.leroy@example.com',
    password: 'password123',
    user_metadata: {
      full_name: 'Thomas Leroy',
      username: 'thomas_leroy',
      bio: 'Retraité passionné d\'histoire, j\'adore les jeux historiques et les simulations. Organisateur de tournois de Risk.',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    email: 'julie.petit@example.com',
    password: 'password123',
    user_metadata: {
      full_name: 'Julie Petit',
      username: 'julie_petit',
      bio: 'Professeure des écoles, je cherche des jeux éducatifs pour mes élèves. Spécialiste des jeux coopératifs.',
      avatar_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    email: 'marc.dubois@example.com',
    password: 'password123',
    user_metadata: {
      full_name: 'Marc Dubois',
      username: 'marc_dubois',
      bio: 'Ingénieur et père de famille, j\'aime les jeux qui se jouent en 30 minutes max. Fan de deck-building et de jeux rapides.',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
    }
  },
  // Bars à jeux
  {
    email: 'contact@ledesbar.re',
    password: 'password123',
    user_metadata: {
      full_name: 'Le Dés Bar',
      username: 'le_des_bar',
      bio: 'Bar à jeux de société au cœur de Saint-Denis. Plus de 200 jeux disponibles, ambiance conviviale et boissons artisanales.',
      avatar_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=150&h=150&fit=crop'
    }
  },
  {
    email: 'contact@cafeludique.re',
    password: 'password123',
    user_metadata: {
      full_name: 'Café Ludique du Sud',
      username: 'cafe_ludique',
      bio: 'Café-restaurant spécialisé dans les jeux de société. Menu gourmand et collection de jeux pour tous les âges.',
      avatar_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop'
    }
  }
];

async function createTestUsers() {
  console.log('🚀 Création des utilisateurs de test...');
  
  for (const userData of testUsers) {
    try {
      console.log(`📝 Création de ${userData.email}...`);
      
      // Créer l'utilisateur via Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true // Confirmer automatiquement l'email
      });

      if (error) {
        console.error(`❌ Erreur pour ${userData.email}:`, error.message);
        continue;
      }

      console.log(`✅ Utilisateur créé: ${userData.email} (ID: ${data.user.id})`);

      // Mettre à jour le profil avec les données complètes
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: userData.user_metadata.username,
          full_name: userData.user_metadata.full_name,
          bio: userData.user_metadata.bio,
          avatar_url: userData.user_metadata.avatar_url,
          email: userData.email
        })
        .eq('id', data.user.id);

      if (profileError) {
        console.error(`⚠️ Erreur profil pour ${userData.email}:`, profileError.message);
      } else {
        console.log(`✅ Profil mis à jour pour ${userData.email}`);
      }

    } catch (error) {
      console.error(`❌ Erreur générale pour ${userData.email}:`, error.message);
    }
  }

  console.log('🎉 Création des utilisateurs terminée !');
}

// Exécuter le script
createTestUsers().catch(console.error);
