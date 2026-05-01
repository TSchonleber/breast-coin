'use client'
import { Section } from './Section'
import { Counter } from './Counter'
import { FeeFeed } from './FeeFeed'
import { TrackerChart } from './TrackerChart'
import { EyebrowPill } from './EyebrowPill'
import { useStats, type StatsState } from '@/hooks/useStats'

interface Props { initial: StatsState | null }

export function LiveTracker({ initial }: Props) {
  const { stats, previous } = useStats(initial)
  const usd = stats?.displayedUsd ?? 0
  const count = stats?.donationCount ?? 0
  const rank = stats?.rank
  const firstAt = stats?.firstDonationAt ? new Date(stats.firstDonationAt) : null
  const lastAt = stats?.lastDonationAt ? new Date(stats.lastDonationAt) : null

  return (
    <Section size="wide" className="py-16 sm:py-24">
      <EyebrowPill showLiveDot className="mb-3">Live tracker</EyebrowPill>
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Every fee, on the block.</h2>
      <p className="mt-2 text-ink-soft max-w-xl">
        The cumulative number is sourced from donate.gg every 30s. New trade-fee distributions appear in the feed as they confirm.
      </p>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[color:var(--rule)] p-6 shadow-[var(--shadow-soft)]">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">Total raised</div>
          <div className="mt-2 text-5xl sm:text-6xl font-black text-pink-900 leading-none">
            <Counter value={usd} />
          </div>
          <div className="mt-3 text-sm text-ink-soft">
            {count} distributions{rank ? ` · ranked #${rank}` : ''}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink-soft">
            {firstAt && <div><b className="text-pink-700">First</b> · {firstAt.toLocaleDateString()}</div>}
            {lastAt && <div><b className="text-pink-700">Latest</b> · {lastAt.toLocaleString()}</div>}
          </div>
        </div>

        <div>
          <FeeFeed stats={stats} previous={previous} />
        </div>
      </div>

      <div className="mt-6">
        <TrackerChart />
      </div>
    </Section>
  )
}
