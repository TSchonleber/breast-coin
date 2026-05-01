'use client'
import { useState } from 'react'
import { Section } from './Section'
import { TOKEN, LINKS } from '@/lib/config'

const EXTERNAL = [
  { label: 'Pump.fun',     href: LINKS.pumpfun },
  { label: 'Solscan',      href: LINKS.solscanToken },
  { label: 'Jupiter',      href: LINKS.jupiter },
  { label: 'Birdeye',      href: LINKS.birdeye },
  { label: 'DexScreener',  href: LINKS.dexscreener },
] as const

export function TokenBlock() {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(TOKEN.mint)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <Section className="py-16 sm:py-24">
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">The token</h2>

      <div className="mt-8 rounded-2xl bg-white/85 backdrop-blur-xl border border-[color:var(--rule)] p-6 shadow-[var(--shadow-soft)]">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">Contract address</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="font-mono text-sm sm:text-base text-pink-900 break-all select-all">{TOKEN.mint}</code>
          <button
            onClick={onCopy}
            className="rounded-full bg-pink-500 px-3 py-1 text-white text-xs font-bold hover:bg-pink-700 transition-colors"
            aria-label="Copy contract address"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><dt className="text-[10px] uppercase tracking-[0.14em] text-pink-700">Symbol</dt><dd className="font-bold">${TOKEN.symbol}</dd></div>
          <div><dt className="text-[10px] uppercase tracking-[0.14em] text-pink-700">Decimals</dt><dd className="font-bold">{TOKEN.decimals}</dd></div>
          <div><dt className="text-[10px] uppercase tracking-[0.14em] text-pink-700">Standard</dt><dd className="font-bold">{TOKEN.standard}</dd></div>
          <div><dt className="text-[10px] uppercase tracking-[0.14em] text-pink-700">Chain</dt><dd className="font-bold capitalize">{TOKEN.chain}</dd></div>
        </dl>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {EXTERNAL.map(l => (
          <a
            key={l.label}
            href={l.href}
            target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-pink-50 px-4 py-2 text-pink-700 text-sm font-bold hover:bg-pink-500 hover:text-white transition-colors"
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </Section>
  )
}
