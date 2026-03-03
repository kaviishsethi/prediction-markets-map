import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function POST() {
  const results: string[] = []

  try {
    // 1. Get current category data
    const { data: catData } = await supabaseAdmin
      .from(TABLES.protocols_categories)
      .select('*')
      .eq('protocol', 'fixie')
      .single()

    if (catData) {
      // 2. Delete category entry
      const { error: delError } = await supabaseAdmin
        .from(TABLES.protocols_categories)
        .delete()
        .eq('protocol', 'fixie')

      if (delError) {
        results.push(`Error deleting category: ${delError.message}`)
      } else {
        results.push('Deleted fixie from categories')
      }
    }

    // 3. Update metadata slug
    const { error: metaError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .update({ protocol: 'ultravox' })
      .eq('protocol', 'fixie')

    if (metaError) {
      results.push(`Error updating metadata: ${metaError.message}`)
    } else {
      results.push('Updated metadata protocol to ultravox')
    }

    // 4. Recreate category entry with new slug
    if (catData) {
      const { error: insError } = await supabaseAdmin
        .from(TABLES.protocols_categories)
        .insert({
          protocol: 'ultravox',
          category: catData.category,
          description: 'Speech-native voice AI platform. Open-source multimodal LLM for real-time voice conversations without separate ASR. Formerly Fixie.ai.',
          website: 'https://ultravox.ai',
          twitter: catData.twitter,
        })

      if (insError) {
        results.push(`Error inserting category: ${insError.message}`)
      } else {
        results.push('Created ultravox category entry')
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown', results },
      { status: 500 }
    )
  }
}
