import { NextResponse } from 'next/server'
import { getGoogleSheetsClient } from '@/lib/google-sheets'

// GET: Get spreadsheet info including all sheet/tab names
export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    const sheetNames = response.data.sheets?.map((sheet) => ({
      title: sheet.properties?.title,
      sheetId: sheet.properties?.sheetId,
      index: sheet.properties?.index,
    }))

    return NextResponse.json({
      success: true,
      spreadsheetTitle: response.data.properties?.title,
      sheets: sheetNames,
    })
  } catch (error) {
    console.error('Sheet info error:', error)
    return NextResponse.json(
      { error: 'Failed to get sheet info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
