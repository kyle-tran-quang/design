import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import TextEffect from '@/components/motion/TextEffect'
import { entranceProps } from '@/components/motion/presets'
import { contentFrame } from './frame'

type CaseStudyHeroProps = {
  title: string
  summary: string
  /** The hero image. Leave it out when `art` is given. */
  image?: string
  /**
   * Built art in place of the image: the same rounded band and entrance. Tablet and desktop keep the image's
   * 360 / 476px; on phones the band keeps a 358:260 shape from 260px up to 330px tall, so art laid out for a 358px
   * phone column keeps its margins on larger phones.
   */
  art?: ReactNode
  /** A taller desktop band for `art` (600px instead of 476px), for a composition that wants more room. Phones and
   * tablets are unchanged. */
  tallArt?: boolean
  role: string
  timeline: string
  /** Label above `timeline`, e.g. "Year" when only the year is given. */
  timelineLabel?: string
  /** Starts the appear effects. Defaults to on load; a page with an intro can hold them until it ends. */
  play?: boolean
}

// Framer appear effects on the hero (values from the export).
const IMAGE_FROM = { opacity: 0.001, y: -150 }
const IMAGE_TRANSITION = { type: 'spring', duration: 0.7, bounce: 0.1 } as const
const META_FROM = { opacity: 0.001, scale: 0.9, y: -32 }
const META_TRANSITION = { type: 'spring', duration: 0.5, bounce: 0.2, delay: 1.2 } as const

function MetaItem({ label, value, align, play, hold }: { label: string; value: string; align: 'left' | 'right'; play: boolean; hold: boolean }) {
  const pop = entranceProps(META_FROM, play, hold)
  return (
    <div className={align === 'right' ? 'text-right' : undefined}>
      <motion.dt {...pop} transition={META_TRANSITION} className="text-muted">
        <TextEffect text={label} preset="heroMeta" play={play} hold={hold} />
      </motion.dt>
      <motion.dd {...pop} transition={META_TRANSITION} className="text-graphite">
        <TextEffect text={value} preset="heroMeta" play={play} hold={hold} />
      </motion.dd>
    </div>
  )
}

export default function CaseStudyHero({
  title,
  summary,
  image,
  art,
  tallArt = false,
  role,
  timeline,
  timelineLabel = 'Timeline',
  play = true,
}: CaseStudyHeroProps) {
  // Framer appear effects, all played on load (or once `play` turns true).
  const text = { play, hold: false }

  return (
    // `data-case-study-hero`: SectionNav stays hidden until this frame has scrolled out of view.
    <header data-case-study-hero className="bg-cloud pt-20 pb-14 lg:pt-[100px] lg:pb-20">
      {/* The image runs wider than the text: 16px from the edges on phones and tablets, 24px on desktop. */}
      <div className="px-4 lg:px-6">
        {art ? (
          <motion.div
            initial={IMAGE_FROM}
            animate={play ? { opacity: 1, y: 0 } : IMAGE_FROM}
            transition={IMAGE_TRANSITION}
            className={`relative h-[clamp(260px,calc((100vw-32px)*260/358),330px)] w-full overflow-hidden rounded-[20px] bg-snow sm:h-[360px] ${
              tallArt ? 'lg:h-[600px]' : 'lg:h-[476px]'
            }`}
          >
            {art}
          </motion.div>
        ) : (
          <motion.img
            src={image}
            alt=""
            width={1392}
            height={476}
            fetchPriority="high"
            initial={IMAGE_FROM}
            animate={play ? { opacity: 1, y: 0 } : IMAGE_FROM}
            transition={IMAGE_TRANSITION}
            className="h-[260px] w-full rounded-[20px] bg-snow object-cover sm:h-[360px] lg:h-[476px]"
          />
        )}
      </div>
      {/* Title beside the description from the 810px tablet breakpoint; stacked on phones. Role/Year sit at the
          bottom of the description column, level with the bottom of the title (32px minimum gap). The text uses
          the plain content frame so it lines up with the sections below. Below 1200px the frame is narrower than
          1000px, so the description column gives way to the title's longest word instead of overflowing. */}
      <div
        className={`${contentFrame} mt-10 grid gap-8 min-[810px]:grid-cols-2 min-[810px]:gap-x-16 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-x-[100px]`}
      >
        <TextEffect
          as="h1"
          text={title}
          preset="heroTitle"
          {...text}
          className="font-plex-mono text-[2.75rem] leading-none font-light tracking-[-0.05em] text-graphite italic sm:text-[3.5rem] min-[810px]:text-[2.75rem] lg:text-[4.25rem]"
        />
        <div className="flex min-w-0 flex-col justify-between gap-8">
          <TextEffect
            as="p"
            text={summary}
            preset="heroSummary"
            trigger="inView"
            {...text}
            className="type-subtopic text-muted min-[810px]:mt-2"
          />
          <dl className="flex justify-between gap-6 type-small">
            <MetaItem label="Role" value={role} align="left" {...text} />
            <MetaItem label={timelineLabel} value={timeline} align="right" {...text} />
          </dl>
        </div>
      </div>
    </header>
  )
}
