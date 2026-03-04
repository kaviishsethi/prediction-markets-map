import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
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

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = google.sheets({ version: "v4", auth });

// Supabase setup
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Get sheet data
const sheetRes = await sheets.spreadsheets.values.get({
  spreadsheetId: env.GOOGLE_SHEETS_ID,
  range: "companies!A:L",
});
const rows = sheetRes.data.values.slice(1); // Skip header

// Get Supabase data
const { data: supabaseProtocols } = await supabase
  .from("ai_protocols_metadata")
  .select("*");

const supabaseMap = new Map();
for (const p of supabaseProtocols) {
  supabaseMap.set(p.protocol, p);
}

// Generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Parse market cap - handle both "$43B" and "$7.2M raised" formats
function parseMarketCap(str) {
  if (!str) return null;
  const match = str.match(/\$?([\d.]+)\s*(T|B|M)?/i);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const unit = match[2]?.toUpperCase();
  if (unit === 'T') return num * 1000; // to billions
  if (unit === 'M') return num / 1000; // to billions
  return num; // already billions
}

// Build a map of the LATEST data for each protocol from the sheet
// (use the most recent row for each protocol)
const latestSheetData = new Map();

for (const row of rows) {
  const [timestamp, name, website, category, description, logoUrl, twitter, publicPrivate, ticker, marketCap] = row;
  if (!name) continue;

  const slug = generateSlug(name);
  const existing = latestSheetData.get(slug);

  // Update if this row has more complete data
  const current = {
    name,
    website: website || existing?.website,
    description: description || existing?.description,
    logo: logoUrl || existing?.logo,
    twitter: twitter || existing?.twitter,
    is_public: publicPrivate === 'Public',
    ticker: ticker || existing?.ticker,
    market_cap: parseMarketCap(marketCap) ?? existing?.market_cap,
  };

  // Prefer non-empty values
  if (!existing) {
    latestSheetData.set(slug, current);
  } else {
    latestSheetData.set(slug, {
      name: current.name || existing.name,
      website: current.website || existing.website,
      description: current.description || existing.description,
      logo: current.logo || existing.logo,
      twitter: current.twitter || existing.twitter,
      is_public: current.is_public,
      ticker: current.ticker || existing.ticker,
      market_cap: current.market_cap ?? existing.market_cap,
    });
  }
}

console.log("=== SYNCING SHEET UPDATES TO SUPABASE ===\n");

let updatedCount = 0;
let insertedCount = 0;
let errorCount = 0;

for (const [slug, sheetData] of latestSheetData) {
  const supabaseData = supabaseMap.get(slug);

  if (!supabaseData) {
    // Insert new protocol
    console.log(`+ INSERT: ${sheetData.name} (${slug})`);

    const { error } = await supabase
      .from("ai_protocols_metadata")
      .insert({
        protocol: slug,
        name: sheetData.name,
        description: sheetData.description,
        logo: sheetData.logo,
        website: sheetData.website,
        twitter: sheetData.twitter,
        is_public: sheetData.is_public,
        market_cap: sheetData.market_cap,
        ticker: sheetData.ticker,
      });

    if (error) {
      console.error(`  ERROR: ${error.message}`);
      errorCount++;
    } else {
      insertedCount++;
    }
    continue;
  }

  // Check for differences and update
  const updates = {};

  if (sheetData.logo && sheetData.logo !== supabaseData.logo) {
    updates.logo = sheetData.logo;
  }
  if (sheetData.twitter && sheetData.twitter !== supabaseData.twitter) {
    updates.twitter = sheetData.twitter;
  }
  if (sheetData.website && sheetData.website !== supabaseData.website) {
    updates.website = sheetData.website;
  }
  if (sheetData.ticker && sheetData.ticker !== supabaseData.ticker) {
    updates.ticker = sheetData.ticker;
  }
  if (sheetData.market_cap && Math.abs(sheetData.market_cap - (supabaseData.market_cap || 0)) > 0.01) {
    updates.market_cap = sheetData.market_cap;
  }
  // Update description only if it's longer/more complete
  if (sheetData.description && sheetData.description.length > (supabaseData.description?.length || 0)) {
    updates.description = sheetData.description;
  }

  if (Object.keys(updates).length > 0) {
    console.log(`~ UPDATE: ${sheetData.name} (${slug})`);
    for (const [field, value] of Object.entries(updates)) {
      const displayValue = typeof value === 'string' && value.length > 60
        ? value.substring(0, 60) + '...'
        : value;
      console.log(`    ${field}: ${displayValue}`);
    }

    const { error } = await supabase
      .from("ai_protocols_metadata")
      .update(updates)
      .eq("protocol", slug);

    if (error) {
      console.error(`  ERROR: ${error.message}`);
      errorCount++;
    } else {
      updatedCount++;
    }
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Inserted: ${insertedCount}`);
console.log(`Updated: ${updatedCount}`);
console.log(`Errors: ${errorCount}`);
