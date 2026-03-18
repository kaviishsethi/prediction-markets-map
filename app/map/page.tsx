import { MessariStyleMap, type MarketMapConfig, type Layer, type Category } from '@/components/MessariStyleMap'
import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'

// Generate dynamic title with current month and year
function getMapTitle(): string {
  const now = new Date()
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return `${monthYear} Prediction Markets Landscape`
}

// Dynamic metadata for link previews
export async function generateMetadata(): Promise<Metadata> {
  const title = getMapTitle()
  const description = 'Interactive market map of the prediction markets ecosystem across Platforms, Distribution, Liquidity, Data, Oracles, Infrastructure, and Capital layers.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// Layer order and display names
const LAYER_CONFIG: Record<string, { displayName: string; order: number }> = {
  'PLATFORMS': { displayName: 'Platforms', order: 1 },
  'DISTRIBUTION': { displayName: 'Distribution', order: 2 },
  'LIQUIDITY': { displayName: 'Liquidity', order: 3 },
  'DATA': { displayName: 'Data', order: 4 },
  'ORACLE': { displayName: 'Oracles', order: 5 },
  'INFRA': { displayName: 'Infra', order: 6 },
  'CAPITAL': { displayName: 'Capital', order: 7 },
}

// Map our JSON layer names to bucket keys
const LAYER_BUCKET_MAP: Record<string, string> = {
  'Prediction Market Platforms': 'PLATFORMS',
  'Distribution & Access': 'DISTRIBUTION',
  'Liquidity & Market Making': 'LIQUIDITY',
  'Data, Analytics & Research': 'DATA',
  'Oracle, Resolution & Benchmarks': 'ORACLE',
  'Core Infrastructure': 'INFRA',
  'Regulatory & Capital': 'CAPITAL',
}

// Category display order (left to right within each layer)
const CATEGORY_ORDER: Record<string, number> = {
  'Regulated US Exchanges (DCMs)': 1,
  'Crypto / DeFi Markets': 2,
  'Sportsbook & TradFi Entrants': 3,
  'Broker Distribution': 4,
  'Aggregators & APIs': 5,
  'Institutional Market Makers': 6,
  'Analytics Platforms': 7,
  'Media & Research': 8,
  'On-Chain Oracles': 9,
  'Benchmarks & Pricing': 10,
  'Settlement Chains': 11,
  'Clearing & Exchange Infra': 12,
  'Compliance & KYC/AML': 13,
  'Regulators': 14,
  'Investors': 15,
}

// Build static config from our market_map.json
function buildStaticConfig(): MarketMapConfig {
  const dataPath = path.join(process.cwd(), 'data', 'market_map.json')
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  const layers: Layer[] = []

  for (const layerData of rawData) {
    const bucketKey = LAYER_BUCKET_MAP[layerData.layer]
    if (!bucketKey) continue

    const displayName = LAYER_CONFIG[bucketKey]?.displayName || layerData.layer

    const categories: Category[] = layerData.subcategories.map((sub: { name: string; companies: Array<{ name: string; domain: string; logoPath: string; logoResolved: boolean }> }) => ({
      name: sub.name,
      companies: sub.companies.map((co: { name: string; domain: string; logoPath: string; logoResolved: boolean }) => ({
        name: co.name,
        logo: co.logoResolved ? `/${co.logoPath.replace('assets/', '')}` : undefined,
        slug: co.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        website: `https://${co.domain}`,
      })),
    }))

    // Sort categories by specified order
    categories.sort((a, b) => {
      const orderA = CATEGORY_ORDER[a.name] ?? 99
      const orderB = CATEGORY_ORDER[b.name] ?? 99
      return orderA - orderB
    })

    layers.push({ name: displayName, categories })
  }

  // Sort layers by order
  layers.sort((a, b) => {
    const orderA = Object.values(LAYER_CONFIG).find(c => c.displayName === a.name)?.order ?? 99
    const orderB = Object.values(LAYER_CONFIG).find(c => c.displayName === b.name)?.order ?? 99
    return orderA - orderB
  })

  return {
    title: getMapTitle(),
    layers,
    dataAsOf: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
  }
}

export default function MapPage() {
  const config = buildStaticConfig()
  return <MessariStyleMap config={config} />
}
