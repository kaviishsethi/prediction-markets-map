import { NextResponse } from 'next/server'
import { supabase, TABLES } from '@/lib/supabase'

export async function GET() {
  try {
    // Check protocols_metadata for logos
    const { data: protocols, error } = await supabase
      .from(TABLES.protocols_metadata)
      .select('protocol, name, logo')
      .not('logo', 'is', null)
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also get total count
    const { count } = await supabase
      .from(TABLES.protocols_metadata)
      .select('*', { count: 'exact', head: true })
      .not('logo', 'is', null)

    return NextResponse.json({
      totalWithLogos: count,
      sample: protocols,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
