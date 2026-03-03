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

// Transform Supabase data to MessariStyleMap config
function transformToConfig(
  categoriesWithProtocols: Record<string, {
    category: string
    label: string
    bucket: string
    protocols: Array<{
      protocol: string
      metadata: {
        name: string
        logo: string | null
        market_cap: number | null
      }
    }>
  }>,
  maxCompaniesPerCategory: number = 8
): MarketMapConfig {
  // Group categories by layer (bucket)
  const layerMap = new Map<string, Category[]>()

  for (const [, category] of Object.entries(categoriesWithProtocols)) {
    const layerName = category.bucket || 'OTHER'

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

    layers.push({
      name: displayName,
      categories,
    })
  }

  return {
    title: 'AI Landscape Market Map',
    subtitle: 'A comprehensive view of the AI ecosystem',
    layers,
    maxCompaniesPerCategory,
    dataAsOf: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    footnote: 'Note: This map is not comprehensive.',
  }
}

export default async function MapPage() {
  const categoriesWithProtocols = await getCategoriesWithProtocols()
  const config = transformToConfig(categoriesWithProtocols, 10)

  return <MessariStyleMap config={config} />
}

// Revalidate every hour
export const revalidate = 3600
