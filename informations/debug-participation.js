const { createClient } = require('@supabase/supabase-js');

// Configuration pour Supabase local
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugParticipation() {
  console.log('🔍 Debug du système de participation...\n');

  try {
    // 1. Lister tous les événements
    console.log('1️⃣ Événements disponibles:');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, current_participants, max_participants, status')
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('❌ Erreur:', eventsError);
      return;
    }

    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title}`);
      console.log(`      ID: ${event.id}`);
      console.log(`      Participants: ${event.current_participants}/${event.max_participants}`);
      console.log(`      Statut: ${event.status}`);
      console.log('');
    });

    // 2. Vérifier les participants pour chaque événement
    console.log('2️⃣ Participants par événement:');
    for (const event of events) {
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('user_id, status, joined_at')
        .eq('event_id', event.id);

      if (participantsError) {
        console.log(`   ❌ Erreur pour ${event.title}:`, participantsError);
        continue;
      }

      console.log(`   📅 ${event.title}:`);
      console.log(`      Participants stockés: ${event.current_participants}`);
      console.log(`      Participants réels: ${participants.length}`);
      
      if (event.current_participants !== participants.length) {
        console.log(`      ⚠️ INCOHÉRENCE DÉTECTÉE !`);
      } else {
        console.log(`      ✅ Cohérent`);
      }
      
      if (participants.length > 0) {
        participants.forEach((p, i) => {
          console.log(`         ${i + 1}. User: ${p.user_id}, Status: ${p.status}`);
        });
      }
      console.log('');
    }

    // 3. Vérifier les contraintes
    console.log('3️⃣ Vérification des contraintes:');
    for (const event of events) {
      const issues = [];
      
      if (event.current_participants < 0) {
        issues.push(`current_participants négatif: ${event.current_participants}`);
      }
      
      if (event.current_participants > event.max_participants) {
        issues.push(`current_participants > max_participants: ${event.current_participants} > ${event.max_participants}`);
      }
      
      if (issues.length > 0) {
        console.log(`   ❌ ${event.title}: ${issues.join(', ')}`);
      } else {
        console.log(`   ✅ ${event.title}: Contraintes respectées`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugParticipation();

