'use client'
import { motion } from 'framer-motion'
import { Section } from './Section'
import { LINKS } from '@/lib/config'

const STEPS = [
  { n: '01', title: 'Trade $BREAST',        copy: 'Buy or sell $BREAST on pump.fun.' },
  { n: '02', title: 'Pump.fun fee',         copy: 'Every trade has a small standard fee.' },
  { n: '03', title: '99% routed via donate.gg', copy: 'On-chain, automatically — no middlemen.' },
  { n: '04', title: 'Funds land at NBCF',   copy: 'Settled to the credited Solana account, then to NBCF.' },
] as const

export function HowItWorks() {
  return (
    <Section size="wide" className="py-16 sm:py-24">
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">How it works</h2>
      <p className="mt-2 text-ink-soft">Trading is the giving. Here's the full loop, end-to-end.</p>

      <ol className="mt-10 grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            className="rounded-2xl bg-white p-5 border border-[color:var(--rule)]"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-pink-700">Step {s.n}</div>
            <div className="mt-2 text-lg font-black text-ink leading-tight">{s.title}</div>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">{s.copy}</p>
          </motion.li>
        ))}
      </ol>

      <div className="mt-8">
        <a
          href={LINKS.solscanCharityAccount}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-bold text-pink-700 hover:text-pink-900"
        >
          Verify on Solscan ↗
        </a>
      </div>
    </Section>
  )
}
