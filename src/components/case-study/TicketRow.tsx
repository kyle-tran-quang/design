import { Children, useState, type CSSProperties, type ReactNode } from 'react'

/** Share of a card's width the next card covers. Covered cards tuck their copy in by the same amount. */
const OVERLAP = 0.1
/** Resting tilt (deg) and drop (px) per card, after the reference fan (Figma 15:366), softened for larger cards. */
const TILTS = [-2.02, 3, -1.2, 2.4]
const DROPS = [0, 24, 8, 16]
/** Extra tilt for a card pushed aside. */
const NUDGE = 1.5

/**
 * Tickets fanned side by side across the full frame, each overlapping the last and tilted (from 640px up).
 * Hovering one (or tapping, on touch) straightens it and brings it to the front, while the rest shrink back toward
 * their outer edges to make space, so nothing leaves the frame. Below 640px they stack, gently tilted.
 */
export default function TicketRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  const items = Children.toArray(children)
  const count = items.length
  const [active, setActive] = useState<number | null>(null)
  // Card width as a share of the row, so `count` cards with their overlaps fill it exactly.
  const width = 100 / (count - (count - 1) * OVERLAP)

  return (
    <div
      className={`flex flex-col items-center gap-8 py-4 sm:flex-row sm:items-stretch sm:gap-0 sm:pb-10 ${className}`}
      onPointerLeave={() => setActive(null)}
    >
      {items.map((item, i) => {
        const tilt = TILTS[i % TILTS.length]
        const isActive = active === i
        // Which way this card gives way: toward the left edge, the right edge, or not at all.
        const side = active === null || isActive ? 0 : i < active ? -1 : 1
        const vars = {
          '--card-w': `${width}%`,
          '--card-ml': i ? `${-OVERLAP * width}%` : '0%',
          '--tilt': `${tilt}deg`,
          '--rot': `${isActive ? 0 : tilt + side * NUDGE}deg`,
          '--drop': `${DROPS[i % DROPS.length]}px`,
          '--recede': side ? 1 - OVERLAP : 1,
          '--origin': side < 0 ? 'left center' : side > 0 ? 'right center' : 'center',
          // Read by Ticket (as --ticket-tuck, from 640px up) so its copy stays clear of the next card.
          '--tuck': i < count - 1 ? `${OVERLAP * 100}cqw` : '0cqw',
        } as CSSProperties
        return (
          <div
            key={i}
            style={vars}
            className={`relative flex w-full max-w-[400px] rotate-[calc(var(--tilt)/2)] flex-col transition-[rotate,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:ml-[var(--card-ml)] sm:w-[var(--card-w)] sm:max-w-none sm:shrink-0 sm:origin-[var(--origin)] sm:translate-y-[var(--drop)] sm:scale-[var(--recede)] sm:[rotate:var(--rot)] sm:[--ticket-tuck:var(--tuck)] ${isActive ? 'z-10' : ''}`}
            onPointerEnter={(event) => event.pointerType === 'mouse' && setActive(i)}
            onPointerDown={(event) => event.pointerType !== 'mouse' && setActive(isActive ? null : i)}
          >
            {item}
          </div>
        )
      })}
    </div>
  )
}
