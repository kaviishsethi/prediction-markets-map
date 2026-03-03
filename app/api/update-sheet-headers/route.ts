import { NextResponse } from 'next/server'
import { getGoogleSheetsClient } from '@/lib/google-sheets'

export async function POST() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    // Update header row with new column structure (includes Ticker and Status)
    const newHeaders = [
      'Timestamp',
      'Company Name',
      'Website',
      'Category',
      'Description',
      'Logo URL',
      'Twitter',
      'Public/Private',
      'Ticker',
      'MC or Valuation',
      'Project Page',
      'Status',
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'companies!A1:L1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [newHeaders],
      },
    })

    // Clear old column M if any leftover data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'companies!M:M',
    })

    return NextResponse.json({
      success: true,
      headers: newHeaders,
      message: 'Sheet headers updated. Removed Email column, added Market Cap column.',
    })
  } catch (error) {
    console.error('Update headers error:', error)
    return NextResponse.json(
      { error: 'Failed to update headers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
