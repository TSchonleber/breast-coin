import { type ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  caption?: ReactNode
  className?: string
}

export function StatCard({ label, value, caption, className = '' }: Props) {
  return (
    <div
      className={
        'rounded-2xl bg-white p-5 sm:p-6 ' +
        'border border-[color:var(--rule)] shadow-[var(--shadow-soft)] ' +
        className
      }
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">
        {label}
      </div>
      <div className="mt-1 text-3xl sm:text-4xl font-black text-pink-900 leading-none tnum">
        {value}
      </div>
      {caption && <div className="mt-2 text-xs text-ink-soft">{caption}</div>}
    </div>
  )
}
