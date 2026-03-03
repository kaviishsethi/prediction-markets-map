import { NextResponse } from 'next/server'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

export async function POST() {
  try {
    // Add market_cap column to protocols_metadata table
    // Using raw SQL via Supabase's rpc or direct query
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      query: `ALTER TABLE ${TABLES.protocols_metadata} ADD COLUMN IF NOT EXISTS market_cap DECIMAL(15,2);`
    })

    if (error) {
      // Try alternative approach - just update a record to see if column exists
      const { error: testError } = await supabaseAdmin
        .from(TABLES.protocols_metadata)
        .update({ market_cap: null })
        .eq('protocol', 'test-nonexistent')

      if (testError && testError.message.includes('column')) {
        return NextResponse.json({
          success: false,
          error: 'Column does not exist and cannot be added via API. Please add manually in Supabase.',
          sql: `ALTER TABLE ${TABLES.protocols_metadata} ADD COLUMN market_cap DECIMAL(15,2);`
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'market_cap column ready'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
