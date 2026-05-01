'use client'
import { Section } from './Section'
import { Wordmark } from './Wordmark'
import { Ribbon } from './Ribbon'
import { EyebrowPill } from './EyebrowPill'
import { Counter } from './Counter'
import { LINKS, CHARITY } from '@/lib/config'
import { useStats } from '@/hooks/useStats'
import { useMilestones } from '@/hooks/useMilestones'
import { Confetti } from './Confetti'
import type { StatsState } from '@/hooks/useStats'

interface Props { initial: StatsState | null }

export function Hero({ initial }: Props) {
  const { stats } = useStats(initial)
  const usd = stats?.displayedUsd ?? initial?.displayedUsd ?? 0
  const count = stats?.donationCount ?? initial?.donationCount ?? 0
  const rank = stats?.rank ?? initial?.rank
  const milestone = useMilestones(usd)

  return (
    <Section as="header" size="wide" className="relative pt-12 sm:pt-20 pb-16">
      <Confetti milestone={milestone} />
      <div className="absolute right-0 top-6 sm:top-10 hidden sm:block pointer-events-none">
        <Ribbon size={140} rotation={14} bob />
      </div>
      <EyebrowPill showLiveDot className="mb-6">
        Live · Solana · 99% to research
      </EyebrowPill>
      <Wordmark size="xl" />
      <p className="mt-6 max-w-2xl text-base sm:text-lg text-ink-soft leading-relaxed">
        A memecoin with a heart of pink. Every trade routes <b className="text-pink-700">99% of fees</b>{' '}
        to the {CHARITY.name}, on-chain, in real time.
      </p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-5 border border-[color:var(--rule)] shadow-[var(--shadow-soft)]">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">
              Raised — live
            </div>
            <div className="mt-1 text-3xl sm:text-4xl font-black text-pink-900 leading-none">
              <Counter value={usd} />
            </div>
            <div className="mt-2 text-xs text-ink-soft">
              {count} distributions{rank ? ` · ranked #${rank} on pump.fun` : ''}
            </div>
          </div>
          <span className="text-pink-500 text-sm font-bold">↑ live</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={LINKS.pumpfun}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-5 py-3 text-white font-bold hover:bg-pink-700 transition-colors"
        >
          Trade $BREAST on pump.fun
          <span aria-hidden>↗</span>
        </a>
        <a
          href={LINKS.solscanToken}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-4 py-3 text-pink-700 hover:text-pink-900 font-bold"
        >
          View on Solscan ↗
        </a>
      </div>
    </Section>
  )
}
