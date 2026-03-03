import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || 'ultravox'

  const { data: metadata, error: metaError } = await supabaseAdmin
    .from(TABLES.protocols_metadata)
    .select('*')
    .ilike('name', `%${name}%`)

  const { data: categories, error: catError } = await supabaseAdmin
    .from(TABLES.protocols_categories)
    .select('*')
    .ilike('protocol', `%${name}%`)

  return NextResponse.json({
    metadata,
    categories,
    errors: { metaError, catError }
  })
}
