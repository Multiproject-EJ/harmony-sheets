import { createClient } from '@supabase/supabase-js'
import { getSupabaseCredentials } from './runtimeConfig'

const { url, anonKey } = getSupabaseCredentials()

export const supabase = createClient(url, anonKey)
