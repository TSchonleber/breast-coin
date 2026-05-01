'use client'
import { useState } from 'react'
import { Section } from './Section'
import { CHARITY, LINKS } from '@/lib/config'

export function CharityBlock() {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(CHARITY.creditedAccount)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <Section className="py-16 sm:py-24">
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">The cause</h2>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
        <div className="sm:col-span-2 rounded-2xl bg-pink-50/75 backdrop-blur-xl border border-[color:var(--rule)] p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">Beneficiary</div>
          <h3 className="mt-2 text-2xl font-black text-pink-900 leading-tight">{CHARITY.name}</h3>
          <p className="mt-3 text-sm text-ink-soft leading-relaxed">
            NBCF funds early detection, education, and direct support for women in need. They have a four-star Charity Navigator rating
            and have been operating since 1991. All trade-fee distributions for $BREAST settle to the credited Solana account below
            and route through donate.gg's pipeline to NBCF.
          </p>
          <a
            href={CHARITY.website}
            target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-pink-700 hover:text-pink-900"
          >
            Visit nationalbreastcancer.org ↗
          </a>
        </div>

        <div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[color:var(--rule)] p-6 shadow-[var(--shadow-soft)]">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">Credited account</div>
          <code className="mt-2 block font-mono text-xs text-pink-900 break-all select-all">{CHARITY.creditedAccount}</code>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onCopy}
              className="rounded-full bg-pink-500 px-3 py-1 text-white text-xs font-bold hover:bg-pink-700 transition-colors"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            <a
              href={LINKS.solscanCharityAccount}
              target="_blank" rel="noopener noreferrer"
              className="rounded-full bg-pink-50 px-3 py-1 text-pink-700 text-xs font-bold hover:bg-pink-100 transition-colors"
            >
              View on Solscan ↗
            </a>
          </div>
        </div>
      </div>
    </Section>
  )
}
