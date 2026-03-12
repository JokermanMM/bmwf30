import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'missing_url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
