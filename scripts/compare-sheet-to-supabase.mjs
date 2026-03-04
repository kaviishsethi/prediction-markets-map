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

// Parse market cap
function parseMarketCap(str) {
  if (!str) return null;
  const match = str.match(/\$?([\d.]+)(T|B|M)?/i);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const unit = match[2]?.toUpperCase();
  if (unit === 'T') return num * 1000;
  if (unit === 'M') return num / 1000;
  return num;
}

const differences = [];
const missing = [];

for (const row of rows) {
  const [timestamp, name, website, category, description, logoUrl, twitter, publicPrivate, ticker, marketCap] = row;
  if (!name) continue;

  const slug = generateSlug(name);
  const supabaseData = supabaseMap.get(slug);

  if (!supabaseData) {
    missing.push({ name, slug, category });
    continue;
  }

  const sheetMC = parseMarketCap(marketCap);
  const diffs = [];

  if (description && description !== supabaseData.description) {
    diffs.push({ field: 'description', sheet: description?.substring(0, 50) + '...', supabase: supabaseData.description?.substring(0, 50) + '...' });
  }
  if (logoUrl && logoUrl !== supabaseData.logo) {
    diffs.push({ field: 'logo', sheet: logoUrl, supabase: supabaseData.logo });
  }
  if (twitter && twitter !== supabaseData.twitter) {
    diffs.push({ field: 'twitter', sheet: twitter, supabase: supabaseData.twitter });
  }
  if (ticker && ticker !== supabaseData.ticker) {
    diffs.push({ field: 'ticker', sheet: ticker, supabase: supabaseData.ticker });
  }
  if (sheetMC && Math.abs(sheetMC - supabaseData.market_cap) > 0.1) {
    diffs.push({ field: 'market_cap', sheet: sheetMC, supabase: supabaseData.market_cap });
  }
  if (website && website !== supabaseData.website) {
    diffs.push({ field: 'website', sheet: website, supabase: supabaseData.website });
  }

  if (diffs.length > 0) {
    differences.push({ name, slug, diffs });
  }
}

console.log("=== MISSING FROM SUPABASE ===");
if (missing.length === 0) {
  console.log("None");
} else {
  for (const m of missing) {
    console.log(`  • ${m.name} (${m.category})`);
  }
}

console.log("\n=== DIFFERENCES (Sheet → Supabase) ===");
if (differences.length === 0) {
  console.log("None - all data matches!");
} else {
  for (const d of differences) {
    console.log(`\n${d.name} (${d.slug}):`);
    for (const diff of d.diffs) {
      console.log(`  ${diff.field}:`);
      console.log(`    Sheet:    ${diff.sheet}`);
      console.log(`    Supabase: ${diff.supabase}`);
    }
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Missing from Supabase: ${missing.length}`);
console.log(`Rows with differences: ${differences.length}`);
