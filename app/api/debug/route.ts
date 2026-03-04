import { NextRequest, NextResponse } from 'next/server'
import { supabase, TABLES } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const missingLogos = searchParams.get('missing') === 'true'

  try {
    if (missingLogos) {
      // Get all protocols without logos
      const { data, error } = await supabase
        .from(TABLES.protocols_metadata)
        .select('protocol, name, logo, twitter')
        .or('logo.is.null,logo.eq.')

      if (error) throw error

      return NextResponse.json({
        totalMissing: data?.length || 0,
        companies: data?.map(d => d.name) || []
      })
    }

    // Get a few sample protocols with their logos
    let query = supabase
      .from(TABLES.protocols_metadata)
      .select('protocol, name, logo, twitter')
      .limit(20)

    if (name) {
      query = query.ilike('name', `%${name}%`)
    }

    const { data, error } = await query

    if (error) throw error

    // Count how many have logos
    const withLogos = data?.filter(d => d.logo && d.logo.includes('http')).length || 0
    const withoutLogos = data?.filter(d => !d.logo || !d.logo.includes('http')) || []

    return NextResponse.json({
      total: data?.length || 0,
      withLogos,
      withoutLogos: withoutLogos.map(d => d.name),
      sample: data?.slice(0, 10)
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
