'use client'
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
    <header className="relative w-full overflow-hidden">
      {/* Ambient video underlay — falls back to cream gradient if file missing */}
      <div className="absolute inset-0 -z-10">
        <video
          className="w-full h-full object-cover opacity-90"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src="/hero-loop.webm" type="video/webm" />
          <source src="/hero-loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/70 to-cream" />
      </div>

      <Confetti milestone={milestone} />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-24 pb-20 sm:pb-32">
        <div className="absolute right-4 sm:right-8 top-12 sm:top-20 pointer-events-none">
          <Ribbon size={180} rotation={14} bob />
        </div>

        <EyebrowPill showLiveDot className="mb-8">
          Live · Solana · 99% to research
        </EyebrowPill>

        <h1 className="leading-[0.85] tracking-[-0.05em]">
          <Wordmark size="xl" />
        </h1>

        <p className="mt-8 max-w-xl text-lg sm:text-xl text-ink-soft leading-snug">
          A memecoin with a heart of pink. Trade $BREAST and{' '}
          <b className="text-pink-700">99% of every fee</b> routes straight to the {CHARITY.name}, on-chain.
        </p>

        {/* Counter inline, no card wrapper — feels more cinematic */}
        <div className="mt-12 flex flex-col gap-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-pink-700">Raised live → NBCF</div>
          <div className="text-6xl sm:text-7xl lg:text-8xl font-black text-pink-900 leading-[0.9] tracking-[-0.04em]">
            <Counter value={usd} />
          </div>
          <div className="text-sm text-ink-soft mt-2">
            {count} distributions{rank ? ` · ranked #${rank} on pump.fun` : ''} · live
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={LINKS.pumpfun}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-700 px-6 py-4 text-white font-bold text-base transition-all hover:scale-[1.02] shadow-[var(--shadow-soft)]"
          >
            Trade $BREAST on pump.fun
            <span aria-hidden>↗</span>
          </a>
          <a
            href={LINKS.solscanToken}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-4 py-4 text-pink-700 hover:text-pink-900 font-bold"
          >
            Verify on Solscan ↗
          </a>
        </div>
      </div>
    </header>
  )
}
