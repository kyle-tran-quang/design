import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { topicById } from './layers'
import { STORY_BODIES } from './stories'
import { interaction, useInteraction } from './interaction'

/**
 * The open topic's story, as a tearsheet: 40 % of the viewport wide, full height, flush with the right edge. The camera frames the
 * topic in the space to its left (see panelLayout.ts, which holds the same numbers). Below 810 px wide it becomes a sheet at the bottom.
 *
 * Esc, the close button, or a click on empty stage closes it; the arrows step through the topics in reading order. Clicks inside
 * it are marked `data-iso-panel` so the stage underneath does not treat them as a click on empty space.
 */
/** The page's own ease-out: fast start, long settle (the skill's "panel-in"). */
const PANEL_IN = [0.3, 0, 0.1, 1] as const
const PANEL_OUT = [0.6, 0, 0.7, 0.5] as const

/** The open story: its title, then its content, built from the page's own pieces (see stories.tsx). */
function Body({ id, title }: { id: string; title: string }) {
  const Content = STORY_BODIES[id]
  return (
    <>
      <h3 className="type-topic">{title}</h3>
      <div className="mt-5">{Content && <Content />}</div>
    </>
  )
}

export default function StoryPanel() {
  const { focus } = useInteraction()
  const story = focus ? topicById(focus)?.story : undefined
  const panelRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const open = focus != null
  const grey = story?.grey === true
  const surface = grey ? 'bg-cloud' : 'bg-white'

  useEffect(() => {
    if (!open) return
    // Move focus into the panel so keyboard users land on it, and give it back on close.
    const opener = document.activeElement as HTMLElement | null
    panelRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') interaction.close()
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if ((e.target as HTMLElement | null)?.closest('video, a')) return
        e.preventDefault()
        interaction.step(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        interaction.step(-1)
      } else if (e.key === 'PageUp' || e.key === 'PageDown' || e.key === 'Home' || e.key === 'End' || e.key === ' ') {
        // The page is held while a story is open, so these scroll the story, not the page behind it. Space still activates a control.
        const t = e.target as HTMLElement | null
        if (t?.closest('video, input, textarea, select') || (e.key === ' ' && t?.closest('a, button'))) return
        const el = scrollRef.current
        if (!el) return
        e.preventDefault()
        const page = el.clientHeight * 0.9
        const up = e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)
        const top = e.key === 'Home' ? 0 : e.key === 'End' ? el.scrollHeight : el.scrollTop + (up ? -page : page)
        el.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus?.({ preventScroll: true })
    }
  }, [open])

  // A new topic starts at the top of the card.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [focus])

  return (
    <AnimatePresence>
      {story && focus && (
        <motion.aside
          key="panel"
          ref={panelRef}
          tabIndex={-1}
          data-iso-panel
          role="dialog"
          aria-label={story.title}
          initial={{ x: '100%' }}
          animate={{ x: 0, transition: { duration: 0.6, ease: PANEL_IN, delay: 0.08 } }}
          exit={{ x: '100%', transition: { duration: 0.28, ease: PANEL_OUT } }}
          // A tearsheet: 40 % of the viewport, full height, flush right, square against the edge it is attached to.
          className={`absolute inset-x-0 bottom-0 z-10 flex h-[54%] flex-col overflow-hidden rounded-t-[20px] border-line ${surface} transition-colors duration-300 shadow-[0_-12px_40px_-12px_rgba(40,44,56,.4)] outline-none min-[810px]:inset-y-0 min-[810px]:right-0 min-[810px]:left-auto min-[810px]:h-auto min-[810px]:w-[max(360px,40%)] min-[810px]:rounded-none min-[810px]:border-l min-[810px]:shadow-[-18px_0_50px_-24px_rgba(40,44,56,.45)]`}
        >
          {/* The close button's strip: content scrolls under it, so a story never runs behind the button. The button sits above it
              (z-[2]); at the same level the strip, which comes first in the card, painted over the button and hid it. */}
          <div aria-hidden className={`relative z-[1] h-[68px] shrink-0 ${surface} transition-colors duration-300 min-[810px]:h-24`} />
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-10 min-[810px]:px-10 min-[810px]:pb-12">
            {/* The body cross-fades when stepping between topics; the card itself stays put. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={focus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: PANEL_IN } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <Body id={focus} title={story.title} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 border-t border-line py-3 pr-4 pl-4 max-[809px]:pr-[68px] min-[810px]:px-8 min-[810px]:py-4">
            <button
              type="button"
              onClick={() => interaction.step(-1)}
              aria-label="Previous layer"
              className="flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span aria-hidden>←</span>
            </button>
            <button
              type="button"
              onClick={() => interaction.step(1)}
              aria-label="Next layer"
              className="flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span aria-hidden>→</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => interaction.close()}
            aria-label="Close"
            className={`absolute top-3 left-3 z-[2] flex size-11 items-center justify-center rounded-full ${grey ? 'bg-cloud/80' : 'bg-white/80'} text-ink transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-accent min-[810px]:top-7 min-[810px]:left-8`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
              className="size-7"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
