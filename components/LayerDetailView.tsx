'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useCallback, useRef } from 'react'

// Artemis brand purple
const ARTEMIS_PURPLE = '#7C3AED'

// Spacing constants (matching main map)
const SECTION_SPACING = 4 // Space between header/content/footer
const DIVIDER_MARGIN = 4 // Equal margin from top and bottom for category dividers

// Company cell dimensions for detail view (larger logos than main map)
const LOGO_SIZE = 52
const CELL_WIDTH = 76
const CELL_GAP = 8 // Horizontal gap between cells
const ROW_GAP = 8 // Vertical gap between rows

// Text dimensions for 2-line names
const FONT_SIZE = 10
const LINE_HEIGHT = 1.3
const TEXT_LINES = 2
const TEXT_HEIGHT = Math.ceil(FONT_SIZE * LINE_HEIGHT * TEXT_LINES) + 4 // Extra buffer for descenders

// Calculate cell height: logo + gap + text
const LOGO_TEXT_GAP = 4
const CELL_HEIGHT = LOGO_SIZE + LOGO_TEXT_GAP + TEXT_HEIGHT

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

interface TooltipData {
  company: Company
  x: number
  y: number
}

// Placeholder logo when no image
function PlaceholderLogo({ name, size = LOGO_SIZE }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-medium flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
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
  const TOOLTIP_HEIGHT_ESTIMATE = 200

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
    e.stopPropagation()
  }

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
        {company.logo ? (
          <Image
            src={company.logo}
            alt={company.name}
            width={48}
            height={48}
            className="rounded-lg object-cover border border-gray-100 flex-shrink-0"
            style={{ width: 48, height: 48 }}
          />
        ) : (
          <PlaceholderLogo name={company.name} size={48} />
        )}
      </div>
      {company.description && (
        <div className="text-xs text-gray-600 mt-2">
          {company.description}
        </div>
      )}
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

// Company cell for the detail grid
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
      className="flex flex-col items-center cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors"
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
        className="text-gray-900 text-center mt-1 line-clamp-2"
        style={{
          fontSize: FONT_SIZE,
          lineHeight: `${LINE_HEIGHT}`,
          width: CELL_WIDTH - 4,
          minHeight: TEXT_HEIGHT,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {company.name}
      </span>
    </div>
  )
}

// Calculate optimal row distribution to avoid orphan single items
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

// Calculate gap to fill available width
function calculateGapForRow(itemCount: number, targetWidth: number): number {
  if (itemCount <= 1) return CELL_GAP
  const totalCellWidth = itemCount * CELL_WIDTH
  const availableGapSpace = targetWidth - totalCellWidth
  const gap = availableGapSpace / (itemCount - 1)
  return Math.max(CELL_GAP, gap)
}

// Category section with programmatic spacing to fill width
function CategorySection({
  category,
  containerWidth,
  onHover,
  onClick,
  isPinned
}: {
  category: Category
  containerWidth: number
  onHover: (data: TooltipData | null) => void
  onClick: (data: TooltipData) => void
  isPinned: boolean
}) {
  // Calculate max companies per row based on container width
  const maxPerRow = Math.max(1, Math.floor((containerWidth + CELL_GAP) / (CELL_WIDTH + CELL_GAP)))

  // Get optimal row distribution to avoid single-item rows
  const rowDistribution = calculateRowDistribution(category.companies.length, maxPerRow)

  // Split companies into rows
  const rows: Company[][] = []
  let idx = 0
  for (const count of rowDistribution) {
    rows.push(category.companies.slice(idx, idx + count))
    idx += count
  }

  return (
    <div className="mb-4">
      <h3
        className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 text-center"
        style={{ borderColor: ARTEMIS_PURPLE }}
      >
        {category.name}
        <span className="text-gray-400 font-normal ml-2">({category.companies.length})</span>
      </h3>
      <div className="flex flex-col" style={{ gap: ROW_GAP }}>
        {rows.map((row, rowIdx) => {
          // Calculate gap to fill the full container width
          const rowGap = calculateGapForRow(row.length, containerWidth)
          return (
            <div
              key={rowIdx}
              className="flex justify-between"
              style={{ gap: rowGap, height: CELL_HEIGHT }}
            >
              {row.map((company, companyIdx) => (
                <CompanyCell
                  key={company.slug || companyIdx}
                  company={company}
                  onHover={onHover}
                  onClick={onClick}
                  isPinned={isPinned}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LayerDetailView({ layer }: { layer: LayerData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(1200)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [pinnedTooltip, setPinnedTooltip] = useState<TooltipData | null>(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800)

  useEffect(() => {
    const updateDimensions = () => {
      setWindowWidth(window.innerWidth)
      setWindowHeight(window.innerHeight)
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const handleCompanyClick = useCallback((data: TooltipData) => {
    if (pinnedTooltip?.company.slug === data.company.slug) {
      setPinnedTooltip(null)
    } else {
      setPinnedTooltip(data)
    }
  }, [pinnedTooltip])

  const handleBackgroundClick = useCallback(() => {
    if (pinnedTooltip) {
      setPinnedTooltip(null)
    }
  }, [pinnedTooltip])

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
      <div className="px-12 flex items-center gap-4" style={{ paddingTop: SECTION_SPACING, paddingBottom: SECTION_SPACING }}>
          {/* Back link */}
          <Link
            href="/map"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back to Map</span>
          </Link>

          <div className="h-6 w-px bg-gray-300" />

          {/* Artemis Logo */}
          <img
            src="/artemis-logo.svg"
            alt="Artemis"
            className="h-10 w-10"
          />

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {layer.displayName} Layer
            </h1>
            <p className="text-gray-500 text-sm">
              {layer.totalCompanies} companies across {layer.categories.length} categories
            </p>
          </div>
      </div>

      {/* Categories grid */}
      <div ref={containerRef} className="px-12">
        {layer.categories.map((category, idx) => (
          <CategorySection
            key={idx}
            category={category}
            containerWidth={containerWidth - 96} // Account for px-12 padding
            onHover={setTooltip}
            onClick={handleCompanyClick}
            isPinned={!!pinnedTooltip}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-12 flex items-center justify-between"
        style={{ paddingTop: SECTION_SPACING, paddingBottom: SECTION_SPACING }}
      >
        <div className="text-xs text-gray-500">
          <div>Data as of: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</div>
        </div>

        <div className="flex items-center gap-2">
          <img
            src="/artemis-logo.svg"
            alt="Artemis"
            className="h-6 w-6"
          />
          <span className="font-semibold text-gray-700 text-sm">Artemis</span>
        </div>
      </div>
    </div>
  )
}
