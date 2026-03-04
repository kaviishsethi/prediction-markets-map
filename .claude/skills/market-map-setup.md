# Market Map Setup Skill

Create a Messari-style market map for any sector. This skill walks through the complete setup process including Google Sheets, Supabase, Vercel, and the codebase.

---

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- A Google Cloud account (for Sheets API)
- A Supabase account (free tier works)
- A Vercel account (for deployment)
- Git installed

---

## Step 1: Clone the Template Repository

```bash
# Clone the ai-landscape-map template
git clone <TEMPLATE_REPO_URL> <your-sector>-landscape-map
cd <your-sector>-landscape-map

# Install dependencies
npm install
```

**ASK USER:** What sector is this market map for? (e.g., "AI", "DeFi", "Gaming", "Fintech")

Store the answer as `SECTOR_NAME` for use throughout this guide.

---

## Step 2: Set Up Google Sheets

### 2.1 Create the Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it: `{SECTOR_NAME} Landscape Map Data`
3. Create two tabs:
   - `companies` (main data)
   - `logos` (logo URLs)

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
| C | Logo URL | Direct image URL from Twitter/X profile |

**IMPORTANT: X/Twitter Profile Pictures Work Best**

X (Twitter) profile picture URLs are the most reliable for logos because:
- They're consistently sized (400x400)
- They don't require authentication
- They rarely break or change domains
- They work well with Next.js Image component

**How to get X profile picture URLs:**
1. Go to the company's X/Twitter profile
2. Click on their profile picture to expand it
3. Right-click the expanded image → **"Copy image address"**
4. Paste into column C

The URL should look like:
```
https://pbs.twimg.com/profile_images/1234567890/image_400x400.jpg
```

**DO NOT** copy the profile page URL (https://x.com/company) - you need the direct image URL from `pbs.twimg.com`.

### 2.4 Get the Spreadsheet ID

The spreadsheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

Save this ID for later: `GOOGLE_SHEETS_ID`

---

## Step 3: Set Up Google Cloud Service Account

### 3.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Note the Project ID

### 3.2 Enable the Google Sheets API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click **Enable**

### 3.3 Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Name it: `{sector}-landscape-sheets`
4. Click **Create and Continue**
5. Skip the optional steps, click **Done**

### 3.4 Generate a Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** format
5. Download the key file

From the JSON file, extract:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY`

### 3.5 Share the Spreadsheet

1. Open your Google Spreadsheet
2. Click **Share**
3. Add the service account email (from step 3.4)
4. Give it **Editor** access

---

## Step 4: Set Up Supabase

### 4.1 Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click **New Project**
3. Name it: `{sector}-landscape-map`
4. Choose a strong database password (save it!)
5. Select a region close to your users
6. Click **Create new project**

### 4.2 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_API_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 4.3 Create Database Tables

Go to **SQL Editor** and run:

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

**ASK USER:** What table prefix do you want to use? (e.g., "ai_", "defi_", "gaming_")

Replace `{prefix}` in the SQL above with the chosen prefix.

### 4.4 Insert Categories

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

## Step 5: Configure the Codebase

### 5.1 Update Environment Variables

Create `.env.local` in the project root:

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

## Step 8: Deploy to Vercel

### 8.1 Push to GitHub

```bash
# Initialize git if needed
git init

# Add remote
git remote add origin https://github.com/your-org/your-repo.git

# Commit and push
git add .
git commit -m "Initial market map setup"
git push -u origin main
```

### 8.2 Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure environment variables (copy from `.env.local`):
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TABLE_PREFIX`
5. Click **Deploy**

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
1. Check if domain is in `next.config.js` remotePatterns
2. Verify logo URLs are direct image links (not webpage URLs)
3. Check browser console for image errors

### Categories Missing
1. Verify category labels match exactly between Sheet and Supabase
2. Check `CATEGORY_LAYERS` includes the category
3. Run sync again

### Sync Failing
1. Check Google service account has Editor access to sheet
2. Verify Supabase service role key is correct
3. Check server logs for detailed errors

### Layout Issues
1. Clear browser cache
2. Check for console errors
3. Verify responsive breakpoints

---

## File Structure Reference

```
├── app/
│   ├── api/
│   │   ├── sync/route.ts              # Sync companies from Sheet to Supabase
│   │   ├── sync-logos/route.ts        # Sync logos from Sheet
│   │   ├── rename-company/route.ts    # Rename a company in Supabase
│   │   ├── delete-from-sheet/route.ts # Delete rows from all Sheet tabs
│   │   ├── cleanup/route.ts           # Bulk remove companies
│   │   ├── check-company/route.ts     # Debug: check company in Supabase
│   │   ├── check-logos/route.ts       # Debug: check logo sync status
│   │   └── map-data/route.ts          # Get map statistics
│   ├── map/page.tsx                   # Market map page
│   └── treemap/page.tsx               # Treemap page (if enabled)
├── components/
│   └── MessariStyleMap.tsx            # Main map component with tooltips
├── database/
│   └── api.ts                         # Supabase data fetching
├── lib/
│   ├── google-sheets.ts               # Google Sheets integration
│   └── supabase.ts                    # Supabase client
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

# Sync logos (run after adding logos to Sheet)
curl -X POST http://localhost:3000/api/sync-logos

# Rename a company
curl -X POST http://localhost:3000/api/rename-company \
  -H "Content-Type: application/json" \
  -d '{"oldName": "Old Name", "newName": "New Name"}'

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
