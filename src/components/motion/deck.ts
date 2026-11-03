/**
 * Deck-of-cards entrance: the first card slides in from slightly top-left, the last from slightly
 * bottom-right, and any middle card rises straight up. Each card settles in turn.
 * Spread the result onto a motion element; it returns nothing when reduced motion is preferred.
 */
export function deckIn(index: number, count: number, reduced: boolean | null) {
  if (reduced) return {}
  const offset = 32
  const from =
    index === 0
      ? { x: -offset, y: -offset, rotate: -2 }
      : index === count - 1
        ? { x: offset, y: offset, rotate: 2 }
        : { x: 0, y: offset * 0.75, rotate: 0 }
  return {
    initial: { opacity: 0, ...from },
    whileInView: { opacity: 1, x: 0, y: 0, rotate: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: {
      type: 'spring' as const,
      duration: 0.7,
      bounce: 0.15,
      delay: index * 0.1,
    },
  }
}
