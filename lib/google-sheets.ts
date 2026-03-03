import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  })

  return google.sheets({ version: 'v4', auth })
}

export interface SheetRow {
  rowIndex: number
  timestamp: string
  companyName: string
  website: string
  category: string
  description: string
  logoUrl: string
  twitter: string
  email: string
  projectPage: string
  status: string
  isPublic: boolean
}

export async function getSheetData(): Promise<SheetRow[]> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'companies!A:K',
  })

  const rows = response.data.values || []

  // Skip header row, map to objects
  return rows.slice(1).map((row, index) => ({
    rowIndex: index + 2, // +2 because: 1-indexed + skip header
    timestamp: row[0] || '',
    companyName: row[1] || '',
    website: row[2] || '',
    category: row[3] || '',
    description: row[4] || '',
    logoUrl: row[5] || '',
    twitter: row[6] || '',
    email: row[7] || '',
    projectPage: row[8] || '',
    status: row[9] || '',
    isPublic: (row[10] || '').toLowerCase() === 'public',
  }))
}

export async function updateRowStatus(rowIndex: number, status: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `companies!J${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[status]],
    },
  })
}
