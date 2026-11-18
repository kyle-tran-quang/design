import { useEffect, useRef, type Ref } from "react"
import { motion, useReducedMotion, type MotionValue } from "motion/react"
import { scrollToSection } from "@/hooks/useHorizontalScroll"
import { asset } from "@/lib/asset"

/*
 * The hero character runs in place; click it and a stone rolls in from the right edge of the screen. The stone's
 * speed is picked from where the run cycle is at the moment of the click, so it always reaches the character just
 * as the leap pose (frame 4 of 6) is on screen, and the character hops over it at the same time.
 *
 * The run cycle is the old GIF's six 130ms frames laid out as one sprite sheet and stepped with the Web Animations
 * API. Unlike a GIF, its phase can be read, so the stone can be timed against it.
 */
const FRAMES = 6
const FRAME_MS = 130
const CYCLE_MS = FRAMES * FRAME_MS
/** Frame 4 (index 3) is the leap, with both legs fully stretched. Aim for the middle of it. */
const JUMP_FRAME = 3
const JUMP_MID_MS = JUMP_FRAME * FRAME_MS + FRAME_MS / 2
/** The stone takes between MIN_CROSS_MS and MIN_CROSS_MS + CYCLE_MS to reach the character, depending on the phase. */
const MIN_CROSS_MS = 900
const HOP_MS = 400
const HOP_HEIGHT = 44
const STONE_SIZE = 36

const mod = (value: number, by: number) => ((value % by) + by) % by

type Props = {
  innerRef: Ref<HTMLButtonElement>
  x: MotionValue<number>
}

export default function ChibiRunner({ innerRef, x }: Props) {
  const reduced = useReducedMotion()
  const sheetRef = useRef<HTMLImageElement>(null)
  const hopRef = useRef<HTMLSpanElement>(null)
  const stoneRef = useRef<HTMLSpanElement>(null)
  const runRef = useRef<Animation | null>(null)
  const flight = useRef<Animation[]>([])

  // The run cycle: slide the sheet one frame-width at a time. Reduced motion leaves it parked on the first frame.
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet || reduced) return
    const run = sheet.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-100%)" }],
      {
        duration: CYCLE_MS,
        iterations: Infinity,
        easing: `steps(${FRAMES})`,
      },
    )
    runRef.current = run
    return () => {
      run.cancel()
      runRef.current = null
      flight.current.forEach((animation) => animation.cancel())
      flight.current = []
    }
  }, [reduced])

  const throwStone = () => {
    const run = runRef.current
    const stone = stoneRef.current
    const hop = hopRef.current
    // One stone at a time.
    if (!run || !stone || !hop || flight.current.length) return

    // How far into the 780ms cycle we are, and how long the stone must take so the cycle is at the leap on arrival.
    const phase = mod(Number(run.currentTime ?? 0), CYCLE_MS)
    const cross =
      MIN_CROSS_MS + mod(JUMP_MID_MS - phase - MIN_CROSS_MS, CYCLE_MS)

    // Distances are in the stone's own pixels (the homepage track is zoomed), from the character to just past each
    // edge of the screen.
    const rect = stone.getBoundingClientRect()
    const scale = rect.width / stone.offsetWidth || 1
    const toRight = (window.innerWidth - rect.left) / scale + 8
    const toLeft = rect.right / scale + 8
    // Constant speed, so the time to reach the character is `cross` and the whole trip is a little longer.
    const total = (cross * (toRight + toLeft)) / toRight
    const turns = -((toRight + toLeft) / (STONE_SIZE / 2)) * (180 / Math.PI)

    const roll = stone.animate(
      [
        { transform: `translateX(${toRight}px) rotate(0deg)`, opacity: 1 },
        {
          transform: `translateX(${-toLeft}px) rotate(${turns}deg)`,
          opacity: 1,
        },
      ],
      { duration: total, easing: "linear" },
    )
    const leap = hop.animate(
      [
        {
          transform: "translateY(0)",
          easing: "cubic-bezier(0.2, 0.7, 0.4, 1)",
        },
        {
          transform: `translateY(${-HOP_HEIGHT}px)`,
          offset: 0.5,
          easing: "cubic-bezier(0.6, 0, 0.8, 0.3)",
        },
        { transform: "translateY(0)" },
      ],
      { duration: HOP_MS, delay: cross - HOP_MS / 2 },
    )

    // Start both on the same timeline tick the phase was read on, so they don't slip by a frame.
    const now = document.timeline.currentTime
    if (now !== null) {
      roll.startTime = now
      leap.startTime = now
    }
    flight.current = [roll, leap]
    roll.onfinish = roll.oncancel = () => {
      flight.current = []
    }
  }

  return (
    <motion.button
      ref={innerRef}
      type="button"
      style={{ x }}
      onClick={reduced ? () => scrollToSection("aboutme") : throwStone}
      aria-label={reduced ? "Meet Kyle" : "Throw a stone for Kyle to jump over"}
      className="group relative z-20 mx-auto mt-6 block h-[300px] w-[320px] shrink-0 cursor-pointer lg:absolute lg:bottom-4 lg:left-1/2 lg:mt-0 lg:h-[400px] lg:w-[400px] lg:-translate-x-1/2"
    >
      <span className="absolute inset-x-[40px] bottom-0 h-[210px] rounded-t-full bg-mist transition-colors duration-500 group-hover:bg-[#dedede] lg:inset-x-[20px] lg:h-[246px]" />

      {/* The frames have 13/500 of empty space under the feet; the negative offset plants them on the arch's bottom edge. */}
      <span className="absolute -bottom-[7.5px] left-1/2 aspect-square w-[290px] -translate-x-[44%] transition-transform duration-500 ease-out group-hover:-translate-y-2 lg:-bottom-[10px] lg:w-[380px]">
        <span ref={hopRef} className="block size-full">
          <span className="block size-full overflow-hidden">
            <img
              ref={sheetRef}
              src={asset("assets/images/home-hero-chibi-buro-run.png")}
              alt=""
              width={FRAMES * 500}
              height={500}
              fetchPriority="high"
              className="block h-full w-[600%] max-w-none"
            />
          </span>
        </span>
      </span>

      {/* The stone rests (invisible) at the character's feet; each throw slides it in from off-screen right. */}
      <span
        ref={stoneRef}
        aria-hidden
        style={{ width: STONE_SIZE, height: STONE_SIZE }}
        className="pointer-events-none absolute bottom-0 left-[calc(50%+17px)] -ml-[18px] opacity-0 lg:left-[calc(50%+23px)]"
      >
        {/* A plain pebble: one lumpy outline and a single highlight stroke, which also shows it rolling. */}
        <svg
          viewBox="0 0 36 36"
          className="size-full overflow-visible"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M4 22C3 12 11 4 20 4C29 4 34 12 33 21C32 29 25 33 17 33C9 33 4.500 29 4 22Z"
            className="fill-[#dcdcdc] stroke-muted"
            strokeWidth="1.6"
          />
          <path
            d="M11 17C11.500 13 14 10.500 17.500 10"
            className="stroke-muted"
            strokeWidth="1.6"
          />
        </svg>
      </span>
    </motion.button>
  )
}
