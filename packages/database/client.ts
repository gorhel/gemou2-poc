import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Cette fonction sera utilisée côté client (web et mobile)
export const createSupabaseClient = (supabaseUrl: string, supabaseKey: string) => {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
};

// Types pour les hooks personnalisés
export type SupabaseClient = ReturnType<typeof createSupabaseClient>;