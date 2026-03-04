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

// Get all categories
const { data: categories, error: catError } = await supabase
  .from("ai_categories")
  .select("*")
  .order("id");

if (catError) {
  console.error("Error fetching categories:", catError.message);
  process.exit(1);
}

console.log("=== CATEGORIES IN SUPABASE ===");
for (const cat of categories) {
  console.log(`• ${cat.category} (${cat.label}) - ${cat.bucket}`);
}

// Get all protocols with their categories
const { data: protocolCategories, error: pcError } = await supabase
  .from("ai_protocols_categories")
  .select("*");

if (pcError) {
  console.error("Error fetching protocol categories:", pcError.message);
  process.exit(1);
}

// Get all protocol metadata
const { data: protocols, error: protError } = await supabase
  .from("ai_protocols_metadata")
  .select("*");

if (protError) {
  console.error("Error fetching protocols:", protError.message);
  process.exit(1);
}

// Create a map of protocol metadata
const protocolMap = new Map();
for (const p of protocols) {
  protocolMap.set(p.protocol, p);
}

// Group by category
const byCategory = {};
for (const pc of protocolCategories) {
  if (!byCategory[pc.category]) {
    byCategory[pc.category] = [];
  }
  const meta = protocolMap.get(pc.protocol);
  byCategory[pc.category].push({
    protocol: pc.protocol,
    name: meta?.name || pc.protocol,
    logo: meta?.logo ? "✓" : "✗",
    ticker: meta?.ticker || "",
  });
}

console.log("\n=== PROTOCOLS BY CATEGORY ===");
const categoryOrder = categories.map(c => c.category);

for (const catSlug of categoryOrder) {
  const cat = categories.find(c => c.category === catSlug);
  const prots = byCategory[catSlug] || [];
  console.log(`\n${cat?.label || catSlug} (${prots.length}):`);
  for (const p of prots.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  ${p.logo} ${p.name} ${p.ticker}`);
  }
}

// Check for orphan protocols (in metadata but not in any category)
const assignedProtocols = new Set(protocolCategories.map(pc => pc.protocol));
const orphans = protocols.filter(p => !assignedProtocols.has(p.protocol));

if (orphans.length > 0) {
  console.log("\n=== ORPHAN PROTOCOLS (no category assigned) ===");
  for (const p of orphans) {
    console.log(`  ⚠ ${p.name} (${p.protocol})`);
  }
}

// Summary
console.log("\n=== SUMMARY ===");
console.log(`Categories: ${categories.length}`);
console.log(`Total protocols in metadata: ${protocols.length}`);
console.log(`Total protocol-category assignments: ${protocolCategories.length}`);
console.log(`Orphan protocols: ${orphans.length}`);
