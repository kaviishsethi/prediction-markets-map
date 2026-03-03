'use client'

import Image from 'next/image'
import { useEffect, useState, useRef, useCallback } from 'react'

// Artemis brand purple
const ARTEMIS_PURPLE = '#7C3AED'

// Company cell dimensions
const LOGO_SIZE = 32
const CELL_WIDTH = 52 // Fixed width per company cell
const CELL_HEIGHT = 54 // Fixed height: logo (32) + gap (2) + 2-line text (~20)
const CELL_GAP = 4 // gap-1 = 4px
const CATEGORY_PADDING = 16 // px-2 = 8px * 2
const ROW_GAP = 4 // gap-1 between rows

interface Company {
  name: string
  logo?: string
  slug?: string
  ticker?: string
  marketCap?: number
  isPublic?: boolean
  description?: string
  companyStatus?: string  // 'active', 'acquired', 'merged', etc.
  website?: string
  twitter?: string
}

interface TooltipData {
  company: Company
  x: number
  y: number
}

interface Category {
  name: string
  companies: Company[]
}

interface Layer {
  name: string
  categories: Category[]
}

interface MarketMapConfig {
  title: string
  subtitle?: string
  layers: Layer[]
  maxCompaniesPerCategory?: number
  dataAsOf?: string
  footnote?: string
}

interface MessariStyleMapProps {
  config: MarketMapConfig
}

// Placeholder logo when no image
function PlaceholderLogo({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-medium flex-shrink-0"
      style={{ width: LOGO_SIZE, height: LOGO_SIZE, fontSize: LOGO_SIZE * 0.35 }}
    >
      {initials}
    </div>
  )
}

// Format market cap / valuation for display
function formatValue(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}T`
  }
  if (value >= 1) {
    return `$${value.toFixed(1)}B`
  }
  return `$${(value * 1000).toFixed(0)}M`
}

// Tooltip component
function Tooltip({ data, windowWidth }: { data: TooltipData; windowWidth: number }) {
  const { company, x, y } = data

  // Position tooltip to left or right of cursor based on screen position
  const showOnLeft = x > windowWidth / 2
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    top: y + 10,
    ...(showOnLeft ? { right: windowWidth - x + 10 } : { left: x + 10 }),
    zIndex: 50,
    maxWidth: 360,
  }

  // Determine status badge
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

  const statusBadge = getStatusBadge()

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 pointer-events-none"
      style={tooltipStyle}
    >
      <div className="flex items-center gap-2">
        <div className="font-semibold text-gray-900 text-sm">{company.name}</div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusBadge.color}`}>
          {statusBadge.text}
        </span>
      </div>
      {company.ticker && (
        <div className="text-xs text-blue-600 mt-0.5">${company.ticker}</div>
      )}
      {company.marketCap && (
        <div className="text-xs text-green-600 mt-1 font-medium">
          {formatValue(company.marketCap)}
          <span className="text-gray-400 font-normal ml-1">
            ({company.isPublic ? 'Market Cap' : 'Valuation'})
          </span>
        </div>
      )}
      {company.description && (
        <div className="text-xs text-gray-600 mt-2">
          {company.description}
        </div>
      )}
      {(company.website || company.twitter) && (
        <div className="flex gap-3 mt-2 text-xs">
          {company.website && (
            <span className="text-blue-500">🌐 {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
          )}
          {company.twitter && (
            <span className="text-blue-400">𝕏 {company.twitter.includes('/') ? company.twitter.split('/').pop() : company.twitter}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Single company cell - fixed width and height, logo + name below
function CompanyCell({
  company,
  onHover
}: {
  company: Company
  onHover: (data: TooltipData | null) => void
}) {
  const handleMouseEnter = (e: React.MouseEvent) => {
    onHover({ company, x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    onHover({ company, x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    onHover(null)
  }

  return (
    <div
      className="flex flex-col items-center flex-shrink-0 cursor-pointer"
      style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {company.logo ? (
        <Image
          src={company.logo}
          alt={company.name}
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          className="rounded-full object-cover border border-gray-100 flex-shrink-0"
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
        />
      ) : (
        <PlaceholderLogo name={company.name} />
      )}
      <span
        className="text-gray-700 text-center leading-tight mt-0.5 line-clamp-2 overflow-hidden"
        style={{ fontSize: 7, width: CELL_WIDTH - 4, height: 18 }}
      >
        {company.name}
      </span>
    </div>
  )
}

// Responsive category section
function CategorySection({
  category,
  availableWidth,
  onHover
}: {
  category: Category
  availableWidth: number
  onHover: (data: TooltipData | null) => void
}) {
  // Calculate how many companies fit per row based on available width
  const effectiveWidth = availableWidth - CATEGORY_PADDING
  const companiesPerRow = Math.max(2, Math.floor(effectiveWidth / (CELL_WIDTH + CELL_GAP)))

  // Show 2 rows worth, proportional to category size
  const maxCompanies = companiesPerRow * 2
  const displayCompanies = category.companies.slice(0, maxCompanies)

  // Split into rows for center alignment
  const row1 = displayCompanies.slice(0, companiesPerRow)
  const row2 = displayCompanies.slice(companiesPerRow)

  return (
    <div className="flex flex-col">
      {/* Category header */}
      <div
        className="text-xs font-semibold text-center pb-0.5 px-2 whitespace-nowrap"
        style={{ color: '#374151' }}
      >
        {category.name} <span className="font-normal text-gray-400">({category.companies.length})</span>
      </div>

      {/* Companies - always two rows with fixed height, both centered */}
      <div
        className="flex flex-col px-2 pb-2"
        style={{ gap: ROW_GAP, height: (CELL_HEIGHT * 2) + ROW_GAP }}
      >
        {/* Row 1 */}
        <div className="flex justify-center" style={{ gap: CELL_GAP, height: CELL_HEIGHT }}>
          {row1.map((company, idx) => (
            <CompanyCell key={company.slug || idx} company={company} onHover={onHover} />
          ))}
        </div>
        {/* Row 2 - centered, always rendered for consistent height */}
        <div className="flex justify-center" style={{ gap: CELL_GAP, height: CELL_HEIGHT }}>
          {row2.map((company, idx) => (
            <CompanyCell key={company.slug || idx} company={company} onHover={onHover} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Layer section with responsive width calculation
function LayerSection({
  layer,
  onHover
}: {
  layer: Layer
  onHover: (data: TooltipData | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [categoryWidths, setCategoryWidths] = useState<number[]>([])

  const calculateWidths = useCallback(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth

    // Calculate proportional widths based on company count
    const totalCompanies = layer.categories.reduce((sum, cat) => sum + cat.companies.length, 0)

    const widths = layer.categories.map(cat => {
      // Proportional width based on company count, with min width
      const proportion = cat.companies.length / totalCompanies
      const proportionalWidth = containerWidth * proportion
      // Minimum width to fit at least 2 companies
      const minWidth = (CELL_WIDTH * 2) + CELL_GAP + CATEGORY_PADDING
      return Math.max(minWidth, proportionalWidth)
    })

    // Normalize widths to fit container
    const totalWidth = widths.reduce((a, b) => a + b, 0)
    const scale = containerWidth / totalWidth
    const scaledWidths = widths.map(w => Math.floor(w * scale))

    setCategoryWidths(scaledWidths)
  }, [layer.categories])

  useEffect(() => {
    calculateWidths()
    window.addEventListener('resize', calculateWidths)
    return () => window.removeEventListener('resize', calculateWidths)
  }, [calculateWidths])

  return (
    <div className="mb-4 mt-3 relative">
      {/* Layer title - positioned on top border */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-3.5 px-3 bg-white z-10">
        <span
          className="text-base font-bold whitespace-nowrap"
          style={{ color: ARTEMIS_PURPLE }}
        >
          {layer.name}
        </span>
      </div>

      {/* Container with full border - paddingTop creates space below layer title */}
      <div
        ref={containerRef}
        className="flex rounded-lg overflow-hidden border"
        style={{ borderColor: ARTEMIS_PURPLE, paddingTop: '0.425rem' }}
      >
        {layer.categories.map((category, idx) => (
          <div
            key={idx}
            className="flex-shrink-0"
            style={{
              width: categoryWidths[idx] || 'auto',
              borderRight: idx < layer.categories.length - 1 ? `1px solid ${ARTEMIS_PURPLE}20` : 'none'
            }}
          >
            <CategorySection
              category={category}
              availableWidth={categoryWidths[idx] || 200}
              onHover={onHover}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MessariStyleMap({ config }: MessariStyleMapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="bg-white min-h-screen">
      {/* Tooltip */}
      {tooltip && <Tooltip data={tooltip} windowWidth={windowWidth} />}

      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4">
        {/* Artemis Logo */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: ARTEMIS_PURPLE }}
        >
          A
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {config.title}
          </h1>
          {config.subtitle && (
            <p className="text-gray-500 text-sm">{config.subtitle}</p>
          )}
        </div>
      </div>

      {/* Map content */}
      <div className="px-6 pb-4">
        {config.layers.map((layer, idx) => (
          <LayerSection key={idx} layer={layer} onHover={setTooltip} />
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 border-t flex items-center justify-between"
        style={{ borderColor: ARTEMIS_PURPLE }}
      >
        <div className="text-xs text-gray-500">
          {config.dataAsOf && <div>Data as of: {config.dataAsOf}</div>}
          {config.footnote && <div className="mt-0.5">{config.footnote}</div>}
        </div>

        {/* Artemis branding */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
            style={{ backgroundColor: ARTEMIS_PURPLE }}
          >
            A
          </div>
          <span className="font-semibold text-gray-700 text-sm">Artemis</span>
        </div>
      </div>
    </div>
  )
}

export type { MarketMapConfig, Layer, Category, Company }
