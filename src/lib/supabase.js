import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Server-side admin client (bypasses RLS) — use in API routes only
let _adminClient = null;
export function getSupabaseAdmin() {
  if (_adminClient) return _adminClient;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _adminClient;
}

// Public anon client
let _anonClient = null;
export function getSupabaseClient() {
  if (_anonClient) return _anonClient;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  _anonClient = createClient(supabaseUrl, supabaseAnonKey);
  return _anonClient;
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

export { supabaseUrl, supabaseServiceKey };
