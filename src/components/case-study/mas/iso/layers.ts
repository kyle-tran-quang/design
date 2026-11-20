/**
 * The layers under the Sales Configurator, and the one table that drives them: geometry and colour for the 3D scene,
 * the build order, and the topics (stories) the reader can open. Copy is drawn from the case study itself.
 *
 * World units are the face's design px (the face is 1200 x 928). x runs east, y south, z up. Heights are the top
 * surface's distance below the face's top, as multiples of W (the face's width), as the skill measured them.
 */
import { FACE_H, FACE_W } from './faces/ConfiguratorFace'
import { CAM_OFFSET } from './scene'

export const W = FACE_W
export const H = FACE_H

/* ------------------------------------------------------------------------------------------------------------------
 * Topics: what the reader can open. A topic is one or more pieces of the scene (a plate, a group of tiles, the face, a
 * floor module) and a story in the side panel. The scene only needs a topic's label; the story's content is a component
 * built from the page's own pieces, in stories.tsx.
 * ---------------------------------------------------------------------------------------------------------------- */

export type Story = {
  /** Short label: the hover tooltip and the panel's title. */
  title: string
  /** The panel is light grey instead of white, for a story whose images are white and would otherwise melt into it. */
  grey?: boolean
}

export type Topic = { id: string; story: Story }

export const TOPICS: readonly Topic[] = [
  { id: 'estimator', story: { title: 'MAS Pricing Estimator' } },
  { id: 'excel', story: { title: 'The Excel engine' } },
  { id: 'rationale', story: { title: 'Design problems and rationales' } },
  { id: 'lessons', story: { title: 'Feedback and lessons learned' } },
  { id: 'ai-chat', story: { title: 'AI chat assistant' } },
  { id: 'web-estimator', story: { title: 'Maximo Pricing Estimator on ibm.com', grey: true } },
]

export const topicById = (id: string) => TOPICS.find((t) => t.id === id)

/* ------------------------------------------------------------------------------------------------------------------
 * Scene geometry
 * ---------------------------------------------------------------------------------------------------------------- */

type Face = {
  /** Top-face fill: any CSS background. */
  top: string
  /** The two visible side walls, bottom-left and bottom-right in the dimetric view. */
  south: string
  east: string
}

export type Layer = Face & {
  id: string
  /** The topic this plate belongs to. Plates that share a topic hover, open and peel together. */
  topic: string
  /** Footprint: centre x/y and size, in world px. Tiles in a tier share a plane and sit side by side. */
  x: number
  y: number
  w: number
  h: number
  /** Top-surface depth below the face's top, in W units, and the plate's thickness in W units. */
  depth: number
  thick: number
  /** Frame the plate starts to fall into place (the clip's frame plus CAM_OFFSET), and its settle time constant. */
  enter: number
  tau: number
  /** Translucent plates need back-to-front DOM order. */
  glass?: boolean
  /** A tile that turns into a wireframe spreadsheet when its topic is opened (see Sheet.tsx). */
  sheet?: 'pricing' | 'costing' | 'provisioning'
  /** The 2 x 2 platform whose quadrants lift out as glass cubes when its topic is opened (see PlateCubes.tsx). */
  platform?: boolean
  /** The surface a book rises out of when its topic is opened (see PlateBook.tsx). */
  book?: boolean
}

/** How far the cubes that come out of the rationale plate rise above it, in world px. */
export const PLATE_RISE = 240

/**
 * Tier 2: three tiles on the face's own 400 / 712 / 200 column grid. They are the work the estimator does under the
 * screen: pricing the AppPoints, costing them, and configuring what gets provisioned. Together they are the Excel engine.
 */
const COL = [400, 600, 200] as const
const X0 = -W / 2
const tierX = (i: number) => X0 + COL.slice(0, i).reduce((a, b) => a + b, 0) + COL[i] / 2

/** Thickness of a screen's slab, in W units: the Configurator face and both modules share it. */
export const SLAB_THICK = 0.05

/**
 * The stack has four levels (the Configurator face, the Excel tier, the blue plate, the lowest plate), and they are evenly spaced: the
 * clear gap from one level's underside to the top of the next is the same at every level. It used to be 60 and 66 px under the
 * Configurator and the first tier and 168 to 192 px below them, so the upper layers were slivers that a pointer could hardly find (the
 * Excel tier was a 29 px strip). The lowest plate keeps its height, since the modules, the connectors and the floor are placed from it,
 * so the gap is what is left of that height after the three slabs above it, shared three ways (about 178 px).
 */
const EXCEL_THICK = 0.045
const BLUE_THICK = 0.06
const BOTTOM_DEPTH = 0.6
const STACK_GAP = (BOTTOM_DEPTH - SLAB_THICK - EXCEL_THICK - BLUE_THICK) / 3
const EXCEL_DEPTH = SLAB_THICK + STACK_GAP
const BLUE_DEPTH = EXCEL_DEPTH + EXCEL_THICK + STACK_GAP

export const LAYERS: Layer[] = [
  {
    id: 'pricing',
    topic: 'excel',
    x: tierX(0), y: 0, w: COL[0] - 8, h: H - 8,
    depth: EXCEL_DEPTH, thick: EXCEL_THICK, enter: CAM_OFFSET + 40, tau: 14, sheet: 'pricing',
    top: '#8e8e8e', south: '#f2f2f2', east: '#bdbdbd',
  },
  {
    id: 'costing',
    topic: 'excel',
    x: tierX(1), y: 0, w: COL[1] - 8, h: H - 8,
    depth: EXCEL_DEPTH, thick: EXCEL_THICK, enter: CAM_OFFSET + 44, tau: 14, sheet: 'costing',
    top: '#262626', south: '#585a5e', east: '#0b0b0d',
  },
  {
    id: 'provisioning',
    topic: 'excel',
    x: tierX(2), y: 0, w: COL[2] - 8, h: H - 8,
    depth: EXCEL_DEPTH, thick: EXCEL_THICK, enter: CAM_OFFSET + 50, tau: 14, sheet: 'provisioning',
    top: '#424242', south: '#6a6c71', east: '#0b0b0d',
  },
  {
    id: 'approval',
    topic: 'rationale',
    x: 0, y: 0, w: W, h: H,
    depth: BLUE_DEPTH, thick: BLUE_THICK, enter: CAM_OFFSET + 84, tau: 30, glass: true, platform: true,
    // the quadrants are drawn by PlateTop; this is only what shows if they have not mounted
    top: '#9db8f5',
    south: 'linear-gradient(#2c6af0, #0d2453)', east: 'linear-gradient(#2a5fc8, #0d2453)',
  },
  {
    id: 'foundation',
    topic: 'lessons',
    x: 0, y: 0, w: W, h: H,
    depth: BOTTOM_DEPTH, thick: 0.03, enter: CAM_OFFSET + 126, tau: 16, book: true,
    top: 'linear-gradient(135deg, #e6e5eb, #ccc4cc)',
    south: 'linear-gradient(#aa4a60, #40151c)', east: 'linear-gradient(#8a3548, #2a0d13)',
  },
]

/** The floor sits this far below the face's top, in W units. */
export const FLOOR_DEPTH = 0.86

/**
 * The two modules sit at the height of the lowest layer of the stack (the foundation), not on the floor: their top faces are in
 * the plane of the foundation's top. Both connector lines then run flat from the foundation's side wall to the module, in
 * one plane, and read as one continuous line.
 */
export const MODULE_DEPTH = BOTTOM_DEPTH
/**
 * The two modules that sit beside the stack on the floor, as in the clip: Phase 1's AI chat (lower left) and Phase 3's
 * public pricing estimator (upper right). Each is a thin slab with a Figma export on its top face. A module's id is its topic.
 * The faces are vector SVG exports of the Figma nodes (Pricing Estimator file: the Chat shell 1003:93443, and the "Concept v1" form
 * 978:74735 beside its price summary 990:81225), text outlined, so they stay sharp at any camera zoom. PNGs went soft: the chat's was
 * 320 px of source on a 440 px slab before the camera zoomed in. The estimator's is a 16:9 crop of the page; its aspect is the slab's.
 */
export type Module = {
  id: string
  image: string
  /** Footprint on the floor: centre and size in world px. */
  x: number
  y: number
  w: number
  h: number
  /** Slab thickness in W units. */
  thick: number
  /** Scene frame the module starts to appear, and the frame its connectors start (the clip's frame plus CAM_OFFSET). */
  enter: number
  connect: number
  /** Which way the connectors run from the stack: +1 toward +y (lower left on screen), -1 toward -y. */
  dir: 1 | -1
}

/** Corner radius of a module's slab, in world px: its top face, and the walls, which curve round the corners with it. */
export const MODULE_RADIUS = 28

export const MODULES: Module[] = [
  { id: 'ai-chat', image: 'module-ai-chat.svg', x: -250, y: 1400, w: 440, h: 1075, thick: SLAB_THICK, enter: CAM_OFFSET + 188, connect: CAM_OFFSET + 204, dir: 1 },
  { id: 'web-estimator', image: 'module-web-estimator.svg', x: 330, y: -1180, w: 960, h: 540, thick: SLAB_THICK, enter: CAM_OFFSET + 212, connect: CAM_OFFSET + 234, dir: -1 },
]

/**
 * The Sales Configurator itself: the top of the stack. It is the HTML face, not a plate, so it is not in LAYERS, but it is
 * a target like the rest. Footprint is the face's, at the face's own height.
 */
export const FACE_TARGET = {
  id: 'estimator',
  x: 0,
  y: 0,
  w: W,
  h: H,
  /** The face is the zero of z. Its slab is as thick as the two modules' (0.05 W), so the three screens read as the same kind of object. */
  thick: SLAB_THICK,
} as const

/** Which topic a piece of the scene belongs to. */
export function topicOf(memberId: string): string {
  if (memberId === FACE_TARGET.id) return FACE_TARGET.id
  const layer = LAYERS.find((l) => l.id === memberId)
  if (layer) return layer.topic
  return memberId
}

/** Every topic id, in reading order. */
export const TOPIC_IDS = TOPICS.map((t) => t.id)

/** The same list under the name the pills and the keyboard list use. */
export const STORIES: ReadonlyArray<{ id: string; story: Story }> = TOPICS.map((t) => ({ id: t.id, story: t.story }))
