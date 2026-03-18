import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getClient(url: string | undefined, key: string | undefined): SupabaseClient {
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(url, key)
}

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

// Client for public reads (lazy-initialized)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = getClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_API_KEY)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_supabase as any)[prop]
  },
})

// Admin client for writes (lazy-initialized)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = getClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_supabaseAdmin as any)[prop]
  },
})

// Table prefix for this sector
export const TABLE_PREFIX = process.env.TABLE_PREFIX || 'ai_'

// Table names
export const TABLES = {
  categories: `${TABLE_PREFIX}categories`,
  protocols_metadata: `${TABLE_PREFIX}protocols_metadata`,
  protocols_categories: `${TABLE_PREFIX}protocols_categories`,
}
