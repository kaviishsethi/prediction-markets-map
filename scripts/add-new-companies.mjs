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

// New companies to add from the Menlo Ventures Modern AI Stack
const newCompanies = [
  {
    name: "Log10",
    website: "https://log10.io",
    category: "Observability",
    description: "LLM observability and evaluation platform. Uses AI and synthetic data to measure and improve accuracy rates while reducing manual review time.",
    logoUrl: "https://pbs.twimg.com/profile_images/1659661015980863488/N9dc-MAg_400x400.jpg",
    twitter: "https://x.com/log10io",
    publicPrivate: "Private",
    ticker: "",
    valuation: "$7.2M raised"
  },
  {
    name: "Vellum",
    website: "https://vellum.ai",
    category: "Prompt Management",
    description: "AI development platform for prompt engineering, evaluation, and deployment. Helps teams build, test and iterate on LLM-powered applications.",
    logoUrl: "https://pbs.twimg.com/profile_images/2028567770422779904/DDzONgqv_400x400.jpg",
    twitter: "https://x.com/vellum_ai",
    publicPrivate: "Private",
    ticker: "",
    valuation: "$25.5M raised"
  },
  {
    name: "Gable",
    website: "https://gable.ai",
    category: "Data Pre-Processing",
    description: "Shift-left data management platform for writing and executing data contracts. Enables collaboration between software and data developers.",
    logoUrl: "",
    twitter: "",
    publicPrivate: "Private",
    ticker: "",
    valuation: "$27M raised"
  },
  {
    name: "Nomic",
    website: "https://nomic.ai",
    category: "ETL + Data Pipelines",
    description: "Open-source AI tools for embeddings and data visualization. Creators of GPT4All and Atlas for exploring and operationalizing large datasets.",
    logoUrl: "",
    twitter: "",
    publicPrivate: "Private",
    ticker: "",
    valuation: "$100M"
  },
  {
    name: "Indexify",
    website: "https://tensorlake.ai",
    category: "ETL + Data Pipelines",
    description: "Distributed data processing platform for GenAI applications. Builds continuously evolving knowledge bases and indexes for LLM applications.",
    logoUrl: "https://pbs.twimg.com/profile_images/2018028575837016064/uOSC0DDs_400x400.jpg",
    twitter: "https://x.com/tensorlake",
    publicPrivate: "Private",
    ticker: "",
    valuation: ""
  },
  {
    name: "Azure",
    website: "https://azure.microsoft.com",
    category: "GPU Cloud",
    description: "Microsoft's cloud computing platform offering GPU instances, Azure OpenAI Service, and AI infrastructure for enterprise workloads.",
    logoUrl: "https://pbs.twimg.com/profile_images/1268207800313774080/KF9pXfXU_400x400.jpg",
    twitter: "https://x.com/Azure",
    publicPrivate: "Public",
    ticker: "$MSFT",
    valuation: "$3.0T"
  },
  {
    name: "Foundry",
    website: "https://foundry.ai",
    category: "GPU Cloud",
    description: "Purpose-built public cloud for ML workloads. Offers GPU capacity via resealable reserved instances with Kubernetes orchestration.",
    logoUrl: "",
    twitter: "",
    publicPrivate: "Private",
    ticker: "",
    valuation: "$80M raised"
  },
  {
    name: "Radiant",
    website: "https://getradiant.ai",
    category: "Orchestration",
    description: "AI infrastructure company providing on-demand access to AI chips. Created by Brookfield Asset Management, merged with Ori Industries.",
    logoUrl: "",
    twitter: "",
    publicPrivate: "Private",
    ticker: "",
    valuation: "$1.3B"
  },
  {
    name: "Fixie",
    website: "https://fixie.ai",
    category: "Agent Frameworks",
    description: "Cloud-based platform for building, hosting, and scaling natural language agents. Founded by former Apple and Google engineering leads.",
    logoUrl: "",
    twitter: "",
    publicPrivate: "Private",
    ticker: "",
    valuation: "$17M raised"
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
  "Synced"
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
console.log("\n=== COMPANIES ADDED ===");
for (const c of newCompanies) {
  console.log(`• ${c.name} (${c.category}) - ${c.valuation || "N/A"}`);
}
