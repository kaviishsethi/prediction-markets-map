import { NextResponse } from 'next/server'
import { getGoogleSheetsClient } from '@/lib/google-sheets'
import { supabase, TABLES } from '@/lib/supabase'

export async function POST() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    // Fetch all protocols with categories
    const { data: protocolCategories, error: pcError } = await supabase
      .from(TABLES.protocols_categories)
      .select('*')

    if (pcError) throw pcError

    const { data: metadata, error: metaError } = await supabase
      .from(TABLES.protocols_metadata)
      .select('*')

    if (metaError) throw metaError

    const metadataMap = new Map(metadata?.map((m) => [m.protocol, m]) || [])

    // Build rows for the sheet
    const rows: string[][] = []
    const now = new Date().toISOString()

    for (const pc of protocolCategories || []) {
      const meta = metadataMap.get(pc.protocol)
      if (!meta) continue

      // Map category slug back to label
      const categoryLabel = getCategoryLabel(pc.category)

      rows.push([
        now, // Timestamp
        meta.name, // Company Name
        meta.website || '', // Website
        categoryLabel, // Category (label, not slug)
        pc.description || '', // Description
        meta.logo || '', // Logo URL
        meta.twitter || '', // Twitter
        'seeded@ai-landscape.com', // Email
        meta.artemisProjectPage || '', // Project Page
        'Synced', // Status
      ])
    }

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    })

    return NextResponse.json({
      success: true,
      rowsAdded: rows.length,
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function getCategoryLabel(slug: string): string {
  const map: Record<string, string> = {
    'ai-applications': 'AI Applications',
    'ai-agents': 'AI Agents',
    'vertical-ai': 'Vertical AI',
    'foundation-models': 'Foundation Models',
    'fine-tuning-training': 'Fine-tuning & Training',
    'inference': 'Inference',
    'data-infrastructure': 'Data Infrastructure',
    'vector-dbs-rag': 'Vector DBs & RAG',
    'cloud-compute': 'Cloud & Compute',
    'chips-hardware': 'Chips & Hardware',
    'energy-datacenters': 'Energy & Datacenters',
  }
  return map[slug] || slug
}
