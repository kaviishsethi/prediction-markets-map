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

// Energy & Datacenters companies to add
const newCompanies = [
  {
    name: "Bloom Energy",
    website: "https://bloomenergy.com",
    category: "Energy & Datacenters",
    description: "Solid oxide fuel cell manufacturer for on-site power generation. Partnered with Brookfield for $5B AI infrastructure deployment. Products convert natural gas, biogas, or hydrogen to electricity.",
    logoUrl: "https://pbs.twimg.com/profile_images/1736633420699677952/9Z0mO9cD_400x400.jpg",
    twitter: "https://x.com/BloomEnergy",
    publicPrivate: "Public",
    ticker: "$BE",
    valuation: "$43B"
  },
  {
    name: "Liberty Energy",
    website: "https://libertyenergy.com",
    category: "Energy & Datacenters",
    description: "Oilfield services provider expanding into distributed power and energy storage for data centers. Liberty Power Innovations delivers solutions for commercial, industrial, and mining industries.",
    logoUrl: "https://pbs.twimg.com/profile_images/1702670289446081792/9dX8lYhW_400x400.jpg",
    twitter: "https://x.com/LibertyEnergy",
    publicPrivate: "Public",
    ticker: "$LBRT",
    valuation: "$4.6B"
  },
  {
    name: "Solaris Energy Infrastructure",
    website: "https://solaris-energy.com",
    category: "Energy & Datacenters",
    description: "Mobile and scalable equipment solutions for distributed power generation. Operates Solaris Power Solutions and Solaris Logistics Solutions segments for energy infrastructure.",
    logoUrl: "https://pbs.twimg.com/profile_images/1785623834369702401/1z6E1n4C_400x400.jpg",
    twitter: "https://x.com/SolarisSEI",
    publicPrivate: "Public",
    ticker: "$SEI",
    valuation: "$3.1B"
  },
  {
    name: "Power Solutions International",
    website: "https://psiengines.com",
    category: "Energy & Datacenters",
    description: "Designs and manufactures engines and power systems for industrial applications. Provides distributed power generation solutions for data centers and critical infrastructure.",
    logoUrl: "https://pbs.twimg.com/profile_images/1722756087/PSIX_logo_400x400.jpg",
    twitter: "https://x.com/PSIXInc",
    publicPrivate: "Public",
    ticker: "$PSIX",
    valuation: "$2B"
  },
  {
    name: "IREN",
    website: "https://iren.com",
    category: "Energy & Datacenters",
    description: "Bitcoin mining and AI cloud infrastructure company. Secured $9.7B Microsoft contract for 200MW AI datacenter. Scaling to 140,000 GPUs targeting $3.4B AI cloud ARR by end of 2026.",
    logoUrl: "https://pbs.twimg.com/profile_images/1857847399352209408/abc_400x400.jpg",
    twitter: "https://x.com/IREN_Ltd",
    publicPrivate: "Public",
    ticker: "$IREN",
    valuation: "$13B"
  },
  {
    name: "Cipher Mining",
    website: "https://ciphermining.com",
    category: "Energy & Datacenters",
    description: "Bitcoin mining company powered by renewable energy. Rebranded to Cipher Digital in 2026. Operates large-scale mining facilities with focus on sustainable energy sources.",
    logoUrl: "https://pbs.twimg.com/profile_images/1840998452453246976/0sF2D3gD_400x400.jpg",
    twitter: "https://x.com/CipherMining",
    publicPrivate: "Public",
    ticker: "$CIFR",
    valuation: "$6B"
  },
  {
    name: "Riot Platforms",
    website: "https://riotplatforms.com",
    category: "Energy & Datacenters",
    description: "Vertically integrated Bitcoin mining company with 1.7GW power capacity in Texas. Pivoting to AI/HPC hosting with AMD datacenter lease. Starboard Value urging faster AI expansion.",
    logoUrl: "https://pbs.twimg.com/profile_images/1779376681986639360/9qX3rH3m_400x400.jpg",
    twitter: "https://x.com/riotplatforms",
    publicPrivate: "Public",
    ticker: "$RIOT",
    valuation: "$6.1B"
  },
  {
    name: "BitDeer",
    website: "https://bitdeer.com",
    category: "Energy & Datacenters",
    description: "Bitcoin mining and AI cloud infrastructure company based in Singapore. Develops SEALMINER mining hardware. Operating datacenters in US, Norway, and Bhutan with AI cloud capabilities.",
    logoUrl: "https://pbs.twimg.com/profile_images/1800268752231954432/9p2fY0aA_400x400.jpg",
    twitter: "https://x.com/BitdeerGroup",
    publicPrivate: "Public",
    ticker: "$BTDR",
    valuation: "$1.9B"
  },
  {
    name: "Hut 8",
    website: "https://hut8.com",
    category: "Energy & Datacenters",
    description: "Energy infrastructure platform integrating power, digital infrastructure, and compute. Signed $7B 15-year lease with Fluidstack for 245MW AI/HPC datacenter. Holds $1.6B in Bitcoin reserves.",
    logoUrl: "https://pbs.twimg.com/profile_images/1822411559364742401/8fK2qU8b_400x400.jpg",
    twitter: "https://x.com/Hut8Corp",
    publicPrivate: "Public",
    ticker: "$HUT",
    valuation: "$5.3B"
  },
  {
    name: "CleanSpark",
    website: "https://cleanspark.com",
    category: "Energy & Datacenters",
    description: "America's Bitcoin Miner® with 1.8GW power under contract. Data center developer expanding into AI/HPC workloads. Acquired 447 acres in Texas for 600MW datacenter campus.",
    logoUrl: "https://pbs.twimg.com/profile_images/2016261514932486144/RHPCar0n_400x400.jpg",
    twitter: "https://x.com/CleanSpark_Inc",
    publicPrivate: "Public",
    ticker: "$CLSK",
    valuation: "$2.7B"
  },
  {
    name: "Bitfarms",
    website: "https://bitfarms.com",
    category: "Energy & Datacenters",
    description: "Bitcoin miner rebranding to Keel Infrastructure in April 2026. Pivoting to AI/HPC datacenters with 2.1GW North American power portfolio. Converting Washington site to HPC/AI by Dec 2026.",
    logoUrl: "https://pbs.twimg.com/profile_images/1728599829962187264/9u4L3w4G_400x400.jpg",
    twitter: "https://x.com/Bitfarms_io",
    publicPrivate: "Public",
    ticker: "$BITF",
    valuation: "$1.1B"
  },
  {
    name: "WhiteFiber",
    website: "https://whitefiber.com",
    category: "Energy & Datacenters",
    description: "GPU cloud and AI datacenter subsidiary of Bit Digital. Operating NC-1 campus with 200MW capacity. Secured $865M 10-year colocation deal with Nscale. Offers H200, B200, GB200 GPU clusters.",
    logoUrl: "https://pbs.twimg.com/profile_images/1848280451216174080/1qV6y3aC_400x400.jpg",
    twitter: "https://x.com/WhiteFiber_",
    publicPrivate: "Public",
    ticker: "$BTBT",
    valuation: "$400M"
  }
];

const timestamp = new Date().toISOString();

// Add to companies tab
const companyRows = newCompanies.map(c => [
  timestamp,
  c.name,
  c.website,
  c.category,
  c.description,
  c.logoUrl,
  c.twitter,
  c.publicPrivate,
  c.ticker,
  c.valuation,
  "",
  "Done"
]);

await sheets.spreadsheets.values.append({
  spreadsheetId,
  range: "companies!A:L",
  valueInputOption: "RAW",
  requestBody: {
    values: companyRows,
  },
});

console.log(`✓ Added ${newCompanies.length} companies to companies tab`);

// Add to logos tab (only those with Twitter info)
const logoRows = newCompanies
  .filter(c => c.twitter && c.logoUrl)
  .map(c => [c.name, c.twitter, c.logoUrl]);

if (logoRows.length > 0) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "logos!A:C",
    valueInputOption: "RAW",
    requestBody: {
      values: logoRows,
    },
  });
  console.log(`✓ Added ${logoRows.length} companies to logos tab`);
}

// Summary
console.log("\n=== ENERGY & DATACENTERS COMPANIES ADDED ===");
for (const c of newCompanies) {
  console.log(`• ${c.name} (${c.ticker}) - ${c.valuation}`);
}
