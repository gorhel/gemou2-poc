import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@gemou2/database';

export const createClientSupabaseClient = () =>
  createClientComponentClient<Database>();