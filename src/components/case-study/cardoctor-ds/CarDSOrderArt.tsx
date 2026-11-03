import { useSyncExternalStore, type ReactNode } from "react"
import { Stage } from "@/components/stageshow/kit/stage"
import type { Act } from "@/components/stageshow/kit/act"
import type { Rect } from "@/components/stageshow/kit/measure"
import "./cards-order-art.css"

/*
 * The CarDS case study's order screen as a live mockup, built with the Stageshow kit (src/components/stageshow/kit)
 * from the Figma "DS-Mockup" frame (RyZAivKDXMz4gAgBM6XHuz, node 56:15638): CarDoctor's workshop dashboard, built with
 * CarDS, on the frame's grey ground. Its values are the Figma's divided by the frame's 1.0497 scale, so the panel is
 * drawn at the product's own sizes.
 *
 * The story (about 11s): the work on Order #Y2K2332 finishes. The cursor opens Maintenance's status, marks it
 * Completed, then does the same for Blinker repair; with every service complete, the order status steps on to
 * "Ready to complete". The result holds, then the statuses return in one reverse stagger. Reduced motion shows the
 * poster: every service completed and the order ready.
 *
 * Designs: the whole dashboard on desktop, the panel running off the band's foot; tablets crop to the order, its
 * stepper and the services (no sidebar, assignees or notes); phones get their own 358px design of the services alone.
 */

const WIDE = { width: 1600, height: 914 }
const COMPACT = { width: 760, height: 820 }
const PHONE = { width: 358, height: 441 }

type Row = "maint" | "blinker"
type S = {
  maint: "progress" | "done"
  blinker: "todo" | "done"
  menu: Row | null
  ready: boolean
}

const initial: S = {
  maint: "progress",
  blinker: "todo",
  menu: null,
  ready: false,
}
const poster: S = { maint: "done", blinker: "done", menu: null, ready: true }

/** Where the cursor rests between loops, in stage pixels: on the empty right of the "Work details" line, or under the
 * phone's services. */
const REST = {
  wide: { x: 1200, y: 395 },
  compact: { x: 560, y: 383 },
  phone: { x: 250, y: 120 },
}

const scriptFor = (phone: boolean) => async (a: Act<S>) => {
  const rest = phone ? REST.phone : REST[a.layout]
  await a.wait(900)
  // Maintenance: open its status, mark it completed
  a.mark("maint")
  await a.click({ at: "status-maint", x: 0.7, y: 0.6 })
  await a.set({ menu: "maint" })
  await a.wait(450)
  await a.click({ at: "opt-maint-done", x: 0.8, y: 0.55 })
  await a.set({ maint: "done", menu: null })
  await a.wait(700)
  // Blinker repair, the last one open
  a.mark("blinker")
  await a.click({ at: "status-blinker", x: 0.7, y: 0.6 })
  await a.set({ menu: "blinker" })
  await a.wait(450)
  await a.click({ at: "opt-blinker-done", x: 0.8, y: 0.55 })
  await a.set({ blinker: "done", menu: null })
  await a.wait(450)
  // Every service complete: the order steps on
  a.mark("ready")
  await a.set({ ready: true })
  await a.wait(300)
  await a.move(rest, { duration: 900 })
  await a.wait(1900)
  // Back to work in progress, last change first
  a.mark("reset")
  for (const step of [
    { ready: false },
    { blinker: "todo" },
    { maint: "progress" },
  ] as Partial<S>[]) {
    a.put(step)
    await a.wait(80)
  }
  await a.wait(900)
}

const icon = (name: string) => `/assets/${name}`

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
      src={icon(src)}
      alt=""
      width={size}
      height={size}
      className={`cdso-icon ${className}`}
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
    <div className="cdso-nav__item" data-open={open || undefined}>
      <span className="cdso-nav__label">
        <Icon src={src} size={24} />
        {label}
      </span>
      {chevron && <Icon src={open ? "52c43.svg" : "22c31.svg"} size={20} />}
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="cdso-side">
      <div className="cdso-side__top">
        <div className="cdso-logo">
          <img src={icon("67c67.svg")} alt="" width={45} height={24} />
          <span>CarDoctor</span>
        </div>
        <div className="cdso-search">
          <Icon src="4e75b.svg" />
          <span>Search</span>
        </div>
        <nav className="cdso-nav">
          <NavItem src="18023.svg" label="Home" />
          <NavItem src="49c8f.svg" label="Workshops" chevron open />
          <div className="cdso-nav__sub" data-on>
            Orders <span className="cdso-badge">18</span>
          </div>
          <div className="cdso-nav__sub">Notifications</div>
          <div className="cdso-nav__sub">Trade history</div>
          <NavItem src="1a492.svg" label="Tasks" chevron />
          <NavItem src="0c3fc.svg" label="Vendors" chevron />
          <NavItem src="7e2fa.svg" label="Business Executives" chevron />
          <NavItem src="10425.svg" label="Reporting" chevron />
        </nav>
      </div>
      <div className="cdso-side__foot">
        <NavItem src="9f208.svg" label="Support" />
        <NavItem src="1d0c8.svg" label="Settings" />
        <img src={icon("71187.svg")} alt="" className="cdso-side__rule" />
        <div className="cdso-account">
          <img src={icon("e8962.png")} alt="" className="cdso-account__photo" />
          <span className="cdso-account__copy">
            <span className="cdso-account__name">Van Le</span>
            <span>buro@cardoctor.com</span>
          </span>
          <Icon src="f67d2.svg" className="cdso-account__out" />
        </div>
      </div>
    </aside>
  )
}

/* ---------------------------------------------------------------- order status */

type StepState = "done" | "current" | "next"

function Step({
  state,
  title,
  note,
  lineIn,
  lineOut,
}: {
  state: StepState
  title: string
  note: string
  lineIn: boolean
  lineOut: boolean
}) {
  return (
    <div className="cdso-step" data-state={state}>
      <div className="cdso-step__track">
        {/* Each half-line fills from the left, so the progress runs on through a node */}
        <span className="cdso-step__line">
          <i data-on={lineIn || undefined} />
        </span>
        <span className="cdso-step__node">
          <span className="cdso-step__dot" />
        </span>
        <span className="cdso-step__line">
          <i data-on={lineOut || undefined} />
        </span>
      </div>
      <div className="cdso-step__text">
        <span className="cdso-step__title">{title}</span>
        <span className="cdso-step__note">{note}</span>
      </div>
    </div>
  )
}

function OrderStatus({ s }: { s: S }) {
  return (
    <div className="cdso-stepper">
      <Step
        state="done"
        title="Booking"
        note="Received at 12:30, Sat 5 June 2024"
        lineIn
        lineOut
      />
      <Step
        state="done"
        title="Checked In"
        note="12:35, Sat 6 June 2024"
        lineIn
        lineOut
      />
      <Step
        state={s.ready ? "done" : "current"}
        title="In Progress"
        note="Deliver by 12:00PM, 12 June 2024"
        lineIn
        lineOut={s.ready}
      />
      <Step
        state={s.ready ? "current" : "next"}
        title="Ready to complete"
        note="The work has been completed"
        lineIn={s.ready}
        lineOut={false}
      />
    </div>
  )
}

/* ---------------------------------------------------------------- services */

type Status = "progress" | "done" | "todo"
const STATUS: Record<Status, string> = {
  todo: "Not started",
  progress: "In progress",
  done: "Completed",
}

function Pill({ status }: { status: Status }) {
  return (
    <span className="cdso-pill" data-status={status}>
      {STATUS[status]}
    </span>
  )
}

/** The status cell: the pill, its three looks sharing one slot; a row the story touches can open its menu. */
function StatusCell({ row, status, s }: { row?: Row; status: Status; s: S }) {
  if (!row) return <Pill status={status} />
  return (
    <span
      className="cdso-status__pill"
      data-target={`status-${row}`}
      data-cursor="hand"
      data-open={s.menu === row || undefined}
    >
      {(["todo", "progress", "done"] as Status[]).map((st) => (
        <span
          key={st}
          className="cdso-status__look"
          data-on={st === status || undefined}
        >
          <Pill status={st} />
        </span>
      ))}
    </span>
  )
}

/**
 * A status menu, at the table's level (it belongs to the table, not the row it opens from) and placed from its
 * pill's measured box: under it, or over it for the last row; on phones aligned to its right edge. Kept mounted, so
 * it fades both ways.
 */
function StatusMenu({
  row,
  status,
  s,
  up,
  rect,
  end,
}: {
  row: Row
  status: Status
  s: S
  up?: boolean
  rect: (name: string) => Rect
  end?: boolean
}) {
  const t = rect("services")
  const p = rect(`status-${row}`)
  const x = end
    ? { right: t.x + t.width - (p.x + p.width) - 8 }
    : { left: p.x - t.x - 8 }
  const y = up
    ? { bottom: t.y + t.height - p.y + 8 }
    : { top: p.y - t.y + p.height + 8 }
  return (
    <span
      className="cdso-menu"
      data-open={s.menu === row || undefined}
      data-up={up || undefined}
      style={{ ...x, ...y }}
    >
      {(["todo", "progress", "done"] as Status[]).map((st) => (
        <span
          key={st}
          className="cdso-menu__item"
          data-target={st === "done" ? `opt-${row}-done` : undefined}
          data-cursor={st === "done" ? "hand" : undefined}
          data-current={st === status || undefined}
        >
          <Pill status={st} />
        </span>
      ))}
    </span>
  )
}

function Avatars({ srcs, more }: { srcs: string[]; more?: number }) {
  return (
    <span className="cdso-avatars">
      {srcs.map((src) => (
        <img key={src} src={icon(src)} alt="" />
      ))}
      {more ? <span className="cdso-avatars__more">+{more}</span> : null}
    </span>
  )
}

function Check() {
  return (
    <span className="cdso-check">
      <img src={icon("6d73f.svg")} alt="" />
    </span>
  )
}

function ServiceRow({
  title,
  people,
  names,
  note,
  status,
  row,
  s,
}: {
  title: string
  people: ReactNode
  names?: string
  note: string
  status: Status
  row?: Row
  s: S
}) {
  return (
    <div className="cdso-row">
      <span className="cdso-cell cdso-cell--service">
        <Check />
        <span className="cdso-service">
          <span className="cdso-service__title">{title}</span>
          <span className="cdso-service__sub">Full service package</span>
        </span>
      </span>
      <span className="cdso-cell cdso-cell--people">
        {people}
        {names && <span className="cdso-people__names">{names}</span>}
      </span>
      <span className="cdso-cell cdso-cell--notes">{note}</span>
      <span className="cdso-cell cdso-cell--status">
        <StatusCell row={row} status={status} s={s} />
      </span>
      <span className="cdso-cell cdso-cell--quote">
        <span className="cdso-quote">€200</span>
      </span>
      <span className="cdso-cell cdso-cell--actions">
        <Icon src="a6238.svg" size={24} />
        <Icon src="3f6f9.svg" size={24} />
      </span>
    </div>
  )
}

function Services({
  s,
  rect,
  phone,
}: {
  s: S
  rect: (name: string) => Rect
  phone?: boolean
}) {
  return (
    <div className="cdso-table" data-target="services">
      <div className="cdso-row cdso-row--head">
        <span className="cdso-cell cdso-cell--service">
          <span className="cdso-check cdso-check--some">
            <img src={icon("e277d.svg")} alt="" />
          </span>
          <span className="cdso-head">
            Service type{" "}
            <img src={icon("e8807.svg")} alt="" width={16} height={16} />
          </span>
        </span>
        <span className="cdso-cell cdso-cell--people cdso-head">
          Assignee(s)
        </span>
        <span className="cdso-cell cdso-cell--notes cdso-head">Notes</span>
        <span className="cdso-cell cdso-cell--status cdso-head">Status</span>
        {/* Over the quote and the empty actions column, so the header row is inset like the rows under it */}
        <span className="cdso-cell cdso-cell--quote cdso-head cdso-head--last">
          Quote
        </span>
      </div>
      <ServiceRow
        title="Maintenance"
        people={<Avatars srcs={["bba29.png", "5cb33.png", "8f5af.png"]} />}
        names="Mikey, James, Joe"
        note="Roadside assistance and towing services"
        status={s.maint}
        row="maint"
        s={s}
      />
      <ServiceRow
        title="Oil change"
        people={<Avatars srcs={["9104d.png", "2ac60.png"]} />}
        names="Leed, Sarah"
        note="Exhaust system inspection and repair"
        status="done"
        s={s}
      />
      <ServiceRow
        title="Blinker repair"
        people={
          <Avatars
            srcs={["0c7c8.png", "d92df.png", "7cdb4.png", "56fbb.png"]}
            more={2}
          />
        }
        note="Transmission servicing and fluid change"
        status={s.blinker}
        row="blinker"
        s={s}
      />
      <div className="cdso-add">+ Add new</div>
      <StatusMenu row="maint" status={s.maint} s={s} rect={rect} end={phone} />
      <StatusMenu
        row="blinker"
        status={s.blinker}
        s={s}
        rect={rect}
        end={phone}
        up
      />
    </div>
  )
}

/* ---------------------------------------------------------------- the panel */

function Dashboard({ s, rect }: { s: S; rect: (name: string) => Rect }) {
  return (
    <div className="cdso-panel">
      <Sidebar />
      <img src={icon("e7144.svg")} alt="" className="cdso-panel__rule" />
      <main className="cdso-main">
        <div className="cdso-header">
          <span className="cdso-title">
            <Icon src="80375.svg" size={24} />
            <span>
              <span className="cdso-title__order">Order</span>{" "}
              <span className="cdso-title__id">#Y2K2332</span>
            </span>
          </span>
          <span className="cdso-button">
            <Icon src="277bd.svg" />
            Import from Excel file
          </span>
        </div>
        <section className="cdso-order">
          <div className="cdso-customer">
            <span className="cdso-customer__name">Kyle Tran - 0392523000</span>
            <span className="cdso-customer__car">Honda Accord 2.0 2018</span>
          </div>
          <span className="cdso-label">Order status</span>
          <OrderStatus s={s} />
          <span className="cdso-button cdso-order__edit">
            <Icon src="88b74.svg" />
            Edit order details
          </span>
        </section>
        <section className="cdso-work">
          <span className="cdso-work__title">Work details</span>
          <div className="cdso-assignees">
            <span className="cdso-assignees__label">Assignee(s)</span>
            <div className="cdso-assignees__row">
              <Avatars
                srcs={[
                  "bba29.png",
                  "5cb33.png",
                  "8f5af.png",
                  "0df45.png",
                  "46342.png",
                ]}
                more={5}
              />
              <span className="cdso-input">
                <Icon src="e0367.svg" />
                <span className="cdso-input__text">
                  Joe, Sarah, Walsh, Jimmy, Ruby, Leah
                </span>
                <Icon src="b5385.svg" />
              </span>
            </div>
          </div>
          <Services s={s} rect={rect} />
        </section>
      </main>
    </div>
  )
}

/** Phones: the order's services alone, the status pill beside each, the order's state by its number. */
function PhonePanel({ s, rect }: { s: S; rect: (name: string) => Rect }) {
  return (
    <div className="cdso-panel cdso-panel--phone">
      <div className="cdso-phone__head">
        <span className="cdso-title">
          <span>
            <span className="cdso-title__order">Order</span>{" "}
            <span className="cdso-title__id">#Y2K2332</span>
          </span>
        </span>
        <span className="cdso-phone__state">
          <span className="cdso-status__look" data-on={!s.ready || undefined}>
            <Pill status="progress" />
          </span>
          <span className="cdso-status__look" data-on={s.ready || undefined}>
            <span className="cdso-pill cdso-pill--ready">
              Ready to complete
            </span>
          </span>
        </span>
      </div>
      <div className="cdso-phone__body">
        <Services s={s} rect={rect} phone />
      </div>
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

export default function CarDSOrderArt() {
  const phone = usePhone()
  return (
    <div
      className="cdso"
      role="img"
      aria-label="CarDoctor's order screen: two services marked completed, and the order moving on to Ready to complete"
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
          className="cdso-stage"
        >
          {(s, rect) => <PhonePanel s={s} rect={rect} />}
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
          className="cdso-stage"
        >
          {(s, rect) => <Dashboard s={s} rect={rect} />}
        </Stage>
      )}
    </div>
  )
}
