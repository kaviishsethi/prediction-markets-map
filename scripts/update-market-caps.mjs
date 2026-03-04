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

// Updates to make based on March 2026 research
const marketCapUpdates = {
  // PUBLIC COMPANIES - Major changes
  "Tesla": "$1.5T",
  "ServiceNow": "$119B",
  "Adobe": "$110B",
  "Micron": "$464B",
  "ASML": "$559B",
  "AppLovin": "$145B",
  "Google": "$3.7T",
  "Google Cloud": "$3.7T",
  "CoreWeave": "$38B",
  "Samsung": "$890B",
  "AMD": "$312B",
  "CrowdStrike": "$96B",
  "Snowflake": "$55B",
  "Datadog": "$39B",
  "ARM": "$130B",
  "MongoDB": "$21B",
  "Cloudflare": "$63B",
  "Alibaba": "$340B",
  "Marvell": "$68B",
  "Palo Alto Networks": "$122B",
  "GE Vernova": "$237B",
  "Vertiv": "$99B",
  "Figma": "$12.6B",
  "Digital Realty": "$60B",
  "Equinix": "$84B",
  "Constellation Energy": "$118B",

  // PRIVATE COMPANIES - Updates
  "OpenAI": "$840B",
  "Groq": "$6.9B",
  "Scale AI": "$29B",
  "Cohere": "$7B",
};

// Ticker updates
const tickerUpdates = {
  "Figma": "$FIG", // Changed from $FIGM
};

// Get all companies from the sheet
const res = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: "companies!A:L",
});

const rows = res.data.values;
const updates = [];
let updateCount = 0;

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const companyName = row[1]; // Column B
  const currentMC = row[8] || ""; // Column I (MC or Valuation)
  const currentTicker = row[7] || ""; // Column H (Ticker)

  // Check if market cap needs update
  if (marketCapUpdates[companyName] && currentMC !== marketCapUpdates[companyName]) {
    updates.push({
      range: `companies!J${i + 1}`,
      values: [[marketCapUpdates[companyName]]]
    });
    console.log(`${companyName}: ${currentMC || "(empty)"} → ${marketCapUpdates[companyName]}`);
    updateCount++;
  }

  // Check if ticker needs update
  if (tickerUpdates[companyName] && currentTicker !== tickerUpdates[companyName]) {
    updates.push({
      range: `companies!I${i + 1}`,
      values: [[tickerUpdates[companyName]]]
    });
    console.log(`${companyName} ticker: ${currentTicker} → ${tickerUpdates[companyName]}`);
  }
}

console.log(`\nTotal updates to make: ${updates.length}`);

if (updates.length > 0) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: updates,
    },
  });
  console.log("✓ Updates applied successfully");
} else {
  console.log("No updates needed");
}

// Print summary of major changes
console.log("\n=== MAJOR CHANGES SUMMARY ===");
console.log("• Tesla: $780B → $1.5T (up 92%)");
console.log("• Micron: $105B → $464B (up 342%)");
console.log("• ASML: $270B → $559B (up 107%)");
console.log("• ServiceNow: $220B → $119B (down 46%)");
console.log("• Adobe: $180B → $110B (down 39%)");
console.log("• AppLovin: $95B → $145B (up 53%)");
console.log("• OpenAI: $730B → $840B (up 15%)");

console.log("\n=== M&A NOTES ===");
console.log("• Figma: Now public (NYSE: FIG, IPO July 2025)");
console.log("• SanDisk: Spun off from Western Digital (Feb 2025)");
console.log("• xAI: Merged with SpaceX (Feb 2026, combined $1.25T)");
console.log("• Groq: Nvidia acquired assets for $20B (Dec 2025)");
