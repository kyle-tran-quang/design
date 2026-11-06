import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react"
import { Stage } from "@/components/stageshow/kit/stage"
import type { Act } from "@/components/stageshow/kit/act"
import "./cards-board-art.css"

/*
 * The CarDS case study's order board as a live mockup, built with the Stageshow kit (src/components/stageshow/kit)
 * from the Figma "DS-Mockup 2" frame (RyZAivKDXMz4gAgBM6XHuz, node 57:9389): CarDoctor's "Current orders" board,
 * built with CarDS, on the frame's grey ground. Its values are the Figma's divided by the frame's 1.0514 scale, so
 * the board draws at the product's own sizes.
 *
 * The story (about 12s): a mechanic is assigned to Laura Palmer's car (the link becomes the mechanic and the dates);
 * then Audrey Horne's car is done, and her card is carried from In Progress to the top of Ready to Collect. Its place
 * closes behind it, a slot opens where it lands, and in the last part of the carry it takes the ready look (its three
 * jobs become "3 services" and the price). The result holds, then the card fades back and the assignment clears.
 * Reduced motion shows the poster: Laura assigned, Audrey ready to collect.
 *
 * Designs: the whole board on desktop, running off the band's foot; tablets the last three columns without the
 * sidebar; phones their own 358px design of the Checked In column, where the assignment is the story.
 */

const WIDE = { width: 1600, height: 910 }
const COMPACT = { width: 760, height: 790 }
const PHONE = { width: 358, height: 660 }

type Carry = { x: number; y: number; w: number; ready: boolean; settle?: boolean }
type S = {
  assigned: boolean
  carry: Carry | null
  slot: number
  moved: boolean
  leaving: boolean
}

const initial: S = {
  assigned: false,
  carry: null,
  slot: 0,
  moved: false,
  leaving: false,
}
const poster: S = {
  assigned: true,
  carry: null,
  slot: 0,
  moved: true,
  leaving: false,
}

/** Where the cursor rests between loops, in stage pixels: on the board's empty ground under the columns' heads. */
const REST = {
  wide: { x: 760, y: 190 },
  compact: { x: 520, y: 222 },
  phone: { x: 290, y: 150 },
}

const scriptFor = (phone: boolean) => async (a: Act<S>) => {
  const rest = phone ? REST.phone : REST[a.layout]
  await a.wait(900)
  // A mechanic for Laura Palmer: pressed on the link's icon, beside its words
  a.mark("assign")
  await a.click({ at: "assign-laura", x: 0.06, y: 0.5 })
  await a.set({ assigned: true })
  await a.wait(900)
  if (!phone) {
    // Audrey Horne's car is done: her card goes to Ready to Collect, picked up off centre as a hand does
    a.mark("move")
    const GRAB = { x: 0.72, y: 0.22 }
    await a.move({ at: "card-audrey", ...GRAB })
    const card = a.rect("card-audrey")
    // It lands where the column's first card sits now, the height of a ready card
    const col = a.rect("col-ready")
    const end = { x: col.x, y: col.y }
    const ready = a.rect("card-shelly").height
    const grab = { x: card.width * GRAB.x, y: card.height * GRAB.y }
    await a.drag({ x: end.x + grab.x, y: end.y + grab.y }, (at, _from, t) => {
      // In the last part of the carry it takes the ready look; the slot it lands in is drawn at that height throughout
      a.put({
        carry: {
          x: at.x - grab.x,
          y: at.y - grab.y,
          w: card.width,
          ready: t > 0.55,
        },
        slot: ready,
      })
    })
    // The tilt and lift settle in place, then the real card swaps in, unmoved
    await a.set({ carry: { ...end, w: card.width, ready: true, settle: true } })
    await a.wait(220)
    await a.set({ carry: null, moved: true })
    await a.wait(400)
  }
  await a.move(rest, { duration: 900 })
  await a.wait(1800)
  // Back: the card fades out of Ready as its place closes and back into In Progress as that opens; the assignment
  // clears with it
  a.mark("reset")
  await a.set({ leaving: true })
  await a.wait(220)
  await a.set({ ...initial })
  await a.wait(900)
}

const asset = (name: string) => `/assets/${name}`

function Icon({
  src,
  size = 20,
  className = "",
}: {
  src: string
  size?: number
  className?: string
}) {
  return (
    <img
      src={asset(src)}
      alt=""
      width={size}
      height={size}
      className={`cdsb-icon ${className}`}
    />
  )
}

/* ---------------------------------------------------------------- sidebar */

function NavItem({
  src,
  label,
  chevron,
  open,
}: {
  src: string
  label: string
  chevron?: boolean
  open?: boolean
}) {
  return (
    <div className="cdsb-nav__item" data-open={open || undefined}>
      <span className="cdsb-nav__label">
        <Icon src={src} size={24} />
        {label}
      </span>
      {chevron && <Icon src={open ? "e866b.svg" : "30565.svg"} size={20} />}
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="cdsb-side">
      <div className="cdsb-side__top">
        <div className="cdsb-logo">
          <img src={asset("9037a.svg")} alt="" width={45} height={24} />
          <span>CarDoctor</span>
        </div>
        <div className="cdsb-search">
          <Icon src="2d2f4.svg" />
          <span>Search</span>
        </div>
        <nav className="cdsb-nav">
          <NavItem src="2a1d3.svg" label="Home" />
          <NavItem src="df7f8.svg" label="Workshops" chevron open />
          <div className="cdsb-nav__sub" data-on>
            Orders <span className="cdsb-badge">18</span>
          </div>
          <div className="cdsb-nav__sub">
            Notifications{" "}
            <span className="cdsb-badge cdsb-badge--quiet">10</span>
          </div>
          <div className="cdsb-nav__sub">Trade history</div>
          <NavItem src="3e4b8.svg" label="Tasks" chevron />
          <NavItem src="bbaa6.svg" label="Vendors" chevron />
          <NavItem src="492fb.svg" label="Business Executives" chevron />
          <NavItem src="aa82b.svg" label="Reporting" chevron />
        </nav>
      </div>
      <div className="cdsb-side__foot">
        <NavItem src="2bf62.svg" label="Support" />
        <NavItem src="aaf07.svg" label="Settings" />
        <img src={asset("d58b7.svg")} alt="" className="cdsb-side__rule" />
        <div className="cdsb-account">
          <img
            src={asset("e8962-120w.webp")}
            alt=""
            className="cdsb-account__photo"
          />
          <span className="cdsb-account__copy">
            <span className="cdsb-account__name">Van Le</span>
            <span>buro@cardoctor.com</span>
          </span>
          <Icon src="64e0f.svg" />
        </div>
      </div>
    </aside>
  )
}

/* ---------------------------------------------------------------- cards */

type Tone = "gray" | "indigo" | "orange" | "green"
type Job = [label: string, tone: Tone]

/** A card's jobs, in lines set to fit its column (measured: 220px of room on desktop, 179px on tablets). */
function Chips({ rows }: { rows: Job[][] }) {
  return (
    <div className="cdsb-chips">
      {rows.map((row, i) => (
        <div key={i} className="cdsb-chips__row">
          {row.map(([label, tone]) => (
            <span key={label} className="cdsb-chip" data-tone={tone}>
              {label}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function Team({ people }: { people: string[] }) {
  return (
    <div className="cdsb-team">
      <span className="cdsb-team__faces">
        {people.map((src) => (
          <img key={src} src={asset(src)} alt="" />
        ))}
      </span>
      <span className="cdsb-team__dates">{"Dec  2 -  8"}</span>
    </div>
  )
}

function ReadyFooter({ count = 3 }: { count?: number }) {
  return (
    <div className="cdsb-ready">
      <span className="cdsb-chip cdsb-chip--services">{count} services</span>
      <span className="cdsb-price">€200</span>
    </div>
  )
}

type CardData = { name: string; car: string; plate: string }

function Card({
  data,
  children,
  target,
  style,
}: {
  data: CardData
  children?: ReactNode
  target?: string
  style?: CSSProperties
}) {
  return (
    <div className="cdsb-card" data-target={target} style={style}>
      <div className="cdsb-card__head">
        <Icon src="c6c79.svg" className="cdsb-card__check" />
        <div className="cdsb-card__who">
          <span className="cdsb-card__name">{data.name}</span>
          <span className="cdsb-card__car">
            <span className="cdsb-card__model">{data.car}</span>
            <span>{data.plate}</span>
          </span>
        </div>
      </div>
      {children}
    </div>
  )
}

const ELANTRA = { car: "Hyundai Elantra", plate: "WXY-3456" }
const CROSS = { car: "Toyota Cross", plate: "30K - 25490" }
const AUDREY: CardData = { name: "Audrey Horne", ...ELANTRA }
const AUDREY_JOBS: Job[][] = [
  [["Coolant change", "indigo"]],
  [
    ["Transmission", "orange"],
    ["Tyres", "green"],
  ],
]

/** Audrey's card as it is carried: in progress, then the ready look, crossfading in place. */
function AudreyCarried({ ready }: { ready: boolean }) {
  return (
    <Card data={AUDREY}>
      <div className="cdsb-morph" data-ready={ready || undefined}>
        <div className="cdsb-morph__from">
          <Chips rows={AUDREY_JOBS} />
          <Team people={["75298.png", "4a185.png"]} />
        </div>
        <div className="cdsb-morph__to">
          <ReadyFooter />
        </div>
      </div>
    </Card>
  )
}

/** A place in a column that closes and opens with its content, at the content's own height. */
function Place({
  open,
  children,
  className = "",
}: {
  open: boolean
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={`cdsb-place ${className}`} data-open={open || undefined}>
      <div className="cdsb-place__inner">{children}</div>
    </div>
  )
}

function Column({
  title,
  extra,
  children,
  target,
}: {
  title: string
  extra?: string
  children: ReactNode
  target?: string
}) {
  return (
    <section className="cdsb-col">
      <div className="cdsb-col__head">
        <span className="cdsb-col__title">
          {title}
          {extra && <span className="cdsb-col__extra"> {extra}</span>}
        </span>
        <span className="cdsb-col__tools">
          <Icon src="d96f7.svg" size={24} />
          <Icon src="e7013.svg" size={24} />
        </span>
      </div>
      <div className="cdsb-col__cards" data-target={target}>
        {children}
      </div>
    </section>
  )
}

function Board({ s, narrow }: { s: S; narrow?: boolean }) {
  const audreyHere = !s.moved && !s.carry
  const jamesJobs: Job[][] = narrow
    ? [
        [["Oil change", "indigo"]],
        [["Windshield Tint", "indigo"]],
        [["Transmission", "indigo"]],
      ]
    : [
        [
          ["Oil change", "indigo"],
          ["Windshield Tint", "indigo"],
        ],
        [["Transmission", "indigo"]],
      ]
  return (
    <div className="cdsb-board">
      <Column title="New Requests" extra="(3 new)">
        <Card
          data={{ name: "Dale Cooper", car: "Honda Accord", plate: "XYZ-1234" }}
        >
          <Chips
            rows={[
              [
                ["Oil change", "gray"],
                ["Engine flush", "gray"],
              ],
            ]}
          />
        </Card>
        <Card
          data={{
            name: "Bobby Briggs",
            car: "Ford Mustang",
            plate: "ABC-5678",
          }}
        >
          <Chips rows={[[["Oil change", "gray"]]]} />
        </Card>
        <Card
          data={{
            name: "Leo Johnson",
            car: "Chevrolet Malibu",
            plate: "LMN-9101",
          }}
        >
          <Chips rows={[[["Full maintenance", "gray"]]]} />
        </Card>
      </Column>
      <Column title="Checked In">
        <Card data={{ name: "James Hurley", ...ELANTRA }}>
          <Chips rows={jamesJobs} />
          <Team people={["83182.png", "ed309.png"]} />
        </Card>
        <Card
          data={{
            name: "Laura Palmer",
            car: "Nissan Altima",
            plate: "QRS-2345",
          }}
        >
          <Chips rows={[[["Body Repaint", "indigo"]]]} />
          {/* The link and the mechanic it brings share one row, crossfading, so the card never changes height */}
          <div className="cdsb-assign" data-assigned={s.assigned || undefined}>
            <span
              className="cdsb-assign__link"
              data-target="assign-laura"
              data-cursor="hand"
            >
              <img src={asset("339a5.svg")} alt="" width={23} height={23} />
              Assign mechanic
            </span>
            <span className="cdsb-assign__team">
              <Team people={["9b785.png"]} />
            </span>
          </div>
        </Card>
        <Card
          data={{ name: "Windom Earle", car: "Kia Sorento", plate: "TUV-6789" }}
        >
          <Chips
            rows={[
              [["Coolant replacement", "indigo"]],
              [["Windshield Tint", "indigo"]],
            ]}
          />
          <Team people={["9b785.png"]} />
        </Card>
      </Column>
      <Column title="In Progress">
        <Place open={audreyHere} className="cdsb-place--source">
          <div
            className="cdsb-fade"
            data-target="card-audrey"
            data-cursor="open"
          >
            <Card data={AUDREY}>
              <Chips rows={AUDREY_JOBS} />
              <Team people={["75298.png", "4a185.png"]} />
            </Card>
          </div>
        </Place>
        <Card data={{ name: "Catherine Martell", ...ELANTRA }}>
          <Chips
            rows={[
              [
                ["Transmission", "orange"],
                ["Tyres", "green"],
              ],
            ]}
          />
          <Team people={["83182.png"]} />
        </Card>
        <Card data={{ name: "Josie Packard", ...ELANTRA }}>
          <Chips
            rows={[
              [["Coolant change", "indigo"]],
              [["Transmission", "orange"]],
            ]}
          />
          <Team people={["83182.png"]} />
        </Card>
      </Column>
      <Column title="Ready to Collect" target="col-ready">
        <Place open={!!s.carry || s.moved} className="cdsb-place--dest">
          {s.moved ? (
            <div className="cdsb-fade" data-out={s.leaving || undefined}>
              <Card data={AUDREY}>
                <ReadyFooter />
              </Card>
            </div>
          ) : (
            // While the card is carried: a dashed slot at the height it will land at
            <div
              className="cdsb-slot"
              data-on={!!s.carry || undefined}
              style={{ height: s.slot || undefined }}
            />
          )}
        </Place>
        <Card data={{ name: "Shelly Briggs", ...CROSS }} target="card-shelly">
          <ReadyFooter />
        </Card>
        <Card data={{ name: "Leland Palmer", ...CROSS }}>
          <ReadyFooter />
        </Card>
        <Card data={{ name: "Harry S. Truman", ...CROSS }}>
          <ReadyFooter />
        </Card>
        <Card data={{ name: "Gordon Cole", ...CROSS }}>
          <ReadyFooter />
        </Card>
      </Column>
    </div>
  )
}

const TABS: [icon: string, label: string][] = [
  ["f7006.svg", "List"],
  ["a09e9.svg", "Board"],
  ["53a34.svg", "Timeline"],
  ["c3bd5.svg", "Calendar"],
  ["441a4.svg", "Progress"],
]

function Panel({ s, narrow }: { s: S; narrow?: boolean }) {
  return (
    <div className="cdsb-panel">
      <Sidebar />
      <img src={asset("5bfaa.svg")} alt="" className="cdsb-panel__rule" />
      <main className="cdsb-main">
        <div className="cdsb-header">
          <div className="cdsb-header__copy">
            <span className="cdsb-title">Current orders</span>
            <span className="cdsb-subtitle">
              Track and manage your workshop and orders.
            </span>
          </div>
          <div className="cdsb-actions">
            <span className="cdsb-button">
              <Icon src="f4d8d.svg" />
              Import
            </span>
            <span className="cdsb-button cdsb-button--primary">
              <Icon src="92d86.svg" />
              Add order
            </span>
          </div>
        </div>
        <div className="cdsb-toolbar">
          <div className="cdsb-tabs">
            {TABS.map(([src, label]) => (
              <span
                key={label}
                className="cdsb-tab"
                data-on={label === "Board" || undefined}
              >
                <Icon src={src} />
                {label}
                {label === "Board" && (
                  <span className="cdsb-tab__badge">3 new</span>
                )}
              </span>
            ))}
          </div>
          <span className="cdsb-filter">
            Filter
            <Icon src="bc8e3.svg" />
          </span>
          <span className="cdsb-find">
            <Icon src="36fe0.svg" size={19} />
            Search orders
          </span>
        </div>
        <Board s={s} narrow={narrow} />
      </main>
    </div>
  )
}

function Carried({ carry }: { carry: Carry }) {
  return (
    <div
      className="cdsb-carry"
      data-settle={carry.settle || undefined}
      style={{ left: carry.x, top: carry.y, width: carry.w }}
    >
      <AudreyCarried ready={carry.ready} />
    </div>
  )
}

const gridScript = scriptFor(false)
const phoneScript = scriptFor(true)

// Phones (under 640px) take their own stage, drawn 1:1 rather than shrunk from the desktop or tablet design
const PHONE_QUERY = "(max-width: 639px)"
const subscribe = (change: () => void) => {
  const query = window.matchMedia(PHONE_QUERY)
  query.addEventListener("change", change)
  return () => query.removeEventListener("change", change)
}
const usePhone = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  )

export default function CarDSBoardArt() {
  const phone = usePhone()
  return (
    <div
      className="cdsb"
      role="img"
      aria-label="CarDoctor's order board: a mechanic assigned to a car, and a finished car's card moved to Ready to Collect"
    >
      {phone ? (
        <Stage<S>
          key="phone"
          width={PHONE.width}
          height={PHONE.height}
          initial={initial}
          poster={poster}
          script={phoneScript}
          cursor={{ at: REST.phone }}
          fill
          className="cdsb-stage"
        >
          {(s) => (
            <div className="cdsb-phone">
              <Panel s={s} />
            </div>
          )}
        </Stage>
      ) : (
        <Stage<S>
          key="grid"
          width={WIDE.width}
          height={WIDE.height}
          compact={{
            below: 1000,
            width: COMPACT.width,
            height: COMPACT.height,
          }}
          initial={initial}
          poster={poster}
          script={gridScript}
          cursor={{ at: { wide: REST.wide, compact: REST.compact } }}
          fill
          className="cdsb-stage"
        >
          {(s, _, layout) => (
            <>
              <Panel s={s} narrow={layout === "compact"} />
              {s.carry && <Carried carry={s.carry} />}
            </>
          )}
        </Stage>
      )}
    </div>
  )
}
