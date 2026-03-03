import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually
const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1].trim()] = value;
  }
});

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = env.GOOGLE_SHEETS_ID;

const rowIndex = parseInt(process.argv[2]);
const twitterHandle = process.argv[3];
const logoUrl = process.argv[4];

if (!rowIndex || !twitterHandle || !logoUrl) {
  console.log('Usage: node update-company.mjs <rowIndex> <twitterHandle> <logoUrl>');
  console.log('Example: node update-company.mjs 2 nvidia https://pbs.twimg.com/...');
  process.exit(1);
}

// Update Twitter (column G) and Logo URL (column F)
const twitterUrl = `https://x.com/${twitterHandle}`;

// Batch update both columns
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId,
  requestBody: {
    valueInputOption: 'RAW',
    data: [
      { range: `companies!F${rowIndex}`, values: [[logoUrl]] },
      { range: `companies!G${rowIndex}`, values: [[twitterUrl]] },
    ],
  },
});

console.log(`✓ Updated row ${rowIndex}:`);
console.log(`  Twitter: ${twitterUrl}`);
console.log(`  Logo: ${logoUrl}`);
