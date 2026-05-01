'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatUsd } from '@/lib/formatUsd'
import type { StatsState } from '@/hooks/useStats'

interface FeedRow { id: string; usd: number; at: number }

interface Props {
  stats: StatsState | null
  previous: StatsState | null
}

export function FeeFeed({ stats, previous }: Props) {
  const [rows, setRows] = useState<FeedRow[]>([])

  useEffect(() => {
    if (!stats) return
    if (!previous) {
      setRows([{ id: stats.lastDonationAt, usd: stats.displayedUsd, at: Date.parse(stats.lastDonationAt) }])
      return
    }
    const delta = stats.displayedUsd - previous.displayedUsd
    const newCount = stats.donationCount - previous.donationCount
    if (newCount > 0 && delta > 0) {
      const id = stats.lastDonationAt + ':' + stats.donationCount
      setRows(prev => {
        if (prev.some(r => r.id === id)) return prev
        return [
          { id, usd: delta, at: Date.now() },
          ...prev,
        ].slice(0, 6)
      })
    }
  }, [stats, previous])

  if (rows.length === 0) {
    if (!stats) return null
    return (
      <ul className="space-y-2">
        <li className="flex items-center justify-between rounded-xl bg-white border border-[color:var(--rule)] px-4 py-3 shadow-[var(--shadow-soft)]">
          <span className="font-bold text-pink-900 tnum">latest distribution</span>
          <span className="text-xs text-ink-soft">{relativeTime(Date.parse(stats.lastDonationAt))}</span>
        </li>
      </ul>
    )
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {rows.map(r => (
          <motion.li
            key={r.id}
            layout
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-center justify-between rounded-xl bg-white border border-[color:var(--rule)] px-4 py-3 shadow-[var(--shadow-soft)]"
          >
            <span className="font-bold text-pink-900 tnum">+{formatUsd(r.usd)}</span>
            <span className="text-xs text-ink-soft">{relativeTime(r.at)}</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

function relativeTime(at: number): string {
  const s = Math.floor((Date.now() - at) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}
