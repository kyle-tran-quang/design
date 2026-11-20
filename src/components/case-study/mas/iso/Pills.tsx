import { forwardRef } from 'react'
import { STORIES } from './layers'

/**
 * One label per topic. Pills are screen-space: they keep a constant size however the camera moves. The showcase positions each
 * one every frame and sets its opacity, plus two attributes:
 *
 * - `data-mode`: `tip` while the pointer is over a layer, `wave` during the "these are clickable" wave. It keeps its last value
 *   while the pill is hidden, so a pill fades out looking the way it did.
 * - `data-on`: `1` while the pill is shown, `0` while it is not.
 *
 * Both modes are set in Mikado (`font-sans`), the site's face. Plex belongs to the product mockups inside the layers, not to
 * the labels around them.
 *
 * `tip` is a white tooltip that trails the cursor, with an arrow for "open". It pops in and out quickly: the outer
 * element fades, the inner one scales (so the scale never disturbs the per-frame position on the outer one), both in 120 ms.
 * `wave` is the quiet outlined capsule from the reference clip, hung from the layer's north edge and faded frame by frame by
 * opacity alone, so it has no CSS transition.
 *
 * Nothing is labelled once a layer is open. This component renders once and never again.
 */
type PillsProps = { onRef: (id: string, el: HTMLElement | null) => void }

const Pills = forwardRef<HTMLDivElement, PillsProps>(function Pills({ onRef }, ref) {
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {STORIES.map(({ id, story }) => (
        <div
          key={id}
          ref={(el) => onRef(id, el)}
          data-mode="tip"
          data-on="0"
          className="group absolute top-0 left-0 transition-opacity duration-[120ms] ease-out data-[mode=wave]:transition-none motion-reduce:transition-none"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          <div className="flex h-[34px] origin-top-left scale-90 items-center gap-2 rounded-full border border-[#959da8] bg-white/70 px-4 font-sans text-[14px] leading-none whitespace-nowrap text-[#010a13] backdrop-blur-sm transition-[scale] duration-[120ms] ease-out group-data-[mode=tip]:h-9 group-data-[mode=tip]:border-black/10 group-data-[mode=tip]:bg-white group-data-[mode=tip]:pr-3.5 group-data-[mode=tip]:text-ink group-data-[mode=tip]:shadow-[0_8px_24px_-8px_rgba(10,14,24,.35)] group-data-[mode=tip]:backdrop-blur-none group-data-[mode=wave]:transition-none group-data-[on=1]:scale-100 motion-reduce:transition-none">
            <span className="font-medium">{story.title}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="hidden size-4 shrink-0 group-data-[mode=tip]:block"
            >
              <path d="M5 12h14.25M13.75 6.75 19.25 12l-5.5 5.25" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
})

export default Pills
