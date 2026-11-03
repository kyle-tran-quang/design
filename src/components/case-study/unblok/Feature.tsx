import type { ReactNode } from 'react'
import AutoplayVideo from '@/components/AutoplayVideo'
import Reveal from '@/components/motion/Reveal'
import { readingFrame } from '@/components/case-study/frame'

type FeatureProps = {
  /** Anchor for the section nav; on the row, not the pinned title. */
  id?: string
  step: number
  title: string
  video: string
  /** Describes what the clip shows, for screen readers. */
  videoLabel: string
  /** Square corners on the clip, where the design frames it edge to edge. */
  squareVideo?: boolean
  /** Follows the explanation in the content column, e.g. a supporting image and more copy. */
  after?: ReactNode
  children: ReactNode
}

/**
 * One step of the Unblok flow. Mobile stacks the clip, the numbered title and the explanation. Desktop puts the
 * title in a 300px column that stays pinned while the clip and explanation scroll past in the column beside it.
 */
export default function Feature({
  id,
  step,
  title,
  video,
  videoLabel,
  squareVideo = false,
  after,
  children,
}: FeatureProps) {
  return (
    <article id={id} className="grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-10">
      <Reveal preset="settle" className="lg:col-start-2 lg:row-start-1">
        <AutoplayVideo
          src={video}
          label={videoLabel}
          className={`block aspect-square w-full bg-mist object-cover ${squareVideo ? '' : 'rounded-[20px]'}`}
        />
      </Reveal>
      {/* Spans both content rows so the pinned title has the whole step to travel. */}
      <div className="mt-10 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0">
        <div className="lg:sticky lg:top-16">
          <p className="type-eyebrow text-accent lg:hidden">{String(step).padStart(2, '0')}</p>
          <h3 className="mt-3 type-topic lg:mt-0">{title}</h3>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-10 type-body text-body lg:col-start-2 lg:mt-0 lg:text-ink">
        <div className={`space-y-6 ${readingFrame}`}>{children}</div>
        {after}
      </div>
    </article>
  )
}
