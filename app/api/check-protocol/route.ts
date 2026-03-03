import { NextRequest, NextResponse } from 'next/server'
import { supabase, TABLES } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const protocol = searchParams.get('protocol')

  if (!protocol) {
    return NextResponse.json({ error: 'Protocol parameter required' }, { status: 400 })
  }

  try {
    // Get protocol metadata
    const { data: metadata, error: metaError } = await supabase
      .from(TABLES.protocols_metadata)
      .select('*')
      .eq('protocol', protocol)
      .single()

    if (metaError && metaError.code !== 'PGRST116') {
      throw metaError
    }

    // Get protocol categories
    const { data: categories, error: catError } = await supabase
      .from(TABLES.protocols_categories)
      .select('*')
      .eq('protocol', protocol)

    if (catError) {
      throw catError
    }

    return NextResponse.json({
      found: !!metadata,
      metadata,
      categories: categories || [],
    })
  } catch (error) {
    console.error('Check protocol error:', error)
    return NextResponse.json(
      { error: 'Failed to check protocol', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
