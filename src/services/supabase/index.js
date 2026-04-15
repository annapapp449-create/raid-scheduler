import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const PLACEHOLDER_VALUES = ['your_supabase_url_here', 'your_supabase_anon_key_here', '', undefined, null];

let supabase = null;

export function isConfigured() {
  return !!(
    SUPABASE_URL && SUPABASE_ANON_KEY &&
    !PLACEHOLDER_VALUES.includes(SUPABASE_URL) &&
    !PLACEHOLDER_VALUES.includes(SUPABASE_ANON_KEY)
  );
}

export function getSupabase() {
  if (!supabase && isConfigured()) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

export default getSupabase;
