import { NextResponse } from 'next/server'
import { getGoogleSheetsClient } from '@/lib/google-sheets'

const COMPANIES_TO_REMOVE = [
  'Captions',
  'Centraleyes',
  'Gable',
  'Indexify',
  'Lexy',
  'Log10',
  'Lumenova AI',
  'MOSTLY AI',
  'Nomic',
  'OpenEvidence',
  'Pydantic AI',
  'Radiant',
  'TELUS International',
  'Vellum',
]

// GET: Preview what will be deleted
export async function GET() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    // Get all sheet names
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const sheetNames = spreadsheet.data.sheets?.map(s => s.properties?.title || '') || []

    const toDelete: Record<string, Array<{ row: number; name: string }>> = {}

    for (const sheetName of sheetNames) {
      // Get data from each sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A:L`,
      })

      const rows = response.data.values || []
      const matches: Array<{ row: number; name: string }> = []

      // Find company name column (usually B, but check header)
      const header = rows[0] || []
      const nameColIndex = header.findIndex((h: string) =>
        h?.toLowerCase().includes('company') || h?.toLowerCase().includes('name')
      )

      if (nameColIndex === -1) continue

      for (let i = 1; i < rows.length; i++) {
        const companyName = rows[i]?.[nameColIndex] || ''
        if (COMPANIES_TO_REMOVE.some(name =>
          companyName.toLowerCase() === name.toLowerCase()
        )) {
          matches.push({ row: i + 1, name: companyName }) // 1-indexed
        }
      }

      if (matches.length > 0) {
        toDelete[sheetName] = matches
      }
    }

    return NextResponse.json({
      preview: true,
      sheets: sheetNames,
      toDelete,
      totalRows: Object.values(toDelete).flat().length,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// POST: Delete the rows
export async function POST() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    // Get all sheet info
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const sheetInfo = spreadsheet.data.sheets || []

    const results: string[] = []

    for (const sheet of sheetInfo) {
      const sheetName = sheet.properties?.title || ''
      const sheetId = sheet.properties?.sheetId

      if (sheetId === undefined) continue

      // Get data from this sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${sheetName}'!A:L`,
      })

      const rows = response.data.values || []

      // Find company name column
      const header = rows[0] || []
      const nameColIndex = header.findIndex((h: string) =>
        h?.toLowerCase().includes('company') || h?.toLowerCase().includes('name')
      )

      if (nameColIndex === -1) continue

      // Find rows to delete (collect indices in reverse order)
      const rowsToDelete: number[] = []
      for (let i = 1; i < rows.length; i++) {
        const companyName = rows[i]?.[nameColIndex] || ''
        if (COMPANIES_TO_REMOVE.some(name =>
          companyName.toLowerCase() === name.toLowerCase()
        )) {
          rowsToDelete.push(i) // 0-indexed for API
        }
      }

      if (rowsToDelete.length === 0) continue

      // Delete rows in reverse order to maintain indices
      rowsToDelete.sort((a, b) => b - a)

      const requests = rowsToDelete.map(rowIndex => ({
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }))

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      })

      results.push(`Deleted ${rowsToDelete.length} rows from '${sheetName}'`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
