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

// Get companies tab data (source of truth)
const companiesRes = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: "companies!B:G", // Name, Website, Category, Description, Logo URL, Twitter
});

// Build map of unique companies with their logo and twitter from companies tab
const companiesData = new Map();
for (const row of companiesRes.data.values.slice(1)) {
  const [name, website, category, description, logoUrl, twitter] = row;
  if (!name) continue;

  // Only update if we have data (don't overwrite with empty)
  const existing = companiesData.get(name);
  companiesData.set(name, {
    name,
    twitter: twitter || existing?.twitter || "",
    logo: logoUrl || existing?.logo || "",
  });
}

// Get current logos tab data
const logosRes = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: "logos!A:C",
});

const logosRows = logosRes.data.values || [];
const logosHeader = logosRows[0]; // ["Company Name", "X Profile URL", "Profile Picture URL"]

// Build map of existing logos tab entries
const existingLogos = new Map();
for (let i = 1; i < logosRows.length; i++) {
  const [name, twitter, logo] = logosRows[i];
  if (name) {
    existingLogos.set(name, { rowIndex: i + 1, twitter, logo });
  }
}

console.log(`Companies tab: ${companiesData.size} unique companies`);
console.log(`Logos tab: ${existingLogos.size} entries\n`);

// Find updates needed and new entries
const updates = [];
const newEntries = [];

for (const [name, data] of companiesData) {
  if (!data.twitter && !data.logo) continue; // Skip if no logo/twitter data

  const existing = existingLogos.get(name);

  if (!existing) {
    // New entry needed
    if (data.twitter || data.logo) {
      newEntries.push([name, data.twitter, data.logo]);
    }
  } else {
    // Check if update needed
    if (data.twitter !== existing.twitter || data.logo !== existing.logo) {
      updates.push({
        range: `logos!B${existing.rowIndex}:C${existing.rowIndex}`,
        values: [[data.twitter, data.logo]]
      });
      console.log(`UPDATE: ${name}`);
      if (data.twitter !== existing.twitter) {
        console.log(`  Twitter: ${existing.twitter || '(empty)'} → ${data.twitter || '(empty)'}`);
      }
      if (data.logo !== existing.logo) {
        console.log(`  Logo: ${existing.logo?.substring(0, 50) || '(empty)'}... → ${data.logo?.substring(0, 50) || '(empty)'}...`);
      }
    }
  }
}

// Apply updates
if (updates.length > 0) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: updates,
    },
  });
  console.log(`\n✓ Updated ${updates.length} rows in logos tab`);
}

// Add new entries
if (newEntries.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "logos!A:C",
    valueInputOption: "RAW",
    requestBody: {
      values: newEntries,
    },
  });
  console.log(`✓ Added ${newEntries.length} new rows to logos tab`);
  console.log("\nNew entries:");
  for (const [name, twitter, logo] of newEntries) {
    console.log(`  + ${name}`);
  }
}

if (updates.length === 0 && newEntries.length === 0) {
  console.log("✓ Logos tab already in sync with companies tab");
}

console.log("\n=== DONE ===");
