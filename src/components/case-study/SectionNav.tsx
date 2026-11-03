import { useEffect, useMemo, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export type SectionNavLink = { id: string; label: string }
export type SectionNavItem = SectionNavLink & { children?: SectionNavLink[] }

/** Where a jumped-to heading lands, measured from the top of the viewport. */
const SCROLL_OFFSET = 80
/** A section becomes current once its heading scrolls above this line. */
const ACTIVE_LINE = SCROLL_OFFSET + 40

/**
 * "On this page" outline, fixed to the right edge of case study pages (tablet and desktop only).
 * It appears once the case study hero has scrolled out of view.
 * By default it is a column of short lines, one per section (subsections indented), with the
 * current one in black. Hovering, tapping or focusing it opens a card listing every section;
 * clicking an entry scrolls to it.
 */
export default function SectionNav({ items }: { items: SectionNavItem[] }) {
  const flat = useMemo(
    () => items.flatMap((item) => [{ ...item, depth: 0 }, ...(item.children ?? []).map((child) => ({ ...child, depth: 1 }))]),
    [items],
  )
  const [active, setActive] = useState(flat[0]?.id)
  const [open, setOpen] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pointerTypeRef = useRef('mouse')
  // While a click-triggered smooth scroll runs, hold the clicked entry as current.
  const lockRef = useRef(false)
  const updateRef = useRef<() => void>(() => {})

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const hero = document.querySelector('[data-case-study-hero]')
      const past = !hero || hero.getBoundingClientRect().bottom <= 0
      setPastHero(past)
      if (!past) setOpen(false)
      if (lockRef.current) return
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      const line = atBottom ? window.innerHeight : ACTIVE_LINE
      let current = flat[0]?.id
      for (const item of flat) {
        const top = document.getElementById(item.id)?.getBoundingClientRect().top
        if (top !== undefined && top <= line) current = item.id
      }
      setActive(current)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    updateRef.current = schedule
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [flat])

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

  const jumpTo = (event: MouseEvent, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    setActive(id)
    lockRef.current = true
    const release = () => {
      if (!lockRef.current) return
      lockRef.current = false
      updateRef.current()
    }
    window.addEventListener('scrollend', release, { once: true })
    window.setTimeout(release, 1200)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
      behavior: reduce ? 'auto' : 'smooth',
    })
    if (pointerTypeRef.current !== 'mouse') setOpen(false)
  }

  // Pointer events so the emulated mouseenter on touch doesn't open the card before the tap is handled.
  const onPointerEnter = (event: ReactPointerEvent) => event.pointerType === 'mouse' && setOpen(true)
  const onPointerLeave = (event: ReactPointerEvent) => event.pointerType === 'mouse' && setOpen(false)
  const onBlur = (event: FocusEvent) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false)
  }

  if (flat.length === 0) return null

  const linkClass = (id: string, depth: number) =>
    `block w-full rounded-[4px] py-1 pr-1 text-[13px] leading-[16.9px] font-normal tracking-[-0.0762px] break-words transition-colors duration-150 hover:bg-[#f3f4f6] focus-visible:bg-[#f3f4f6] focus-visible:outline-none ${
      depth ? 'pl-4' : 'pl-1'
    } ${id === active ? 'text-accent' : 'text-[#6b7280] hover:text-[#191919] focus-visible:text-[#191919]'}`

  return (
    <motion.nav
      ref={rootRef}
      aria-label="On this page"
      // Hidden (and out of the tab order) until the hero has scrolled past.
      inert={!pastHero}
      initial={false}
      animate={pastHero ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 min-[810px]:block ${pastHero ? '' : 'pointer-events-none'}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDownCapture={(event) => (pointerTypeRef.current = event.pointerType)}
      onBlur={onBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Sections on this page"
        aria-expanded={open}
        aria-controls="section-nav-panel"
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer flex-col items-end gap-[15px] rounded p-2 focus-visible:outline-2 focus-visible:outline-accent"
      >
        {flat.map((item) => (
          <span
            key={item.id}
            aria-hidden="true"
            className={`block h-px transition-colors duration-300 ${item.depth ? 'w-8' : 'w-10'} ${
              item.id === active ? 'bg-black' : 'bg-[#8d8d8d]'
            }`}
          />
        ))}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="section-nav-panel"
            initial={{ opacity: 0, x: 8, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 right-0 max-h-[min(807px,calc(100dvh-32px))] w-[232px] origin-right -translate-y-1/2 overflow-y-auto rounded-[14px] bg-white px-3 pt-3 shadow-[0px_14px_28px_-6px_rgba(25,25,25,0.2),0px_2px_4px_-1px_rgba(25,25,25,0.12)]"
          >
            <ol>
              {items.map((item) => (
                <li key={item.id} className="px-1.5 pt-1.5 pb-[18px]">
                  <a
                    href={`#${item.id}`}
                    aria-current={item.id === active ? 'location' : undefined}
                    onClick={(event) => jumpTo(event, item.id)}
                    className={linkClass(item.id, 0)}
                  >
                    {item.label}
                  </a>
                  {item.children && (
                    <ol>
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <a
                            href={`#${child.id}`}
                            aria-current={child.id === active ? 'location' : undefined}
                            onClick={(event) => jumpTo(event, child.id)}
                            className={linkClass(child.id, 1)}
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
