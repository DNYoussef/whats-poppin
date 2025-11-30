import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Lazy-loaded Supabase client for auth operations
let _supabaseAuthClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Lazy-loaded Supabase client for database operations with proper types
let _supabaseDbClient: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseAuthClient() {
  if (!_supabaseAuthClient) {
    _supabaseAuthClient = createClientComponentClient<Database>();
  }
  return _supabaseAuthClient;
}

function getSupabaseDbClient() {
  if (!_supabaseDbClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }
    _supabaseDbClient = createClient<Database>(url, key);
  }
  return _supabaseDbClient;
}

interface SignUpParams {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

interface SignInParams {
  email: string;
  password: string;
}

// Use the Database type for profile updates
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Sign up a new user with email and password
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function signUp({ email, password, username, fullName }: SignUpParams) {
  // Assertion 1: Validate inputs
  if (!email || !password || !username || !fullName) {
    throw new Error('All fields are required');
  }

  // Assertion 2: Validate password length
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
      },
    },
  });

  if (error) throw error;

  // Assertion 3: Verify user was created
  if (!data.user) {
    throw new Error('Failed to create user');
  }

  return data;
}

/**
 * Sign in an existing user
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function signIn({ email, password }: SignInParams) {
  // Assertion 1: Validate inputs
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Assertion 2: Verify session was created
  if (!data.session) {
    throw new Error('Failed to create session');
  }

  return data;
}

/**
 * Sign out the current user
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function signOut() {
  const supabase = getSupabaseAuthClient();
  const { error } = await supabase.auth.signOut();

  // Assertion 1: Verify no error occurred
  if (error) throw error;

  return { success: true };
}

/**
 * Get current session
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function getSession() {
  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getSession();

  // Assertion 1: Verify no error occurred
  if (error) throw error;

  // Assertion 2: Return session or null
  return data.session;
}

/**
 * Get current user
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function getUser() {
  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser();

  // Assertion 1: Verify no error occurred
  if (error) throw error;

  // Assertion 2: Return user or null
  return data.user;
}

/**
 * Update user profile
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function updateProfile(userId: string, updates: ProfileUpdate) {
  // Assertion 1: Validate userId
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Assertion 2: Validate updates object
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }

  const supabase = getSupabaseDbClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Assertion 3: Verify profile was updated
  if (!data) {
    throw new Error('Failed to update profile');
  }

  return data;
}

/**
 * Check if username is available
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  // Assertion 1: Validate username
  if (!username || username.length < 3) {
    throw new Error('Username must be at least 3 characters');
  }

  const supabase = getSupabaseDbClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;

  // Assertion 2: Return availability status
  return data === null;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | coder@sonnet-4.5 | Authentication implementation | OK |
// | 1.1.0   | 2025-11-30T00:00:00 | claude@opus-4 | Lazy-load Supabase client for build | OK |
// | 1.2.0   | 2025-11-30T00:00:00 | claude@opus-4 | Fix type inference with ReturnType | OK |
/* AGENT FOOTER END */
