import { NextResponse } from 'next/server'
import { getGoogleSheetsClient } from '@/lib/google-sheets'

// Color scheme by layer (RGB values 0-1)
const LAYER_COLORS: Record<string, Record<string, { red: number; green: number; blue: number }>> = {
  APPLICATION: {
    'Consumer': { red: 0.85, green: 0.92, blue: 1.0 },             // Light blue
    'Enterprise': { red: 0.78, green: 0.88, blue: 1.0 },           // Slightly darker blue
    'Agent Platforms/Frameworks': { red: 0.7, green: 0.84, blue: 1.0 },  // Medium blue
    'Vertical AI': { red: 0.55, green: 0.76, blue: 1.0 },          // Darker blue (hidden but keep for compat)
  },
  MODEL: {
    'Foundation Models': { red: 0.91, green: 0.85, blue: 1.0 },    // Light purple
    'Post-Training': { red: 0.82, green: 0.7, blue: 1.0 },          // Darker purple
  },
  DATA: {
    'Storage & Retrieval': { red: 0.85, green: 0.95, blue: 0.85 }, // Light green
    'Labeling': { red: 0.65, green: 0.88, blue: 0.65 },            // Medium green
    'Pipelines': { red: 0.45, green: 0.8, blue: 0.5 },             // Darker green
  },
  INFRA: {
    'Cloud & Hosting': { red: 1.0, green: 0.92, blue: 0.8 },       // Light orange
    'Inference': { red: 1.0, green: 0.85, blue: 0.65 },            // Medium orange
    'Chips & Hardware': { red: 1.0, green: 0.78, blue: 0.5 },      // Darker orange
    'Energy & Datacenters': { red: 1.0, green: 0.7, blue: 0.4 },   // Even darker orange
  },
  SECURITY: {
    'Model Security': { red: 1.0, green: 0.85, blue: 0.85 },       // Light red
    'Infrastructure Security': { red: 1.0, green: 0.7, blue: 0.7 }, // Medium red
    'AI Governance': { red: 1.0, green: 0.55, blue: 0.55 },        // Darker red
  },
}

// Layer colors for the Layer column in categories tab
const LAYER_HEADER_COLORS: Record<string, { red: number; green: number; blue: number }> = {
  'APPLICATION': { red: 0.7, green: 0.84, blue: 1.0 },    // Blue
  'MODEL': { red: 0.82, green: 0.7, blue: 1.0 },          // Purple
  'DATA': { red: 0.65, green: 0.88, blue: 0.65 },         // Green
  'INFRA': { red: 1.0, green: 0.85, blue: 0.65 },         // Orange
  'SECURITY': { red: 1.0, green: 0.7, blue: 0.7 },        // Red
}

export async function POST() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    // Get sheet IDs
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const companiesSheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'companies')
    const categoriesSheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'categories')
    const companiesSheetId = companiesSheet?.properties?.sheetId || 0
    const categoriesSheetId = categoriesSheet?.properties?.sheetId

    // Build conditional formatting rules for companies tab (column D)
    const companiesFormatRules: object[] = []
    Object.entries(LAYER_COLORS).forEach(([_, categories]) => {
      Object.entries(categories).forEach(([categoryName, color]) => {
        companiesFormatRules.push({
          addConditionalFormatRule: {
            rule: {
              ranges: [{
                sheetId: companiesSheetId,
                startRowIndex: 1,
                startColumnIndex: 3,
                endColumnIndex: 4,
              }],
              booleanRule: {
                condition: {
                  type: 'TEXT_EQ',
                  values: [{ userEnteredValue: categoryName }],
                },
                format: {
                  backgroundColor: color,
                },
              },
            },
            index: 0,
          },
        })
      })
    })

    // Build formatting rules for categories tab
    const categoriesFormatRules: object[] = []
    if (categoriesSheetId !== undefined) {
      // Format column A (Category name) based on category
      Object.entries(LAYER_COLORS).forEach(([_, categories]) => {
        Object.entries(categories).forEach(([categoryName, color]) => {
          categoriesFormatRules.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: categoriesSheetId,
                  startRowIndex: 1,
                  startColumnIndex: 0, // Column A
                  endColumnIndex: 1,
                }],
                booleanRule: {
                  condition: {
                    type: 'TEXT_EQ',
                    values: [{ userEnteredValue: categoryName }],
                  },
                  format: {
                    backgroundColor: color,
                  },
                },
              },
              index: 0,
            },
          })
        })
      })

      // Format column B (Layer) based on layer name
      Object.entries(LAYER_HEADER_COLORS).forEach(([layerName, color]) => {
        categoriesFormatRules.push({
          addConditionalFormatRule: {
            rule: {
              ranges: [{
                sheetId: categoriesSheetId,
                startRowIndex: 1,
                startColumnIndex: 1, // Column B
                endColumnIndex: 2,
              }],
              booleanRule: {
                condition: {
                  type: 'TEXT_EQ',
                  values: [{ userEnteredValue: layerName }],
                },
                format: {
                  backgroundColor: color,
                },
              },
            },
            index: 0,
          },
        })
      })
    }

    // Execute batch update
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Clear data validation on companies column D
          {
            setDataValidation: {
              range: {
                sheetId: companiesSheetId,
                startRowIndex: 1,
                startColumnIndex: 3,
                endColumnIndex: 4,
              },
              rule: null,
            },
          },
          // Add companies formatting rules
          ...companiesFormatRules,
          // Add categories formatting rules
          ...categoriesFormatRules,
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sheet formatted with color-coded categories',
      categoriesFormatted: Object.values(LAYER_COLORS).flatMap(c => Object.keys(c)),
    })
  } catch (error) {
    console.error('Format sheet error:', error)

    // If deleting conditional format fails (none exists), try without that step
    if (error instanceof Error && error.message.includes('deleteConditionalFormatRule')) {
      return await formatWithoutDelete()
    }

    return NextResponse.json(
      { error: 'Failed to format sheet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function formatWithoutDelete() {
  try {
    const sheets = await getGoogleSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const companiesSheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'companies')
    const categoriesSheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'categories')
    const companiesSheetId = companiesSheet?.properties?.sheetId || 0
    const categoriesSheetId = categoriesSheet?.properties?.sheetId

    const conditionalFormatRules: object[] = []

    // Companies tab formatting
    Object.entries(LAYER_COLORS).forEach(([_, categories]) => {
      Object.entries(categories).forEach(([categoryName, color]) => {
        conditionalFormatRules.push({
          addConditionalFormatRule: {
            rule: {
              ranges: [{
                sheetId: companiesSheetId,
                startRowIndex: 1,
                startColumnIndex: 3,
                endColumnIndex: 4,
              }],
              booleanRule: {
                condition: {
                  type: 'TEXT_EQ',
                  values: [{ userEnteredValue: categoryName }],
                },
                format: {
                  backgroundColor: color,
                },
              },
            },
            index: 0,
          },
        })
      })
    })

    // Categories tab formatting
    if (categoriesSheetId !== undefined) {
      Object.entries(LAYER_COLORS).forEach(([_, categories]) => {
        Object.entries(categories).forEach(([categoryName, color]) => {
          conditionalFormatRules.push({
            addConditionalFormatRule: {
              rule: {
                ranges: [{
                  sheetId: categoriesSheetId,
                  startRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 1,
                }],
                booleanRule: {
                  condition: {
                    type: 'TEXT_EQ',
                    values: [{ userEnteredValue: categoryName }],
                  },
                  format: {
                    backgroundColor: color,
                  },
                },
              },
              index: 0,
            },
          })
        })
      })

      Object.entries(LAYER_HEADER_COLORS).forEach(([layerName, color]) => {
        conditionalFormatRules.push({
          addConditionalFormatRule: {
            rule: {
              ranges: [{
                sheetId: categoriesSheetId,
                startRowIndex: 1,
                startColumnIndex: 1,
                endColumnIndex: 2,
              }],
              booleanRule: {
                condition: {
                  type: 'TEXT_EQ',
                  values: [{ userEnteredValue: layerName }],
                },
                format: {
                  backgroundColor: color,
                },
              },
            },
            index: 0,
          },
        })
      })
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            setDataValidation: {
              range: {
                sheetId: companiesSheetId,
                startRowIndex: 1,
                startColumnIndex: 3,
                endColumnIndex: 4,
              },
              rule: null,
            },
          },
          ...conditionalFormatRules,
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sheet formatted with color-coded categories',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to format sheet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
