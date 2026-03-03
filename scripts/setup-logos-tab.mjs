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

// Step 1: Get all company names from 'companies' tab
console.log('Reading companies tab...');
const response = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: 'companies!B:B', // Column B is Company Name
});

const rows = response.data.values || [];
const allNames = rows.slice(1).map(r => r[0]).filter(Boolean); // Skip header
const uniqueNames = [...new Set(allNames)].sort();

console.log(`Found ${allNames.length} total entries, ${uniqueNames.length} unique companies`);

// Step 2: Check if 'logos' tab exists, create if not
const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
const logosTab = spreadsheet.data.sheets.find(s => s.properties.title === 'logos');

if (!logosTab) {
  console.log('Creating logos tab...');
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        addSheet: {
          properties: { title: 'logos' }
        }
      }]
    }
  });
}

// Step 3: Write headers and unique company names
console.log('Writing to logos tab...');
const dataToWrite = [
  ['Company Name', 'X Profile URL', 'Profile Picture URL'], // Header
  ...uniqueNames.map(name => [name, '', ''])
];

await sheets.spreadsheets.values.update({
  spreadsheetId,
  range: 'logos!A1',
  valueInputOption: 'RAW',
  requestBody: {
    values: dataToWrite,
  },
});

console.log(`✓ Created 'logos' tab with ${uniqueNames.length} unique companies`);
console.log('\nFirst 10 companies:');
uniqueNames.slice(0, 10).forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
