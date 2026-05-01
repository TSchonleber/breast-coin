'use client'
import { useMemo } from 'react'
import { useSnapshots } from '@/hooks/useSnapshots'
import { formatUsdCompact } from '@/lib/formatUsd'

const W = 600
const H = 180
const PAD = 24

export function TrackerChart() {
  const snapshots = useSnapshots()

  const path = useMemo(() => {
    if (snapshots.length === 0) return null
    const xs = snapshots.map(s => s.t)
    const ys = snapshots.map(s => s.usd)
    const xMin = Math.min(...xs)
    const xMax = Math.max(...xs)
    const yMin = 0
    const yMax = Math.max(...ys, 1)
    const sx = (x: number) => PAD + ((x - xMin) / Math.max(1, xMax - xMin)) * (W - PAD * 2)
    const sy = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - PAD * 2)
    const d = snapshots
      .map((s, i) => `${i === 0 ? 'M' : 'L'} ${sx(s.t).toFixed(1)} ${sy(s.usd).toFixed(1)}`)
      .join(' ')
    return { d, yMax, yMin }
  }, [snapshots])

  if (!path) {
    return (
      <div className="rounded-2xl bg-pink-50/75 backdrop-blur-xl border border-[color:var(--rule)] p-6 text-sm text-ink-soft">
        Chart will populate after the first snapshot.
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[color:var(--rule)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">14-day raise</div>
        <div className="text-xs text-ink-soft">peak {formatUsdCompact(path.yMax)}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cumulative raised over 14 days">
        <defs>
          <linearGradient id="trackerFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-pink-500)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-pink-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path.d} L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`} fill="url(#trackerFill)" />
        <path d={path.d} fill="none" stroke="var(--color-pink-500)" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
