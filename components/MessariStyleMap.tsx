'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef, useCallback } from 'react'

// Artemis brand purple
const ARTEMIS_PURPLE = '#7C3AED'

// Company cell dimensions
const LOGO_SIZE = 32
const CELL_WIDTH = 52 // Fixed width per company cell
const CELL_HEIGHT = 54 // Fixed height: logo (32) + gap (2) + 2-line text (~20)
const CELL_GAP = 4 // gap-1 = 4px
const CATEGORY_PADDING = 16 // px-2 = 8px * 2
const ROW_GAP = 4 // gap-1 between rows
const DIVIDER_MARGIN = 4 // Equal margin from top and bottom for category dividers
const SECTION_SPACING = 4 // Space between header/layers/footer

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

// Tooltip logo size
const TOOLTIP_LOGO_SIZE = 48
const TOOLTIP_HEIGHT_ESTIMATE = 200 // Approximate max height of tooltip

// Tooltip component
function Tooltip({
  data,
  windowWidth,
  windowHeight,
  isPinned = false,
  onClose
}: {
  data: TooltipData
  windowWidth: number
  windowHeight: number
  isPinned?: boolean
  onClose?: () => void
}) {
  const { company, x, y } = data

  // Position tooltip based on screen position (both horizontal and vertical)
  const showOnLeft = x > windowWidth / 2
  const showAbove = y > windowHeight - TOOLTIP_HEIGHT_ESTIMATE

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    ...(showAbove ? { bottom: windowHeight - y + 10 } : { top: y + 10 }),
    ...(showOnLeft ? { right: windowWidth - x + 10 } : { left: x + 10 }),
    zIndex: 50,
    maxWidth: 400,
  }

  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent closing when clicking inside tooltip
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

  // Format Twitter URL for display
  const getTwitterHandle = (twitter: string) => {
    return twitter.replace(/^https?:\/\/(x\.com|twitter\.com)\//, '').replace(/\/$/, '')
  }

  const getTwitterUrl = (twitter: string) => {
    const handle = getTwitterHandle(twitter)
    return `https://x.com/${handle}`
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-xl p-3 ${isPinned ? '' : 'pointer-events-none'}`}
      style={tooltipStyle}
      onClick={handleTooltipClick}
    >
      {/* Header with logo in top-right */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gray-900 text-sm">{company.name}</div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusBadge.color}`}>
              {statusBadge.text}
            </span>
            {isPinned && (
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-600 text-sm"
                title="Close"
              >
                ✕
              </button>
            )}
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
        </div>
        {/* Logo in top-right corner */}
        {company.logo ? (
          <Image
            src={company.logo}
            alt={company.name}
            width={TOOLTIP_LOGO_SIZE}
            height={TOOLTIP_LOGO_SIZE}
            className="rounded-lg object-cover border border-gray-100 flex-shrink-0"
            style={{ width: TOOLTIP_LOGO_SIZE, height: TOOLTIP_LOGO_SIZE }}
          />
        ) : (
          <div
            className="rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-medium flex-shrink-0"
            style={{ width: TOOLTIP_LOGO_SIZE, height: TOOLTIP_LOGO_SIZE, fontSize: TOOLTIP_LOGO_SIZE * 0.35 }}
          >
            {company.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      {/* Description */}
      {company.description && (
        <div className="text-xs text-gray-600 mt-2">
          {company.description}
        </div>
      )}
      {/* Links */}
      {(company.website || company.twitter) && (
        <div className="flex flex-col gap-1 mt-2 text-xs">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-500 ${isPinned ? 'hover:underline cursor-pointer' : ''}`}
            >
              🌐 {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
          {company.twitter && (
            <a
              href={getTwitterUrl(company.twitter)}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-400 ${isPinned ? 'hover:underline cursor-pointer' : ''}`}
            >
              𝕏 {getTwitterUrl(company.twitter)}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// Single company cell - fixed width and height, logo + name below
function CompanyCell({
  company,
  onHover,
  onClick,
  isPinned
}: {
  company: Company
  onHover: (data: TooltipData | null) => void
  onClick: (data: TooltipData) => void
  isPinned: boolean
}) {
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!isPinned) {
      onHover({ company, x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPinned) {
      onHover({ company, x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseLeave = () => {
    if (!isPinned) {
      onHover(null)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick({ company, x: e.clientX, y: e.clientY })
  }

  return (
    <div
      className="flex flex-col items-center flex-shrink-0 cursor-pointer"
      style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
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
        className="text-gray-900 text-center leading-tight mt-0.5 line-clamp-2 overflow-hidden"
        style={{ fontSize: 7, width: CELL_WIDTH - 4, height: 18 }}
      >
        {company.name}
      </span>
    </div>
  )
}

// Calculate gap to fill available width
function calculateGapForRow(itemCount: number, targetWidth: number): number {
  if (itemCount <= 1) return CELL_GAP
  const totalCellWidth = itemCount * CELL_WIDTH
  const availableGapSpace = targetWidth - totalCellWidth
  const gap = availableGapSpace / (itemCount - 1)
  return Math.max(CELL_GAP, gap)
}

// Responsive category section
function CategorySection({
  category,
  availableWidth,
  onHover,
  onClick,
  isPinned
}: {
  category: Category
  availableWidth: number
  onHover: (data: TooltipData | null) => void
  onClick: (data: TooltipData) => void
  isPinned: boolean
}) {
  // Calculate how many companies fit per row based on available width
  const effectiveWidth = availableWidth - CATEGORY_PADDING
  const companiesPerRow = Math.max(2, Math.floor(effectiveWidth / (CELL_WIDTH + CELL_GAP)))

  // Show 2 rows worth, proportional to category size
  const maxCompanies = companiesPerRow * 2
  const displayCompanies = category.companies.slice(0, maxCompanies)

  // Split into rows
  const row1 = displayCompanies.slice(0, companiesPerRow)
  const row2 = displayCompanies.slice(companiesPerRow)

  // Calculate gap for each row to fill the effective width
  const row1Gap = calculateGapForRow(row1.length, effectiveWidth)
  const row2Gap = calculateGapForRow(row2.length, effectiveWidth)

  return (
    <div className="flex flex-col">
      {/* Category header */}
      <div
        className="text-xs font-semibold text-center pb-0.5 px-2 whitespace-nowrap"
        style={{ color: '#374151' }}
      >
        {category.name} <span className="font-normal text-gray-400">({category.companies.length})</span>
      </div>

      {/* Companies - always two rows with fixed height, spread to fill width */}
      <div
        className="flex flex-col px-2"
        style={{ gap: ROW_GAP, height: (CELL_HEIGHT * 2) + ROW_GAP }}
      >
        {/* Row 1 */}
        <div className="flex justify-between" style={{ gap: row1Gap, height: CELL_HEIGHT }}>
          {row1.map((company, idx) => (
            <CompanyCell key={company.slug || idx} company={company} onHover={onHover} onClick={onClick} isPinned={isPinned} />
          ))}
        </div>
        {/* Row 2 - gap calculated to fill same width */}
        <div className="flex justify-between" style={{ gap: row2Gap, height: CELL_HEIGHT }}>
          {row2.map((company, idx) => (
            <CompanyCell key={company.slug || idx} company={company} onHover={onHover} onClick={onClick} isPinned={isPinned} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Layer section with responsive width calculation
function LayerSection({
  layer,
  onHover,
  onClick,
  isPinned,
  onLayerClick
}: {
  layer: Layer
  onHover: (data: TooltipData | null) => void
  onClick: (data: TooltipData) => void
  isPinned: boolean
  onLayerClick?: (layerName: string) => void
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

  const handleLayerClick = () => {
    // Only navigate if clicking on the layer background, not on companies
    // The company cells already stopPropagation, so this only fires for layer area clicks
    if (onLayerClick) {
      onLayerClick(layer.name)
    }
  }

  return (
    <div className="mb-2 mt-2 relative">
      {/* Layer title - vertical overlapping left border, reading bottom to top */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white z-10 cursor-pointer hover:opacity-80 transition-opacity py-1"
        style={{ left: 0 }}
        onClick={handleLayerClick}
      >
        <span
          className="text-base font-bold whitespace-nowrap"
          style={{
            color: ARTEMIS_PURPLE,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)'
          }}
        >
          {layer.name}
        </span>
      </div>

      {/* Container with full border - equal padding top/bottom for divider spacing */}
      <div
        ref={containerRef}
        className="flex rounded-lg overflow-hidden cursor-pointer hover:border-opacity-80 transition-all"
        style={{ borderColor: ARTEMIS_PURPLE, borderWidth: 2, borderStyle: 'solid', paddingTop: DIVIDER_MARGIN, paddingBottom: DIVIDER_MARGIN }}
        onClick={handleLayerClick}
      >
        {layer.categories.map((category, idx) => (
          <div
            key={idx}
            className="flex-shrink-0"
            style={{
              width: categoryWidths[idx] || 'auto',
              borderRight: idx < layer.categories.length - 1 ? `2px solid ${ARTEMIS_PURPLE}90` : 'none'
            }}
          >
            <CategorySection
              category={category}
              availableWidth={categoryWidths[idx] || 200}
              onHover={onHover}
              onClick={onClick}
              isPinned={isPinned}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MessariStyleMap({ config }: MessariStyleMapProps) {
  const router = useRouter()
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [pinnedTooltip, setPinnedTooltip] = useState<TooltipData | null>(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Navigate to layer detail page
  const handleLayerClick = useCallback((layerName: string) => {
    const slug = layerName.toLowerCase().replace(/\s+/g, '-')
    router.push(`/map/${slug}`)
  }, [router])

  // Handle click to pin/unpin tooltip
  const handleCompanyClick = useCallback((data: TooltipData) => {
    if (pinnedTooltip?.company.slug === data.company.slug) {
      // Clicking same company unpins
      setPinnedTooltip(null)
    } else {
      setPinnedTooltip(data)
    }
  }, [pinnedTooltip])

  // Close pinned tooltip when clicking outside
  const handleBackgroundClick = useCallback(() => {
    if (pinnedTooltip) {
      setPinnedTooltip(null)
    }
  }, [pinnedTooltip])

  // Display pinned tooltip if exists, otherwise hover tooltip
  const activeTooltip = pinnedTooltip || tooltip

  return (
    <div className="bg-white min-h-screen" onClick={handleBackgroundClick}>
      {/* Tooltip */}
      {activeTooltip && (
        <Tooltip
          data={activeTooltip}
          windowWidth={windowWidth}
          windowHeight={windowHeight}
          isPinned={!!pinnedTooltip}
          onClose={() => setPinnedTooltip(null)}
        />
      )}

      {/* Header */}
      <div className="px-6 flex items-center gap-4" style={{ paddingTop: SECTION_SPACING, paddingBottom: SECTION_SPACING }}>
        {/* Artemis Logo */}
        <a href="https://www.artemis.xyz" target="_blank" rel="noopener noreferrer">
          <img
            src="/artemis-logo.svg"
            alt="Artemis"
            className="h-12 w-12 hover:opacity-80 transition-opacity"
          />
        </a>

        <h1 className="text-4xl font-bold text-gray-900">
          {config.title}
        </h1>
      </div>

      {/* Map content */}
      <div className="px-6">
        {config.layers.map((layer, idx) => (
          <LayerSection
            key={idx}
            layer={layer}
            onHover={setTooltip}
            onClick={handleCompanyClick}
            isPinned={!!pinnedTooltip}
            onLayerClick={handleLayerClick}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-6 flex items-center justify-between"
        style={{ paddingTop: SECTION_SPACING, paddingBottom: SECTION_SPACING }}
      >
        <div className="text-xs text-gray-500">
          {config.dataAsOf && <div>Data as of: {config.dataAsOf}</div>}
          {config.footnote && <div className="mt-0.5">{config.footnote}</div>}
        </div>

        {/* Artemis branding */}
        <a href="https://www.artemis.xyz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img
            src="/artemis-logo.svg"
            alt="Artemis"
            className="h-6 w-6"
          />
          <span className="font-semibold text-gray-700 text-sm">Artemis</span>
        </a>
      </div>
    </div>
  )
}

export type { MarketMapConfig, Layer, Category, Company }
