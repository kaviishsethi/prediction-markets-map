import { getCategoriesWithProtocols } from '@/database/api'
import { LayerDetailView } from '@/components/LayerDetailView'
import { notFound } from 'next/navigation'

// Layer slug to internal name mapping
const LAYER_SLUGS: Record<string, string> = {
  'application': 'APPLICATION',
  'model': 'MODEL',
  'data': 'DATA',
  'infrastructure': 'INFRA',
  'security': 'SECURITY',
}

// Display names for each layer
const LAYER_DISPLAY_NAMES: Record<string, string> = {
  'APPLICATION': 'Application',
  'MODEL': 'Model',
  'DATA': 'Data',
  'INFRA': 'Infrastructure',
  'SECURITY': 'Security',
}

// Category to layer mapping (same as main map page)
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

// Category display order within each layer
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

interface Company {
  name: string
  logo?: string
  slug?: string
  ticker?: string
  marketCap?: number
  isPublic?: boolean
  description?: string
  companyStatus?: string
  website?: string
  twitter?: string
}

interface Category {
  name: string
  companies: Company[]
}

interface LayerData {
  name: string
  displayName: string
  categories: Category[]
  totalCompanies: number
}

export default async function LayerPage({ params }: { params: Promise<{ layer: string }> }) {
  const { layer: layerSlug } = await params
  const layerKey = LAYER_SLUGS[layerSlug]

  if (!layerKey) {
    notFound()
  }

  const categoriesWithProtocols = await getCategoriesWithProtocols()

  // Filter categories that belong to this layer
  const layerCategories: Category[] = []

  for (const [, category] of Object.entries(categoriesWithProtocols)) {
    const categoryLayer = CATEGORY_LAYERS[category.label]
    if (categoryLayer !== layerKey) continue

    // Sort protocols by market cap descending
    const sortedProtocols = [...category.protocols].sort((a, b) => {
      return (b.metadata.market_cap || 0) - (a.metadata.market_cap || 0)
    })

    layerCategories.push({
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

  // Sort categories by order
  layerCategories.sort((a, b) => {
    const orderA = CATEGORY_ORDER[a.name] ?? 99
    const orderB = CATEGORY_ORDER[b.name] ?? 99
    return orderA - orderB
  })

  const layerData: LayerData = {
    name: layerKey,
    displayName: LAYER_DISPLAY_NAMES[layerKey],
    categories: layerCategories,
    totalCompanies: layerCategories.reduce((sum, cat) => sum + cat.companies.length, 0),
  }

  return <LayerDetailView layer={layerData} />
}

// Generate static params for all layers
export async function generateStaticParams() {
  return Object.keys(LAYER_SLUGS).map((slug) => ({
    layer: slug,
  }))
}

// Revalidate every hour
export const revalidate = 3600
