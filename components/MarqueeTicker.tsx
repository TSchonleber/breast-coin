'use client'
import { motion } from 'framer-motion'
import { formatUsd } from '@/lib/formatUsd'
import { TOKEN, CHARITY } from '@/lib/config'
import type { StatsState } from '@/hooks/useStats'

interface Props { stats: StatsState | null }

export function MarqueeTicker({ stats }: Props) {
  const items = [
    `$${TOKEN.symbol} live`,
    stats ? `${formatUsd(stats.displayedUsd)} raised` : 'loading',
    `99% of trade fees → ${CHARITY.shortName}`,
    stats ? `${stats.donationCount} distributions` : '',
    stats?.rank ? `#${stats.rank} on donate.gg` : '',
    'Solana · SPL Token-2022',
    'on-chain · verifiable',
  ].filter(Boolean)

  // Duplicate list so the loop is seamless
  const loopItems = [...items, ...items, ...items]

  return (
    <div className="w-full bg-pink-900 text-pink-50 overflow-hidden border-b border-[color:var(--rule)]">
      <motion.div
        className="flex gap-12 py-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em]"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        {loopItems.map((item, i) => (
          <span key={i} className="flex items-center gap-12">
            <span>{item}</span>
            <span className="text-pink-500" aria-hidden>♥</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
