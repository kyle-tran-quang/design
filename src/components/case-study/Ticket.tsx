import type { CSSProperties, ReactNode } from 'react'

const accents = {
  coral: 'bg-[#f06f52]',
  periwinkle: 'bg-periwinkle',
  sun: 'bg-sun',
}

/** Stub icons are drawn at 2x their exported size, so an ~80px icon nearly fills the 166px stub. */
const ICON_SCALE = 2

/** A measurement on the 740px ticket, in the card's container units. */
const units = (px: number) => `${(px / 7.4).toFixed(3)}cqw`

// The notches: a 32px circle (2.16cqw radius) centred on each side edge where the stub begins, 234px above the
// paper's bottom (+2px for the sheet underneath peeking out), or 274px when the stub holds an icon with 40px of air
// below it. Masked out of both paper layers, so whatever is behind the ticket shows through.
function notchMask(offset: string): CSSProperties {
  const notch = (x: string) =>
    `radial-gradient(circle 2.16cqw at ${x} calc(100% - ${offset}), transparent calc(100% - 0.5px), #000 100%)`
  const mask = `${notch('0')}, ${notch('100%')}`
  return { maskImage: mask, WebkitMaskImage: mask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }
}
const plainNotches = notchMask('31.89cqw')
const iconNotches = notchMask('37.3cqw')

type TicketProps = {
  title: string
  /** A string becomes one paragraph; pass `<p>`s for more. */
  children: ReactNode
  accent: keyof typeof accents
  /** Stub icon at its exported size. */
  icon?: { src: string; width: number; height: number }
  /** Take its height from the content (and a stretching row) instead of the design's 740x1220 proportion. */
  naturalHeight?: boolean
  titleTag?: 'h4' | 'h5'
  className?: string
}

/**
 * A paper "ticket" from the Figma Ticket stage (RyZAivKDXMz4gAgBM6XHuz 15:348). Designed at 740px wide; every
 * measurement is that design value in container units (1px = 100/740 cqw), so it scales as one piece. Type scales
 * too, capped at 32/21px so wide tickets stay readable. The shadows are drop-shadow filters on the card, so they
 * follow the notched outline. Set `--ticket-tuck` (in cqw) to keep the copy clear of a card overlapping its right edge.
 */
export default function Ticket({
  title,
  children,
  accent,
  icon,
  naturalHeight = false,
  titleTag: Title = 'h5',
  className = '',
}: TicketProps) {
  const accentBg = accents[accent]
  const fill = naturalHeight ? 'flex-1' : ''
  return (
    <article
      className={`@container relative flex w-full flex-col [filter:drop-shadow(0_18px_22px_rgba(30,34,26,0.1))_drop-shadow(0_3px_4px_rgba(30,34,26,0.06))] transition-[rotate,translate] duration-300 ease-out hover:-translate-y-1.5 hover:rotate-0 motion-reduce:transition-none ${fill} ${className}`}
    >
      {/* Both paper layers, with the notches cut out of them. */}
      <div className={`relative flex flex-col pb-[0.27cqw] ${fill}`} style={icon ? iconNotches : plainNotches}>
        {/* Paper depth: a second sheet peeking out underneath. */}
        <div
          aria-hidden="true"
          className="absolute top-[2.43cqw] right-[0.81cqw] bottom-0 left-[1.35cqw] rounded-[3.38cqw] bg-[#ecece6]"
        />
        <div
          className={`relative flex flex-col overflow-hidden rounded-[3.24cqw] bg-white pt-[5.08cqw] ${naturalHeight ? 'flex-1' : 'min-h-[164.86cqw]'}`}
        >
          <div aria-hidden="true" className="ml-[3.75cqw] flex size-[3.84cqw] items-center justify-center">
            <div className={`size-[2.72cqw] rotate-45 ${accentBg}`} />
          </div>
          <Title className="mt-[10.14cqw] max-w-[67.5cqw] pl-[5.68cqw] text-[length:clamp(22px,7.84cqw,32px)] leading-[1.1] font-medium tracking-[-0.01em] text-black">
            {title}
          </Title>
          <div className="mt-[11cqw] flex-1 space-y-[0.69em] pr-[calc(6.14cqw+var(--ticket-tuck,0cqw))] pl-[6.14cqw] text-[length:clamp(15px,5.27cqw,21px)] leading-[1.3] tracking-[-0.01em] text-black">
            {typeof children === 'string' ? <p>{children}</p> : children}
          </div>
          {icon ? (
            // The stub, from the notch line down: 166px with the icon centred in it, then 40px of air above the band.
            <div aria-hidden="true" className="box-content flex h-[22.49cqw] shrink-0 items-center px-[6.14cqw] pb-[5.41cqw]">
              <img
                src={icon.src}
                alt=""
                width={icon.width}
                height={icon.height}
                draggable={false}
                className="block max-w-none"
                style={{ width: units(icon.width * ICON_SCALE), height: units(icon.height * ICON_SCALE) }}
              />
            </div>
          ) : (
            // The empty stub below the notch line.
            <div aria-hidden="true" className="h-[22.49cqw] shrink-0" />
          )}
          <div aria-hidden="true" className={`h-[9.13cqw] shrink-0 ${accentBg}`} />
        </div>
      </div>
    </article>
  )
}
