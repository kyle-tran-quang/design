import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, type Variants } from 'motion/react'
import { hero } from '@/content/home'
import { scrollToSection } from '@/hooks/useHorizontalScroll'
import { asset } from '@/lib/asset'
import FitText from './FitText'

/*
 * "Now at IBM Ireland" arrives with the name (NAME_START below): each word sharpens and rises in turn, with a short
 * beat before the company so it lands as the payoff, all within the name's rise.
 */
const ROLE_START = 0.05
const ROLE_STAGGER = 0.03
const COMPANY_BEAT = 0.05
const roleWord: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(8px)' },
  shown: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    // A leftover blur(0px) still costs a filter pass on every repaint; drop it once the word has settled.
    transitionEnd: { filter: 'none' },
    transition: {
      default: { type: 'spring', duration: 0.9, bounce: 0, delay },
      opacity: { duration: 0.5, ease: 'easeOut', delay },
    },
  }),
}

function RoleLine() {
  const reduced = useReducedMotion()
  const role = hero.currentRole.split(' ')
  const company = hero.currentCompany.split(' ')
  const word = (text: string, index: number, delay: number) => (
    <span key={index}>
      {index > 0 && ' '}
      <motion.span
        className="inline-block"
        variants={roleWord}
        custom={delay}
        initial={reduced ? false : 'hidden'}
        animate="shown"
      >
        {text}
      </motion.span>
    </span>
  )
  return (
    <>
      {role.map((text, i) => word(text, i, ROLE_START + i * ROLE_STAGGER))}{' '}
      <strong className="font-medium text-graphite">
        {company.map((text, i) => word(text, i, ROLE_START + (role.length + i) * ROLE_STAGGER + COMPANY_BEAT))}
      </strong>
    </>
  )
}

/*
 * The rest of the hero's entrance, around the role line above: the name rises out from behind the bottom rule
 * while the tagline sharpens in word by word alongside it (the same effect as the role line), its "since" line
 * last, landing by the time the name settles.
 */
const NAME_START = 0.05
const NAME_RISE = { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: NAME_START } as const
const TAGLINE_START = NAME_START
const TAGLINE_STAGGER = 0.012
const SINCE_BEAT = 0.04

function Tagline() {
  const reduced = useReducedMotion()
  const words = hero.tagline.split(' ')
  const initial = reduced ? false : 'hidden'
  return (
    <>
      {words.map((text, i) => (
        <span key={i}>
          {i > 0 && ' '}
          <motion.span
            className="inline-block"
            variants={roleWord}
            custom={TAGLINE_START + i * TAGLINE_STAGGER}
            initial={initial}
            animate="shown"
          >
            {text}
          </motion.span>
        </span>
      ))}
      <motion.span
        className="block text-muted"
        variants={roleWord}
        custom={TAGLINE_START + words.length * TAGLINE_STAGGER + SINCE_BEAT}
        initial={initial}
        animate="shown"
      >
        {hero.since}
      </motion.span>
    </>
  )
}

/**
 * Whether a webfont has loaded. Gives up after `timeout` ms (slow network, blocked font) so the text still shows,
 * in the fallback font.
 */
function useFontLoaded(font: string, timeout = 3000) {
  const [loaded, setLoaded] = useState(() => !('fonts' in document) || document.fonts.check(font))
  useEffect(() => {
    if (loaded) return
    let active = true
    const done = () => {
      if (active) setLoaded(true)
    }
    document.fonts.load(font).then(done, done)
    const timer = setTimeout(done, timeout)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [font, loaded, timeout])
  return loaded
}

/**
 * "KYLE TRAN" (sm and up): rises into view from the bottom rule. The clip leaves room for the glyphs' shading.
 * It waits, hidden, for Bungee Shade, so the first load never shows the fallback font swapping mid-rise.
 */
function NameReveal() {
  const reduced = useReducedMotion()
  const fontLoaded = useFontLoaded('16px "Bungee Shade"')
  return (
    <span className="hidden [clip-path:inset(-20%_-5%_0_-5%)] sm:block">
      <motion.span
        className="block"
        initial={reduced ? false : { y: '100%' }}
        animate={fontLoaded ? { y: 0 } : undefined}
        transition={NAME_RISE}
        style={fontLoaded ? undefined : { visibility: 'hidden' }}
      >
        <FitText text="KYLE TRAN" width={1240} letterSpacing={-4} className="block w-full" />
      </motion.span>
    </span>
  )
}

/*
 * The illustration drifts right as the hero scrolls away, trailing the page by DRIFT of the distance scrolled:
 * sideways on the horizontal track, off the top on smaller screens (where the drift is scaled to the hero's width).
 */
const DRIFT = 0.15

function useDriftOnLeave<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const x = useMotionValue(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    const section = ref.current?.closest('section')
    if (!section || reduced) {
      x.set(0)
      return
    }
    const update = () => {
      const rect = section.getBoundingClientRect()
      // The hero only ever leaves along one axis (left on the track, up when stacked); the other offset stays 0.
      const progress = Math.min(1, Math.max(0, -rect.left / rect.width, -rect.top / rect.height))
      x.set(progress * section.offsetWidth * DRIFT)
    }
    update()
    // Capture catches scrolls on the horizontal track as well as the page, since scroll events don't bubble.
    window.addEventListener('scroll', update, { capture: true, passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, { capture: true })
      window.removeEventListener('resize', update)
    }
  }, [reduced, x])
  return { ref, x }
}

export default function Hero() {
  const drift = useDriftOnLeave<HTMLAnchorElement>()
  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative flex min-h-dvh shrink-0 flex-col overflow-hidden bg-cloud px-6 pt-16 sm:px-10 lg:block lg:h-full lg:min-h-0 lg:w-[max(64rem,calc(100vw/var(--z)))] lg:px-20 lg:pt-0"
    >
      {/* Below lg the hero fills the screen: the name block centres in the space above the illustration. */}
      <div className="relative z-10 flex flex-1 flex-col justify-center lg:absolute lg:inset-x-20 lg:top-[calc(50%-7px)] lg:block lg:-translate-y-1/2">
        <p className="mb-8 max-w-[26rem] type-subtopic text-graphite lg:absolute lg:bottom-full lg:mb-[31px] lg:max-w-[31rem] lg:text-right">
          <Tagline />
        </p>

        <h1 className="border-y border-line py-5 text-accent sm:py-7 lg:py-[30px]">
          <span className="sr-only">Kyle Tran</span>
          <NameReveal />
          <span className="flex flex-col gap-3 sm:hidden">
            <FitText text="KYLE" width={600} letterSpacing={-4} className="w-full" />
            <FitText text="TRAN" width={600} letterSpacing={-4} className="w-full" />
          </span>
        </h1>

        <p className="mt-6 hidden type-subtopic text-muted sm:block lg:absolute lg:top-full lg:right-0 lg:mt-8">
          <RoleLine />
        </p>
      </div>

      <motion.a
        ref={drift.ref}
        style={{ x: drift.x }}
        href="#aboutme"
        onClick={(event) => {
          event.preventDefault()
          scrollToSection('aboutme')
        }}
        aria-label="Meet Kyle"
        className="group relative z-20 mx-auto mt-6 block h-[300px] w-[320px] shrink-0 lg:absolute lg:bottom-4 lg:left-1/2 lg:mt-0 lg:h-[400px] lg:w-[400px] lg:-translate-x-1/2"
      >
        <span className="absolute inset-x-[40px] bottom-0 h-[210px] rounded-t-full bg-mist transition-colors duration-500 group-hover:bg-[#dedede] lg:inset-x-[20px] lg:h-[246px]" />
        {/* The GIF has 13/500 of empty space under the feet; the negative offset plants them on the arch's bottom edge. */}
        <img
          src={asset('assets/images/home-hero-chibi-buro.gif')}
          alt=""
          width={500}
          height={500}
          fetchPriority="high"
          className="absolute -bottom-[7.5px] left-1/2 w-[290px] max-w-none -translate-x-[44%] transition-transform duration-500 ease-out group-hover:-translate-y-2 lg:-bottom-[10px] lg:w-[380px]"
        />
      </motion.a>
    </section>
  )
}
