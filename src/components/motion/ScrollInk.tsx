import { useCallback, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'

/** How many characters the grey-to-black edge spans, so the wave reads smooth rather than stepped. */
const SOFT = 4

type ScrollInkProps = {
  children: ReactNode
  className?: string
}

/**
 * Scroll-linked ink: every `InkText` inside starts in the grey base and darkens to black character by character,
 * in reading order, as the block scrolls up the viewport. Scrolling only moves one CSS variable (`--ink-head`,
 * counted in characters) and each character mixes its own colour in CSS (`ink-char`), so nothing re-renders.
 * With reduced motion the text is shown fully inked.
 */
export default function ScrollInk({ children, className = '' }: ScrollInkProps) {
  const ref = useRef<HTMLDivElement>(null)
  const count = useRef(0)
  const reduced = useReducedMotion()
  // Inking starts as the block's top rises past 85% of the viewport and finishes as its end reaches the middle.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })

  const paint = useCallback(
    (progress: number) => {
      const total = count.current + SOFT
      ref.current?.style.setProperty('--ink-head', String(reduced ? total : progress * total))
    },
    [reduced],
  )

  // Number the characters in document order, so the ink runs across paragraphs as one passage.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const chars = el.querySelectorAll<HTMLElement>('.ink-char')
    chars.forEach((char, i) => char.style.setProperty('--ink-i', String(i)))
    count.current = chars.length
    el.style.setProperty('--ink-soft', String(SOFT))
    paint(scrollYProgress.get())
  })

  useMotionValueEvent(scrollYProgress, 'change', paint)

  return (
    <div ref={ref} className={`text-muted ${className}`}>
      {children}
    </div>
  )
}
