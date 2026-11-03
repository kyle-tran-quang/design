// The CarDoctor cinematic's screen, ported verbatim from CarDoctorCinematicStandalone.tsx (Figma
// fVbI9tlG1HrHimmznLaqAv node 28:3474). Its Tailwind classes compile with the app; the Be Vietnam Pro
// font classes and the pending rule live in cardoctor.css.
import { useLayoutEffect, useRef, useState } from 'react'

// CarDoctor: the three surfaces of Figma fVbI9tlG1HrHimmznLaqAv node 28:3474 (Emergency assistance map, maintenance
// guide, workshop status card). Shared by the Make app (Mockup.tsx) and Framer code components, so keep it
// host-agnostic: no CSS imports, no asset paths, and the generation runtime passed in.
// The OS status bars are left out; spacers keep both headers at their design height. The final state is static.

export type GenerationHandle = {
  finished: Promise<unknown>
  cancel: () => void
}

export type GenerateFn = (
  element: Element,
  options: Record<string, unknown>,
) => GenerationHandle

type CarDoctorProps = {
  /** The transitions-ui-generation runtime's generate(). Passed in so each host can import it its own way. */
  generate: GenerateFn
  /** Resolves a design SVG file name (for example "4069e.svg") to a URL. */
  asset: (name: string) => string
  /** false renders the finished screen without animating (for example, on the Framer canvas). */
  enabled?: boolean
  /** Share of the screen (or of the viewport, for a screen taller than it) that must be visible before it plays. */
  threshold?: number
  /** false plays again each time the screen re-enters the view. */
  playOnce?: boolean
  delay?: number
  /** Per-region build time passed to the runtime (ms). Unset keeps the runtime default. */
  duration?: number
  /** Called once every region has revealed (not on cancel). */
  onFinished?: () => void
}

const THRESHOLD_STEPS = Array.from({ length: 21 }, (_, i) => i / 20)
// transitions-ui-generation: several elements at once play skeleton each, about 260ms apart,
// and busy components lower maxParts to 30 so the parts phase reads as a sequence.
const STAGGER = 260
const MAX_PARTS = 30

type HiddenEl = HTMLElement & { __tGenOpacity?: string }

export default function CarDoctorScreen({
  generate,
  asset,
  enabled = true,
  threshold = 0.35,
  playOnce = true,
  delay = 0,
  duration,
  onFinished,
}: CarDoctorProps) {
  const screenRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const serviceRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const onFinishedRef = useRef(onFinished)
  onFinishedRef.current = onFinished
  // Server-rendered markup stays hidden until the runtime takes over, so the hi-fi screen never flashes first.
  const [pending, setPending] = useState(enabled)

  const imgMainRoad = asset('5cfd9.svg')
  const imgCrossRoad = asset('33a92.svg')
  const imgLocalRoad = asset('5cbcf.svg')
  const imgLocalRoad1 = asset('e94c6.svg')
  const imgBlockRoad = asset('55b29.svg')
  const imgBlockRoad1 = asset('8b884.svg')
  const imgCurrentLocation = asset('2be95.svg')
  const imgWrench = asset('4069e.svg')
  const imgWrench1 = asset('df35e.svg')
  const imgWrench2 = asset('bd011.svg')
  const imgLocateFixed = asset('2ccc2.svg')
  const imgArrowUp = asset('48b1a.svg')
  const imgMapPin = asset('1dbdf.svg')
  const imgArrowCircleLeft = asset('4d902.svg')
  const imgCurrentPoint = asset('1e3fe.svg')
  const imgDestinationPoint = asset('dfc63.svg')

  // Blueprint to hi-fi: the map card, the maintenance guide and the status card each play the
  // transitions-ui-generation skeleton, 260ms apart in reading order, once fonts and icons are ready
  // and the screen has scrolled into view.
  useLayoutEffect(() => {
    const root = screenRef.current
    const regions = [
      mapRef.current,
      serviceRef.current,
      statusRef.current,
    ].filter(Boolean) as HiddenEl[]
    if (!root || !enabled || regions.length === 0) {
      setPending(false)
      return
    }
    // The runtime restores __tGenOpacity at every reveal, including after an interrupted replay.
    for (const el of regions) {
      el.__tGenOpacity = el.style.opacity
      el.style.opacity = '0'
    }
    setPending(false)

    let disposed = false
    let ready = false
    let inView = false
    let played = false
    let running = false
    let runs: GenerationHandle[] = []

    const play = () => {
      played = true
      running = true
      const timing = duration ? { duration } : {}
      const current = regions.map((el, i) =>
        generate(el, {
          mode: 'skeleton',
          delay: delay + i * STAGGER,
          maxParts: MAX_PARTS,
          ...timing,
        }),
      )
      runs = current
      Promise.all(current.map((run) => run.finished)).then(() => {
        if (runs === current) running = false
        if (!disposed) onFinishedRef.current?.()
      })
    }

    const maybePlay = () => {
      if (disposed || !ready || !inView || running || (playOnce && played))
        return
      play()
      if (playOnce) observer.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            inView = false
            continue
          }
          const viewport = entry.rootBounds?.height ?? window.innerHeight
          const visible =
            entry.intersectionRatio >= threshold ||
            entry.intersectionRect.height >= viewport * threshold
          if (!visible || inView) continue
          inView = true
          maybePlay()
        }
      },
      { threshold: THRESHOLD_STEPS },
    )
    observer.observe(root)

    const images = Array.from(root.querySelectorAll('img'))
    Promise.all([
      document.fonts.ready,
      ...images.map((img) => img.decode().catch(() => undefined)),
    ]).then(() => {
      ready = true
      maybePlay()
    })

    return () => {
      disposed = true
      observer.disconnect()
      for (const run of runs) run.cancel()
      for (const el of regions) {
        el.style.opacity = el.__tGenOpacity ?? ''
        delete el.__tGenOpacity
      }
    }
  }, [enabled, generate, threshold, playOnce, delay, duration])

  return (
    // Fixed at the design's size (three columns, 928px). No reflow: the cinematic scales the whole row.
    <div
      className="cd-root flex shrink-0"
      data-cd-pending={pending ? '' : undefined}
    >
      <div
        ref={screenRef}
        className="bg-[#ececec] flex gap-[32px] items-start"
        data-node-id="28:3475"
        data-name="Frame 1948756531"
      >
        <div
          className="bg-[#f5f5ff] h-[641.788px] overflow-clip relative rounded-[27.375px] shadow-[0px_3.042px_9.277px_0px_rgba(0,0,0,0.06)] shrink-0 w-[296.561px]"
          ref={mapRef}
          data-cd-region=""
          data-node-id="28:3476"
          data-name="Nearby help map"
        >
          <div
            className="absolute bg-[#ececec] h-[395.414px] left-0 overflow-clip top-0 w-[296.561px]"
            data-node-id="28:3477"
            data-name="Nearby services map"
          >
            <div
              className="absolute bg-gradient-to-b from-[#f7f7f7] h-[395.414px] left-0 to-[#d9d9d9] top-0 w-[296.561px]"
              data-node-id="28:3478"
              data-name="Map tint"
            />
            <div
              className="absolute flex h-[74.306px] items-center justify-center left-[-21.29px] top-[89.73px] w-[349.584px]"
              data-node-id="28:3479"
            >
              <div className="flex-none rotate-12">
                <div
                  className="h-0 relative w-[357.394px]"
                  data-name="Main road"
                >
                  <div className="absolute inset-[-19.01px_0_0_0]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      src={imgMainRoad}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute flex h-[370.462px] items-center justify-center left-[68.44px] top-[-27.37px] w-[85.528px]"
              data-node-id="28:3480"
            >
              <div className="flex-none rotate-77">
                <div
                  className="h-0 relative w-[380.206px]"
                  data-name="Cross road"
                >
                  <div className="absolute inset-[-15.21px_0_0_0]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      src={imgCrossRoad}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute flex h-[106.453px] items-center justify-center left-[-7.6px] top-[102.66px] w-[309.163px]"
              data-node-id="28:3481"
            >
              <div className="-rotate-19 flex-none">
                <div
                  className="h-0 relative w-[326.977px]"
                  data-name="Local road"
                >
                  <div className="absolute inset-[-9.12px_0_0_0]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      src={imgLocalRoad}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute flex h-[175.038px] items-center justify-center left-[136.87px] top-[28.9px] w-[169.033px]"
              data-node-id="28:3482"
            >
              <div className="flex-none rotate-46">
                <div
                  className="h-0 relative w-[243.332px]"
                  data-name="Local road"
                >
                  <div className="absolute inset-[-7.6px_0_0_0]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      src={imgLocalRoad1}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute flex h-[9.941px] items-center justify-center left-[11.41px] top-[41.06px] w-[113.628px]"
              data-node-id="28:3483"
            >
              <div className="flex-none rotate-5">
                <div
                  className="h-0 relative w-[114.062px]"
                  data-name="Block road"
                >
                  <div className="absolute inset-[-6.08px_0_0_0]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      src={imgBlockRoad}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute flex h-[4.777px] items-center justify-center left-[179.46px] top-[187.06px] w-[136.791px]"
              data-node-id="28:3484"
            >
              <div className="flex-none rotate-2">
                <div
                  className="h-0 relative w-[136.874px]"
                  data-name="Block road"
                >
                  <div className="absolute inset-[-6.08px_0_0_0]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      src={imgBlockRoad1}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute left-[122.43px] size-[31.937px] top-[184.02px]"
              data-node-id="28:3485"
              data-name="Current location"
            >
              <div className="absolute inset-[-8.33%_-27.38%_-46.43%_-27.38%]">
                <img
                  alt=""
                  className="block max-w-none size-full"
                  src={imgCurrentLocation}
                />
              </div>
            </div>
            <div
              className="absolute content-stretch flex flex-col items-center left-[219px] top-[193.14px]"
              data-node-id="28:3487"
              data-name="Service marker"
            >
              <div
                className="bg-[#292d32] border-[2.281px] border-solid border-white content-stretch flex items-center justify-center overflow-clip relative rounded-[759.652px] shadow-[0px_6.083px_18.25px_0px_rgba(0,0,0,0.08)] shrink-0 size-[25.854px]"
                data-node-id="28:3488"
                data-name="Marker pin"
              >
                <div
                  className="relative shrink-0 size-[11.406px]"
                  data-node-id="28:3489"
                  data-name="wrench"
                >
                  <img
                    alt=""
                    className="absolute block inset-0 max-w-none size-full"
                    src={imgWrench}
                  />
                </div>
              </div>
            </div>
            <div
              className="absolute content-stretch flex flex-col items-center left-[53.23px] top-[142.96px]"
              data-node-id="28:3491"
              data-name="Service marker"
            >
              <div
                className="bg-[#292d32] border-[2.281px] border-solid border-white content-stretch flex items-center justify-center overflow-clip relative rounded-[759.652px] shadow-[0px_6.083px_18.25px_0px_rgba(0,0,0,0.08)] shrink-0 size-[25.854px]"
                data-node-id="28:3492"
                data-name="Marker pin"
              >
                <div
                  className="relative shrink-0 size-[11.406px]"
                  data-node-id="28:3493"
                  data-name="wrench"
                >
                  <img
                    alt=""
                    className="absolute block inset-0 max-w-none size-full"
                    src={imgWrench1}
                  />
                </div>
              </div>
            </div>
            <div
              className="absolute content-stretch flex flex-col gap-[1.521px] items-center left-[170.33px] top-[117.1px]"
              data-node-id="28:3495"
              data-name="Service marker"
            >
              <div
                className="[word-break:break-word] bg-white content-stretch flex gap-[5.323px] items-center leading-[normal] not-italic overflow-clip px-[7.604px] py-[5.323px] relative rounded-[759.652px] shadow-[0px_6.083px_18.25px_0px_rgba(0,0,0,0.08)] shrink-0 text-[8.365px] whitespace-nowrap"
                data-node-id="28:3496"
                data-name="Marker detail"
              >
                <p
                  className="font-['Be_Vietnam_Pro:SemiBold'] relative shrink-0 text-[#292d32]"
                  data-node-id="28:3497"
                >
                  11 min
                </p>
                <p
                  className="font-['Be_Vietnam_Pro:Bold'] relative shrink-0 text-[#ff5e67]"
                  data-node-id="28:3498"
                >
                  2.23M₫
                </p>
              </div>
              <div
                className="bg-[#292d32] border-[2.281px] border-solid border-white content-stretch flex items-center justify-center overflow-clip relative rounded-[759.652px] shadow-[0px_6.083px_18.25px_0px_rgba(0,0,0,0.08)] shrink-0 size-[25.854px]"
                data-node-id="28:3499"
                data-name="Marker pin"
              >
                <div
                  className="relative shrink-0 size-[11.406px]"
                  data-node-id="28:3500"
                  data-name="wrench"
                >
                  <img
                    alt=""
                    className="absolute block inset-0 max-w-none size-full"
                    src={imgWrench2}
                  />
                </div>
              </div>
            </div>
            <div
              className="absolute bg-[rgba(255,255,255,0.8)] content-stretch flex items-center justify-center left-[250.94px] overflow-clip rounded-[759.652px] shadow-[0px_6.083px_18.25px_0px_rgba(0,0,0,0.08)] size-[33.458px] top-[343.71px]"
              data-node-id="28:3502"
              data-name="Map controls"
            >
              <div
                className="relative shrink-0 size-[15.208px]"
                data-node-id="28:3503"
                data-name="locate-fixed"
              >
                <img
                  alt=""
                  className="absolute block inset-0 max-w-none size-full"
                  src={imgLocateFixed}
                />
              </div>
            </div>
          </div>
          <div
            className="absolute bg-white content-stretch drop-shadow-[0px_-6.083px_10.646px_rgba(36,26,143,0.12)] flex flex-col gap-[10.646px] h-[342.186px] items-center left-0 pb-[15.208px] pt-[7.604px] px-[13.687px] rounded-tl-[22.812px] rounded-tr-[22.812px] top-[299.6px] w-[296.561px]"
            data-node-id="28:3505"
            data-name="Nearby help sheet"
          >
            <div
              className="bg-[#d5d4e5] h-[3.802px] relative rounded-[759.652px] shrink-0 w-[33.458px]"
              data-node-id="28:3506"
              data-name="Drag handle"
            />
            <div
              className="content-stretch flex flex-col gap-[18.25px] items-start relative shrink-0 w-full"
              data-node-id="28:3507"
            >
              <div
                className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full"
                data-node-id="28:3508"
                data-name="Sheet heading"
              >
                <div
                  className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-[187.061px]"
                  data-node-id="28:3509"
                  data-name="Heading copy"
                >
                  <p
                    className="[word-break:break-word] font-['Be_Vietnam_Pro:Medium'] leading-[1.12] not-italic relative shrink-0 text-[#292d32] text-[18.25px] tracking-[-0.365px] w-full"
                    data-node-id="28:3510"
                  >
                    Your help is near.
                  </p>
                </div>
              </div>
              <div
                className="bg-white border-[#453eed] border-[1.521px] border-solid content-stretch flex flex-col gap-[9.125px] items-start overflow-clip p-[10.646px] relative rounded-[13.687px] shadow-[0px_6.083px_18.25px_0px_rgba(36,26,143,0.08)] shrink-0 w-full"
                data-node-id="28:3511"
                data-name="Best match"
              >
                <div
                  className="content-stretch flex items-center overflow-clip relative shrink-0 w-full"
                  data-node-id="28:3512"
                  data-name="Provider summary"
                >
                  <div
                    className="content-stretch flex flex-[1_0_0] flex-col gap-[1.521px] items-start min-w-px overflow-clip relative"
                    data-node-id="28:3513"
                    data-name="Provider copy"
                  >
                    <div
                      className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full"
                      data-node-id="28:3514"
                      data-name="Provider name row"
                    >
                      <p
                        className="[word-break:break-word] font-['Be_Vietnam_Pro:Regular'] leading-[normal] not-italic relative shrink-0 text-[#292d32] text-[11.406px] whitespace-nowrap"
                        data-node-id="28:3515"
                      >
                        Northside Road Assist
                      </p>
                      <div
                        className="bg-[#ecfeff] content-stretch flex items-center overflow-clip px-[7.604px] py-[5.323px] relative rounded-[759.652px] shrink-0"
                        data-node-id="28:3516"
                        data-name="Info pill"
                      >
                        <p
                          className="[word-break:break-word] font-['Be_Vietnam_Pro:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#14b8d4] text-[8.365px] whitespace-nowrap"
                          data-node-id="28:3517"
                        >
                          Best ETA
                        </p>
                      </div>
                    </div>
                    <p
                      className="[word-break:break-word] font-['Be_Vietnam_Pro:Regular'] leading-[normal] not-italic relative shrink-0 text-[#7d8896] text-[8.365px] whitespace-nowrap"
                      data-node-id="28:3518"
                    >
                      24/7 roadside assistance
                    </p>
                  </div>
                </div>
                <div
                  className="[word-break:break-word] content-stretch flex font-['Be_Vietnam_Pro:SemiBold'] gap-[6.083px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap"
                  data-node-id="28:3519"
                  data-name="Scannable facts"
                >
                  <div
                    className="bg-[#ecebff] content-stretch flex flex-[1_0_0] flex-col gap-[1.521px] items-start min-w-px overflow-clip px-[7.604px] py-[6.844px] relative rounded-[10.646px]"
                    data-node-id="28:3520"
                    data-name="Arrival fact"
                  >
                    <p
                      className="relative shrink-0 text-[#7d8896] text-[6.844px] uppercase"
                      data-node-id="28:3521"
                    >
                      Arrival
                    </p>
                    <p
                      className="relative shrink-0 text-[#453eed] text-[13.687px]"
                      data-node-id="28:3522"
                    >
                      11 min
                    </p>
                  </div>
                  <div
                    className="bg-[#ecebff] content-stretch flex flex-[1_0_0] flex-col gap-[1.521px] items-start min-w-px overflow-clip px-[7.604px] py-[6.844px] relative rounded-[10.646px]"
                    data-node-id="28:3523"
                    data-name="Distance fact"
                  >
                    <p
                      className="relative shrink-0 text-[#7d8896] text-[6.844px] uppercase"
                      data-node-id="28:3524"
                    >
                      Distance
                    </p>
                    <p
                      className="relative shrink-0 text-[#453eed] text-[13.687px]"
                      data-node-id="28:3525"
                    >
                      2.4 mi
                    </p>
                  </div>
                  <div
                    className="content-stretch flex flex-[1_0_0] flex-col gap-[1.521px] items-start min-w-px overflow-clip px-[7.604px] py-[6.844px] relative rounded-[10.646px]"
                    data-node-id="28:3526"
                    data-name="Total fact"
                  >
                    <p
                      className="relative shrink-0 text-[#7d8896] text-[6.844px] uppercase"
                      data-node-id="28:3527"
                    >
                      Est. total
                    </p>
                    <p
                      className="relative shrink-0 text-[#453eed] text-[13.687px]"
                      data-node-id="28:3528"
                    >
                      2.23M₫
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="border-[#c6c6c6] border-[0.76px] border-solid content-stretch flex gap-[7.604px] items-center overflow-clip px-[9.125px] py-[15.208px] relative rounded-[12.167px] shrink-0 w-full"
              data-node-id="28:3529"
              data-name="Comparison preview"
            >
              <div
                className="content-stretch flex flex-[1_0_0] items-center min-w-px overflow-clip relative"
                data-node-id="28:3530"
                data-name="Provider preview"
              >
                <div
                  className="content-stretch flex flex-col items-start overflow-clip relative shrink-0"
                  data-node-id="28:3531"
                  data-name="Preview copy"
                >
                  <p
                    className="[word-break:break-word] font-['Be_Vietnam_Pro:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#292d32] text-[10.646px] whitespace-nowrap"
                    data-node-id="28:3532"
                  >
                    3 more options from 2.00M₫
                  </p>
                </div>
              </div>
              <p
                className="[word-break:break-word] font-['Be_Vietnam_Pro:Regular'] leading-[normal] not-italic relative shrink-0 text-[#453eed] text-[10.646px] whitespace-nowrap"
                data-node-id="28:3533"
              >
                See all 3
              </p>
            </div>
            <div
              className="bg-[#453eed] content-stretch flex h-[44.104px] items-center justify-between overflow-clip px-[12.167px] relative rounded-[10.646px] shrink-0 w-full"
              data-node-id="28:3534"
              data-name="Primary action"
            >
              <div
                className="content-stretch flex flex-col items-start overflow-clip relative shrink-0"
                data-node-id="28:3535"
                data-name="Action label"
              >
                <p
                  className="[word-break:break-word] font-['Be_Vietnam_Pro:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12.167px] text-white whitespace-nowrap"
                  data-node-id="28:3536"
                >
                  Continue with Northside
                </p>
              </div>
              <div
                className="flex items-center justify-center relative shrink-0 size-[24.333px]"
                data-node-id="28:3537"
              >
                <div className="flex-none rotate-90">
                  <div
                    className="content-stretch flex items-center justify-center overflow-clip relative rounded-[759.652px] size-[24.333px]"
                    data-name="Action icon"
                  >
                    <div
                      className="relative shrink-0 size-[12.927px]"
                      data-node-id="28:3538"
                      data-name="arrow-up"
                    >
                      <img
                        alt=""
                        className="absolute block inset-0 max-w-none size-full"
                        src={imgArrowUp}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="absolute bg-white content-stretch flex gap-[6.083px] items-center left-[13.69px] overflow-clip px-[9.125px] py-[6.844px] rounded-[759.652px] shadow-[0px_6.083px_18.25px_0px_rgba(36,26,143,0.08)] top-[88.21px]"
            data-node-id="28:3540"
            data-name="Location confirmation"
          >
            <div
              className="relative shrink-0 size-[12.167px]"
              data-node-id="28:3541"
              data-name="map-pin"
            >
              <img
                alt=""
                className="absolute block inset-0 max-w-none size-full"
                src={imgMapPin}
              />
            </div>
            <p
              className="[word-break:break-word] font-['Be_Vietnam_Pro:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#292d32] text-[8.365px] whitespace-nowrap"
              data-node-id="28:3543"
            >
              214 W 38th St · Curbside
            </p>
          </div>
          <div
            className="absolute bg-[rgba(21,12,223,0.8)] content-stretch flex flex-col h-[69.958px] items-start left-0 overflow-clip top-0 w-[296.561px]"
            data-node-id="28:3544"
            data-name="Header"
          >
            <div
              className="h-[33.458px] shrink-0 w-full"
              data-name="Status bar spacer"
            />
            <div
              className="content-stretch flex gap-[7.604px] h-[36.5px] items-center px-[12.167px] py-[7.604px] relative shrink-0 w-[296.561px]"
              data-node-id="28:3554"
              data-name="Back navigation"
            >
              <div
                className="content-stretch flex items-start relative shrink-0"
                data-node-id="I28:3554;908:4454"
                data-name="vuesax/linear/arrow-circle-left"
              >
                <div
                  className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0"
                  data-node-id="I28:3554;908:4454;561:1499"
                  data-name="vuesax/linear/arrow-circle-left"
                >
                  <div
                    className="col-1 ml-0 mt-0 relative row-1 size-[18.25px]"
                    data-node-id="I28:3554;908:4454;561:1500"
                    data-name="arrow-circle-left"
                  >
                    <img
                      alt=""
                      className="absolute block inset-0 max-w-none size-full"
                      src={imgArrowCircleLeft}
                    />
                  </div>
                </div>
              </div>
              <p
                className="[word-break:break-word] absolute font-['Be_Vietnam_Pro:SemiBold'] leading-[13.877px] left-[calc(50%-102.66px)] not-italic text-[#f7f7f7] text-[9.25px] top-[9.12px] tracking-[-0.3042px] w-[205.311px]"
                data-node-id="I28:3554;908:4455"
              >
                Emergency assistance
              </p>
            </div>
          </div>
        </div>
        <div
          className="bg-[#453eed] content-stretch flex flex-col h-[641.788px] items-start justify-between overflow-clip relative rounded-[24.333px] shrink-0 w-[296.561px]"
          ref={serviceRef}
          data-cd-region=""
          data-node-id="28:3555"
          data-name="Evolved · Next service"
        >
          <div
            className="content-stretch flex flex-col h-[395.414px] items-start overflow-clip relative shrink-0 w-full"
            data-node-id="28:3556"
            data-name="Road ahead hero"
          >
            <div
              className="content-stretch flex flex-col items-start relative shrink-0 w-full"
              data-node-id="28:3557"
            >
              <div
                className="h-[69.958px] overflow-clip relative shrink-0 w-full"
                data-node-id="28:3558"
                data-name="Header"
              >
                <div
                  className="absolute content-stretch flex flex-col items-start left-0 top-0 w-[296.561px]"
                  data-node-id="28:3559"
                >
                  <div
                    className="h-[33.458px] shrink-0 w-full"
                    data-name="Status bar spacer"
                  />
                  <div
                    className="content-stretch flex h-[36.5px] items-center justify-between px-[12.167px] py-[7.604px] relative shrink-0 w-[285.155px]"
                    data-node-id="28:3576"
                    data-name="Top bar"
                  >
                    <div
                      className="content-stretch flex items-start relative shrink-0"
                      data-node-id="I28:3576;908:4464"
                      data-name="vuesax/linear/arrow-circle-left"
                    >
                      <div
                        className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0"
                        data-node-id="I28:3576;908:4464;561:1499"
                        data-name="vuesax/linear/arrow-circle-left"
                      >
                        <div
                          className="col-1 ml-0 mt-0 relative row-1 size-[18.25px]"
                          data-node-id="I28:3576;908:4464;561:1500"
                          data-name="arrow-circle-left"
                        >
                          <img
                            alt=""
                            className="absolute block inset-0 max-w-none size-full"
                            src={imgArrowCircleLeft}
                          />
                        </div>
                      </div>
                    </div>
                    <p
                      className="[word-break:break-word] font-['Be_Vietnam_Pro:SemiBold'] leading-[13.877px] not-italic relative shrink-0 text-[#f7f7f7] text-[9.25px] tracking-[-0.3042px] w-[205.311px]"
                      data-node-id="I28:3576;908:4465"
                    >
                      Your maintenance guide
                    </p>
                    <div
                      className="shrink-0 size-[18.25px]"
                      data-name="Action spacer"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className="[word-break:break-word] content-stretch flex flex-col gap-[6.083px] items-start not-italic overflow-clip pt-[24.333px] px-[15.208px] relative shrink-0 w-full"
              data-node-id="28:3577"
              data-name="Due guidance"
            >
              <p
                className="font-['Be_Vietnam_Pro:Light'] leading-[51.708px] relative shrink-0 text-[47.146px] text-white tracking-[-2.2812px] whitespace-nowrap"
                data-node-id="28:3578"
              >
                90,000
              </p>
              <p
                className="font-['Be_Vietnam_Pro:Regular'] leading-[normal] relative shrink-0 text-[15.208px] text-[rgba(255,255,255,0.71)] whitespace-nowrap"
                data-node-id="28:3579"
              >
                kilometres
              </p>
              <p
                className="font-['Be_Vietnam_Pro:Regular'] leading-[15.208px] relative shrink-0 text-[9.885px] text-[rgba(255,255,255,0.78)] w-[146.735px]"
                data-node-id="28:3580"
              >
                Around February 2025, or earlier if you reach the mileage first.
                This is an example guidance only.
              </p>
            </div>
            <div
              className="absolute bg-[rgba(255,255,255,0.24)] h-[235.728px] left-[214.44px] rounded-[12757591px] top-[106.46px] w-[2.281px]"
              data-node-id="28:3581"
              data-name="Road"
            />
            <div
              className="absolute left-[208.35px] size-[14.448px] top-[191.62px]"
              data-node-id="28:3582"
              data-name="Current point"
            >
              <img
                alt=""
                className="absolute block inset-0 max-w-none size-full"
                src={imgCurrentPoint}
              />
            </div>
            <div
              className="absolute left-[208.35px] size-[14.448px] top-[307.21px]"
              data-node-id="28:3583"
              data-name="Destination point"
            >
              <img
                alt=""
                className="absolute block inset-0 max-w-none size-full"
                src={imgDestinationPoint}
              />
            </div>
            <p
              className="[word-break:break-word] absolute font-['Be_Vietnam_Pro:SemiBold'] leading-[normal] left-[231.17px] not-italic text-[6.844px] text-[rgba(255,255,255,0.71)] top-[194.67px] whitespace-nowrap"
              data-node-id="28:3584"
            >
              84,120 now
            </p>
            <p
              className="[word-break:break-word] absolute font-['Be_Vietnam_Pro:SemiBold'] leading-[normal] left-[231.17px] not-italic text-[6.844px] text-white top-[310.25px] whitespace-nowrap"
              data-node-id="28:3585"
            >
              90,000 due
            </p>
          </div>
          <div
            className="bg-white content-stretch flex flex-[1_0_0] flex-col gap-[15.208px] items-start min-h-px overflow-clip pb-[15.208px] pt-[21.292px] px-[15.208px] relative rounded-tl-[21.292px] rounded-tr-[21.292px] w-full"
            data-node-id="28:3586"
            data-name="Road ahead sheet"
          >
            <div
              className="content-stretch flex gap-[15.208px] items-start overflow-clip relative shrink-0 w-full"
              data-node-id="28:3587"
              data-name="Priority guidance"
            >
              <div
                className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-[76.041px]"
                data-node-id="28:3588"
                data-name="Priority"
              >
                <p
                  className="[word-break:break-word] font-['Be_Vietnam_Pro:Medium'] leading-[normal] not-italic relative shrink-0 text-[#202438] text-[13.687px] tracking-[-0.1369px] whitespace-nowrap"
                  data-node-id="28:3589"
                >
                  Monitor
                </p>
              </div>
              <p
                className="[word-break:break-word] flex-[1_0_0] font-['Be_Vietnam_Pro:Regular'] leading-[12.927px] min-w-px not-italic relative text-[#707487] text-[8.365px]"
                data-node-id="28:3590"
              >
                Recheck front rotors. Book earlier if vibration, noise or
                braking changes return.
              </p>
            </div>
            <div
              className="bg-[#e7e7f0] h-[0.76px] relative shrink-0 w-full"
              data-node-id="28:3591"
              data-name="Divider"
            />
            <div
              className="[word-break:break-word] content-stretch flex gap-[12.167px] items-baseline leading-[13.687px] not-italic overflow-clip py-[3.042px] relative shrink-0 text-[9.125px] w-full"
              data-node-id="28:3592"
              data-name="Detail row"
            >
              <p
                className="flex-[1_0_0] font-['Be_Vietnam_Pro:Regular'] min-w-px relative text-[#707487]"
                data-node-id="28:3593"
              >
                Routine at this interval
              </p>
              <p
                className="font-['Be_Vietnam_Pro:SemiBold'] relative shrink-0 text-[#202438] text-right whitespace-nowrap"
                data-node-id="28:3594"
              >
                Oil, filter, tyre wear
              </p>
            </div>
            <div
              className="[word-break:break-word] content-stretch flex gap-[12.167px] items-baseline leading-[13.687px] not-italic overflow-clip py-[3.042px] relative shrink-0 text-[9.125px] w-full"
              data-node-id="28:3595"
              data-name="Detail row"
            >
              <p
                className="flex-[1_0_0] font-['Be_Vietnam_Pro:Regular'] min-w-px relative text-[#707487]"
                data-node-id="28:3596"
              >
                Reminder suggestion
              </p>
              <p
                className="font-['Be_Vietnam_Pro:SemiBold'] relative shrink-0 text-[#202438] text-right whitespace-nowrap"
                data-node-id="28:3597"
              >
                89,000 km
              </p>
            </div>
            <div
              className="content-stretch flex items-start relative shrink-0 w-[266.144px]"
              data-node-id="28:3598"
              data-name="Primary action"
            >
              <div
                className="content-stretch flex flex-[1_0_0] items-start min-w-px relative"
                data-node-id="I28:3598;1152:4970"
                data-name="Size Button"
              >
                <div
                  className="bg-gradient-to-t content-stretch flex flex-[1_0_0] from-[#4355f5] gap-[3.042px] h-[36.5px] items-center justify-center min-w-px px-[12.167px] py-[6.083px] relative rounded-[10.646px] to-[#6574ff] to-[84.896%]"
                  data-node-id="I28:3598;1152:4970;1152:4741"
                  data-name="Button"
                >
                  <div
                    className="[word-break:break-word] flex flex-col font-['Be_Vietnam_Pro:SemiBold'] justify-center leading-[0] not-italic relative shrink-0 text-[9.25px] text-white whitespace-nowrap"
                    data-node-id="I28:3598;1152:4970;1152:4743"
                  >
                    <p className="leading-[13.877px]">
                      Browse suggested services
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="bg-white content-stretch flex flex-col h-[15.208px] items-center justify-center overflow-clip relative shrink-0 w-full"
            data-node-id="28:3599"
            data-name="Home indicator"
          >
            <div
              className="bg-[#242438] h-[3.042px] opacity-65 relative rounded-[12757591px] shrink-0 w-[91.249px]"
              data-node-id="28:3600"
              data-name="Gesture bar"
            />
          </div>
        </div>
        <div
          className="bg-[#f7f3ff] content-stretch flex flex-col items-start justify-between overflow-clip px-[17.29px] py-[18.731px] relative rounded-[23.053px] shrink-0 size-[270.876px]"
          ref={statusRef}
          data-cd-region=""
          data-node-id="28:3601"
          data-name="Cards"
        >
          <div
            className="content-stretch flex flex-col gap-[14.408px] items-start relative shrink-0 w-full"
            data-node-id="28:3602"
          >
            <div
              className="content-stretch flex items-center justify-between relative shrink-0 w-full"
              data-node-id="28:3603"
              data-name="header"
            >
              <div
                className="content-stretch flex flex-col items-start relative shrink-0"
                data-node-id="28:3604"
                data-name="title-group"
              >
                <p
                  className="[word-break:break-word] font-['Be_Vietnam_Pro:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#6b5e7d] text-[9.365px] whitespace-nowrap"
                  data-node-id="28:3605"
                >
                  VALERIE’S MECHANICS
                </p>
              </div>
            </div>
            <div
              className="[word-break:break-word] font-['Be_Vietnam_Pro:Medium'] leading-[0] not-italic relative shrink-0 text-[#2e1a63] text-[23.053px] tracking-[-0.9221px] w-full"
              data-node-id="28:3606"
            >
              <p className="leading-[normal] mb-0">
                Engine timing fix has been done.
              </p>
              <p className="font-['Be_Vietnam_Pro:Light'] leading-[normal]">
                Final inspection and handover will be next.
              </p>
            </div>
          </div>
          <div
            className="bg-[#5b3c9a] content-stretch flex items-center px-[8.645px] py-[5.763px] relative rounded-[719.694px] shrink-0"
            data-node-id="28:3607"
            data-name="eta-chip"
          >
            <p
              className="[word-break:break-word] font-['Be_Vietnam_Pro:Medium'] leading-[normal] not-italic relative shrink-0 text-[#f7f3ff] text-[14.408px] whitespace-nowrap"
              data-node-id="28:3608"
            >
              ETA 04:00 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
