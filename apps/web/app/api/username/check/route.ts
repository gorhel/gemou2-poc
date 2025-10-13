import { NextRequest, NextResponse } from 'next/server';
import { createClientSupabaseClient } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || username.length < 3) {
      return NextResponse.json({
        valid: false,
        error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
      });
    }

    // Validation du format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json({
        valid: false,
        error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'
      });
    }

    const supabase = createClientSupabaseClient();

    // Vérifier si le username existe déjà dans la table profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Erreur lors de la vérification username:', error);
      return NextResponse.json({
        valid: false,
        error: 'Erreur lors de la vérification'
      });
    }

    if (data) {
      return NextResponse.json({
        valid: false,
        error: 'Ce nom d\'utilisateur est déjà pris'
      });
    }

    return NextResponse.json({
      valid: true,
      error: null
    });

  } catch (error: any) {
    console.error('Erreur API username check:', error);
    return NextResponse.json({
      valid: false,
      error: 'Erreur de connexion'
    });
  }
}
