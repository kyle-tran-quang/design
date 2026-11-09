import { useEffect, useRef, useState, type FocusEvent, type PointerEvent as ReactPointerEvent } from 'react'

declare global {
  interface Window {
    /** Set by engine/page.js once the page is running. Scrolls to the first text of a chapter. */
    MGoatNav?: { jump(chapter: number): void }
  }
}

/**
 * "On this page" rail, fixed to the right edge. Ported from SectionNav in the design project, adapted to this page:
 *
 *  - Closed: a column of short lines, one per chapter, the current one long and black (Figma 41:33).
 *  - Hover, tap or keyboard focus opens a card listing every chapter; picking one scrolls to it.
 *
 * The root stays `<nav id="progress" class="progress">` because the scroll engine owns its page-level state, so React
 * must never change `className` or `style` on it (it would wipe what the engine set):
 *   - `.on`            toggled by engine/page.js while the split section is on screen (CSS shows/hides the rail)
 *   - `data-theme`     light / dark, copied from the current beat
 *   - `data-flip`      Stage F's dark -> light blend (--tick / --tick-act set inline)
 *   - `data-chapter`   the current chapter index, plus a `chapterchange` event on every change (this component listens)
 * React's own state lives in `data-open`.
 *
 * `chapters` must have one entry per `STORY.chapters` (engine/story.js), in order.
 */
export default function ChapterRail({ chapters }: { chapters: string[] }) {
  const [active, setActive] = useState(-1)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pointerTypeRef = useRef('mouse')

  // Follow the engine: current chapter, and whether the rail is shown at all.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    setActive(Number(root.dataset.chapter ?? -1))
    const onChapter = (event: Event) => setActive((event as CustomEvent<number>).detail)
    const onClass = () => {
      if (!root.classList.contains('on')) setOpen(false)
    }
    root.addEventListener('chapterchange', onChapter)
    const observer = new MutationObserver(onClass)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => {
      root.removeEventListener('chapterchange', onChapter)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      if (rootRef.current?.contains(document.activeElement)) buttonRef.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const jumpTo = (chapter: number) => {
    window.MGoatNav?.jump(chapter)
    setActive(chapter)
    if (pointerTypeRef.current !== 'mouse') setOpen(false)
  }

  // Pointer events so the emulated mouseenter on touch doesn't open the card before the tap is handled.
  const onPointerEnter = (event: ReactPointerEvent) => event.pointerType === 'mouse' && setOpen(true)
  const onPointerLeave = (event: ReactPointerEvent) => event.pointerType === 'mouse' && setOpen(false)
  const onBlur = (event: FocusEvent) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false)
  }

  return (
    <nav
      ref={rootRef}
      id="progress"
      className="progress"
      aria-label="On this page"
      data-open={open ? '' : undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDownCapture={(event) => (pointerTypeRef.current = event.pointerType)}
      onBlur={onBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        className="progress-btn"
        aria-label="Sections on this page"
        aria-expanded={open}
        aria-controls="progress-panel"
        onClick={() => setOpen((value) => !value)}
      >
        {chapters.map((label, n) => (
          <i key={label} aria-hidden="true" className={n === active ? 'act' : undefined} />
        ))}
      </button>

      <div id="progress-panel" className="progress-panel">
        <ol>
          {chapters.map((label, n) => (
            <li key={label}>
              <button
                type="button"
                tabIndex={open ? 0 : -1}
                aria-current={n === active ? 'location' : undefined}
                onClick={() => jumpTo(n)}
              >
                {label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
