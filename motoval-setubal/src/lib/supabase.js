import { createClient } from '@supabase/supabase-js'
import { createSupabaseClient } from './supabaseConfig'

export const supabase = createSupabaseClient(import.meta.env, createClient)
