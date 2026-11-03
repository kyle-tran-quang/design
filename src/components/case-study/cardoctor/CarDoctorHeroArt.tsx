import type { ReactNode } from "react"
import { Stage } from "@/components/stageshow/kit/stage"
import type { Act } from "@/components/stageshow/kit/act"
import { Phone } from "@/components/stageshow/kit/phone"
import { Bar } from "@/components/stageshow/kit/window"
import { Count } from "@/components/stageshow/kit/motion/Count"
import { ShaderFill } from "@/lib/custom-effect-runtime/index"
import {
  manifest as completionManifest,
  render as completionRender,
  setup as completionSetup,
} from "@/lib/custom-effects/CodeComponentId_8ce92017e53431a2f04b3574f4ba7c98f6f55f1e_625"
import "./cardoctor-hero-art.css"

/*
 * The CarDoctor case study's hero: three of the app's screens side by side, built with the Stageshow kit
 * (src/components/stageshow/kit) from the Figma "Hero" frame (RyZAivKDXMz4gAgBM6XHuz, node 40:340).
 *
 * One service, told left to right: Emergency assistance (help is picked on the map), the completion screen (the
 * finished work counts up under the animated shader) and Your service (what was done, row by row). The middle phone is
 * the story and the only one with words throughout; its neighbours are grey placeholder bars except where the story
 * touches them (the provider card, the work rows and the total).
 *
 * The hero band is 476px tall on desktop, shorter than the Figma frame, so each phone is cropped top and bottom at
 * the part of the screen its beat happens in. Inside a phone 1px is one iOS point of a 402 x 874 screen: the Figma
 * values divided by its 0.8957 scale, so a 360px phone shows them at their Figma size.
 *
 * The loop (about 12s): a finger picks Northside Road Assist (the card lights, its marker shows the ETA); the
 * service completes in the middle (03 items and the total roll up); the finger taps "See what was done" and the
 * work rows resolve top to bottom, the total rolls to 2.90M₫ and View receipt fills. It holds, then the record
 * clears back to its skeleton and the pick is released. Phones get the middle phone alone: the completion counts up.
 * Reduced motion shows the poster: everything complete.
 */

/* The phones' places (left and top) are in the CSS, which also scales the row for 1024 to 1279px. */
const WIDE = { width: 1440, height: 476, phone: 360 }
const COMPACT = { width: 358, height: 260, phone: 310 }

type S = {
  /** Northside Road Assist is picked on the first screen. */
  picked: boolean
  /** Completed items and the service total on the completion screen; the total shows (in place of its skeleton
   * bar) as it starts to roll, so its new columns fade in with the roll. */
  done: number
  totalShown: boolean
  total: number
  /** The completion figures fade out while they reset unseen. */
  dim: boolean
  /** Work rows resolved on the last screen, top to bottom, and the technician's note. */
  rows: number
  note: boolean
  /** The total on the last screen: shown (in place of its skeleton bar), its value, then the receipt ready. */
  sumShown: boolean
  sum: number
  receipt: boolean
}

const initial: S = {
  picked: false,
  done: 0,
  totalShown: false,
  total: 0,
  dim: false,
  rows: 0,
  note: false,
  sumShown: false,
  sum: 0,
  receipt: false,
}
const poster: S = {
  picked: true,
  done: 3,
  totalShown: true,
  total: 1884000,
  dim: false,
  rows: 3,
  note: true,
  sumShown: true,
  sum: 290,
  receipt: true,
}

/** Where the finger rests between taps, in stage pixels: over the map, clear of its markers. In the compact design
 * nothing is tapped, so it rests outside the stage. */
const REST = { wide: { x: 300, y: 70 }, compact: { x: 420, y: 320 } }

async function script(a: Act<S>) {
  await a.wait(900)
  if (a.layout === "wide") {
    a.mark("pick")
    await a.click("provider")
    await a.set({ picked: true })
    await a.wait(1200)
  }
  // The service completes: the items count, then the total follows
  a.mark("done")
  a.put({ done: 3 })
  await a.wait(400)
  a.put({ totalShown: true, total: 1884000 })
  if (a.layout === "compact") {
    await a.wait(3600)
  } else {
    await a.wait(1300)
    a.mark("see")
    await a.click("see-work")
    await a.wait(200)
    // What was done resolves row by row, then the note and the total
    a.mark("rows")
    for (let n = 1; n <= 3; n++) {
      a.put({ rows: n })
      await a.wait(260)
    }
    a.put({ note: true })
    await a.wait(260)
    a.put({ sumShown: true, sum: 290 })
    await a.wait(1200)
    a.put({ receipt: true })
    // The finger clears the way back to the map while the result holds
    await a.move(REST.wide)
    await a.wait(1600)
    // The record clears to its skeleton in one reverse stagger, and the pick is released with it
    a.mark("reset")
    a.put({ receipt: false, sumShown: false, note: false })
    for (let n = 2; n >= 0; n--) {
      await a.wait(60)
      a.put({ rows: n })
    }
    a.put({ picked: false })
  }
  a.put({ dim: true, totalShown: false })
  await a.wait(400)
  // Faded out, the figures go back to zero unseen
  await a.snap({ done: 0, total: 0, sum: 0 })
  a.put({ dim: false })
  await a.wait(500)
}

const asset = (name: string) => `/assets/${name}`

// The completion screen's backdrop: the shader and its parameters exactly as authored in Figma. One stable object,
// so the runtime sets up once.
const COMPLETION_SHADER = {
  setup: completionSetup,
  render: completionRender,
  params: {
    intensity: 0.8700000047683716,
    gradient: {
      stops: [
        {
          position: 0,
          color: {
            r: 0.6049823760986328,
            g: 0.3433215022087097,
            b: 0.726239800453186,
            a: 1,
          },
        },
        {
          position: 0.5,
          color: {
            r: 0.24600128829479218,
            g: 0.20745614171028137,
            b: 0.7856327891349792,
            a: 1,
          },
        },
        {
          position: 1,
          color: {
            r: 0.2705882489681244,
            g: 0.24313725531101227,
            b: 0.929411768913269,
            a: 1,
          },
        },
      ],
    },
    gradientBalance: 0,
    material: 0,
    morphSpeed: 3.740000009536743,
    detail: 1.7799999713897705,
    twist: 2.429999828338623,
    zoom: 72,
    gradientMethod: 0,
    warp: 0.25999999046325684,
    rotationSpeed: 12,
  },
  manifest: completionManifest,
}

const twoDigits = (n: number) => String(Math.round(n)).padStart(2, "0")
const dong = (n: number) => `${Math.round(n).toLocaleString("de-DE")}đ`
const millions = (n: number) => `${(n / 100).toFixed(2)}M₫`

/** The app's top bar under the status bar: back arrow and the screen's title (a bar on the neighbours). */
function TopBar({ icon, title }: { icon: string; title: number }) {
  return (
    <div className="cdh-header">
      <div className="cdh-topbar">
        <img src={asset(icon)} alt="" className="cdh-topbar__icon" />
        <Bar w={title} h={10} r={5} className="cdh-bar--light" />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Emergency assistance (neighbour) */

/** One road: a straight line art asset turned to its angle inside its bounding box, as Figma draws it. */
function Road({
  src,
  box,
  len,
  angle,
  inset,
}: {
  src: string
  box: [number, number, number, number]
  len: number
  angle: number
  inset: number
}) {
  const [left, top, width, height] = box
  return (
    <div className="cdh-road" style={{ left, top, width, height }}>
      <div style={{ transform: `rotate(${angle}deg)` }}>
        <div className="cdh-road__line" style={{ width: len }}>
          <div className="cdh-road__img" style={{ top: -inset }}>
            <img src={asset(src)} alt="" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Marker({
  icon,
  left,
  top,
  children,
  picked,
}: {
  icon: string
  left: number
  top: number
  children?: ReactNode
  picked?: boolean
}) {
  return (
    <div
      className="cdh-marker"
      style={{ left, top }}
      data-picked={picked || undefined}
    >
      {children}
      <span className="cdh-pin">
        <img src={asset(icon)} alt="" />
      </span>
    </div>
  )
}

function AssistScreen({ s }: { s: S }) {
  return (
    <div className="cdh-screen cdh-assist">
      <div className="cdh-map">
        <Road
          src="813a4.svg"
          box={[-28, 118, 459.75, 97.72]}
          len={470}
          angle={12}
          inset={25}
        />
        <Road
          src="07631.svg"
          box={[90, -36, 112.48, 487.2]}
          len={500}
          angle={77}
          inset={20}
        />
        <Road
          src="07578.svg"
          box={[-10, 135, 406.6, 140]}
          len={430}
          angle={-19}
          inset={12}
        />
        <Road
          src="77cab.svg"
          box={[180, 38, 222.3, 230.2]}
          len={320}
          angle={46}
          inset={10}
        />
        <Road
          src="3a194.svg"
          box={[15, 54, 149.4, 13.07]}
          len={150}
          angle={5}
          inset={8}
        />
        <Road
          src="6dd43.svg"
          box={[236, 246, 179.9, 6.28]}
          len={180}
          angle={2}
          inset={8}
        />
        <div className="cdh-here">
          <img src={asset("cceee.svg")} alt="" />
        </div>
        <Marker icon="38fb5.svg" left={288} top={254} />
        <Marker icon="b9934.svg" left={70} top={188} />
        {/* Northside's marker: it shows its ETA and price once Northside is picked */}
        <Marker icon="e406c.svg" left={224} top={154} picked={s.picked}>
          <span className="cdh-marker__detail">
            <span className="cdh-sb">11 min</span>
            <span className="cdh-b cdh-marker__price">2.23M₫</span>
          </span>
        </Marker>
        <span className="cdh-locate">
          <img src={asset("b7d91.svg")} alt="" />
        </span>
      </div>
      <span className="cdh-address">
        <img src={asset("4ecdb.svg")} alt="" />
        <Bar w={108} h={7} r={3.5} tone={3} />
      </span>
      <TopBar icon="2ea32.svg" title={172} />
      <div className="cdh-help">
        <span className="cdh-help__handle" />
        <div className="cdh-help__body">
          <div className="cdh-help__heading">
            <Bar w={196} h={14} r={7} tone={4} />
          </div>
          <div
            className="cdh-provider"
            data-target="provider"
            data-picked={s.picked || undefined}
          >
            <div className="cdh-provider__copy">
              <div className="cdh-provider__name">
                <span className="cdh-r">Northside Road Assist</span>
                <span className="cdh-pill cdh-sb">Best ETA</span>
              </div>
              <span className="cdh-r cdh-provider__sub">
                24/7 roadside assistance
              </span>
            </div>
            <div className="cdh-facts cdh-sb">
              <span className="cdh-fact">
                <span className="cdh-fact__label">Arrival</span>
                <span className="cdh-fact__value">11 min</span>
              </span>
              <span className="cdh-fact">
                <span className="cdh-fact__label">Distance</span>
                <span className="cdh-fact__value">2.4 mi</span>
              </span>
              <span className="cdh-fact cdh-fact--plain">
                <span className="cdh-fact__label">Est. total</span>
                <span className="cdh-fact__value">2.23M₫</span>
              </span>
            </div>
          </div>
        </div>
        <div className="cdh-compare">
          <Bar w={196} h={9} r={4.5} tone={4} />
          <Bar w={58} h={9} r={4.5} className="cdh-bar--accent" />
        </div>
        <div className="cdh-continue">
          <Bar w={176} h={10} r={5} className="cdh-bar--light" />
          <img src={asset("5a3b0.svg")} alt="" className="cdh-continue__icon" />
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Service completed (the story) */

function CompletionScreen({ s }: { s: S }) {
  return (
    <div className="cdh-screen cdh-done">
      <div className="cdh-backdrop">
        <ShaderFill
          className="cdh-backdrop__shader"
          shader={COMPLETION_SHADER}
        />
        <div className="cdh-topbar">
          <img src={asset("2ea32.svg")} alt="" className="cdh-topbar__icon" />
        </div>
        <div className="cdh-message">
          <div className="cdh-r cdh-message__meta">30 Aug · Brake service</div>
          <div className="cdh-m cdh-message__title">All done.</div>
          <div className="cdh-r cdh-message__meta cdh-message__sub">
            Your car is ready to get back on the road.
          </div>
        </div>
      </div>
      <div className="cdh-sheet">
        <div className="cdh-r cdh-sheet__label">
          Illustrative service record
        </div>
        <div className="cdh-work">
          <Count
            value={s.done}
            format={twoDigits}
            className="cdh-l cdh-work__count cdh-fig"
            data-dim={s.dim || undefined}
          />
          <div className="cdh-work__summary">
            <div className="cdh-sb cdh-work__title">Completed items</div>
            <div className="cdh-r cdh-work__text">
              Front brake pads replaced. Rotors and tyre pressures checked.
            </div>
          </div>
        </div>
        <span className="cdh-divider" />
        <div className="cdh-detail">
          <span className="cdh-r cdh-detail__label">Provider</span>
          <span className="cdh-sb cdh-detail__value">Valerie’s Mechanics</span>
        </div>
        <div className="cdh-detail">
          <span className="cdh-r cdh-detail__label">Service total</span>
          <span
            className="cdh-detail__total"
            data-on={s.totalShown || undefined}
          >
            <Count
              value={s.total}
              format={dong}
              stagger={30}
              className="cdh-sb cdh-detail__value cdh-detail__value--accent cdh-row__real"
            />
            <span className="cdh-row__skel">
              <Bar w={84} h={9} r={4.5} className="cdh-bar--accent" />
            </span>
          </span>
        </div>
        <span className="cdh-divider" />
        <div className="cdh-notice cdh-r">
          <div className="cdh-notice__title">Your next move</div>
          <div className="cdh-notice__text">
            Review the work and receipt before collection. Support is available
            if anything looks unfamiliar.
          </div>
        </div>
        <div className="cdh-actions">
          <span
            className="cdh-button cdh-button--primary cdh-m"
            data-target="see-work"
          >
            See what was done
          </span>
          <span className="cdh-button cdh-button--secondary cdh-m">
            Give a review
          </span>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Your service (neighbour) */

const WORK = [
  { n: "01", title: "Front pads replaced", text: 182 },
  { n: "02", title: "Brake rotors checked", text: 196 },
  { n: "03", title: "Tyres checked", text: 168 },
]

function ServiceScreen({ s }: { s: S }) {
  return (
    <div className="cdh-screen cdh-service">
      <TopBar icon="aa2b9.svg" title={104} />
      <div className="cdh-service__content">
        <div className="cdh-intro">
          <span className="cdh-intro__line">
            <Bar w={300} h={20} r={10} tone={4} />
          </span>
          <span className="cdh-intro__line">
            <Bar w={228} h={20} r={10} tone={4} />
          </span>
          <span className="cdh-intro__meta">
            <Bar w={196} h={7} r={3.5} tone={3} />
          </span>
          <span className="cdh-intro__meta">
            <Bar w={76} h={7} r={3.5} tone={3} />
          </span>
        </div>
        <ol className="cdh-rows">
          {WORK.map((row, i) => (
            <li
              key={row.n}
              className="cdh-row"
              data-on={s.rows > i || undefined}
            >
              {/* The real words and their skeleton share one place and crossfade, so the row never moves */}
              <span className="cdh-row__n">
                <span className="cdh-l cdh-row__real">{row.n}</span>
                <span className="cdh-row__skel">
                  <Bar w={22} h={12} r={6} tone={3} />
                </span>
              </span>
              <span className="cdh-row__copy">
                <span className="cdh-row__title">
                  <span className="cdh-sb cdh-row__real">{row.title}</span>
                  <span className="cdh-row__skel">
                    <Bar w={row.title.length * 8} h={10} r={5} tone={4} />
                  </span>
                </span>
                <span className="cdh-row__text">
                  <Bar w={row.text} h={7} r={3.5} tone={3} />
                </span>
              </span>
            </li>
          ))}
        </ol>
        <div className="cdh-note" data-on={s.note || undefined}>
          <span className="cdh-note__title">
            <Bar w={132} h={9} r={4.5} tone={4} />
          </span>
          <span className="cdh-note__line">
            <Bar w={292} h={7} r={3.5} tone={3} />
          </span>
          <span className="cdh-note__line">
            <Bar w={250} h={7} r={3.5} tone={3} />
          </span>
        </div>
        <div className="cdh-receipt">
          <span className="cdh-receipt__cost">
            <span className="cdh-r cdh-receipt__label">Total</span>
            <span
              className="cdh-receipt__sum"
              data-on={s.sumShown || undefined}
            >
              <Count
                value={s.sum}
                format={millions}
                className="cdh-sb cdh-row__real"
              />
              <span className="cdh-row__skel">
                <Bar w={78} h={14} r={7} tone={4} />
              </span>
            </span>
          </span>
          <span
            className="cdh-receipt__button cdh-sb"
            data-on={s.receipt || undefined}
          >
            View receipt
          </span>
        </div>
        <div className="cdh-warranty">
          <Bar w={132} h={8} r={4} tone={3} />
          <Bar w={64} h={8} r={4} tone={4} />
        </div>
      </div>
    </div>
  )
}

export default function CarDoctorHeroArt({ play = true }: { play?: boolean }) {
  return (
    <div
      className="cdh"
      role="img"
      aria-label="CarDoctor's service flow: a provider picked on the map, the completed service, and the work it did"
    >
      <div className="cdh-slot">
        <Stage<S>
          width={WIDE.width}
          height={WIDE.height}
          compact={{ below: 900, width: COMPACT.width, height: COMPACT.height }}
          initial={initial}
          poster={poster}
          // Held on the poster until the page's loading curtain lifts, then the story starts from its first frame
          script={play ? script : undefined}
          cursor={{ at: REST, style: "touch" }}
          fill
          className="cdh-stage"
        >
          {(s, _, layout) =>
            layout === "compact" ? (
              <Phone
                width={COMPACT.phone}
                frame="bare"
                status
                dark
                className="cdh-phone"
                data-screen="done"
                data-focus
                style={{ left: (COMPACT.width - COMPACT.phone) / 2 }}
              >
                <CompletionScreen s={s} />
              </Phone>
            ) : (
              <>
                {/* The focal phone first, so it leads the scene's order */}
                <Phone
                  width={WIDE.phone}
                  frame="bare"
                  status
                  dark
                  className="cdh-phone"
                  data-screen="done"
                  data-focus
                >
                  <CompletionScreen s={s} />
                </Phone>
                <Phone
                  width={WIDE.phone}
                  frame="bare"
                  status
                  dark
                  className="cdh-phone"
                  data-screen="assist"
                >
                  <AssistScreen s={s} />
                </Phone>
                <Phone
                  width={WIDE.phone}
                  frame="bare"
                  status
                  dark
                  className="cdh-phone"
                  data-screen="service"
                >
                  <ServiceScreen s={s} />
                </Phone>
              </>
            )
          }
        </Stage>
      </div>
    </div>
  )
}
