import { NextResponse } from 'next/server'
import { supabase, TABLES } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from(TABLES.protocols_categories)
      .select('protocol, category, description')
      .order('protocol')
      .order('category')

    if (error) throw error

    // Group by protocol
    const grouped: Record<string, Array<{ category: string; description: string }>> = {}
    for (const row of data || []) {
      if (!grouped[row.protocol]) {
        grouped[row.protocol] = []
      }
      grouped[row.protocol].push({
        category: row.category,
        description: row.description,
      })
    }

    return NextResponse.json({
      totalEntries: data?.length || 0,
      protocols: grouped,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
