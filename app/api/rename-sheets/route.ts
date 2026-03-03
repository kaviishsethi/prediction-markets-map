import { NextResponse } from 'next/server'
import { getGoogleSheetsClient } from '@/lib/google-sheets'

export async function POST() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    // Get all sheets
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const sheetsList = spreadsheet.data.sheets || []

    const requests: object[] = []

    // Find Sheet1 and rename to 'companies'
    const sheet1 = sheetsList.find(s => s.properties?.title === 'Sheet1')
    if (sheet1?.properties?.sheetId !== undefined) {
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId: sheet1.properties.sheetId,
            title: 'companies',
          },
          fields: 'title',
        },
      })
    }

    // Find the categories sheet (has trailing space) and rename to 'categories'
    const categoriesSheet = sheetsList.find(s =>
      s.properties?.title === 'categories ' ||
      s.properties?.title === 'categories' ||
      s.properties?.title === 'Sheet2'
    )
    if (categoriesSheet?.properties?.sheetId !== undefined && categoriesSheet.properties.title !== 'categories') {
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId: categoriesSheet.properties.sheetId,
            title: 'categories',
          },
          fields: 'title',
        },
      })
    }

    if (requests.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Sheets already have correct names',
        sheets: sheetsList.map(s => s.properties?.title),
      })
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    })

    return NextResponse.json({
      success: true,
      message: 'Sheets renamed successfully',
      renames: requests.length,
    })
  } catch (error) {
    console.error('Rename sheets error:', error)
    return NextResponse.json(
      { error: 'Failed to rename sheets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
