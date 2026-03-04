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

const res = await sheets.spreadsheets.values.get({
  spreadsheetId: env.GOOGLE_SHEETS_ID,
  range: "companies!B:J",
});

const companies = new Map();
for (const row of res.data.values.slice(1)) {
  const name = row[0];
  if (name && !companies.has(name)) {
    companies.set(name, {
      name,
      website: row[1] || "",
      publicPrivate: row[6] || "",
      ticker: row[7] || "",
      mcValuation: row[8] || ""
    });
  }
}

const publicCompanies = [];
const privateCompanies = [];

for (const [name, data] of companies) {
  if (data.publicPrivate === "Public") {
    publicCompanies.push(data);
  } else {
    privateCompanies.push(data);
  }
}

console.log("=== PUBLIC COMPANIES (" + publicCompanies.length + ") ===");
for (const c of publicCompanies.sort((a,b) => a.name.localeCompare(b.name))) {
  console.log(JSON.stringify({name: c.name, ticker: c.ticker, mc: c.mcValuation}));
}

console.log("\n=== PRIVATE COMPANIES (" + privateCompanies.length + ") ===");
for (const c of privateCompanies.sort((a,b) => a.name.localeCompare(b.name))) {
  console.log(JSON.stringify({name: c.name, valuation: c.mcValuation}));
}
