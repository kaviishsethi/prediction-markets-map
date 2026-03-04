import { google } from "googleapis";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
const env = {};
envFile.split("\n").forEach(line => {
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
    private_key: env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = env.GOOGLE_SHEETS_ID;

// Get all companies from the sheet
const res = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: "companies!A:L",
});

const rows = res.data.values;
const updates = [];

const energyCompanies = [
  "Bloom Energy",
  "Liberty Energy",
  "Solaris Energy Infrastructure",
  "Power Solutions International",
  "IREN",
  "Cipher Mining",
  "Riot Platforms",
  "BitDeer",
  "Hut 8",
  "CleanSpark",
  "Bitfarms",
  "WhiteFiber"
];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const companyName = row[1]; // Column B
  const status = row[11]; // Column L

  if (energyCompanies.includes(companyName) && status === "Done") {
    updates.push({
      range: `companies!L${i + 1}`,
      values: [["Synced"]]
    });
    console.log(`${companyName}: Done → Synced`);
  }
}

if (updates.length > 0) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: updates,
    },
  });
  console.log(`\n✓ Updated ${updates.length} companies to Synced`);
} else {
  console.log("No companies to update");
}
