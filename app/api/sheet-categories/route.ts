import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsClient } from '@/lib/google-sheets'

// GET: Read categories from the Categories tab
export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "categories!A:D",
    })

    const rows = response.data.values || []

    return NextResponse.json({
      success: true,
      rowCount: rows.length,
      rows: rows.map((row, index) => ({
        rowIndex: index + 1,
        category: row[0] || '',
        layer: row[1] || '',
        description: row[2] || '',
        count: row[3] || '',
      })),
    })
  } catch (error) {
    console.error('Read categories error:', error)
    return NextResponse.json(
      { error: 'Failed to read categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST: Update the Categories tab
export async function POST(request: NextRequest) {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID
    const body = await request.json()

    const { updates } = body // Array of { row, col, value } or { range, values }

    if (body.range && body.values) {
      // Full range update
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `categories!${body.range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: body.values,
        },
      })
      return NextResponse.json({ success: true, updated: body.range })
    }

    if (updates && Array.isArray(updates)) {
      // Individual cell updates
      for (const update of updates) {
        const { row, col, value } = update
        const colLetter = String.fromCharCode(64 + col) // 1=A, 2=B, 3=C
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `categories!${colLetter}${row}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[value]],
          },
        })
      }
      return NextResponse.json({ success: true, updatedCells: updates.length })
    }

    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  } catch (error) {
    console.error('Update categories error:', error)
    return NextResponse.json(
      { error: 'Failed to update categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
