import { useEffect, useRef, useState, type FocusEvent, type MouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { arrivalTransition } from '@/lib/pageTransition'
import { caseStudies, currentRoute, homeHref, workHref } from '@/lib/routes'

const ROTATE_PER_PX = 0.15
const SMOOTHING = 0.1
/** Grace period before the menu closes, so a pointer that slips off for a moment doesn't snap it shut. */
const CLOSE_DELAY = 150
/** Above the case pages' full-screen cinematics (CINEMATIC.zIndex), for a logo carried over from another study. */
const ABOVE_CINEMATIC = 'z-[2147483001]'
/** Tailwind's `lg`: below it (phones and tablets) the logo is a menu button. */
const DESKTOP_QUERY = '(min-width: 64rem)'

/** The logo's last rotation, so a logo carried over to the next case study turns on from where it was. */
let lastRotation = 0

/**
 * Fixed logo in the top-left of case study pages. It turns as the page scrolls.
 * On desktop, clicking it goes home and hovering (or keyboard focus) opens a menu of every case study; on touch, the
 * first tap opens the menu and a second tap goes home. On phones and tablets it is a menu button instead: a tap
 * opens or closes the menu, which then leads with a Home link.
 *
 * It drops in only when the case study opens from the homepage. Moving between case studies, it stays fixed in
 * place while the pages slide underneath (it carries a view-transition-name during that transition, see
 * index.css) and stays above the next page's cinematic, so it never disappears.
 */
export default function ProjectNav() {
  const iconRef = useRef<SVGSVGElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const pointerTypeRef = useRef('mouse')
  const closeTimerRef = useRef<number | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [compact, setCompact] = useState(() => !window.matchMedia(DESKTOP_QUERY).matches)
  const [arrival] = useState(arrivalTransition)
  const reduced = useReducedMotion()
  const dropIn = arrival === 'home-to-work'
  const carriedOver = arrival === 'work-next' || arrival === 'work-prev'
  const route = currentRoute()

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const update = () => {
      setCompact(!query.matches)
      setOpen(false)
    }
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Ease the rotation towards scrollY * speed.
  useEffect(() => {
    const icon = iconRef.current
    if (!icon || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // A carried-over logo starts at the previous page's angle and turns back the short way to this page's.
    let current = carriedOver ? (((lastRotation % 360) + 540) % 360) - 180 : window.scrollY * ROTATE_PER_PX
    icon.style.transform = `rotate(${current}deg)`
    let frame = 0
    const render = () => {
      const target = window.scrollY * ROTATE_PER_PX
      current += (target - current) * SMOOTHING
      if (Math.abs(target - current) < 0.01) current = target
      icon.style.transform = `rotate(${current}deg)`
      lastRotation = current
      frame = current === target ? 0 : requestAnimationFrame(render)
    }
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(render)
    }
    kick()
    window.addEventListener('scroll', kick, { passive: true })
    return () => {
      window.removeEventListener('scroll', kick)
      cancelAnimationFrame(frame)
    }
  }, [carriedOver])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
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

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), [])

  const itemClass =
    'flex rounded px-2 py-1.5 text-2xl leading-8 tracking-[-0.0762px] transition-colors duration-150 hover:bg-[#f4f4f4] hover:text-accent'

  // Pointer events (not mouse events) so emulated mouseenter on touch doesn't open the menu before the tap is handled.
  const onPointerEnter = (event: ReactPointerEvent) => {
    if (compact || event.pointerType !== 'mouse') return
    window.clearTimeout(closeTimerRef.current)
    setOpen(true)
  }
  const onPointerLeave = (event: ReactPointerEvent) => {
    if (compact || event.pointerType !== 'mouse') return
    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY)
  }

  const onLogoClick = (event: MouseEvent) => {
    const isTouch = pointerTypeRef.current !== 'mouse'
    // Reset so a later keyboard activation isn't mistaken for a tap.
    pointerTypeRef.current = 'mouse'
    if (isTouch && !open) {
      event.preventDefault()
      setOpen(true)
    }
  }

  // Open for keyboard focus only; taps focus the link too but shouldn't count.
  const onFocus = (event: FocusEvent) => {
    if (compact) return
    if ((event.target as HTMLElement).matches(':focus-visible')) setOpen(true)
  }
  const onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    // A tap on the menu's label or padding blurs the menu button without focusing anything; taps outside close it.
    if (compact && !next) return
    if (!rootRef.current?.contains(next)) setOpen(false)
  }

  return (
    // Framer appear effect on the nav bar: drops in from above 1s after the case study opens from the homepage.
    <motion.nav
      ref={rootRef}
      initial={dropIn ? { opacity: 0.001, y: -150 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', duration: 0.8, bounce: 0.2, delay: 1 }}
      aria-label="Case studies"
      data-project-nav=""
      className={`fixed top-4 left-4 size-12 lg:top-5 lg:left-[19px] lg:size-[60px] ${carriedOver ? ABOVE_CINEMATIC : 'z-50'}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <svg ref={iconRef} viewBox="0 0 40 40" className="pointer-events-none block size-full will-change-transform" aria-hidden="true">
        <path
          fill="#FA680C"
          d="M10.8759 3.33639C13.0293 2.26414 14.6883 6.69064 17.05 6.18692C19.4119 5.68268 24.3081 1.2254 26.5944 1.89165C28.8807 2.55803 26.7173 6.87434 28.7233 8.0911C30.7296 9.30768 37.4352 9.35678 38.5154 11.3704C39.5955 13.3841 34.8783 15.0638 35.3533 17.2888C35.8287 19.5139 40.4163 24.0423 39.6567 26.2241C38.897 28.4059 34.3917 26.4622 33.0572 28.3915C31.723 30.3213 31.5777 35.3867 28.9826 36.6789C26.8293 37.7508 25.5409 34.3923 23.1791 34.8965C20.8172 35.401 16.9278 38.9043 14.6417 38.238C11.8913 37.3065 13.5128 34.2089 11.5068 32.9922C9.50059 31.7755 2.79487 31.7265 1.71474 29.7129C0.634579 27.6992 5.35182 26.0195 4.87681 23.7945C4.40138 21.5694 -0.18668 17.0412 0.572511 14.8593C1.33218 12.6774 5.83854 14.6214 7.17292 12.6918C8.50709 10.762 8.72278 4.40921 10.8759 3.33639ZM11.9876 18.5497C10.0143 18.8369 8.64671 20.6692 8.93388 22.6425C9.22106 24.6159 11.0541 25.9823 13.0275 25.6952C15.0007 25.4079 16.3674 23.5758 16.0803 21.6025C15.7931 19.6292 13.9609 18.2627 11.9876 18.5497ZM28.1331 17.6586C27.0967 17.8096 26.1595 18.3422 25.5271 19.1392C25.102 19.6751 24.8375 20.3008 24.7535 20.9502C24.6854 21.4766 25.1873 21.8463 25.7126 21.7698C26.2377 21.6932 26.5801 21.1806 26.7779 20.6881C26.8458 20.519 26.9395 20.3581 27.0567 20.2104C27.3812 19.8014 27.862 19.5278 28.3938 19.4503C28.9257 19.3729 29.4653 19.498 29.893 19.7976C30.0475 19.9058 30.1831 20.0333 30.2965 20.1761C30.6265 20.5918 31.1006 20.9856 31.6259 20.9092C32.1512 20.8328 32.5269 20.3355 32.3116 19.8502C32.0459 19.2518 31.6141 18.7274 31.0539 18.3349C30.2205 17.7511 29.1695 17.5078 28.1331 17.6586Z"
        />
      </svg>
      {/* The control lies over the logo rather than wrapping it, so the turning logo isn't remounted when the
          window crosses the breakpoint and the control swaps. */}
      {compact ? (
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls={open ? 'project-menu' : undefined}
          onClick={() => setOpen((value) => !value)}
          className="absolute inset-0 cursor-pointer rounded-full"
        />
      ) : (
        <a
          href={homeHref}
          aria-label="Back to home"
          onPointerDown={(event) => (pointerTypeRef.current = event.pointerType)}
          onClick={onLogoClick}
          className="absolute inset-0 cursor-pointer rounded-full"
        />
      )}

      {/* pt-4 bridges the gap so the menu stays open while the pointer travels down to it. It rises in and, on
          closing, sinks back and fades out rather than vanishing. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="project-menu"
            className="absolute top-full left-0 origin-top-left pt-4"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.15 } }
                : { opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }
            }
          >
            <div className="w-max min-w-[200px] max-w-[calc(100vw-2rem)] rounded-t-lg rounded-b-[20px] bg-white px-2 pt-2 pb-4">
              {/* Phones and tablets: the logo no longer links home, so Home leads the menu. */}
              {compact && (
                <>
                  <a href={homeHref} className={`${itemClass} text-[#ada9a3]`}>
                    Home
                  </a>
                  <div aria-hidden="true" className="mx-2 mt-2 h-px bg-[#f4f4f4]" />
                </>
              )}
              <p id="project-menu-label" className="p-2 text-base leading-normal tracking-[-0.0762px] text-[#ada9a3]">
                All case studies
              </p>
              <ul aria-labelledby="project-menu-label" className="flex flex-col">
                {caseStudies.map((study) => {
                  const active = route === `/work/${study.slug}`
                  return (
                    <li key={study.slug}>
                      <a
                        href={workHref(study.slug)}
                        aria-current={active ? 'page' : undefined}
                        className={`${itemClass} ${active ? 'bg-[#f4f4f4] text-accent' : 'text-[#ada9a3]'}`}
                      >
                        {study.name}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
