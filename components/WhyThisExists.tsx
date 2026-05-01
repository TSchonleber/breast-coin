import { Section } from './Section'

const CARDS = [
  { label: 'The stat',      title: '1 in 8',                copy: 'Women diagnosed with breast cancer in their lifetime, in the US alone.' },
  { label: 'The cause',     title: 'NBCF',                  copy: 'The National Breast Cancer Foundation funds early detection, education, and direct support for women in need.' },
  { label: 'The mechanic',  title: 'Volume → research',     copy: 'Memecoins move volume. Volume moves dollars. We turned that loop into a research pipeline.' },
] as const

export function WhyThisExists() {
  return (
    <Section className="py-16 sm:py-24">
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Why this exists</h2>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {CARDS.map(c => (
          <div
            key={c.label}
            className="rounded-2xl bg-pink-50/75 backdrop-blur-xl p-6 border border-[color:var(--rule)]"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-pink-700">{c.label}</div>
            <div className="mt-2 text-2xl font-black text-pink-900 tracking-tight">{c.title}</div>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed">{c.copy}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
