import { useId } from "react"
import type { Extra } from "@/content/home"
import { asset } from "@/lib/asset"

/*
 * A sheet of ruled notebook paper. On hover (or keyboard focus) its lower-right corner curls up: the sheet is cut
 * along a diagonal and a shaded flap, the paper's underside, grows out of the corner to sit on that fold.
 * Measurements are in Figma pixels: --u is 1px of the 463px-wide design, so the sheet scales as one piece.
 * The image sits the same distance (--inset) from the margin rule (--rule), the top edge and the right edge.
 */
const RULES = [
  40.94, 71.94, 102.94, 136.94, 171.94, 205.94, 239.94, 273.94, 308.94, 342.94,
]
const EASE =
  "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
// Both polygons have five points so the cut can animate: flat, the last corner is a whole corner; curled, it is
// cut back by --c along each edge.
const SHEET_CLIP =
  "[clip-path:polygon(0_0,100%_0,100%_100%,100%_100%,0_100%)] group-hover:[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_var(--c)),calc(100%_-_var(--c))_100%,0_100%)] group-focus-visible:[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_var(--c)),calc(100%_-_var(--c))_100%,0_100%)]"

export default function ExtraCard({ extra }: { extra: Extra }) {
  // SVG ids can't contain the punctuation React puts in useId values.
  const shade = `curl-${useId().replace(/[^\w-]/g, "")}`

  return (
    <a href={asset(extra.href)} className="group @container block h-full">
      <div className="relative h-full drop-shadow-[0_4px_5px_rgb(0_0_0/0.1)] [--c:calc(var(--u)*42)] [--inset:calc(var(--u)*32)] [--rule:calc(var(--u)*45)] [--u:calc(100cqw/463)]">
        {/* Minimum height leaves room for a three-line title under the image. */}
        <div
          className={`relative h-full min-h-[calc(var(--u)*533)] overflow-hidden rounded-[16px] bg-cloud transition-[clip-path] ${SHEET_CLIP} ${EASE}`}
        >
          {RULES.map((y) => (
            <div
              key={y}
              aria-hidden="true"
              className="absolute inset-x-0 h-0"
              style={{ top: `calc(var(--u) * ${y})` }}
            >
              <div className="absolute inset-[-0.84px_0_0_0]">
                <img
                  alt=""
                  className="block size-full max-w-none"
                  src={asset("assets/faf40.svg")}
                />
              </div>
            </div>
          ))}
          {/* Margin rule: a horizontal line turned upright, stretched to the sheet's height. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-(--rule) flex w-0 items-center justify-center [container-type:size]"
          >
            <div className="h-0 w-[100cqh] flex-none rotate-90">
              <div className="relative size-full">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img
                    alt=""
                    className="block size-full max-w-none"
                    src={asset("assets/8df31.svg")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* The rule is 1px wide, drawn just right of --rule; the image starts --inset past it. */}
          <div className="relative flex flex-col gap-[calc(var(--u)*23)] pt-(--inset) pr-(--inset) pb-[calc(var(--u)*52)] pl-[calc(var(--rule)_+_1px_+_var(--inset))]">
            <div className="aspect-square overflow-hidden rounded-[16px] border border-[#d5c8ca] bg-mist">
              <img
                src={asset(extra.image)}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            </div>
            <h3
              className={`pr-[calc(var(--u)*24)] text-[length:max(16px,calc(var(--u)*20))] leading-[1.2] font-medium tracking-[-0.016em] text-ink transition-colors group-hover:text-accent group-focus-visible:text-accent ${EASE}`}
            >
              {extra.title}
            </h3>
          </div>
        </div>

        {/* The curled corner. Its fold edge runs along the sheet's cut and its free edges bow out like rolled paper;
            a soft, matte shade sits in the fold and lightens gradually toward the tip, like the underside of paper. */}
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className={`pointer-events-none absolute right-0 bottom-0 size-[var(--c)] origin-bottom-right scale-0 overflow-visible drop-shadow-[-1px_2px_3px_rgb(0_0_0/0.1)] transition-[scale] group-hover:scale-100 group-focus-visible:scale-100 ${EASE}`}
        >
          <defs>
            <linearGradient
              id={shade}
              gradientUnits="userSpaceOnUse"
              x1="50"
              y1="50"
              x2="14"
              y2="14"
            >
              <stop offset="0" stopColor="#dedcd8" />
              <stop offset="0.35" stopColor="#ebe9e5" />
              <stop offset="1" stopColor="#f6f5f2" />
            </linearGradient>
          </defs>
          <path
            d="M100 0 L0 100 C2 62 10 26 18 18 C26 10 62 2 100 0 Z"
            fill={`url(#${shade})`}
          />
        </svg>
      </div>
    </a>
  )
}
