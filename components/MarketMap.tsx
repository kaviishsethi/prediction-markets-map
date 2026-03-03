'use client'

import { CategoryCard } from './CategoryCard'
import type { CategoryWithProtocols } from '@/database/api'

interface MarketMapProps {
  categories: Record<string, CategoryWithProtocols>
}

// Layer definitions with their category rows and colors
const LAYERS = [
  {
    name: 'APPLICATION',
    color: 'bg-blue-50 border-blue-200',
    labelColor: 'text-blue-600',
    rows: [['consumer-ai', 'enterprise-ai'], ['ai-agents']],
  },
  {
    name: 'MODEL',
    color: 'bg-purple-50 border-purple-200',
    labelColor: 'text-purple-600',
    rows: [['foundation-models'], ['post-training']],
  },
  {
    name: 'DATA',
    color: 'bg-green-50 border-green-200',
    labelColor: 'text-green-600',
    rows: [['data-storage-retrieval', 'data-labeling', 'data-pipelines']],
  },
  {
    name: 'INFRA',
    color: 'bg-orange-50 border-orange-200',
    labelColor: 'text-orange-600',
    rows: [['cloud-hosting', 'inference'], ['chips-hardware', 'energy-datacenters']],
  },
  {
    name: 'SECURITY',
    color: 'bg-red-50 border-red-200',
    labelColor: 'text-red-600',
    rows: [['model-security', 'infra-security', 'ai-governance']],
  },
]

function sortProtocols(category: CategoryWithProtocols): CategoryWithProtocols {
  const sorted = [...category.protocols].sort((a, b) => {
    // Sort by market cap/valuation descending
    const aMarketCap = a.metadata.market_cap || 0
    const bMarketCap = b.metadata.market_cap || 0
    if (aMarketCap !== bMarketCap) return bMarketCap - aMarketCap

    // Then by name alphabetically
    return a.metadata.name.localeCompare(b.metadata.name)
  })

  return { ...category, protocols: sorted }
}

export function MarketMap({ categories }: MarketMapProps) {
  // Calculate flex grow based on protocol counts
  const getFlexGrow = (categorySlug: string, row: string[]) => {
    const counts = row.map((cat) => categories[cat]?.protocols?.length ?? 0)
    const total = counts.reduce((a, b) => a + b, 0)
    if (total === 0) return 1
    const count = counts[row.indexOf(categorySlug)]
    return Math.max(1, Math.round((count / total) * row.length * 2))
  }

  return (
    <div className="space-y-3">
      {/* Desktop layout */}
      <div className="hidden md:block space-y-3">
        {LAYERS.map((layer) => (
          <div
            key={layer.name}
            className={`flex rounded-lg border ${layer.color}`}
          >
            {/* Vertical layer label */}
            <div className="flex items-center justify-center w-8 shrink-0">
              <span
                className={`font-bold text-xs tracking-widest ${layer.labelColor}`}
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
              >
                {layer.name}
              </span>
            </div>

            {/* Layer content */}
            <div className="flex-1 p-3 space-y-3">
              {layer.rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: row
                      .map((cat) => `minmax(250px, ${getFlexGrow(cat, row)}fr)`)
                      .join(' '),
                  }}
                >
                  {row.map((categorySlug) => {
                    const category = categories[categorySlug]
                    if (!category) return null
                    return (
                      <CategoryCard
                        key={categorySlug}
                        category={sortProtocols(category)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile layout - single column with layer headers */}
      <div className="md:hidden space-y-4">
        {LAYERS.map((layer) => (
          <div key={layer.name} className={`rounded-lg border ${layer.color} p-3`}>
            <div className={`font-bold text-xs tracking-widest ${layer.labelColor} mb-3`}>
              {layer.name}
            </div>
            <div className="space-y-3">
              {layer.rows.flat().map((categorySlug) => {
                const category = categories[categorySlug]
                if (!category) return null
                return (
                  <CategoryCard
                    key={categorySlug}
                    category={sortProtocols(category)}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
