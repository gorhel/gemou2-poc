import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@gemou2/database';

export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies });

export const createClientSupabaseClient = () =>
  createClientComponentClient<Database>();