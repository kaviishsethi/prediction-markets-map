import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function POST() {
  try {
    // 1. Get all data-storage and data-retrieval entries
    const { data: storageEntries, error: storageError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .select('*')
      .eq('category', 'data-storage')

    if (storageError) throw storageError

    const { data: retrievalEntries, error: retrievalError } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .select('*')
      .eq('category', 'data-retrieval')

    if (retrievalError) throw retrievalError

    // Track what protocols we've processed
    const processedProtocols = new Set<string>()
    const results: { protocol: string; action: string }[] = []

    // 2. Update storage entries to storage-retrieval
    for (const entry of storageEntries || []) {
      if (processedProtocols.has(entry.protocol)) continue

      // Check if this protocol also has a retrieval entry
      const hasRetrieval = (retrievalEntries || []).some(r => r.protocol === entry.protocol)

      if (hasRetrieval) {
        // Protocol has both - update storage entry, delete retrieval entry
        await supabaseAdmin
          .from(TABLES.protocols_categories)
          .update({ category: 'data-storage-retrieval' })
          .eq('id', entry.id)

        // Delete the retrieval entry for this protocol
        await supabaseAdmin
          .from(TABLES.protocols_categories)
          .delete()
          .eq('protocol', entry.protocol)
          .eq('category', 'data-retrieval')

        results.push({ protocol: entry.protocol, action: 'merged (had both)' })
      } else {
        // Only storage - just update category
        await supabaseAdmin
          .from(TABLES.protocols_categories)
          .update({ category: 'data-storage-retrieval' })
          .eq('id', entry.id)

        results.push({ protocol: entry.protocol, action: 'updated from storage' })
      }

      processedProtocols.add(entry.protocol)
    }

    // 3. Update remaining retrieval entries (those without storage)
    for (const entry of retrievalEntries || []) {
      if (processedProtocols.has(entry.protocol)) continue

      await supabaseAdmin
        .from(TABLES.protocols_categories)
        .update({ category: 'data-storage-retrieval' })
        .eq('id', entry.id)

      results.push({ protocol: entry.protocol, action: 'updated from retrieval' })
      processedProtocols.add(entry.protocol)
    }

    // 4. Update the categories table
    // Delete old categories
    await supabaseAdmin
      .from(TABLES.categories)
      .delete()
      .in('category', ['data-storage', 'data-retrieval'])

    // Insert new combined category (if not exists)
    await supabaseAdmin
      .from(TABLES.categories)
      .upsert({
        category: 'data-storage-retrieval',
        label: 'Storage & Retrieval',
        bucket: 'DATA',
      }, { onConflict: 'category' })

    return NextResponse.json({
      success: true,
      message: 'Merged storage and retrieval categories',
      processedCount: results.length,
      results,
    })
  } catch (error) {
    console.error('Merge categories error:', error)
    return NextResponse.json(
      { error: 'Failed to merge categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
