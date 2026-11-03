import { motion, useReducedMotion, type TargetAndTransition } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { about, contact } from '@/content/home'
import { scrollToSection } from '@/hooks/useHorizontalScroll'
import { asset } from '@/lib/asset'
import CharacterCutout from '../CharacterCutout'
import { ArrowLeftIcon } from '../icons'
import Draggable from './Draggable'

/*
 * "Tossed cards": both cards start squared up together, as if still in the deck,
 * then slide out one after the other and settle into their fanned positions.
 */
const DRAW_EASE = [0.22, 1, 0.36, 1] as const
const deck: Record<'about' | 'contact', TargetAndTransition> = {
  about: { opacity: 0, x: 120, y: 140, rotate: 6, scale: 0.96 },
  contact: { opacity: 0, x: -110, y: 80, rotate: -5, scale: 0.96 },
}
const dealt: TargetAndTransition = { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }

function DrawnCard({
  card,
  delay,
  children,
}: {
  card: keyof typeof deck
  delay: number
  children: ReactNode
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? false : deck[card]}
      whileInView={dealt}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        default: { duration: 1.4, ease: DRAW_EASE, delay },
        opacity: { duration: 0.6, ease: 'easeOut', delay },
      }}
    >
      {children}
    </motion.div>
  )
}

function Label({ children, tone }: { children: string; tone: 'light' | 'dark' }) {
  return <p className={`type-label ${tone === 'dark' ? 'text-white/50' : 'text-black/50'}`}>{children}</p>
}

function AboutCard() {
  return (
    <div className="relative h-[235px] w-full max-w-[358px] -rotate-2 overflow-hidden rounded-2xl bg-mist p-8 shadow-[0_20px_40px_-24px_rgb(0_0_0/0.5)]">
      <h2 className="type-topic text-[#181818]">More about me</h2>
      <dl className="mt-9 grid grid-cols-[1fr_auto] gap-x-6 gap-y-[22px] pr-6">
        {about.facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-1">
            <dt className="type-label text-black/50">{fact.label}</dt>
            <dd className="type-small text-black">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <img
        src={asset('assets/images/shared-footer-about-me-card.png')}
        alt=""
        width={800}
        height={800}
        loading="lazy"
        className="absolute bottom-0 left-[44%] w-[100px] -translate-x-1/2"
      />
    </div>
  )
}

function ContactCard() {
  const [linkedIn, behance, instagram] = contact.socials
  const linkClass = 'text-snow decoration-accent decoration-1 underline-offset-4 hover:underline'
  return (
    <div className="h-[255px] w-full max-w-[362px] rotate-3 rounded-2xl bg-ink p-8 text-snow shadow-[0_24px_48px_-24px_rgb(0_0_0/0.7)]">
      <h2 className="type-topic text-white">Let’s get in touch!</h2>
      <div className="mt-6 flex flex-col gap-1">
        <Label tone="dark">Drop me a line:</Label>
        <a href={`mailto:${contact.email}`} className={`type-small ${linkClass}`}>
          {contact.email}
        </a>
      </div>
      <div className="mt-[22px] grid grid-cols-[1fr_auto] items-end gap-x-6">
        <div className="flex flex-col gap-1">
          <Label tone="dark">Life, work & stuff:</Label>
          <a href={linkedIn.href} target="_blank" rel="noreferrer" className={`type-small ${linkClass}`}>
            {linkedIn.label}
          </a>
          <a href={behance.href} target="_blank" rel="noreferrer" className={`type-small ${linkClass}`}>
            {behance.label}
          </a>
        </div>
        <div className="flex flex-col gap-1 pr-6">
          <a href={instagram.href} target="_blank" rel="noreferrer" className={`type-small ${linkClass}`}>
            {instagram.label}
          </a>
          <p className="type-small text-accent">{contact.copyright}</p>
        </div>
      </div>
    </div>
  )
}

export default function Contact() {
  const panelRef = useRef<HTMLDivElement>(null)
  return (
    <footer id="contact" className="flex shrink-0 flex-col lg:h-full lg:flex-row">
      <div
        ref={panelRef}
        className="relative flex flex-col items-center gap-10 overflow-hidden bg-graphite px-6 py-20 sm:px-10 lg:block lg:h-full lg:w-[1000px] lg:p-0"
      >
        {/* Cards are placed on a 1000×900 stage that stays centred as the viewport height changes.
            On desktop the cards and the character can be dragged around the panel. */}
        <div className="contents lg:absolute lg:inset-x-0 lg:top-1/2 lg:block lg:h-[900px] lg:-translate-y-1/2">
          <Draggable bounds={panelRef} className="w-full max-w-[358px] lg:absolute lg:top-[206px] lg:left-[181px]">
            <DrawnCard card="about" delay={0}>
              <AboutCard />
            </DrawnCard>
          </Draggable>
          <Draggable bounds={panelRef} className="w-full max-w-[362px] lg:absolute lg:top-[359px] lg:left-[499px]">
            <DrawnCard card="contact" delay={0.3}>
              <ContactCard />
            </DrawnCard>
          </Draggable>
          <Draggable bounds={panelRef} className="lg:absolute lg:top-[563px] lg:left-[302px]">
            <CharacterCutout size={150} />
          </Draggable>
        </div>
      </div>

      <a
        href="#hero"
        onClick={(event) => {
          event.preventDefault()
          scrollToSection('hero')
        }}
        className="group flex flex-col justify-center bg-accent px-6 py-20 text-white sm:px-10 lg:h-full lg:w-[572px] lg:px-20 lg:py-0"
      >
        <ArrowLeftIcon className="size-12 transition-transform duration-300 ease-out group-hover:-translate-x-2 max-lg:rotate-90 max-lg:group-hover:translate-x-0 max-lg:group-hover:-translate-y-2" />
        <span className="mt-4 type-display">
          or…back to
          <strong className="block font-medium">beginning.</strong>
        </span>
      </a>
    </footer>
  )
}
