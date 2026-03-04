# Market Map Skill

Create a Messari-style market map for any sector. This skill will walk you through the entire process step-by-step.

---

## Quick Start

Just tell Claude Code:
> "Use the `/marketmap` skill to help me create a market map"

Claude will handle everything - cloning, setup, and guiding you through each step.

---

## Step 1: Get Started

**CLAUDE SHOULD DO THIS AUTOMATICALLY:**

First, ask the user what sector they're building a map for:

**ASK USER:** What sector is this market map for? (e.g., "DeFi", "Gaming", "Fintech", "Climate Tech")

Then clone the template and set up the project:

```bash
# Clone the template
git clone https://github.com/anthropics/ai-landscape-map.git <sector>-landscape-map

# Navigate into the project
cd <sector>-landscape-map

# Install dependencies
npm install
```

**ASK USER:** Where would you like me to create the project folder? (Default: current directory)

---

## What You'll Need (Claude Will Help You Set These Up)

Don't worry if you don't have these yet - we'll set them up together:

1. **Google Account** - for the spreadsheet that stores your company data
2. **Vercel Account** - free hosting for your map (takes 2 minutes to create)

That's it! The database (Supabase) credentials are already included, and the Artemis logo is in the repo.

**Optional:** x402 tools for automatic logo lookups. If you don't have this, no problem - we'll find logos manually.

---

## Step 2: Set Up Google Sheets

**CLAUDE WALKS THE USER THROUGH THIS:**

### 2.1 Create the Spreadsheet

Tell the user:
> "Let's create your data spreadsheet. I'll guide you through it."

1. Open [Google Sheets](https://sheets.google.com) in your browser
2. Click the **+** to create a new blank spreadsheet
3. Name it by clicking "Untitled spreadsheet" at the top and typing: `{SECTOR_NAME} Landscape Map`
4. At the bottom, you'll see a tab called "Sheet1" - right-click it and rename to `companies`
5. Click the **+** next to the tab to add another tab, name it `logos`

### 2.2 Set Up the `companies` Tab

Create these columns (Row 1 = headers):

| Column | Header | Description |
|--------|--------|-------------|
| A | Timestamp | Auto-filled when submitted |
| B | Company Name | Company/protocol name |
| C | Website | Company website URL |
| D | Category | Category name (must match categories in Supabase) |
| E | Description | Brief company description |
| F | Logo URL | Direct URL to logo image |
| G | Twitter | Twitter handle or URL |
| H | Public/Private | "Public" or "Private" |
| I | Ticker | Stock ticker (e.g., "NVDA") or token symbol |
| J | MC or Valuation | Market cap or valuation (e.g., "$500B", "$2.5B") |
| K | Project Page | Link to Artemis project page (optional) |
| L | Status | Sync status (auto-filled) |

### 2.3 Set Up the `logos` Tab

Create these columns:

| Column | Header | Description |
|--------|--------|-------------|
| A | Company Name | Must match exactly with companies tab |
| B | Twitter URL | Twitter/X profile URL (e.g., https://x.com/openai) |
| C | Logo URL | Direct image URL (square images work best) |

**IMPORTANT: Square Images Work Best**

The map displays logos as circles (cropped from squares). For best results:
- **Square aspect ratio** (1:1) - 400x400px ideal
- **Direct image URL** - must end in .jpg, .png, or similar
- **HTTPS only** - HTTP links won't work

**Best Logo Sources (in order of preference):**

1. **X/Twitter Profile Pictures** (Recommended)
   - Consistently sized (400x400)
   - Don't require authentication
   - Rarely break or change domains

   **How to get manually:**
   1. Go to the company's X/Twitter profile
   2. Click on their profile picture to expand it
   3. Right-click the expanded image → **"Copy image address"**
   4. The URL should look like: `https://pbs.twimg.com/profile_images/1234567890/image_400x400.jpg`

   **DO NOT** copy the profile page URL (https://x.com/company) - you need the direct image URL from `pbs.twimg.com`.

2. **Company Website** - Look for favicon or logo in header
3. **Clearbit Logo API** - `https://logo.clearbit.com/{domain}`
4. **GitHub Avatar** - For open source projects

**Automated Lookup (Optional):**
If you have x402 MCP tools set up, Claude can automatically look up X profile pictures. Otherwise, find logos manually using the steps above.

### 2.4 Get the Spreadsheet ID

The spreadsheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

Save this ID for later: `GOOGLE_SHEETS_ID`

---

## Step 3: Set Up Google Cloud (So the App Can Read Your Spreadsheet)

**CLAUDE WALKS THE USER THROUGH THIS:**

This lets the app automatically read data from your Google Sheet. It sounds technical but just follow along - it takes about 5 minutes.

### 3.1 Create a Google Cloud Project

Tell the user:
> "We need to set up Google Cloud so your app can read the spreadsheet. Don't worry, it's free and I'll guide you through each click."

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. If prompted, sign in with your Google account
3. You might see a "Select a project" dropdown at the top - click it
4. Click **New Project** (top right of the popup)
5. Name it: `{sector}-landscape-map`
6. Click **Create**
7. Wait a few seconds, then select your new project from the dropdown

### 3.2 Enable the Google Sheets API

1. In the search bar at the top, type "Google Sheets API" and press Enter
2. Click on **Google Sheets API** in the results
3. Click the blue **Enable** button
4. Wait for it to enable (takes a few seconds)

### 3.3 Create a Service Account

1. In the left sidebar, click **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** at the top → **Service Account**
3. Name it: `sheets-reader`
4. Click **Create and Continue**
5. Click **Continue** (skip the optional permissions)
6. Click **Done**

### 3.4 Generate a Key File

1. You should see your new service account in the list - click on it
2. Click the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** and click **Create**
5. A file will download - keep this safe! We'll need it in a minute.

**ASK USER:** Did the JSON file download? Can you open it and share the `client_email` value? (It looks like `sheets-reader@your-project.iam.gserviceaccount.com`)

### 3.5 Share the Spreadsheet with Your Service Account

1. Go back to your Google Spreadsheet
2. Click the green **Share** button (top right)
3. Paste the `client_email` from the JSON file
4. Make sure it says **Editor**
5. Uncheck "Notify people"
6. Click **Share**

---

## Step 4: Supabase Database (Already Set Up!)

**CLAUDE EXPLAINS:**

> "Good news - the database is already set up! We're using a shared Supabase project, so you just need to use these credentials."

### 4.1 Shared Supabase Credentials

Use these values in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://mzukbrgwxstbxzfpzmdd.supabase.co
NEXT_PUBLIC_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dWticmd3eHN0Ynh6ZnB6bWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjIzMjQsImV4cCI6MjA4Nzc5ODMyNH0.Zr_dBZ9OSJoCWxcKZJ9GWJicKx_aKs_EoIsLl2xpUJ4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dWticmd3eHN0Ynh6ZnB6bWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMjMyNCwiZXhwIjoyMDg3Nzk4MzI0fQ.-AR3ovfRr4MVsr7KOrE0vlmn4bqso0v93ls6hq9HwlI
```

### 4.2 Choose Your Table Prefix

**ASK USER:** What prefix do you want for your tables? (e.g., `defi_`, `gaming_`, `fintech_`)

This keeps your data separate from other maps in the shared database.

### 4.3 Create Your Tables

**CLAUDE RUNS THIS** with the user's chosen prefix:

Connect to Supabase and run this SQL (replace `{prefix}` with the chosen prefix):

```sql
-- Categories table
CREATE TABLE {prefix}_categories (
  id SERIAL PRIMARY KEY,
  category TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  bucket TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protocols metadata table
CREATE TABLE {prefix}_protocols_metadata (
  id SERIAL PRIMARY KEY,
  protocol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  website TEXT,
  twitter TEXT,
  artemisProjectPage TEXT,
  is_public BOOLEAN DEFAULT false,
  market_cap NUMERIC,
  ticker TEXT,
  company_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protocols to categories mapping
CREATE TABLE {prefix}_protocols_categories (
  id SERIAL PRIMARY KEY,
  protocol TEXT NOT NULL REFERENCES {prefix}_protocols_metadata(protocol),
  category TEXT NOT NULL REFERENCES {prefix}_categories(category),
  description TEXT,
  website TEXT,
  twitter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(protocol, category)
);

-- Create indexes for performance
CREATE INDEX idx_{prefix}_protocols_categories_protocol ON {prefix}_protocols_categories(protocol);
CREATE INDEX idx_{prefix}_protocols_categories_category ON {prefix}_protocols_categories(category);
CREATE INDEX idx_{prefix}_protocols_metadata_name ON {prefix}_protocols_metadata(name);
```

### 4.3 Insert Categories

Define your sector's categories and layers. Example structure:

```sql
INSERT INTO {prefix}_categories (category, label, bucket) VALUES
  -- Application Layer
  ('consumer', 'Consumer', 'APPLICATION'),
  ('enterprise', 'Enterprise', 'APPLICATION'),

  -- Infrastructure Layer
  ('cloud-hosting', 'Cloud & Hosting', 'INFRA'),
  ('compute', 'Compute', 'INFRA'),

  -- Add more categories as needed...
;
```

**ASK USER:** What categories and layers does your sector need? Provide:
1. Category slug (lowercase, hyphenated)
2. Display label
3. Layer bucket (APPLICATION, MODEL, DATA, INFRA, SECURITY, or custom)

---

## Step 5: Configure the App

**CLAUDE DOES THIS FOR THE USER:**

Now we'll set up the app with your credentials. Claude will create the config file for you.

### 5.1 Create Your Environment File

Claude creates `.env.local` in the project folder:

```env
# Google Sheets
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_API_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Table prefix (must match what you used in SQL)
TABLE_PREFIX=ai_
```

### 5.2 Update Category Configuration

Edit `app/map/page.tsx` and update:

1. **CATEGORY_LAYERS** - Map category labels to layer names:
```typescript
const CATEGORY_LAYERS: Record<string, string> = {
  'Consumer': 'APPLICATION',
  'Enterprise': 'APPLICATION',
  // Add your categories...
}
```

2. **CATEGORY_ORDER** - Set the display order:
```typescript
const CATEGORY_ORDER: Record<string, number> = {
  'Consumer': 1,
  'Enterprise': 2,
  // Add your categories in order...
}
```

3. **LAYER_CONFIG** - Configure layer display:
```typescript
const LAYER_CONFIG: Record<string, { displayName: string; order: number }> = {
  'APPLICATION': { displayName: 'Application', order: 1 },
  'INFRA': { displayName: 'Infrastructure', order: 2 },
  // Add your layers...
}
```

### 5.3 Update Branding (Optional)

Edit `components/MessariStyleMap.tsx`:

1. Change `ARTEMIS_PURPLE` to your brand color:
```typescript
const BRAND_COLOR = '#7C3AED' // Your hex color
```

2. Update the header logo and footer branding

### 5.4 Configure Next.js Image Domains

Edit `next.config.mjs` to allow all image domains (recommended for flexibility):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',  // Allow all HTTPS domains
      },
    ],
  },
}

export default nextConfig
```

This wildcard pattern allows logos from any HTTPS domain, avoiding the need to whitelist each domain individually.

---

## Step 6: Populate Data

### 6.1 Add Companies to Google Sheet

Fill in the `companies` tab with your sector's companies. Each row should have:
- Company name
- Website
- Category (must match a category label in Supabase)
- Description
- Public/Private status
- Market cap or valuation

### 6.2 Sync Data to Supabase

```bash
# Start the dev server
npm run dev

# In another terminal, trigger the sync
curl -X POST http://localhost:3000/api/sync
```

### 6.3 Sync Logos

1. Fill in the `logos` tab with company names and logo URLs
2. Run the logo sync:
```bash
curl -X POST http://localhost:3000/api/sync-logos
```

---

## Step 7: Test Locally

```bash
npm run dev
```

Visit:
- http://localhost:3000/map - The market map
- http://localhost:3000/treemap - The treemap view (if enabled)

Verify:
- [ ] All categories appear
- [ ] Companies are sorted by market cap
- [ ] Logos display correctly
- [ ] Tooltips show on hover
- [ ] Layout is responsive

---

## Step 8: Deploy to Vercel (Make It Live!)

**CLAUDE GUIDES THE USER:**

> "Now let's put your map on the internet so anyone can see it!"

We deploy to the **artemis-xyz** Vercel team. Claude handles this automatically.

### 8.1 Deploy with Vercel CLI

**CLAUDE RUNS THESE COMMANDS:**

```bash
# Link to the artemis-xyz Vercel team
vercel link --yes --scope artemis-xyz

# Add environment variables (Claude does this automatically)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_API_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add GOOGLE_SHEETS_ID production
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
vercel env add GOOGLE_PRIVATE_KEY production
vercel env add TABLE_PREFIX production

# Deploy to production
vercel --prod --yes
```

### 8.2 Environment Variables

Claude will add these automatically using the values from your `.env.local`:

| Name | Where to find it |
|------|------------------|
| `GOOGLE_SHEETS_ID` | The long string in your Google Sheet URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | From the JSON key file |
| `GOOGLE_PRIVATE_KEY` | From the JSON key file (include the whole thing with `-----BEGIN` and `-----END`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Already in skill (shared) |
| `NEXT_PUBLIC_SUPABASE_API_KEY` | Already in skill (shared) |
| `SUPABASE_SERVICE_ROLE_KEY` | Already in skill (shared) |
| `TABLE_PREFIX` | Your sector prefix (e.g., `defi_`) |

### 8.3 Deployment Complete

After deployment, you'll get a URL like:
- `https://<project-name>-artemis-xyz.vercel.app`

The base URL automatically redirects to `/map`.

🎉 Your map is live!

### 8.3 Set Up Auto-Revalidation (Optional)

The map revalidates every hour by default. To trigger manual revalidation:

```bash
curl https://your-domain.vercel.app/api/revalidate?secret=YOUR_SECRET
```

---

## Step 9: Ongoing Maintenance

### Adding New Companies

1. Add row to Google Sheet `companies` tab
2. Run sync: `curl -X POST https://your-domain.vercel.app/api/sync`

### Adding New Logos

1. Add row to Google Sheet `logos` tab (use X profile picture URLs - see section 2.3)
2. Run sync: `curl -X POST https://your-domain.vercel.app/api/sync-logos`

### Adding New Categories

1. Insert into Supabase:
```sql
INSERT INTO {prefix}_categories (category, label, bucket)
VALUES ('new-category', 'New Category', 'LAYER_NAME');
```

2. Update `CATEGORY_LAYERS` and `CATEGORY_ORDER` in code
3. Redeploy

### Renaming a Company

Use the rename API:
```bash
curl -X POST http://localhost:3000/api/rename-company \
  -H "Content-Type: application/json" \
  -d '{"oldName": "Old Name", "newName": "New Name", "newWebsite": "https://newsite.com"}'
```

This updates both the metadata and category entries in Supabase.

### Removing Companies

1. Use the cleanup API to remove from Supabase
2. Use delete-from-sheet API to remove from all Sheet tabs:
```bash
curl -X POST http://localhost:3000/api/delete-from-sheet
```

### Marking Companies as Acquired/Merged

Update the `company_status` field in Supabase:
- `'acquired'` - Shows orange "Acquired" badge in tooltip
- `'merged'` - Shows purple "Merged" badge in tooltip

### Updating Market Caps

Market caps can be updated in the Google Sheet. Run sync to push changes.

---

## Troubleshooting

### Logos Not Showing
1. Check if domain is in `next.config.js` remotePatterns (use `hostname: '**'` for all)
2. Verify logo URLs are direct image links (not webpage URLs)
3. Check browser console for image errors
4. Some X/Twitter profile URLs return 404 - verify the URL works in a browser

### Categories Missing
1. Verify category labels match exactly between Sheet and Supabase
2. Check `CATEGORY_LAYERS` includes the category
3. Run sync again

### Companies Missing from Map
1. Check company count: Sheet vs Supabase vs Map
   ```bash
   curl http://localhost:3000/api/map-data
   ```
2. Run force sync to re-sync all companies:
   ```bash
   curl -X POST "http://localhost:3000/api/sync?force=true"
   ```
3. Verify company row in Sheet has status "Done" or "Synced"

### Sync Failing
1. Check Google service account has Editor access to sheet
2. Verify Supabase service role key is correct
3. Check server logs for detailed errors

### company_status Column Error
If sync fails with "column company_status does not exist":

1. The column may be optional in your Supabase schema
2. Update `ProtocolMetadata` interface to make it optional:
   ```typescript
   company_status?: string | null  // Optional - column may not exist
   ```
3. Remove `company_status` from sync payload if column doesn't exist:
   ```typescript
   const metadataPayload = {
     protocol: slug,
     name: row.companyName,
     // ... other fields
     // company_status: 'active',  // Remove if column doesn't exist
   }
   ```

### Deleted Companies Reappearing
If companies you deleted keep coming back:
1. They're still in Google Sheet with "Synced" status
2. Force sync re-adds all "Synced" rows
3. Either delete the Sheet row OR change status to "Removed"

### Layout Issues
1. Clear browser cache
2. Check for console errors
3. Verify responsive breakpoints

### Production Build Errors (Lint)
Common lint errors that block Vercel deployment:
- Unused imports: Remove with `import { Used } from '...'`
- Unused variables: Prefix with `_` or remove: `[, used] = array`
- Type errors: Make optional fields use `?` in interface definitions

---

## File Structure Reference

```
├── app/
│   ├── api/
│   │   ├── sync/route.ts              # Sync Sheet→Supabase (?force=true for full resync)
│   │   ├── sync-logos/route.ts        # Sync logos from Sheet
│   │   ├── rename-company/route.ts    # Rename a company in Supabase
│   │   ├── delete-from-sheet/route.ts # Delete rows from all Sheet tabs
│   │   ├── delete-company/route.ts    # Delete companies from Supabase
│   │   ├── add-category/route.ts      # Add company to additional category
│   │   ├── add-to-sheet/route.ts      # Add new row to Google Sheet
│   │   ├── cleanup/route.ts           # Bulk remove companies + M&A status updates
│   │   ├── check-company/route.ts     # Debug: check company in Supabase
│   │   ├── check-logos/route.ts       # Debug: check logo sync status
│   │   └── map-data/route.ts          # Get map statistics
│   ├── map/
│   │   ├── page.tsx                   # Main map (32px logos, 52px cells, 2 rows/category)
│   │   └── [layer]/page.tsx           # Layer detail (52px logos, 76px cells, all companies)
│   └── treemap/page.tsx               # Treemap page (if enabled)
├── components/
│   ├── MessariStyleMap.tsx            # Main map component (px-6 padding)
│   ├── LayerDetailView.tsx            # Layer drill-down (px-12 padding)
│   └── ArtemisLogo.tsx                # Reusable logo component (optional)
├── database/
│   └── api.ts                         # Supabase data (includes upsert functions)
├── lib/
│   ├── google-sheets.ts               # Google Sheets (includes appendCompanyRow)
│   └── supabase.ts                    # Supabase client
├── public/
│   ├── artemis-logo.svg               # Brand logo (40px header, 24px footer)
│   └── artemis-logo.png               # Logo PNG fallback
├── .env.local                         # Environment variables (git-ignored)
└── next.config.mjs                    # Next.js configuration
```

---

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# Sync companies from Sheet to Supabase
curl -X POST http://localhost:3000/api/sync

# Force sync ALL companies (re-syncs even "Synced" status rows)
curl -X POST "http://localhost:3000/api/sync?force=true"

# Sync logos (run after adding logos to Sheet)
curl -X POST http://localhost:3000/api/sync-logos

# Rename a company
curl -X POST http://localhost:3000/api/rename-company \
  -H "Content-Type: application/json" \
  -d '{"oldName": "Old Name", "newName": "New Name"}'

# Delete companies from Supabase
curl -X POST http://localhost:3000/api/delete-company \
  -H "Content-Type: application/json" \
  -d '{"companies": ["Company Name 1", "Company Name 2"]}'

# Add company to additional category (multi-category support)
curl -X POST http://localhost:3000/api/add-category \
  -H "Content-Type: application/json" \
  -d '{"company": "OpenAI", "category": "Enterprise"}'

# Add new company directly to Google Sheet
curl -X POST http://localhost:3000/api/add-to-sheet \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Company Name",
    "website": "https://company.com",
    "category": "Category Name",
    "description": "Brief description",
    "logoUrl": "https://pbs.twimg.com/...",
    "twitter": "https://x.com/handle",
    "isPublic": true,
    "ticker": "TICK",
    "marketCap": "$50B"
  }'

# Check a company's data in Supabase
curl http://localhost:3000/api/check-company?name=companyname

# Check logo sync status
curl http://localhost:3000/api/check-logos

# Get map statistics (company counts per category)
curl http://localhost:3000/api/map-data

# Delete companies from Sheet (preview first with GET)
curl http://localhost:3000/api/delete-from-sheet      # Preview
curl -X POST http://localhost:3000/api/delete-from-sheet  # Execute

# Build for production
npm run build

# Check for TypeScript errors
npm run lint
```

## Tooltip Features

The map tooltip displays:
- Company name with status badge (Public/Private/Acquired/Merged)
- Stock ticker (if public)
- Market cap or valuation
- Full description (expands to fit)
- Website URL
- Twitter/X handle
- Company logo (48px, top-right corner)

---

## Visual Design Specifications

### Brand Colors

```typescript
const ARTEMIS_PURPLE = '#7C3AED'  // Primary brand color for borders, accents
```

### Main Map View (MessariStyleMap.tsx)

**Company Cell Dimensions:**
```typescript
const LOGO_SIZE = 32           // Company logo size in pixels
const CELL_WIDTH = 52          // Fixed width per company cell
const CELL_HEIGHT = 54         // Fixed height: logo (32) + gap (2) + 2-line text (~20)
const CELL_GAP = 4             // gap-1 = 4px horizontal between cells
const ROW_GAP = 4              // gap-1 between rows
```

**Category & Section Spacing:**
```typescript
const CATEGORY_PADDING = 16    // px-2 = 8px * 2 sides
const DIVIDER_MARGIN = 4       // Equal margin from top/bottom for category dividers
const SECTION_SPACING = 4      // Space between header/layers/footer
```

**Typography:**
- **Title**: `text-4xl font-bold` (36px) - large and prominent, no subtitle
- Company name font size: `7px` (very compact for dense display)
- Company name height: `18px` (2 lines with `line-clamp-2`)
- Company name leading: `leading-tight`
- Category header: `text-xs font-semibold` (12px)
- Layer title: `text-base font-bold` (16px) with vertical orientation

**Borders & Dividers:**
- Layer border: `2px solid` with `ARTEMIS_PURPLE` color
- Category dividers: `2px solid` with `ARTEMIS_PURPLE` at 90% opacity (`#7C3AED90`)

**Logo Sizes by Location:**
| Location | Size | Tailwind Class |
|----------|------|----------------|
| Company cell | 32px | Custom style |
| Tooltip | 48px | Custom style |
| Header | 48px | `h-12 w-12` |
| Footer | 24px | `h-6 w-6` |

**Page Padding:**
- Main map: `px-6` (24px each side)

### Layer Detail View (LayerDetailView.tsx)

The detail view uses **larger dimensions** for better readability when showing all companies.

**Company Cell Dimensions:**
```typescript
const LOGO_SIZE = 52           // Larger logos than main map
const CELL_WIDTH = 76          // Wider cells for more name space
const CELL_GAP = 8             // More horizontal breathing room
const ROW_GAP = 8              // More vertical breathing room
```

**Typography:**
```typescript
const FONT_SIZE = 10           // Larger than main map's 7px
const LINE_HEIGHT = 1.3        // Comfortable line height
const TEXT_LINES = 2           // Max lines for company name
const TEXT_HEIGHT = Math.ceil(FONT_SIZE * LINE_HEIGHT * TEXT_LINES) + 4  // Extra buffer for descenders
const LOGO_TEXT_GAP = 4        // Gap between logo and text
```

**Cell Height Calculation:**
```typescript
const CELL_HEIGHT = LOGO_SIZE + LOGO_TEXT_GAP + TEXT_HEIGHT
// = 52 + 4 + 30 = 86px
```

**Page Padding:**
- Detail view: `px-12` (48px each side = 96px total)
- Container width calculation must account for padding:
  ```typescript
  containerWidth={containerWidth - 96}  // Account for px-12 padding
  ```

### Responsive Row Distribution

The detail view calculates **optimal row distribution** to avoid orphan single items:

```typescript
function calculateRowDistribution(totalItems: number, maxPerRow: number): number[] {
  if (totalItems <= maxPerRow) {
    return [totalItems]
  }

  const numRows = Math.ceil(totalItems / maxPerRow)
  const basePerRow = Math.floor(totalItems / numRows)
  const remainder = totalItems % numRows

  // Distribute items as evenly as possible across rows
  const rows: number[] = []
  for (let i = 0; i < numRows; i++) {
    // Put extra items in earlier rows
    rows.push(basePerRow + (i < remainder ? 1 : 0))
  }

  return rows
}
```

### Gap Calculation for Full-Width Rows

Both views calculate dynamic gaps to make rows span the full width:

```typescript
function calculateGapForRow(itemCount: number, targetWidth: number): number {
  if (itemCount <= 1) return CELL_GAP
  const totalCellWidth = itemCount * CELL_WIDTH
  const availableGapSpace = targetWidth - totalCellWidth
  const gap = availableGapSpace / (itemCount - 1)
  return Math.max(CELL_GAP, gap)  // Never less than minimum gap
}
```

### Status Badges

```typescript
const getStatusBadge = () => {
  if (company.companyStatus === 'acquired') {
    return { text: 'Acquired', color: 'bg-orange-100 text-orange-700' }
  }
  if (company.companyStatus === 'merged') {
    return { text: 'Merged', color: 'bg-purple-100 text-purple-700' }
  }
  if (company.isPublic) {
    return { text: 'Public', color: 'bg-green-100 text-green-700' }
  }
  return { text: 'Private', color: 'bg-gray-100 text-gray-600' }
}
```

Badge styling: `text-[10px] px-1.5 py-0.5 rounded font-medium`

---

## Layer Drill-Down Pages

The map supports clicking on layers to see all companies in that layer.

### Route Structure

- Main map: `/map`
- Layer detail: `/map/[layer]` (e.g., `/map/application`, `/map/infrastructure`)

### Layer Slugs

```typescript
const LAYER_SLUGS: Record<string, string> = {
  'application': 'APPLICATION',
  'model': 'MODEL',
  'data': 'DATA',
  'infrastructure': 'INFRA',
  'security': 'SECURITY',
}
```

### Implementation

1. **Main map** shows 2 rows per category (top companies by market cap)
2. **Layer detail** shows ALL companies in that layer
3. Click layer title or layer border to navigate to detail view
4. "Back to Map" link returns to overview

### Adding a New Layer

1. Add to `LAYER_SLUGS` in `app/map/[layer]/page.tsx`
2. Add to `LAYER_DISPLAY_NAMES` in same file
3. Add to `LAYER_CONFIG` in `app/map/page.tsx`
4. Map categories to layer in `CATEGORY_LAYERS`

---

## Multi-Category Support

Companies can appear in multiple categories. For example, OpenAI appears in both "Foundation Models" and "Enterprise".

### Adding a Company to Another Category

```bash
curl -X POST http://localhost:3000/api/add-category \
  -H "Content-Type: application/json" \
  -d '{"company": "OpenAI", "category": "Enterprise"}'
```

This creates a new entry in `protocols_categories` linking the existing company to an additional category.

**Note:** The company must already exist in `protocols_metadata`. This endpoint only adds category mappings.

---

## Force Sync Workflow

When companies are missing from the map or data is out of sync, use force sync.

### When to Use Force Sync

- Companies added to sheet but not appearing in map
- Company data updated in sheet but not reflected in Supabase
- After bulk sheet updates
- After schema changes

### How It Works

Normal sync only processes rows with status "Done". Force sync:
1. Processes all rows with status "Done" OR "Synced"
2. Uses **upsert** operations (insert or update) instead of insert-only
3. Updates existing records if they changed

### Commands

```bash
# Preview what will be synced
curl http://localhost:3000/api/sync

# Execute normal sync (only "Done" status)
curl -X POST http://localhost:3000/api/sync

# Force sync all companies (includes "Synced" status)
curl -X POST "http://localhost:3000/api/sync?force=true"
```

---

## Deleting Companies

### Delete from Supabase Only

```bash
curl -X POST http://localhost:3000/api/delete-company \
  -H "Content-Type: application/json" \
  -d '{"companies": ["Company Name 1", "Company Name 2"]}'
```

This deletes from both `protocols_categories` and `protocols_metadata`.

**Important:** If the company still exists in Google Sheet with "Synced" status, it will be re-added on the next force sync. Either:
- Delete the row from the sheet
- Change the sheet status to "Removed"

### Delete from Everything

1. Delete from Supabase via `/api/delete-company`
2. Delete/mark row in sheet via `/api/delete-from-sheet`

---

## Adding Companies via API

Add a company directly to Google Sheet without manual entry:

```bash
curl -X POST http://localhost:3000/api/add-to-sheet \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "New Company",
    "website": "https://newcompany.com",
    "category": "Enterprise",
    "description": "Enterprise AI platform for...",
    "logoUrl": "https://pbs.twimg.com/profile_images/.../image_400x400.jpg",
    "twitter": "https://x.com/newcompany",
    "isPublic": false,
    "ticker": null,
    "marketCap": "$2B",
    "projectPage": ""
  }'
```

Then run sync to push to Supabase:
```bash
curl -X POST http://localhost:3000/api/sync
```

---

## Branding (Artemis Logo Included!)

The Artemis logo is already included in the repo. You don't need to do anything - it's ready to use.

### Logo Files (Already in Repo)

These files are in `public/`:
- `public/artemis-logo.svg` - Vector logo (used in header/footer)
- `public/artemis-logo.png` - PNG fallback
- `app/favicon.ico` - Browser tab icon

### Where the Logo Appears

The logo automatically appears in:
- **Header** - 40px logo next to the title
- **Footer** - 24px logo with "Artemis" text

### If You Want to Use a Different Logo

Replace these files with your own (keep the same filenames):
1. `public/artemis-logo.svg` - Your logo as SVG (recommended)
2. `public/artemis-logo.png` - Your logo as PNG
3. `app/favicon.ico` - Your favicon

### Logo Sizes in the Code

```tsx
{/* Header - 40px */}
<img
  src="/artemis-logo.svg"
  alt="Artemis"
  className="h-10 w-10"
/>

{/* Footer - 24px */}
<img
  src="/artemis-logo.svg"
  alt="Artemis"
  className="h-6 w-6"
/>
```

---

# PART 2: Research Workflow

This section covers the research process for adding new companies and verifying data.

---

## Adding a New Company

**CLAUDE HELPS THE USER ADD COMPANIES:**

> "Let's add some companies to your map! Just tell me the company name and I'll help you gather the rest."

### What We Need for Each Company

1. **Company Name** - The official name
2. **Website** - Their main website
3. **Category** - Which category on your map
4. **Logo** - A square image (we'll find this together)
5. **Description** - 1-2 sentences about what they do
6. **Public or Private** - Is it publicly traded?
7. **Market Cap or Valuation** - How much is the company worth?

### Finding a Logo

**Easiest method - X/Twitter profile picture:**

1. Go to the company's X/Twitter page
2. Click on their profile picture to make it bigger
3. Right-click the big image → **"Copy image address"**
4. That URL goes in the Logo column

The URL should look like: `https://pbs.twimg.com/profile_images/...`

**If they don't have X/Twitter:**
- Check their website for a logo
- Try: `https://logo.clearbit.com/companywebsite.com`

### Finding X/Twitter Profiles

**Common patterns:**
- `@CompanyName` (e.g., @AMD, @Intel)
- `@CompanyNameHQ` (e.g., @NotionHQ, @AbridgeHQ)
- `@CompanyName_AI` or `@CompanyNameAI` (e.g., @deepseek_ai, @perplexity_ai)
- `@CompanyNameInc` (e.g., @GroqInc)
- `@CompanyName_io` (e.g., @n8n_io, @weaviate_io)

**Verification checklist:**
- [ ] Follower count is reasonable (official accounts usually have many followers)
- [ ] Verified status (blue checkmark)
- [ ] Description matches the company's business
- [ ] Location matches company headquarters
- [ ] Website link points to official site

**Cost**: $0.01 per lookup via x402

### Step 3: Research Market Cap / Valuation

#### For Public Companies

Search for current market cap using web search:

```
WebSearch: "{Company Name} {TICKER} market cap March 2026"
```

**Primary sources (in order of preference):**
1. [Yahoo Finance](https://finance.yahoo.com/quote/{TICKER})
2. [Companies Market Cap](https://companiesmarketcap.com/{company})
3. [Stock Analysis](https://stockanalysis.com/stocks/{ticker}/market-cap/)
4. [MacroTrends](https://www.macrotrends.net/stocks/charts/{TICKER}/{company}/market-cap)

**Format market cap consistently:**
- Trillions: `$1.5T`, `$2.3T`
- Billions: `$150B`, `$45B`
- Millions: `$500M` (rare for this map)

#### For Private Companies

Search for latest valuation:

```
WebSearch: "{Company Name} valuation 2026"
```

**Primary sources (in order of preference):**
1. [TechCrunch](https://techcrunch.com) - funding announcements
2. [Crunchbase News](https://news.crunchbase.com)
3. [CNBC](https://cnbc.com) - major funding rounds
4. [PitchBook](https://pitchbook.com/profiles/company/) - requires login
5. [The Information](https://theinformation.com) - paywalled but often cited

**What to look for:**
- Latest funding round date and amount
- Post-money valuation (not pre-money)
- Lead investors (validates legitimacy)
- Revenue metrics if available (ARR, run rate)

### Step 4: Write Description

Write a concise description (1-2 sentences) covering:
- What the company does
- Key differentiator or technology
- Target market (enterprise, consumer, developer)

**Examples:**
```
"Enterprise data security platform providing cyber resilience, data protection, and backup solutions. Uses AI for ransomware detection and automated recovery."

"AI-powered search engine that provides direct answers with citations. Combines LLM capabilities with real-time web search."

"Provides TensorRT and Triton Inference Server for optimized model deployment, enabling 10-100x speedups in production AI serving."
```

### Step 5: Add to Google Sheet

Use the update scripts or add directly to the sheet:

```bash
# For companies tab
node -e "
import { google } from 'googleapis';
// ... auth setup ...

const rubrikRow = [
  new Date().toISOString(),  // Timestamp
  'Company Name',            // Company Name
  'https://company.com',     // Website
  'Category Name',           // Category (must match Supabase)
  'Description here...',     // Description
  'https://pbs.twimg.com/profile_images/...', // Logo URL (from X)
  'https://x.com/handle',    // Twitter
  'Public',                  // or 'Private'
  '\$TICKER',                // Stock ticker or empty
  '\$XXB',                   // Market cap or valuation
  '',                        // Project Page (optional)
  'Synced'                   // Status
];

await sheets.spreadsheets.values.append({
  spreadsheetId: env.GOOGLE_SHEETS_ID,
  range: 'companies!A:L',
  valueInputOption: 'RAW',
  requestBody: { values: [rubrikRow] },
});
"
```

### Step 6: Add to Logos Tab

Add the X profile info to the logos tab:

```bash
node scripts/update-logo-row.mjs <rowIndex> "https://x.com/handle" "https://pbs.twimg.com/profile_images/.../image_400x400.jpg"
```

**Important:** Replace `_normal` with `_400x400` in profile image URLs for high resolution.

### Step 7: Sync to Supabase

```bash
curl -X POST http://localhost:3000/api/sync
curl -X POST http://localhost:3000/api/sync-logos
```

---

## Verifying Market Caps & Valuations (Batch Update)

Periodically verify all market caps and valuations are current.

### Step 1: Export Current Data

```bash
node scripts/get-companies-for-verification.mjs
```

This outputs all companies grouped by public/private status.

### Step 2: Batch Verify Public Companies

For each public company, search for current market cap:

```
WebSearch: "{Company} {TICKER} market cap {current month} {current year}"
```

**Track changes in a list:**
```
| Company | Previous | Current | Change |
|---------|----------|---------|--------|
| Tesla   | $780B    | $1.5T   | +92%   |
| Adobe   | $180B    | $110B   | -39%   |
```

### Step 3: Batch Verify Private Companies

For private companies, check for recent funding rounds:

```
WebSearch: "{Company} valuation {current year}"
WebSearch: "{Company} funding round {current year}"
```

### Step 4: Apply Updates

Create an update script or use the existing one:

```bash
node scripts/update-market-caps.mjs
```

**Update script pattern:**
```javascript
const marketCapUpdates = {
  "Tesla": "$1.5T",
  "Adobe": "$110B",
  "OpenAI": "$840B",
  // ... more updates
};

// Batch update the sheet
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId,
  requestBody: {
    valueInputOption: "RAW",
    data: updates,
  },
});
```

---

## Tracking M&A Activity

### Types of M&A Events

1. **Acquisition**: Company was acquired by another company
2. **Merger**: Two companies merged into one
3. **Spin-off**: Division became independent company
4. **IPO**: Private company went public

### How to Track

When researching valuations, watch for M&A news:

```
WebSearch: "{Company} acquisition 2026"
WebSearch: "{Company} merger 2026"
WebSearch: "{Company} IPO 2026"
```

### Updating the Sheet

For acquisitions/mergers, update the `company_status` field:
- Set to `'acquired'` - Shows orange "Acquired" badge
- Set to `'merged'` - Shows purple "Merged" badge

For IPOs, update:
- Change `Public/Private` from "Private" to "Public"
- Add stock ticker
- Update valuation to market cap

**Recent M&A Examples (2025-2026):**
- Figma: IPO'd July 2025 (NYSE: FIG)
- SanDisk: Spun off from Western Digital (Feb 2025)
- xAI: Merged with SpaceX (Feb 2026)
- Groq: Assets acquired by Nvidia for $20B (Dec 2025)

---

## Scripts Reference

### Available Scripts

| Script | Purpose |
|--------|---------|
| `scripts/get-todo.mjs` | List companies missing X profile URLs |
| `scripts/update-logo-row.mjs <row> <url> <pic>` | Update a row with X profile and picture |
| `scripts/list-companies.mjs` | List all companies from the companies tab |
| `scripts/get-companies-for-verification.mjs` | Export companies for market cap verification |
| `scripts/update-market-caps.mjs` | Apply batch market cap updates |
| `scripts/setup-logos-tab.mjs` | Initial logos tab setup |

### Creating New Scripts

Scripts should follow this pattern:

```javascript
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

// Your script logic here...
```

---

## x402 API Reference (Optional)

The x402 MCP provides automated Twitter/X profile lookups. **This is optional** - you can find logos manually if you don't have x402 set up.

### Check If You Have x402

Try running in Claude Code:
```javascript
mcp__x402__get_wallet_info()
```

If this fails, you don't have x402 configured. Skip this section and find logos manually.

### Check Wallet Balance

```javascript
mcp__x402__get_wallet_info()
```

### Look Up X Profile

```javascript
mcp__x402__fetch({
  url: "https://x402.twit.sh/users/by/username?username=CompanyHandle"
})
```

**Response includes:**
- `username`, `name`, `description`
- `verified`, `verified_type`
- `profile_image_url` (use `_400x400` version)
- `public_metrics.followers_count`
- `location`

**Cost:** $0.01 per lookup

### Top Up Wallet

If balance is low, deposit at:
```
https://x402scan.com/mcp/deposit/{wallet_address}
```

### Manual Alternative

If you don't have x402, get logos manually:
1. Go to company's X profile
2. Click profile picture to expand
3. Right-click → "Copy image address"
4. Replace `_normal` with `_400x400` in URL

---

## Data Quality Checklist

Before syncing, verify:

- [ ] **Company names** are official and consistent
- [ ] **Categories** match exactly with Supabase categories
- [ ] **Descriptions** are concise (1-2 sentences) and accurate
- [ ] **Market caps** are current (within last month)
- [ ] **Valuations** reflect latest funding round
- [ ] **Tickers** use proper format (`$NVDA` not `NVDA`)
- [ ] **X profiles** are verified official accounts
- [ ] **Logo URLs** use `_400x400` resolution
- [ ] **Public/Private** status is accurate
- [ ] **M&A status** is noted for acquired/merged companies

---

## Quick Research Commands

```bash
# Check remaining companies needing X profiles
node scripts/get-todo.mjs

# Export all companies for verification
node scripts/get-companies-for-verification.mjs

# Update a single company's logo
node scripts/update-logo-row.mjs 84 "https://x.com/rubrikInc" "https://pbs.twimg.com/.../image_400x400.jpg"

# Sync X profile data from logos tab to companies tab
# (ensures Logo URL and Twitter columns are populated)
node -e "
// ... sync script that copies from logos tab to companies tab
"

# Apply batch market cap updates
node scripts/update-market-caps.mjs
```
