import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nclnhynfceyzwhvozqpq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YAjLQ_wlwWO8n8aadJNc6w_Co0finJ3'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
