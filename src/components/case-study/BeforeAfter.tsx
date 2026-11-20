import type { ReactNode } from 'react'
import Reveal from '@/components/motion/Reveal'

type Shot = {
  image: string
  /** Wider renditions of `image`, so retina screens get a sharp file. */
  srcSet?: string
  text: string
}

type BeforeAfterProps = {
  title: string
  before: Shot
  after: Shot
  /** Image size on desktop: a full column (488) or the slightly smaller 468 used once in the original. */
  size?: 488 | 468
  /** Pop each panel in as it scrolls into view. Off in the story panel, where the pair should simply be there. */
  animate?: boolean
}

/**
 * The image's width cap applies only when the pair is 2-up. Stacked (as in the story panel) it fills its column, so it lines up with
 * every other image there instead of sitting inset on both sides. Written out in full so Tailwind can see the classes.
 */
const CAP = { 488: '@xl:max-w-[488px]', 468: '@xl:max-w-[468px]' } as const

function Panel({ label, shot, size, emphasis }: { label: string; shot: Shot; size: 488 | 468; emphasis: boolean }) {
  return (
    <figure className={`w-full ${CAP[size]}`}>
      <img
        src={shot.image}
        srcSet={shot.srcSet}
        // A full column when 2-up; otherwise as wide as the container, which the story panel caps near 510px.
        sizes={`(min-width: 640px) ${size}px, calc(100vw - 48px)`}
        alt=""
        loading="lazy"
        className="aspect-square w-full rounded-lg bg-white object-cover"
      />
      <figcaption className={`mt-10 type-caption ${emphasis ? 'text-ink' : 'text-dim'} ${size === 488 ? 'max-w-[342px]' : 'max-w-[328px]'}`}>
        <strong className="block font-bold">{label}</strong>
        {shot.text}
      </figcaption>
    </figure>
  )
}

/** A panel's wrapper: the scroll-in pop, or a plain div when animation is off. */
function Slot({ animate, className, children }: { animate: boolean; className?: string; children: ReactNode }) {
  if (!animate) return <div className={className}>{children}</div>
  return (
    <Reveal preset="pop" className={className}>
      {children}
    </Reveal>
  )
}

/**
 * A design decision shown as a before/after pair; "after" sits 48px lower.
 * Each panel pops in whenever it scrolls into view (Framer appear effect, replays), unless `animate={false}`.
 */
export default function BeforeAfter({ title, before, after, size = 488, animate = true }: BeforeAfterProps) {
  return (
    <section className="@container">
      <h4 className="type-subtopic">{title}</h4>
      <div className="mt-8 grid gap-12 @xl:grid-cols-2 @xl:gap-6">
        <Slot animate={animate} className={size === 468 ? '@xl:pl-5' : undefined}>
          <Panel label="Before:" shot={before} size={size} emphasis={false} />
        </Slot>
        <Slot animate={animate} className="@xl:pt-12">
          <Panel label="After:" shot={after} size={size} emphasis />
        </Slot>
      </div>
    </section>
  )
}
