'use client'

import Image from 'next/image'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { CATEGORY_DESCRIPTIONS } from '@/constants/categories'
import type { CategoryWithProtocols, ProtocolWithMetadata } from '@/database/api'

interface CategoryCardProps {
  category: CategoryWithProtocols
}

// Logos that contain the company name (hide text label)
const LOGO_CONTAINS_NAME: string[] = []

function ProtocolChip({ protocol }: { protocol: ProtocolWithMetadata }) {
  const { metadata, description } = protocol
  const showName = !LOGO_CONTAINS_NAME.includes(metadata.protocol)

  const chip = (
    <a
      href={metadata.website || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 border border-gray-300 px-1 rounded-sm bg-white hover:bg-gray-50 transition-colors"
    >
      {metadata.logo && (
        <Image
          src={metadata.logo}
          alt={metadata.name}
          width={20}
          height={20}
          className="rounded-sm object-cover"
          unoptimized
        />
      )}
      {showName && <span className="text-sm whitespace-nowrap">{metadata.name}</span>}
    </a>
  )

  if (!description) return chip

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>{chip}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-3">
          {metadata.logo && (
            <Image
              src={metadata.logo}
              alt={metadata.name}
              width={40}
              height={40}
              className="rounded-md object-cover"
              unoptimized
            />
          )}
          <div>
            <h4 className="font-semibold">
              {metadata.name}
              {metadata.ticker && (
                <span className="text-muted-foreground font-normal ml-1">
                  (${metadata.ticker})
                </span>
              )}
            </h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function CategoryCard({ category }: CategoryCardProps) {
  const description = CATEGORY_DESCRIPTIONS[category.category]
  const protocolCount = category.protocols.length

  const header = (
    <div className="flex items-center gap-2 mb-2">
      <p className="text-[#6B7280] font-bold tracking-wide uppercase text-sm">
        {category.label}
      </p>
      <p className="text-[#9CA3AF] font-normal text-sm">({protocolCount})</p>
    </div>
  )

  return (
    <div className="bg-gray-50 rounded-lg p-4 h-full">
      {description ? (
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div className="cursor-help">{header}</div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <p className="text-sm">{description}</p>
          </HoverCardContent>
        </HoverCard>
      ) : (
        header
      )}

      <div className="flex flex-wrap gap-1.5">
        {category.protocols.map((protocol) => (
          <ProtocolChip key={`${protocol.protocol}-${protocol.category}`} protocol={protocol} />
        ))}
        {protocolCount === 0 && (
          <p className="text-sm text-muted-foreground italic">No companies yet</p>
        )}
      </div>
    </div>
  )
}
