import { NextResponse } from 'next/server'
import { supabase, TABLES } from '@/lib/supabase'
import { getGoogleSheetsClient, getSheetData } from '@/lib/google-sheets'

// GET: Check what market cap data exists in Supabase
export async function GET() {
  try {
    const { data, error } = await supabase
      .from(TABLES.protocols_metadata)
      .select('protocol, name, market_cap, ticker, is_public')
      .not('market_cap', 'is', null)
      .order('market_cap', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data?.slice(0, 20), // Show first 20
      message: `Found ${data?.length || 0} protocols with market cap data in Supabase`,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// POST: Restore market cap values from Supabase to Google Sheet (batch update)
export async function POST() {
  try {
    // Get data from Supabase
    const { data: supabaseData, error } = await supabase
      .from(TABLES.protocols_metadata)
      .select('protocol, name, market_cap, ticker, is_public')

    if (error) throw error

    // Create lookup by company name (lowercase for matching)
    const marketCapLookup = new Map<string, { marketCap: number | null; ticker: string | null; isPublic: boolean }>()
    for (const row of supabaseData || []) {
      marketCapLookup.set(row.name.toLowerCase(), {
        marketCap: row.market_cap,
        ticker: row.ticker,
        isPublic: row.is_public,
      })
    }

    // Get sheet data
    const sheetRows = await getSheetData()

    // Prepare batch updates
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    const updates: Array<{ row: number; company: string; marketCap: string; status: string }> = []
    const notFound: string[] = []

    // Build batch update data - array of {range, values}
    const batchData: Array<{ range: string; values: string[][] }> = []

    for (const row of sheetRows) {
      const lookup = marketCapLookup.get(row.companyName.toLowerCase())

      if (lookup && lookup.marketCap) {
        // Format market cap
        let marketCapStr = ''
        if (lookup.marketCap >= 1000) {
          marketCapStr = `$${(lookup.marketCap / 1000).toFixed(1)}T`
        } else {
          marketCapStr = `$${lookup.marketCap}B`
        }

        batchData.push({
          range: `companies!J${row.rowIndex}`,
          values: [[marketCapStr]],
        })

        updates.push({
          row: row.rowIndex,
          company: row.companyName,
          marketCap: marketCapStr,
          status: 'restored',
        })
      } else {
        notFound.push(row.companyName)
      }
    }

    // Execute batch update
    if (batchData.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: batchData,
        },
      })
    }

    // Get unique not found companies
    const uniqueNotFound = Array.from(new Set(notFound))

    return NextResponse.json({
      success: true,
      restored: updates.length,
      notFound: uniqueNotFound.length,
      notFoundCompanies: uniqueNotFound.slice(0, 20),
      updates: updates.slice(0, 20),
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to restore', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
