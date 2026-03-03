# /setup-market-map

Interactive skill to set up a Messari-style market map for any sector.

## Instructions

You are helping the user set up a market map from scratch. Follow these steps interactively, asking questions when needed.

### Phase 1: Gather Requirements

Start by asking:

1. **What sector is this market map for?** (e.g., AI, DeFi, Gaming, Fintech, Healthcare)
2. **What categories/layers does your sector need?** Ask them to list:
   - Category names (e.g., "Consumer Apps", "Infrastructure")
   - Which layer each belongs to (APPLICATION, INFRA, DATA, MODEL, SECURITY)
3. **Do you already have a Google Sheet with company data?** If yes, get the URL. If no, you'll help create one.
4. **Do you have existing Supabase and Vercel accounts?** Note which services need to be set up.

### Phase 2: Google Sheets Setup

If they don't have a sheet:
1. Tell them to create a new Google Sheet
2. Guide them to create two tabs: `companies` and `logos`
3. Provide the exact column structure for each tab
4. Help them get the Spreadsheet ID from the URL

For Google Cloud setup:
1. Walk through creating a service account step by step
2. Help them enable the Sheets API
3. Guide them to download the JSON key
4. Remind them to share the sheet with the service account email

### Phase 3: Supabase Setup

1. Guide them through creating a Supabase project
2. Help them find their API keys (URL, anon key, service role key)
3. Generate the SQL for their specific categories:
   - Use their chosen table prefix
   - Create all three tables with proper relationships
   - Insert their categories with correct labels and buckets
4. Have them run the SQL in Supabase SQL Editor

### Phase 4: Code Configuration

1. Help create the `.env.local` file with all their values
2. Update `app/map/page.tsx`:
   - Generate `CATEGORY_LAYERS` based on their categories
   - Generate `CATEGORY_ORDER` based on their preferred order
   - Update `LAYER_CONFIG` for their layers
3. If they want custom branding, update the color in `MessariStyleMap.tsx`
4. Add any new image domains to `next.config.js`

### Phase 5: Data Population

1. Help them understand the data format
2. Guide them through running the sync endpoints
3. Verify data appears correctly

### Phase 6: Deployment

1. Help set up the GitHub repository if needed
2. Walk through Vercel deployment
3. Configure environment variables in Vercel
4. Test the production deployment

### Phase 7: Verification Checklist

Before finishing, verify:
- [ ] All categories appear on the map
- [ ] Companies are sorted by market cap
- [ ] Logos display correctly
- [ ] Tooltips work on hover
- [ ] Responsive layout works
- [ ] Production URL is accessible

## Key Files to Modify

When helping with configuration, these are the main files:

1. **`.env.local`** - All credentials and config
2. **`app/map/page.tsx`** - Category mapping and ordering
3. **`components/MessariStyleMap.tsx`** - Branding colors
4. **`lib/supabase.ts`** - Table prefix
5. **`next.config.js`** - Image domains

## Common Issues to Watch For

1. **Category name mismatches** - Labels must match exactly between Sheet, Supabase, and code
2. **Private key formatting** - Must preserve `\n` characters in env vars
3. **Sheet permissions** - Service account needs Editor access
4. **Image domains** - Must be whitelisted in Next.js config

## Example Interaction Flow

```
User: I want to set up a market map for the DeFi sector

Claude: Great! Let's set up a DeFi market map. First, let me understand your categories.

What categories do you want to include? For example, DeFi maps often have:
- DEXs (Decentralized Exchanges)
- Lending/Borrowing
- Derivatives
- Yield Aggregators
- Bridges
- Oracles
- Infrastructure

Which categories make sense for your map, and how would you group them into layers?

User: I want DEXs, Lending, Bridges, and Oracles. DEXs and Lending are "Applications", Bridges and Oracles are "Infrastructure"

Claude: Perfect! Here's your category structure:

**APPLICATION Layer:**
- DEXs
- Lending

**INFRA Layer:**
- Bridges
- Oracles

Now, do you already have a Google Sheet with DeFi protocol data, or should I help you create one from scratch?
```

## SQL Template Generator

When the user provides their categories, generate SQL like this:

```sql
-- Replace {prefix} with their chosen prefix (e.g., "defi_")

CREATE TABLE {prefix}_categories (
  id SERIAL PRIMARY KEY,
  category TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  bucket TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generate INSERT based on their categories
INSERT INTO {prefix}_categories (category, label, bucket) VALUES
  ('dexs', 'DEXs', 'APPLICATION'),
  ('lending', 'Lending', 'APPLICATION'),
  ('bridges', 'Bridges', 'INFRA'),
  ('oracles', 'Oracles', 'INFRA');
```

## Code Template Generator

Generate the TypeScript config based on their categories:

```typescript
// CATEGORY_LAYERS - map labels to layer names
const CATEGORY_LAYERS: Record<string, string> = {
  'DEXs': 'APPLICATION',
  'Lending': 'APPLICATION',
  'Bridges': 'INFRA',
  'Oracles': 'INFRA',
}

// CATEGORY_ORDER - display order (ask user for preference)
const CATEGORY_ORDER: Record<string, number> = {
  'DEXs': 1,
  'Lending': 2,
  'Bridges': 3,
  'Oracles': 4,
}

// LAYER_CONFIG - layer display settings
const LAYER_CONFIG: Record<string, { displayName: string; order: number }> = {
  'APPLICATION': { displayName: 'Applications', order: 1 },
  'INFRA': { displayName: 'Infrastructure', order: 2 },
}
```

Always confirm each step with the user before proceeding to the next.
