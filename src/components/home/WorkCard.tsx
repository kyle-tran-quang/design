import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { Work } from '@/content/home'
import { HORIZONTAL_QUERY } from '@/hooks/useHorizontalScroll'
import { asset } from '@/lib/asset'

/*
 * Each card is a book: the front cover hinges on its spine and opens about 12°, revealing a sliver of creamy grey
 * page edges and the back cover behind it. It opens on hover or keyboard focus; touch screens can't hover, so there
 * it opens by itself while it passes the middle of the screen (data-open). Below lg the book is drawn smaller: a
 * narrower spine, tighter corners, a shorter reveal (--back, --pages) and a perspective scaled to its width.
 */
const OPEN = 'group-hover:duration-[600ms] group-focus-visible:duration-[600ms] group-data-open:duration-[600ms]'
const EASE = 'duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
const TOUCH_QUERY = '(hover: none)'

/** On touch screens: true while the element covers a thin strip across the middle of the screen. */
function useOpenWhileCentred(ref: RefObject<HTMLElement | null>) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const touch = window.matchMedia(TOUCH_QUERY)
    const horizontal = window.matchMedia(HORIZONTAL_QUERY)
    let observer: IntersectionObserver | undefined

    const watch = () => {
      observer?.disconnect()
      observer = undefined
      setOpen(false)
      if (!touch.matches) return
      // The strip runs across the scroll direction and is narrower than the gap between cards, so books open one at
      // a time as they pass through. root: document keeps the margins working when the page runs inside an iframe.
      observer = new IntersectionObserver(([entry]) => setOpen(entry.isIntersecting), {
        root: document,
        rootMargin: horizontal.matches ? '0px -48%' : '-48% 0px',
      })
      observer.observe(el)
    }

    watch()
    touch.addEventListener('change', watch)
    horizontal.addEventListener('change', watch)
    return () => {
      touch.removeEventListener('change', watch)
      horizontal.removeEventListener('change', watch)
      observer?.disconnect()
    }
  }, [ref])

  return open
}

/**
 * Distance from the top of the card to `slot`, a placeholder inside the cover. The "coming soon" band can't live in
 * the slot itself (the cover clips it, and the band overhangs the cover's edges), so it's drawn over the card at this
 * offset. Re-measured whenever the cover or the slot's row resizes, e.g. when the title rewraps or the font loads.
 * offsetTop ignores transforms, so the homepage's zoom and 3D tilt don't skew it.
 */
function useSlotTop(cover: RefObject<HTMLElement | null>, slot: RefObject<HTMLElement | null>, enabled: boolean) {
  const [top, setTop] = useState<number>()

  useLayoutEffect(() => {
    const coverEl = cover.current
    const slotEl = slot.current
    if (!enabled || !coverEl || !slotEl) return
    // The slot's offsetParent is the (positioned) cover; clientTop adds the cover's border.
    const measure = () => setTop(coverEl.offsetTop + coverEl.clientTop + slotEl.offsetTop)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(coverEl)
    if (slotEl.parentElement) observer.observe(slotEl.parentElement)
    return () => observer.disconnect()
  }, [cover, slot, enabled])

  return top
}

export default function WorkCard({ work }: { work: Work }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const open = useOpenWhileCentred(ref)
  // No case study yet: the book stays shut and an orange band announces it.
  const comingSoon = !work.href
  const bandTop = useSlotTop(coverRef, slotRef, comingSoon)

  return (
    <a
      ref={ref}
      // Without an href the anchor is a plain, unfocusable placeholder. Dropping `group` there switches off every
      // group-hover/focus/data-open style below, so the cover never opens.
      href={work.href ? asset(work.href) : undefined}
      data-open={(!comingSoon && open) || undefined}
      className={`${comingSoon ? '' : 'group '}relative block max-w-[600px] shrink-0 [--back:12px] [--pages:7px] [perspective:1400px] lg:h-[720px] lg:w-[600px] lg:self-center lg:[--back:16px] lg:[--pages:10px] lg:[perspective:2500px]`}
    >
      {/* Back cover: peeks out past the pages when the book opens. */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 rounded-l-[4px] rounded-r-[24px] bg-[#d3d0c9] transition-[translate,opacity] group-hover:translate-x-(--back) group-focus-visible:translate-x-(--back) group-data-open:translate-x-(--back) lg:rounded-l-[6px] lg:rounded-r-[40px] motion-reduce:translate-x-(--back) motion-reduce:opacity-0 motion-reduce:group-hover:opacity-100 motion-reduce:group-focus-visible:opacity-100 motion-reduce:group-data-open:opacity-100 ${EASE} ${OPEN}`}
      />
      {/* Page block: fine vertical lines read as the stacked edges of the pages. */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-1.5 right-0 left-1.5 rounded-r-[20px] bg-[repeating-linear-gradient(90deg,#ebe8e2_0_2px,#d9d5cd_2px_3px)] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] transition-[translate,opacity] group-hover:translate-x-(--pages) group-focus-visible:translate-x-(--pages) group-data-open:translate-x-(--pages) lg:inset-y-2 lg:left-2 lg:rounded-r-[34px] motion-reduce:translate-x-(--pages) motion-reduce:opacity-0 motion-reduce:group-hover:opacity-100 motion-reduce:group-focus-visible:opacity-100 motion-reduce:group-data-open:opacity-100 ${EASE} ${OPEN}`}
      />

      {/* Front cover */}
      <div
        ref={coverRef}
        className={`relative z-10 flex h-full origin-left overflow-hidden rounded-l-[4px] rounded-r-[24px] border border-mist bg-white shadow-[0_1px_2px_rgb(0_0_0/0.05),0_12px_28px_-16px_rgb(0_0_0/0.2)] transition-[transform,box-shadow] group-hover:shadow-[0_2px_4px_rgb(0_0_0/0.06),14px_24px_44px_-18px_rgb(0_0_0/0.3)] group-focus-visible:shadow-[0_2px_4px_rgb(0_0_0/0.06),14px_24px_44px_-18px_rgb(0_0_0/0.3)] group-data-open:shadow-[0_2px_4px_rgb(0_0_0/0.06),14px_24px_44px_-18px_rgb(0_0_0/0.3)] lg:rounded-l-[6px] lg:rounded-r-[40px] motion-safe:group-hover:[transform:rotateY(-12deg)] motion-safe:group-focus-visible:[transform:rotateY(-12deg)] motion-safe:group-data-open:[transform:rotateY(-12deg)] ${EASE} ${OPEN}`}
      >
        {/* Spine: company name runs up the side, year sits at the foot (left off while the band covers the foot). */}
        <div className="flex w-11 shrink-0 flex-col items-center border-r border-mist bg-cloud pb-5 lg:w-20 lg:pb-[29px]">
          <span className="flex flex-1 items-center">
            <span className="rotate-180 type-caption text-muted [writing-mode:vertical-rl]">
              {work.company}
            </span>
          </span>
          {!comingSoon && <span className="type-small text-muted">{work.year}</span>}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="aspect-[520/486] overflow-hidden bg-[#e6e6e3] lg:aspect-auto lg:h-[486px]">
            {/* Loaded eagerly: lazy loading is unreliable inside the zoomed, sideways-scrolling track and the 3D cover. */}
            <img src={asset(work.image)} alt="" decoding="async" className="size-full object-cover" />
          </div>
          {comingSoon ? (
            // The title sits under the cover art. The empty slot is centred in the space left beneath it, so the gaps
            // above and below match; the band itself is drawn outside the cover (below) so it can overhang the edges.
            <div className="flex flex-1 flex-col">
              <h3 className="px-5 pt-5 type-topic text-ink lg:pt-6">
                {work.title}
              </h3>
              <div className="flex flex-1 items-center py-5">
                <div ref={slotRef} aria-hidden="true" className="h-10 w-full shrink-0 lg:h-[52px]" />
              </div>
            </div>
          ) : (
            // The title sits right under the cover art; the read time drops to the foot, level with the spine's year.
            <div className="flex flex-1 flex-col justify-between gap-3 p-5 lg:pt-6 lg:pb-[29px]">
              <h3 className="type-topic text-ink">
                {work.title}
              </h3>
              {work.readTime && <p className="type-small text-muted">{work.readTime}</p>}
            </div>
          )}
        </div>

        {/* Hinge crease beside the spine and a soft highlight down the fore-edge. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 left-11 bg-[linear-gradient(90deg,rgb(0_0_0/0.08)_0,rgb(0_0_0/0.08)_1px,rgb(255_255_255/0.35)_3px,transparent_7%,transparent_97%,rgb(255_255_255/0.45)_100%)] lg:left-20"
        />
        {/* Light catching the cover as it lifts. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,transparent_35%,rgb(255_255_255/0.2)_50%,transparent_65%)] bg-[length:250%_100%] bg-[position:100%_0] opacity-0 transition-[opacity,background-position] group-hover:bg-[position:0%_0] group-hover:opacity-100 group-focus-visible:bg-[position:0%_0] group-focus-visible:opacity-100 group-data-open:bg-[position:0%_0] group-data-open:opacity-100 motion-reduce:hidden ${EASE} group-hover:duration-[900ms] group-focus-visible:duration-[900ms] group-data-open:duration-[900ms]`}
        />
      </div>

      {comingSoon && (
        // The band sits over the slot in the cover and runs 4px past both edges, as if wrapped around the book.
        // Shading on the overhang suggests it turning the corner. Hidden until the slot has been measured.
        <div
          style={{ top: bandTop }}
          className={`absolute -inset-x-1 z-20 flex h-10 items-center justify-center overflow-hidden lg:h-[52px] ${bandTop === undefined ? 'invisible' : ''}`}
        >
          {/* Fabric texture, cropped and stretched exactly as in the design. */}
          <img
            src={asset('assets/580df-1200w.webp')}
            alt=""
            decoding="async"
            className="pointer-events-none absolute top-[-63.92%] left-0 h-[271.69%] w-full max-w-none"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.2)_0,transparent_4px,transparent_calc(100%-4px),rgb(0_0_0/0.2)_100%)]"
          />
          <p className="relative type-body font-medium tracking-[1px] text-white">COMING SOON</p>
        </div>
      )}
    </a>
  )
}
