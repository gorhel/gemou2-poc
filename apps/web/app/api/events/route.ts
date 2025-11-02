import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabaseClient } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientSupabaseClient();
    
    const eventData = await request.json();
    
    console.log('🔄 Création d\'événement via API:', eventData);

    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();

    if (error) {
      console.error('❌ Erreur création événement:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Événement créé via API:', data[0]);
    return NextResponse.json({ success: true, data: data[0] });
    
  } catch (err) {
    console.error('💥 Erreur API:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClientSupabaseClient();
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date_time', { ascending: true });

    if (error) {
      console.error('❌ Erreur récupération événements:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
    
  } catch (err) {
    console.error('💥 Erreur API:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
