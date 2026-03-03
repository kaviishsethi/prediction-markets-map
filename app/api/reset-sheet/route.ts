import { NextResponse } from 'next/server'
import { getGoogleSheetsClient } from '@/lib/google-sheets'
import { supabase, TABLES } from '@/lib/supabase'
import { HIDDEN_CATEGORIES } from '@/constants/categories'

export async function POST() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    // Clear all data except header row (now L columns)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'companies!A2:L10000',
    })

    // Fetch all protocols with categories from database
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
    // New column order: Timestamp, Name, Website, Category, Description, Logo, Twitter, Public/Private, Market Cap, Project Page, Status
    // (Removed Email column, moved Public/Private before Status, added Market Cap)
    const rows: Array<{
      companyName: string
      timestamp: string
      isPublic: boolean
      marketCap: number | null
      isAcquired: boolean
      data: string[]
    }> = []

    for (const pc of protocolCategories || []) {
      const meta = metadataMap.get(pc.protocol)
      if (!meta) continue

      // Skip hidden categories
      if (HIDDEN_CATEGORIES.includes(pc.category)) continue

      const categoryLabel = getCategoryLabel(pc.category)
      const timestamp = meta.created_at || new Date().toISOString()
      const marketCap = meta.market_cap || null
      const description = pc.description || ''
      const isAcquired = description.startsWith('[Acquired')

      rows.push({
        companyName: meta.name,
        timestamp,
        isPublic: meta.is_public || false,
        marketCap,
        isAcquired,
        data: [
          timestamp,                              // A: Timestamp
          meta.name,                              // B: Company Name
          meta.website || '',                     // C: Website
          categoryLabel,                          // D: Category
          pc.description || '',                   // E: Description
          meta.logo || '',                        // F: Logo URL
          meta.twitter || '',                     // G: Twitter
          meta.is_public ? 'Public' : 'Private',  // H: Public/Private
          meta.ticker ? `$${meta.ticker}` : '',   // I: Ticker
          marketCap ? `$${marketCap}B` : '',      // J: MC or Valuation
          meta.artemisProjectPage || '',          // K: Project Page
          'Synced',                               // L: Status
        ],
      })
    }

    // Sort order:
    // 1. Companies with valuations (sorted by valuation descending)
    // 2. Acquired/merged companies (no valuation)
    // 3. Companies without valuations
    // Within each group, sort by company name
    rows.sort((a, b) => {
      const aHasValuation = a.marketCap !== null && a.marketCap > 0
      const bHasValuation = b.marketCap !== null && b.marketCap > 0

      // Both have valuations - sort by valuation descending
      if (aHasValuation && bHasValuation) {
        const valCompare = (b.marketCap || 0) - (a.marketCap || 0)
        if (valCompare !== 0) return valCompare
        return a.companyName.localeCompare(b.companyName)
      }

      // One has valuation, one doesn't - valuation first
      if (aHasValuation && !bHasValuation) return -1
      if (!aHasValuation && bHasValuation) return 1

      // Neither has valuation - acquired companies come before non-acquired
      if (a.isAcquired && !b.isAcquired) return -1
      if (!a.isAcquired && b.isAcquired) return 1

      // Same category (both acquired or both not) - sort by name
      return a.companyName.localeCompare(b.companyName)
    })

    // Extract just the data arrays
    const sortedData = rows.map((r) => r.data)

    // Write to sheet
    if (sortedData.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'companies!A2',
        valueInputOption: 'RAW',
        requestBody: {
          values: sortedData,
        },
      })
    }

    return NextResponse.json({
      success: true,
      rowsWritten: sortedData.length,
    })
  } catch (error) {
    console.error('Reset sheet error:', error)
    return NextResponse.json(
      { error: 'Reset failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function getCategoryLabel(slug: string): string {
  const map: Record<string, string> = {
    // Application Layer
    'consumer-ai': 'Consumer',
    'enterprise-ai': 'Enterprise',
    'ai-applications': 'AI Applications',
    'ai-agents': 'Agent Platforms/Frameworks',
    'vertical-ai': 'Vertical AI',
    // Model Layer
    'foundation-models': 'Foundation Models',
    'post-training': 'Post-Training',
    'fine-tuning-training': 'Post-Training', // legacy
    // Data Layer
    'data-storage-retrieval': 'Storage & Retrieval',
    'data-storage': 'Storage & Retrieval',
    'data-retrieval': 'Storage & Retrieval',
    'data-labeling': 'Labeling',
    'data-pipelines': 'Pipelines',
    // Infrastructure Layer
    'cloud-hosting': 'Cloud & Hosting',
    'inference': 'Inference',
    'chips-hardware': 'Chips & Hardware',
    'energy-datacenters': 'Energy & Datacenters',
    // Security Layer
    'model-security': 'Model Security',
    'infra-security': 'Infrastructure Security',
    'ai-governance': 'AI Governance',
    // Legacy (for backwards compatibility)
    'data-infrastructure': 'Pipelines',
    'vector-dbs-rag': 'Retrieval',
    'cloud-compute': 'Cloud & Hosting',
  }
  return map[slug] || slug
}
