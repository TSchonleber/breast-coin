import { Fragment } from 'react'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  inline?: boolean
  className?: string
}

const sizes = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-7xl sm:text-8xl',
} as const

export function Wordmark({ size = 'lg', inline = false, className = '' }: Props) {
  return (
    <span
      className={
        `${sizes[size]} font-black leading-[0.95] tracking-[-0.04em] text-ink ${className}`
      }
    >
      Breast<span className="text-pink-500">.</span>{inline ? <Fragment /> : <br />}coin
    </span>
  )
}
