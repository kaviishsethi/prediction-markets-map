import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function POST() {
  try {
    // Find duplicates in protocols_categories (same protocol + category)
    const { data: allRows, error: fetchError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .select('id, protocol, category')
      .order('id', { ascending: true })

    if (fetchError) throw fetchError

    // Group by protocol+category, keep first (lowest id), mark rest for deletion
    const seen = new Map<string, number>()
    const toDelete: number[] = []

    for (const row of allRows || []) {
      const key = `${row.protocol}:${row.category}`
      if (seen.has(key)) {
        toDelete.push(row.id)
      } else {
        seen.set(key, row.id)
      }
    }

    // Delete duplicates
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from(TABLES.protocols_categories)
        .delete()
        .in('id', toDelete)

      if (deleteError) throw deleteError
    }

    // Also deduplicate protocols_metadata (same protocol)
    const { data: metaRows, error: metaFetchError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .select('id, protocol')
      .order('id', { ascending: true })

    if (metaFetchError) throw metaFetchError

    const seenMeta = new Map<string, number>()
    const toDeleteMeta: number[] = []

    for (const row of metaRows || []) {
      if (seenMeta.has(row.protocol)) {
        toDeleteMeta.push(row.id)
      } else {
        seenMeta.set(row.protocol, row.id)
      }
    }

    // Note: Can't delete metadata if it has category references
    // So we'll just report these

    return NextResponse.json({
      success: true,
      categoriesDeduplicated: toDelete.length,
      metadataDuplicatesFound: toDeleteMeta.length,
      uniqueProtocolCategories: seen.size,
    })
  } catch (error) {
    console.error('Deduplicate error:', error)
    return NextResponse.json(
      { error: 'Deduplication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
