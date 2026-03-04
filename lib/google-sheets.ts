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
  timestamp: string        // A
  companyName: string      // B
  website: string          // C
  category: string         // D
  description: string      // E
  logoUrl: string          // F
  twitter: string          // G
  isPublic: boolean        // H (Public/Private)
  ticker: string           // I
  marketCap: string        // J (MC or Valuation)
  projectPage: string      // K
  status: string           // L
}

export async function getSheetData(): Promise<SheetRow[]> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'companies!A:L',  // Extended to column L
  })

  const rows = response.data.values || []

  // Skip header row, map to objects
  // Headers: Timestamp, Company Name, Website, Category, Description, Logo URL, Twitter, Public/Private, Ticker, MC or Valuation, Project Page, Status
  return rows.slice(1).map((row, index) => ({
    rowIndex: index + 2, // +2 because: 1-indexed + skip header
    timestamp: row[0] || '',
    companyName: row[1] || '',
    website: row[2] || '',
    category: row[3] || '',
    description: row[4] || '',
    logoUrl: row[5] || '',
    twitter: row[6] || '',
    isPublic: (row[7] || '').toLowerCase() === 'public',
    ticker: row[8] || '',
    marketCap: row[9] || '',
    projectPage: row[10] || '',
    status: row[11] || '',
  }))
}

export async function updateRowStatus(rowIndex: number, status: string): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID

  // Status is in column L (index 12)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `companies!L${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[status]],
    },
  })
}

export interface LogoRow {
  companyName: string
  twitter: string
  logoUrl: string
}

export async function getLogosData(): Promise<LogoRow[]> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'logos!A:C',  // A=company name, B=twitter, C=logo URL
  })

  const rows = response.data.values || []

  // Skip header row, filter to rows with logo URLs
  return rows.slice(1).map((row) => ({
    companyName: row[0] || '',
    twitter: row[1] || '',
    logoUrl: row[2] || '',
  })).filter(row => row.companyName && row.logoUrl)
}

export interface NewCompanyRow {
  companyName: string
  website: string
  category: string
  description: string
  logoUrl: string
  twitter: string
  isPublic: boolean
  ticker: string
  marketCap: string
  projectPage: string
}

export async function appendCompanyRow(company: NewCompanyRow): Promise<void> {
  const sheets = await getGoogleSheetsClient()
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID

  const timestamp = new Date().toISOString()
  const row = [
    timestamp,                              // A: Timestamp
    company.companyName,                    // B: Company Name
    company.website,                        // C: Website
    company.category,                       // D: Category
    company.description,                    // E: Description
    company.logoUrl,                        // F: Logo URL
    company.twitter,                        // G: Twitter
    company.isPublic ? 'Public' : 'Private', // H: Public/Private
    company.ticker,                         // I: Ticker
    company.marketCap,                      // J: MC or Valuation
    company.projectPage,                    // K: Project Page
    'Done',                                 // L: Status (ready to sync)
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'companies!A:L',
    valueInputOption: 'RAW',
    requestBody: {
      values: [row],
    },
  })
}
