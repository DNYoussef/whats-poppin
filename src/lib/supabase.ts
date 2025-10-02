import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Validates required Supabase environment variables
 * @throws Error if environment variables are missing
 */
function validateSupabaseEnv(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url.length === 0) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!key || key.length === 0) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
}

// NASA Rule 10: Validate environment on initialization
validateSupabaseEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client instance
 * Typed with Database schema for type safety
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Type-safe helper for Supabase queries
 * @returns Supabase client instance
 */
export function getSupabaseClient() {
  return supabase;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial Supabase client setup | OK |
/* AGENT FOOTER END */
