const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase Cloud
const supabaseUrl = 'https://qpnofwgxjgvmpwdrhzid.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbm9md2d4amd2bXB3ZHJoemlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Njk5NjMsImV4cCI6MjA2OTA0NTk2M30.yaY3Vu_zN4IbJRw-U3Do8ufNGsKx66xIpNDmvJSeVM0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEvents() {
  console.log('🔍 Vérification des événements existants...');
  
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        date_time,
        location,
        max_participants,
        current_participants,
        status,
        creator_id,
        profiles!creator_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Erreur lors de la récupération des événements:', error);
      return;
    }

    if (!events || events.length === 0) {
      console.log('📭 Aucun événement trouvé');
      return;
    }

    console.log(`\n📅 ${events.length} événement(s) trouvé(s) :\n`);

    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Organisateur: ${event.profiles?.full_name || event.profiles?.username || 'Inconnu'}`);
      console.log(`   Avatar: ${event.profiles?.avatar_url || 'Fallback (initiales)'}`);
      console.log(`   Participants: ${event.current_participants}/${event.max_participants}`);
      console.log(`   Statut: ${event.status}`);
      console.log(`   Date: ${new Date(event.date_time).toLocaleDateString('fr-FR')}`);
      console.log(`   Lieu: ${event.location}`);
      console.log('');
    });

    // Vérifier les participants du premier événement
    if (events.length > 0) {
      const firstEvent = events[0];
      console.log(`👥 Participants de "${firstEvent.title}" :\n`);
      
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select(`
          id,
          user_id,
          status,
          profiles!user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('event_id', firstEvent.id);

      if (participantsError) {
        console.error('❌ Erreur lors de la récupération des participants:', participantsError);
      } else if (participants && participants.length > 0) {
        participants.forEach((participant, index) => {
          console.log(`${index + 1}. ${participant.profiles?.full_name || participant.profiles?.username || 'Inconnu'}`);
          console.log(`   Avatar: ${participant.profiles?.avatar_url || 'Fallback (initiales)'}`);
          console.log(`   Statut: ${participant.status}`);
          console.log('');
        });
      } else {
        console.log('📭 Aucun participant trouvé pour cet événement');
      }

      console.log('🎯 Pour tester les avatars :');
      console.log('1. Ouvrir l\'application mobile');
      console.log('2. Aller dans l\'onglet "Événements"');
      console.log(`3. Cliquer sur "${firstEvent.title}"`);
      console.log('4. Observer les avatars de l\'organisateur et des participants');
    }

  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
  }
}

checkEvents();
