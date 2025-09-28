import { createClientSupabaseClient } from '../../../lib/supabase-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/';

  if (code) {
    const supabase = createClientSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Rediriger vers la page demandée ou l'accueil
  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
}

