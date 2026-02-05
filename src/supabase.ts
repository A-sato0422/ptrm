import { createClient } from '@supabase/supabase-js'

// Supabase プロジェクトの URL と Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabase クライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
