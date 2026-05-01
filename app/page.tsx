import { Hero } from '@/components/Hero'
import { WhyThisExists } from '@/components/WhyThisExists'
import { HowItWorks } from '@/components/HowItWorks'
import { LiveTracker } from '@/components/LiveTracker'
import { TokenBlock } from '@/components/TokenBlock'
import { CharityBlock } from '@/components/CharityBlock'
import { CommunityRow } from '@/components/CommunityRow'
import { Footer } from '@/components/Footer'
import { TOKEN, DONATE_GG } from '@/lib/config'
import { parseDonateGgRsc } from '@/lib/parseDonateGgRsc'
import type { StatsState } from '@/hooks/useStats'

export const revalidate = 30

async function loadInitialStats(): Promise<StatsState | null> {
  try {
    const res = await fetch(DONATE_GG.rscUrl, {
      headers: { RSC: '1', 'User-Agent': 'breast-coin/1.0 (+https://breast-coin.vercel.app)' },
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    const text = await res.text()
    const parsed = parseDonateGgRsc(text, TOKEN.mint)
    if (!parsed) return null
    return { ...parsed, fetchedAt: new Date().toISOString() }
  } catch {
    return null
  }
}

export default async function Home() {
  const initial = await loadInitialStats()
  return (
    <main>
      <Hero initial={initial} />
      <WhyThisExists />
      <HowItWorks />
      <LiveTracker initial={initial} />
      <TokenBlock />
      <CharityBlock />
      <CommunityRow />
      <Footer />
    </main>
  )
}
