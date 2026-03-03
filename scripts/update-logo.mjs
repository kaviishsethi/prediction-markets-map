import { google } from 'googleapis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

async function getCompaniesWithTwitter() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'companies!A:L',
  });

  const rows = response.data.values || [];
  // Skip header, find companies with Twitter (col G, index 6)
  return rows.slice(1)
    .map((row, idx) => ({
      rowIndex: idx + 2,
      companyName: row[1] || '',
      logoUrl: row[5] || '',
      twitter: row[6] || '',
    }))
    .filter(r => r.twitter && r.twitter.trim());
}

async function updateLogoUrl(rowIndex, newLogoUrl) {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `companies!F${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[newLogoUrl]],
    },
  });
  console.log(`Updated row ${rowIndex} logo to: ${newLogoUrl}`);
}

const action = process.argv[2];

if (action === 'list') {
  const companies = await getCompaniesWithTwitter();
  console.log(`Found ${companies.length} companies with Twitter handles:\n`);
  companies.slice(0, 20).forEach(c => {
    const handle = c.twitter.replace(/https?:\/\/(twitter|x)\.com\//i, '').replace(/\/$/, '');
    console.log(`Row ${c.rowIndex}: ${c.companyName} -> @${handle} (logo: ${c.logoUrl ? 'yes' : 'NO'})`);
  });
} else if (action === 'update') {
  const rowIndex = parseInt(process.argv[3]);
  const newLogoUrl = process.argv[4];
  if (!rowIndex || !newLogoUrl) {
    console.log('Usage: node update-logo.mjs update <rowIndex> <newLogoUrl>');
    process.exit(1);
  }
  await updateLogoUrl(rowIndex, newLogoUrl);
} else {
  console.log('Usage:');
  console.log('  node update-logo.mjs list              - List companies with Twitter');
  console.log('  node update-logo.mjs update <row> <url> - Update logo URL');
}
