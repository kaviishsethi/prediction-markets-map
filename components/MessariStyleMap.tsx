'use client'

import Image from 'next/image'

// Artemis brand purple
const ARTEMIS_PURPLE = '#7C3AED'
// const ARTEMIS_PURPLE_LIGHT = '#8B5CF6'  // Available for hover states

interface Company {
  name: string
  logo?: string  // URL to logo image
  slug?: string
}

interface Category {
  name: string
  companies: Company[]
}

interface Layer {
  name: string
  categories: Category[]
  // Optional side section (like "Experimental" or "DePIN" in Messari map)
  sideSection?: {
    name: string
    categories: Category[]
  }
}

interface MarketMapConfig {
  title: string
  subtitle?: string
  layers: Layer[]
  maxCompaniesPerCategory?: number  // Default: show all
  dataAsOf?: string
  footnote?: string
}

interface MessariStyleMapProps {
  config: MarketMapConfig
}

// Placeholder logo component when no image available
function PlaceholderLogo({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold"
    >
      {initials}
    </div>
  )
}

// Individual company cell
function CompanyCell({ company }: { company: Company }) {
  return (
    <div className="flex flex-col items-center gap-1 w-14">
      {company.logo ? (
        <Image
          src={company.logo}
          alt={company.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <PlaceholderLogo name={company.name} />
      )}
      <span className="text-[10px] text-gray-700 text-center leading-tight truncate w-full">
        {company.name}
      </span>
    </div>
  )
}

// Category column
function CategoryColumn({
  category,
  maxCompanies
}: {
  category: Category
  maxCompanies?: number
}) {
  const displayCompanies = maxCompanies
    ? category.companies.slice(0, maxCompanies)
    : category.companies

  // Calculate grid - aim for ~2 columns if more than 4 companies
  const cols = displayCompanies.length > 4 ? 2 : 1

  return (
    <div className="flex flex-col items-center">
      {/* Category header */}
      <div className="text-xs font-semibold text-gray-800 mb-2 text-center whitespace-nowrap">
        {category.name}
      </div>

      {/* Company grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
        }}
      >
        {displayCompanies.map((company, idx) => (
          <CompanyCell key={company.slug || idx} company={company} />
        ))}
      </div>
    </div>
  )
}

// Layer row
function LayerRow({
  layer,
  maxCompaniesPerCategory
}: {
  layer: Layer
  maxCompaniesPerCategory?: number
}) {
  return (
    <div className="relative">
      {/* Layer name - centered above */}
      <div className="flex justify-center mb-2">
        <span
          className="text-sm font-bold px-4 bg-white relative z-10"
          style={{ color: ARTEMIS_PURPLE }}
        >
          {layer.name}
        </span>
      </div>

      {/* Layer content box */}
      <div
        className="border rounded-lg p-4 bg-white"
        style={{ borderColor: ARTEMIS_PURPLE }}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Main categories */}
          <div className="flex gap-6 flex-wrap justify-center flex-1">
            {layer.categories.map((category, idx) => (
              <CategoryColumn
                key={idx}
                category={category}
                maxCompanies={maxCompaniesPerCategory}
              />
            ))}
          </div>

          {/* Side section if present */}
          {layer.sideSection && (
            <div
              className="border-l pl-4 flex flex-col"
              style={{ borderColor: ARTEMIS_PURPLE }}
            >
              {/* Vertical label */}
              <div
                className="text-xs font-bold mb-2 text-center"
                style={{
                  color: ARTEMIS_PURPLE,
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
              >
                {layer.sideSection.name}
              </div>
              <div className="flex gap-4">
                {layer.sideSection.categories.map((category, idx) => (
                  <CategoryColumn
                    key={idx}
                    category={category}
                    maxCompanies={maxCompaniesPerCategory}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MessariStyleMap({ config }: MessariStyleMapProps) {
  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {/* Artemis Logo placeholder */}
        <div
          className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: ARTEMIS_PURPLE }}
        >
          A
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {config.title}
          </h1>
          {config.subtitle && (
            <p className="text-gray-500 text-sm">{config.subtitle}</p>
          )}
        </div>
      </div>

      {/* Layers */}
      <div className="space-y-6">
        {config.layers.map((layer, idx) => (
          <LayerRow
            key={idx}
            layer={layer}
            maxCompaniesPerCategory={config.maxCompaniesPerCategory}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t flex items-center justify-between" style={{ borderColor: ARTEMIS_PURPLE }}>
        <div className="text-xs text-gray-500">
          {config.dataAsOf && <div>Data as of: {config.dataAsOf}</div>}
          {config.footnote && <div className="mt-1">{config.footnote}</div>}
        </div>

        {/* Artemis logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: ARTEMIS_PURPLE }}
          >
            A
          </div>
          <span className="font-semibold text-gray-700">Artemis</span>
        </div>
      </div>
    </div>
  )
}

// Export types for external use
export type { MarketMapConfig, Layer, Category, Company }
