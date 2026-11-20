import { useEffect, useRef, useState } from 'react'
import { isLowPower } from '@/lib/performance'
import { bezier, clamp, FPS, lerp, project, type Camera } from './engine'
import { cameraAt, STAGE_H, STAGE_W } from './timeline'
import { backdropAt, camFrame, connectorAt, fitAt, FACE_FIT, followScroll, frameAtScroll, HOLD_VH, introAt, introCardAt, leafAt, lowerBy, MODULE_HOVER, moduleAt, plateAt, READY_FRAME, SCENE_END, shadowAt, TRACK_VH } from './scene'
import { FACE_TARGET, FLOOR_DEPTH, LAYERS, MODULE_DEPTH, MODULES, MODULE_RADIUS, SLAB_THICK, STORIES, TOPIC_IDS, W } from './layers'
import Stack from './Stack'
import Modules from './Modules'
import Pills from './Pills'
import Hint from './Hint'
import IntroCard from './IntroCard'
import IntroStatement, { StatementBlock } from './IntroStatement'
import StoryPanel from './StoryPanel'
import { interaction } from './interaction'
import { corners, hull, pick, targetsAt, type Pt, type Target } from './hit'
import { ABOVE, aboveOf, anchorOf, framePose, PEEL_LIFT, PEELABLE, peelFade, REST, type Pose } from './focus'
import { freeArea, SIDE_MIN_W } from './panelLayout'
import { advance, aim, snap, spring, step as stepSpring, tween, type Spring } from './spring'
import { paintBook, paintPlate, paintSheet, revealRise, revealTargets, REVEAL_CLOSE, REVEALS } from './reveal'
import ConfiguratorFace, { FACE_H, FACE_W } from './faces/ConfiguratorFace'

/**
 * A pinned, scroll-scrubbed isometric showcase. The scene is authored on the reference clip's 1920x1080 stage and
 * scaled to the viewport; `render(frame)` is pure, so scrolling back plays the build in reverse.
 *
 * M1: the real Sales Configurator assembles flat, then tilts into the dimetric view.
 */

/** Blueprint grid (flat beat): 1 px lines on a 26.35 px pitch, and 1.2 px '+' marks every 8th cell (210.8 px). */
const GRID_SIZE = '26.35px 26.35px, 26.35px 26.35px'
const GRID =
  'linear-gradient(to right, rgba(70,74,84,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(70,74,84,.12) 1px, transparent 1px)'
/**
 * Half-width of the floor plane, in world px. It must cover the stage at the final pose and no more: a larger plane is
 * re-rasterised every time the camera moves and cost most of the scrub's frame time (12000 px: 56 slow frames in 233).
 */
const FLOOR_HALF = 2304
/** The flat floor layer: a repeating '+' tile this size, large enough to cover the stage under any camera. */
const FLOOR_PITCH = 288
const FLOOR_SIZE = 9216
/** Floor lattice (3D beat): '+' marks, as in the clip's tilted view. */
const FLOOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='288' height='288'><path d='M144 126V162M126 144H162' stroke='%238a8e96' stroke-width='2.4' fill='none' opacity='.8'/></svg>")`

/**
 * How far a hovered layer rises, in world px (it was 46, which barely read). The plates above it part to make room: the gaps in
 * the stack are only 66 to 400 px, so the layers in front of a hovered one rise by `PART` as well and nothing passes through.
 */
const LIFT = 130
const PART = 150
/** How much a hovered layer grows, about its own centre: 0.06 is 6 %. It replaced the blue outline and glow. */
const ZOOM = 0.06
/** How much of their opacity the layers in front of a hovered one give up. They are full-size plates, so parting alone leaves them covering it. */
const GHOST = 0.9
/** The wave that tells the reader the layers can be clicked: one pulse per layer in reading order, this far apart, each this long (ms). */
const WAVE_GAP = 230
const WAVE_LEN = 620
/** The backdrop's tint while a layer is hovered, so the hovered one separates from the stack. 0 is none. */
const HOVER_DIM = 0.18
/** How closely the tooltip trails the cursor per frame: 1 is glued to it, lower lags more. */
const TIP_EASE = 0.28
/**
 * The focus move, as spring stiffnesses (a spring settles in about 6 / omega seconds). The camera takes about 1.1 s, as long as
 * clip 05's second move (2.6 s) allows once it is trimmed for a click; the peel follows it a beat behind.
 */
/** Clip 05's second camera move: `cubic-bezier(.45,.10,.50,1)` over 2.6 s. Trimmed to 1.15 s for a click; the profile is the clip's. */
const CAM_EASE = bezier(0.45, 0.1, 0.5, 1)
const CAM_SECONDS = 1.15
const OMEGA_FOCUS = 5.2
const OMEGA_HOVER = 17
/**
 * Closing is a dismissal, not an arrival, so it is quicker than opening: the camera takes 0.7 s (it was 1.15), the pieces
 * settle in about 0.7 s (5.2 took 1.1 s), and they drop back 25 ms apart (it was 55). The same path runs when the reader
 * scrolls back up with a layer open. Pieces still drop back bottom first with the same stiffness, so a lower one is always ahead of
 * the one above it and nothing passes through anything.
 */
const CAM_SECONDS_CLOSE = 0.7
const OMEGA_CLOSE = 8.5
const PEEL_STAGGER_CLOSE = 25
/** Layers lift out of the way one after another, top of the stack first, this many ms apart. */
const PEEL_STAGGER = 55

/**
 * The box the finished pose fills on the 1920 x 1080 stage (measured at the final frame: about 1300 x 710 around (920, 515)),
 * with a margin so the pills and the lifted plates never touch the edge.
 */
const END_BOX = { w: 1300 + 240, h: 711 + 300, cx: 920, cy: 515 }

/** One slab per plate, offset along the light by its height above the floor, so the shadow reads as a stair-stepped stack. */
const LIGHT = [0.5, 0.2] as const
const SHADOW_SLABS = [{ x: -FACE_W / 2, y: -FACE_H / 2, w: FACE_W, h: FACE_H, h0: 0 }, ...LAYERS.map((l) => ({ x: l.x - l.w / 2, y: l.y - l.h / 2, w: l.w, h: l.h, h0: l.depth }))].map((r) => {
  const above = (FLOOR_DEPTH - r.h0) * W
  // A shadow's edge softens the further the caster is from the surface: blur grows with height (the penumbra).
  return { x: r.x + LIGHT[0] * above, y: r.y + LIGHT[1] * above, w: r.w, h: r.h, blur: 14 + above / 14 }
})

/**
 * project() for points on the horizontal plane at height z, written as one CSS matrix. A plane under an orthographic
 * camera is a plain 2D affine map of its own pattern, so a flat layer with this matrix is exact, and costs almost
 * nothing: as a plane inside the 3D world it is re-rasterised at every angle. `half` re-centres the layer's corner
 * origin on the world's origin.
 */
function floorMatrix(cam: { s: number; rotZ: number; elev: number; cx: number; cy: number }, half: number, z: number) {
  const k = (cam.s / FACE_W) * FACE_FIT
  const th = (cam.rotZ * Math.PI) / 180
  const ph = ((90 - cam.elev) * Math.PI) / 180
  const a = k * Math.cos(th)
  const b = k * Math.sin(th) * Math.cos(ph)
  const c = -k * Math.sin(th)
  const d = k * Math.cos(th) * Math.cos(ph)
  const e = cam.cx - (a * half + c * half)
  const f = cam.cy - k * z * Math.sin(ph) - (b * half + d * half)
  return `matrix(${a},${b},${c},${d},${e},${f})`
}

/** The shadow canvas: world px per canvas px is 1, centred on the world origin, big enough for the stack's long shadow. */
const SHADOW_PX = 3072
/** How far a module's shadow falls from it along the light, in world px. */
const MODULE_SHADOW_REACH = 220

/** Paints the stack's cast shadow once: a blurred, partly transparent slab per plate, so overlaps build up. */
function paintShadow(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, SHADOW_PX, SHADOW_PX)
  const c = SHADOW_PX / 2
  for (const r of SHADOW_SLABS) {
    ctx.save()
    ctx.filter = `blur(${r.blur}px)`
    // 7 slabs overlap at the core, so this alpha compounds to a peak of about 12 % darker than the floor (it was .15: 40 %).
    ctx.fillStyle = 'rgba(59,61,68,.0185)'
    ctx.fillRect(c + r.x, c + r.y, r.w, r.h)
    ctx.restore()
  }
}

/**
 * Still mode: the finished pose, with no pinned scroll. Reduced motion (which can change while the page is open) and
 * low-power devices get it; a scroll-scrubbed 3D stack is what those settings exist to avoid. Hover, click and the story
 * panel work the same, since the scene is simply held on its last frame.
 */
function useStill() {
  const [lowPower] = useState(isLowPower)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return lowPower || reduced
}

/** The camera as `project()` expects it: the stage scale folded into `s`, so one world px is `s / W` stage px. */
const projCam = (cam: Camera): Camera => ({ ...cam, s: cam.s * FACE_FIT })

type Leaf = { el: HTMLElement; role: string; i: number; z: number }

export default function IsoShowcase() {
  const still = useStill()
  const trackRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const plateRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const floorRef = useRef<HTMLDivElement>(null)
  const readoutRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)
  const boxes = useRef(new Map<string, HTMLElement>())
  const mods = useRef(new Map<string, HTMLElement>())
  const conns = useRef(new Map<string, HTMLElement>())
  const modShadows = useRef(new Map<string, HTMLElement>())
  const pillsRef = useRef<HTMLDivElement>(null)
  const pillEls = useRef(new Map<string, HTMLElement>())
  const dimRef = useRef<HTMLDivElement>(null)
  const faceRef = useRef<HTMLDivElement>(null)
  const faceWallsRef = useRef<HTMLDivElement>(null)
  const statementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const frame = frameRef.current
    const stage = stageRef.current
    const world = worldRef.current
    const plate = plateRef.current
    if (!track || !frame || !stage || !world || !plate) return

    const query = new URLSearchParams(window.location.search)
    const debug = query.has('f') || query.has('debug')
    const frozen = query.has('f') ? clamp(parseFloat(query.get('f') ?? '0'), 0, SCENE_END) : still ? SCENE_END : null
    /** `?open=<topic>` (with `?f` or `?debug`) opens a topic as soon as the scene is ready: for screenshots and checks. */
    let autoOpen = debug ? query.get('open') : null
    /** Reduced motion and low-power devices get the same moves, about eight times faster. */
    const omegaK = still ? 8 : 1

    const leaves: Leaf[] = Array.from(world.querySelectorAll<HTMLElement>('[data-a]')).map((el) => ({
      el,
      role: el.dataset.a ?? '',
      i: Number(el.dataset.i ?? 0),
      z: Number(el.dataset.z ?? 0),
    }))

    /** Eased 0..1 amount per topic: lifted (hovered or open). */
    const hoverSp = new Map<string, Spring>()
    /** How far each piece above the open topic has lifted out of the way, and when it is next allowed to move. */
    const peelSp = new Map<string, Spring>()
    const peelState = new Map<string, { want: number; at: number; eff: number }>()
    /** How far each opened topic's reveal has played, in frames since the click (see reveal.ts). It plays forwards while the topic is open and backwards, faster, when it closes. */
    const revealT = new Map<string, number>()
    /** `?rt=<frames>` (with `?f` or `?debug`) holds the open topic's reveal at that frame: for screenshots and checks. */
    const rtHold = debug && query.has('rt') ? parseFloat(query.get('rt') ?? '0') : null
    const rt = (topic: string) => revealT.get(topic) ?? 0
    const rootOf = new Map<string, HTMLElement | null>()
    const sheetsOf = new Map<string, HTMLElement[]>()
    /** The camera pose the open topic asks for, as springs, so a new target bends the motion instead of restarting it. */
    const pose = { zoom: tween(1), dx: tween(0), dy: tween(0), rot: tween(0), elev: tween(0) }
    /** When the "clickable" wave started (ms), and whether it has already played. It plays once, as the layers become usable. */
    let waveAt = -1
    let waveDone = false
    /** Eased tint over the stack while a layer is hovered or open. It fades out (not cuts) as the layer closes, still cut around it. */
    const dimSp = spring(0)
    let lastDimId: string | null = null
    /** Where the pointer is in frame px, and the tooltip's eased position: it trails the cursor a little. */
    let ptr: [number, number] | null = null
    const tip = { x: 0, y: 0, seen: false }
    let poseKey = ''
    let poseGoal: Pose = REST
    let lastCam = cameraAt(camFrame(0))
    /** Heights the paint loop placed each piece at, with the hover lift and peel. Used for the labels and dots. */
    const lastZ = new Map<string, number>()
    /** Resting heights, without lift. Hit-testing uses these so a hovered plate does not dodge the pointer as it rises. */
    const restZ = new Map<string, number>()
    /** The scene has reached its last frame and is holding: topics can be used. */
    let atEnd = false

    let scale = 1
    let raf = 0
    let shown = frozen ?? 0
    let goal = frozen ?? 0
    /** The scroll position the scene is showing, in viewport heights past the pin: `shown` is its frame. See followScroll. */
    let shownVh = 0
    /** The scroll position the scene had when a story opened. While one is open the scene stays here, whatever the page does. */
    let heldVh = 0
    let last = 0

    /**
     * Fit the stage to what is on it. The scene is authored on 1920 x 1080, but the finished pose only fills about 1300 x 710
     * of that, so fitting the whole stage left the stack small on a desktop and tiny on a phone. The fitted box blends from
     * the full stage (the flat build and the tilt, where the face is large) to the finished pose's extent as the stack docks.
     * `fit` is how far along that blend is; `scale` and the stage offset follow from it, and the pointer and pills use both.
     */
    let fit = 0
    let offX = 0
    let offY = 0
    const apply = () => {
      const w = frame.clientWidth
      const h = frame.clientHeight
      const bw = lerp(STAGE_W, END_BOX.w, fit)
      const bh = lerp(STAGE_H, END_BOX.h, fit)
      const cx = lerp(STAGE_W / 2, END_BOX.cx, fit)
      const cy = lerp(STAGE_H / 2, END_BOX.cy, fit)
      scale = Math.min(w / bw, h / bh)
      // put the box's centre at the frame's centre
      offX = w / 2 - cx * scale
      offY = h / 2 - cy * scale
      stage.style.left = '0px'
      stage.style.top = '0px'
      stage.style.transformOrigin = '0 0'
      stage.style.transform = `translate(${offX}px, ${offY}px) scale(${scale})`
    }
    const measure = apply

    /** How far the page has scrolled past the pin, in viewport heights, held to the track (the hold after it is not scene). */
    const scrollVh = () => clamp(-track.getBoundingClientRect().top / window.innerHeight, 0, TRACK_VH)

    const zOfRest = (id: string) => restZ.get(id) ?? 0
    const zOfLast = (id: string) => lastZ.get(id) ?? 0
    const toFrame = (p: Pt): Pt => [offX + p[0] * scale, offY + p[1] * scale]
    const side = () => window.matchMedia(`(min-width: ${SIDE_MIN_W}px)`).matches
    const polygon = (pts: readonly Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') + 'Z'

    /** The camera pose that frames `topic` in the area the panel leaves free. Cached until the frame or the topic changes. */
    const poseFor = (topic: string | null): Pose => {
      if (!topic) return REST
      const w = frame.clientWidth
      const h = frame.clientHeight
      const key = `${topic}|${w}x${h}|${side()}`
      if (key === poseKey) return poseGoal
      const fa = freeArea(w, h, side())
      const free = { x: (fa.x - offX) / scale, y: (fa.y - offY) / scale, w: fa.w / scale, h: fa.h / scale }
      poseGoal = framePose(topic, cameraAt(camFrame(SCENE_END)), zOfRest, free)
      poseKey = key
      return poseGoal
    }

    /** The wave's pulse for the i-th topic, 0..1..0, or 0 when it is not running. */
    const waveAmt = (i: number, now: number) => {
      if (waveAt < 0 || waveDone) return 0
      const t = (now - waveAt - i * WAVE_GAP) / WAVE_LEN
      return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t)
    }
    /** Current time for the paint: set by the tick, so paint stays a function of its inputs. */
    let clock = 0

    const paint = (f: number) => {
      // Focus is one camera move, as in clip 05's second move: a dolly onto the topic with a small orbit, in the area the panel
      // leaves free. Everything below (floor, shadow, pills, hit-testing) derives from `cam`, so it all follows.
      const base = cameraAt(camFrame(f))
      const cam: Camera = {
        s: base.s * pose.zoom.x,
        rotZ: base.rotZ + pose.rot.x,
        elev: base.elev + pose.elev.x,
        cx: base.cx + pose.dx.x,
        cy: base.cy + pose.dy.x,
      }
      // World units are face design px. cam.s is how wide the card reads on the stage, so one world px is cam.s / FACE_W
      // stage px; FACE_FIT then sizes the face relative to the clip's card (1 = same width as the clip's card).
      const S = (cam.s / FACE_W) * FACE_FIT
      // Transform only: moving left/top would lay the subtree out again every frame.
      world.style.transform = `translate(${cam.cx}px, ${cam.cy}px) scale(${S}) rotateX(${90 - cam.elev}deg) rotateZ(${cam.rotZ}deg)`

      const p = plateAt(f)
      plate.style.background = p.colour
      // A same-size slab offset down and to the right, in face px (clip: +17% W, +6.5% W). Soft edge about 9 px.
      plate.style.boxShadow = `${200 * p.shadow}px ${78 * p.shadow}px 40px rgba(58,60,68,${0.07 * p.shadow})`

      fit = fitAt(f)
      apply()

      // The problem statement: over the face's empty plate on frame 0, faded by scroll through the intro. At frame 0 the camera is
      // flat, so the plate is a plain rectangle in stage px: project its corners, then map them to the frame as the stage is.
      // Where the plate is too small for the words (phones, tablets) they sit on a card of the plate's colour that shrinks onto it.
      const st = statementRef.current
      if (st) {
        const text = st.firstElementChild as HTMLElement
        const k = frozen != null ? (f < 0.5 ? 1 : 0) : introAt(shownVh)
        const c0 = projCam(cameraAt(camFrame(0)))
        const p0 = toFrame(project(c0, FACE_W, -FACE_W / 2, -FACE_H / 2, 0))
        const p1 = toFrame(project(c0, FACE_W, FACE_W / 2, FACE_H / 2, 0))
        const pw = p1[0] - p0[0]
        const ph = p1[1] - p0[1]
        const narrow = pw < 520
        const m = narrow ? (frozen != null ? (f < 0.5 ? 0 : 1) : introCardAt(shownVh)) : 0
        const gone = k < 0.004 && (!narrow || m > 0.999)
        st.style.visibility = gone ? 'hidden' : ''
        if (!gone) {
          const cw = narrow ? Math.min(frame.clientWidth - 32, 640) : pw
          text.style.width = `${cw}px`
          // the card is as tall as its words need, and never smaller than the plate it covers
          const ch = narrow ? Math.max(text.offsetHeight + 80, ph) : ph
          const rw = narrow ? lerp(cw, pw, m) : pw
          const rh = narrow ? lerp(ch, ph, m) : ph
          st.style.left = `${(p0[0] + p1[0]) / 2 - rw / 2}px`
          st.style.top = `${(p0[1] + p1[1]) / 2 - rh / 2}px`
          st.style.width = `${rw}px`
          st.style.height = `${rh}px`
          st.style.background = narrow ? '#d6d7db' : ''
          text.style.opacity = String(k)
          text.style.transform = `translateY(${(-14 * (1 - k)).toFixed(1)}px)`
        }
      }

      const b = backdropAt(f)
      if (gridRef.current) gridRef.current.style.opacity = String(b.flat)
      if (floorRef.current) {
        floorRef.current.style.opacity = String(b.floor)
        floorRef.current.style.transform = floorMatrix(cam, FLOOR_SIZE / 2, -FLOOR_DEPTH * W)
      }

      const live0 = interaction.get()
      // The topic being hovered (or the open one): everything in front of it parts to let it rise.
      const lead0 = live0.focus ?? live0.hover
      const waving = TOPIC_IDS.map((t, i) => waveAmt(i, clock))
      const hov = (topic: string) => Math.max(hoverSp.get(topic)?.x ?? 0, waving[TOPIC_IDS.indexOf(topic)] ?? 0)
      /** How far a piece is pushed up out of the way of the hovered layer: by its hover amount, so it eases with it. */
      const partAmt = (id: string) => {
        let a = 0
        for (const t of TOPIC_IDS) if (ABOVE[t].has(id)) a = Math.max(a, hov(t))
        return a
      }
      const part = (id: string) => PART * partAmt(id)
      const peel = (id: string) => peelSp.get(id)?.x ?? 0

      // Layers rise from below and dock. A rising plate must never pass through the plate above it.
      const placed = new Map<string, number>()
      for (const layer of [...LAYERS].sort((a, b) => a.depth - b.depth)) {
        const el = boxes.current.get(layer.id)
        if (!el) continue
        const big = layer.w >= W
        let z = -layer.depth * W - lowerBy(f, layer.enter, layer.tau, big, W)
        // the nearest plate above (smaller depth) sets a ceiling: this plate's top may not reach its bottom face
        for (const above of LAYERS) {
          if (above.depth < layer.depth && placed.has(above.id)) z = Math.min(z, (placed.get(above.id) as number) - above.thick * W - 1)
        }
        placed.set(layer.id, z)
        const pl = peel(layer.id)
        const lifted = z + LIFT * hov(layer.topic) + part(layer.id) + PEEL_LIFT * pl
        el.style.transform = `translateZ(${lifted}px) scale(${1 + ZOOM * hov(layer.topic)})`
        lastZ.set(layer.id, lifted)
        restZ.set(layer.id, z)
        // A peeled plate fades out through its faces, not through the wrapper: opacity on a preserve-3d wrapper would flatten
        // the plate and drop its walls.
        const fade = peelFade(pl) * (1 - GHOST * partAmt(layer.id))
        // (the rationale plate's cubes and the book are 3D and keep no opacity of their own: see paintPlate and paintBook)
        for (const face of el.children) if (!(face as HTMLElement).dataset.pm) (face as HTMLElement).style.opacity = fade >= 0.999 ? '' : String(fade)
        if (layer.book) {
          if (!rootOf.has(layer.id)) rootOf.set(layer.id, el.querySelector<HTMLElement>('[data-pm="book"]'))
          const book = rootOf.get(layer.id)
          if (book) paintBook(book, rt(layer.topic), fade)
        }
        if (layer.platform) {
          if (!rootOf.has(layer.id)) rootOf.set(layer.id, el.querySelector<HTMLElement>('[data-pm="root"]'))
          const root = rootOf.get(layer.id)
          if (root) paintPlate(root, rt(layer.topic), fade)
        }
        if (layer.sheet) {
          if (!sheetsOf.has(layer.id)) sheetsOf.set(layer.id, Array.from(el.querySelectorAll<HTMLElement>('[data-sheet]')))
          for (const sh of sheetsOf.get(layer.id) ?? []) paintSheet(sh, rt(layer.topic))
        }
        // A plate still waiting below the frame, or peeled away, is not drawn at all.
        el.style.visibility = f < layer.enter - 12 || fade < 0.004 ? 'hidden' : ''
      }
      if (shadowRef.current) {
        shadowRef.current.style.opacity = String(shadowAt(f))
        shadowRef.current.style.transform = floorMatrix(cam, SHADOW_PX / 2, -FLOOR_DEPTH * W)
      }

      // The two side modules sit at the height of the stack's lowest layer (the foundation): their top faces are in the plane of its
      // top. A connector joins each to the foundation's near wall as one flat bar, so it reads as a single line, flat to that plane.
      // The foundation lifts on hover and the module does not follow it, so the bar's two ends are then at different heights and it
      // inclines, still attached to the foundation at one end and the module at the other.
      const lowest = LAYERS.reduce((a, l) => (l.depth > a.depth ? l : a), LAYERS[0])
      const lowestNow = lastZ.get(lowest.id) ?? -MODULE_DEPTH * W
      const lowestRest = restZ.get(lowest.id) ?? -MODULE_DEPTH * W
      // the module's top face: the foundation's resting top, plus the module's own hover lift
      const modZ = -MODULE_DEPTH * W
      for (const m of MODULES) {
        const el = mods.current.get(m.id)
        const a = moduleAt(f, m.enter)
        const lift = LIFT * hov(m.id)
        if (el) {
          el.style.transform = `translate3d(0,0,${modZ + lift}px) scale(${a.scale * (1 + ZOOM * hov(m.id))})`
          el.style.transformOrigin = '50% 50%'
          lastZ.set(m.id, modZ + lift)
          restZ.set(m.id, modZ)
          el.style.opacity = a.opacity >= 0.999 ? '' : String(a.opacity)
        }
        const sh = modShadows.current.get(m.id)
        if (sh) sh.style.opacity = String(a.shadow)
        const k = connectorAt(f, m.connect)
        // From the foundation's near wall (mid-thickness, so it meets the wall, not its edge) to the module's near edge.
        const yA = m.dir * (FACE_H / 2)
        const yB = m.y - m.dir * (m.h / 2)
        // Both ends are measured from the module's slab mid-height at rest, so at rest they are exactly level and the bar is flat. The
        // near end then follows the foundation's lift (lowestNow - its rest), so it inclines only while the foundation is raised.
        const level = modZ - (SLAB_THICK * W) / 2
        const zA = level + (lowestNow - lowestRest)
        const zB = level + lift
        const dy = yB - yA
        const dz = zB - zA
        const len = Math.hypot(dy, dz)
        const uy = dy / len
        const uz = dz / len
        for (const [key, c] of conns.current) {
          if (!key.startsWith(`${m.id}:`)) continue
          c.style.top = '0px'
          c.style.height = `${len}px`
          c.style.transformOrigin = '0 0'
          // The bar is laid out along its own +y. Its basis: +y runs along the line (uy, uz), +x stays world x, +z is their cross
          // product. When both ends are at one height (uz = 0) this is the plain flat bar.
          c.style.transform = `matrix3d(1,0,0,0, 0,${uy},${uz},0, 0,${-uz},${uy},0, 0,${yA},${zA},1) scaleY(${k})`
        }
      }

      // The Configurator face is the top of the stack: it lifts on hover and rises out of the way when a layer below it opens.
      const facePeel = peel(FACE_TARGET.id)
      const faceFade = peelFade(facePeel) * (1 - GHOST * partAmt(FACE_TARGET.id))
      for (const l of leaves) {
        const s = leafAt(f, l.role, l.i, l.z)
        const o = s.opacity * faceFade
        l.el.style.opacity = o >= 0.999 ? '' : String(o)
        l.el.style.transform = `translate3d(0,${s.dy}px,${s.lift}px)`
      }
      plate.style.opacity = faceFade >= 0.999 ? '' : String(faceFade)
      if (faceWallsRef.current) for (const wall of faceWallsRef.current.children) (wall as HTMLElement).style.opacity = faceFade >= 0.999 ? '' : String(faceFade)
      if (faceRef.current) {
        const z = LIFT * hov(FACE_TARGET.id) + part(FACE_TARGET.id) + PEEL_LIFT * facePeel
        faceRef.current.style.transform = `translateZ(${z}px) scale(${1 + ZOOM * hov(FACE_TARGET.id)})`
        faceRef.current.style.visibility = faceFade < 0.004 ? 'hidden' : ''
        lastZ.set(FACE_TARGET.id, z)
        restZ.set(FACE_TARGET.id, 0)
      }
      lastCam = cam

      const pc = projCam(cam)
      const targets = targetsAt(zOfLast)
      const live = interaction.get()

      // Dimming: while a layer is hovered or open the stage behind it tints, so the layer separates from the stack. A flat layer above the
      // 3D scene, with the topic cut out. It stays on while the layer is open, and fades out (not cuts) as it closes, still cut around it.
      const dimEl = dimRef.current
      if (dimEl) {
        const dimId = live.focus ?? live.hover ?? lastDimId
        if (dimId) lastDimId = dimId
        if (dimId && dimSp.x > 0.004) {
          const w = frame.clientWidth
          const h = frame.clientHeight
          const grow = 1 + ZOOM * hov(dimId)
          // (a topic's cubes stand above it, so the cut-out takes them in too)
          const sil = hull(
            targets
              .filter((t) => t.topic === dimId)
              .flatMap((t) => [t, ...revealTargets(t, revealRise(dimId, rt(dimId)))])
              .flatMap((t) => corners(pc, { ...t, w: t.w * grow, h: t.h * grow })),
          )
          dimEl.style.visibility = 'visible'
          dimEl.style.clipPath = `path(evenodd, "M0 0H${w}V${h}H0Z${polygon(sil.map(toFrame))}")`
          dimEl.style.backgroundColor = `rgba(214,217,224,${(HOVER_DIM * dimSp.x).toFixed(3)})`
        } else {
          dimEl.style.visibility = 'hidden'
        }
      }

      // Labels: screen-space, constant size. While the pointer is on a layer its label is a white tooltip that trails the cursor and
      // pops in and out (see Pills.tsx); during the wave it is the quiet capsule hung from the layer's north edge, faded per frame.
      for (const { id } of STORIES) {
        const el = pillEls.current.get(id)
        if (!el) continue
        // The tooltip says what a click does, so it goes the moment one happens: nothing is hovered-to-open once a layer is open.
        const hovered = live.ready && !live.focus && live.hover === id
        const waveI = TOPIC_IDS.indexOf(id)
        const waved = (waving[waveI] ?? 0) > 0.05 && !live.hover && !live.focus
        // Nothing is labelled once a layer is open: its title is in the panel, and a label floating over the scene is redundant.
        const follow = hovered && ptr != null
        const show = follow || waved
        el.dataset.on = show ? '1' : '0'
        if (show) {
          // a hidden pill keeps its last mode, so a tooltip fades out looking like a tooltip
          el.dataset.mode = follow ? 'tip' : 'wave'
          if (follow && ptr) {
            // eased toward the cursor, offset down-right of it so it never sits under the pointer
            if (!tip.seen) {
              tip.x = ptr[0]
              tip.y = ptr[1]
              tip.seen = true
            }
            tip.x += (ptr[0] - tip.x) * TIP_EASE
            tip.y += (ptr[1] - tip.y) * TIP_EASE
            el.style.transform = `translate(${Math.round(tip.x + 16)}px, ${Math.round(tip.y + 18)}px)`
          } else {
            const tg = anchorOf(id, targets)
            if (tg) {
              const [px, py] = project(pc, W, tg[0], tg[1], tg[2])
              el.style.transform = `translate(${offX + px * scale}px, ${offY + py * scale}px) translate(-50%, -140%)`
            }
          }
        }
        el.style.opacity = show ? String(waved ? Math.min(1, (waving[waveI] ?? 0) * 1.6) : 1) : '0'
      }
      if (!live.hover) tip.seen = false

      if (readoutRef.current && debug) readoutRef.current.textContent = `f ${f.toFixed(0)} / ${SCENE_END}`
    }

    const tick = (now: number) => {
      raf = 0
      const dtMs = Math.min(64, now - (last || now))
      last = now
      const dt = dtMs / 1000
      let moving = false
      clock = now
      if (frozen != null) {
        goal = shown = frozen
      } else {
        // The scene follows the scroll in scroll space, and a hard flick cannot skip the tilt (see followScroll).
        // An open story pins the scene where it was: the page can still move (the scrollbar, a key, momentum from before the click),
        // and following it back past READY_FRAME would sink every layer and close the story under the reader (ready(false)).
        const goalVh = interaction.get().focus ? heldVh : (heldVh = scrollVh())
        goal = frameAtScroll(goalVh)
        shownVh = followScroll(shownVh, goalVh, dtMs)
        shown = frameAtScroll(shownVh)
        if (Math.abs(goal - shown) < 0.02) {
          shown = goal
          shownVh = goalVh
        }
      }

      // Topics can be used as soon as the build is essentially done (READY_FRAME), not only once the reader has scrolled to the very
      // end: a cue at the end is one most readers never see. Scrolling back past it turns them off again.
      const nowAtEnd = shown >= READY_FRAME && goal >= READY_FRAME - 0.5
      if (nowAtEnd !== atEnd) {
        atEnd = nowAtEnd
        interaction.ready(atEnd)
        // The wave plays once each time the layers become usable, until the reader has opened something.
        if (atEnd && !interaction.get().engaged) {
          waveAt = now
          waveDone = false
          moving = true
        } else if (!atEnd) {
          waveAt = -1
        }
        if (atEnd && autoOpen) {
          interaction.open(autoOpen)
          autoOpen = null
        }
      }

      const live = interaction.get()

      // The wave keeps the loop running until its last pulse is done; it stands down the moment the reader opens something.
      if (waveAt >= 0 && !waveDone) {
        if (live.engaged || now - waveAt > WAVE_GAP * TOPIC_IDS.length + WAVE_LEN) waveDone = true
        else moving = true
      }
      // The tint behind a hovered or open layer.
      if (stepSpring(dimSp, live.focus || live.hover ? 1 : 0, dt, OMEGA_HOVER * omegaK)) moving = true

      // Hover and open lift a topic together (all of its pieces).
      for (const t of TOPIC_IDS) {
        let sp = hoverSp.get(t)
        if (!sp) hoverSp.set(t, (sp = spring(0)))
        const want = live.ready && ((live.hover === t && live.focus == null) || live.focus === t) ? 1 : 0
        if (stepSpring(sp, want, dt, OMEGA_HOVER * omegaK)) moving = true
      }

      // Everything in front of the open topic rises out of its way, top of the stack first; it drops back in the opposite order.
      const above = new Set(live.focus ? aboveOf(live.focus) : [])
      PEELABLE.forEach((id, i) => {
        let st = peelState.get(id)
        if (!st) peelState.set(id, (st = { want: 0, at: 0, eff: 0 }))
        const want = above.has(id) ? 1 : 0
        if (want !== st.want) {
          st.want = want
          st.at = now + (want ? i * PEEL_STAGGER : (PEELABLE.length - 1 - i) * PEEL_STAGGER_CLOSE) * (still ? 0 : 1)
        }
        if (now >= st.at) st.eff = st.want
        else moving = true
        let sp = peelSp.get(id)
        if (!sp) peelSp.set(id, (sp = spring(0)))
        if (stepSpring(sp, st.eff, dt, (st.want ? OMEGA_FOCUS : OMEGA_CLOSE) * omegaK)) moving = true
      })

      // What each opened layer does: its reveal plays forwards from the click, and back (faster) when it closes.
      for (const [topic, frames] of REVEALS) {
        const cur = rt(topic)
        const open = live.focus === topic
        let next: number
        if (open && rtHold != null) next = clamp(rtHold, 0, frames)
        else if (still) next = open ? frames : 0
        else if (open) next = Math.min(frames, cur + dt * FPS)
        else next = Math.max(0, cur - dt * FPS * REVEAL_CLOSE)
        if (next !== cur) {
          revealT.set(topic, next)
          moving = true
        }
      }

      // The camera.
      const goalPose = poseFor(live.focus)
      const camSecs = (live.focus ? CAM_SECONDS : CAM_SECONDS_CLOSE) / omegaK
      let camMoving = false
      for (const k of ['zoom', 'dx', 'dy', 'rot', 'elev'] as const) {
        aim(pose[k], goalPose[k], camSecs)
        if (advance(pose[k], dt, CAM_EASE)) camMoving = moving = true
      }

      if (live.hover && ptr && !live.focus) moving = true
      // After a story closes the camera takes a moment to pull back, and the layers move under a pointer that has not. Read hover
      // from the pointer every frame until the camera settles, so it matches what is drawn once it does, not the pose it left
      // (`rehover` is defined below with the pointer handlers; the tick only runs once the effect has finished setting up).
      if (camMoving && !live.focus && ptrClient) rehover()
      paint(shown)
      if (shown !== goal || moving) raf = requestAnimationFrame(tick)
      else last = 0
    }
    const request = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    if (shadowRef.current) paintShadow(shadowRef.current as unknown as HTMLCanvasElement)
    measure()
    paint(shown)
    request()
    const ro = new ResizeObserver(() => {
      measure()
      poseKey = ''
      request()
    })
    ro.observe(frame)
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    document.fonts?.ready.then(request)

    // ---- pointer: hit-test in screen space against the same camera the paint used ----
    /** Stage px of a pointer event, undoing the stage's centring and scale. */
    const stagePoint = (e: PointerEvent): [number, number] => {
      const r = stage.getBoundingClientRect()
      return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]
    }
    const peelNow = (id: string) => peelSp.get(id)?.x ?? 0
    /** Targets as they are drawn: peeled pieces are out of the way (and out of the pointer's), and nothing dodges its own hover lift. */
    const targets = (): Target[] =>
      targetsAt((id) => zOfRest(id) + PEEL_LIFT * peelNow(id)).filter((t) => peelFade(peelNow(t.id)) > 0.35)
    const inPanel = (e: Event) => (e.target as Element | null)?.closest?.('[data-iso-panel]') != null
    const hit = (e: PointerEvent) => (interaction.get().ready ? pick(projCam(lastCam), targets(), stagePoint(e)) : null)
    /** The pointer's last position in client px, so hover can be re-read when the scene changes under a still pointer. */
    let ptrClient: [number, number] | null = null
    const hitAt = (cx: number, cy: number): string | null => {
      const r = stage.getBoundingClientRect()
      return interaction.get().ready ? pick(projCam(lastCam), targets(), [(cx - r.left) / scale, (cy - r.top) / scale]) : null
    }
    /**
     * Closing a story moves the layers under a pointer that has not moved, and no pointermove follows, so hover has to be read again
     * from where the pointer is. Without it, closing from the keyboard left no hover at all, and closing with the pointer on a layer
     * left the old one.
     */
    const rehover = () => {
      const px = ptrClient
      // a pointer over the panel (the close button, the arrows) is not over the stage, whatever layer is drawn behind the panel
      const overPanel = px != null && document.elementsFromPoint(px[0], px[1]).some((el) => el.closest('[data-iso-panel]'))
      const id = px && !overPanel && !interaction.get().focus ? hitAt(px[0], px[1]) : null
      if (id !== interaction.get().hover) {
        interaction.hover(id)
        frame.style.cursor = id ? 'pointer' : ''
      }
    }
    let wasOpen = false
    const offRehover = interaction.subscribe(() => {
      const open = interaction.get().focus != null
      if (wasOpen && !open) rehover()
      wasOpen = open
    })
    const onMove = (e: PointerEvent) => {
      const fr = frame.getBoundingClientRect()
      ptr = [e.clientX - fr.left, e.clientY - fr.top]
      ptrClient = [e.clientX, e.clientY]
      const id = inPanel(e) ? null : hit(e)
      if (id !== interaction.get().hover) {
        interaction.hover(id)
        frame.style.cursor = id ? 'pointer' : ''
      }
      // the tooltip trails the cursor, so every move repaints (the loop then keeps itself going while it eases)
      if (id) request()
    }
    const onLeave = () => {
      ptr = null
      ptrClient = null
      if (interaction.get().hover) {
        interaction.hover(null)
        frame.style.cursor = ''
        request()
      }
    }
    const onClick = (e: PointerEvent) => {
      if (inPanel(e)) return
      const live = interaction.get()
      if (!live.ready) return
      const id = hit(e)
      if (id) {
        if (id !== live.focus) interaction.open(id)
      } else if (live.focus) interaction.close()
      request()
    }
    /**
     * While a story is open the page stays where it is. The scene is scrubbed by scroll, so a scroll back past READY_FRAME rewinds
     * the build (every layer sinks away) and `interaction.ready(false)` then closes the story under the reader. Wheel and touch over
     * the stage are swallowed; the panel's own scroller is left alone (its `overscroll-contain` keeps it from chaining to the page).
     * Pinch and ctrl+wheel are zooms, not scrolls, so they pass.
     */
    const holdPage = (e: Event) => {
      if (!interaction.get().focus || inPanel(e)) return
      if ((e as WheelEvent).ctrlKey || ((e as TouchEvent).touches?.length ?? 0) > 1) return
      e.preventDefault()
    }
    frame.addEventListener('pointermove', onMove)
    frame.addEventListener('pointerleave', onLeave)
    frame.addEventListener('click', onClick as unknown as EventListener)
    frame.addEventListener('wheel', holdPage, { passive: false })
    frame.addEventListener('touchmove', holdPage, { passive: false })
    // any change to the interaction state (a click, Esc, or a keyboard open) repaints
    const offStore = interaction.subscribe(request)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      frame.removeEventListener('pointermove', onMove)
      frame.removeEventListener('pointerleave', onLeave)
      frame.removeEventListener('click', onClick as unknown as EventListener)
      frame.removeEventListener('wheel', holdPage)
      frame.removeEventListener('touchmove', holdPage)
      offStore()
      offRehover()
      interaction.ready(false)
    }
  }, [still])

  return (
    <section id="system" aria-label="The system" className="bg-[#e4e5e8]">
      {still && <StatementBlock />}
      <div ref={trackRef} style={{ height: still ? '100vh' : `${(TRACK_VH + HOLD_VH + 1) * 100}vh` }}>
        <div ref={frameRef} className="sticky top-0 h-screen w-full overflow-hidden">
          <div ref={stageRef} className="absolute" style={{ width: STAGE_W, height: STAGE_H, transformOrigin: '0 0' }}>
            {/* Flat beat: blueprint grid (26.35 px minor pitch, '+' marks every 8th line), as in the clip. */}
            <div ref={gridRef} className="absolute inset-0" style={{ opacity: 0, backgroundImage: GRID, backgroundSize: GRID_SIZE, backgroundPosition: '12.2px 12.5px' }} />
            {/* The floor is a plane, so an orthographic camera shows it as a plain 2D affine map of its pattern. Drawing it as a
                flat layer with one matrix per frame costs almost nothing; as a plane inside the 3D world it was re-rasterised at
                every angle and was about 85 % of the scrub's raster time. */}
            <div
              ref={floorRef}
              className="absolute"
              style={{ opacity: 0, left: 0, top: 0, width: FLOOR_SIZE, height: FLOOR_SIZE, backgroundImage: FLOOR, backgroundSize: `${FLOOR_PITCH}px ${FLOOR_PITCH}px`, transformOrigin: '0 0' }}
            />
            {/* The cast shadow lies on the floor plane, so like the floor it is drawn flat and placed with one matrix per frame.
                It is painted once to a canvas: a blur filter on an SVG inside the 3D world was re-rasterised as the camera moved
                and was the whole of the scrub's remaining frame cost. */}
            <canvas
              ref={shadowRef as unknown as React.Ref<HTMLCanvasElement>}
              width={SHADOW_PX}
              height={SHADOW_PX}
              aria-hidden
              className="absolute"
              style={{ opacity: 0, left: 0, top: 0, width: SHADOW_PX, height: SHADOW_PX, transformOrigin: '0 0' }}
            />
            {/* The 3D world. Its origin is the face's centre; x east, y south, z up. */}
            <div ref={worldRef} data-iso="world" className="absolute" style={{ left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d' }}>
              {/* A contact shadow under each module, growing with it. It sits on the floor, offset along the light. */}
              {MODULES.map((m) => (
                <div
                  key={m.id}
                  ref={(el) => {
                    if (el) modShadows.current.set(m.id, el)
                    else modShadows.current.delete(m.id)
                  }}
                  className="absolute"
                  style={{
                    opacity: 0,
                    left: m.x - m.w / 2 + LIGHT[0] * MODULE_SHADOW_REACH,
                    top: m.y - m.h / 2 + LIGHT[1] * MODULE_SHADOW_REACH,
                    width: m.w,
                    height: m.h,
                    background: 'rgba(59,61,68,.05)',
                    borderRadius: MODULE_RADIUS,
                    boxShadow: '0 0 40px 14px rgba(59,61,68,.03)',
                    transform: `translateZ(${-FLOOR_DEPTH * W + 2}px)`,
                  }}
                />
              ))}
              <div
                ref={faceRef}
                className="absolute"
                style={{ left: -FACE_W / 2, top: -FACE_H / 2, width: FACE_W, height: FACE_H, transformStyle: 'preserve-3d' }}
              >
                {/* The face's base plate: materialises by colour and shadow growth, never by scale or move. */}
                <div ref={plateRef} className="absolute inset-0" style={{ background: '#d6d7db' }} />
                {/* Its slab: the same thickness as the two modules'. South wall hangs from the bottom edge, east from the right. */}
                <div
                  ref={faceWallsRef}
                  data-face-walls
                  className="absolute"
                  style={{ left: 0, top: 0, width: FACE_W, height: FACE_H, transformStyle: 'preserve-3d', pointerEvents: 'none' }}
                >
                  <div data-face="south" className="absolute" style={{ left: 0, top: FACE_H, width: FACE_W, height: SLAB_THICK * W, transformOrigin: '0 0', transform: 'rotateX(-90deg)', background: '#cfd2d8' }} />
                  <div data-face="east" className="absolute" style={{ left: FACE_W, top: 0, width: SLAB_THICK * W, height: FACE_H, transformOrigin: '0 0', transform: 'rotateY(90deg)', background: '#9ea2ab' }} />
                </div>
                <ConfiguratorFace />
              </div>
              {/* The layers share the world's origin (the face's centre), so layers.ts coordinates are centre-based. */}
              <Stack
                onRef={(id, el) => {
                  if (el) boxes.current.set(id, el)
                  else boxes.current.delete(id)
                }}
              />
              <Modules
                onRef={(id, el) => {
                  if (el) mods.current.set(id, el)
                  else mods.current.delete(id)
                }}
                onConnector={(key, el) => {
                  if (el) conns.current.set(key, el)
                  else conns.current.delete(key)
                }}
              />
            </div>
          </div>
          {/* The tint: flat, above the 3D scene, with the hovered or open topic cut out. It never takes the pointer. */}
          <div ref={dimRef} aria-hidden className="pointer-events-none absolute inset-0" style={{ visibility: 'hidden' }} />
          <Pills
            ref={pillsRef}
            onRef={(id, el) => {
              if (el) pillEls.current.set(id, el)
              else pillEls.current.delete(id)
            }}
          />
          {!still && <IntroStatement ref={statementRef} />}
          <IntroCard />
          <Hint />
          <StoryPanel />
          {/* The same topics as buttons, in reading order, for keyboard and screen-reader users. Visually hidden, not removed. */}
          <ul className="sr-only" aria-label="Layers of the system">
            {STORIES.map(({ id, story }) => (
              <li key={id}>
                <button
                  type="button"
                  onFocus={() => interaction.get().ready && interaction.hover(id)}
                  onBlur={() => interaction.hover(null)}
                  onClick={() => interaction.open(id)}
                >
                  {story.title}
                </button>
              </li>
            ))}
          </ul>
          <div ref={readoutRef} className="absolute bottom-4 left-4 font-mono text-xs text-slate-600" />
        </div>
      </div>
    </section>
  )
}
