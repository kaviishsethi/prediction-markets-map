import Link from 'next/link'

interface ArtemisLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
}

const sizes = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

const textSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

export default function ArtemisLogo({
  size = 'md',
  showText = true,
  href = '/'
}: ArtemisLogoProps) {
  const content = (
    <div className="flex items-center gap-2">
      <img
        src="/artemis-logo.svg"
        alt="Artemis"
        className={sizes[size]}
      />
      {showText && (
        <span className={`${textSizes[size]} font-bold text-gray-900`}>
          Artemis
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
