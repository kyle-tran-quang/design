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
}

function Panel({ label, shot, size, emphasis }: { label: string; shot: Shot; size: number; emphasis: boolean }) {
  return (
    <figure style={{ maxWidth: size }} className="w-full">
      <img
        src={shot.image}
        srcSet={shot.srcSet}
        // A full column from the 2-up breakpoint; the content width (viewport less its 24px sides) below it.
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

/**
 * A design decision shown as a before/after pair; "after" sits 48px lower.
 * Each panel pops in whenever it scrolls into view (Framer appear effect, replays).
 */
export default function BeforeAfter({ title, before, after, size = 488 }: BeforeAfterProps) {
  return (
    <section>
      <h4 className="type-subtopic">{title}</h4>
      <div className="mt-8 grid gap-12 sm:grid-cols-2 sm:gap-6">
        <Reveal preset="pop" className={size === 468 ? 'lg:pl-5' : undefined}>
          <Panel label="Before:" shot={before} size={size} emphasis={false} />
        </Reveal>
        <Reveal preset="pop" className="sm:pt-12">
          <Panel label="After:" shot={after} size={size} emphasis />
        </Reveal>
      </div>
    </section>
  )
}
