const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testParticipationSystem() {
  console.log('🧪 Test du système de participation aux événements...\n');

  try {
    // 1. Vérifier la structure de la table events
    console.log('1️⃣ Vérification de la structure de la table events...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, current_participants, max_participants, status')
      .limit(1);

    if (eventsError) {
      console.error('❌ Erreur lors de la récupération des événements:', eventsError);
      return;
    }

    if (!events || events.length === 0) {
      console.log('⚠️ Aucun événement trouvé');
      return;
    }

    const event = events[0];
    console.log(`✅ Événement trouvé: "${event.title}"`);
    console.log(`   - Participants actuels: ${event.current_participants}`);
    console.log(`   - Participants max: ${event.max_participants}`);
    console.log(`   - Statut: ${event.status}\n`);

    // 2. Vérifier la structure de la table event_participants
    console.log('2️⃣ Vérification de la structure de la table event_participants...');
    const { data: participants, error: participantsError } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', event.id)
      .limit(5);

    if (participantsError) {
      console.error('❌ Erreur lors de la récupération des participants:', participantsError);
      return;
    }

    console.log(`✅ ${participants.length} participant(s) trouvé(s) pour cet événement`);
    if (participants.length > 0) {
      console.log('   Participants:');
      participants.forEach((p, index) => {
        console.log(`   ${index + 1}. User ID: ${p.user_id}, Status: ${p.status}, Joined: ${p.joined_at}`);
      });
    }
    console.log('');

    // 3. Vérifier la cohérence des données
    console.log('3️⃣ Vérification de la cohérence des données...');
    const { count, error: countError } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id);

    if (countError) {
      console.error('❌ Erreur lors du comptage des participants:', countError);
      return;
    }

    const actualCount = count || 0;
    const storedCount = event.current_participants;

    console.log(`   - Participants en base (event_participants): ${actualCount}`);
    console.log(`   - Participants stockés (events.current_participants): ${storedCount}`);

    if (actualCount === storedCount) {
      console.log('✅ Les compteurs sont cohérents !');
    } else {
      console.log('⚠️ Incohérence détectée ! Les compteurs ne correspondent pas.');
      console.log('   Cela peut causer des problèmes de persistance.');
    }
    console.log('');

    // 4. Vérifier les contraintes
    console.log('4️⃣ Vérification des contraintes...');
    
    // Vérifier que current_participants >= 0
    if (storedCount >= 0) {
      console.log('✅ current_participants >= 0');
    } else {
      console.log('❌ current_participants < 0 (invalide)');
    }

    // Vérifier que current_participants <= max_participants
    if (storedCount <= event.max_participants) {
      console.log('✅ current_participants <= max_participants');
    } else {
      console.log('❌ current_participants > max_participants (invalide)');
    }

    // 5. Test de simulation d'ajout de participant
    console.log('\n5️⃣ Test de simulation...');
    console.log('   Simulation: Ajout d\'un participant');
    
    const newCount = storedCount + 1;
    if (newCount <= event.max_participants) {
      console.log(`   ✅ Ajout possible: ${newCount}/${event.max_participants}`);
    } else {
      console.log(`   ❌ Événement complet: ${newCount}/${event.max_participants}`);
    }

    console.log('\n🎯 Résumé du test:');
    console.log(`   - Événement: "${event.title}"`);
    console.log(`   - Participants actuels: ${storedCount}/${event.max_participants}`);
    console.log(`   - Cohérence: ${actualCount === storedCount ? '✅' : '❌'}`);
    console.log(`   - Contraintes: ${storedCount >= 0 && storedCount <= event.max_participants ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testParticipationSystem();

