import { createClient } from '@supabase/supabase-js'

// Replace with your actual Supabase URL and Anon Key
// You can find these in your Supabase project settings:
// Settings -> API -> Project URL and Project API keys (anon public)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
