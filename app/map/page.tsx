import { getCategoriesWithProtocols } from '@/database/api'
import { MessariStyleMap, type MarketMapConfig, type Layer, type Category } from '@/components/MessariStyleMap'

// Layer order and display names
const LAYER_CONFIG: Record<string, { displayName: string; order: number }> = {
  'APPLICATION': { displayName: 'Application', order: 1 },
  'MODEL': { displayName: 'Model', order: 2 },
  'DATA': { displayName: 'Data', order: 3 },
  'INFRA': { displayName: 'Infrastructure', order: 4 },
  'SECURITY': { displayName: 'Security', order: 5 },
}

// Category to layer mapping - matches treemap exactly
// Only categories in this map will be displayed
const CATEGORY_LAYERS: Record<string, string> = {
  'Consumer': 'APPLICATION',
  'Enterprise': 'APPLICATION',
  'Agent Platforms/Frameworks': 'APPLICATION',
  'Foundation Models': 'MODEL',
  'Post-Training': 'MODEL',
  'Storage & Retrieval': 'DATA',
  'Labeling': 'DATA',
  'Pipelines': 'DATA',
  'Cloud & Hosting': 'INFRA',
  'Inference': 'INFRA',
  'Chips & Hardware': 'INFRA',
  'Energy & Datacenters': 'INFRA',
  'Model Security': 'SECURITY',
  'Infrastructure Security': 'SECURITY',
  'AI Governance': 'SECURITY',
}

// Category display order (left to right within each layer)
const CATEGORY_ORDER: Record<string, number> = {
  'Consumer': 1,
  'Enterprise': 2,
  'Agent Platforms/Frameworks': 3,
  'Foundation Models': 4,
  'Post-Training': 5,
  'Labeling': 6,
  'Pipelines': 7,
  'Storage & Retrieval': 8,
  'Inference': 9,
  'Chips & Hardware': 10,
  'Cloud & Hosting': 11,
  'Energy & Datacenters': 12,
  'Model Security': 13,
  'AI Governance': 14,
  'Infrastructure Security': 15,
}

// Transform Supabase data to MessariStyleMap config
function transformToConfig(
  categoriesWithProtocols: Record<string, {
    category: string
    label: string
    bucket: string
    protocols: Array<{
      protocol: string
      website: string | null
      twitter: string | null
      metadata: {
        name: string
        logo: string | null
        market_cap: number | null
        ticker: string | null
        is_public: boolean
        description: string | null
        company_status?: string | null
        website: string | null
        twitter: string | null
      }
    }>
  }>,
  maxCompaniesPerCategory: number = 8
): MarketMapConfig {
  // Group categories by layer (using CATEGORY_LAYERS mapping)
  const layerMap = new Map<string, Category[]>()

  for (const [, category] of Object.entries(categoriesWithProtocols)) {
    // Only include categories that are in the CATEGORY_LAYERS mapping
    const layerName = CATEGORY_LAYERS[category.label]
    if (!layerName) {
      // Skip categories not in the approved list
      continue
    }

    if (!layerMap.has(layerName)) {
      layerMap.set(layerName, [])
    }

    // Sort protocols by market cap descending
    const sortedProtocols = [...category.protocols].sort((a, b) => {
      return (b.metadata.market_cap || 0) - (a.metadata.market_cap || 0)
    })

    layerMap.get(layerName)!.push({
      name: category.label,
      companies: sortedProtocols.map(p => ({
        name: p.metadata.name,
        logo: p.metadata.logo || undefined,
        slug: p.protocol,
        ticker: p.metadata.ticker || undefined,
        marketCap: p.metadata.market_cap || undefined,
        isPublic: p.metadata.is_public,
        description: p.metadata.description || undefined,
        companyStatus: p.metadata.company_status || undefined,
        website: p.metadata.website || p.website || undefined,
        twitter: p.metadata.twitter || p.twitter || undefined,
      })),
    })
  }

  // Build layers array in order
  const layers: Layer[] = []

  const sortedLayerNames = Array.from(layerMap.keys()).sort((a, b) => {
    const orderA = LAYER_CONFIG[a]?.order ?? 99
    const orderB = LAYER_CONFIG[b]?.order ?? 99
    return orderA - orderB
  })

  for (const layerName of sortedLayerNames) {
    const categories = layerMap.get(layerName) || []
    const displayName = LAYER_CONFIG[layerName]?.displayName || layerName

    // Sort categories by the specified order
    categories.sort((a, b) => {
      const orderA = CATEGORY_ORDER[a.name] ?? 99
      const orderB = CATEGORY_ORDER[b.name] ?? 99
      return orderA - orderB
    })

    layers.push({
      name: displayName,
      categories,
    })
  }

  return {
    title: 'AI Landscape Market Map',
    subtitle: 'A comprehensive view of the AI stack',
    layers,
    maxCompaniesPerCategory,
    dataAsOf: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
  }
}

export default async function MapPage() {
  const categoriesWithProtocols = await getCategoriesWithProtocols()
  // Don't limit companies - let component size proportionally based on category size
  const config = transformToConfig(categoriesWithProtocols)

  return <MessariStyleMap config={config} />
}

// Revalidate every hour
export const revalidate = 3600
