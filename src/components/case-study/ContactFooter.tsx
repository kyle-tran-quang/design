import { motion } from 'motion/react'
import { contact } from '@/content/home'
import TextEffect from '@/components/motion/TextEffect'
import CharacterCutout from '../CharacterCutout'
import { contentFrame } from './frame'

// The case study footer in the original links to a different LinkedIn profile than the homepage.
const LINKEDIN = 'https://www.linkedin.com/in/minh-quang-t-3634b9220/'
// Framer hover on the footer links.
const LINK_HOVER = { scale: 1.05, transition: { type: 'spring', duration: 0.45, bounce: 0.25 } } as const

function ArrowRight() {
  // Phosphor "arrow-right" (regular), as used by the Framer footer.
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" className="size-12 shrink-0 lg:size-16">
      <path d="M221.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z" />
    </svg>
  )
}

/** Dark closing band shared by case study pages. */
export default function ContactFooter() {
  const behance = contact.socials.find((s) => s.label === 'Behance')?.href ?? ''
  const links = [
    { label: contact.email, href: `mailto:${contact.email}` },
    { label: 'Behance', href: behance },
    { label: 'LinkedIn', href: LINKEDIN },
  ]

  return (
    <footer className="flex min-h-[560px] items-center bg-graphite py-20 lg:h-[720px] lg:py-0">
      <div className={`${contentFrame} flex flex-1 flex-col items-center gap-24 lg:gap-[200px]`}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-14">
          {/* Turns orange on hover, as in the Framer footer. */}
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-5 text-snow transition-colors duration-[400ms] hover:text-accent"
          >
            <ArrowRight />
            <TextEffect
              as="h2"
              text="Let's get in touch!"
              preset="footerTagline"
              className="type-display"
            />
          </a>
          <CharacterCutout size={100} />
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 type-subtopic text-cloud">
          {links.map((link) => (
            <li key={link.label} className="flex items-center gap-3">
              <motion.a
                href={link.href}
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                whileHover={LINK_HOVER}
                className="inline-block"
              >
                {link.label}
              </motion.a>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-muted" />
            </li>
          ))}
          <li className="text-accent">{contact.copyright}</li>
        </ul>
      </div>
    </footer>
  )
}
