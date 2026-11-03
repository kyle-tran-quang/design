import { useEffect, type RefObject } from 'react'
import { beforeSwap } from '@/lib/pageTransition'

let saved: { left: number; top: number } | null = null

/**
 * Remembers where the homepage was scrolled when a case study opened, and returns there on the way back, so
 * the homepage that slides back in is the one that left. Call after `useHorizontalScroll`, so the track's
 * zoom is set before its position is restored.
 */
export function useHomeScrollMemory(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const track = ref.current
    if (!track) return
    if (saved) {
      track.scrollLeft = saved.left
      window.scrollTo({ top: saved.top, left: 0, behavior: 'instant' })
    }
    return beforeSwap(() => {
      saved = { left: track.scrollLeft, top: window.scrollY }
    })
  }, [ref])
}
