import { Section } from './Section'
import { Wordmark } from './Wordmark'
import { CHARITY } from '@/lib/config'

export function Footer() {
  return (
    <Section as="footer" className="py-12 border-t border-[color:var(--rule)] mt-12">
      <div className="flex flex-col sm:flex-row gap-6 sm:items-end sm:justify-between">
        <div>
          <Wordmark size="sm" inline />
          <p className="mt-2 text-xs text-ink-soft max-w-md">
            © {new Date().getFullYear()} Breast.coin · all proceeds to {CHARITY.shortName}.
          </p>
        </div>
        <p className="text-[11px] text-ink-soft max-w-md leading-relaxed">
          Memecoins are volatile. This is not financial advice. Live numbers come from donate.gg's
          public charity-coins data; we display, we don't custody. Trades execute on pump.fun. Built on Solana.
        </p>
      </div>
    </Section>
  )
}
