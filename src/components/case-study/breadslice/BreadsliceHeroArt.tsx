import type { ReactNode } from 'react'
import { Bookmark, CirclePause, CreditCard, FileText, Link2, MessageCircle, Mic, Play, Settings, Sunrise, Trash2, Users } from 'lucide-react'
import { Stage } from '@/components/stageshow/kit/stage'
import type { Act } from '@/components/stageshow/kit/act'
import { Phone } from '@/components/stageshow/kit/phone'
import { Bar } from '@/components/stageshow/kit/window'
import './breadslice-hero-art.css'

/*
 * The Breadslice case study's hero: a row of the app's screens at one height, built with the Stageshow kit
 * (src/components/stageshow/kit) from the case study's reference images (the three-screen hero, the loaf skeleton).
 *
 * The middle phone is the story and the only one with words: the loaf, its waveform cut into slices, one slice
 * ("Personal ethics") playing in Breadslice green, the Save dock under it. Its neighbours are the recording screen
 * (the yellow record button) and the collaboration screen, then the library, as quiet filler. Every phone runs off
 * the top of the band, a gutter above its foot, so each dock shows whole.
 *
 * The hero band has fixed heights (260 / 360 / 476px) but any width, so the stage is sized by the band's height and
 * the band crops its sides: the row simply shows more phones on a wider screen, and the type never shrinks below its
 * design size. Phones and tablets get the compact design (one phone, a closer crop), desktop the wide one.
 *
 * The loop (about 11s): a finger taps play on "Work experiences"; its slice lights green, the playhead runs across
 * its part of the waveform and its length pill fills; it ends and playback hands over to "Personal ethics", which
 * plays through; playback stops and the loaf rests again, the seam. The compact crop shows only "Personal ethics",
 * so there the tap starts it. Reduced motion shows the poster: "Personal ethics" mid-play.
 */

/*
 * One gutter per design: the gap between phones equals the gap under them (the CSS sets the foot). At 48px the
 * phones at the ends either stay out of the band or cross its edge well past, at the common desktop widths.
 */
const WIDE = { width: 2600, height: 476, phone: 352, gap: 48 }
const COMPACT = { width: 760, height: 260, phone: 293, gap: 24 }

type Screen = 'loaf' | 'record' | 'collab' | 'library'

/** Left to right; index 0 of each list sits in the middle of the band. */
const ROW: Record<'wide' | 'compact', [offset: number, screen: Screen][]> = {
  wide: [
    [-3, 'collab'],
    [-2, 'library'],
    [-1, 'record'],
    [0, 'loaf'],
    [1, 'collab'],
    [2, 'library'],
    [3, 'record'],
  ],
  compact: [
    [-1, 'record'],
    [0, 'loaf'],
    [1, 'collab'],
  ],
}

/** Tabler's `bread` (MIT): Lucide has no slice of bread, and Tabler draws on the same 24px grid with 2px round strokes. */
const BREAD_PATH =
  'M18 4a3 3 0 0 1 2 5.235v8.765a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-8.764a3 3 0 0 1 1.824 -5.231h12.176v-.005'

function BreadIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={BREAD_PATH} />
    </svg>
  )
}

/* ---------------------------------------------------------------- the loaf (the story) */

/** Bars per slice of the waveform, in play order. The list shows slices 3 and 4. */
const SEGMENTS = [6, 8, 7, 8, 6, 6]
const SLICES = { work: 2, ethics: 3 } as const
type Slice = keyof typeof SLICES

/** The scene: which slice is playing, and the playhead (a slice of the waveform and the bars played in it). */
type S = { playing: Slice | null; seg: number; bar: number }

const initial: S = { playing: null, seg: SLICES.work, bar: 0 }
const poster: S = { playing: 'ethics', seg: SLICES.ethics, bar: 5 }

/** Where the finger rests between taps, in stage pixels: over the loaf's screen, clear of its controls. */
const REST = { wide: { x: 2600 / 2 + 120, y: 250 }, compact: { x: 760 / 2 + 90, y: 150 } }

/** One bar of audio, in ms: the playhead's step and the pill's fill. */
const STEP = 480

/** Where the playhead stands: just left of bar `bar` of slice `seg` (4px bars, 3px apart, 11px between slices). */
const headX = (seg: number, bar: number) => {
  const before = SEGMENTS.slice(0, seg).reduce((n, c) => n + c, 0)
  return (before + bar) * 7 + seg * 8 - 3.5
}

async function play(a: Act<S>, slice: Slice) {
  const seg = SLICES[slice]
  for (let bar = 1; bar <= SEGMENTS[seg]; bar++) {
    await a.wait(STEP)
    a.put({ bar })
  }
}

async function script(a: Act<S>) {
  await a.wait(900)
  if (a.layout === 'wide') {
    a.mark('play')
    await a.click('play-work')
    // The slice lights at once, as the app answers a tap; its pill starts empty
    await a.snap({ playing: 'work', seg: SLICES.work, bar: 0 }, 'slice-work')
    await play(a, 'work')
    // The slice ends and playback runs on into the next: the playhead carries on, the green moves down a row
    a.mark('handoff')
    await a.snap({ playing: 'ethics', seg: SLICES.ethics, bar: 0 }, 'slice-ethics')
  } else {
    a.mark('play')
    await a.click('play-ethics')
    await a.snap({ playing: 'ethics', seg: SLICES.ethics, bar: 0 }, 'slice-ethics')
  }
  await play(a, 'ethics')
  await a.wait(500)
  // The slice ends: playback stops and the loaf rests
  a.mark('stop')
  a.put({ playing: null })
  await a.wait(1600)
  // The playhead has faded; it goes back to the first slice unseen, and the finger (drawn only where it taps)
  // returns to where it rests
  await a.snap({ seg: SLICES.work, bar: 0 })
  await a.move(REST[a.layout])
}

/** A steady, uneven waveform: the same heights on every render. */
const barHeight = (i: number) => Math.round(10 + 34 * Math.abs(Math.sin(i * 1.73) * Math.cos(i * 0.41 + 0.6)))

function Waveform({ s }: { s: S }) {
  let i = 0
  const lit = s.playing ? SLICES[s.playing] : -1
  return (
    <div className="bsh-wave">
      <div className="bsh-wave__bars">
        {SEGMENTS.map((count, seg) => (
          <div key={seg} className="bsh-wave__slice" data-playing={seg === lit || undefined}>
            {Array.from({ length: count }, (_, b) => (
              <span key={b} className="bsh-wave__bar" data-played={(seg === lit && b < s.bar) || undefined} style={{ height: barHeight(i++) }} />
            ))}
          </div>
        ))}
        <span className="bsh-wave__head" data-on={!!s.playing || undefined} style={{ transform: `translateX(${headX(s.seg, s.bar)}px)` }} />
      </div>
    </div>
  )
}

function SliceRow({ id, title, time, s }: { id: Slice; title: string; time: string; s: S }) {
  const playing = s.playing === id
  // A slice not playing keeps a full pill under its faded fill, so the fill never runs backwards in view
  const fill = playing ? s.bar / SEGMENTS[SLICES[id]] : 1
  return (
    <li className="bsh-slice" data-slice={id} data-playing={playing || undefined} data-target={`slice-${id}`}>
      <div className="bsh-slice__title">{title}</div>
      <div className="bsh-slice__row">
        <span className="bsh-btn">
          <Trash2 size={22} strokeWidth={2} />
        </span>
        <span className="bsh-slice__track">
          <span className="bsh-slice__time">
            {/* data-snap: it resets to empty only while faded out, as a slice starts */}
            <span className="bsh-slice__fill" data-snap style={{ transform: `scaleX(${fill})` }} />
            <span className="bsh-slice__label">{time}</span>
          </span>
        </span>
        {/* Play and pause share one place and crossfade */}
        <span className="bsh-btn bsh-btn--toggle" data-target={`play-${id}`}>
          <span className="bsh-btn__icon" data-on={!playing || undefined}>
            <Play size={22} strokeWidth={2} fill="currentColor" />
          </span>
          <span className="bsh-btn__icon" data-on={playing || undefined}>
            <CirclePause size={26} strokeWidth={2} />
          </span>
        </span>
      </div>
    </li>
  )
}

function TabBar() {
  return (
    <div className="bsh-tabs">
      <span className="bsh-tab">
        <MessageCircle size={24} strokeWidth={2} />
      </span>
      <span className="bsh-tab" data-selected>
        <BreadIcon />
      </span>
      <span className="bsh-tab">
        <Bookmark size={24} strokeWidth={2} />
      </span>
    </div>
  )
}

function LoafScreen({ s }: { s: S }) {
  return (
    <div className="bsh-screen bsh-loaf">
      <Waveform s={s} />
      <ol className="bsh-slices">
        <SliceRow id="work" title="Work experiences" time="1:16" s={s} />
        <SliceRow id="ethics" title="Personal ethics" time="0:42" s={s} />
      </ol>
      <div className="bsh-dock">
        <TabBar />
        <div className="bsh-save">Save</div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- the neighbours (filler) */

/** A slice in filler: its title a bar in the title's line box, its controls quiet. */
function FillerSlice({ w }: { w: number }) {
  return (
    <li className="bsh-slice">
      <div className="bsh-slice__title">
        <Bar w={w} h={9} r={4.5} tone={4} />
      </div>
      <div className="bsh-slice__row">
        <span className="bsh-btn">
          <Trash2 size={22} strokeWidth={2} />
        </span>
        <span className="bsh-slice__track">
          <span className="bsh-slice__time" />
        </span>
        <span className="bsh-btn">
          <Play size={22} strokeWidth={2} fill="currentColor" />
        </span>
      </div>
    </li>
  )
}

function RecordScreen() {
  return (
    <div className="bsh-screen bsh-record">
      <ol className="bsh-slices">
        <FillerSlice w={168} />
        <FillerSlice w={124} />
        <FillerSlice w={148} />
      </ol>
      <div className="bsh-dock bsh-record__dock">
        <div className="bsh-record__controls">
          <span className="bsh-record__side">
            <Sunrise size={24} strokeWidth={2} />
          </span>
          <span className="bsh-record__mic">
            <Mic size={30} strokeWidth={2} />
          </span>
          <span className="bsh-record__side">
            <Settings size={24} strokeWidth={2} />
          </span>
        </div>
        <Bar w={92} h={9} r={4.5} className="bsh-record__label" />
      </div>
    </div>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bsh-card ${className}`}>{children}</div>
}

function Section({ icon, w, children }: { icon: ReactNode; w: number; children: ReactNode }) {
  return (
    <section className="bsh-section">
      <div className="bsh-section__head">
        {icon}
        <Bar w={w} h={9} r={4.5} tone={4} />
      </div>
      {children}
    </section>
  )
}

function CollabScreen() {
  return (
    <div className="bsh-screen bsh-collab">
      <Section icon={<Users size={20} strokeWidth={2} className="bsh-ink-yellow" />} w={150}>
        <Card className="bsh-card--wide">
          <Bar w={112} h={8} r={4} tone={3} />
          <div className="bsh-stats">
            <span className="bsh-stat">
              <Bookmark size={20} strokeWidth={2} />
              <Bar w={22} h={9} r={4.5} tone={3} />
            </span>
            <span className="bsh-stat">
              <MessageCircle size={20} strokeWidth={2} />
              <Bar w={22} h={9} r={4.5} tone={3} />
            </span>
            <span className="bsh-stat">
              <FileText size={20} strokeWidth={2} />
              <Bar w={44} h={9} r={4.5} tone={3} />
            </span>
          </div>
        </Card>
      </Section>
      <Section icon={<Link2 size={20} strokeWidth={2} className="bsh-ink-lilac" />} w={96}>
        <div className="bsh-cards">
          <Card>
            <Bar w={104} h={8} r={4} tone={3} />
            <span className="bsh-card__line">
              <Bar w={64} h={12} r={6} tone={4} />
            </span>
          </Card>
          <Card>
            <Bar w={96} h={8} r={4} tone={3} />
            <span className="bsh-card__line">
              <Bar w={84} h={12} r={6} tone={4} />
            </span>
          </Card>
        </div>
        <Card className="bsh-card--row">
          <Link2 size={20} strokeWidth={2} className="bsh-ink-lilac" />
          <Bar w={128} h={8} r={4} tone={3} />
        </Card>
      </Section>
      <Section icon={<CreditCard size={20} strokeWidth={2} className="bsh-ink-green" />} w={104}>
        <div className="bsh-cards">
          <Card>
            <Bar w={80} h={8} r={4} tone={3} />
            <span className="bsh-card__line" data-person>
              <span className="bsh-face" />
              <Bar w={40} h={12} r={6} tone={4} />
            </span>
          </Card>
          <Card>
            <Bar w={72} h={8} r={4} tone={3} />
            <span className="bsh-card__line">
              <Bar w={60} h={12} r={6} tone={4} />
            </span>
          </Card>
        </div>
      </Section>
    </div>
  )
}

const LIBRARY = [
  [176, 92],
  [132, 108],
  [160, 76],
  [118, 96],
  [148, 84],
  [170, 100],
] as const

function LibraryScreen() {
  return (
    <div className="bsh-screen bsh-library">
      <ul className="bsh-loaves">
        {LIBRARY.map(([title, meta], i) => (
          <li key={i} className="bsh-loaves__row">
            <span className="bsh-loaves__art">
              <BreadIcon size={22} />
            </span>
            <span className="bsh-loaves__text">
              <span className="bsh-loaves__line">
                <Bar w={title} h={9} r={4.5} tone={4} />
              </span>
              <span className="bsh-loaves__line bsh-loaves__line--meta">
                <Bar w={meta} h={7} r={3.5} tone={3} />
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className="bsh-library__tabs">
        <TabBar />
      </div>
    </div>
  )
}

const SCREENS: Record<Screen, (props: { s: S }) => ReactNode> = {
  loaf: LoafScreen,
  record: RecordScreen,
  collab: CollabScreen,
  library: LibraryScreen,
}

export default function BreadsliceHeroArt() {
  return (
    <div className="bsh" role="img" aria-label="Breadslice's loaf screen playing one slice, between its recording and collaboration screens">
      <div className="bsh-row">
        <div className="bsh-slot">
          <Stage<S>
            width={WIDE.width}
            height={WIDE.height}
            compact={{ below: 1100, width: COMPACT.width, height: COMPACT.height }}
            initial={initial}
            poster={poster}
            script={script}
            cursor={{ at: REST, style: 'touch' }}
            theme="dark"
            fill
            className="bsh-stage"
          >
            {(s, _, layout) => {
              const d = layout === 'compact' ? COMPACT : WIDE
              // The focal phone first, so it leads the scene's order; the others follow left to right
              const row = [...ROW[layout]].sort(([a], [b]) => Number(b === 0) - Number(a === 0))
              return row.map(([offset, screen]) => {
                const Content = SCREENS[screen]
                return (
                  <Phone
                    key={`${layout}-${offset}`}
                    width={d.phone}
                    dark
                    wallpaper="var(--bsh-screen)"
                    className="bsh-phone"
                    data-focus={offset === 0 || undefined}
                    style={{ left: d.width / 2 - d.phone / 2 + offset * (d.phone + d.gap) }}
                  >
                    <Content s={s} />
                  </Phone>
                )
              })
            }}
          </Stage>
        </div>
      </div>
    </div>
  )
}
