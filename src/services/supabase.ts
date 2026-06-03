import { createClient } from '@supabase/supabase-js';

// Fallback empty strings. If they are empty, we fall back to full local mock auth in authService.
const supabaseUrl = '';
const supabaseAnonKey = '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
