import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@gemou2/database';

// Configuration pour le client côté serveur
export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies });

// Configuration pour le client côté client
export const createClientSupabaseClient = () =>
  createClientComponentClient<Database>();

// Configuration directe avec les variables d'environnement
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);