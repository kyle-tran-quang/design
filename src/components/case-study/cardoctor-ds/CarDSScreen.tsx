import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { GenerationHandle } from '../cardoctor/CarDoctorScreen'
import type { CinematicScreenProps } from '../cardoctor/Cinematic'

// The CarDS cinematic's screen, traced from the case study's header art (cardoctor-ds-header-icon.webp, 1024×1024):
// six cards on #FAFAFA, laid out at the art's own pixel coordinates. The cinematic scales the whole square.
// Anything the art crops at a card edge (the tooltip, the input, the menu) ends exactly at that edge here, with its
// text cut where the art cuts it, so the blueprint never draws outside a card. The big card is the art's own photo.

type HiddenEl = HTMLElement & { __tGenOpacity?: string }

const MAX_PARTS = 30
const ART = 'cardoctor-ds-header-icon.webp'

const card = 'absolute overflow-hidden rounded-[38px] border border-[#e9e9e9] bg-white'

// The art's card grid is a perspective "ceiling": hairlines every 7px across the top 70px, crossed by lines that
// fan out, 40px apart along the top edge, towards a vanishing point 300px below it. It fades out downwards.
const GRID_DEPTH = 70
const GRID_ROW = 7
const GRID_COLUMN = 40
const GRID_VANISH = 300

/** The faint hairline grid at the top of each card (`w`: the card's width). Decoration only: the blueprint skips it. */
function Grid({ w }: { w: number }) {
  const mid = w / 2
  const squeeze = 1 - GRID_DEPTH / GRID_VANISH
  const columns = Math.ceil(mid / (GRID_COLUMN * squeeze)) + 1
  return (
    <div className="cds-grid pointer-events-none absolute inset-x-0 top-0" style={{ height: GRID_DEPTH }} data-t-generate-skip="">
      <svg width={w} height={GRID_DEPTH} aria-hidden="true" className="block" stroke="#efefef" strokeWidth={1}>
        {Array.from({ length: GRID_DEPTH / GRID_ROW }, (_, i) => (
          <line key={`r${i}`} x1={0} x2={w} y1={i * GRID_ROW + 0.5} y2={i * GRID_ROW + 0.5} />
        ))}
        {Array.from({ length: columns * 2 + 1 }, (_, i) => {
          const k = i - columns
          return <line key={`c${k}`} x1={mid + k * GRID_COLUMN} y1={0} x2={mid + k * GRID_COLUMN * squeeze} y2={GRID_DEPTH} />
        })}
      </svg>
    </div>
  )
}

function Icon({ children, className, strokeWidth = 2 }: { children: ReactNode; className: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

export default function CarDSScreen({
  generate,
  asset,
  enabled = true,
  delay = 0,
  duration,
  stagger = 160,
  onFinished,
}: CinematicScreenProps) {
  const regionRefs = useRef<(HTMLDivElement | null)[]>([])
  const onFinishedRef = useRef(onFinished)
  onFinishedRef.current = onFinished
  const [pending, setPending] = useState(enabled)
  const region = (i: number) => (el: HTMLDivElement | null) => {
    regionRefs.current[i] = el
  }

  // Blueprint to hi-fi: each card plays the generation skeleton in reading order (top row, the photo card, bottom
  // row), once Inter and the art have loaded so the blueprint measures the final layout.
  useLayoutEffect(() => {
    const regions = regionRefs.current.filter(Boolean) as HiddenEl[]
    if (!enabled || regions.length === 0) {
      setPending(false)
      return
    }
    for (const el of regions) {
      el.__tGenOpacity = el.style.opacity
      el.style.opacity = '0'
    }
    setPending(false)

    let disposed = false
    let runs: GenerationHandle[] = []
    const art = new Image()
    art.src = asset(ART)
    Promise.all([document.fonts.ready, art.decode().catch(() => undefined)]).then(() => {
      if (disposed) return
      const timing = duration ? { duration } : {}
      runs = regions.map((el, i) =>
        generate(el, { mode: 'skeleton', delay: delay + i * stagger, maxParts: MAX_PARTS, ...timing }),
      )
      Promise.all(runs.map((run) => run.finished)).then(() => {
        if (!disposed) onFinishedRef.current?.()
      })
    })

    return () => {
      disposed = true
      for (const run of runs) run.cancel()
      for (const el of regions) {
        el.style.opacity = el.__tGenOpacity ?? ''
        delete el.__tGenOpacity
      }
    }
  }, [enabled, generate, asset, delay, duration, stagger])

  return (
    // Transparent: the cinematic frame owns the background (dark blueprint, then the art's #FAFAFA).
    <div className="cds-root relative h-[1024px] w-[1024px] shrink-0" data-cds-pending={pending ? '' : undefined}>
      {/* Tooltip */}
      <div ref={region(0)} data-cds-region="" className={`${card} top-[30px] left-[31px] h-[195px] w-[286px]`}>
        <Grid w={286} />
        <div className="absolute top-[44px] left-[31px] h-[84px] w-[255px] overflow-hidden rounded-l-[6px] border border-r-0 border-[#ececec] bg-white py-[11px] pl-[11px] shadow-[0_6px_16px_rgba(0,0,0,0.06)]">
          <p className="text-[12px] leading-[16px] font-semibold whitespace-nowrap">Profile Visibility</p>
          <div className="mt-[3px] text-[11px] leading-[15px] whitespace-nowrap text-[#6b6b6b]">
            <p>Control who can view your profile. Choose fro</p>
            <p>public, friends-only, or private to manage your</p>
            <p>privacy settings effectively.</p>
          </div>
        </div>
        <Icon className="absolute top-[138px] left-[173px] size-[20px] text-[#9a9a9a]" strokeWidth={1.75}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </Icon>
      </div>

      {/* Text input, focused */}
      <div ref={region(1)} data-cds-region="" className={`${card} top-[30px] left-[349px] h-[195px] w-[234px]`}>
        <Grid w={234} />
        <p className="absolute top-[63px] left-[71px] text-[14px] leading-[18px] font-medium whitespace-nowrap">
          Full Name<span className="text-[#ef4444]">*</span>
        </p>
        <div className="absolute top-[87px] left-[69px] flex h-[46px] w-[165px] items-center rounded-l-[8px] border-[1.5px] border-r-0 border-[#7b6ff2] bg-white pl-[14px] shadow-[0_0_0_3px_rgba(123,111,242,0.16)]">
          <span className="text-[16px] leading-[20px] whitespace-nowrap">David Smith</span>
        </div>
      </div>

      {/* Buttons */}
      <div ref={region(2)} data-cds-region="" className={`${card} top-[30px] left-[614px] h-[195px] w-[379px]`}>
        <Grid w={379} />
        <div
          role="button"
          className="absolute top-[66px] left-[35px] flex h-[49px] w-[186px] items-center justify-center rounded-[8px] bg-[#3e65fe] shadow-[0_2px_6px_rgba(62,101,254,0.25)]"
        >
          <span className="text-[22px] leading-[26px] tracking-[-0.01em] text-white">Service Now</span>
        </div>
        <div role="button" className="absolute top-[66px] left-[236px] flex size-[49px] items-center justify-center rounded-[8px] bg-[#3e65fe]">
          <Icon className="size-[26px] text-white">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </Icon>
        </div>
        <div role="button" className="absolute top-[66px] left-[300px] flex size-[49px] items-center justify-center rounded-[8px] bg-[#3e65fe]">
          <Icon className="size-[26px] text-white">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </Icon>
        </div>
        {/* Pointer over the primary button */}
        <Icon className="absolute top-[104px] left-[190px] size-[26px] text-[#111]" strokeWidth={1.5}>
          <path
            fill="#fff"
            d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15V4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5.5"
          />
          <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
          <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
        </Icon>
      </div>

      {/* CarDS 1.0: the art's own photo card, glow included */}
      <div
        ref={region(3)}
        data-cds-region=""
        role="img"
        aria-label="CarDS 1.0"
        className="absolute top-[246px] left-[24px] h-[530px] w-[976px] rounded-[34px]"
        style={{ backgroundImage: `url(${asset(ART)})`, backgroundSize: '1024px 1024px', backgroundPosition: '-24px -246px' }}
      />

      {/* Segmented control and menu */}
      <div ref={region(4)} data-cds-region="" className={`${card} top-[797px] left-[30px] h-[196px] w-[556px]`}>
        <Grid w={556} />
        <div className="absolute top-[75px] left-[51px] flex h-[45px] items-center gap-[2px] rounded-[6px] border border-[#ececec] bg-[#fafafa] p-[5px] shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
          <span className="px-[14px] text-[14px] leading-[33px] text-[#636363]">Unread</span>
          <span className="rounded-[4px] bg-white px-[12px] text-[14px] leading-[33px] font-medium text-black shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            Read
          </span>
          <span className="px-[12px] text-[14px] leading-[33px] text-[#636363]">Archived</span>
        </div>
        <div className="absolute top-[32px] left-[334px] h-[164px] w-[170px] overflow-hidden rounded-t-[6px] border border-b-0 border-[#ececec] bg-[#fafafa] px-[5px] pt-[5px]">
          {['Overview', 'Details', 'Orders', 'Users'].map((item) => (
            <p
              key={item}
              className={`rounded-[4px] px-[13px] text-[15px] leading-[34.5px] ${
                item === 'Details' ? 'bg-white font-medium text-black' : 'text-[#636363]'
              }`}
            >
              {item}
            </p>
          ))}
          {/* Cut by the card edge in the art; it appears with the finished card rather than in the blueprint. */}
          <p className="px-[13px] text-[15px] leading-[34.5px] text-[#636363]" data-t-generate-skip="">
            Notifications
          </p>
        </div>
      </div>

      {/* Checkbox */}
      <div ref={region(5)} data-cds-region="" className={`${card} top-[797px] left-[617px] h-[196px] w-[376px]`}>
        <Grid w={376} />
        <div className="absolute top-[63px] left-[57px] flex h-[62px] w-[262px] items-start gap-[14px] rounded-[6px] border border-[#e6e6e6] bg-white px-[14px] pt-[15px] shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div role="checkbox" aria-checked="true" className="mt-[1px] flex size-[18px] shrink-0 items-center justify-center rounded-[4px] bg-[#5852ff]">
            <Icon className="size-[12px] text-white" strokeWidth={3}>
              <path d="M20 6 9 17l-5-5" />
            </Icon>
          </div>
          <div className="text-[12.5px] leading-[17px] whitespace-nowrap">
            <p className="font-medium text-[#0d0d0d]">Remember me</p>
            <p className="mt-[3px] text-[#505050]">Save my login details for 30 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
