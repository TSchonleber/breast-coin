interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** No longer changes layout — kept for backwards compatibility. */
  inline?: boolean
  className?: string
}

const sizes = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-6xl sm:text-7xl lg:text-8xl',
} as const

export function Wordmark({ size = 'lg', className = '' }: Props) {
  return (
    <span
      className={
        `${sizes[size]} font-black leading-[0.95] tracking-[-0.04em] text-ink ${className}`
      }
    >
      Breast<span className="text-pink-500">coin</span>
    </span>
  )
}
