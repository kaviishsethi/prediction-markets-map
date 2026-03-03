import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

// POST: Update NEON and OctoML descriptions to reflect acquisitions
export async function POST() {
  const results: string[] = []

  try {
    // Update NEON description
    const { error: neonError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .update({
        description: 'Serverless Postgres database. Acquired by Databricks in May 2025 for ~$1B. Enables AI agents to spin up databases programmatically.',
      })
      .eq('protocol', 'neon')

    if (neonError) {
      results.push(`Error updating Neon: ${neonError.message}`)
    } else {
      results.push('Updated Neon description (acquired by Databricks)')
    }

    // Update OctoML description
    const { error: octoError } = await supabaseAdmin
      .from(TABLES.protocols_metadata)
      .update({
        description: 'ML model optimization platform. Acquired by NVIDIA in September 2024 for $250M. Services shut down October 2024.',
      })
      .eq('protocol', 'octoml')

    if (octoError) {
      results.push(`Error updating OctoML: ${octoError.message}`)
    } else {
      results.push('Updated OctoML description (acquired by NVIDIA)')
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
