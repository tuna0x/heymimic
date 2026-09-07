import { Link } from 'react-router-dom'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  to?: string
  className?: string
  onClick?: () => void
}

export function BrandGlyph({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative rounded-lg bg-study-primary text-white flex items-center justify-center shadow-xs shrink-0 select-none"
    >
      {/* Clean, minimalist audio resonance glyph */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 14V10" />
        <path d="M8 17V7" />
        <path d="M12 20V4" />
        <path d="M16 17V7" />
        <path d="M20 14V10" />
      </svg>
    </div>
  )
}

export function BrandLogo({
  size = 'md',
  to = '/',
  className = '',
  onClick,
}: BrandLogoProps) {
  const glyphSize = {
    sm: 24,
    md: 28,
    lg: 34,
  }[size]

  const textStyles = {
    sm: 'text-sm font-semibold tracking-tight',
    md: 'text-base font-semibold tracking-tight',
    lg: 'text-xl font-bold tracking-tight',
  }[size]

  const Content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <BrandGlyph size={glyphSize} />
      <span className={`font-display text-study-text ${textStyles}`}>
        hey<span className="text-study-primary font-bold">mimic</span>
      </span>
    </div>
  )

  if (to) {
    return (
      <Link to={to} onClick={onClick} className="inline-flex items-center">
        {Content}
      </Link>
    )
  }

  return (
    <div onClick={onClick} role="button" tabIndex={0}>
      {Content}
    </div>
  )
}
