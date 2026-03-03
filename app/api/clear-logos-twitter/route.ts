import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function POST() {
  try {
    // Clear logo and twitter from protocols_metadata
    const { data: metadataResult, error: metadataError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .update({ logo: null, twitter: null })
      .not('id', 'is', null) // Update all rows
      .select('protocol')

    if (metadataError) throw metadataError

    // Also clear twitter from protocols_categories
    const { data: categoriesResult, error: categoriesError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .update({ twitter: null })
      .not('id', 'is', null) // Update all rows
      .select('protocol')

    if (categoriesError) throw categoriesError

    return NextResponse.json({
      success: true,
      message: 'Cleared logo and twitter from all companies',
      metadata_updated: metadataResult?.length || 0,
      categories_updated: categoriesResult?.length || 0,
    })
  } catch (error) {
    console.error('Error clearing logos and twitter:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
