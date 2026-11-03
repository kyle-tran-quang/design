import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react"
import { Bookmark, CircleHelp, Heart, Mail, Phone } from "lucide-react"
import { Stage } from "@/components/stageshow/kit/stage"
import type { Act } from "@/components/stageshow/kit/act"
import { Caret } from "@/components/stageshow/kit/window"
import { Avatar } from "@/components/stageshow/kit/parts/Avatar"
import { Check } from "@/components/stageshow/kit/parts/Check"
import { Spinner } from "@/components/stageshow/kit/parts/Spinner"
import { Segmented } from "@/components/stageshow/kit/controls/Segmented"
import { asset } from "@/lib/asset"
import "./cards-hero-art.css"

/*
 * The CarDS case study's hero as a live grid, built with the Stageshow kit (src/components/stageshow/kit) in the same
 * treatment as the CarDoctor hero (CarDoctorHeroArt): a #e0e0e0 ground, white tiles, the system's own blue (#3e65fe)
 * and Inter. It recomposes the case study's art (cardoctor-ds-hero.webp) for the hero band: the "CarDS 1.0" tile keeps
 * the original artwork, with the system's components round it.
 *
 * The loop (about 12s) is one cursor touring the system: it types a name into the field, books Service Now (pending,
 * then booked), ticks Remember me and switches the tabs to Read. The result holds, then the components return to rest
 * in one reverse stagger. Tablets get the brand tile over the field and button; phones their own 358px design of the
 * two. Reduced motion, and the moment before the page's loading curtain lifts, show the poster: every component
 * finished.
 */
/** The desktop hero band is 600px tall: two rows of tiles, the brand tile wide in the middle of the first. */
const HERO = { width: 1400, height: 600 }
/** Tablets and small desktops (640 to 1279px): about the band's own shape there, so the tiles span it. */
const COMPACT = { width: 860, height: 412 }
/** Phones get their own design at the column's width and the band's height: the brand tile over the field and button. */
const PHONE = { width: 358, height: 260 }

type S = {
  name: string
  focus: boolean
  booking: "idle" | "busy" | "done"
  remember: boolean
  tab: number
}

const initial: S = {
  name: "",
  focus: false,
  booking: "idle",
  remember: false,
  tab: 0,
}
const poster: S = {
  name: "David Smith",
  focus: false,
  booking: "done",
  remember: true,
  tab: 1,
}

/** Where the cursor rests between loops, in stage pixels: on the field's tile under its input, or beside the button. */
const REST = {
  wide: { x: 212, y: 250 },
  compact: { x: 560, y: 372 },
  phone: { x: 110, y: 236 },
}

type Story = "tour" | "form"

/** The tour on the desktop grid; the field and button alone where only they show. */
const scriptFor = (phone: boolean) => async (a: Act<S>) => {
  const story: Story = !phone && a.layout === "wide" ? "tour" : "form"
  const rest = phone ? REST.phone : REST[a.layout]
  await a.wait(800)
  a.mark("type")
  await a.click({ at: "field", x: 0.8, y: 0.55 })
  await a.set({ focus: true })
  await a.wait(250)
  await a.type("name", "David Smith", { interval: 70 })
  await a.wait(450)
  a.mark("book")
  await a.click({ at: "service", x: 0.82, y: 0.7 })
  // The press takes the focus from the field; the request runs, then lands
  await a.set({ focus: false, booking: "busy" })
  await a.wait(800)
  await a.set({ booking: "done" })
  await a.wait(600)
  if (story === "tour") {
    a.mark("remember")
    await a.click({ at: "remember", x: 0.5, y: 0.5 })
    await a.set({ remember: true })
    await a.wait(450)
    a.mark("tabs")
    await a.click({ at: "read", x: 0.75, y: 0.7 })
    await a.set({ tab: 1 })
    await a.wait(300)
  }
  await a.move(rest, { duration: 900 })
  await a.wait(1800)
  // Back to rest, last touched first, in one reverse stagger
  a.mark("reset")
  const steps: Partial<S>[] =
    story === "tour"
      ? [{ tab: 0 }, { remember: false }, { booking: "idle" }, { name: "" }]
      : [{ booking: "idle" }, { name: "" }]
  for (const step of steps) {
    a.put(step)
    await a.wait(70)
  }
  await a.wait(900)
}

const at = (left: number, top: number, width: number, height: number) => ({
  left,
  top,
  width,
  height,
})

function Tile({
  style,
  className = "",
  children,
  label,
  crop,
}: {
  style: CSSProperties
  className?: string
  children?: ReactNode
  label?: string
  crop?: boolean
}) {
  return (
    // `crop`: its content runs off an edge on purpose, as the original art crops its components
    <div
      className={`cdsh-tile ${className}`}
      style={style}
      aria-label={label}
      data-crop={crop || undefined}
    >
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------- components */

function NameField({ s }: { s: S }) {
  return (
    <div className="cdsh-field">
      <span className="cdsh-field__label">
        <span>Full Name</span>
        <span className="cdsh-field__required">*</span>
      </span>
      <span
        className="cdsh-input"
        data-target="field"
        data-cursor="ibeam"
        data-focus={s.focus || undefined}
      >
        {/* The placeholder sits under the text, as an input draws it, so the caret arriving never moves it */}
        <span
          className="cdsh-input__placeholder"
          data-on={!s.name || undefined}
          aria-hidden
        >
          Enter your name
        </span>
        <span className="cdsh-input__value">{s.name}</span>
        {s.focus && <Caret />}
      </span>
    </div>
  )
}

function ServiceButton({ s }: { s: S }) {
  return (
    // The three states share one slot and crossfade, so the button never resizes
    <span
      className="cdsh-primary"
      data-target="service"
      data-cursor="hand"
      data-state={s.booking}
    >
      <span className="cdsh-layer" data-on={s.booking === "idle" || undefined}>
        Service Now
      </span>
      <span className="cdsh-layer" data-on={s.booking === "busy" || undefined}>
        <Spinner size={18} className="cdsh-spinner" />
      </span>
      <span className="cdsh-layer" data-on={s.booking === "done" || undefined}>
        <Check
          on={s.booking === "done"}
          size={18}
          className="cdsh-booked-check"
        />
        Booked
      </span>
    </span>
  )
}

function IconButton({ children }: { children: ReactNode }) {
  return <span className="cdsh-icon-button">{children}</span>
}

/** The "CarDS 1.0" tile's box in the 2048 x 1152 art, measured from it. */
const ART_TILE = { w: 1320, h: 577 }

function BrandTile({
  style,
}: {
  style: CSSProperties & { width: number; height: number }
}) {
  // The original art's "CarDS 1.0" tile, cropped from it as a background: the lockup and its photograph unchanged.
  // 165% of the tile's width puts the art's tile just past this one's edges (its lavender rim outside); a tile
  // squarer than the art's grows it until the height is covered too. The lockup is centred either way.
  const grow = Math.max(
    1,
    (style.height * ART_TILE.w) / (ART_TILE.h * style.width),
  )
  return (
    <Tile
      style={{
        ...style,
        backgroundImage: `url(${asset("assets/images/cardoctor-ds-hero.webp")})`,
        backgroundSize: `${165 * grow}% auto`,
      }}
      className="cdsh-brand"
      label="CarDS 1.0"
    />
  )
}

function Tooltip() {
  return (
    // The tooltip hangs under its trigger and runs off the tile's right edge; its words stay inside
    <div className="cdsh-tooltip">
      <CircleHelp size={20} strokeWidth={1.75} className="cdsh-tooltip__icon" />
      <span className="cdsh-tooltip__card">
        <span className="cdsh-tooltip__title">Profile Visibility</span>
        <span className="cdsh-tooltip__text">
          Control who can view your profile.
        </span>
      </span>
    </div>
  )
}

function Contact() {
  return (
    <div className="cdsh-contact">
      <span className="cdsh-contact__card">
        <span className="cdsh-contact__name">
          <Avatar name="Joe Ruerre" size={28} />
          Joe Ruerre
        </span>
        <span className="cdsh-contact__row">
          <Phone size={15} strokeWidth={1.75} />
          0985 587 050
        </span>
        <span className="cdsh-contact__row">
          <Mail size={15} strokeWidth={1.75} />
          joe@cardoctor.vn
        </span>
        <span className="cdsh-contact__date">28/10/2024</span>
      </span>
    </div>
  )
}

function Tabs({ s }: { s: S }) {
  return (
    <div className="cdsh-tabs">
      <Segmented
        className="cdsh-segmented"
        items={["Unread", "Read", "Archived"]}
        value={s.tab}
        targets={[undefined, "read", undefined]}
        cursor="hand"
      />
      {/* Deliberately cropped by the tile's foot and right edge */}
      <ul className="cdsh-menu" data-crop>
        {[
          "Overview",
          "Details",
          "Orders",
          "Users",
          "Settings",
          "Billing",
          "Reports",
        ].map((item, i) => (
          <li
            key={item}
            className="cdsh-menu__item"
            data-on={i === 1 || undefined}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Remember({ s }: { s: S }) {
  return (
    <div className="cdsh-remember">
      {/* A checkbox group: the first option is the one the cursor ticks */}
      <span className="cdsh-remember__card">
        <span
          className="cdsh-remember__option"
          data-target="remember"
          data-cursor="hand"
        >
          <span className="cdsh-checkbox" data-on={s.remember || undefined}>
            <Check on={s.remember} size={14} className="cdsh-checkbox__tick" />
          </span>
          <span className="cdsh-remember__copy">
            <span className="cdsh-remember__title">Remember me</span>
            <span className="cdsh-remember__text">
              Save my login details for 30 days
            </span>
          </span>
        </span>
        <span className="cdsh-remember__option">
          <span className="cdsh-checkbox" />
          <span className="cdsh-remember__copy">
            <span className="cdsh-remember__title">Product updates</span>
            <span className="cdsh-remember__text">
              A short email when CarDS changes
            </span>
          </span>
        </span>
        <span className="cdsh-remember__option">
          <span className="cdsh-checkbox" />
          <span className="cdsh-remember__copy">
            <span className="cdsh-remember__title">Two-step sign-in</span>
            <span className="cdsh-remember__text">
              A code on each new device
            </span>
          </span>
        </span>
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------- the two designs */

/** Desktop: two rows of tiles in the 600px band, the brand tile wide in the middle of the first. Seven tiles, with
 * room round each, so the band reads calm on first view. */
function HeroGrid({ s }: { s: S }) {
  return (
    <>
      <Tile
        style={at(20, 20, 384, 272)}
        label="Text field"
        className="cdsh-tile--form"
      >
        <NameField s={s} />
      </Tile>
      <BrandTile style={at(420, 20, 560, 272)} />
      <Tile
        style={at(996, 20, 384, 272)}
        label="Buttons"
        className="cdsh-tile--buttons"
      >
        <ServiceButton s={s} />
        <IconButton>
          <Heart size={22} strokeWidth={2} />
        </IconButton>
        <IconButton>
          <Bookmark size={22} strokeWidth={2} />
        </IconButton>
      </Tile>
      <Tile style={at(20, 308, 224, 272)} label="Tooltip" crop>
        <Tooltip />
      </Tile>
      <Tile style={at(260, 308, 334, 272)} label="Contact card" crop>
        <Contact />
      </Tile>
      <Tile style={at(610, 308, 418, 272)} label="Tabs and menu" crop>
        <Tabs s={s} />
      </Tile>
      <Tile style={at(1044, 308, 336, 272)} label="Checkboxes">
        <Remember s={s} />
      </Tile>
    </>
  )
}

/** Tablets: the brand tile over the field and button, each the band's full width. */
function CompactGrid({ s }: { s: S }) {
  return (
    <>
      <BrandTile style={at(16, 16, 828, 182)} />
      <Tile
        style={at(16, 214, 828, 182)}
        label="Text field and button"
        className="cdsh-tile--row"
      >
        <NameField s={s} />
        <ServiceButton s={s} />
      </Tile>
    </>
  )
}

function PhoneGrid({ s }: { s: S }) {
  return (
    <>
      <BrandTile style={at(12, 12, 334, 117)} />
      <Tile
        style={at(12, 141, 334, 107)}
        label="Text field and button"
        className="cdsh-tile--row cdsh-tile--phone"
      >
        <NameField s={s} />
        <ServiceButton s={s} />
      </Tile>
    </>
  )
}

const gridScript = scriptFor(false)
const phoneScript = scriptFor(true)

// Phones (under 640px, where the band is the phone column) take their own stage, so it is drawn 1:1 rather than
// shrunk from the compact grid
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

export default function CarDSHeroArt({ play = true }: { play?: boolean }) {
  const phone = usePhone()
  return (
    <div
      className="cdsh"
      role="img"
      aria-label="CarDS components in use: a name typed into a field, a service booked, a checkbox ticked and tabs switched"
    >
      {/* As tall as the band, as wide as the design's shape allows (the CSS sets it per width), the stage centred in it */}
      <div className="cdsh-frame">
        {phone ? (
          <Stage<S>
            key="phone"
            width={PHONE.width}
            height={PHONE.height}
            initial={initial}
            poster={poster}
            // Held on the poster until the page's loading curtain lifts
            script={play ? phoneScript : undefined}
            cursor={{ at: REST.phone }}
            accent="#3e65fe"
            fill
            className="cdsh-stage"
          >
            {(s) => <PhoneGrid s={s} />}
          </Stage>
        ) : (
          <Stage<S>
            key="grid"
            width={HERO.width}
            height={HERO.height}
            compact={{
              below: 1100,
              width: COMPACT.width,
              height: COMPACT.height,
            }}
            initial={initial}
            poster={poster}
            script={play ? gridScript : undefined}
            cursor={{ at: { wide: REST.wide, compact: REST.compact } }}
            accent="#3e65fe"
            fill
            className="cdsh-stage"
          >
            {(s, _, layout) =>
              layout === "compact" ? <CompactGrid s={s} /> : <HeroGrid s={s} />
            }
          </Stage>
        )}
      </div>
    </div>
  )
}
