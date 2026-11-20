import { useInteraction } from './interaction'
import { hasFinePointer } from '@/lib/performance'

/**
 * "Click a story to explore": a small line at the top centre of the viewport, level with the logo and the same distance from the edge
 * (16 px, 20 px from 1024 px up), that arrives as the build finishes and the layers become usable, and goes while a story is open.
 * It comes back whenever the stack is showing and nothing is open, every time: it is the only cue that the layers can be clicked,
 * and it used to disappear for good the first time one was opened.
 */
export default function Hint() {
  const { ready, focus } = useInteraction()
  const show = ready && !focus
  const verb = hasFinePointer() ? 'Click' : 'Tap'
  return (
    <div
      aria-hidden={!show}
      className={`pointer-events-none absolute inset-x-0 top-4 z-[5] flex justify-center transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none lg:top-5 ${
        show ? 'translate-y-0 opacity-100 delay-300' : '-translate-y-2 opacity-0'
      }`}
    >
      <p className="flex items-center gap-2.5 rounded-full bg-ink/90 py-2.5 pr-5 pl-4 type-small text-white shadow-[0_10px_30px_-10px_rgba(10,14,24,.6)] backdrop-blur-sm">
        <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 3 12 8-5.2 1.3L15.5 18l-2.6 1.2-2.7-5.6L6.5 17z" />
        </svg>
        {verb} a story to explore
      </p>
    </div>
  )
}
