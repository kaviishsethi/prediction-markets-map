'use client'

import { useState } from 'react'
import { MarketMap } from './MarketMap'
import type { CategoryWithProtocols } from '@/database/api'

type FilterType = 'all' | 'public' | 'private'

interface FilterableMarketMapProps {
  categories: Record<string, CategoryWithProtocols>
}

export function FilterableMarketMap({ categories }: FilterableMarketMapProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  // Filter protocols within each category
  const filteredCategories = Object.fromEntries(
    Object.entries(categories).map(([key, category]) => {
      if (filter === 'all') {
        return [key, category]
      }

      const filteredProtocols = category.protocols.filter((p) => {
        if (filter === 'public') return p.metadata.is_public
        if (filter === 'private') return !p.metadata.is_public
        return true
      })

      return [key, { ...category, protocols: filteredProtocols }]
    })
  )

  // Count unique companies for display
  const uniqueTotal = new Set(
    Object.values(categories).flatMap((cat) => cat.protocols.map((p) => p.protocol))
  ).size
  const uniqueFiltered = new Set(
    Object.values(filteredCategories).flatMap((cat) => cat.protocols.map((p) => p.protocol))
  ).size

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-sm text-gray-500 mr-2">Filter:</span>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filter === 'all'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('public')}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filter === 'public'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          Public
        </button>
        <button
          onClick={() => setFilter('private')}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            filter === 'private'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          Private
        </button>
        {filter !== 'all' && (
          <span className="text-sm text-gray-400 ml-2">
            ({uniqueFiltered} of {uniqueTotal})
          </span>
        )}
      </div>

      <MarketMap categories={filteredCategories} />
    </div>
  )
}
