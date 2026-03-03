import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"'))) value = value.slice(1, -1);
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
const xProfileUrl = process.argv[3];
const profilePicUrl = process.argv[4];

if (!rowIndex || !xProfileUrl || !profilePicUrl) {
  console.log('Usage: node update-logo-row.mjs <rowIndex> <xProfileUrl> <profilePicUrl>');
  process.exit(1);
}

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId,
  requestBody: {
    valueInputOption: 'RAW',
    data: [
      { range: `logos!B${rowIndex}`, values: [[xProfileUrl]] },
      { range: `logos!C${rowIndex}`, values: [[profilePicUrl]] },
    ],
  },
});

console.log(`Updated row ${rowIndex}`);
