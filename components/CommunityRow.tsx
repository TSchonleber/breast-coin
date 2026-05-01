import { Section } from './Section'
import { SOCIAL, LINKS } from '@/lib/config'

interface IconLink { label: string; href: string }

export function CommunityRow() {
  const links: IconLink[] = [
    SOCIAL.twitter && { label: 'X', href: SOCIAL.twitter },
    SOCIAL.telegram && { label: 'Telegram', href: SOCIAL.telegram },
    { label: 'Pump.fun comments', href: LINKS.pumpfun },
    SOCIAL.github && { label: 'GitHub', href: SOCIAL.github },
  ].filter(Boolean) as IconLink[]

  if (links.length === 0) return null

  return (
    <Section className="py-12">
      <div className="flex flex-wrap gap-3 justify-center">
        {links.map(l => (
          <a
            key={l.label}
            href={l.href}
            target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-pink-50 px-5 py-2 text-pink-700 font-bold hover:bg-pink-500 hover:text-white transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
    </Section>
  )
}
