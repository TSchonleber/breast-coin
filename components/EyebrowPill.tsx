import { type ReactNode } from 'react'
import { LiveDot } from './LiveDot'

interface Props {
  showLiveDot?: boolean
  children: ReactNode
  className?: string
}

export function EyebrowPill({ showLiveDot = false, children, className = '' }: Props) {
  return (
    <span
      className={
        'inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-pink-700 ' +
        'text-[10.5px] font-bold uppercase tracking-[0.08em] ' +
        className
      }
    >
      {showLiveDot && <LiveDot />}
      {children}
    </span>
  )
}
