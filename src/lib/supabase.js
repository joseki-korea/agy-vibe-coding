import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl.length > 0 && 
  !supabaseUrl.includes('your-project-id') && 
  supabasePublishableKey.length > 0 &&
  !supabasePublishableKey.includes('your-key') &&
  !supabasePublishableKey.includes('your-anon-key');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;
