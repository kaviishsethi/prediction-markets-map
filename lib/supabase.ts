import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for public reads
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for writes (server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Table prefix for this sector
export const TABLE_PREFIX = process.env.TABLE_PREFIX || 'ai_'

// Table names
export const TABLES = {
  categories: `${TABLE_PREFIX}categories`,
  protocols_metadata: `${TABLE_PREFIX}protocols_metadata`,
  protocols_categories: `${TABLE_PREFIX}protocols_categories`,
}
