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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Parse market cap from string like "$43B" to number in billions
function parseMarketCap(str) {
  if (!str) return null;
  const match = str.match(/\$?([\d.]+)(T|B|M)?/i);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const unit = match[2]?.toUpperCase();
  if (unit === 'T') return num * 1000; // Convert to billions
  if (unit === 'M') return num / 1000; // Convert to billions
  return num; // Already in billions
}

// Generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Energy & Datacenters companies to sync
const companies = [
  {
    name: "Bloom Energy",
    website: "https://bloomenergy.com",
    description: "Solid oxide fuel cell manufacturer for on-site power generation. Partnered with Brookfield for $5B AI infrastructure deployment. Products convert natural gas, biogas, or hydrogen to electricity.",
    logo: "https://pbs.twimg.com/profile_images/1736633420699677952/9Z0mO9cD_400x400.jpg",
    twitter: "https://x.com/BloomEnergy",
    is_public: true,
    ticker: "$BE",
    market_cap: "$43B"
  },
  {
    name: "Liberty Energy",
    website: "https://libertyenergy.com",
    description: "Oilfield services provider expanding into distributed power and energy storage for data centers. Liberty Power Innovations delivers solutions for commercial, industrial, and mining industries.",
    logo: "https://pbs.twimg.com/profile_images/1702670289446081792/9dX8lYhW_400x400.jpg",
    twitter: "https://x.com/LibertyEnergy",
    is_public: true,
    ticker: "$LBRT",
    market_cap: "$4.6B"
  },
  {
    name: "Solaris Energy Infrastructure",
    website: "https://solaris-energy.com",
    description: "Mobile and scalable equipment solutions for distributed power generation. Operates Solaris Power Solutions and Solaris Logistics Solutions segments for energy infrastructure.",
    logo: "https://pbs.twimg.com/profile_images/1785623834369702401/1z6E1n4C_400x400.jpg",
    twitter: "https://x.com/SolarisSEI",
    is_public: true,
    ticker: "$SEI",
    market_cap: "$3.1B"
  },
  {
    name: "Power Solutions International",
    website: "https://psiengines.com",
    description: "Designs and manufactures engines and power systems for industrial applications. Provides distributed power generation solutions for data centers and critical infrastructure.",
    logo: "https://pbs.twimg.com/profile_images/1722756087/PSIX_logo_400x400.jpg",
    twitter: "https://x.com/PSIXInc",
    is_public: true,
    ticker: "$PSIX",
    market_cap: "$2B"
  },
  {
    name: "IREN",
    website: "https://iren.com",
    description: "Bitcoin mining and AI cloud infrastructure company. Secured $9.7B Microsoft contract for 200MW AI datacenter. Scaling to 140,000 GPUs targeting $3.4B AI cloud ARR by end of 2026.",
    logo: "https://pbs.twimg.com/profile_images/1857847399352209408/abc_400x400.jpg",
    twitter: "https://x.com/IREN_Ltd",
    is_public: true,
    ticker: "$IREN",
    market_cap: "$13B"
  },
  {
    name: "Cipher Mining",
    website: "https://ciphermining.com",
    description: "Bitcoin mining company powered by renewable energy. Rebranded to Cipher Digital in 2026. Operates large-scale mining facilities with focus on sustainable energy sources.",
    logo: "https://pbs.twimg.com/profile_images/1840998452453246976/0sF2D3gD_400x400.jpg",
    twitter: "https://x.com/CipherMining",
    is_public: true,
    ticker: "$CIFR",
    market_cap: "$6B"
  },
  {
    name: "Riot Platforms",
    website: "https://riotplatforms.com",
    description: "Vertically integrated Bitcoin mining company with 1.7GW power capacity in Texas. Pivoting to AI/HPC hosting with AMD datacenter lease. Starboard Value urging faster AI expansion.",
    logo: "https://pbs.twimg.com/profile_images/1779376681986639360/9qX3rH3m_400x400.jpg",
    twitter: "https://x.com/riotplatforms",
    is_public: true,
    ticker: "$RIOT",
    market_cap: "$6.1B"
  },
  {
    name: "BitDeer",
    website: "https://bitdeer.com",
    description: "Bitcoin mining and AI cloud infrastructure company based in Singapore. Develops SEALMINER mining hardware. Operating datacenters in US, Norway, and Bhutan with AI cloud capabilities.",
    logo: "https://pbs.twimg.com/profile_images/1800268752231954432/9p2fY0aA_400x400.jpg",
    twitter: "https://x.com/BitdeerGroup",
    is_public: true,
    ticker: "$BTDR",
    market_cap: "$1.9B"
  },
  {
    name: "Hut 8",
    website: "https://hut8.com",
    description: "Energy infrastructure platform integrating power, digital infrastructure, and compute. Signed $7B 15-year lease with Fluidstack for 245MW AI/HPC datacenter. Holds $1.6B in Bitcoin reserves.",
    logo: "https://pbs.twimg.com/profile_images/1822411559364742401/8fK2qU8b_400x400.jpg",
    twitter: "https://x.com/Hut8Corp",
    is_public: true,
    ticker: "$HUT",
    market_cap: "$5.3B"
  },
  {
    name: "CleanSpark",
    website: "https://cleanspark.com",
    description: "America's Bitcoin Miner® with 1.8GW power under contract. Data center developer expanding into AI/HPC workloads. Acquired 447 acres in Texas for 600MW datacenter campus.",
    logo: "https://pbs.twimg.com/profile_images/2016261514932486144/RHPCar0n_400x400.jpg",
    twitter: "https://x.com/CleanSpark_Inc",
    is_public: true,
    ticker: "$CLSK",
    market_cap: "$2.7B"
  },
  {
    name: "Bitfarms",
    website: "https://bitfarms.com",
    description: "Bitcoin miner rebranding to Keel Infrastructure in April 2026. Pivoting to AI/HPC datacenters with 2.1GW North American power portfolio. Converting Washington site to HPC/AI by Dec 2026.",
    logo: "https://pbs.twimg.com/profile_images/1728599829962187264/9u4L3w4G_400x400.jpg",
    twitter: "https://x.com/Bitfarms_io",
    is_public: true,
    ticker: "$BITF",
    market_cap: "$1.1B"
  },
  {
    name: "WhiteFiber",
    website: "https://whitefiber.com",
    description: "GPU cloud and AI datacenter subsidiary of Bit Digital. Operating NC-1 campus with 200MW capacity. Secured $865M 10-year colocation deal with Nscale. Offers H200, B200, GB200 GPU clusters.",
    logo: "https://pbs.twimg.com/profile_images/1848280451216174080/1qV6y3aC_400x400.jpg",
    twitter: "https://x.com/WhiteFiber_",
    is_public: true,
    ticker: "$BTBT",
    market_cap: "$400M"
  }
];

const categorySlug = "energy-datacenters";

console.log("Syncing 12 Energy & Datacenters companies to Supabase...\n");

for (const company of companies) {
  const slug = generateSlug(company.name);
  const marketCap = parseMarketCap(company.market_cap);

  // Insert into protocols_metadata
  const { data: protocol, error: protocolError } = await supabase
    .from("ai_protocols_metadata")
    .upsert({
      protocol: slug,
      name: company.name,
      website: company.website,
      description: company.description,
      logo: company.logo,
      twitter: company.twitter,
      artemisProjectPage: null,
      is_public: company.is_public,
      market_cap: marketCap,
      ticker: company.ticker,
    }, { onConflict: 'protocol' })
    .select()
    .single();

  if (protocolError) {
    console.error(`✗ Error inserting ${company.name}:`, protocolError.message);
    continue;
  }

  // Insert into protocols_categories
  const { error: categoryError } = await supabase
    .from("ai_protocols_categories")
    .upsert({
      protocol: slug,
      category: categorySlug,
      description: company.description,
      website: company.website,
      twitter: company.twitter,
    }, { onConflict: 'protocol,category' });

  if (categoryError) {
    console.error(`✗ Error assigning category for ${company.name}:`, categoryError.message);
    continue;
  }

  console.log(`✓ ${company.name} → ${categorySlug} (${company.ticker}, $${marketCap}B)`);
}

console.log("\n=== SYNC COMPLETE ===");
